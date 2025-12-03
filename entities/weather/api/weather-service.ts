import axios from 'axios';
import { citySchema, coordinateSchema, type SearchMode } from '@/shared/lib/schemas';
import { findCountryCode } from '@/shared/config/locations';

export type WeatherSearch =
  | ({ mode: 'coordinates' } & CoordinateSearch)
  | ({ mode: 'city' } & CitySearch);

type CoordinateSearch = {
  latitude: number;
  longitude: number;
};

type CitySearch = {
  country: string;
  city: string;
};

export type WeatherResult = {
  resolvedName: string;
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  time: string;
  latitude: number;
  longitude: number;
  mode: SearchMode;
};

const WEATHER_ENDPOINT =
  process.env.NEXT_PUBLIC_WEATHER_ENDPOINT ?? 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_ENDPOINT =
  process.env.NEXT_PUBLIC_GEOCODING_ENDPOINT ?? 'https://geocoding-api.open-meteo.com/v1/search';

async function geocodeCity(payload: CitySearch) {
  const parsed = citySchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Данные города заполнены некорректно');
  }

  const countryCode = findCountryCode(parsed.data.country);
  const params = new URLSearchParams({
    name: parsed.data.city,
    count: '1',
    language: 'en',
    format: 'json',
  });

  if (countryCode) {
    params.append('country', countryCode);
  }

  const { data } = await axios.get(GEOCODING_ENDPOINT, { params });

  if (!data?.results?.length) {
    throw new Error('Город не найден в источнике Open-Meteo');
  }

  const city = data.results[0];
  return {
    name: `${city.name}${city.country ? `, ${city.country}` : ''}`,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  generationtime_ms: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
  };
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    apparent_temperature: string;
    wind_speed_10m: string;
  };
}

async function fetchWeatherByCoords(payload: CoordinateSearch, mode: SearchMode) {
  const parsed = coordinateSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Координаты заполнены некорректно');
  }

  const params = {
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    current: 'temperature_2m,apparent_temperature,wind_speed_10m',
    timezone: 'auto',
  };

  const { data } = await axios.get<OpenMeteoResponse>(WEATHER_ENDPOINT, {
    params,
  });

  if (!data?.current) {
    throw new Error('Данные о погоде недоступны для этой точки');
  }

  return normalizeWeatherResult(data, mode);
}

function normalizeWeatherResult(apiData: OpenMeteoResponse, mode: SearchMode): WeatherResult {
  const temperature = Number(apiData.current?.temperature_2m);
  const apparentTemperature = Number(apiData.current?.apparent_temperature);
  const windSpeed = Number(apiData.current?.wind_speed_10m);

  if (Number.isNaN(temperature) || Number.isNaN(apparentTemperature) || Number.isNaN(windSpeed)) {
    throw new Error('Источник вернул неполные данные');
  }

  return {
    resolvedName: apiData?.timezone ?? 'Указанные координаты',
    temperature,
    apparentTemperature,
    windSpeed,
    time: apiData.current?.time ?? '',
    latitude: Number(apiData.latitude),
    longitude: Number(apiData.longitude),
    mode,
  };
}

export async function fetchWeather(search: WeatherSearch): Promise<WeatherResult> {
  if (search.mode === 'city') {
    const parsedCity = citySchema.parse({
      country: search.country,
      city: search.city,
    });
    const geocoded = await geocodeCity(parsedCity);
    const weather = await fetchWeatherByCoords(
      { latitude: geocoded.latitude, longitude: geocoded.longitude },
      'city',
    );

    return {
      ...weather,
      resolvedName: geocoded.name,
    };
  }

  const parsedCoords = coordinateSchema.safeParse({
    latitude: search.latitude,
    longitude: search.longitude,
  });

  if (!parsedCoords.success) {
    throw new Error('Координаты заполнены некорректно');
  }

  return fetchWeatherByCoords(parsedCoords.data, 'coordinates');
}

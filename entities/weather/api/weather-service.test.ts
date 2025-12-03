import axios from 'axios';
import { fetchWeather, type WeatherResult } from './weather-service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const baseWeatherResponse = {
  latitude: 51.1694,
  longitude: 71.4491,
  elevation: 0,
  generationtime_ms: 0.2,
  timezone: 'Asia/Almaty',
  timezone_abbreviation: 'ALMT',
  utc_offset_seconds: 21600,
  current: {
    time: '2024-01-01T10:00',
    interval: 60,
    temperature_2m: 12.3,
    apparent_temperature: 10.1,
    wind_speed_10m: 3.5,
  },
  current_units: {
    time: 'iso8601',
    interval: 'minutes',
    temperature_2m: '°C',
    apparent_temperature: '°C',
    wind_speed_10m: 'm/s',
  },
};

describe('fetchWeather', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it('returns normalized weather for coordinates search', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: baseWeatherResponse });

    const result = await fetchWeather({
      mode: 'coordinates',
      latitude: 51.1694,
      longitude: 71.4491,
    });

    expect(result).toEqual<WeatherResult>(
      expect.objectContaining({
        resolvedName: baseWeatherResponse.timezone,
        temperature: baseWeatherResponse.current.temperature_2m,
        apparentTemperature: baseWeatherResponse.current.apparent_temperature,
        windSpeed: baseWeatherResponse.current.wind_speed_10m,
        latitude: baseWeatherResponse.latitude,
        longitude: baseWeatherResponse.longitude,
        mode: 'coordinates',
      }),
    );

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          latitude: 51.1694,
          longitude: 71.4491,
        }),
      }),
    );
  });

  it('resolves city search with geocoding then weather', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              name: 'Astana',
              country: 'KZ',
              latitude: 51.1694,
              longitude: 71.4491,
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: baseWeatherResponse });

    const result = await fetchWeather({
      mode: 'city',
      country: 'Kazakhstan',
      city: 'Astana',
    });

    expect(result.resolvedName).toBe('Astana, KZ');
    expect(result.mode).toBe('city');
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it('throws when coordinates are outside allowed range', async () => {
    await expect(
      fetchWeather({
        mode: 'coordinates',
        latitude: -200,
        longitude: 0,
      }),
    ).rejects.toThrow('Координаты заполнены некорректно');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});

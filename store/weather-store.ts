import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type WeatherResult, type WeatherSearch } from '@/entities/weather/api/weather-service';

type WeatherState = {
  search?: WeatherSearch;
  weather?: WeatherResult;
  setSearch: (search: WeatherSearch) => void;
  setWeather: (weather: WeatherResult) => void;
  reset: () => void;
};

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      search: undefined,
      weather: undefined,
      setSearch: (search) => set({ search }),
      setWeather: (weather) => set({ weather }),
      reset: () => set({ search: undefined, weather: undefined }),
    }),
    {
      name: 'weather-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

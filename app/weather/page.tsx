'use client';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { formatTemperature, temperatureGradient } from '@/shared/lib/utils';
import { fetchWeather } from '@/entities/weather/api/weather-service';
import { useNotificationStore } from '@/store/notification-store';
import { useWeatherStore } from '@/store/weather-store';

export default function WeatherPage() {
  const { weather, search, setWeather } = useWeatherStore();
  const { push } = useNotificationStore();

  const { data, isFetching, error } = useQuery({
    queryKey: ['weather', search],
    queryFn: () => fetchWeather(search!),
    enabled: Boolean(search) && !weather,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    console.log('weather: ', weather);
  }, [weather]);

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить данные';
      push({ type: 'error', title: 'Ошибка загрузки', message });
    }
  }, [error, push]);

  useEffect(() => {
    if (data) {
      setWeather(data);
    }
  }, [data, setWeather]);

  const currentWeather = useMemo(() => weather ?? data, [weather, data]);

  if (!currentWeather) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-8 md:px-10">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center shadow-2xl shadow-emerald-500/10 backdrop-blur sm:p-9 md:p-10">
          <p className="text-lg font-semibold text-white sm:text-xl">Нет активного запроса</p>
          <p className="mt-2 text-sm text-white/70 sm:text-base">
            Перейдите на главный экран, заполните форму и мы покажем температуру вместе с динамичным
            фоном.
          </p>
          <Button className="mt-6 w-full sm:w-auto">
            <Link href="/">Вернуться к форме</Link>
          </Button>
        </div>
      </div>
    );
  }

  const gradient = temperatureGradient(currentWeather.temperature);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 text-white sm:px-6 sm:py-12 md:px-8 lg:px-12 lg:py-16 xl:px-16">
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.12),transparent_20%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.14),transparent_22%)]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 sm:gap-10 lg:max-w-6xl lg:gap-12 xl:max-w-7xl">
        <header className="flex flex-col justify-between gap-5 sm:gap-6 md:flex-row md:items-center">
          <div className="space-y-2 text-center md:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase sm:text-sm">
              {currentWeather.mode === 'coordinates' ? 'Поиск по координатам' : 'Поиск по городу'}
            </p>
            <h1 className="mt-3 text-3xl leading-tight font-bold sm:text-4xl md:text-5xl lg:text-6xl">
              {currentWeather.resolvedName}
            </h1>
            <p className="text-sm text-white/80 sm:text-base">
              {new Date(currentWeather.time).toLocaleString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'long',
              })}
            </p>
          </div>
          <Button variant="secondary" className="w-full md:w-auto">
            <Link href="/">Новый запрос</Link>
          </Button>
        </header>

        <section className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-lg sm:p-7 md:p-8 lg:p-10">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-[1.2fr_1fr] md:items-center lg:gap-10">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs font-semibold tracking-wide text-white/80 uppercase sm:text-sm">
                Температура сейчас
              </p>
              <p className="text-5xl font-black sm:text-6xl md:text-7xl lg:text-8xl">
                {formatTemperature(currentWeather.temperature)}
              </p>
              <p className="text-sm text-white/80 sm:text-base">
                Ощущается как{' '}
                <span className="font-semibold">
                  {formatTemperature(currentWeather.apparentTemperature)}
                </span>{' '}
                · Ветер {currentWeather.windSpeed.toFixed(1)} м/с
              </p>
              <p className="text-[11px] tracking-wide text-white/70 uppercase sm:text-xs">
                Источник: Open-Meteo
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80 shadow-inner shadow-white/10 sm:gap-4 sm:p-5 sm:text-base lg:p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Широта</span>
                <span>{currentWeather.latitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Долгота</span>
                <span>{currentWeather.longitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Метод</span>
                <span>
                  {currentWeather.mode === 'coordinates' ? 'Введены координаты' : 'Выбран город'}
                </span>
              </div>
              {isFetching ? (
                <div className="mt-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white sm:text-sm">
                  Обновляем данные...
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/10 p-6 shadow-xl shadow-black/30 backdrop-blur sm:p-7 md:p-8 lg:p-10">
          <p className="text-sm font-semibold tracking-wide text-white/80 uppercase sm:text-base">
            Что дальше
          </p>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            Цветовая гамма экрана меняется в зависимости от температуры: теплые оттенки для жары,
            глубокие синие для холода. Возвращайтесь на главный экран, чтобы попробовать другой
            город или точку.
          </p>
        </section>
      </div>
    </div>
  );
}

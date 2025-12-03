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
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center shadow-2xl shadow-emerald-500/10 backdrop-blur">
          <p className="text-lg font-semibold text-white">Нет активного запроса</p>
          <p className="mt-2 text-sm text-white/70">
            Перейдите на главный экран, заполните форму и мы покажем температуру вместе с динамичным
            фоном.
          </p>
          <Button className="mt-6">
            <Link href="/">Вернуться к форме</Link>
          </Button>
        </div>
      </div>
    );
  }

  const gradient = temperatureGradient(currentWeather.temperature);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 text-white md:px-8">
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.12),transparent_20%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.14),transparent_22%)]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
              {currentWeather.mode === 'coordinates' ? 'Поиск по координатам' : 'Поиск по городу'}
            </p>
            <h1 className="mt-3 text-4xl leading-tight font-bold md:text-5xl">
              {currentWeather.resolvedName}
            </h1>
            <p className="text-sm text-white/80">
              {new Date(currentWeather.time).toLocaleString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'long',
              })}
            </p>
          </div>
          <Button variant="secondary">
            <Link href="/">Новый запрос</Link>
          </Button>
        </header>

        <section className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-lg md:p-8">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-wide text-white/80 uppercase">
                Температура сейчас
              </p>
              <p className="text-6xl font-black md:text-7xl">
                {formatTemperature(currentWeather.temperature)}
              </p>
              <p className="text-white/80">
                Ощущается как{' '}
                <span className="font-semibold">
                  {formatTemperature(currentWeather.apparentTemperature)}
                </span>{' '}
                · Ветер {currentWeather.windSpeed.toFixed(1)} м/с
              </p>
              <p className="text-xs tracking-wide text-white/70 uppercase">Источник: Open-Meteo</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80 shadow-inner shadow-white/10">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Широта</span>
                <span>{currentWeather.latitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Долгота</span>
                <span>{currentWeather.longitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Метод</span>
                <span>
                  {currentWeather.mode === 'coordinates' ? 'Введены координаты' : 'Выбран город'}
                </span>
              </div>
              {isFetching ? (
                <div className="mt-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white">
                  Обновляем данные...
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/10 p-6 shadow-xl shadow-black/30 backdrop-blur">
          <p className="text-sm font-semibold tracking-wide text-white/80 uppercase">Что дальше</p>
          <p className="mt-2 text-sm text-white/80">
            Цветовая гамма экрана меняется в зависимости от температуры: теплые оттенки для жары,
            глубокие синие для холода. Возвращайтесь на главный экран, чтобы попробовать другой
            город или точку.
          </p>
        </section>
      </div>
    </div>
  );
}

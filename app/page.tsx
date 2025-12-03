'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { supportedLocations } from '@/shared/config/locations';
import {
  citySchema,
  coordinateSchema,
  type CityForm,
  type CoordinateForm,
  type SearchMode,
} from '@/shared/lib/schemas';
import { fetchWeather, type WeatherSearch } from '@/entities/weather/api/weather-service';
import { useNotificationStore } from '@/store/notification-store';
import { useWeatherStore } from '@/store/weather-store';

export default function Home() {
  const router = useRouter();
  const { push } = useNotificationStore();
  const { setWeather, setSearch } = useWeatherStore();
  const [mode, setMode] = useState<SearchMode>('coordinates');

  const coordinateForm = useForm<CoordinateForm>({
    resolver: zodResolver(coordinateSchema),
    defaultValues: { latitude: 51.1694, longitude: 71.4491 },
  });

  const cityForm = useForm<CityForm>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      country: supportedLocations[0]?.country ?? '',
      city: supportedLocations[0]?.cities[0] ?? '',
    },
  });

  const selectedCountry =
    useWatch({ control: cityForm.control, name: 'country' }) ??
    supportedLocations[0]?.country ??
    '';
  const selectedCity =
    useWatch({ control: cityForm.control, name: 'city' }) ?? supportedLocations[0]?.cities[0] ?? '';

  const availableCities = useMemo(() => {
    const match = supportedLocations.find((loc) => loc.country === selectedCountry);
    return match?.cities ?? [];
  }, [selectedCountry]);

  useEffect(() => {
    if (!availableCities.length) return;
    if (!selectedCity || !availableCities.includes(selectedCity)) {
      cityForm.setValue('city', availableCities[0]);
    }
  }, [availableCities, selectedCity, cityForm]);

  const mutation = useMutation({
    mutationFn: (payload: WeatherSearch) => fetchWeather(payload),
    onSuccess: (data, variables) => {
      setSearch(variables);
      setWeather(data);
      push({
        type: 'success',
        title: 'Погода найдена',
        message: `${data.resolvedName}: ${data.temperature.toFixed(1)}°C`,
      });
      router.push('/weather');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Попробуйте позже';
      push({
        type: 'error',
        title: 'Не удалось получить погоду',
        message,
      });
    },
  });

  const submitCoordinates = (values: CoordinateForm) => {
    const payload: WeatherSearch = { mode: 'coordinates', ...values };
    mutation.mutate(payload);
  };

  const submitCity = (values: CityForm) => {
    const payload: WeatherSearch = { mode: 'city', ...values };
    mutation.mutate(payload);
  };

  const handleSubmit =
    mode === 'coordinates'
      ? coordinateForm.handleSubmit(submitCoordinates)
      : cityForm.handleSubmit(submitCity);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.45),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.35),transparent_28%),radial-gradient(circle_at_40%_80%,rgba(14,165,233,0.35),transparent_30%)]" />
        <div className="absolute inset-0 bg-linear-to-br from-slate-950/70 via-slate-950/40 to-slate-900/70 backdrop-blur-[2px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/80 uppercase shadow-md shadow-sky-500/10 backdrop-blur">
            Weather Scout · Next.js · Zustand · React Query
          </p>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-2">
              <h1 className="text-3xl leading-tight font-black sm:text-4xl lg:text-5xl">
                Получите актуальную погоду
              </h1>
              <p className="text-base text-white/85 sm:text-lg">
                Введите координаты или выберите страну и город. Данные валидируются, хранятся в
                Zustand и отправляются на экран результатов.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/85 shadow-xl shadow-emerald-500/10 backdrop-blur">
              Данные приходят из <span className="font-semibold text-cyan-200">Open-Meteo</span>{' '}
              через Axios. Все запросы управляет React Query.
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-900/70 via-slate-900/40 to-slate-800/40 p-6 shadow-2xl shadow-sky-500/15 backdrop-blur-2xl sm:p-8">
            <div className="mb-6 space-y-3">
              <p className="text-xs font-semibold tracking-[0.22em] text-white/60 uppercase">
                СПОСОБ ВВОДА
              </p>
              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as SearchMode)}
                items={[
                  {
                    value: 'coordinates',
                    label: 'Координаты',
                    description: 'Для точек вне списка городов',
                  },
                  {
                    value: 'city',
                    label: 'Страна и город',
                    description: 'Быстрый поиск по каталогам',
                  },
                ]}
              />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {mode === 'coordinates' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Широта (от -90 до 90)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.0001"
                      placeholder="51.1694"
                      inputMode="decimal"
                      className={`rounded-2xl border-white/15 bg-white/10 text-base shadow-inner shadow-white/10 focus-visible:border-sky-300 focus-visible:ring-sky-200/60 ${coordinateForm.formState.errors.latitude ? 'border-rose-400 focus-visible:border-rose-300' : ''}`}
                      {...coordinateForm.register('latitude', { valueAsNumber: true })}
                    />
                    {coordinateForm.formState.errors.latitude?.message ? (
                      <p className="text-xs text-rose-300">
                        {coordinateForm.formState.errors.latitude?.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Долгота (от -180 до 180)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0001"
                      placeholder="71.4491"
                      inputMode="decimal"
                      className={`rounded-2xl border-white/15 bg-white/10 text-base shadow-inner shadow-white/10 focus-visible:border-sky-300 focus-visible:ring-sky-200/60 ${coordinateForm.formState.errors.longitude ? 'border-rose-400 focus-visible:border-rose-300' : ''}`}
                      {...coordinateForm.register('longitude', { valueAsNumber: true })}
                    />
                    {coordinateForm.formState.errors.longitude?.message ? (
                      <p className="text-xs text-rose-300">
                        {coordinateForm.formState.errors.longitude?.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Страна</Label>
                    <Select
                      id="country"
                      className="rounded-2xl border-white/15 bg-white/10 text-base shadow-inner shadow-white/10 focus:border-sky-300 focus-visible:ring-sky-200/60"
                      {...cityForm.register('country')}
                    >
                      {supportedLocations.map((location) => (
                        <option key={location.country} value={location.country}>
                          {location.country}
                        </option>
                      ))}
                    </Select>
                    {cityForm.formState.errors.country?.message ? (
                      <p className="text-xs text-rose-300">
                        {cityForm.formState.errors.country?.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Город</Label>
                    <Select
                      id="city"
                      className="rounded-2xl border-white/15 bg-white/10 text-base shadow-inner shadow-white/10 focus:border-sky-300 focus-visible:ring-sky-200/60"
                      {...cityForm.register('city')}
                    >
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </Select>
                    {cityForm.formState.errors.city?.message ? (
                      <p className="text-xs text-rose-300">
                        {cityForm.formState.errors.city?.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/85 shadow-inner shadow-white/10 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-white">Как это работает</p>
                  <p className="text-white/70">
                    Zod проверяет валидность ввода, данные уходят в Zustand и React Query, после
                    успешного ответа вы перейдете на экран результата.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full rounded-2xl bg-linear-to-r from-sky-400 via-cyan-400 to-emerald-400 text-slate-900 shadow-lg shadow-cyan-500/25 hover:brightness-110 sm:w-auto"
                >
                  {mutation.isPending ? 'Запрашиваем...' : 'Получить погоду'}
                </Button>
              </div>
            </form>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-emerald-500/10 backdrop-blur lg:p-7">
              <p className="text-xs font-semibold tracking-[0.22em] text-white/60 uppercase">
                ГАРАНТИИ КОРРЕКТНОСТИ
              </p>
              <ul className="mt-4 space-y-4 text-sm text-white/90">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-300" />
                  <div className="space-y-1">
                    <p className="font-semibold">Двойная валидация</p>
                    <p className="text-white/70">
                      Zod проверяет формат, а Open-Meteo подтверждает существование города и
                      координат.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-300" />
                  <div className="space-y-1">
                    <p className="font-semibold">Состояние в Ordnung</p>
                    <p className="text-white/70">
                      Zustand хранит ввод и результат, чтобы экран погоды открывал готовые данные
                      без повторного запроса.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-300" />
                  <div className="space-y-1">
                    <p className="font-semibold">Уведомления</p>
                    <p className="text-white/70">
                      При успехе или ошибке появится ненавязчивый toast на клиенте.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-900/60 via-slate-900/30 to-slate-800/40 p-6 shadow-xl shadow-sky-500/10 backdrop-blur lg:p-7">
              <p className="text-xs font-semibold tracking-[0.22em] text-white/60 uppercase">
                ПРИМЕР ЗАПРОСА
              </p>
              <pre className="mt-4 overflow-auto rounded-2xl bg-black/50 p-4 text-xs text-cyan-100 shadow-inner shadow-black/30">
                {`GET https://api.open-meteo.com/v1/forecast
?latitude=51.1694
&longitude=71.4491
&current=temperature_2m,apparent_temperature,wind_speed_10m`}
              </pre>
              <p className="mt-3 text-sm text-white/70">
                Температура перекрашивает экран результата в теплые или холодные оттенки.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function temperatureGradient(tempCelsius: number) {
  if (tempCelsius <= -10) {
    return 'from-slate-900 via-sky-900 to-cyan-800';
  }
  if (tempCelsius <= 0) {
    return 'from-sky-900 via-cyan-800 to-cyan-600';
  }
  if (tempCelsius <= 10) {
    return 'from-cyan-700 via-blue-600 to-indigo-600';
  }
  if (tempCelsius <= 20) {
    return 'from-indigo-600 via-emerald-600 to-lime-500';
  }
  if (tempCelsius <= 28) {
    return 'from-amber-400 via-orange-500 to-rose-500';
  }
  return 'from-red-500 via-orange-500 to-amber-400';
}

export function formatTemperature(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(1)}°C`;
}

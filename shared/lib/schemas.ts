import { z } from 'zod';

export const coordinateSchema = z.object({
  latitude: z
    .number()
    .refine((value) => !isNaN(value), { message: 'Введите число для широты' })
    .min(-90, 'Минимум -90')
    .max(90, 'Максимум 90'),
  longitude: z
    .number()
    .refine((value) => !isNaN(value), { message: 'Введите число для долготы' })
    .min(-180, 'Минимум -180')
    .max(180, 'Максимум 180'),
});

export const citySchema = z.object({
  country: z.string().trim().min(1, 'Укажите страну'),
  city: z.string().trim().min(1, 'Укажите город'),
});

export type CoordinateForm = z.infer<typeof coordinateSchema>;
export type CityForm = z.infer<typeof citySchema>;

export type SearchMode = 'coordinates' | 'city';

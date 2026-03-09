import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  phone: z.string().nullable().optional(),
  postcode: z.coerce.number().nullable().optional(),
  country: z.string().nullable().optional(),
  township: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  birthday: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? new Date(v) : null)),
  genre_like: z.string().nullable().optional(),
  play_instrument: z.string().nullable().optional(),
  info: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  privacy: z.coerce.number().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

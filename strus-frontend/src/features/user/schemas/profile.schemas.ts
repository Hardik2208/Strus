import { z } from 'zod';

export const profileSetupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),
  countryCode: z.string().length(2, 'Please select a valid country'),
  timezone: z.string().min(1, 'Please select a timezone'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  countryCode: z.string().length(2, 'Please select a valid country'),
  timezone: z.string().min(1, 'Please select a timezone'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

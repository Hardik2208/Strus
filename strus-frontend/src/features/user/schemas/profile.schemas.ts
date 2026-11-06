import { z } from 'zod';

export const profileSetupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  username: z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(
    /^(?![._])(?!.*[._]{2})[a-z0-9._]{3,30}(?<![._])$/,
    'Username must use lowercase letters, numbers, periods, or underscores. It cannot start/end with a period or underscore or contain consecutive periods/underscores.',
  ),
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

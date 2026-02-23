import { z } from 'zod';

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

/**
 * Sign up form validation schema
 */
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    name: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Sign in form validation schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Update password form validation schema
 */
export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

/**
 * Reset password form validation schema (email only)
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

/** Feedback category (maps to DB enum) */
export const FEEDBACK_CATEGORIES = [
  'general',
  'uiux',
  'bug',
  'feature_request',
  'performance',
  'pricing',
] as const;

export const feedbackCategorySchema = z.enum(FEEDBACK_CATEGORIES);

/** 1-5 scale for rating, friendly_score, retention_intent */
export const scale1To5Schema = z.number().int().min(1).max(5);

/** 0-4 for pricing_score (optional) */
export const pricingScoreSchema = z.number().int().min(0).max(4).optional();

/** 0-10 NPS: "How likely are you to recommend?" (optional) */
export const npsScoreSchema = z.number().int().min(0).max(10).optional();

export const feedbackSchema = z.object({
  rating: scale1To5Schema,
  friendly_score: scale1To5Schema,
  retention_intent: scale1To5Schema,
  category: feedbackCategorySchema,
  message: z.string().trim().max(2000).optional(),
  pricing_score: pricingScoreSchema,
  nps_score: npsScoreSchema,
});

import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url({ message: 'VITE_SUPABASE_URL must be a valid URL' }),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, { message: 'VITE_SUPABASE_ANON_KEY is required' }),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables. Check the console for more details.');
}

export const config = {
  supabase: {
    url: _env.data.VITE_SUPABASE_URL,
    anonKey: _env.data.VITE_SUPABASE_ANON_KEY,
  },
} as const;

import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url({ error: 'VITE_SUPABASE_URL must be a valid URL' }),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, { error: 'VITE_SUPABASE_ANON_KEY is required' }),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  if (import.meta.env.PROD) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment variables. Check the console for more details.');
  } else {
    console.warn('⚠️ Missing environment variables in development/test mode. Using mock values.');
  }
}

export const config = {
  supabase: {
    url: _env.success ? _env.data.VITE_SUPABASE_URL : 'http://localhost:54321',
    anonKey: _env.success ? _env.data.VITE_SUPABASE_ANON_KEY : 'mock-anon-key',
  },
} as const;

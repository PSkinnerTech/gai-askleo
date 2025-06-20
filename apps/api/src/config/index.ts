
import { z } from 'zod';

const ConfigSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('0.0.0.0'),
  FRONTEND_DOMAIN: z.string().url().optional(),
});

function loadConfig() {
  try {
    return ConfigSchema.parse(process.env);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
  }
}

export const config = loadConfig();

import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),

    ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
    NEWS_API_KEY: z.string().min(1, 'NEWS_API_KEY is required'),

    CLAUDE_MODEL: z.preprocess((v) => (v === '' ? undefined : v), z.string().default('claude-haiku-4-5-20251001')),
    MOCK_MODE: z
        .enum(['true', 'false'])
        .default('false')
        .transform((v) => v === 'true'),

    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of parsed.error.issues) {
        console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('\nCopy backend/.env.example to backend/.env and fill it in.');
    process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
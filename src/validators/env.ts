import { z } from 'zod';

const envVariables = z.object({
    DISCORD_TOKEN: z.string().nonempty('DISCORD_TOKEN is required').refine((str) => str !== 'YOUR_TOKEN_HERE', {
        message: 'Real token must be specified',
    }),
    YOUTUBE_API_KEY: z.string().nonempty('YOUTUBE_API_KEY is required').refine((str) => str !== 'YOUR_API_KEY_HERE', {
        message: 'Real API key must be specified',
    }),
});

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envVariables> {}
    }
}

// Validate environment variables
console.log('Validating environment variables...');

const parsed = envVariables.safeParse(process.env);
if (!parsed.success) {
    console.error(
        '❌ Invalid environment variables:',
        parsed.error.flatten().fieldErrors
    );
    throw new SyntaxError('Invalid environment variables');
}

console.log('Environment variables seem to be correct...');

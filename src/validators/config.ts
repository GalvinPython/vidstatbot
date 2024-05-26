import { z } from 'zod';

const configSchema = z.object({
    bot: z.object({
        privateMessages: z.boolean().default(true),
        graph: z.boolean().default(true),
    }),
    youtube: z.object({
        delay: z.number().default(1000),
    }),
});

export type Config = z.infer<typeof configSchema>;

import config from '../../config';

console.log('Validating configuration...');

const parsed = configSchema.safeParse(config);
if (parsed.success === false) {
    console.error(
        '❌ Invalid configuration:',
        parsed.error.flatten().fieldErrors,
    );
    throw new SyntaxError('Invalid configuration');
}

console.log('Configuration seems to be correct...');
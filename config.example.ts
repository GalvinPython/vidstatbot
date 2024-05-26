import type { Config } from './src/validators/config';

export default {
	bot: {
		privateMessages: true, // Allow video upload notifications to be done in DMs
		graph: true, // TODO: Implement
		disableLimits: false,
		textChannelMax: 50,
		guildMax: 100,
	},
	youtube: {
		delay: 1000, // Delay between calls. Increase this to use less quota
	},
} satisfies Config;

// HI. RENAME THIS FILE TO config.ts!
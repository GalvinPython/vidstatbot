import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs/promises';

const getEvents = await fs.readdir('src/events');

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
	allowedMentions: {
		parse: ['everyone', 'users'],
	},
});

client.on('error', (error) => {
	console.error(error);
});

client.login(process.env.DISCORD_TOKEN);

export default client;
for await (const file of getEvents) {
	await import('./events/' + file); // auto-load events
}

await import('./tasks/handler');
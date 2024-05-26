import { ActivityType, Events } from 'discord.js';
import djs_client from '../client';

djs_client.once(Events.ClientReady, async (bot) => {
	console.log(`Ready! Logged in as ${bot.user.tag}`);
	bot.user.setPresence({
		activities: [
			{
				name: `Updating ${bot.guilds.cache.size} servers.`,
				type: ActivityType.Custom,
			},
		],
		status: 'online',
	});
});

setInterval(() => {
	if (!djs_client?.user) return;
	djs_client.user.setPresence({
		activities: [
			{
				name: `Updating ${djs_client.guilds.cache.size} servers.`,
				type: ActivityType.Custom,
			},
		],
		status: 'online',
	});
}, 60000);
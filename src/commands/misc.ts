// Once again, I'm stealing the commands from https://github.com/NiaAxern/discord-youtube-subscriber-count/blob/main/src/commands/utilities.ts

import { heapStats } from 'bun:jsc';
import client from '../client';
const commands = {
    ping: {
        data: {
            options: [],
            name: 'ping',
            description: 'Check the ping of the bot!',
            integration_types: [0, 1],
            contexts: [0, 1, 2],
        },
        execute: async (interaction: { reply: (arg0: { ephemeral: boolean; content: string; }) => Promise<any>; client: { ws: { ping: any; }; }; }) => {
            await interaction
                .reply({
                    ephemeral: false,
                    content: `Ping: ${interaction.client.ws.ping}ms`,
                })
                .catch(console.error);
        },
    },
    help: {
        data: {
            options: [],
            name: 'help',
            description: 'Get help on what each command does!',
            integration_types: [0, 1],
            contexts: [0, 1, 2],
        },
        execute: async (interaction: { reply: (arg0: { ephemeral: boolean; content: string; }) => Promise<any>; }) => {
            await client.application?.commands?.fetch().catch(console.error);
            const chat_commands = client.application?.commands.cache.map((a: { name: any; id: any; description: any; }) => {
                return `</${a.name}:${a.id}>: ${a.description}`;
            });
            await interaction
                .reply({
                    ephemeral: true,
                    content: `Commands:\n${chat_commands?.join('\n')}`,
                })
                .catch(console.error);
        },
    },
    source: {
        data: {
            options: [],
            name: 'source',
            description: "Get the link of the app's source code.",
            integration_types: [0, 1],
            contexts: [0, 1, 2],
        },
        execute: async (interaction: { reply: (arg0: { ephemeral: boolean; content: string; }) => Promise<any>; }) => {
            await interaction
                .reply({
                    ephemeral: true,
                    content: `[Github repository](https://github.com/GalvinPython/vidstatbot)`,
                })
                .catch(console.error);
        },
    },
    uptime: {
        data: {
            options: [],
            name: 'uptime',
            description: 'Check the uptime of the bot!',
            integration_types: [0, 1],
            contexts: [0, 1, 2],
        },
        execute: async (interaction: { reply: (arg0: { ephemeral: boolean; content: string; }) => Promise<any>; }) => {
            await interaction
                .reply({
                    ephemeral: false,
                    content: `Uptime: ${(performance.now() / (86400 * 1000)).toFixed(
                        2,
                    )} days`,
                })
                .catch(console.error);
        },
    },
    usage: {
        data: {
            options: [],
            name: 'usage',
            description: 'Check the heap size and disk usage of the bot!',
            integration_types: [0, 1],
            contexts: [0, 1, 2],
        },
        execute: async (interaction: { reply: (arg0: { ephemeral: boolean; content: string; }) => Promise<any>; }) => {
            const heap = heapStats();
            Bun.gc(false);
            await interaction
                .reply({
                    ephemeral: false,
                    content: [
                        `Heap size: ${(heap.heapSize / 1024 / 1024).toFixed(2)} MB / ${(
                            heap.heapCapacity /
                            1024 /
                            1024
                        ).toFixed(2)} MB (${(heap.extraMemorySize / 1024 / 1024).toFixed(
                            2,
                        )} MB) (${heap.objectCount.toLocaleString(
                            'en-US',
                        )} objects, ${heap.protectedObjectCount.toLocaleString(
                            'en-US',
                        )} protected-objects)`,
                    ]
                        .join('\n')
                        .slice(0, 2000),
                })
                .catch(console.error);
        },
    },
};

export default commands;
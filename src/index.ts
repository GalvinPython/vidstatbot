console.log("Running the bot omg");

// Run validations
console.log('Running validation')
import './validators/config'
import './validators/env'

// Initalise databases
console.log('Importing database')
import './utils/database'

// Update commands
console.log('Updating commands')
import commands from './utils/commands';
import { REST, Routes } from 'discord.js';

try {
    if (!process.env.DISCORD_TOKEN)
        throw "No token provided. Add the bot's DISCORD_TOKEN to the .env.local file.";
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    console.log(
        `Started refreshing ${commands.size} application (/) commands.`,
    );
    
    const getID: any = (await rest.get(
        Routes.currentApplication(),
    )) || {
        id: null,
    };

    if (!getID?.id) throw 'No application was found with this token.';
    console.log('Now sending ' + commands.size + ' commands to Discord.');
    
    const data: any /*eslint-disable-line*/ = await rest.put(
        Routes.applicationCommands(getID.id),
        {
            body: [...commands.values()].map((a) => {
                return a.data;
            }),
        },
    );

    console.log(
        `Successfully reloaded ${data.length} application (/) commands.`,
    );
} catch (error) {
    console.error(error);
}

import './client'
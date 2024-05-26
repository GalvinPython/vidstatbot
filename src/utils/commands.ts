import fs from 'fs/promises';

// save the commands to a map
const commands = new Map();
const getDir = (await fs.readdir('src/commands')).map((value) => {
    return '../commands/' + value;
});

for await (const filepath of getDir) {
    const Commands = (await import(filepath)).default;
    console.log('loading commands from ' + filepath);
    for (const key in Commands) {
        const command = Commands[key];
        console.log('loading ' + key);
        commands.set(key, command);
    }
}
export default commands;
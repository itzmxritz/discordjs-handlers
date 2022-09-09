const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { discord_token } = require('./config/token.json');
const { guild_id, user_id } = require('./config/token.json');

const gcommands = [];
const pcommands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (command.global) {
        gcommands.push(command.data.toJSON());
    } else {
        pcommands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(discord_token);

rest.put(Routes.applicationGuildCommands(user_id, guild_id), { body: pcommands })
    .then(() => console.log('Successfully registered non-application commands.'))
    .catch(console.error);

rest.put(Routes.applicationCommands(user_id), { body: gcommands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
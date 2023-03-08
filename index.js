const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { discord_token } = require('./config/token.json');

const bot = new Client({
   intents: [
       GatewayIntentBits.DirectMessageReactions,
       GatewayIntentBits.DirectMessageTyping,
       GatewayIntentBits.DirectMessages,
       GatewayIntentBits.GuildBans,
       GatewayIntentBits.GuildEmojisAndStickers,
       GatewayIntentBits.GuildIntegrations,
       GatewayIntentBits.GuildInvites,
       GatewayIntentBits.GuildMembers,
       GatewayIntentBits.GuildMessageReactions,
       GatewayIntentBits.GuildMessageTyping,
       GatewayIntentBits.GuildMessages,
       GatewayIntentBits.GuildPresences,
       GatewayIntentBits.GuildScheduledEvents,
       GatewayIntentBits.GuildVoiceStates,
       GatewayIntentBits.GuildWebhooks,
       GatewayIntentBits.Guilds,
       GatewayIntentBits.MessageContent,
   ],
   partials: [
       Partials.Channel,
       Partials.GuildMember,
       Partials.GuildScheduledEvent,
       Partials.Message,
       Partials.Reaction,
       Partials.ThreadMember,
       Partials.User,
   ],
});

bot.commands = new Collection();
bot.buttons = new Collection();
bot.selects = new Collection();
bot.modals = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
const selectsPath = path.join(__dirname, 'selects');
const selectFiles = fs.readdirSync(selectsPath).filter(file => file.endsWith('.js'));
const modalsPath = path.join(__dirname, 'modals');
const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const filePath = path.join(commandsPath, file);
   const command = require(filePath);
   bot.commands.set(command.data.name, command);
}

for (const file of buttonFiles) {
   const filePath = path.join(buttonsPath, file);
   const button = require(filePath);
   bot.buttons.set(button.id, button);
}

for (const file of selectFiles) {
   const filePath = path.join(selectsPath, file);
   const select = require(filePath);
   bot.selects.set(select.id, select);
}

for (const file of modalFiles) {
   const filePath = path.join(modalsPath, file);
   const modal = require(filePath);
   bot.modals.set(modal.id, modal);
}

bot.on('interactionCreate', async interaction => {
   if (interaction.isCommand()) {
      const command = interaction.bot.commands.get(interaction.commandName);

      if (!command) return;

      try {
         await command.execute(interaction);
      } catch (error) {
         console.error(error);
         await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
   } else if (interaction.isButton()) {
      const button = interaction.bot.buttons.get(interaction.customId);

      if (!button) return;

      try {
         await button.execute(interaction);
      } catch (error) {
         console.error(error);
         await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
      }
   } else if (interaction.isSelectMenu()) {
      const select = interaction.bot.selects.get(interaction.customId);

      if (!select) return;

      try {
         await select.execute(interaction);
      } catch (error) {
         console.error(error);
         await interaction.reply({ content: 'There was an error while executing this selectMenu!', ephemeral: true });
      }
   } else if (interaction.isModalSubmit()) {
      const modal = interaction.bot.modals.get(interaction.customId);

      if (!modal) return;

      try {
         await modal.execute(interaction);
      } catch (error) {
         console.error(error);
         await interaction.reply({ content: 'There was an error while executing this modal!', ephemeral: true });
      }
   }
});

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		bot.once(event.name, (...args) => event.execute(...args));
	} else {
		bot.on(event.name, (...args) => event.execute(...args));
	}
}

bot.login(discord_token)

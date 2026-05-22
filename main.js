const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.giveaways = new Map();
const prefix = '!';

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const slashCommands = [];

if (fs.existsSync(commandsPath)) {
  const commandFolders = fs.readdirSync(commandsPath);
  
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        
        // Check if it's a slash command
        if (command.data && command.data.toJSON) {
          slashCommands.push(command.data.toJSON());
          client.commands.set(command.data.name, command);
          console.log(`✅ Loaded slash command: ${command.data.name}`);
        }
        // Check if it's a prefix command
        else if (command.name) {
          client.commands.set(command.name, command);
          console.log(`✅ Loaded prefix command: ${command.name}`);
        }
      }
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

// Register slash commands
client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  client.user.setActivity('!help | /create-giveaway', { type: 'LISTENING' });

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    if (process.env.GUILD_ID) {
      // Register for specific guild (faster for testing)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: slashCommands }
      );
      console.log(`✅ Registered ${slashCommands.length} slash commands for guild`);
    } else {
      // Register globally (takes up to 1 hour)
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: slashCommands }
      );
      console.log(`✅ Registered ${slashCommands.length} slash commands globally`);
    }
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

// Prefix command handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  // Skip slash commands
  if (command.data) return;

  // Cooldown check
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      return message.reply(`Please wait, you are on a cooldown. Try again <t:${expiredTimestamp}:R>`);
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error('Command error:', error);
    message.reply('There was an error executing this command!');
  }
});

client.login(process.env.DISCORD_TOKEN);

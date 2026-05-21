const { Client, GatewayIntentBits, Collection, ChannelType } = require('discord.js');
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
const prefix = '!';

// Import database
const { initializeDatabase } = require('./database/db');

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if (command.name) {
      client.commands.set(command.name, command);
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
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

// Message handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) {
    // Handle XP gain for level system
    if (message.guild) {
      const db = require('./database/db').getDatabase();
      const userId = message.author.id;
      const guildId = message.guild.id;

      try {
        const user = await db.get('SELECT * FROM user_levels WHERE user_id = ? AND guild_id = ?', [userId, guildId]);
        
        if (user) {
          const xpGain = Math.floor(Math.random() * 15) + 5; // 5-20 XP per message
          const newXP = user.xp + xpGain;
          const newLevel = Math.floor(Math.sqrt(newXP / 100));

          await db.run('UPDATE user_levels SET xp = ?, level = ? WHERE user_id = ? AND guild_id = ?', 
            [newXP, newLevel, userId, guildId]);

          // Check for level up
          if (newLevel > user.level) {
            message.channel.send(`🎉 Congratulations ${message.author}, you've reached **level ${newLevel}**!`);
            
            // Check for level rewards
            const reward = await db.get('SELECT * FROM level_rewards WHERE guild_id = ? AND level = ?', [guildId, newLevel]);
            if (reward) {
              try {
                const role = message.guild.roles.cache.get(reward.role_id);
                if (role) {
                  await message.member.roles.add(role);
                  message.channel.send(`✨ You've been awarded the **${role.name}** role!`);
                }
              } catch (error) {
                console.error('Error adding role reward:', error);
              }
            }
          }
        } else {
          await db.run('INSERT INTO user_levels (user_id, guild_id, xp, level) VALUES (?, ?, ?, ?)', 
            [userId, guildId, 5, 0]);
        }
      } catch (error) {
        console.error('Error updating XP:', error);
      }
    }
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

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

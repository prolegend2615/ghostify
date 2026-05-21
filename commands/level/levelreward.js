const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'levelreward',
  aliases: ['lvlreward', 'setreward'],
  description: 'Set a role reward for a specific level',
  cooldown: 3,
  async execute(message, args, client) {
    // Check permissions
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('❌ You need the **Manage Roles** permission to use this command.');
    }

    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('❌ I need the **Manage Roles** permission to add roles.');
    }

    if (args.length < 2) {
      return message.reply('❌ Usage: `!levelreward <level> <@role>`');
    }

    const level = parseInt(args[0]);
    const role = message.mentions.roles.first();

    if (isNaN(level) || level < 0) {
      return message.reply('❌ Please provide a valid level number!');
    }

    if (!role) {
      return message.reply('❌ Please mention a valid role!');
    }

    // Check if bot can manage the role
    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ I cannot manage roles higher than or equal to my highest role!');
    }

    const db = require('../../database/db').getDatabase();

    try {
      // Check if reward already exists
      const existing = await db.get(
        'SELECT * FROM level_rewards WHERE guild_id = ? AND level = ?',
        [message.guild.id, level]
      );

      if (existing) {
        await db.run(
          'UPDATE level_rewards SET role_id = ? WHERE guild_id = ? AND level = ?',
          [role.id, message.guild.id, level]
        );
        message.reply(`✅ Updated level **${level}** reward to **${role.name}**!`);
      } else {
        await db.run(
          'INSERT INTO level_rewards (guild_id, level, role_id) VALUES (?, ?, ?)',
          [message.guild.id, level, role.id]
        );
        message.reply(`✅ Level **${level}** now gives the **${role.name}** role!`);
      }
    } catch (error) {
      console.error('Error setting level reward:', error);
      message.reply('❌ There was an error setting the reward!');
    }
  },
};

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'level',
  aliases: ['rank', 'xp'],
  description: 'Check your level and XP',
  cooldown: 3,
  async execute(message, args, client) {
    const db = require('../../database/db').getDatabase();
    let user = message.mentions.users.first() || message.author;

    try {
      const userData = await db.get(
        'SELECT * FROM user_levels WHERE user_id = ? AND guild_id = ?',
        [user.id, message.guild.id]
      );

      if (!userData) {
        return message.reply(`${user.username} hasn't sent any messages yet!`);
      }

      const xpForNextLevel = (userData.level + 1) ** 2 * 100;
      const progressPercentage = (userData.xp / xpForNextLevel) * 100;

      // Create progress bar
      const progressBar = '█'.repeat(Math.floor(progressPercentage / 5)) + 
                         '░'.repeat(20 - Math.floor(progressPercentage / 5));

      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Level Card`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setColor(0x7289DA)
        .addFields(
          { name: '📊 Level', value: `${userData.level}`, inline: true },
          { name: '⭐ XP', value: `${userData.xp} / ${xpForNextLevel}`, inline: true },
          { name: '🎯 Progress', value: `\`${progressBar}\` ${Math.floor(progressPercentage)}%`, inline: false },
        )
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching level data:', error);
      message.reply('There was an error fetching your level data!');
    }
  },
};

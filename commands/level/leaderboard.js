const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'top'],
  description: 'View the server level leaderboard',
  cooldown: 5,
  async execute(message, args, client) {
    const db = require('../../database/db').getDatabase();

    try {
      const users = await db.all(
        'SELECT * FROM user_levels WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT 10',
        [message.guild.id]
      );

      if (users.length === 0) {
        return message.reply('No level data available yet!');
      }

      let leaderboardText = '';
      for (let i = 0; i < users.length; i++) {
        const user = await client.users.fetch(users[i].user_id).catch(() => null);
        const username = user ? user.username : 'Unknown User';
        leaderboardText += `**${i + 1}.** ${username} - Level **${users[i].level}** (${users[i].xp} XP)\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle(`🏆 Level Leaderboard - ${message.guild.name}`)
        .setDescription(leaderboardText)
        .setColor(0x7289DA)
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      message.reply('There was an error fetching the leaderboard!');
    }
  },
};

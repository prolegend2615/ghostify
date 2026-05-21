const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'whois',
  aliases: ['userinfo', 'user'],
  description: 'Get information about a user',
  cooldown: 3,
  async execute(message, args, client) {
    let user = message.mentions.users.first();

    if (!user) {
      user = message.author;
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return message.reply('Could not find that user.');
    }

    // Get user flags
    const userFlags = user.flags?.toArray() || [];
    const badges = userFlags.length > 0 ? userFlags.join(', ') : 'None';

    // Format dates
    const joinedDiscord = Math.floor(user.createdTimestamp / 1000);
    const joinedServer = member.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : 'Unknown';

    // Get roles
    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .slice(0, 10)
      .join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Information`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor(member.displayHexColor || 0x7289DA)
      .addFields(
        { name: '👤 Username', value: `${user.username}`, inline: true },
        { name: '🏷️ Discriminator', value: `${user.discriminator}`, inline: true },
        { name: '🆔 User ID', value: `${user.id}`, inline: true },
        { name: '🤖 Bot', value: `${user.bot ? 'Yes' : 'No'}`, inline: true },
        { name: '📅 Discord Account Created', value: `<t:${joinedDiscord}:R>`, inline: true },
        { name: '📅 Server Join Date', value: `<t:${joinedServer}:R>`, inline: true },
        { name: `🏆 Roles [${member.roles.cache.filter(r => r.id !== message.guild.id).size}]`, value: roles || 'None', inline: false },
        { name: '🎖️ Badges', value: badges, inline: false },
      )
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

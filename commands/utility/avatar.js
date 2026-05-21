const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'Get a user\'s avatar',
  cooldown: 3,
  async execute(message, args, client) {
    let user = message.mentions.users.first();

    if (!user) {
      user = message.author;
    }

    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(avatarURL)
      .setColor(0x7289DA)
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

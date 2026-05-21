module.exports = {
  name: '8ball',
  aliases: ['eightball'],
  description: 'Ask the magic 8 ball a question',
  cooldown: 3,
  async execute(message, args, client) {
    if (args.length === 0) {
      return message.reply('🎱 You must ask a question!');
    }

    const responses = [
      // Positive responses
      'Yes, definitely!',
      'It is certain.',
      'Most likely.',
      'Absolutely!',
      'You may rely on it.',
      'Looks good to me!',
      'Great!',
      'Without a doubt.',
      'Signs point to yes.',
      'Very promising.',

      // Negative responses
      'No, absolutely not.',
      'Don\'t count on it.',
      'Very doubtful.',
      'Don\'t bet on it.',
      'My sources say no.',
      'Outlook not so good.',
      'Absolutely not.',
      'The stars say no.',

      // Uncertain responses
      'Ask again later.',
      'Maybe, maybe not.',
      'Concentrate and ask again.',
      'I\'m not sure.',
      'Cannot predict now.',
      'My sources are unclear.',
      'The answer is unclear.',
      'Time will tell.',
      'I need to think about that.',
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    const embed = {
      color: 0x7289DA,
      title: '🎱 Magic 8 Ball',
      description: `**Question:** ${args.join(' ')}\n\n**Answer:** ${response}`,
      timestamp: new Date(),
      footer: {
        text: message.author.username,
        icon_url: message.author.displayAvatarURL(),
      },
    };

    message.reply({ embeds: [embed] });
  },
};

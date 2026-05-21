module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  cooldown: 3,
  async execute(message, args, client) {
    const msg = await message.reply('🏓 Pinging...');
    const latency = msg.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    msg.edit(`
🏓 **Pong!**
└─ Message Latency: \`${latency}ms\`
└─ API Latency: \`${apiLatency}ms\`
    `);
  },
};

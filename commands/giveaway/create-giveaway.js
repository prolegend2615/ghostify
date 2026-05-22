const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-giveaway')
    .setDescription('Create a giveaway with advanced options')
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1h, 30m, 2d)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('Prize description')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send giveaway')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Custom message (use @everyone, @here, or @role mention)')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('required-role')
        .setDescription('Required role to participate (optional)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('required-total-messages')
        .setDescription('Required total messages (optional)')
        .setRequired(false)
        .setMinValue(1)
    )
    .addRoleOption(option =>
      option.setName('bypass-role')
        .setDescription('Role that bypasses requirements (optional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const duration = interaction.options.getString('duration');
    const winners = interaction.options.getInteger('winners');
    const prize = interaction.options.getString('prize');
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const requiredRole = interaction.options.getRole('required-role');
    const requiredTotalMsg = interaction.options.getInteger('required-total-messages');
    const bypassRole = interaction.options.getRole('bypass-role');

    // Parse duration
    const durationMs = parseDuration(duration);
    if (!durationMs) {
      return interaction.reply({
        content: '❌ Invalid duration format! Use: 1h, 30m, 2d, 1w, etc.',
        ephemeral: true,
      });
    }

    const endTime = Date.now() + durationMs;
    const endTimeSeconds = Math.floor(endTime / 1000);

    // Create giveaway embed
    const giveawayEmbed = new EmbedBuilder()
      .setTitle('🎉 GIVEAWAY 🎉')
      .setDescription(`**Prize:** ${prize}\n\n**Winners:** ${winners}\n\n**Ends:** <t:${endTimeSeconds}:R>`)
      .setColor(0xFF6B00)
      .setFooter({ text: `Created by ${interaction.user.username}` })
      .setTimestamp();

    // Add requirement info if any
    let requirementInfo = [];
    if (requiredRole) requirementInfo.push(`✅ Required Role: ${requiredRole}`);
    if (requiredTotalMsg) requirementInfo.push(`✅ Required Messages: ${requiredTotalMsg}`);
    if (bypassRole) requirementInfo.push(`✅ Bypass Role: ${bypassRole}`);
    
    if (requirementInfo.length > 0) {
      giveawayEmbed.addFields(
        { name: 'Requirements', value: requirementInfo.join('\n'), inline: false }
      );
    }

    // Create join button
    const joinButton = new ButtonBuilder()
      .setCustomId(`giveaway-join-${Date.now()}`)
      .setLabel('🎊 Join Giveaway')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(joinButton);

    try {
      // Send giveaway message
      const giveawayMessage = await channel.send({
        content: message,
        embeds: [giveawayEmbed],
        components: [row],
      });

      // Store giveaway data (in-memory)
      if (!interaction.client.giveaways) {
        interaction.client.giveaways = new Map();
      }

      const giveawayData = {
        messageId: giveawayMessage.id,
        channelId: channel.id,
        guildId: interaction.guild.id,
        prize,
        winners,
        endTime,
        participants: new Set(),
        requiredRole: requiredRole?.id || null,
        requiredTotalMsg,
        bypassRole: bypassRole?.id || null,
      };

      interaction.client.giveaways.set(giveawayMessage.id, giveawayData);

      // Schedule giveaway end
      setTimeout(async () => {
        await endGiveaway(interaction.client, giveawayMessage.id, channel);
      }, durationMs);

      await interaction.reply({
        content: `✅ Giveaway created in ${channel}!\n⏰ Ends <t:${endTimeSeconds}:R>`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error creating giveaway:', error);
      await interaction.reply({
        content: '❌ Error creating giveaway!',
        ephemeral: true,
      });
    }
  },
};

function parseDuration(duration) {
  const matches = duration.match(/^(\d+)([smhdw])$/);
  if (!matches) return null;

  const value = parseInt(matches[1]);
  const unit = matches[2];

  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return value * (units[unit] || 0);
}

async function endGiveaway(client, messageId, channel) {
  try {
    const giveaway = client.giveaways.get(messageId);
    if (!giveaway) return;

    const participantArray = Array.from(giveaway.participants);
    
    if (participantArray.length === 0) {
      const message = await channel.messages.fetch(messageId);
      await message.reply('❌ No participants, giveaway cancelled!');
      client.giveaways.delete(messageId);
      return;
    }

    // Select random winners
    const winners = [];
    const participantsCopy = [...participantArray];
    const winnersCount = Math.min(giveaway.winners, participantsCopy.length);

    for (let i = 0; i < winnersCount; i++) {
      const randomIndex = Math.floor(Math.random() * participantsCopy.length);
      winners.push(participantsCopy[randomIndex]);
      participantsCopy.splice(randomIndex, 1);
    }

    // Create winner announcement
    const winnerMentions = winners.map(id => `<@${id}>`).join(' ');
    const resultEmbed = new EmbedBuilder()
      .setTitle('🎊 Giveaway Ended! 🎊')
      .setDescription(`**Prize:** ${giveaway.prize}\n\n**Winners:** ${winnerMentions}\n\n**Participants:** ${participantArray.length}`)
      .setColor(0x00FF00)
      .setTimestamp();

    const message = await channel.messages.fetch(messageId);
    await message.reply({
      embeds: [resultEmbed],
      content: `🎉 ${winnerMentions}\n\nCongratulations! You won **${giveaway.prize}**!`,
    });

    client.giveaways.delete(messageId);
  } catch (error) {
    console.error('Error ending giveaway:', error);
  }
}

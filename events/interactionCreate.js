module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handle button interactions for giveaway
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('giveaway-join')) {
        const giveaway = interaction.client.giveaways?.get(interaction.message.id);
        
        if (!giveaway) {
          return interaction.reply({
            content: '❌ This giveaway no longer exists!',
            ephemeral: true,
          });
        }

        // Check if user already joined
        if (giveaway.participants.has(interaction.user.id)) {
          return interaction.reply({
            content: '❌ You already joined this giveaway!',
            ephemeral: true,
          });
        }

        // Check required role
        if (giveaway.requiredRole) {
          const requiredRole = interaction.guild.roles.cache.get(giveaway.requiredRole);
          if (!interaction.member.roles.cache.has(giveaway.requiredRole)) {
            return interaction.reply({
              content: `❌ You need the ${requiredRole} role to join!`,
              ephemeral: true,
            });
          }
        }

        // Check bypass role
        const hasBypassRole = giveaway.bypassRole && interaction.member.roles.cache.has(giveaway.bypassRole);

        // Check message requirements if not bypassed
        if (!hasBypassRole && giveaway.requiredTotalMsg) {
          // For now, we'll set a placeholder check
          // In a real scenario, you'd check the user's message count in the database
          const userMessages = 0; // Placeholder - would fetch from DB in production
          
          if (userMessages < giveaway.requiredTotalMsg) {
            return interaction.reply({
              content: `❌ You need at least ${giveaway.requiredTotalMsg} messages to join this giveaway!`,
              ephemeral: true,
            });
          }
        }

        // Add user to participants
        giveaway.participants.add(interaction.user.id);

        await interaction.reply({
          content: `✅ You joined the giveaway! Good luck! 🍀\n**Total participants:** ${giveaway.participants.size}`,
          ephemeral: true,
        });
      }
    }

    // Handle slash commands
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Command error:', error);
      await interaction.reply({
        content: '❌ There was an error executing this command!',
        ephemeral: true,
      });
    }
  },
};

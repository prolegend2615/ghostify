const { initializeDatabase } = require('../database/db');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    client.user.setActivity('!help', { type: 'LISTENING' });
    
    // Initialize database
    await initializeDatabase();
  },
};

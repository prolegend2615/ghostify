![Ghostify Logo](https://img.shields.io/badge/Ghostify-Discord%20Bot-blueviolet?style=for-the-badge)

# 👻 Ghostify - Discord Bot

A powerful Discord bot inspired by **Dyno** and **Carl-bot**, with moderation, leveling system, and advanced features.

## 🌟 Features

### Fun Commands
- **`!ping`** - Check bot latency
- **`!8ball`** - Ask the magic 8 ball a question

### Utility Commands
- **`!whois @user`** - Get detailed user information (name, avatar, roles, join dates, etc.)
- **`!avatar @user`** - Display user avatar

### Level System
- **`!level [@user]`** - Check your level and XP progress
- **`!leaderboard`** - View top 10 users by level
- **`!levelreward <level> <@role>`** - Set role rewards for specific levels
- XP gained automatically on message send (5-20 XP)
- Automatic level-up notifications and role rewards

## 📋 Prerequisites

- Node.js v16+
- npm or yarn
- A Discord Bot Token
- Discord Server with appropriate permissions

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prolegend2615/ghostify.git
   cd ghostify
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Add your credentials to `.env`:**
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   ```

5. **Start the bot:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
gostify/
├── commands/
│   ├── fun/
│   │   ├── ping.js
│   │   └── 8ball.js
│   ├── utility/
│   │   ├── whois.js
│   │   └── avatar.js
│   └── level/
│       ├── level.js
│       ├── leaderboard.js
│       └── levelreward.js
├── events/
│   └── ready.js
├── database/
│   └── db.js
├── main.js
├── package.json
└── .env.example
```

## 📊 Database Tables

### user_levels
- Stores user XP and level data per guild
- Tracks progression over time

### level_rewards
- Stores role rewards for specific levels
- Applied automatically when user levels up

### giveaways
- Stores giveaway data (coming soon)

### giveaway_participants
- Stores giveaway participants (coming soon)

## 🔧 Commands Format

Each command follows this structure:
```javascript
module.exports = {
  name: 'command-name',
  aliases: ['alias1', 'alias2'],
  description: 'What the command does',
  cooldown: 3, // in seconds
  async execute(message, args, client) {
    // Command logic here
  },
};
```

## 📝 Prefix

Default prefix is `!`

Example: `!ping`, `!8ball`, `!level`

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT

---

**Made with ❤️ by prolegend2615**

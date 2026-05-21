const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const sqlite = require('sqlite');
let db = null;

async function initializeDatabase() {
  try {
    db = await sqlite.open({
      filename: path.join(__dirname, 'ghostify.db'),
      driver: sqlite3.Database,
    });

    // Create tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 0,
        UNIQUE(user_id, guild_id)
      );

      CREATE TABLE IF NOT EXISTS level_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        level INTEGER NOT NULL,
        role_id TEXT NOT NULL,
        UNIQUE(guild_id, level)
      );

      CREATE TABLE IF NOT EXISTS giveaways (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT NOT NULL,
        prize TEXT NOT NULL,
        winners_count INTEGER DEFAULT 1,
        end_time INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS giveaway_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        giveaway_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        UNIQUE(giveaway_id, user_id),
        FOREIGN KEY(giveaway_id) REFERENCES giveaways(id)
      );
    `);

    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

function getDatabase() {
  return db;
}

module.exports = { initializeDatabase, getDatabase };

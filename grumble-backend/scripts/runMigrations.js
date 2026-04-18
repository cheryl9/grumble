#!/usr/bin/env node
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function runMigrations() {
  try {
    console.log('🚀 Starting migrations...\n');

    const migrationFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.match(/^\d+_.*\.sql$/))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        console.log(`⏳ Running: ${file}`);
        await pool.query(sql);
        console.log(`✅ Completed: ${file}\n`);
      } catch (error) {
        console.error(`❌ Error in ${file}:`);
        console.error(error.message);
        console.error('\n');
        // Continue with next migration even if one fails
      }
    }

    console.log('✨ All migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

runMigrations();

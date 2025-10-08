/**
 * Database Migration Runner
 * Runs SQL migrations in order
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { initializePostgreSQL, query, closeDatabases } from './connection';

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Initialize PostgreSQL
    await initializePostgreSQL();

    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get already executed migrations
    const executedMigrations = await query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedNames = new Set(executedMigrations.map((m) => m.name));

    // Get migration files
    const migrationsDir = join(__dirname, 'migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('📝 No migration files found');
      return;
    }

    let executedCount = 0;

    // Run each migration
    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`▶️  Executing ${file}...`);

      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf-8');

      // Execute migration
      await query(sql);

      // Record migration
      await query('INSERT INTO migrations (name) VALUES ($1)', [file]);

      console.log(`✅ ${file} executed successfully\n`);
      executedCount++;
    }

    if (executedCount === 0) {
      console.log('✨ All migrations are up to date!');
    } else {
      console.log(`\n✅ Successfully executed ${executedCount} migration(s)`);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabases();
  }
}

// Run migrations
runMigrations();


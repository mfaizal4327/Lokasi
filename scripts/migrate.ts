import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL tidak ditemukan.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('Menjalankan migration...\n');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL       PRIMARY KEY,
      username      VARCHAR(50)  UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      nama          VARCHAR(100) NOT NULL,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;
  console.log('  Tabel users dibuat.');

  await sql`
    CREATE TABLE IF NOT EXISTS locations (
      id         SERIAL         PRIMARY KEY,
      user_id    INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      latitude   DECIMAL(10, 8) NOT NULL,
      longitude  DECIMAL(11, 8) NOT NULL,
      updated_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
      CONSTRAINT locations_user_id_unique UNIQUE (user_id)
    )
  `;
  console.log('  Tabel locations dibuat.');

  await sql`CREATE INDEX IF NOT EXISTS idx_locations_user_id    ON locations (user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_locations_updated_at ON locations (updated_at DESC)`;
  console.log('  Index dibuat.');

  console.log('\nMigration selesai.');
}

migrate().catch((err) => {
  console.error('Migration gagal:', err);
  process.exit(1);
});

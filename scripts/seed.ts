import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL tidak ditemukan. Buat file .env dari .env.example');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const USERS = [
  { username: 'faizal',  password: 'faizal123',  nama: 'Muhammad Faizal'      },
  { username: 'azmi',    password: 'azmi321',    nama: 'St Nur Azmi Fauziah'  },
  { username: 'fauziah', password: 'fauziah456', nama: 'Fauziah'              },
  { username: 'dilla',   password: 'dilla654',   nama: 'Nur Fadillah'         },
  { username: 'selfira', password: 'selfira789', nama: 'Selfira Ayu Safitri'  },
] as const;

async function seed() {
  console.log('Menjalankan seed database...\n');

  for (const user of USERS) {
    const hash = await bcrypt.hash(user.password, 12);
    await sql`
      INSERT INTO users (username, password_hash, nama)
      VALUES (${user.username}, ${hash}, ${user.nama})
      ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            nama          = EXCLUDED.nama
    `;
    console.log(`  Seeded: ${user.username} -> ${user.nama}`);
  }

  console.log('\nSeed selesai.');
}

seed().catch((err) => {
  console.error('Seed gagal:', err);
  process.exit(1);
});

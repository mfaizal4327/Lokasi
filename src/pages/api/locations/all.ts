import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export const GET: APIRoute = async ({ cookies }) => {
  // Verifikasi token langsung dari cookie (bukan dari locals)
  const token = cookies.get('token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const user = await verifyToken(token);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const sql = getDb();
    const locations = await sql`
      SELECT
        u.id,
        u.username,
        u.nama,
        l.latitude,
        l.longitude,
        l.updated_at
      FROM users u
      INNER JOIN locations l ON u.id = l.user_id
      WHERE l.updated_at > NOW() - INTERVAL '30 minutes'
      ORDER BY u.nama ASC
    `;

    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Fetch locations error:', err);
    return new Response(JSON.stringify({ error: 'Gagal mengambil data lokasi' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

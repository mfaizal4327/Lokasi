import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let latitude: unknown;
  let longitude: unknown;

  try {
    const body = await request.json();
    latitude = body.latitude;
    longitude = body.longitude;
  } catch {
    return new Response(JSON.stringify({ error: 'Body permintaan tidak valid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (typeof latitude !== 'number' || typeof longitude !== 'number' || !isFinite(latitude) || !isFinite(longitude)) {
    return new Response(JSON.stringify({ error: 'Koordinat harus berupa angka yang valid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (latitude < -90 || latitude > 90) {
    return new Response(JSON.stringify({ error: 'Latitude harus antara -90 dan 90' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (longitude < -180 || longitude > 180) {
    return new Response(JSON.stringify({ error: 'Longitude harus antara -180 dan 180' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const sql = getDb();
    await sql`
      INSERT INTO locations (user_id, latitude, longitude, updated_at)
      VALUES (${user.userId}, ${latitude}, ${longitude}, NOW())
      ON CONFLICT (user_id) DO UPDATE
        SET latitude   = EXCLUDED.latitude,
            longitude  = EXCLUDED.longitude,
            updated_at = NOW()
    `;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Location update error:', err);
    return new Response(JSON.stringify({ error: 'Gagal menyimpan lokasi' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

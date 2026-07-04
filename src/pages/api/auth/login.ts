import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../lib/db';
import { signToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  let username = '';
  let password = '';

  const contentType = request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = String(body.username ?? '').trim();
      password = String(body.password ?? '');
    } else {
      const formData = await request.formData();
      username = String(formData.get('username') ?? '').trim();
      password = String(formData.get('password') ?? '');
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Format permintaan tidak valid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Username dan password wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (username.length > 50 || password.length > 128) {
    return new Response(JSON.stringify({ error: 'Username atau password tidak valid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, username, password_hash, nama
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash as string);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = await signToken({
      userId: user.id as number,
      username: user.username as string,
      nama: user.nama as string,
    });

    cookies.set('token', token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

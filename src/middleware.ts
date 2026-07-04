import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';

const PUBLIC_PATHS = new Set(['/', '/login', '/api/auth/login', '/api/auth/logout']);

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (PUBLIC_PATHS.has(pathname)) {
    return next();
  }

  const token = context.cookies.get('token')?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Hapus cookie yang tidak valid/expired agar tidak terjadi redirect loop
    context.cookies.delete('token', { path: '/' });
    return context.redirect('/login');
  }

  context.locals.user = payload;
  return next();
});

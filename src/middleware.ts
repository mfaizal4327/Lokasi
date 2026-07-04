import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';

// Middleware hanya melindungi halaman (bukan API routes)
// API routes verifikasi token sendiri langsung dari cookie
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/api/')) {
    return next();
  }

  const token = context.cookies.get('token')?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    context.cookies.delete('token', { path: '/' });
    return context.redirect('/login');
  }

  context.locals.user = payload;
  return next();
});

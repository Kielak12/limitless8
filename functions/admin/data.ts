
import { ensureSchema, json, unauthorized } from '../../lib/db';
import { readCookie, verifySession } from '../../lib/auth';

export const onRequestGet: PagesFunction = async (ctx) => {
  const { request, env } = ctx;
  const cookie = readCookie(request, 'session');
  const sess = await verifySession(env, cookie);
  if(!sess) return unauthorized();

  await ensureSchema(env);
  const { results } = await env.DB.prepare(`
    SELECT id, created_at, name, email, phone, plan, pages, cms, seo, budget, message, ip 
    FROM quotes 
    ORDER BY datetime(created_at) DESC 
    LIMIT 1000
  `).all<any>();
  return json({items: results || []});
}

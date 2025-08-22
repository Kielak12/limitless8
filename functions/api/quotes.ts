
import { ensureSchema, json, methodNotAllowed } from '../../lib/db';

export const onRequest: PagesFunction = async (ctx) => {
  const { request, env } = ctx;
  if(request.method === 'POST'){
    await ensureSchema(env);
    const data = await request.json().catch(()=> ({}));
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const ua = request.headers.get('User-Agent') || '';
    const stmt = `
      INSERT INTO quotes (name,email,phone,company,website,plan,message,ip,user_agent)
      VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9);
    return json({ok:true, id: res.lastRowId});
  }
  return methodNotAllowed('POST');
}


import { json } from '../../lib/db';
import { createSession, setCookie } from '../../lib/auth';

export const onRequestPost: PagesFunction = async (ctx) => {
  const { request, env } = ctx;
  const { username, password } = await request.json().catch(()=> ({}));
  const u = env.ADMIN_USER || '123';
  const p = env.ADMIN_PASS || '123';
  if(username === u && password === p){
    const token = await createSession(env, username);
    return new Response(JSON.stringify({ok:true}), {
      headers: {
        'Content-Type':'application/json',
        'Set-Cookie': setCookie('session', token, { 'Max-Age': 60*60*12, Secure: '', HttpOnly: '', SameSite:'Strict', Path:'/' })
      }
    });
  }
  return new Response('Unauthorized', {status:401});
}

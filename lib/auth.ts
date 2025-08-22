
// lib/auth.ts — tiny cookie HMAC auth (no DB)
export interface Env {
  ADMIN_USER?: string;
  ADMIN_PASS?: string;
  ADMIN_SECRET?: string;
}

const enc = new TextEncoder();
async function hmac(secret: string, data: string){
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign','verify']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const b = Array.from(new Uint8Array(sig)).map(x=>x.toString(16).padStart(2,'0')).join('');
  return b;
}

function b64url(s: string){ return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function b64urlDecode(s: string){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return atob(s); }

export async function createSession(env: Env, username: string){
  const payload = {u: username, iat: Date.now(), exp: Date.now() + 1000*60*60*12};
  const body = JSON.stringify(payload);
  const sig = await hmac(env.ADMIN_SECRET || 'dev-secret', body);
  return `${b64url(body)}.${sig}`;
}

export async function verifySession(env: Env, cookie: string | null){
  if(!cookie) return null;
  const [b64, sig] = cookie.split('.');
  if(!b64 || !sig) return null;
  const body = b64urlDecode(b64);
  const expect = await hmac(env.ADMIN_SECRET || 'dev-secret', body);
  if(expect !== sig) return null;
  try{
    const payload = JSON.parse(body);
    if(payload.exp && Date.now() > payload.exp) return null;
    return payload;
  }catch{ return null; }
}

export function readCookie(req: Request, name: string){
  const c = req.headers.get('Cookie') || '';
  const m = c.match(new RegExp('(?:^|; )'+name+'=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function setCookie(name: string, value: string, opts: Record<string,string|number|boolean> = {}){
  const parts = [`${name}=${encodeURIComponent(value)}`];
  const def: Record<string,string> = {
    Path: '/', HttpOnly: '', SameSite: 'Strict', Secure: ''
  };
  const all = {...def, ...opts};
  for(const [k,v] of Object.entries(all)){
    if(v === '' || v === true) parts.push(k);
    else parts.push(`${k}=${v}`);
  }
  return parts.join('; ');
}

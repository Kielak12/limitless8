
export const onRequest: PagesFunction = async (ctx) => {
  const { request } = ctx;
  const resp = await ctx.next();
  const headers = new Headers(resp.headers);
  // Basic security and CORS (same-origin)
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  headers.set('Permissions-Policy', 'interest-cohort=()');
  headers.set('Access-Control-Allow-Origin', new URL(request.url).origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if(request.method === 'OPTIONS'){
    return new Response(null, {status:204, headers});
  }
  return new Response(resp.body, {status: resp.status, statusText: resp.statusText, headers});
}

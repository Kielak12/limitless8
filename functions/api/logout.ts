
export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ok:true}), {
    headers: {
      'Content-Type':'application/json',
      'Set-Cookie': 'session=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict'
    }
  });
}

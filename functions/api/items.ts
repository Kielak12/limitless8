
import { json, methodNotAllowed } from '../../lib/db';

export const onRequest: PagesFunction = async (ctx) => {
  const { request } = ctx;
  if(request.method === 'GET'){
    return json({items:[{id:1, name:'hello'}]});
  }
  if(request.method === 'POST'){
    const body = await request.json().catch(()=> ({}));
    return json({ok:true, received: body});
  }
  return methodNotAllowed();
}

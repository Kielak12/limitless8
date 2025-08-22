
import { json } from '../../lib/db';

export const onRequestGet: PagesFunction = async () => {
  return json({ok:true, ts: Date.now()});
}

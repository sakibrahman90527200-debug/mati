import { getChatGPTUser } from '../../../chatgpt-auth';
import { database } from '../../../../lib/registry';
import { checkPurchase } from '../../../../lib/purchase-check.mjs';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
  if(!await getChatGPTUser())return reply({error:'Sign in required'},401);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return reply({error:'Same-origin request required'},403);
  if(Number(request.headers.get('content-length')||0)>8192)return reply({error:'Request too large'},413);
  let input;try{input=await request.json();}catch{return reply({error:'Invalid JSON'},400);}
  if(!input||typeof input.case_id!=='string'||!/^LAND-\d{3}$/.test(input.case_id))return reply({error:'Invalid land reference'},400);
  try{const row=await database().prepare('SELECT payload FROM land_records WHERE id = ?').bind(input.case_id).first<{payload:string}>();if(!row)return reply({error:'Land record not found'},404);const result=checkPurchase(JSON.parse(row.payload),input);return reply({...result,registry_source:'server_database',checked_at:new Date().toISOString()});}catch{return reply({error:'The server registry could not be checked. No purchase result was inferred.'},503);}
}

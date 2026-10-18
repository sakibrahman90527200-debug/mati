import { getChatGPTUser } from '../../chatgpt-auth';
import { readRegistry,initializeRegistry } from '../../../lib/registry';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
  if(!await getChatGPTUser())return reply({error:'Sign in to access the registry'},401);
  try{const registry=await readRegistry();if(!registry.record_count)return reply({error:'REGISTRY_NOT_INITIALIZED'},503);return reply(registry);}catch{return reply({error:'Registry unavailable. No local fallback was used.'},503);}
}
export async function POST(request:Request){
  if(!await getChatGPTUser())return reply({error:'Sign in required'},401);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return reply({error:'Same-origin request required'},403);
  try{return reply(await initializeRegistry());}catch{return reply({error:'Registry initialization failed; existing records preserved'},503);}
}

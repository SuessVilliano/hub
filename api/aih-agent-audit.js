const BASE="https://services.leadconnectorhq.com";
function env(...names){for(const n of names)if(process.env[n])return process.env[n];return""}
async function api(path,version="v3"){
  const token=env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN");
  const r=await fetch(BASE+path,{headers:{Authorization:"Bearer "+token,Accept:"application/json",Version:version}});
  const text=await r.text();let data={};try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
  return {ok:r.ok,status:r.status,data};
}
module.exports=async function handler(req,res){
  const locationId=env("HIGHLEVEL_LOCATION_ID","GHL_LOCATION_ID","LOCATION_ID");
  const flowId="4c634448-74ae-480c-a9c5-99dc7243c46e";
  const voiceId="6abec35db107a43de1333090";
  const [flow,voice,conv,managed]=await Promise.all([
    api("/agent-studio/agent/"+flowId+"?locationId="+encodeURIComponent(locationId)+"&source=public_api"),
    api("/voice-ai/agents/"+voiceId+"?locationId="+encodeURIComponent(locationId)),
    api("/conversation-ai/agents/search?limit=50&query="),
    api("/agent-studio/managed-agents?locationId="+encodeURIComponent(locationId)+"&limit=50&skip=0")
  ]);
  return res.status(200).json({
    flow:{status:flow.status,data:flow.data},
    voice:{status:voice.status,data:voice.data},
    conversation:{status:conv.status,data:conv.data},
    managed:{status:managed.status,data:managed.data}
  });
};
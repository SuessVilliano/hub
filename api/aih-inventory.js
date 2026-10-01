const BASE="https://services.leadconnectorhq.com";
function env(...names){for(const n of names)if(process.env[n])return process.env[n];return""}
async function api(path,version="v3"){
  const token=env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN");
  const r=await fetch(BASE+path,{headers:{Authorization:"Bearer "+token,Accept:"application/json",Version:version}});
  const text=await r.text();let data={};try{data=text?JSON.parse(text):{}}catch{data={}}
  return {ok:r.ok,status:r.status,data};
}
function pick(arr,keys){return (arr||[]).map(x=>Object.fromEntries(keys.map(k=>[k,x?.[k]]).filter(([,v])=>v!==undefined)))}
module.exports=async function handler(req,res){
  if(req.method!=="GET")return res.status(405).json({ok:false});
  const locationId=env("HIGHLEVEL_LOCATION_ID","GHL_LOCATION_ID","LOCATION_ID");
  if(!locationId)return res.status(500).json({ok:false,error:"missing location"});
  const [cal,pipes,wf,voice,flow,managed,widgets,services,serviceLocations]=await Promise.all([
    api("/calendars/?locationId="+encodeURIComponent(locationId)),
    api("/opportunities/pipelines?locationId="+encodeURIComponent(locationId)),
    api("/workflows/?locationId="+encodeURIComponent(locationId)),
    api("/voice-ai/agents?locationId="+encodeURIComponent(locationId)+"&page=1&pageSize=50"),
    api("/agent-studio/agent?locationId="+encodeURIComponent(locationId)+"&limit=50&offset=0"),
    api("/agent-studio/managed-agents?locationId="+encodeURIComponent(locationId)+"&limit=50&skip=0"),
    api("/chat-widget/list?locationId="+encodeURIComponent(locationId)+"&offset=0&limit=100"),
    api("/calendars/services/catalog?locationId="+encodeURIComponent(locationId)),
    api("/calendars/services/locations?locationId="+encodeURIComponent(locationId))
  ]);
  return res.status(200).json({
    calendars:{status:cal.status,items:pick(cal.data?.calendars,["id","name","calendarType","slug","widgetSlug","isActive","teamMembers"])},
    pipelines:{status:pipes.status,items:pick(pipes.data?.pipelines||pipes.data,["id","name","stages"])},
    workflows:{status:wf.status,items:pick(wf.data?.workflows,["id","name","status","version"])},
    voiceAgents:{status:voice.status,items:pick(voice.data?.agents,["id","agentName","inboundNumber","language","timezone"])},
    flowAgents:{status:flow.status,items:pick(flow.data?.agents||flow.data?.data,["agentId","id","name","description","status"])},
    managedAgents:{status:managed.status,items:pick(managed.data?.agents,["id","name","description","publishedVersionId"])},
    chatWidgets:{status:widgets.status,items:pick(widgets.data?.chatWidgets,["_id","name","chatType","default","creationSource"])},
    services:{status:services.status,items:pick(services.data?.services,["id","name","slug","serviceDuration","serviceDurationUnit","isPrivate"])},
    serviceLocations:{status:serviceLocations.status,items:pick(serviceLocations.data?.serviceLocations,["id","name","slug","address","phone"])}
  });
};
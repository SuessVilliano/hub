const BASE="https://services.leadconnectorhq.com";
function env(...n){for(const x of n)if(process.env[x])return process.env[x];return""}
module.exports=async function handler(req,res){
 const token=env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN");
 const locationId=env("HIGHLEVEL_LOCATION_ID","GHL_LOCATION_ID","LOCATION_ID");
 if(!token||!locationId)return res.status(500).json({ok:false});
 const r=await fetch(BASE+"/locations/"+encodeURIComponent(locationId)+"/customValues",{headers:{Authorization:"Bearer "+token,Accept:"application/json",Version:"v3"}});
 const t=await r.text();let data={};try{data=JSON.parse(t)}catch{data={raw:t}}
 const vals=(data.customValues||[]).filter(x=>/portal|client|login|community|member/i.test((x.name||"")+" "+(x.value||"")));
 return res.status(r.status).json({ok:r.ok,values:vals.map(x=>({name:x.name,value:x.value,fieldKey:x.fieldKey}))});
};
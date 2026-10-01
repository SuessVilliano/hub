const BASE="https://services.leadconnectorhq.com";
function env(...n){for(const x of n)if(process.env[x])return process.env[x];return""}
module.exports=async function handler(req,res){
  const token=env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN");
  const locationId=env("HIGHLEVEL_LOCATION_ID","GHL_LOCATION_ID","LOCATION_ID");
  const r=await fetch(BASE+"/phone-system/numbers/location/"+encodeURIComponent(locationId)+"?pageSize=100&page=0&skipNumberPool=false",{
    headers:{Authorization:"Bearer "+token,Accept:"application/json",version:"v3"}
  });
  const t=await r.text();let data={};try{data=t?JSON.parse(t):{}}catch{data={raw:t}}
  const numbers=data?.data?.numbers||data?.numbers||[];
  return res.status(r.status).json({ok:r.ok,numbers:numbers.map(n=>({phoneNumber:n.phoneNumber,friendlyName:n.friendlyName,countryCode:n.countryCode,capabilities:n.capabilities,numberPoolId:n.numberPoolId}))});
};
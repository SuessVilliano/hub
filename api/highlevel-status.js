const BASE="https://services.leadconnectorhq.com";
function env(...names){for(const n of names)if(process.env[n])return process.env[n];return""}
module.exports=async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({ok:false});
  const token=env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN");
  const locationId=env("HIGHLEVEL_LOCATION_ID","GHL_LOCATION_ID","LOCATION_ID");
  if(!token||!locationId) return res.status(200).json({ok:false,configured:false,token:!!token,locationId:!!locationId});
  try{
    const r=await fetch(BASE+"/locations/"+encodeURIComponent(locationId),{
      headers:{Authorization:"Bearer "+token,Accept:"application/json",Version:"2021-07-28"}
    });
    const text=await r.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{}
    return res.status(r.ok?200:502).json({ok:r.ok,configured:true,status:r.status,locationName:data?.location?.name||data?.name||null});
  }catch(e){
    return res.status(500).json({ok:false,configured:true,error:"Connection test failed"});
  }
};
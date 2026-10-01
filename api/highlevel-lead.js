const BASE = "https://services.leadconnectorhq.com";

function env(...names) {
  for (const name of names) if (process.env[name]) return process.env[name];
  return "";
}
function safeTag(value="") {
  return String(value).trim().replace(/[^a-zA-Z0-9 -]/g,"").replace(/\s+/g,"-").slice(0,45);
}
async function ghl(path, options={}) {
  const token=env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN");
  if(!token) throw new Error("HighLevel PIT token is not configured");
  const response=await fetch(BASE+path,{
    ...options,
    headers:{
      "Authorization":`Bearer ${token}`,
      "Accept":"application/json",
      "Content-Type":"application/json",
      "Version":"v3",
      ...(options.headers||{})
    }
  });
  const text=await response.text();
  let data={};
  try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
  if(!response.ok){
    const err=new Error(data?.message||data?.error||`HighLevel request failed (${response.status})`);
    err.status=response.status;err.detail=data;throw err;
  }
  return data;
}

module.exports=async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({ok:false,error:"Method not allowed"});
  const locationId=env("HIGHLEVEL_LOCATION_ID","GHL_LOCATION_ID","LOCATION_ID");
  if(!locationId) return res.status(500).json({ok:false,error:"HighLevel location ID is not configured"});

  const b=typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{});
  const name=String(b.name||"").trim();
  const email=String(b.email||"").trim();
  const phone=String(b.phone||"").trim();
  if(!name || (!email && !phone)) return res.status(400).json({ok:false,error:"Name and email or phone are required"});

  const parts=name.split(/\s+/);
  const firstName=parts.shift()||name;
  const lastName=parts.join(" ");
  const kind=String(b.kind||"project").toLowerCase();
  const interest=String(b.interest||b.event||"General Inquiry");
  const source=kind==="interest"?"AIH Website - Event / Founding Access":"AIH Website - Project Intake";

  try{
    const contactResult=await ghl("/contacts/upsert",{
      method:"POST",
      body:JSON.stringify({
        firstName,lastName,name,email:email||undefined,phone:phone||undefined,
        companyName:String(b.company||"").trim()||undefined,
        website:String(b.website||"").trim()||undefined,
        locationId,source,country:"US",createNewIfDuplicateAllowed:false
      })
    });
    const contact=contactResult.contact||{};
    const contactId=contact.id;
    if(!contactId) throw new Error("HighLevel did not return a contact ID");

    const tags=["AIH-Website",kind==="interest"?"AIH-Event":"AIH-New-Lead"];
    if(kind==="interest") tags.push("AIH-Founding-Access");
    const serviceTag=safeTag(interest);
    if(serviceTag) tags.push("AIH-"+serviceTag);

    try{
      await ghl(`/contacts/${encodeURIComponent(contactId)}/tags`,{
        method:"POST",body:JSON.stringify({tags:[...new Set(tags)]})
      });
    }catch(e){ console.error("AIH tag warning:",e.message); }

    const details=[
      `AIH Website Inquiry`,
      `Type: ${kind}`,
      `Interest: ${interest}`,
      b.message?`Project context: ${String(b.message).slice(0,3500)}`:"",
      b.timeline?`Timeline: ${b.timeline}`:"",
      b.company?`Company: ${b.company}`:"",
      b.website?`Website: ${b.website}`:"",
      `Consent to contact: ${b.consent?"Yes":"Not explicitly checked"}`
    ].filter(Boolean).join("\n");

    try{
      await ghl(`/contacts/${encodeURIComponent(contactId)}/notes`,{
        method:"POST",body:JSON.stringify({title:"AIH Website Intake",body:details,pinned:false})
      });
    }catch(e){ console.error("AIH note warning:",e.message); }

    let pipelineId=env("AIH_PIPELINE_ID","HIGHLEVEL_PIPELINE_ID");
    let stageId=env("AIH_PIPELINE_STAGE_NEW_ID","HIGHLEVEL_PIPELINE_STAGE_ID");
    let opportunityCreated=false;
    if(!pipelineId){
      try{
        const pipes=await ghl("/opportunities/pipelines?locationId="+encodeURIComponent(locationId));
        const list=pipes.pipelines||pipes||[];
        const p=Array.isArray(list)?list.find(x=>(x.name||"").toLowerCase()==="aih revenue pipeline"):null;
        if(p){
          pipelineId=p.id;
          const s=(p.stages||[]).find(x=>(x.name||"").toLowerCase()==="new inquiry");
          stageId=s?.id||stageId;
        }
      }catch(e){ console.error("AIH pipeline discovery warning:",e.message); }
    }
    if(pipelineId && kind==="project"){
      try{
        await ghl("/opportunities/",{
          method:"POST",
          body:JSON.stringify({
            pipelineId,locationId,pipelineStageId:stageId||undefined,
            name:`${name} — ${interest}`,status:"open",contactId,
            source:"AIH Website"
          })
        });
        opportunityCreated=true;
      }catch(e){ console.error("AIH opportunity warning:",e.message); }
    }

    return res.status(200).json({ok:true,contactId,newContact:!!contactResult.new,opportunityCreated});
  }catch(error){
    console.error("AIH HighLevel lead error:",error.message,error.detail||"");
    return res.status(error.status||500).json({ok:false,error:error.message||"Unable to save inquiry"});
  }
};
const BASE="https://services.leadconnectorhq.com";
function env(...n){for(const x of n)if(process.env[x])return process.env[x];return""}
module.exports=async function handler(req,res){
  const token=env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN");
  const locationId=env("HIGHLEVEL_LOCATION_ID","GHL_LOCATION_ID","LOCATION_ID");
  if(!token||!locationId)return res.status(500).json({ok:false,error:"missing env"});
  const message=`Act as AIH Operations Director and build the automation foundation for Applied Innovations Hub inside this HighLevel sub-account.

IMPORTANT: Create the following workflows as DRAFTS ONLY. Do not publish them, do not send messages, and do not enroll contacts yet. We will activate only after sender/domain and consent review.

Use the existing AIH Revenue Pipeline, AIH Partnerships + Government pipeline, AIH tags, Discovery Call calendar, and existing custom fields.

Create these draft workflows:
1. AIH – New Inquiry Follow-Up
2. AIH – Missed Call Rescue
3. AIH – Discovery Call Lifecycle
4. AIH – Lead Reactivation
5. AIH – Event / Workshop Interest
6. AIH – Proposal Decision Follow-Up
7. AIH – Government / Teaming Intake
8. AIH – Won / Onboarding
9. AIH – Review / Reputation
10. AIH – Not Now / Nurture

For each workflow, make the logic outcome-first, concise, opt-out respectful, and aligned with AIH positioning. Use the existing Discovery Call calendar for qualified meetings. Do not invent pricing, facility availability, government credentials, event dates, or email sender details.

Also create or update internal notes describing the intended trigger, major actions, and activation prerequisites if your tools support it.

If your CRM tools do NOT support creating workflows, do not simulate success. Tell me exactly which requested changes you were able to make, which tools fired, and what must still be created manually.`;
  const r=await fetch(BASE+"/agent-studio/managed-agents/4c634448-74ae-480c-a9c5-99dc7243c46e/execute",{
    method:"POST",
    headers:{
      Authorization:"Bearer "+token,
      Accept:"application/json",
      "Content-Type":"application/json",
      Version:"v3",
      "Idempotency-Key":"aih-workflow-build-v1"
    },
    body:JSON.stringify({locationId,message})
  });
  const text=await r.text();let data={};try{data=JSON.parse(text)}catch{data={raw:text}}
  return res.status(r.status).json({ok:r.ok,status:r.status,data});
};
const BASE="https://services.leadconnectorhq.com";
function env(...n){for(const x of n)if(process.env[x])return process.env[x];return""}
async function api(path,{method="GET",body}={}){
  const token=env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN");
  const r=await fetch(BASE+path,{
    method,
    headers:{Authorization:"Bearer "+token,Accept:"application/json","Content-Type":"application/json",Version:"v3"},
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const t=await r.text();let data={};try{data=t?JSON.parse(t):{}}catch{data={raw:t}}
  return {ok:r.ok,status:r.status,data};
}
module.exports=async function handler(req,res){
  if(req.method!=="GET")return res.status(405).json({ok:false});
  const agentId="K7cZMrwJFEBY9Ip9ytqN";
  const list=await api("/conversation-ai/agents/"+agentId+"/actions");
  const arr=list.data?.data||list.data?.actions||[];
  const names=new Set((Array.isArray(arr)?arr:[]).map(x=>x.name));
  const results=[];

  async function add(name,type,details){
    if(names.has(name)){results.push({name,created:false,reason:"exists"});return;}
    const r=await api("/conversation-ai/agents/"+agentId+"/actions",{method:"POST",body:{type,name,details}});
    results.push(r.ok?{name,created:true,data:r.data}:{name,created:false,status:r.status,error:r.data});
  }

  await add("Book AIH Discovery Call","appointmentBooking",{
    calendarId:"fXIMmcl2IcRjvFLvsRsN",
    onlySendLink:false,
    triggerWorkflow:false,
    sleepAfterBooking:false,
    transferBot:false,
    rescheduleEnabled:true,
    cancelEnabled:true
  });

  await add("Escalate to AIH Human","humanHandOver",{
    enabled:true,
    triggerCondition:"When the visitor asks for a human, requests pricing/proposal/contract terms, is upset, or the opportunity is high-value, sensitive, public-sector, acquisition-related, compliance-related, technically complex, or outside the agent's verified knowledge.",
    assignToUserId:"XmdvrxbiwPcj2GOxU97i",
    skipAssignToUser:false,
    createTask:true,
    reactivateEnabled:true,
    sleepTimeUnit:"hours",
    sleepTime:24,
    finalMessage:"I’m bringing a member of the Applied Innovations Hub team into this so you get the right answer.",
    tags:["AIH-Qualified"],
    handoverType:"custom"
  });

  const fields=[
    ["Capture Business Problem","X1dBRlex8BeEZZIK8mx2","Capture the prospect's primary business constraint or problem in concise plain language.",["Slow lead response is losing opportunities","Operations are too manual and disconnected","Need to launch a customer portal"]],
    ["Capture Desired Outcome","mDNcw6fay8uAOQ7asLXY","Capture the measurable or practical outcome the prospect wants.",["Respond to every lead within minutes","Reduce manual operations","Launch an MVP for customers"]],
    ["Capture Timeline","T8ia8saVsnKa2Ea95mhc","Capture when the prospect wants the change, project, or decision completed.",["Within 30 days","This quarter","Before an acquisition closes"]],
    ["Capture AIH Interest","7eEVrMAieNdBytSIYvFk","Classify the best-fit AIH capability or outcome based on the conversation.",["Revenue Infrastructure","Managed Digital Workforce","Full-Stack Product Engineering","Enterprise Finance + Advisory","Business Acquisition + Integration"]],
    ["Capture Managed Agent Role","apHkrW2Anp49jU4PUpPh","When managed agents are discussed, capture the job or role the prospect wants AI to augment.",["Receptionist","Sales coordinator","Operations coordinator","Research analyst"]],
    ["Capture Acquisition Context","kmpRUc7zDqR36fIwBmYx","When acquisition/advisory is discussed, summarize the buyer/seller/operator context and support needed.",["Buyer needs technology diligence","Owner preparing business for sale","Post-close systems integration"]]
  ];
  for(const [name,id,description,examples] of fields){
    await add(name,"updateContactField",{contactFieldId:id,description,contactUpdateExamples:examples});
  }

  return res.status(200).json({ok:true,existingCount:Array.isArray(arr)?arr.length:0,results});
};
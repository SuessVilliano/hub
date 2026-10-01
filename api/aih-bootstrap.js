const BASE="https://services.leadconnectorhq.com";

function env(...names){ for(const n of names){ if(process.env[n]) return process.env[n]; } return ""; }
function token(){ return env("HIGHLEVEL_PIT_TOKEN","GHL_PIT_TOKEN","HIGHLEVEL_TOKEN","GHL_TOKEN","PIT_TOKEN"); }
function loc(){ return env("HIGHLEVEL_LOCATION_ID","GHL_LOCATION_ID","LOCATION_ID"); }

async function api(path,{method="GET",body,version="v3"}={}){
  const r=await fetch(BASE+path,{
    method,
    headers:{
      Authorization:"Bearer "+token(),
      Accept:"application/json",
      "Content-Type":"application/json",
      Version:version
    },
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const txt=await r.text();
  let data={}; try{ data=txt?JSON.parse(txt):{} }catch{ data={raw:txt}; }
  return {ok:r.ok,status:r.status,data};
}

function brief(r){ return {ok:r.ok,status:r.status,data:r.data}; }

async function ensurePipeline(name,stageNames){
  const current=await api("/opportunities/pipelines?locationId="+encodeURIComponent(loc()));
  const list=current.data?.pipelines||current.data||[];
  const found=Array.isArray(list)?list.find(x=>(x.name||"").toLowerCase()===name.toLowerCase()):null;
  if(found) return {created:false,pipeline:found};
  const body={
    name,
    stages:stageNames.map((s,i)=>({name:s,position:i+1,showInFunnel:true})),
    showInFunnel:true,
    showInPieChart:true,
    useOpportunityProbability:false,
    locationId:loc(),
    colorRenderMode:"dot"
  };
  const made=await api("/opportunities/pipelines",{method:"POST",body});
  return made.ok?{created:true,pipeline:made.data}:{created:false,error:brief(made)};
}

async function ensureTags(names){
  const existing=await api("/locations/"+encodeURIComponent(loc())+"/tags");
  const list=existing.data?.tags||[];
  const have=new Map(list.map(x=>[(x.name||"").toLowerCase(),x]));
  const out=[];
  for(const name of names){
    if(have.has(name.toLowerCase())){ out.push({name,created:false,id:have.get(name.toLowerCase()).id}); continue; }
    const r=await api("/locations/"+encodeURIComponent(loc())+"/tags",{method:"POST",body:{name}});
    out.push(r.ok?{name,created:true,id:r.data?.tag?.id||r.data?.id}:{name,created:false,error:brief(r)});
  }
  return out;
}

async function ensureFields(fields){
  const existing=await api("/locations/"+encodeURIComponent(loc())+"/customFields?model=contact");
  const list=existing.data?.customFields||[];
  const have=new Map(list.map(x=>[(x.name||"").toLowerCase(),x]));
  const out=[];
  for(let i=0;i<fields.length;i++){
    const f=fields[i];
    if(have.has(f.name.toLowerCase())){ const x=have.get(f.name.toLowerCase()); out.push({name:f.name,created:false,id:x.id,fieldKey:x.fieldKey}); continue; }
    const r=await api("/locations/"+encodeURIComponent(loc())+"/customFields",{method:"POST",body:{name:f.name,dataType:f.dataType||"TEXT",model:"contact",position:100+i,placeholder:f.placeholder||""}});
    const x=r.data?.customField||r.data;
    out.push(r.ok?{name:f.name,created:true,id:x?.id,fieldKey:x?.fieldKey}:{name:f.name,created:false,error:brief(r)});
  }
  return out;
}

async function ensureChatWidget(){
  const list=await api("/chat-widget/list?locationId="+encodeURIComponent(loc())+"&offset=0&limit=100");
  const widgets=list.data?.chatWidgets||[];
  const found=widgets.find(x=>(x.name||"").toLowerCase()==="aih website concierge");
  if(found) return {created:false,widget:found};
  const body={
    version:2,
    chatType:"liveChat",
    name:"AIH Website Concierge",
    locationId:loc(),
    deleted:false,
    default:true,
    settings:{
      promptType:"avatar",
      locale:"en-us",
      heading:"Applied Innovations Hub",
      subHeading:"What business problem are you trying to solve?",
      widgetPrimaryColor:"#5B8CFF",
      chatIcon:"messageChatCircle",
      showPrompt:true,
      promptMsg:"Have a business constraint worth solving? Start here.",
      revisitPromptMsg:"Welcome back. What are you working on now?",
      showLiveChatWelcomeMsg:true,
      liveChatIntroMsg:"Welcome to Applied Innovations Hub. What is the biggest business problem or opportunity you are trying to solve right now?",
      liveChatAckMsg:"Got it. Let me understand the outcome you're after.",
      liveChatEndedMsg:"Thanks for talking with Applied Innovations Hub.",
      liveChatUserInactiveMsg:"Still there? I can also help you book an AIH Discovery Call.",
      liveChatUserInactiveTime:"5 minutes",
      liveChatVisitorInactiveMsg:"No problem — come back anytime or book a Discovery Call when you're ready.",
      liveChatVisitorInactiveTime:"10 minutes",
      showConsentCheckbox:true,
      legalMsg:"By submitting, you agree to receive communications related to your inquiry. Reply STOP to opt out of SMS.",
      sendActionText:"Send",
      successMsg:"Thanks — your message was received.",
      thankYouMsg:"Research. Build. Deploy.",
      showAgencyBranding:false,
      widgetPlacement:"bottom-right",
      loadStrategy:"interaction",
      theme:{name:"blue"}
    }
  };
  const r=await api("/chat-widget/",{method:"POST",body});
  return r.ok?{created:true,widget:r.data}:{created:false,error:brief(r)};
}

async function updateConversationAgent(){
  const search=await api("/conversation-ai/agents/search?limit=50&query=AIH%20Concierge");
  const agents=search.data?.agents||[];
  const agent=agents.find(x=>(x.name||"").toLowerCase()==="aih concierge")||agents[0];
  if(!agent) return {ok:false,error:"AIH Concierge not found"};

  const fullPrompt=`You are AIH Concierge for Applied Innovations Hub. Start with the business outcome, not the tool. Your job is to understand the visitor's constraint, ask one useful question at a time, capture qualified context, recommend the smallest useful next step, and book an AIH Discovery Call when appropriate.

AIH helps organizations: capture more demand; reduce operating drag; launch new products; improve margin and visibility; modernize systems; prepare for growth or acquisition; execute larger contracts; and build managed digital workforces.

AIH can deliver full-stack apps/SaaS, business ecosystem architecture, AI and managed agents, CRM/revenue infrastructure, applied R&D, data/decision systems, commerce/fulfillment/logistics, public-sector/teaming solutions, training, executive finance/project economics, infrastructure advisory, and acquisition/integration support.

Do not lead with 'chatbot', 'AI employee', 'CRM', or 'automation' unless the visitor asked for it. Translate technology into outcomes. Ask questions such as: What is the biggest constraint right now? What happens today? Where does it break? What is the business impact? What outcome matters most? How soon does this need to change?

For managed agents, determine the job, responsibilities, knowledge, tools/actions, human handoff, guardrails, and success metric.
For acquisitions, determine whether they are buyer/seller/operator, business type, decision being made, timeline, and whether they need financial, operating, technology, diligence, integration, or growth support.
For government/team work, ask organization type, capability required, opportunity ID if available, and timeline.

When the person wants pricing, a proposal, a demo, a custom scope, partnership, enterprise advisory, acquisition support, or has a real project, offer the AIH Discovery Call.

Never invent pricing, promise results, claim the planned Delaware facility is open, claim unverified certifications, or provide legal/tax/securities/medical/investment advice. AIH uses HighLevel as core operating infrastructure and extends it with custom technology where needed. Escalate uncertainty or sensitive/high-value matters to a human.`;

  const update=await api("/conversation-ai/agents/"+encodeURIComponent(agent.id),{
    method:"PUT",
    body:{
      name:"AIH Concierge",
      businessName:"Applied Innovations Hub",
      mode:"auto-pilot",
      channels:["SMS","WebChat","Live_Chat","Email"],
      isPrimary:true,
      waitTime:8,
      waitTimeUnit:"seconds",
      autoPilotMaxMessages:15,
      goal:"Diagnose the business constraint, capture qualified context, and move legitimate opportunities to the right AIH next step.",
      personality:"Professional, warm, concise, consultative, operator-minded, outcome-first.",
      instructions:"Ask one useful question at a time. Lead with outcomes, not tools. Escalate uncertainty and high-value or sensitive matters.",
      fullPrompt
    }
  });

  const actions=await api("/conversation-ai/agents/"+encodeURIComponent(agent.id)+"/actions");
  const arr=actions.data?.data||actions.data?.actions||[];
  let bookingAction=Array.isArray(arr)?arr.find(x=>x.type==="appointmentBooking"):null;
  let actionResult={existing:!!bookingAction};
  if(!bookingAction){
    const r=await api("/conversation-ai/agents/"+encodeURIComponent(agent.id)+"/actions",{
      method:"POST",
      body:{
        type:"appointmentBooking",
        name:"Book AIH Discovery Call",
        details:{
          calendarId:"fXIMmcl2IcRjvFLvsRsN",
          onlySendLink:false,
          triggerWorkflow:false,
          workflowIds:[],
          sleepAfterBooking:true
        }
      }
    });
    actionResult=r.ok?{created:true,data:r.data}:{created:false,error:brief(r)};
  }
  return {agentId:agent.id,update:brief(update),bookingAction:actionResult};
}

async function updateVoiceAgent(){
  const id="6abec35db107a43de1333090";
  const prompt=`You are AIH Voice Concierge for Applied Innovations Hub. Start with the caller's business outcome, not a technology pitch.

Your mission: understand why they called, identify the real constraint, qualify legitimate opportunities, capture useful context, and book qualified callers on the AIH Discovery Call.

AIH helps organizations capture more demand, reduce operating drag, launch products, improve margin and visibility, modernize systems, prepare for growth or acquisition, execute larger contracts, and deploy managed digital workforces. Delivery capabilities include full-stack software, AI/managed agents, ecosystem architecture, R&D, data/decision systems, commerce/fulfillment/logistics, public-sector execution, training, executive finance/project economics, infrastructure advisory, and acquisition/integration support.

Opening: "Thanks for calling Applied Innovations Hub. What business problem or opportunity are you trying to solve today?"

Ask one question at a time. Good questions: What is happening today? Where does it break? What is the business impact? What outcome matters most? How soon do you need it changed?

For managed AI roles, determine the job function, responsibilities, knowledge, actions, handoff rules, and success metric.
For acquisition/advisory calls, determine whether they are buyer, seller, owner, operator, or advisor; business type; decision needed; timeline; and whether support is financial, operational, technology, diligence, integration, or growth.
For government/team opportunities, capture organization type, required capability, opportunity/solicitation ID if available, and timeline.

When qualified: "That sounds like something our team should scope with you directly. I can help you reserve an AIH Discovery Call."

Collect name, company, email, phone, main constraint, desired outcome, and timeline. Save useful notes.

Never invent pricing, guarantee results, claim the planned Delaware facility is operational, claim unverified government credentials, or provide legal/tax/securities/medical/investment advice. Honor DND/opt-out. Escalate sensitive, uncertain, urgent, high-value, compliance, government, partnership, or complex matters to a human.`;
  const r=await api("/voice-ai/agents/"+id+"?locationId="+encodeURIComponent(loc()),{
    method:"PATCH",
    version:"2023-02-21",
    body:{
      agentName:"AIH Voice Concierge",
      businessName:"Applied Innovations Hub",
      welcomeMessage:"Thanks for calling Applied Innovations Hub. What business problem or opportunity are you trying to solve today?",
      agentPrompt:prompt
    }
  });
  return brief(r);
}

async function publishOperationsDirector(){
  const agentId="4c634448-74ae-480c-a9c5-99dc7243c46e";
  const get=await api("/agent-studio/agent/"+agentId+"?locationId="+encodeURIComponent(loc())+"&source=public_api");
  const versions=get.data?.agent?.versions||[];
  if(versions.some(v=>v.state==="prod"&&v.isPublished)) return {published:false,reason:"already published",version:versions.find(v=>v.state==="prod")};
  const draft=versions.find(v=>(v.state==="staging"||v.state==="draft")&&!v.isPublished);
  if(!draft) return {published:false,reason:"no staging version found"};
  const r=await api("/agent-studio/agent/versions/"+encodeURIComponent(draft.versionId||draft.id)+"/publish?source=public_api",{
    method:"POST",
    body:{locationId:loc(),userName:"AIH System"}
  });
  return r.ok?{published:true,data:r.data}:{published:false,error:brief(r)};
}

async function ensureWorkflowDrafts(){
  const existing=await api("/workflows/?locationId="+encodeURIComponent(loc()));
  const list=existing.data?.workflows||[];
  const specs=[
    ["AIH – New Inquiry Follow-Up","Hi {{contact.first_name}}, thanks for reaching out to Applied Innovations Hub. We received your inquiry. What outcome matters most right now — growth, operations, a product build, acquisition/integration, or something else?"],
    ["AIH – Missed Call Rescue","Hi {{contact.first_name}}, this is Applied Innovations Hub. Sorry we missed you. What business problem or opportunity were you calling about?"],
    ["AIH – Discovery Call Confirmation Follow-Up","Hi {{contact.first_name}}, you're on the AIH calendar. If there's anything specific you want us to review before the call, reply here and send it over."],
    ["AIH – Lead Reactivation","Hi {{contact.first_name}}, checking back from Applied Innovations Hub. Is the problem you originally reached out about still something you're trying to solve?"],
    ["AIH – Event / Workshop Interest","Hi {{contact.first_name}}, thanks for your interest in an AIH lab or workshop. What are you hoping to learn or build?"],
    ["AIH – Proposal Decision Follow-Up","Hi {{contact.first_name}}, following up from Applied Innovations Hub. Any questions or changes we should account for before deciding the next step?"],
    ["AIH – Government / Teaming Intake","Hi {{contact.first_name}}, thanks for reaching out to Applied Innovations Hub about teaming or contract support. If you have an opportunity or solicitation number, reply with it here."]
  ];
  const out=[];
  for(const [name,msg] of specs){
    const found=list.find(x=>(x.name||"").toLowerCase()===name.toLowerCase());
    if(found){ out.push({name,created:false,id:found.id,status:found.status}); continue; }
    const def={
      name,
      source:{system:"api"},
      triggers:[],
      triggerRelation:"or",
      actions:[{id:"send-sms",type:"sms",name:"Send AIH SMS",attributes:{body:msg}}],
      edges:[],
      folderName:"AIH Automations",
      createFolderIfMissing:true
    };
    const r=await api("/workflows/?locationId="+encodeURIComponent(loc()),{method:"POST",body:def});
    out.push(r.ok?{name,created:true,id:r.data?.workflowId,status:r.data?.status,warnings:r.data?.warnings}:{name,created:false,error:brief(r)});
  }
  return out;
}

module.exports=async function handler(req,res){
  if(req.method!=="POST" && req.method!=="GET") return res.status(405).json({ok:false,error:"Unsupported method"});
  if(!token()||!loc()) return res.status(500).json({ok:false,error:"HighLevel env vars missing"});

  const results={};
  results.revenuePipeline=await ensurePipeline("AIH Revenue Pipeline",[
    "New Inquiry","Contacted","Qualified","Discovery Scheduled","Discovery Completed","Scope / Proposal","Decision Pending","Won","Onboarding","Active Project","Recurring / Managed","Not Now / Nurture","Lost"
  ]);
  results.partnerPipeline=await ensurePipeline("AIH Partnerships + Government",[
    "New Opportunity","Capability Match","Researching Requirements","Teaming / Subcontract Discussion","Bid / Proposal In Progress","Submitted","Awarded","Not Awarded","Future Follow-Up"
  ]);

  results.tags=await ensureTags([
    "AIH-New-Lead","AIH-Website","AIH-Chat","AIH-Voice","AIH-Referral","AIH-Event","AIH-Founding-Access","AIH-Transformation-Blueprint","AIH-Managed-Agent","AIH-App-Build","AIH-Ecosystem","AIH-RnD","AIH-Fulfillment","AIH-Logistics","AIH-Government","AIH-Enterprise-Advisory","AIH-Acquisition","AIH-Partner","AIH-Qualified","AIH-Proposal","AIH-Won","AIH-Nurture"
  ]);

  results.fields=await ensureFields([
    {name:"AIH Service Interest",dataType:"TEXT",placeholder:"Primary AIH area"},
    {name:"Primary Business Problem",dataType:"TEXT",placeholder:"What is the constraint?"},
    {name:"Desired Outcome",dataType:"TEXT",placeholder:"What should change?"},
    {name:"Urgency / Timeline",dataType:"TEXT",placeholder:"When is this needed?"},
    {name:"Lead Score",dataType:"TEXT",placeholder:"Low / Medium / High"},
    {name:"Sales Readiness",dataType:"TEXT",placeholder:"Discovery / Qualified / Ready"},
    {name:"Lead Source Detail",dataType:"TEXT",placeholder:"Source context"},
    {name:"Event Name",dataType:"TEXT",placeholder:"Workshop/event"},
    {name:"Government / Prime / Subcontractor Type",dataType:"TEXT",placeholder:"Government relationship"},
    {name:"Contract / Opportunity ID",dataType:"TEXT",placeholder:"Solicitation or opportunity"},
    {name:"Voice AI Summary",dataType:"TEXT",placeholder:"Voice conversation summary"},
    {name:"Chat AI Summary",dataType:"TEXT",placeholder:"Chat conversation summary"},
    {name:"Human Follow-Up Required",dataType:"TEXT",placeholder:"Yes / No"},
    {name:"Acquisition / Advisory Context",dataType:"TEXT",placeholder:"Deal/advisory context"},
    {name:"Managed Agent Role",dataType:"TEXT",placeholder:"Job role to augment"}
  ]);

  results.chatWidget=await ensureChatWidget();
  results.conversationAgent=await updateConversationAgent();
  results.voiceAgent=await updateVoiceAgent();
  results.operationsDirector=await publishOperationsDirector();
  results.workflowDrafts=await ensureWorkflowDrafts();

  return res.status(200).json({ok:true,locationId:loc(),results});
};
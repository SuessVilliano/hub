(() => {
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const root=document.documentElement;
  const body=document.body;
  const HL=window.AIH_HIGHLEVEL||{};
  const BOOKING_URL=HL.bookingUrl||'https://speakwith.us/jamaurjohnson';

  // Native HighLevel chat takeover: once location/widget IDs are supplied,
  // the production HighLevel widget replaces the temporary AIH website assistant.
  const mountNativeHighLevelChat=()=>{
    if(!HL.useNativeChat||!HL.chatWidgetId||!HL.locationId)return false;
    const mount=document.createElement('div');
    mount.setAttribute('data-chat-widget','');
    mount.setAttribute('data-widget-id',HL.chatWidgetId);
    mount.setAttribute('data-location-id',HL.locationId);
    document.body.appendChild(mount);
    const s=document.createElement('script');
    s.src='https://widgets.leadconnectorhq.com/loader.js';
    s.dataset.resourcesUrl='https://widgets.leadconnectorhq.com/chat-widget/loader.js';
    s.dataset.widgetId=HL.chatWidgetId;
    s.async=true;
    document.body.appendChild(s);
    document.documentElement.classList.add('native-highlevel-chat');
    return true;
  };

  const replaceWithHighLevelForm=(selector,url,title)=>{
    if(!url)return false;
    const form=document.querySelector(selector);
    if(!form)return false;
    const frame=document.createElement('iframe');
    frame.src=url;
    frame.title=title;
    frame.loading='lazy';
    frame.className='highlevel-form-frame';
    frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
    form.replaceWith(frame);
    return true;
  };

  mountNativeHighLevelChat();

  // Loader
  const loader=$('#loader');
  const finishLoader=()=>setTimeout(()=>loader?.classList.add('done'),260);
  if(document.readyState==='complete') finishLoader();
  else window.addEventListener('load',finishLoader,{once:true});
  setTimeout(finishLoader,1800);

  // Theme
  const savedTheme=localStorage.getItem('aih-theme');
  const systemLight=window.matchMedia?.('(prefers-color-scheme: light)').matches;
  root.dataset.theme=savedTheme || (systemLight ? 'light' : 'dark');
  $('#themeToggle')?.addEventListener('click',()=>{
    root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
    localStorage.setItem('aih-theme',root.dataset.theme);
  });

  // Header + mobile nav
  const header=$('#siteHeader'),menu=$('#menu'),links=$('#links');
  const onScroll=()=>header?.classList.toggle('scrolled',scrollY>18);
  onScroll(); addEventListener('scroll',onScroll,{passive:true});
  menu?.addEventListener('click',()=>{
    const open=links?.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(!!open));
  });
  $$('#links a').forEach(a=>a.addEventListener('click',()=>{
    links?.classList.remove('open'); menu?.setAttribute('aria-expanded','false');
  }));

  // Cursor glow
  const glow=$('#cursorGlow');
  if(glow && matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove',e=>{
      glow.style.left=e.clientX+'px';
      glow.style.top=e.clientY+'px';
    },{passive:true});
  }

  // Reveal on scroll
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -30px'});
  $$('.reveal').forEach(el=>revealObserver.observe(el));

  // Count animation
  const counters=$$('[data-count]');
  const countObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target,target=Number(el.dataset.count||0);
      let start=0;
      const step=()=>{start++;el.textContent=start;if(start<target)requestAnimationFrame(step)};
      step();countObserver.unobserve(el);
    });
  },{threshold:.7});
  counters.forEach(el=>countObserver.observe(el));

  // Hover spotlight + subtle tilt
  $$('.cap-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
      card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
    });
  });
  if(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    $$('.tilt-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        card.style.transform='perspective(900px) rotateX('+(-y*3.5)+'deg) rotateY('+(x*4.5)+'deg) translateY(-2px)';
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
    $$('.magnetic').forEach(el=>{
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.08)+'px,'+((e.clientY-r.top-r.height/2)*.08)+'px)';
      });
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
  }

  // Facility flow tabs
  const flowContent={
    execution:{
      title:'Quiet execution + client mode',
      text:'The front office can operate as a focused trading/execution room with clustered workstations, while switching into reception, meetings, sales, and client consultations when traders are not using it.'
    },
    fulfillment:{
      title:'Fulfillment built along the wall',
      text:'Inventory, Amazon FBA prep, kitting, packing, returns, shelving, labels, and outbound staging stay organized on a long wall so the center floor remains flexible.'
    },
    rnd:{
      title:'R&D without wasting a room',
      text:'A dedicated workbench wall supports software/hardware prototyping, electronics, testing, technical repair, packaging experiments, and applied product development.'
    },
    flex:{
      title:'Open floor = optionality',
      text:'The center remains deliberately open for workshops, training, equipment staging, product photography, project assembly, vehicle/detailing concepts, and temporary operating setups.'
    }
  };
  $$('.flow-tab').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.flow-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const key=btn.dataset.zone,data=flowContent[key],box=$('#flowCopy');
    if(box&&data)box.innerHTML='<h3>'+data.title+'</h3><p>'+data.text+'</p>';
    $$('[data-bp]').forEach(el=>el.classList.toggle('active-zone',el.dataset.bp===key));
  }));

  // Revenue stack
  const revenueCopy={
    now:['Start with what can be delivered immediately.','AI/business infrastructure builds, implementation days, small-brand fulfillment, FBA prep, workshops, and project-based technical services can begin before larger procurement cycles mature.'],
    next:['Turn projects into recurring operations.','Managed automations, monthly systems support, route coordination, storage, repeat fulfillment, events, and ongoing technical operations create repeatable monthly revenue.'],
    later:['Use operating history to unlock larger work.','Documented delivery, commercial customers, partner relationships, technical prototypes, registrations, and past performance can support larger subcontracting, institutional work, and R&D funding opportunities.']
  };
  $$('.stack-row').forEach(row=>row.addEventListener('click',()=>{
    $$('.stack-row').forEach(r=>r.classList.remove('active'));row.classList.add('active');
    const d=revenueCopy[row.dataset.stack],box=$('#revenueDetail');
    if(d&&box)box.innerHTML='<strong>'+d[0]+'</strong><p>'+d[1]+'</p>';
  }));

  // Modal controls
  const openModal=modal=>{
    if(!modal)return;
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');body.classList.add('modal-open');
  };
  const closeModal=modal=>{
    if(!modal)return;
    modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
    if(!$('.modal.open'))body.classList.remove('modal-open');
  };
  $$('[data-close-modal]').forEach(el=>el.addEventListener('click',()=>closeModal(el.closest('.modal'))));
  addEventListener('keydown',e=>{if(e.key==='Escape'){$$('.modal.open').forEach(closeModal);$('#chatWidget')?.classList.remove('open')}});

  const calendarModal=$('#calendarModal'),calendarFrame=$('#calendarFrame');
  const openCalendar=()=>{
    if(calendarFrame && !calendarFrame.src)calendarFrame.src=calendarFrame.dataset.src||BOOKING_URL;
    openModal(calendarModal);
  };
  $$('[data-open-calendar]').forEach(el=>el.addEventListener('click',openCalendar));

  // Interest / event capture
  const interestModal=$('#interestModal'),interestEvent=$('#interestEvent'),interestTitle=$('#interestTitle'),interestCopy=$('#interestCopy');
  const openInterest=(name='Founding Access')=>{
    if(interestEvent)interestEvent.value=name;
    if(interestTitle)interestTitle.textContent=name==='Founding Access'?'Get founding access.':'Join '+name+'.';
    if(interestCopy)interestCopy.textContent='Leave your details for '+name+' updates, then choose a time if you want to discuss it now.';
    openModal(interestModal);
  };
  $$('.event-interest').forEach(btn=>btn.addEventListener('click',()=>openInterest(btn.dataset.event||'Founding Access')));
  $$('[data-open-founder]').forEach(btn=>btn.addEventListener('click',()=>{hideExit();openInterest('Founding Access')}));

  const saveLocalLead=(kind,data)=>{
    try{
      const key='aih-'+kind+'-leads';
      const existing=JSON.parse(localStorage.getItem(key)||'[]');
      existing.push({...data,createdAt:new Date().toISOString()});
      localStorage.setItem(key,JSON.stringify(existing.slice(-20)));
    }catch(_){}
  };

  if(HL.projectFormUrl)replaceWithHighLevelForm('#leadForm',HL.projectFormUrl,'Applied Innovations Hub project intake');
  if(HL.interestFormUrl)replaceWithHighLevelForm('#interestForm',HL.interestFormUrl,'Applied Innovations Hub interest form');

  const submitLead=async(kind,data)=>{
    const response=await fetch('/api/highlevel-lead',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...data,kind})
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.ok)throw new Error(result.error||'Unable to save your information');
    return result;
  };

  $('#interestForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const button=form.querySelector('button[type="submit"]');
    const data=Object.fromEntries(new FormData(form).entries());
    if(button){button.disabled=true;button.textContent='Saving…'}
    try{
      await submitLead('interest',data);
      saveLocalLead('interest',data);
      closeModal(interestModal);
      form.reset();
      openCalendar();
    }catch(error){
      const small=form.querySelector('small');
      if(small)small.textContent=error.message+' — please use the scheduler or call 302-402-3752.';
    }finally{
      if(button){button.disabled=false;button.innerHTML='Save Interest + Schedule <span>→</span>'}
    }
  });

  $('#leadForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const button=form.querySelector('button[type="submit"]');
    const data=Object.fromEntries(new FormData(form).entries());
    const status=$('#formStatus');
    if(button){button.disabled=true;button.textContent='Sending to AIH…'}
    if(status)status.textContent='Saving your project to the AIH system…';
    try{
      const result=await submitLead('project',data);
      saveLocalLead('project',data);
      if(status)status.textContent='Received. Your project is now in the AIH system. Opening scheduling…';
      form.reset();
      setTimeout(openCalendar,500);
    }catch(error){
      if(status)status.textContent=error.message+' — you can still call 302-402-3752.';
    }finally{
      if(button){button.disabled=false;button.innerHTML='Send Project + Continue <span>→</span>'}
    }
  });

  // AIH Assistant
  const chat=$('#chatWidget'),messages=$('#chatMessages'),chatInput=$('#chatInput');
  const openChat=()=>{
    chat?.classList.add('open');chat?.setAttribute('aria-hidden','false');
    setTimeout(()=>chatInput?.focus(),120);
  };
  const closeChat=()=>{chat?.classList.remove('open');chat?.setAttribute('aria-hidden','true')};
  $('#chatLauncher')?.addEventListener('click',()=>chat?.classList.contains('open')?closeChat():openChat());
  $('#chatClose')?.addEventListener('click',closeChat);

  const answers=[
    {keys:['service','offer','do you do','capabilit'],text:'AIH is organized around outcomes first: capture more demand, reduce operating drag, launch products, improve margins and visibility, modernize the business, prepare for growth or acquisition, execute larger contracts, and build managed digital workforces. We then assemble the right software, AI, finance, R&D, data, logistics, or advisory capability around the problem.'},
    {keys:['ai','automat','crm','agent','website','highlevel','business system'],text:'AIH can scope business infrastructure such as CRM, AI agents, lead capture, booking, follow-up, payments, review workflows, customer communication, reporting, and operational automations. The goal is a working system—not just software setup.'},
    {keys:['r&d','research','prototype','prototyp','hardware','software','fintech'],text:'Applied R&D can include AI workflows, fintech tools, software prototypes, data systems, automation experiments, electronics or hardware concepts, process tests, and proof-of-concept development. Projects are scoped around a specific problem, prototype, test plan, and deployment path.'},
    {keys:['amazon','fba','fulfill','ecommerce','e-commerce','pick','pack','inventory','shipping','returns'],text:'AIH is developing micro-fulfillment capability for inventory intake, FBA prep, pick-and-pack, kitting, labeling, returns, product staging, and outbound shipment workflows. Capacity and final service levels will depend on the physical hub setup.'},
    {keys:['logistic','delivery','last mile','route','dispatch','courier'],text:'The logistics model includes local delivery coordination, B2B transfers, route operations, dispatch workflows, proof of delivery, customer notifications, and eventually technology that helps manage those operations.'},
    {keys:['government','contract','prime','subcontract','agency','procurement','bid','teaming'],text:'AIH is being structured to support primes and organizations with technology, fulfillment, logistics, sourcing, operating systems, and project execution. We do not claim registrations or certifications until verified, but we can scope teaming and subcontract opportunities now.'},
    {keys:['event','workshop','bootcamp','boot camp','training','class','sunday'],text:'Initial programming includes AI Build Sunday, Business Systems Lab, E-commerce Ops Lab, Trade House Sessions, Contract Opportunity Lab, and founding-member workshops. Dates will be announced as the facility and event calendar are finalized.'},
    {keys:['trade','trading','market','trade house'],text:'The Trade House concept is a quiet execution and analytics environment focused on structured market process, technology, journaling, research, and disciplined operations. The front execution room can switch between trader mode and client/reception mode.'},
    {keys:['facility','location','bear','delaware','warehouse','hub','open yet','address'],text:'AIH is planning a Delaware physical hub with a quiet front execution/client room plus open industrial space for fulfillment, R&D, logistics, training, staging, and special projects. The facility is still in the planning stage, so the website does not present occupancy as finalized.'},
    {keys:['price','pricing','cost','how much','rate'],text:'Pricing depends on the business problem and scope. AIH may solve one focused constraint or architect a broader transformation across systems, finance, operations, software, or managed agents. The fastest route is a Discovery Call so we can scope the outcome before pricing the work.'},
    {keys:['partner','invest','founding','member','membership','join'],text:'Founding Access is for early customers, collaborators, brands, operators, vendors, and community partners who want first access to programs, pilots, workshops, fulfillment, and beta technology. I can open the founding-access form or schedule a conversation.'},
    {keys:['trade hybrid','tradehybrid','trade hybrid club'],text:'Trade Hybrid Club is one of the team’s proof projects: a connected trading ecosystem spanning market tools, journaling, intelligence, community, member experiences, automation, and trader operations. It demonstrates the kind of multi-system product architecture AIH can build.'},
    {keys:['project vector','wearable','connected wearable'],text:'Project Vector is the working R&D codename for a connected wearable concept exploring movement, location, wellness, sensing, interchangeable hardware, and everyday human performance. It demonstrates AIH moving beyond software into applied product experimentation.'},
    {keys:['autobid','auto bid'],text:'AutoBid is an AI-assisted opportunity intelligence platform designed to find procurement opportunities, match capabilities, identify teaming paths, and organize response strategy. It reflects AIH’s GovTech and opportunity-research capability.'},
    {keys:['certified','highlevel admin','high level admin','chapter'],text:'AIH team members are HighLevel Certified Admins. A Delaware HighLevel Local Chapter is planned and is presented as Coming Soon while the local program is finalized.'},
    {keys:['missed call','missed-call','missed calls'],text:'The Missed-Call Rescue system is designed to immediately text back unanswered callers, continue the conversation, qualify the lead, offer scheduling, and create a CRM opportunity so the lead does not disappear.'},
    {keys:['review','reputation'],text:'The Review + Reputation Engine automates review requests, follow-up, customer feedback routing, and reputation workflows so the process does not depend on staff remembering to ask every customer.'},
    {keys:['reactivation','old leads','database'],text:'The Lead Reactivation Engine segments older contacts and uses compliant SMS, email, AI conversations, booking flows, and sales-team handoff to recover dormant opportunities.'},
    {keys:['managed agent','managed agents','ai employee','ai employees','agent studio'],text:'AIH does not sell “a chatbot.” We design managed digital roles around real work: define the job, connect knowledge and actions, set guardrails and human handoffs, then measure performance. Reception, sales coordination, research, operations, customer success, and custom roles are all possible when the workflow justifies it.'},
    {keys:['acquisition','buy a business','acquire','m&a','due diligence'],text:'AIH can help evaluate and improve businesses before, during, or after an acquisition by combining operating systems, AI, technology review, project economics, profitability analysis, diligence support, and post-close integration. Select strategic acquisition or partnership opportunities may also be evaluated when there is a strong operating fit.'},
    {keys:['early advisory','jonathan early','project economics','cfo','infrastructure advisory'],text:'AIH can pair its technology and operating capabilities with specialist finance and infrastructure expertise. Early Advisory is an independent advisory practice with CFO, accounting, project-economics, profitability, M&A diligence, integration, and infrastructure-sector experience that may support larger engagements when appropriate.'},
    {keys:['calendar','book','schedule','call','meeting','talk','appointment'],text:'Absolutely. I can open the AIH Discovery Call scheduler now.',action:'calendar'},
    {keys:['contact','email','phone'],text:'The fastest contact route on this site is the project intake or strategy-call scheduler. Tell me what you need and I can send you directly to scheduling.'}
  ];

  const normalize=s=>(s||'').toLowerCase().replace(/[^a-z0-9& -]/g,' ');
  const findAnswer=q=>{
    const n=normalize(q);
    let best=null,score=0;
    answers.forEach(a=>{
      const s=a.keys.reduce((sum,k)=>sum+(n.includes(k)?1:0),0);
      if(s>score){score=s;best=a}
    });
    return best||{text:'Start with the business outcome. Tell me what is limiting growth, wasting time, hurting margin, blocking a launch, creating operational friction, or complicating an acquisition. I’ll help map that problem to the right AIH solution—or we can schedule a Discovery Call.'};
  };
  const addMessage=(text,type='bot')=>{
    if(!messages)return;
    const wrap=document.createElement('div');wrap.className='msg '+type;
    const p=document.createElement('p');p.textContent=text;wrap.appendChild(p);messages.appendChild(wrap);
    messages.scrollTop=messages.scrollHeight;
  };
  const ask=q=>{
    if(!q?.trim())return;
    openChat();addMessage(q,'user');
    setTimeout(()=>{
      const ans=findAnswer(q);addMessage(ans.text,'bot');
      if(ans.action==='calendar'){
        const qr=document.createElement('div');qr.className='quick-replies';
        const b=document.createElement('button');b.textContent='Open Scheduler';b.addEventListener('click',openCalendar);qr.appendChild(b);messages?.appendChild(qr);messages.scrollTop=messages.scrollHeight;
      }
    },280);
  };
  $('#chatForm')?.addEventListener('submit',e=>{e.preventDefault();const q=chatInput?.value||'';if(chatInput)chatInput.value='';ask(q)});
  $$('[data-chat-question]').forEach(btn=>btn.addEventListener('click',()=>ask(btn.dataset.chatQuestion)));
  $$('.quick-replies [data-open-calendar]').forEach(btn=>btn.addEventListener('click',openCalendar));

  // Exit intent: once per session, after engagement
  const exit=$('#exitPopup');
  let exitEligible=false;
  const showExit=()=>{
    if(!exit||sessionStorage.getItem('aih-exit-seen')==='1'||$('.modal.open'))return;
    sessionStorage.setItem('aih-exit-seen','1');
    exit.classList.add('show');exit.setAttribute('aria-hidden','false');
  };
  const hideExit=()=>{exit?.classList.remove('show');exit?.setAttribute('aria-hidden','true')};
  setTimeout(()=>exitEligible=true,12000);
  document.addEventListener('mouseout',e=>{
    if(exitEligible && e.clientY<=0 && !e.relatedTarget)showExit();
  });
  let mobileExitTimer=setTimeout(()=>{
    if(innerWidth<820 && scrollY>document.body.scrollHeight*.22)showExit();
  },30000);
  $('#exitClose')?.addEventListener('click',hideExit);
  $('#exitNoThanks')?.addEventListener('click',hideExit);

  // External booking fallback for direct use
  window.AIH={openCalendar,openChat,book:()=>window.open(BOOKING_URL,'_blank','noopener')};
})();
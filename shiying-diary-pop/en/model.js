(function(root){
  'use strict';
  const samples=[
    {id:'coffee',name:'Coffee by the window',file:'../assets/coffee.jpg',kind:'photo'},
    {id:'park',name:'A walk in the park',file:'../assets/park.jpg',kind:'photo'},
    {id:'street',name:'A colourful street',file:'../assets/street.jpg',kind:'photo'},
    {id:'wall',name:'Street art',file:'../assets/wall.jpg',kind:'photo'},
    {id:'ticket',name:'Concert ticket',file:'assets/ticket.svg',kind:'saved'},
    {id:'pickup',name:'Parcel pickup screenshot',file:'assets/pickup.svg',kind:'saved'},
    {id:'list',name:'Photo shoot checklist',file:'assets/list.svg',kind:'saved'},
    {id:'reference',name:'Design reference',file:'assets/reference.svg',kind:'saved'}
  ];
  const positions=[{x:7,y:21,r:-5},{x:27,y:52,r:4},{x:56,y:18,r:4},{x:75,y:52,r:-5}];
  const fresh=date=>({version:3,date,clock:552,next:1,items:[],title:'My day in pictures',positions:{},stickers:[],journalSaved:null});
  const sample=id=>samples.find(i=>i.id===id);
  const keep=s=>s.items.filter(i=>i.mode==='keep'&&!i.deleted);
  const temporary=s=>s.items.filter(i=>i.mode==='temporary'&&!i.deleted);
  const hhmm=n=>`${String(Math.floor(((n%1440)+1440)%1440/60)).padStart(2,'0')}:${String(((n%60)+60)%60).padStart(2,'0')}`;
  const day=n=>Math.floor(n/1440);
  function dateAt(s,n=s.clock){const dt=new Date(s.date+'T12:00:00Z');dt.setUTCDate(dt.getUTCDate()+day(n));return dt.toISOString().slice(0,10);}
  function when(s,n){const d=day(n)-day(s.clock);return `${d===0?'Today':d===1?'Tomorrow':d===-1?'Yesterday':dateAt(s,n)} ${hhmm(n)}`;}
  function save(s,input){
    if(!sample(input.sampleId))throw Error('Please choose a photo.');
    if(!['keep','temporary'].includes(input.mode))throw Error('Please choose how to save it.');
    let reviewAt;
    if(input.mode==='temporary'){
      if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.reviewTime||''))throw Error('Please set a valid time.');
      if(!['today','tomorrow'].includes(input.reviewDay))throw Error('Please choose today or tomorrow.');
      const [h,m]=input.reviewTime.split(':').map(Number);
      reviewAt=day(s.clock)*1440+(input.reviewDay==='tomorrow'?1440:0)+h*60+m;
      if(reviewAt<=s.clock)throw Error('This time has passed. Choose a later time or tomorrow.');
    }
    const old=s.items.find(i=>i.id===input.editId&&!i.deleted);
    const item={id:old?.id||`moment-${s.next++}`,sampleId:input.sampleId,source:input.source||'save',mode:input.mode,at:old?.at||hhmm(s.clock),createdAt:old?.createdAt??s.clock};
    if(input.mode==='keep')item.note=(input.note||'').slice(0,300);
    else item.reviewAt=reviewAt;
    if(old)s.items[s.items.indexOf(old)]=item;else s.items.push(item);
    return item;
  }
  const due=s=>temporary(s).filter(i=>i.reviewAt<=s.clock).sort((a,b)=>a.reviewAt-b.reviewAt);
  const nextReview=s=>[...temporary(s)].sort((a,b)=>a.reviewAt-b.reviewAt)[0];
  function jump(s){const next=nextReview(s);if(!next)return null;s.clock=Math.max(s.clock,next.reviewAt);return next;}
  function review(s,id,action){const i=temporary(s).find(i=>i.id===id);if(!i)throw Error('This reminder has already been handled.');
    if(action==='delete'){i.deleted=true;i.deletedAt=s.clock;}
    else if(action==='keep'){i.mode='keep';i.note='';delete i.reviewAt;}
    else if(action==='snooze')i.reviewAt=s.clock+60;
    else throw Error('Unknown review action.');
    return i;
  }
  function restore(s,id){const i=s.items.find(i=>i.id===id&&i.deleted);if(!i)return null;delete i.deleted;delete i.deletedAt;i.reviewAt=s.clock+60;return i;}
  function snapshot(s){return JSON.stringify({date:s.date,title:s.title,items:keep(s),positions:s.positions,stickers:s.stickers});}
  function markSaved(s){if(!keep(s).length)throw Error('Keep a photo first to create your journal.');s.journalSaved=snapshot(s);}
  const api={samples,sample,fresh,keep,temporary,save,hhmm,day,dateAt,when,due,nextReview,jump,review,restore,positions,snapshot,markSaved,isSaved:s=>!!s.journalSaved&&s.journalSaved===snapshot(s)};
  if(typeof module!=='undefined')module.exports=api;root.Journal=api;
})(typeof window==='undefined'?globalThis:window);

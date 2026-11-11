(function(root){
  'use strict';
  const samples=[
    {id:'coffee',name:'窗边的咖啡',file:'coffee.jpg',kind:'photo'},
    {id:'park',name:'散步的小路',file:'park.jpg',kind:'photo'},
    {id:'street',name:'彩色街道',file:'street.jpg',kind:'photo'},
    {id:'wall',name:'路过的涂鸦',file:'wall.jpg',kind:'photo'},
    {id:'ticket',name:'演出电子票',file:'ticket.svg',kind:'saved'},
    {id:'pickup',name:'快递取件截图',file:'pickup.svg',kind:'saved'},
    {id:'list',name:'拍摄清单',file:'list.svg',kind:'saved'},
    {id:'reference',name:'设计灵感',file:'reference.svg',kind:'saved'}
  ];
  const positions=[{x:7,y:21,r:-5},{x:27,y:52,r:4},{x:56,y:18,r:4},{x:75,y:52,r:-5}];
  const fresh=(date)=>({version:2,date,clock:552,next:1,items:[],title:'今天的记录',positions:{},stickers:[],journalSaved:null});
  const keep=s=>s.items.filter(i=>i.mode==='keep');
  const sample=id=>samples.find(i=>i.id===id);
  const hhmm=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  function save(s,input){
    if(!sample(input.sampleId)) throw Error('请选择一张图片。');
    if(!['keep','temporary'].includes(input.mode)) throw Error('请选择保存方式。');
    if(input.mode==='temporary'){
      if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.reviewTime||'')) throw Error('请设置有效的回顾时间。');
      if(!['today','tomorrow'].includes(input.reviewDay)) throw Error('请选择今天或明天。');
      const [h,m]=input.reviewTime.split(':').map(Number);
      if(input.reviewDay==='today'&&h*60+m<=s.clock)throw Error('这个时间已经过去，请选晚一点，或选择明天。');
    }
    const old=s.items.find(i=>i.id===input.editId);
    const item={id:old?.id||`moment-${s.next++}`,sampleId:input.sampleId,source:input.source,mode:input.mode,at:old?.at||hhmm(s.clock)};
    if(input.mode==='keep')item.note=(input.note||'').slice(0,300);
    else {item.reviewTime=input.reviewTime;item.reviewDay=input.reviewDay;}
    if(old)s.items[s.items.indexOf(old)]=item;else {s.items.push(item);s.clock=Math.min(s.clock+47,23*60+50);}
    return item;
  }
  function snapshot(s){return JSON.stringify({date:s.date,title:s.title,items:keep(s),positions:s.positions,stickers:s.stickers});}
  function markSaved(s){if(!keep(s).length)throw Error('先保存一张长期保留的照片。');s.journalSaved=snapshot(s);}
  const api={samples,sample,fresh,keep,save,hhmm,positions,snapshot,markSaved,isSaved:s=>!!s.journalSaved&&s.journalSaved===snapshot(s)};
  if(typeof module!=='undefined')module.exports=api;root.Journal=api;
})(typeof window==='undefined'?globalThis:window);

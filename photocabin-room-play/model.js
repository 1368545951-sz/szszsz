(function(root){
  const samples=typeof module==='undefined'?root.PhotoSamples:require('./samples.js');
  const stages=[0,100,160,260,360,500];
  const decor=[
    {id:'coral-sofa',name:'Coral lounge',level:2,group:'sofa',colour:'#f4918e',desc:'A peach-pink sofa with bright cushions.'},
    {id:'checker-rug',name:'Checker rug',level:2,group:'rug',colour:'#438dba',desc:'A blue-and-cream rug, revealed as you tidy.'},
    {id:'colour-frames',name:'Colour frames',level:2,group:'frames',colour:'#ebbe44',desc:'Bright borders for your own photographs.'},
    {id:'projector',name:'Slide projector',level:3,group:'projector',colour:'#6a9e9d',desc:'Play the photographs you chose to keep.'},
    {id:'sun-lamp',name:'Sunshine lamp',level:3,group:'lamp',colour:'#f4cb4b',desc:'A little pool of warm light in your room.'},
    {id:'plant-shelf',name:'Botanical shelf',level:3,group:'shelf',colour:'#4cab79',desc:'Leafy shelves for your wall.'},
    {id:'blue-sofa',name:'Blue velvet lounge',level:4,group:'sofa',colour:'#537acb',desc:'A bolder look for your favourite corner.'},
    {id:'stripe-wall',name:'Studio wallpaper',level:4,group:'wallpaper',colour:'#dba1c6',desc:'Soft pink stripes, with a bright blue accent wall.'},
    {id:'printer',name:'Photo-strip printer',level:4,group:'printer',colour:'#eab26e',desc:'Turn your kept pictures into a downloadable photo strip.'},
    {id:'terrazzo-rug',name:'Confetti rug',level:5,group:'rug',colour:'#ee9fa3',desc:'A colourful pattern for a well-loved room.'},
    {id:'gallery-frames',name:'Gallery wall',level:5,group:'frames',colour:'#815bbb',desc:'A playful collection of colourful frames.'},
    {id:'sunset-wall',name:'Sunset palette',level:5,group:'wallpaper',colour:'#f9a56f',desc:'Warm coral walls and a golden floor.'}
  ];
  const positions=[[300,300,-13],[530,310,18],[755,270,-10],[920,340,12],[270,520,23],[460,520,-22],[690,500,15],[900,560,-18],[240,760,-12],[480,790,24],[710,740,-18],[890,850,13]];
  const sample=id=>samples.find(p=>p.id===id);
  const level=s=>stages.reduce((n,x,i)=>s.xp>=x?i+1:n,1);
  const fresh=()=>{const s={version:2,day:1,xp:80,earned:{1:0},completed:[],items:[],debris:[],cleaned:0,installed:[],styles:{},places:{},favourite:null,next:1,history:[],rankVisible:true,skipped:0};addPack(s);return s;};
  function addPack(s){const set=samples.filter(p=>p.day===(s.day-1)%2);set.forEach((p,i)=>{const [u,v,r]=positions[i];s.items.push({id:'photo-'+s.next++,sampleId:p.id,day:s.day,status:'floor',u:u+(s.day%3-1)*13,v,r,credits:[],at:p.time});});}
  const floor=s=>s.items.filter(p=>p.status==='floor');
  const kept=s=>s.items.filter(p=>p.status==='keep');
  const later=s=>s.items.filter(p=>p.status==='later');
  const bag=s=>s.items.filter(p=>p.status==='bag');
  const item=(s,id)=>s.items.find(p=>p.id===id);
  function earn(s,n){const before=s.earned[s.day]||0,after=Math.min(100,before+n);s.earned[s.day]=after;s.xp+=after-before;return after-before;}
  function decide(s,id,status){const p=item(s,id);if(!p||!['keep','later','bag'].includes(status))throw Error('Choose a photo and a destination.');if(p.status==='deleted')throw Error('Restore this photo first.');if(p.status===status)return 0;s.history.push({type:'photo',id,before:p.status});p.status=status;let gain=0;if(!p.credits.includes(s.day)){p.credits.push(s.day);gain=earn(s,5);}return gain;}
  function undo(s){const a=s.history.pop();if(!a)return null;if(a.type==='photo'){const p=item(s,a.id);if(p)p.status=a.before;}else if(a.type==='dust'){s.debris.push(a.piece);s.cleaned=Math.max(0,s.cleaned-1);}return a;}
  function clean(s,id){const i=s.debris.findIndex(d=>d.id===id);if(i<0)return false;const [piece]=s.debris.splice(i,1);s.history.push({type:'dust',piece});s.cleaned++;return true;}
  function finish(s){if(floor(s).length||s.debris.length)throw Error('Put away the remaining photos and clean the loose paper first.');bag(s).forEach(p=>p.status='deleted');let gain=0;if(!s.completed.includes(s.day)){s.completed.push(s.day);gain=earn(s,40);}s.history=[];return gain;}
  function dust(s,n,reason){const existing=s.debris.length;for(let i=0;i<Math.min(n,12-existing);i++){const k=existing+i;s.debris.push({id:'dust-'+s.day+'-'+s.next++,u:170+(k*193)%720,v:270+(k*137)%650,r:(k*47)%90-45,kind:k%3,reason});}}
  function nextDay(s,{skip=false}={}){if(s.day>=7)throw Error('This demo includes seven simulated days. Restart to try another route.');if(!skip&&!s.completed.includes(s.day))throw Error('Finish your review, or choose “Skip a day” to try the missed-day scenario.');s.day++;s.earned[s.day]=0;s.history=[];if(skip){s.skipped++;dust(s,3,'Missed-day clutter');}else{later(s).slice(0,3).forEach((p,i)=>{p.status='floor';p.u=300+i*220;p.v=690;p.r=i*13-14;});}addPack(s);if(later(s).length>4)dust(s,Math.min(4,later(s).length-4),'A full temporary drawer');}
  function overflow(s){samples.slice(4,10).forEach((p,i)=>s.items.push({id:'photo-'+s.next++,sampleId:p.id,day:Math.max(0,s.day-1),status:'later',u:400,v:500,r:0,credits:[],at:p.time}));dust(s,4,'A full temporary drawer');}
  function reviewLater(s,id){const p=item(s,id);if(!p||p.status!=='later')return;p.status='floor';p.u=330+(s.next++*97)%500;p.v=570+(s.next*39)%260;}
  function restore(s,id){const p=item(s,id);if(p&&['bag','deleted'].includes(p.status)){p.status='floor';p.u=450;p.v=600;return true;}return false;}
  function install(s,id,spot=0){const d=decor.find(d=>d.id===id);if(!d||level(s)<d.level)throw Error('This decoration is still locked.');if(!s.installed.includes(id))s.installed.push(id);s.styles[d.group]=id;s.places[d.group]=spot;}
  function favourite(s,id){const p=item(s,id);if(p?.status!=='keep')throw Error('Keep a photo before putting it in a frame.');s.favourite=id;}
  const current=s=>({floor:floor(s).length,keep:kept(s).length,later:later(s).length,bag:bag(s).length,dust:s.debris.length,deleted:s.items.filter(p=>p.status==='deleted').length});
  const ranking=s=>[{name:'Mia',xp:320,colour:'#b5b1e5'},{name:'Jules',xp:210,colour:'#a9d3b4'},{name:'You',xp:s.xp,colour:'#ffcf56',you:true},{name:'Alex',xp:130,colour:'#f1a7aa'}].sort((a,b)=>b.xp-a.xp);
  const api={samples,sample,decor,stages,positions,level,fresh,addPack,floor,kept,later,bag,item,earn,decide,undo,clean,finish,dust,nextDay,overflow,reviewLater,restore,install,favourite,current,ranking};
  if(typeof module!=='undefined')module.exports=api;root.Room=api;
})(typeof window==='undefined'?globalThis:window);

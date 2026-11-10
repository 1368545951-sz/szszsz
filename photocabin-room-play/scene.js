(() => {
  let canvas,ctx,get,last=0;const cache={};
  const ink='#34312d';
  const q=(u,v,z=0)=>({x:600+(u-v)*.5,y:350+(u+v)*.26-z});
  const anchors={sofa:[[655,50],[70,590],[230,35]],projector:[[410,140],[110,530],[810,320]],printer:[[370,110],[70,430],[830,370]],lamp:[[920,100],[100,850],[100,100]],shelf:[[0,280],[0,450],[0,710]]};
  function poly(ps,fill,stroke=ink,width=3){ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}}
  const plane=(u,v,w,d,z,c,stroke=ink,width=3)=>poly([q(u,v,z),q(u+w,v,z),q(u+w,v+d,z),q(u,v+d,z)],c,stroke,width);
  function box(u,v,w,d,h,top,left,right,z=0){poly([q(u,v+d,z),q(u+w,v+d,z),q(u+w,v+d,z+h),q(u,v+d,z+h)],left);poly([q(u+w,v,z),q(u+w,v+d,z),q(u+w,v+d,z+h),q(u+w,v,z+h)],right);plane(u,v,w,d,z+h,top);}
  function path(ps,c=ink,width=2){ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=c;ctx.lineWidth=width;ctx.stroke();}
  function text(t,x,y,size=13,c=ink){ctx.fillStyle=c;ctx.font=`bold ${size}px monospace`;ctx.fillText(t,x,y);}
  function wall(side,pos,z,w,h,fill,stroke=ink,width=3){const p=(a,b)=>side==='left'?q(0,a,b):q(a,0,b);poly([p(pos,z),p(pos+w,z),p(pos+w,z+h),p(pos,z+h)],fill,stroke,width);}
  function wallImage(side,pos,z,w,h,photo){const sam=Room.sample(photo.sampleId);let im=cache[sam.id];if(!im){im=new Image();im.src=sam.src;cache[sam.id]=im;}if(im.complete&&im.naturalWidth){const origin=side==='left'?q(0,pos,z+h):q(pos,0,z+h);ctx.save();ctx.transform(side==='left'?-.5:.5,.26,0,1,origin.x,origin.y);const scale=Math.max(w/im.width,h/im.height);ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();ctx.drawImage(im,(w-im.width*scale)/2,(h-im.height*scale)/2,im.width*scale,im.height*scale);ctx.restore();}}
  function frame(side,pos,z,w,h,photo,col){wall(side,pos,z,w,h,'#e8b06d');wall(side,pos+7,z+6,w-14,h-12,col||'#ffdc78');wall(side,pos+15,z+13,w-30,h-26,'#fff3ca');if(photo)wallImage(side,pos+22,z+20,w-44,h-40,photo);else{wall(side,pos+26,z+25,w-52,h-50,'#bdd9bc',null);wall(side,pos+35,z+38,w-70,9,'#fff3c7',null);}}
  function plant(u,v,z=0,scale=1){const p=q(u,v,z);ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale);poly([{x:-20,y:-2},{x:22,y:-2},{x:15,y:32},{x:-13,y:32}],'#e9a24b');poly([{x:-24,y:-6},{x:25,y:-6},{x:23,y:3},{x:-22,y:3}],'#ffc86c');path([{x:0,y:-4},{x:2,y:-62}],'#2d7357',4);for(const [x,y,flip] of [[-22,-28,-1],[24,-45,1],[-20,-62,-1],[15,-77,1],[0,-90,1]]){poly([{x:1,y:y+15},{x:x-16*flip,y:y+4},{x:x-11*flip,y:y-15},{x:x+10*flip,y:y-21},{x:x+19*flip,y:y-8},{x:x+13*flip,y:y+5}],'#35ae73',ink,2);path([{x:1,y:y+15},{x:x,y:y-5}],'#b6e29a',2);}ctx.restore();}
  function sofa(u,v,colour){box(u+10,v+10,270,125,18,'#a88b67','#91714f','#7a6449');box(u,v,300,36,122,colour,'#d06a73','#c36c73',18);box(u,v+35,300,125,44,colour,'#ed9c91','#e4817e',18);box(u,v+35,35,125,80,'#f6b2a1','#ec9b91','#c87778',18);box(u+265,v+35,35,125,80,'#f6b2a1','#ec9b91','#c87778',18);for(let i=0;i<2;i++)box(u+42+i*112,v+42,104,104,10,colour,'#ed9c91','#d1807c',62);box(u+58,v+40,65,25,69,'#fcce66','#f2b94f','#df9e43',65);box(u+188,v+45,48,23,56,'#7fc3ad','#5bb299','#469b86',65);}
  function projector(u,v,s){box(u,v,125,90,53,'#ffe2a1','#e7ad69','#bf875a');box(u+16,v+15,80,55,44,'#a5c8c1','#769f9b','#4f8587',53);const p=q(u+32,v+13,120);ctx.fillStyle='#364746';ctx.fillRect(p.x-10,p.y-12,29,25);ctx.fillRect(p.x+27,p.y-12,29,25);ctx.fillStyle='#8cae9d';ctx.fillRect(p.x-3,p.y-6,15,13);ctx.fillRect(p.x+34,p.y-6,15,13);box(u+89,v+24,18,30,25,'#ffdc76','#dfbb52','#b89a47',60);if(Room.kept(s).length){const a=q(u+110,v+35,80);poly([a,{x:a.x+70,y:a.y-55},{x:a.x+75,y:a.y-3}],'#fff5ad77',null);}}
  function lamp(u,v){plane(u-18,v-18,55,55,4,'#eec85a');box(u,v,7,7,146,'#f8df80','#ceab53','#a58444',4);const p=q(u+3,v+3,177);poly([{x:p.x-30,y:p.y+25},{x:p.x-18,y:p.y-12},{x:p.x+20,y:p.y-12},{x:p.x+33,y:p.y+25}],'#fff3c0');path([{x:p.x-9,y:p.y-10},{x:p.x-16,y:p.y+22}],'#e6c56a',2);path([{x:p.x+8,y:p.y-10},{x:p.x+16,y:p.y+22}],'#e6c56a',2);}
  function draw(now){requestAnimationFrame(draw);if(now-last<100)return;last=now;const s=get(),theme=s.styles.wallpaper,wallA=theme==='sunset-wall'?'#ffcb9d':theme==='stripe-wall'?'#ffe1eb':'#fff1c0',wallB=theme==='stripe-wall'?'#c3e5ed':'#fff9dd';ctx.clearRect(0,0,1200,940);ctx.lineJoin='round';
    // Crisp isometric room: no separate photo-work area.
    poly([{x:600,y:374},{x:1121,y:633},{x:600,y:907},{x:79,y:633}],'#c6924126',null);
    poly([q(0,0,-16),q(1000,0,-16),q(1000,1000,-16),q(0,1000,-16)],'#f3d188');poly([q(0,1000,-16),q(1000,1000,-16),q(1000,1000,0),q(0,1000,0)],'#d69551');poly([q(1000,0,-16),q(1000,1000,-16),q(1000,1000,0),q(1000,0,0)],'#bd8047');
    plane(0,0,1000,1000,0,theme==='sunset-wall'?'#efa054':'#e9b16d');
    for(let v=0;v<1000;v+=72){path([q(0,v),q(1000,v)],'#b77943',1.4);for(let u=(v/72%2)*110;u<1000;u+=230){path([q(u,v),q(u,Math.min(1000,v+72))],'#c48b51',1.4);path([q(u+30,v+20),q(Math.min(u+130,1000),v+20)],'#eec58d',1);}}
    poly([q(0,0),q(0,1000),q(0,1000,280),q(0,0,280)],wallA);poly([q(0,0),q(1000,0),q(1000,0,280),q(0,0,280)],wallB);
    // Wallpaper stripes stay in the wall plane.
    for(let a=0;a<1000;a+=70){wall('left',a,8,26,265,theme==='stripe-wall'?'#f7c3d8':'#fff8dc',null);wall('right',a,8,22,265,theme==='stripe-wall'?'#d5edf4':'#fff1c6',null);}
    wall('left',0,0,1000,13,'#bb8650');wall('right',0,0,1000,13,'#b9814c');wall('left',0,275,1000,11,'#fff5ca');wall('right',0,275,1000,11,'#fff5ca');
    // Window, hills and curtains.
    wall('right',580,88,310,150,'#9b6f46');wall('right',590,97,290,133,'#f2d498');wall('right',601,108,268,111,'#81cfe4');
    const tr=(u,z)=>q(u,0,z);poly([tr(601,119),tr(670,154),tr(736,127),tr(810,151),tr(869,130),tr(869,108),tr(601,108)],'#76b790',null);wall('right',601,108,268,12,'#b7d595',null);wall('right',731,108,7,111,'#fff2c4',null);wall('right',601,161,268,6,'#fff2c4',null);wall('right',575,96,20,148,'#f49c89');wall('right',875,96,20,148,'#f49c89');wall('right',575,156,20,12,'#f6ce64',null);wall('right',875,156,20,12,'#f6ce64',null);
    // Clock and shelf on the left wall.
    wall('left',190,178,80,69,'#f3b1a0');wall('left',199,187,62,51,'#fff8e1');const clock=q(0,228,214);path([{x:clock.x,y:clock.y-12},{x:clock.x,y:clock.y},{x:clock.x+10,y:clock.y+4}],ink,3);
    const keep=Room.kept(s),fav=Room.item(s,s.favourite)||keep[0];const frameColour=s.styles.frames==='gallery-frames'?'#c5a7de':s.styles.frames?'#f6c855':'#dca562';
    frame('left',570,114,240,141,fav,frameColour);frame('left',330,83,125,96,keep[1],s.styles.frames?'#efb1ba':'#dca562');if(s.styles.frames)frame('left',840,85,107,100,keep[2],'#8bc9c6');
    // Small physical friends board on the back wall.
    wall('right',220,109,180,106,'#b7824c');wall('right',228,116,164,92,'#e9c190');for(let i=0;i<3;i++){wall('right',242+i*45,155,30,33,['#a9d6c3','#eda4aa','#c1b5df'][i]);wall('right',245+i*45,136,24,7,'#fff6d3',null);}
    // Rug is present beneath the scattered photos.
    const rug=s.styles.rug;plane(255,480,530,355,2,rug==='checker-rug'?'#4c98b6':rug==='terrazzo-rug'?'#f7bfba':'#f6d898',ink,2);
    if(rug==='checker-rug'){for(let u=270;u<760;u+=70)for(let v=494;v<820;v+=62)if((Math.floor(u/70)+Math.floor(v/62))%2===0)plane(u,v,65,58,3,'#fff4c9',null);}
    else if(rug==='terrazzo-rug'){for(let i=0;i<70;i++)plane(270+(i*73)%480,496+(i*41)%310,9+i%7,6+i%9,3,['#8cbec5','#f8d273','#b7d6af','#bf9fc9'][i%4],null);}
    else{plane(275,500,490,315,3,'#fff0bf','#e3b976',2);for(let i=0;i<17;i++){const p=q(290+i*26,835,3);path([p,{x:p.x+4,y:p.y+7}],'#bd8955',2);}}
    // Cabinet and albums: a real destination inside the room.
    box(35,290,160,238,125,'#cf995e','#c18d56','#a87948');for(let v=304;v<520;v+=67){poly([q(196,v,20),q(196,v+58,20),q(196,v+58,106),q(196,v,106)],'#f3dca6');for(let a=0;a<4;a++)box(167,v+6+a*11,20,9,67,['#edb05f','#81b9ac','#d69ca7','#a6b7d4'][a], '#b17c52','#b17c52',21);}
    for(let i=0;i<3;i++)box(63+i*24,335+i*7,64,101,10,['#5c9f9f','#db928a','#e7b658'][i],'#e9d7aa','#91704a',128+i*11);plant(72,486,127,.6);
    // Temporary drawer.
    box(835,55,124,166,126,'#8fc8c1','#65aaa8','#4e929c');for(let i=0;i<3;i++){poly([q(837,222,10+i*38),q(957,222,10+i*38),q(957,222,42+i*38),q(837,222,42+i*38)],'#91c8bc');const p=q(895,224,25+i*38);ctx.fillStyle='#fff2bf';ctx.fillRect(p.x-9,p.y-2,18,4);}const n=Room.later(s).length;if(n>4){box(845,80,100,120,12,'#ffe6b5','#e6b773','#cf9d65',129);for(let i=0;i<3;i++)box(851+i*19,90+i*14,28,65,2,'#fff5d4','#efd9a5','#c6ad7a',142+i*4);}
    // Base bench, upgraded to a sofa after decoration delivery.
    const sofaId=s.styles.sofa,sofaPos=anchors.sofa[s.places.sofa||0];if(sofaId)sofa(...sofaPos,sofaId==='blue-sofa'?'#7d9bd9':'#f59b98');else{box(660,70,285,130,42,'#ffe1a4','#c99458','#b7804a');box(660,70,285,25,85,'#d69c60','#bc8450','#a87344',43);box(680,105,240,85,7,'#ead7a6','#d7bf8f','#c3a977',43);}
    // Low coffee table with a cup, book, and a little camera.
    box(350,170,150,100,45,'#e9b35e','#ca934a','#af7c3f');box(375,193,51,40,6,'#8cafd1','#edddb2','#8b7250',47);const cup=q(454,205,55);ctx.fillStyle='#fff3cf';ctx.fillRect(cup.x-8,cup.y-13,16,16);ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.strokeRect(cup.x-8,cup.y-13,16,16);ctx.strokeRect(cup.x+8,cup.y-9,7,8);
    if(s.styles.projector){const a=anchors.projector[s.places.projector||0];projector(...a,s);}
    if(s.styles.printer){const a=anchors.printer[s.places.printer||0];box(...a,95,85,73,'#ffcb9d','#ef9f91','#d78482');box(a[0]+10,a[1]+10,70,40,7,'#fff8dc','#f1dcae','#b7ad88',74);plane(a[0]+15,a[1]+72,60,95,37,'#fff7e5',ink,2);}
    if(s.styles.lamp)lamp(...anchors.lamp[s.places.lamp||0]);
    if(s.styles.shelf){const [,v]=anchors.shelf[s.places.shelf||0];wall('left',v,177,180,9,'#b87b48');plant(0,v+30,187,.55);plant(0,v+105,188,.45);}
    plant(60,865,0,1);plant(965,50,0,.75);
    // Outline caps complete the doll-house structure.
    path([q(0,1000),q(0,1000,280),q(0,0,280),q(1000,0,280),q(1000,0)],ink,4);
  }
  window.RoomArt={point:q,anchors,start(el,provider){canvas=el;ctx=el.getContext('2d');get=provider;requestAnimationFrame(draw);},inverse(x,y){const a=(x-600)/.5,b=(y-350)/.26;return {u:(a+b)/2,v:(b-a)/2};}};
})();

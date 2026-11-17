/* Sharing always requires a visitor action. Only this demo's storage is reset. */
(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const t = (a,b) => en ? a : b;
  const session = window.DaynoteSession;
  if (!session) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'daynote-actions-dialog';
  document.body.append(dialog);
  let urls = [], generation = 0;
  function clearPreview() { generation++; urls.forEach(URL.revokeObjectURL); urls = []; }
  dialog.addEventListener('close', clearPreview);
  function heading(title) {
    dialog.replaceChildren();
    const close = document.createElement('button');
    close.className = 'close-dialog'; close.textContent = '×';
    close.setAttribute('aria-label', t('Close','关闭'));
    close.onclick = () => dialog.close(); dialog.append(close);
    const h = document.createElement('h2'); h.id = 'daynote-action-title'; h.textContent = title;
    dialog.setAttribute('aria-labelledby', h.id); dialog.append(h);
  }
  function paragraph(text) { const p=document.createElement('p'); p.textContent=text; dialog.append(p); return p; }
  function button(text, fn, primary=false) { const b=document.createElement('button'); b.textContent=text; b.className=primary?'primary':'quiet'; b.onclick=fn; return b; }
  function reset() {
    heading(t('Start a new experience?','清空并重新体验？'));
    paragraph(t('This clears this prototype’s English and Chinese journals, photos, notes, stickers and reminders in this browser. Export or share anything you want to keep first. Your real photo library is not affected.','这会清空当前浏览器中本原型的中英文日记、照片记录、文字、贴纸和提醒。请先导出或分享需要保留的内容，不会影响真实相册。'));
    const row=document.createElement('div'); row.className='daynote-action-row';
    row.append(button(t('Cancel','取消'),()=>dialog.close()),button(t('Clear and start over','确认清空并重新开始'),()=>{
      try {
        localStorage.removeItem('shiying-diary-pop-v1');
        localStorage.removeItem('shiying-diary-pop-en-v1');
        window.location.reload();
      } catch { paragraph(t('This browser could not clear the records. Please allow site storage and try again.','浏览器未能清空记录，请允许网站存储后重试。')); }
    },true)); dialog.append(row); dialog.showModal();
  }
  function wrap(ctx, text, width) {
    const lines=[];
    for(const line of String(text||'').split('\n')) {
      let current='';
      for(const char of Array.from(line)) {
        if(current && ctx.measureText(current+char).width>width) { lines.push(current);current=''; }
        current+=char;
      }
      lines.push(current);
    }
    return lines;
  }
  async function image(src) {
    const img=new Image(); img.src=new URL(src,document.baseURI).href;
    await img.decode(); return img;
  }
  async function share() {
    const s=session.getState(), items=window.Journal.keep(s);
    if(!items.length) return;
    // Take a snapshot so later edits cannot alter the prepared share files.
    const snapshot=JSON.parse(JSON.stringify(s));
    const kept=window.Journal.keep(snapshot);
    clearPreview(); const token=generation;
    heading(t('Share to social media','分享到社交媒体'));
    const status=paragraph(t('Preparing your journal images…','正在生成日记分享图片…'));
    status.setAttribute('role','status'); dialog.showModal();
    const files=[], previews=[];
    try {
      if(document.fonts?.ready) await document.fonts.ready;
      for(let page=0;page<Math.ceil(kept.length/4);page++) {
        const batch=kept.slice(page*4,page*4+4);
        const photos=await Promise.all(batch.map(i=>image(session.img(i.sampleId))));
        const c=document.createElement('canvas'); c.width=1200;
        const ctx=c.getContext('2d'); if(!ctx) throw Error('Canvas unavailable');
        ctx.font='24px Arial, sans-serif';
        const notes=batch.map(i=>wrap(ctx,i.note,480));
        ctx.font='bold 42px Arial, sans-serif';
        const title=wrap(ctx,snapshot.title,1050), top=110+title.length*52;
        const rowHeights=[];
        for(let k=0;k<batch.length;k+=2) rowHeights.push(420+Math.max(notes[k].length,notes[k+1]?.length||0)*32);
        c.height=top+rowHeights.reduce((a,b)=>a+b+28,0)+80;
        ctx.fillStyle='#f3f137';ctx.fillRect(0,0,c.width,c.height);
        ctx.fillStyle='#fffef9';ctx.fillRect(28,28,c.width-56,c.height-56);
        ctx.fillStyle='#2549ef';ctx.font='18px Arial, sans-serif';ctx.fillText('DAYNOTE / '+(snapshot.date||''),65,72);
        ctx.fillStyle='#21221c';ctx.font='bold 42px Arial, sans-serif';title.forEach((line,k)=>ctx.fillText(line,65,127+k*52));
        let y=top;
        for(let row=0;row<rowHeights.length;row++) {
          for(let col=0;col<2;col++) {
            const k=row*2+col;if(k>=batch.length)continue;
            const x=65+col*550, im=photos[k], scale=Math.min(500/im.naturalWidth,320/im.naturalHeight);
            ctx.fillStyle='#f1eee6';ctx.fillRect(x,y,500,320);
            ctx.drawImage(im,x+(500-im.naturalWidth*scale)/2,y+(320-im.naturalHeight*scale)/2,im.naturalWidth*scale,im.naturalHeight*scale);
            ctx.fillStyle='#21221c';ctx.font='24px Arial, sans-serif';notes[k].forEach((line,n)=>ctx.fillText(line,x+10,y+360+n*32));
            ctx.fillStyle='#77776b';ctx.font='17px Arial, sans-serif';ctx.fillText(batch[k].at||'',x+10,y+rowHeights[row]-16);
          }
          y+=rowHeights[row]+28;
        }
        ctx.fillStyle='#77776b';ctx.font='16px Arial, sans-serif';ctx.fillText(t('YOUR PHOTOS + YOUR WORDS','照片 + 自己的话')+' / '+(page+1)+' / '+Math.ceil(kept.length/4),65,c.height-48);
        const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Image failed')),'image/png'));
        if(token!==generation || !dialog.open) return;
        const file=new File([blob],`Daynote-${snapshot.date}-${page+1}.png`,{type:'image/png'});
        files.push(file); const url=URL.createObjectURL(file);urls.push(url);previews.push(url);
      }
      if(token!==generation || !dialog.open)return;
      status.textContent=t('Preview your photos and notes in a sharing layout. Temporary images are excluded.','预览照片与文字的分享版式，不包含临时图片。');
      const grid=document.createElement('div');grid.className='daynote-share-previews';
      previews.forEach((url,k)=>{const box=document.createElement('div'),img=document.createElement('img'),link=document.createElement('a');img.src=url;img.alt=t('Journal sharing image ','日记分享图片 ')+(k+1);link.href=url;link.download=files[k].name;link.textContent=t('Save image ','保存图片 ')+(k+1)+' ↓';box.append(img,link);grid.append(box);});dialog.append(grid);
      const message=paragraph('');message.setAttribute('role','status');
      let native=false;try{native=!!(navigator.share&&navigator.canShare?.({files}));}catch{}
      if(native) {
        const send=button(t('Choose an app to share ↗','选择应用分享 ↗'),async()=>{
          send.disabled=true;
          try{await navigator.share({files});message.textContent=t('Sharing finished.','已完成分享操作。');}
          catch(e){message.textContent=e.name==='AbortError'?t('Sharing cancelled. Your journal is unchanged.','已取消分享，日记没有变化。'):t('Sharing was unavailable. Save the images below and upload them in your social app.','暂时无法唤起分享，请保存图片后在社交应用中上传。');}
          finally{send.disabled=false;}
        },true);dialog.append(send);
        message.textContent=t('Choose an installed social app in the share sheet, or save the images and upload them yourself.','在系统分享面板中选择已安装的社交应用，也可以保存图片后自行上传。');
      } else message.textContent=t('This browser does not support sharing image files directly. Save the images above, then upload them to your social app.','当前浏览器不支持直接分享图片文件。请先保存上方图片，再到社交应用中上传。');
    } catch { if(token===generation && dialog.open)status.textContent=t('Could not prepare the images. Please check your connection and try again.','生成分享图片失败，请检查网络后重试。'); }
  }
  function mount() {
    const controls=document.querySelector('.journal-controls');
    if(controls&&!controls.querySelector('[data-daynote-share]')) {
      const exportButton=controls.querySelector('[data-action="export"]');
      if(exportButton){const b=button(t('Share to social media ↗','分享到社交媒体 ↗'),share);b.dataset.daynoteShare='';b.disabled=exportButton.disabled;exportButton.after(b);}
    }
    if(controls&&!controls.querySelector('[data-daynote-reset]')) {
      const b=button(t('Clear & start over','清空并重新体验'),reset);b.dataset.daynoteReset='';b.classList.add('daynote-reset');controls.append(b);
    }
  }
  const topReset=button(t('New experience ↻','重新体验 ↻'),reset);topReset.classList.add('daynote-top-reset');
  document.querySelector('.about-link')?.before(topReset);
  new MutationObserver(mount).observe(document.querySelector('#app'),{childList:true,subtree:true});
  mount();
})();

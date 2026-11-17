(() => {
  'use strict';
  const hub=window.ConceptHub,$=s=>document.querySelector(s),frame=$('#concept-frame');
  let active=null,operation=0,cancelLoad=null,slowTimer;
  function message(text){$('#experience-message').textContent=text;$('#experience-message').hidden=!text;}
  function navigate(url){
    if(cancelLoad)cancelLoad();
    return new Promise((resolve,reject)=>{
      const expected=url==='about:blank'?url:new URL(url,document.baseURI).href;
      const done=()=>{try{if(frame.contentWindow.location.href!==expected)return;}catch{frame.removeEventListener('load',done);if(cancelLoad===cancel)cancelLoad=null;reject(new Error('Unexpected frame origin'));return;}frame.removeEventListener('load',done);if(cancelLoad===cancel)cancelLoad=null;resolve();};
      const cancel=()=>{frame.removeEventListener('load',done);reject(Object.assign(new Error('Navigation cancelled'),{name:'AbortError'}));};
      cancelLoad=cancel;frame.addEventListener('load',done);
      frame.src=expected;
    });
  }
  function loading(on){$('#reset-concept').disabled=on;$('#load-status').textContent=on?'Opening experience…':'';clearTimeout(slowTimer);if(on)slowTimer=setTimeout(()=>message('The photos may take a moment to load. You can return to All concepts at any time.'),30000);}
  async function enter(concept){
    const id=++operation;active=concept;message('');$('#home-view').hidden=true;$('#experience-view').hidden=false;
    $('#experience-name').textContent=concept.title;$('#experience-name').style.setProperty('--accent',concept.accent);frame.title=concept.title+' interactive prototype';
    document.title=concept.title+' · Shiying';loading(true);
    try{await navigate(concept.url);if(id!==operation)return;loading(false);message('');if(!frame.contentDocument?.querySelector(concept.ready))message('This experience did not load correctly. Use Reset this concept to try again, or return to All concepts.');}
    catch(e){if(id===operation&&e.name!=='AbortError'){loading(false);message('The experience could not be opened. Please return to All concepts and try again.');}}
  }
  function home(){++operation;active=null;if(cancelLoad){cancelLoad();cancelLoad=null;}clearTimeout(slowTimer);frame.src='about:blank';$('#experience-view').hidden=true;$('#home-view').hidden=false;message('');document.title='Shiying · Three photo experiences';$('#home-title').focus({preventScroll:true});window.scrollTo(0,0);}
  function route(){const concept=hub.conceptForHash(window.location.hash);if(concept)enter(concept);else home();}
  $('#reset-concept').addEventListener('click',async()=>{
    if(!active)return;const concept=active,id=++operation;loading(true);message('');
    try{await hub.resetExperience(concept,window.localStorage,navigate,()=>id===operation);if(id!==operation)return;loading(false);message('Reset complete. You can start this concept from the beginning.');}
    catch(e){if(id===operation&&e.name!=='AbortError'){loading(false);message('This browser could not reset the experience. Please allow site storage, then try again.');}}
  });
  window.addEventListener('hashchange',route);route();
})();

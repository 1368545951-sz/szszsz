(function(root){
  'use strict';
  const concepts={
    'concept-1':{title:'Concept 1 · Photo Diary',url:'../shiying-diary-pop/?exhibition=20261123',view:'diary',accent:'#d890a5',keys:['shiying-diary-pop-en-v1','shiying-diary-pop-v1'],ready:'#app'},
    'concept-2':{title:'Concept 2 · Photo Cabin',url:'../photocabin-room-play/?exhibition=20261123',view:'cabin',accent:'#ceac3a',keys:['photocabin-room-play-v1'],ready:'#room-art'},
    'concept-3':{title:'Concept 3 · Visual Canvas',url:'../shiying-visual-canvas/en/?exhibition=20261123',view:'canvas',accent:'#79a88b',keys:['shiying-canvas-theme'],ready:'#viewport'}
  };
  function conceptForHash(hash){return concepts[String(hash||'').replace(/^#/,'')]||null;}
  async function resetExperience(concept,storage,navigate,isCurrent=()=>true){
    // Unload first: an old page's visibility handler must not save after clearing.
    await navigate('about:blank');
    if(!isCurrent())return false;
    for(const key of concept.keys)storage.removeItem(key);
    if(!isCurrent())return false;
    await navigate(concept.url);
    return true;
  }
  const api={concepts,conceptForHash,resetExperience};
  if(typeof module!=='undefined')module.exports=api;
  root.ConceptHub=api;
})(typeof window==='undefined'?globalThis:window);

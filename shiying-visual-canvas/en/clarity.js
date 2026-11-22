/* English presentation only. Reference scoring and original gestures are unchanged. */
const detailLabels={all:'Whole image',color:'Color',subject:'Subject',background:'Background',layout:'Composition'};
const originalNotify=notify;
notify=function(message){originalNotify(english(message));};

const originalInspector=renderInspector;
renderInspector=function(){
 originalInspector();
 if(selected===null)return;
 $('handles').setAttribute('role','group');
 $('handles').setAttribute('aria-label','Choose a visual detail. Click or drag a colored button.');
 $('handles').querySelectorAll('button').forEach(button=>{
  const label=detailLabels[button.dataset.aspect];
  button.textContent=label+' +';
  button.setAttribute('aria-label','Add '+label.toLowerCase()+' reference');
  button.title='Click or drag to add '+label.toLowerCase()+' reference';
 });
 if(!hasSignal())$('photoReason').textContent='Choose a colored button around this photo. Click to add, or drag onto the canvas.';
 else $('photoReason').textContent=english($('photoReason').textContent);
};

function updateReferenceFeedback(){
 const last=state.refs.at(-1),box=$('referenceFeedback');
 box.classList.toggle('has-reference',!!last);
 if(last){
  box.dataset.aspect=last.aspect;
  box.textContent=detailLabels[last.aspect]+' reference '+(last.mode==='exclude'?'set to less like':'added')+' · '+topIds.length+' related photos highlighted';
 }else{
  delete box.dataset.aspect;
  box.textContent=state.clues.length?'Text clue added · '+topIds.length+' related photos highlighted':'Click any photo to begin.';
 }
}
const originalRender=render;
render=function(options){originalRender(options);updateReferenceFeedback();};

const originalAddRef=addRef;
addRef=function(id,aspect){
 const before=state.refs.length;
 originalAddRef(id,aspect);
 if(state.refs.length===before)return;
 notify(detailLabels[aspect]+' reference added. '+topIds.length+' related photos highlighted.');
 const results=topIds.map(id=>nodes.get(id));
 results.forEach(node=>{node.classList.remove('result-arriving');void node.offsetWidth;node.classList.add('result-arriving');});
 clearTimeout(addRef.pulseTimer);
 addRef.pulseTimer=setTimeout(()=>results.forEach(node=>node.classList.remove('result-arriving')),1500);
 Array.from($('trail').querySelectorAll('.ref-token')).at(-1)?.scrollIntoView({block:'nearest',inline:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
};

/* Reference labels remain visible and readable after every state update. */
const originalTrail=renderTrail;
renderTrail=function(){
 originalTrail();
 $('trail').querySelectorAll('.ref-token').forEach((token,index)=>{
  token.dataset.aspect=state.refs[index].aspect;
  token.querySelector('.ref-label').textContent=(state.refs[index].mode==='exclude'?'Less like · ':'')+detailLabels[state.refs[index].aspect];
 });
};
updateReferenceFeedback();

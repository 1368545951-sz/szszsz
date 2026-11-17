(function(root){
  'use strict';
  function createIdleTimer({timeoutMs=80000,onExpire,now=()=>Date.now(),schedule=setTimeout,cancel=clearTimeout}){
    let running=false,last=0,timer=null;
    function stop(){running=false;if(timer!==null)cancel(timer);timer=null;}
    function check(){
      if(!running)return;
      if(timer!==null)cancel(timer);timer=null;
      const remaining=timeoutMs-(now()-last);
      if(remaining<=0){running=false;onExpire();return;}
      timer=schedule(check,remaining);
    }
    function start(){stop();running=true;last=now();check();}
    function touch(){if(!running)return;if(now()-last>=timeoutMs){check();return;}last=now();}
    return{start,stop,touch,check};
  }
  if(typeof module!=='undefined')module.exports={createIdleTimer};
  root.ConceptIdle={createIdleTimer};
})(typeof window==='undefined'?globalThis:window);

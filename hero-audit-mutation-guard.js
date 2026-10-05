(function(global){
  'use strict';
  if(typeof document==='undefined'||!global.MutationObserver||global.__kibunAuditMutationGuardInstalled)return;
  global.__kibunAuditMutationGuardInstalled=true;
  const Native=global.MutationObserver;
  function relevant(mutations){
    return mutations.filter(m=>{
      for(const n of m.addedNodes||[]){
        if(n.nodeType!==1)continue;
        if(n.matches?.('[data-audit-index],.hero-audit,.hero-audit-grid')||n.querySelector?.('[data-audit-index]'))return true;
      }
      return false;
    });
  }
  class GuardedMutationObserver{
    constructor(callback){
      this.callback=callback;
      this.bodyAudit=false;
      this.native=new Native((mutations,observer)=>{
        if(!this.bodyAudit){callback(mutations,observer);return;}
        const filtered=relevant(mutations);
        if(filtered.length)callback(filtered,observer);
      });
    }
    observe(target,options){
      this.bodyAudit=target===document.body&&options?.childList===true&&options?.subtree===true&&options?.attributes!==true;
      this.native.observe(target,options);
      if(this.bodyAudit&&global.MutationObserver===GuardedMutationObserver)global.MutationObserver=Native;
    }
    disconnect(){return this.native.disconnect();}
    takeRecords(){return this.native.takeRecords();}
  }
  global.MutationObserver=GuardedMutationObserver;
})(typeof window!=='undefined'?window:globalThis);

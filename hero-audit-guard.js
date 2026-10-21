(function(global){
  'use strict';

  if(typeof module!=='undefined'&&module.exports){
    module.exports=require('./hero-audit-guard-core.js');
    return;
  }
  if(typeof document==='undefined') return;

  function load(src,marker){
    if(document.querySelector(`script[data-${marker}]`)) return;
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.setAttribute(`data-${marker}`,'1');
    document.head.appendChild(s);
  }

  // v20.19.32: use actual recent generated assets from /assets/kibun-images/v2/.
  load('/kibun-images.js?v=201932','kibun-images');

  load('/hero-audit-mutation-guard.js?v=201917','kibun-hero-audit-mutation-guard');
  load('/hero-audit-guard-core.js?v=201917','kibun-hero-audit-guard-core');
  load('/hero-audit-sources.js?v=201922','kibun-hero-audit-sources');
})(typeof window!=='undefined'?window:globalThis);

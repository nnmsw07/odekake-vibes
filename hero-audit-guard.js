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

  load('/hero-audit-guard-core.js?v=201914','kibun-hero-audit-guard-core');
  load('/hero-audit-sources.js?v=201914','kibun-hero-audit-sources');
})(typeof window!=='undefined'?window:globalThis);

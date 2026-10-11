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

  // Temporary safety fallback: category-aware Kibun images are disabled on public pages
  // until the generated assets are re-exported and visually verified. This prevents
  // corrupted image files from replacing existing spot/plan imagery.

  // Install the lightweight MutationObserver filter before the legacy guard.
  // This prevents the guard from observing and reacting to its own audit badges/state DOM updates.
  load('/hero-audit-mutation-guard.js?v=201917','kibun-hero-audit-mutation-guard');
  load('/hero-audit-guard-core.js?v=201917','kibun-hero-audit-guard-core');
  load('/hero-audit-sources.js?v=201922','kibun-hero-audit-sources');
})(typeof window!=='undefined'?window:globalThis);

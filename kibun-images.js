(function(global){
  'use strict';
  if(typeof document==='undefined') return;

  // Public Kibun-image substitution is intentionally disabled.
  // Keep this script only to remove images injected by earlier fallback versions.
  const CLEANUP_MATCHERS=[
    '/assets/kibun-images/',
    '/assets/plans/family-cafe.webp',
    '/assets/plans/waterfront-walk.webp',
    '/assets/plans/culture-cafe.webp',
    '/assets/editorial/parents-eat-well.webp',
    '/assets/editorial/baby-first-outing.webp',
    '/assets/editorial/special.webp',
    '/assets/editorial/culture.webp',
    '/assets/editorial/hotel-without-staying.webp',
    '/assets/editorial/terrace-after-sunset.webp',
    '/assets/editorial/green-breathing-room.webp',
    '/assets/editorial/night-starts-after-five.webp',
    '/assets/vibes/'
  ];

  function shouldRemove(node,img){
    if(!node||!img) return false;
    const src=String(img.getAttribute('src')||'');
    if(!src) return false;
    const injected=node.dataset.kibunImage==='fallback'||!!node.querySelector('.image-badge');
    if(!injected&&!src.includes('/assets/kibun-images/')) return false;
    return CLEANUP_MATCHERS.some(part=>src.includes(part));
  }

  function cleanupNode(node){
    if(!node?.matches?.('[data-media-spot]')) return;
    const img=node.querySelector('img');
    if(shouldRemove(node,img)) img.remove();
    delete node.dataset.kibunImage;
    delete node.dataset.kibunImageKey;
    delete node.dataset.kibunImageAsset;
    node.querySelectorAll('.image-badge').forEach(el=>el.remove());
  }

  function scan(root=document){
    if(root?.matches?.('[data-media-spot]')) cleanupNode(root);
    root?.querySelectorAll?.('[data-media-spot]').forEach(cleanupNode);
  }

  function boot(){
    scan(document);
    new MutationObserver(records=>{
      for(const rec of records){
        for(const n of rec.addedNodes){
          if(n.nodeType===1) scan(n);
        }
      }
    }).observe(document.body,{childList:true,subtree:true});
  }

  global.KibunImages={disabled:true,scan};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(window);

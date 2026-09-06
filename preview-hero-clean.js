(function(){
  const imgs=[...document.querySelectorAll('.magazine-preview-media img[data-hero-clean="1"]')];
  imgs.forEach(img=>{
    const node=img.closest('[data-media-spot]');
    if(!node)return;
    if(!img.dataset.heroState)img.dataset.heroState='loading';
    const sync=()=>{
      const state=node.dataset.placeEnhanced||'';
      if(state==='1'){img.dataset.heroState='ready';return;}
      if(state==='fallback'){img.dataset.heroState='fallback';return;}
    };
    new MutationObserver(sync).observe(node,{attributes:true,attributeFilter:['data-place-enhanced']});
    sync();
  });
})();

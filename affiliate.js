(function(){
  const cfg=window.KIBUN_AFFILIATE_CONFIG||{enabled:false,links:{}};
  function linksFor(spot){
    if(!cfg.enabled||!spot?.spot_id)return [];
    return (cfg.links?.[spot.spot_id]||[]).filter(x=>x&&/^https:\/\//.test(String(x.url||'')));
  }
  function render(spot){
    const links=linksFor(spot);if(!links.length)return '';
    return `<section class="affiliate-box"><div class="affiliate-head"><strong>予約・チケット</strong><span>PR</span></div><p>${cfg.disclosure||'PR：アフィリエイト広告を含みます。'}</p><div class="affiliate-actions">${links.map((x,i)=>`<a class="affiliate-link" data-affiliate-index="${i}" href="${x.url}" target="_blank" rel="sponsored noopener">${x.label||'予約を見る'} <span>→</span></a>`).join('')}</div></section>`;
  }
  window.KibunAffiliate={linksFor,render};
})();

(function(){
  const cfg=window.KIBUN_AFFILIATE_CONFIG||{enabled:false,links:{}};
  function intentFor(spot){const cats=[spot?.category_primary,...(spot?.categories||[])].join('|').toLowerCase();if(spot?.overnight||/hotel|stay|ryokan|resort/.test(cats))return'stay';if(/food|cafe|restaurant|dining/.test(cats))return'food';return'experience';}
  function validLink(x){return x&&(x.rawHtml||/^https:\/\//.test(String(x.url||'')));}
  function rankLink(x,intent){const pri=cfg.providerPriority?.[intent]||[];const providerRank=pri.indexOf(x.provider);const scopeRank=x.scope==='spot'?0:x.scope==='area'?1:2;return scopeRank*100+(providerRank<0?90:providerRank);}
  function allLinksFor(spot){if(!cfg.enabled||!spot?.spot_id)return[];const intent=intentFor(spot);return (cfg.links?.[spot.spot_id]||[]).filter(validLink).slice().sort((a,b)=>rankLink(a,intent)-rankLink(b,intent));}
  function linksFor(spot){const links=allLinksFor(spot);return links.length?[links[0]]:[];}
  function sectionTitle(spot){const intent=intentFor(spot);if(intent==='stay')return'この宿を予約する';if(intent==='food')return'このお店を予約する';return'チケット・予約';}
  function render(spot){const links=linksFor(spot);if(!links.length)return '';return `<section class="affiliate-box"><div class="affiliate-head"><strong>${sectionTitle(spot)}</strong><span>PR</span></div><p>${cfg.disclosure||'PR：アフィリエイト広告を含みます。'}</p><div class="affiliate-actions">${links.map((x,i)=>{const provider=cfg.providerLabels?.[x.provider]||x.provider||'予約サイト';return `<div class="affiliate-choice"><small class="affiliate-provider">${provider}</small>${x.rawHtml?`<div class="affiliate-raw" data-affiliate-index="${i}" data-provider="${x.provider||''}">${x.rawHtml}</div>`:`<a class="affiliate-link" data-affiliate-index="${i}" data-provider="${x.provider||''}" href="${x.url}" target="_blank" rel="sponsored noopener">${x.label||'予約を見る'} <span>→</span></a>`}</div>`;}).join('')}</div></section>`;}
  window.KibunAffiliate={intentFor,allLinksFor,linksFor,render};
})();

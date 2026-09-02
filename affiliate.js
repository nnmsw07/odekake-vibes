(function(){
  const cfg=window.KIBUN_AFFILIATE_CONFIG||{enabled:false,links:{},sourceLinks:{}};
  function intentFor(spot){const cats=[spot?.category_primary,...(spot?.categories||[])].join('|').toLowerCase();if(spot?.overnight||/hotel|stay|ryokan|resort/.test(cats)&&!/hotel_lounge/.test(cats))return'stay';if(/food|cafe|restaurant|dining|afternoon_tea|hotel_lounge/.test(cats))return'food';return'experience';}
  function validLink(x){return x&&(x.rawHtml||/^https:\/\//.test(String(x.url||'')));}
  function isInboundSpot(spot){return ['A','B'].includes(String(spot?.inbound_profile?.inbound_fit||''));}
  function isInboundMode(){if(typeof document==='undefined')return false;const lang=String(document.documentElement?.lang||'ja').toLowerCase();return !lang.startsWith('ja');}
  function priorityKey(spot,intent){return intent==='experience'&&isInboundMode()&&isInboundSpot(spot)?'inbound_experience':intent;}
  function rankLink(x,intent,spot){const pri=cfg.providerPriority?.[priorityKey(spot,intent)]||cfg.providerPriority?.[intent]||[];const providerRank=pri.indexOf(x.provider);const scopeRank=x.scope==='spot'?0:x.scope==='area'?1:2;return scopeRank*100+(providerRank<0?90:providerRank);}
  function linkSwitchReady(){return Boolean(cfg.linkSwitch?.enabled&&cfg.linkSwitch?.tagInstalled);}
  function seedId(spotId,provider,index){return `kibun-ls-${spotId}-${provider}-${index}`;}
  function mountLinkSwitchSeeds(){
    if(!linkSwitchReady()||typeof document==='undefined'||document.getElementById('kibunAffiliateSeeds'))return;
    const allowed=new Set(cfg.linkSwitch?.providers||[]),box=document.createElement('div');
    box.id='kibunAffiliateSeeds';box.hidden=true;box.setAttribute('aria-hidden','true');
    Object.entries(cfg.sourceLinks||{}).forEach(([spotId,arr])=>(arr||[]).forEach((x,index)=>{
      if(x.public===false||!allowed.has(x.provider)||!validLink(x))return;
      const a=document.createElement('a');a.id=seedId(spotId,x.provider,index);a.href=x.url;a.textContent=x.label||'予約';a.tabIndex=-1;box.appendChild(a);
    }));
    document.body.appendChild(box);
  }
  function resolvedSourceUrl(spotId,x,index){
    if(typeof document==='undefined')return x.url;
    const a=document.getElementById(seedId(spotId,x.provider,index));
    return a?.href||x.url;
  }
  function sourceLinksFor(spot){
    if(!linkSwitchReady()||!spot?.spot_id)return[];
    const allowed=new Set(cfg.linkSwitch?.providers||[]);
    return (cfg.sourceLinks?.[spot.spot_id]||[]).map((x,index)=>x.public!==false&&allowed.has(x.provider)&&validLink(x)?({...x,url:resolvedSourceUrl(spot.spot_id,x,index),via:'linkswitch'}):null).filter(Boolean);
  }
  function allLinksFor(spot){
    if(!cfg.enabled||!spot?.spot_id)return[];
    const intent=intentFor(spot);
    const manual=(cfg.links?.[spot.spot_id]||[]).filter(validLink).map(x=>({...x,via:'manual'}));
    const source=sourceLinksFor(spot);
    return manual.concat(source).sort((a,b)=>rankLink(a,intent,spot)-rankLink(b,intent,spot));
  }
  function linksFor(spot){const links=allLinksFor(spot);return links.length?[links[0]]:[];}
  function sectionTitle(spot){const intent=intentFor(spot);if(intent==='stay')return'この宿を予約する';if(intent==='food')return'このお店を予約する';return'チケット・予約';}
  function render(spot){const links=linksFor(spot);if(!links.length)return '';return `<section class="affiliate-box"><div class="affiliate-head"><strong>${sectionTitle(spot)}</strong><span>PR</span></div><p>${cfg.disclosure||'PR：アフィリエイト広告を含みます。'}</p><div class="affiliate-actions">${links.map((x,i)=>{const provider=cfg.providerLabels?.[x.provider]||x.provider||'予約サイト';return `<div class="affiliate-choice"><small class="affiliate-provider">${provider}</small>${x.rawHtml?`<div class="affiliate-raw" data-affiliate-index="${i}" data-provider="${x.provider||''}">${x.rawHtml}</div>`:`<a class="affiliate-link" data-affiliate-index="${i}" data-provider="${x.provider||''}" href="${x.url}" target="_blank" rel="sponsored noopener">${x.label||'予約を見る'} <span>→</span></a>`}</div>`;}).join('')}</div></section>`;}
  mountLinkSwitchSeeds();
  window.KibunAffiliate={intentFor,isInboundSpot,isInboundMode,allLinksFor,linksFor,sourceLinksFor,linkSwitchReady,mountLinkSwitchSeeds,render};
})();

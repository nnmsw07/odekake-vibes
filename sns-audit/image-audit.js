(function(global){
  const KEY='kibun-sns-image-audit-v20116';
  const VERSION='20.11.9';
  const COMMONS_API='https://commons.wikimedia.org/w/api.php';
  const WIKIDATA_API='https://www.wikidata.org/w/api.php';
  const QUERY_HINTS={
    '日本科学未来館':['Miraikan','National Museum of Emerging Science and Innovation'],
    'チームラボボーダレス':['teamLab Borderless Azabudai Hills','Mori Building Digital Art Museum teamLab Borderless'],
    'スモールワールズ':['Small Worlds Tokyo'],
    'マクセル アクアパーク品川':['Aqua Park Shinagawa'],
    'レゴランド・ディスカバリー・センター東京':['Legoland Discovery Center Tokyo'],
    'PLAY! PARK ERIC CARLE':['PLAY PARK ERIC CARLE','PLAY! PARK ERIC CARLE Tokyo']
  };
  const seedState=global.KIBUN_SNS_IMAGE_AUDIT_SEED||{images:{}};
  const spots=(global.ODEKAKE_SEED?.spots||[]);
  const spotMap=new Map(spots.map(s=>[s.spot_id,s]));
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stripHtml=value=>{
    const raw=String(value||'');
    try{const div=document.createElement('div');div.innerHTML=raw;return (div.textContent||div.innerText||'').replace(/\s+/g,' ').trim();}
    catch(_e){return raw.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
  };
  const clone=x=>JSON.parse(JSON.stringify(x));

  function mergeSeedImages(localImages){
    return {...clone(seedState.images||{}),...(localImages&&typeof localImages==='object'?localImages:{})};
  }
  function load(){
    try{
      const x=JSON.parse(localStorage.getItem(KEY)||'null');
      if(x&&x.images&&typeof x.images==='object')return {version:VERSION,images:mergeSeedImages(x.images)};
    }catch(_e){}
    return {version:VERSION,images:mergeSeedImages({})};
  }
  let state=load();
  const candidateCache=new Map();
  function persist(){localStorage.setItem(KEY,JSON.stringify(state));}
  function get(spotId){return state.images[spotId]||null;}
  function getSafe(spotId){const x=get(spotId);return x&&x.rights_status==='safe'?x:null;}
  function all(){return clone(state.images);}
  function clear(spotId){delete state.images[spotId];persist();render();flash('SNS画像設定を解除しました');}

  function licenseStatus(label=''){
    const s=String(label).toLowerCase().replace(/[_-]+/g,' ');
    if(!s)return {status:'unknown',label:'ライセンス不明',tone:'red'};
    if(/non.?commercial|\bnc\b|no derivatives|\bnd\b|all rights reserved/.test(s))return {status:'blocked',label:'SNS利用不可/不明',tone:'red'};
    if(/public domain|\bcc0\b|pdm/.test(s))return {status:'safe',label:'SNS利用候補',tone:'green'};
    if(/cc\s*by\s*sa|attribution.?share.?alike|gfdl/.test(s))return {status:'needs_review',label:'要確認',tone:'yellow'};
    if(/cc\s*by|attribution/.test(s))return {status:'safe',label:'SNS利用候補',tone:'green'};
    return {status:'needs_review',label:'要確認',tone:'yellow'};
  }

  function candidateFromPage(page){
    const ii=page?.imageinfo?.[0];
    if(!ii)return null;
    const m=ii.extmetadata||{};
    const license=stripHtml(m.LicenseShortName?.value||m.UsageTerms?.value||'');
    const rights=licenseStatus(license);
    const author=stripHtml(m.Artist?.value||ii.user||'');
    const credit=stripHtml(m.Credit?.value||'');
    const desc=stripHtml(m.ImageDescription?.value||'');
    const licenseUrl=String(m.LicenseUrl?.value||'');
    const sourceUrl=String(ii.descriptionurl||`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title||'')}`);
    return {
      source:'wikimedia',
      file_title:page.title||'',
      image_url:ii.thumburl||ii.url||'',
      original_url:ii.url||ii.thumburl||'',
      source_url:sourceUrl,
      license,
      license_url:licenseUrl,
      author,
      credit,
      description:desc,
      rights_status:rights.status,
      rights_label:rights.label,
      rights_tone:rights.tone
    };
  }



  function normName(value){
    return String(value||'').toLowerCase().normalize('NFKC').replace(/[\s・･\-–—_()（）\[\]【】「」『』,.，。/\\!！'’]/g,'');
  }
  const GENERIC_WORDS=new Set(['東京','tokyo','神奈川','kanagawa','横浜','yokohama','museum','ミュージアム','park','パーク','center','centre','センター','the','of','and','in','at']);
  function textTokens(value){
    return String(value||'').normalize('NFKC').toLowerCase().replace(/[・･\-–—_()（）\[\]【】「」『』,.，。/\\!！'’:&]+/g,' ').split(/\s+/).map(x=>x.trim()).filter(x=>x.length>=2&&!GENERIC_WORDS.has(x));
  }
  function spotAliases(spot){
    return [spot?.name,...(QUERY_HINTS[spot?.name]||[])].filter(Boolean);
  }
  function candidateRelevance(spot,candidate){
    const hay=normName(`${candidate?.file_title||''} ${candidate?.description||''}`);
    if(!hay)return 0;
    const aliases=spotAliases(spot);
    let best=0;
    for(const alias of aliases){
      const norm=normName(alias);
      if(norm&&norm.length>=5&&hay.includes(norm))best=Math.max(best,100);
      const tokens=textTokens(alias).filter(t=>normName(t).length>=3);
      const matched=tokens.filter(t=>hay.includes(normName(t)));
      if(tokens.length>=2&&matched.length>=2)best=Math.max(best,54);
      else if(tokens.length===1&&matched.length===1&&normName(tokens[0]).length>=6)best=Math.max(best,45);
    }
    const areaTokens=textTokens(`${spot?.city||''} ${spot?.prefecture||''}`).map(normName).filter(Boolean);
    if(best>=40&&areaTokens.some(t=>t.length>=3&&hay.includes(t)))best+=18;
    return Math.min(best,100);
  }
  function relevantSafeCandidate(spot,rows,minScore=62){
    return (rows||[]).filter(x=>x?.rights_status==='safe').map(x=>({...x,relevance_score:candidateRelevance(spot,x)})).filter(x=>x.relevance_score>=minScore).sort((a,b)=>b.relevance_score-a.relevance_score)[0]||null;
  }
  function wikidataHitRelevant(spot,hit){
    if(!hit)return false;
    const aliases=spotAliases(spot).map(normName).filter(Boolean);
    const label=normName(hit.label||'');
    const desc=normName(hit.description||'');
    if(aliases.some(a=>a===label))return true;
    if(aliases.some(a=>{if(a.length<5||label.length<5)return false;const contained=label.includes(a)||a.includes(label);const ratio=Math.min(a.length,label.length)/Math.max(a.length,label.length);return contained&&ratio>=0.75;}))return true;
    const tokens=textTokens(spot?.name||'').map(normName).filter(t=>t.length>=3);
    const matched=tokens.filter(t=>label.includes(t)||desc.includes(t));
    const areaTokens=textTokens(`${spot?.city||''} ${spot?.prefecture||''}`).map(normName).filter(t=>t.length>=3);
    const areaMatched=areaTokens.some(t=>label.includes(t)||desc.includes(t));
    return tokens.length>=2&&matched.length>=2&&areaMatched;
  }
  async function commonsFileCandidate(fileTitle){
    if(!fileTitle)return null;
    const title=/^File:/i.test(fileTitle)?fileTitle:`File:${fileTitle}`;
    const u=new URL(COMMONS_API);
    const params={origin:'*',action:'query',format:'json',formatversion:'2',titles:title,prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1200',iiextmetadatalanguage:'ja',iiextmetadatafilter:'LicenseShortName|UsageTerms|LicenseUrl|Artist|Credit|ImageDescription'};
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)return null;
    const data=await r.json();
    return candidateFromPage(data?.query?.pages?.[0]||null);
  }
  async function commonsCategoryCandidates(category,limit=12){
    const cat=String(category||'').replace(/^Category:/i,'').trim();if(!cat)return[];
    const u=new URL(COMMONS_API);
    const params={origin:'*',action:'query',format:'json',formatversion:'2',generator:'categorymembers',gcmtitle:`Category:${cat}`,gcmtype:'file',gcmlimit:String(limit),prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1200',iiextmetadatalanguage:'ja',iiextmetadatafilter:'LicenseShortName|UsageTerms|LicenseUrl|Artist|Credit|ImageDescription'};
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)return[];
    const data=await r.json();
    return (data?.query?.pages||[]).map(candidateFromPage).filter(Boolean);
  }

  async function wikidataLeadImage(spot){
    const q=String(spot?.name||'').trim();if(!q)return null;
    const u=new URL(WIKIDATA_API);
    const params={origin:'*',action:'wbsearchentities',format:'json',language:'ja',uselang:'ja',type:'item',limit:'5',search:q};
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)return null;
    const data=await r.json(),rows=data?.search||[];if(!rows.length)return null;
    const hit=rows.find(x=>wikidataHitRelevant(spot,x));
    if(!hit?.id)return null;
    const eurl=new URL(WIKIDATA_API);eurl.searchParams.set('origin','*');eurl.searchParams.set('action','wbgetentities');eurl.searchParams.set('format','json');eurl.searchParams.set('ids',hit.id);eurl.searchParams.set('props','claims');
    const er=await fetch(eurl.toString(),{cache:'no-store'});if(!er.ok)return null;
    const entity=(await er.json())?.entities?.[hit.id];
    const file=entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if(file){
      const candidate=await commonsFileCandidate(file);
      if(candidate?.rights_status==='safe'&&wikidataHitRelevant(spot,hit))return {...candidate,relevance_score:100,discovery_source:'wikidata_p18',wikidata_id:hit.id};
    }
    const category=entity?.claims?.P373?.[0]?.mainsnak?.datavalue?.value;
    if(category){
      const rows=await commonsCategoryCandidates(category,12);
      const safe=relevantSafeCandidate(spot,rows,50);
      if(safe)return {...safe,discovery_source:'wikidata_commons_category',wikidata_id:hit.id,commons_category:category};
    }
    return null;
  }
  async function autoFindSafe(spot){
    if(!spot)return null;
    const selected=getSafe(spot.spot_id);if(selected)return {...selected,discovery_source:'selected'};
    const key=`auto:${spot.spot_id}`;if(candidateCache.has(key))return candidateCache.get(key);
    const task=(async()=>{
      try{const wd=await wikidataLeadImage(spot);if(wd)return wd;}catch(_e){}
      const queries=[String(spot.name||'').trim(),...(QUERY_HINTS[spot.name]||[]),defaultQuery(spot)].filter(Boolean);
      for(const q of [...new Set(queries)]){
        try{const rows=await searchCommons(spot,q);const safe=relevantSafeCandidate(spot,rows,62);if(safe)return {...safe,discovery_source:'commons_search'};}catch(_e){}
      }
      return null;
    })();
    candidateCache.set(key,task);return task;
  }

  function defaultQuery(spot){
    const area=[spot?.city,spot?.prefecture].filter(Boolean).join(' ');
    return `${spot?.name||''} ${area}`.trim();
  }

  async function searchCommons(spot,query){
    const q=String(query||defaultQuery(spot)).trim();
    if(!q)throw new Error('検索語がありません');
    const key=`${spot?.spot_id||''}:${q}`;
    if(candidateCache.has(key))return candidateCache.get(key);
    const p=(async()=>{
      const u=new URL(COMMONS_API);
      const params={
        origin:'*',action:'query',format:'json',formatversion:'2',generator:'search',
        gsrsearch:q,gsrnamespace:'6',gsrlimit:'8',prop:'imageinfo',
        iiprop:'url|extmetadata',iiurlwidth:'1200',iiextmetadatalanguage:'ja',
        iiextmetadatafilter:'LicenseShortName|UsageTerms|LicenseUrl|Artist|Credit|ImageDescription'
      };
      Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
      const r=await fetch(u.toString(),{cache:'no-store'});
      if(!r.ok)throw new Error(`Wikimedia API ${r.status}`);
      const data=await r.json();
      const rows=(data?.query?.pages||[]).map(candidateFromPage).filter(x=>x?.image_url).map(x=>({...x,relevance_score:candidateRelevance(spot,x)}));
      rows.sort((a,b)=>(b.relevance_score-a.relevance_score)||(({safe:0,needs_review:1,unknown:2,blocked:3}[a.rights_status]??9)-({safe:0,needs_review:1,unknown:2,blocked:3}[b.rights_status]??9)));
      return rows;
    })();
    candidateCache.set(key,p);
    try{return await p;}catch(e){candidateCache.delete(key);throw e;}
  }

  function selectCandidate(spotId,candidate){
    state.images[spotId]={...candidate,selected_at:new Date().toISOString()};
    persist();render();flash(candidate.rights_status==='safe'?'SNS用実写真として保存しました':'要確認画像として保存しました');
  }

  function manualRegister(spotId){
    const url=prompt('自前・許諾済み画像のURLを入力してください');
    if(!url)return;
    const credit=prompt('クレジット（例: Photo: Nana / 施設提供）を入力してください')||'';
    const license=prompt('権利メモ（例: 自前撮影 / 施設使用許可済み）を入力してください')||'手動確認済み';
    state.images[spotId]={source:'manual',image_url:url,original_url:url,source_url:'',license,license_url:'',author:credit,credit,description:'',rights_status:'safe',rights_label:'手動確認済み',rights_tone:'green',selected_at:new Date().toISOString()};
    persist();render();flash('自前・許諾画像を登録しました');
  }

  function attribution(record){
    if(!record)return'';
    if(record.source==='manual')return record.credit||record.author||record.license||'';
    const parts=[];
    if(record.author)parts.push(record.author);
    if(record.license)parts.push(record.license);
    parts.push('Wikimedia Commons');
    return parts.join(' / ');
  }
  function captionCredit(record){
    if(!record)return'';
    if(record.source==='manual')return record.credit||record.author||'';
    const by=record.author||'Contributor';
    const license=record.license||'license on file page';
    return `${by} / ${license} / Wikimedia Commons`;
  }

  function selectedCard(spot,rec){
    if(!rec)return `<div class="image-current empty"><span>未設定</span><small>Commons候補を探すか、自前/許諾済み画像を登録</small></div>`;
    const tone=rec.rights_tone||licenseStatus(rec.license).tone;
    return `<div class="image-current"><img src="${esc(rec.image_url)}" alt="" loading="lazy"><div class="image-current-copy"><span class="rights-chip ${esc(tone)}">${esc(rec.rights_label||licenseStatus(rec.license).label)}</span><strong>${esc(rec.source==='manual'?'自前・許諾済み画像':rec.file_title||'Wikimedia Commons')}</strong><small>${esc(attribution(rec))}</small><div class="image-current-actions">${rec.source_url?`<a href="${esc(rec.source_url)}" target="_blank" rel="noopener">ファイルページを確認 →</a>`:''}<button type="button" data-image-clear="${esc(spot.spot_id)}">解除</button></div></div></div>`;
  }

  function candidateHtml(spot,c,idx){
    const relevance=Number(c.relevance_score??candidateRelevance(spot,c));
    const mismatch=relevance<62;
    const disabled=c.rights_status==='blocked'||c.rights_status==='unknown'||mismatch;
    const action=mismatch?'施設一致を確認できず':c.rights_status==='safe'?'SNS用に採用':c.rights_status==='needs_review'?'要確認として保存':'採用不可';
    return `<article class="image-candidate"><img src="${esc(c.image_url)}" alt="" loading="lazy"><div class="candidate-meta"><span class="rights-chip ${esc(c.rights_tone)}">${esc(c.rights_label)}</span>${mismatch?'<span class="rights-chip red">施設一致×</span>':`<span class="rights-chip neutral">一致 ${relevance}</span>`}<strong>${esc((c.file_title||'').replace(/^File:/,''))}</strong><small>${esc(c.author||'作者情報なし')}</small><small>${esc(c.license||'ライセンス不明')}</small><div class="candidate-actions"><a href="${esc(c.source_url)}" target="_blank" rel="noopener">Commonsで確認</a><button type="button" data-image-use="${esc(spot.spot_id)}" data-candidate-index="${idx}" ${disabled?'disabled':''}>${esc(action)}</button></div></div></article>`;
  }

  const activeCandidates=new Map();
  function spotCard(spot){
    const rec=get(spot.spot_id),rows=activeCandidates.get(spot.spot_id)||[];
    const query=defaultQuery(spot);
    return `<article class="image-audit-card" data-image-spot="${esc(spot.spot_id)}"><div class="image-audit-head"><div><span class="post-id">${esc(spot.spot_id)}</span><h3>${esc(spot.name)}</h3><p>${esc([spot.city,spot.prefecture].filter(Boolean).join(' · '))}</p></div>${rec?`<span class="rights-chip ${esc(rec.rights_tone||'yellow')}">${esc(rec.rights_label||'設定あり')}</span>`:'<span class="rights-chip neutral">未設定</span>'}</div>${selectedCard(spot,rec)}<div class="image-search-row"><input type="search" data-image-query value="${esc(query)}" aria-label="Wikimedia Commons検索語"><button type="button" data-image-search="${esc(spot.spot_id)}">Commons候補を探す</button><button class="secondary-btn" type="button" data-image-manual="${esc(spot.spot_id)}">自前/許諾画像</button></div><div class="image-candidates" data-candidates-for="${esc(spot.spot_id)}">${rows.length?rows.map((c,i)=>candidateHtml(spot,c,i)).join(''):''}</div></article>`;
  }

  function visibleSpots(){
    const q=($('imageSpotFilter')?.value||'').trim().toLowerCase();
    const status=$('imageStatusFilter')?.value||'all';
    let rows=spots.filter(s=>!q||`${s.name} ${s.spot_id} ${s.city||''} ${s.prefecture||''}`.toLowerCase().includes(q));
    rows=rows.filter(s=>{
      const rec=get(s.spot_id);
      if(status==='selected')return !!rec;
      if(status==='safe')return rec?.rights_status==='safe';
      if(status==='needs_review')return rec?.rights_status==='needs_review';
      if(status==='missing')return !rec;
      return true;
    });
    rows.sort((a,b)=>{
      const ar=get(a.spot_id),br=get(b.spot_id);
      if(Boolean(ar)!==Boolean(br))return ar?-1:1;
      return (Number(b?.buzz?.visual_appeal)||0)-(Number(a?.buzz?.visual_appeal)||0);
    });
    return rows.slice(0,q?80:36);
  }

  function summary(){
    const values=Object.values(state.images);
    const safe=values.filter(x=>x.rights_status==='safe').length;
    const review=values.filter(x=>x.rights_status==='needs_review').length;
    const manual=values.filter(x=>x.source==='manual').length;
    if($('imageAuditSummary'))$('imageAuditSummary').innerHTML=`<article class="summary-card"><small>SNS画像設定</small><strong>${values.length}</strong><span>spots</span></article><article class="summary-card"><small>利用候補</small><strong>${safe}</strong><span>green</span></article><article class="summary-card"><small>要確認</small><strong>${review}</strong><span>yellow</span></article><article class="summary-card"><small>自前・許諾</small><strong>${manual}</strong><span>manual</span></article>`;
  }

  function flash(msg){const el=$('imageAuditFlash');if(!el)return;el.textContent=msg;clearTimeout(flash.t);flash.t=setTimeout(()=>el.textContent='',2600);}

  function bindCardEvents(){
    document.querySelectorAll('[data-image-search]').forEach(btn=>btn.addEventListener('click',async()=>{
      const spot=spotMap.get(btn.dataset.imageSearch);if(!spot)return;
      const card=btn.closest('.image-audit-card'),input=card?.querySelector('[data-image-query]');
      btn.disabled=true;btn.textContent='検索中…';
      try{const rows=await searchCommons(spot,input?.value||'');activeCandidates.set(spot.spot_id,rows);render();if(!rows.length)flash('候補が見つかりませんでした。検索語を変えてみてください');}
      catch(e){console.warn(e);flash('Wikimedia Commons検索に失敗しました');btn.disabled=false;btn.textContent='Commons候補を探す';}
    }));
    document.querySelectorAll('[data-image-use]').forEach(btn=>btn.addEventListener('click',()=>{
      const id=btn.dataset.imageUse,rows=activeCandidates.get(id)||[],c=rows[Number(btn.dataset.candidateIndex)];if(c)selectCandidate(id,c);
    }));
    document.querySelectorAll('[data-image-clear]').forEach(btn=>btn.addEventListener('click',()=>clear(btn.dataset.imageClear)));
    document.querySelectorAll('[data-image-manual]').forEach(btn=>btn.addEventListener('click',()=>manualRegister(btn.dataset.imageManual)));
  }

  function render(){
    if(!$('imageAuditList'))return;
    summary();
    const rows=visibleSpots();
    $('imageAuditList').innerHTML=rows.length?rows.map(spotCard).join(''):'<article class="empty-card">該当するスポットはありません。</article>';
    bindCardEvents();
  }

  function exportData(){return {version:VERSION,exported_at:new Date().toISOString(),images:state.images};}
  function download(){
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(exportData(),null,2)],{type:'application/json'}));a.download='kibun-sns-image-audit-v20.11.9.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);flash('SNS画像設定JSONを保存しました');
  }
  async function importFile(file){
    const obj=JSON.parse(await file.text());if(!obj?.images||typeof obj.images!=='object')throw new Error('invalid');state={version:VERSION,images:mergeSeedImages(obj.images)};persist();render();flash('SNS画像設定JSONを読み込みました');
  }

  function init(){
    if(!$('imageAuditList'))return;
    $('imageSpotFilter')?.addEventListener('input',render);
    $('imageStatusFilter')?.addEventListener('change',render);
    $('downloadImageAudit')?.addEventListener('click',download);
    $('importImageAudit')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importFile(f);}catch(_e){flash('画像設定JSONを読み込めませんでした')}e.target.value='';});
    render();
  }

  global.KibunSnsImages={
    key:KEY,version:VERSION,get,getSafe,all,attribution,captionCredit,licenseStatus,searchCommons,autoFindSafe,candidateRelevance,wikidataHitRelevant,render,init,exportData
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window);

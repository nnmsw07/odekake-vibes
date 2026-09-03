(function(){
  const seed=window.ODEKAKE_SEED||{spots:[]};
  const cfg=window.KIBUN_AFFILIATE_CONFIG||{};
  const KEY='kibun-affiliate-audit-v1';
  const auditStatus=window.KIBUN_AFFILIATE_AUDIT_STATUS?.spots||{};
  const AUDIT_LABELS={configured:'設定済み',direct_only:'公式導線のみ',researched_no_partner:'ASP商品なし確認',provider_found_unavailable:'掲載停止/予約不可',recheck_needed:'再調査',not_target:'対象外'};
  const PROVIDERS={
    ozmall:{label:'OZmall',domain:'ozmall.co.jp',linkswitch:true},
    ikyu_restaurant:{label:'一休.comレストラン',domain:'restaurant.ikyu.com',linkswitch:true},
    ikyu:{label:'一休.com',domain:'ikyu.com',linkswitch:true},
    jalan:{label:'じゃらんnet',domain:'jalan.net',linkswitch:true},
    jalan_activity:{label:'じゃらん 遊び・体験予約',domain:'jalan.net',linkswitch:true,note:'宿泊と同一ドメインのため、成果対象プログラムは遷移先商品も確認'},
    jtb:{label:'JTB',domain:'jtb.co.jp',linkswitch:true},
    yahoo_travel:{label:'Yahoo!トラベル',domain:'travel.yahoo.co.jp',linkswitch:true},
    asoview:{label:'アソビュー！',domain:'asoview.com',linkswitch:true,note:'LinkSwitch対応範囲が限定されるためURLごとに変換確認'},
    activity_japan:{label:'アクティビティジャパン',domain:'activityjapan.com',linkswitch:true},
    klook:{label:'KLOOK',domain:'klook.com',linkswitch:true}
  };
  const CANDIDATE_MAP=[
    [/OZmall/i,'ozmall'],[/一休\.comレストラン|一休レストラン/i,'ikyu_restaurant'],[/一休\.com|一休/i,'ikyu'],
    [/じゃらん\s*(?:遊び|体験)|じゃらん遊び|遊び・体験予約/i,'jalan_activity'],[/じゃらん/i,'jalan'],[/JTB/i,'jtb'],[/Yahoo/i,'yahoo_travel'],
    [/アソビュー/i,'asoview'],[/アクティビティジャパン/i,'activity_japan'],[/KLOOK|Klook|訪日OTA/i,'klook']
  ];
  let local=load();
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
  function persist(){localStorage.setItem(KEY,JSON.stringify(local));}
  function textBlob(spot){return [spot?.category_primary,...(spot?.categories||[]),...(spot?.ui_tags||[])].join('|').toLowerCase();}
  function isInboundSpot(spot){return ['A','B'].includes(String(spot?.inbound_profile?.inbound_fit||''))||/訪日向け/.test((spot?.ui_tags||[]).join('|'));}
  function isTicketLeisure(spot){const c=textBlob(spot);return /aquarium|zoo|theme|amusement|museum|science|interactive|pool|water_park|kids|play|observation|art_aquarium|studio_tour|leisure|ticket/.test(c);}
  function isHandsOn(spot){const c=textBlob(spot),e=spot?.experience_seed||{},v=spot?.vibes_seed||{};return Number(e.hands_on||0)>=65||Number(v.creative||0)>=70||/activity|workshop|craft|pottery|ceramic|kintsugi|glass|fragrance|kimono|sumo|tea|wagashi|cooking|food_experience|tour|cruise|kayak|sup|surf|diving|snorkel|outdoor|farm|harvest/.test(c);}
  function providerEligible(spot,p){
    if((cfg.sourceLinks?.[spot.spot_id]||[]).some(x=>x.provider===p)||(cfg.links?.[spot.spot_id]||[]).some(x=>x.provider===p))return true;
    const explicit=spot?.monetization?.provider_candidates||[];if(explicit.includes(p))return true;
    if(p==='asoview')return isTicketLeisure(spot)||isHandsOn(spot);
    if(p==='jalan_activity')return isHandsOn(spot)||isTicketLeisure(spot)&&Number(spot?.experience_seed?.hands_on||0)>=35;
    if(p==='activity_japan')return isHandsOn(spot);
    if(p==='klook')return isInboundSpot(spot)||/訪日OTA/.test((spot?.monetization?.channel_candidates||[]).join('|'));
    return true;
  }
  function providerCandidates(spot){
    const out=[];const add=p=>{if(PROVIDERS[p]&&providerEligible(spot,p)&&!out.includes(p))out.push(p)};
    (spot?.monetization?.provider_candidates||[]).forEach(add);
    (spot?.monetization?.channel_candidates||[]).forEach(text=>CANDIDATE_MAP.forEach(([re,key])=>{if(re.test(text))add(key)}));
    [...(cfg.links?.[spot.spot_id]||[]),...(cfg.sourceLinks?.[spot.spot_id]||[])].forEach(x=>x?.provider&&add(x.provider));
    // Old generic ticket candidates are narrowed by each provider's actual strength instead of exploding to every ASP.
    const generic=(spot?.monetization?.channel_candidates||[]).some(x=>/国内レジャーチケットASP|チケットASP/i.test(x));
    if(generic){if(isTicketLeisure(spot))add('asoview');if(isHandsOn(spot)){add('jalan_activity');add('activity_japan')}if(isInboundSpot(spot))add('klook');}
    return out;
  }
  function inferIntent(spot){const cats=[spot.category_primary,...(spot.categories||[])].join('|').toLowerCase();if(spot.overnight||/hotel|stay|ryokan|resort/.test(cats)&&!/hotel_lounge/.test(cats))return'stay';if(/food|cafe|restaurant|afternoon_tea|hotel_lounge|dining/.test(cats))return'food';return'experience';}
  function sourceSeed(spotId,provider){return (cfg.sourceLinks?.[spotId]||[]).find(x=>x.provider===provider)||null;}
  function manualSeed(spotId,provider){return (cfg.links?.[spotId]||[]).find(x=>x.provider===provider)||null;}
  function stateFor(spotId,provider){const key=spotId+'::'+provider,saved=local[key]||{},src=sourceSeed(spotId,provider),manual=manualSeed(spotId,provider);return {source_url:saved.source_url??src?.url??'',manual_url:saved.manual_url??manual?.url??'',seedSource:Boolean(src?.url),live:Boolean(manual&&(manual.url||manual.rawHtml)),dirty:Boolean(local[key])};}
  function saveField(spotId,provider,field,value){const key=spotId+'::'+provider;local[key]={...(local[key]||{}),[field]:value.trim()};if(!local[key].source_url&&!local[key].manual_url)delete local[key];persist();render();flash('保存しました');}
  function providerOptions(){const select=$('providerFilter');select.innerHTML='<option value="all" selected>すべて</option>'+Object.entries(PROVIDERS).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');}
  function candidateRows(){return seed.spots.filter(s=>['A','B'].includes(s?.monetization?.affiliate_fit||'')&&providerCandidates(s).length);}
  function currentFilters(){return {q:$('textFilter').value.trim().toLowerCase(),provider:$('providerFilter').value,fit:$('fitFilter').value,status:$('statusFilter').value,inbound:$('inboundFilter')?.value||'all',auditOutcome:$('auditOutcomeFilter')?.value||'all'};}
  function statusFor(st,provider){if(st.live)return'live';if(st.source_url&&PROVIDERS[provider]?.linkswitch&&!cfg.linkSwitch?.tagInstalled)return'waiting';if(st.source_url)return'source';return'missing';}
  function statusLabel(st,provider){return {live:'本番リンク済み',waiting:'LinkSwitch待ち',source:'元URLあり',missing:'未設定'}[statusFor(st,provider)];}
  function visibleRows(){const f=currentFilters(),rows=[];candidateRows().forEach(spot=>{const ao=auditStatus[spot.spot_id]?.status||'recheck_needed';if(f.auditOutcome!=='all'&&ao!==f.auditOutcome)return;let ps=providerCandidates(spot);if(f.provider!=='all')ps=ps.filter(p=>p===f.provider);if(!ps.length)return;if(f.fit!=='all'&&spot.monetization.affiliate_fit!==f.fit)return;if(f.inbound==='inbound'&&!isInboundSpot(spot))return;if(f.inbound==='standard'&&isInboundSpot(spot))return;if(f.q&&!`${spot.spot_id} ${spot.name} ${spot.city||''} ${(spot.ui_tags||[]).join(' ')}`.toLowerCase().includes(f.q))return;ps.forEach(provider=>{const st=stateFor(spot.spot_id,provider);if(f.status!=='all'&&statusFor(st,provider)!==f.status)return;rows.push({spot,provider,st});});});return rows;}
  function searchUrl(spot,provider){const d=PROVIDERS[provider]?.domain;if(!d)return `https://www.google.com/search?q=${encodeURIComponent(spot.name+' 予約')}`;return `https://www.google.com/search?q=${encodeURIComponent('site:'+d+' '+spot.name)}`;}
  function cardHtml(group){const spot=group.spot,fit=spot.monetization.affiliate_fit,providers=group.rows.map(r=>r.provider),ao=auditStatus[spot.spot_id]||{status:'recheck_needed',reason:'未監査'};return `<article class="audit-card"><div class="card-head"><div><span class="spot-id">${esc(spot.spot_id)}</span><h2>${esc(spot.name)}</h2><div class="place">${esc(spot.city||spot.prefecture||'')}${isInboundSpot(spot)?' · 訪日向け':''}</div></div><span class="chip fit-a">FIT ${esc(fit)}</span></div><div class="chips"><span class="chip audit-${esc(ao.status)}">監査 · ${esc(AUDIT_LABELS[ao.status]||ao.status)}</span>${providers.map(p=>{const st=stateFor(spot.spot_id,p),status=statusFor(st,p);return `<span class="chip ${status}">${esc(PROVIDERS[p]?.label||p)} · ${statusLabel(st,p)}</span>`}).join('')}</div><p class="audit-outcome-note">${esc(ao.reason||'')}</p>${group.rows.map(r=>providerEditor(spot,r.provider,r.st)).join('')}<div class="official">公式：<a href="${esc(spot.official_url||'#')}" target="_blank" rel="noopener">${esc(spot.official_url||'未登録')}</a></div></article>`;}
  function providerEditor(spot,provider,st){const meta=PROVIDERS[provider]||{label:provider};const hint=meta.note||meta.linkswitch?'通常ページURLでOK':'';const small=meta.note||hint;return `<div class="provider-editor" data-spot="${esc(spot.spot_id)}" data-provider="${esc(provider)}"><div class="provider-name">${esc(meta.label)}<br><small>${esc(small||'通常ページURLを登録')}</small></div><div class="fields"><div class="field-row"><span>元URL</span><input data-field="source_url" value="${esc(st.source_url)}" placeholder="https://..."><a class="open-btn" href="${searchUrl(spot,provider)}" target="_blank" rel="noopener">${esc(meta.label)}で探す ↗</a></div><div class="field-row"><span>手動Affiliate</span><input data-field="manual_url" value="${esc(st.manual_url)}" placeholder="必要な場合のみ"><span></span></div></div></div>`;}
  function render(){const rows=visibleRows(),grouped=[];rows.forEach(r=>{let g=grouped.find(x=>x.spot.spot_id===r.spot.spot_id);if(!g){g={spot:r.spot,rows:[]};grouped.push(g)}g.rows.push(r)});$('auditList').innerHTML=grouped.length?grouped.map(cardHtml).join(''):'<article class="audit-card"><h2>該当する候補はありません。</h2><p class="place">フィルターを変えてみてください。</p></article>';const all=candidateRows(),configured=rows.filter(r=>r.st.source_url||r.st.live).length,missing=rows.filter(r=>!r.st.source_url&&!r.st.live).length;$('summary').innerHTML=`<span class="metric"><strong>${grouped.length}</strong> スポット表示</span><span class="metric"><strong>${rows.length}</strong> Provider候補</span><span class="metric"><strong>${configured}</strong> 設定あり</span><span class="metric"><strong>${missing}</strong> 未設定</span><span class="metric">全候補 ${all.length}スポット</span>`;bindInputs();}
  function bindInputs(){document.querySelectorAll('.provider-editor input[data-field]').forEach(input=>input.addEventListener('change',e=>{const box=e.target.closest('.provider-editor');saveField(box.dataset.spot,box.dataset.provider,e.target.dataset.field,e.target.value)}));}
  function exportData(){const source_link_overrides={},manual_link_overrides={};candidateRows().forEach(spot=>providerCandidates(spot).forEach(provider=>{const st=stateFor(spot.spot_id,provider);if(st.source_url)(source_link_overrides[spot.spot_id]??=[]).push({provider,intent:inferIntent(spot),scope:'spot',url:st.source_url,label:`${PROVIDERS[provider]?.label||provider}で予約を見る`});if(st.manual_url)(manual_link_overrides[spot.spot_id]??=[]).push({provider,intent:inferIntent(spot),scope:'spot',url:st.manual_url,label:`${PROVIDERS[provider]?.label||provider}で予約を見る`})}));return {exported_at:new Date().toISOString(),source_link_overrides,manual_link_overrides};}
  async function copyText(text,msg){try{await navigator.clipboard.writeText(text);flash(msg)}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();flash(msg)}}
  function rowsTsv(rows){return ['spot_id\tname\tprovider\turl'].concat(rows.filter(r=>r.st.source_url).map(r=>[r.spot.spot_id,r.spot.name,PROVIDERS[r.provider]?.label||r.provider,r.st.source_url].join('\t'))).join('\n');}
  function missingTsv(rows){return ['spot_id\tname\tprovider\tsearch_url'].concat(rows.filter(r=>!r.st.source_url&&!r.st.live).map(r=>[r.spot.spot_id,r.spot.name,PROVIDERS[r.provider]?.label||r.provider,searchUrl(r.spot,r.provider)].join('\t'))).join('\n');}
  function flash(msg){$('flash').textContent=msg;clearTimeout(flash.t);flash.t=setTimeout(()=>$('flash').textContent='',2500)}
  function importData(obj){const src=obj?.source_link_overrides||{},man=obj?.manual_link_overrides||{};Object.entries(src).forEach(([sid,arr])=>(arr||[]).forEach(x=>{const key=sid+'::'+x.provider;local[key]={...(local[key]||{}),source_url:x.url||''}}));Object.entries(man).forEach(([sid,arr])=>(arr||[]).forEach(x=>{const key=sid+'::'+x.provider;local[key]={...(local[key]||{}),manual_url:x.url||''}}));persist();render();flash('JSONを読み込みました')}
  function checkProbe(){const a=$('linkSwitchProbe'),out=$('linkSwitchProbeStatus');if(!a||!out)return;const ok=/dalr\.valuecommerce\.com/i.test(a.href||'');out.textContent=ok?'OK · ValueCommerceリンクに変換されています':'未変換 · 提携状況を確認して数秒後に再試行';out.style.color=ok?'var(--green)':'var(--accent)';}
  function init(){providerOptions();const ready=Boolean(cfg.linkSwitch?.enabled&&cfg.linkSwitch?.tagInstalled);$('switchStatus').textContent=ready?'ON · 自動変換対象':'OFF · JSタグ待ち';$('switchStatus').style.color=ready?'var(--green)':'var(--accent)';$('switchNote').textContent=ready?'対応Providerの元URLは公開画面でLinkSwitch変換対象です。予約サイトの表示言語と現地の外国語対応は別々に確認します。':'今は監査・元URL収集だけ行います。';['textFilter','providerFilter','fitFilter','statusFilter','inboundFilter','auditOutcomeFilter'].filter(id=>$(id)).forEach(id=>$(id).addEventListener(id==='textFilter'?'input':'change',render));$('checkLinkSwitch')?.addEventListener('click',checkProbe);setTimeout(checkProbe,2200);$('copyProviderTsv').addEventListener('click',()=>copyText(rowsTsv(visibleRows()),'元URL一覧をコピーしました'));$('copyMissing').addEventListener('click',()=>copyText(missingTsv(visibleRows()),'未設定一覧をコピーしました'));$('copyJson').addEventListener('click',()=>copyText(JSON.stringify(exportData(),null,2),'設定JSONをコピーしました'));$('downloadJson').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(exportData(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kibun-affiliate-overrides.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);flash('JSONを保存しました')});$('importJson').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{importData(JSON.parse(await f.text()))}catch(err){flash('JSONを読み込めませんでした')}e.target.value=''});render();}
  init();
})();

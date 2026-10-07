(function installHeroAuditSourceManager(){
  if(typeof window==='undefined'||typeof document==='undefined')return;
  const params=new URLSearchParams(location.search);
  const hash=decodeURIComponent(location.hash||'');
  let persisted=false;
  try{persisted=localStorage.getItem('kibun-hero-audit-enabled')==='1';}catch(_e){}
  const enabled=params.get('heroAudit')==='1'||/(?:^|[?&#])heroAudit=1(?:&|$)/.test(hash)||persisted;
  if(!enabled)return;

  const REVIEW_KEY='kibun-image-source-review-v1';
  const STATIC_PROVIDERS=new Set(['owned','official_permission','wikimedia_commons','open_license']);
  const DECISION_LABELS={official:'公式候補',open_license:'CC候補',keep_google:'Google継続',hold:'保留'};
  const MODE_LABELS={static:'静的画像',kibun_image:'Kibunイメージ',detail_google:'詳細のみGoogle'};
  const PAGE_SIZE=60;
  let verified=new Map();
  let knownContacts=[];
  let currentFilter='action';
  let currentQuery='';
  let visibleLimit=PAGE_SIZE;

  function readReviews(){try{return JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}')||{};}catch(_e){return {};}}
  function writeReviews(value){try{localStorage.setItem(REVIEW_KEY,JSON.stringify(value));}catch(_e){}}
  function providerOf(spot){return String(spot?.media_strategy?.current_provider||spot?.hero_image?.type||'unknown');}
  function contactFor(spot){const name=String(spot?.name||'').toLowerCase();return knownContacts.find(c=>{const m=String(c.match_name||c.match||'').toLowerCase();return m&&(name===m||name.includes(m)||m.includes(name));})||null;}
  function hasPinnedPlace(spot){return Boolean(String(spot?.media_strategy?.google_places?.place_id||'').trim());}
  function modeFor(spot){return window.KibunMedia?.displayMode?.(spot)||spot?.media_strategy?.display_mode||(hasPinnedPlace(spot)?'detail_google':'kibun_image');}
  function classify(spot){
    const provider=providerOf(spot),exact=spot?.hero_image?.exact_spot;
    if(verified.has(spot.spot_id))return {status:'verified_static',label:'静的画像 登録済み',tone:'ok',provider};
    if(STATIC_PROVIDERS.has(provider)&&exact!==false)return {status:'existing_static',label:'静的画像 OK',tone:'ok',provider};
    if(hasPinnedPlace(spot))return {status:'google_pinned',label:'Google候補あり',tone:'google',provider};
    return {status:'needs_static_source',label:'画像ソース要対応',tone:'need',provider};
  }
  function searchUrls(spot){
    const q=encodeURIComponent(`${spot.name||''} ${spot.address||''}`.trim());
    return {official:spot.official_url||'',commons:`https://commons.wikimedia.org/w/index.php?search=${q}&title=Special:MediaSearch&type=image`,openverse:`https://openverse.org/search/image?q=${q}`};
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function matchesFilter(spot,status){
    const reviews=readReviews();
    if(currentFilter==='all')return true;
    if(currentFilter==='action')return status==='needs_static_source'||status==='google_pinned';
    if(currentFilter==='needs')return status==='needs_static_source';
    if(currentFilter==='google')return modeFor(spot)==='detail_google';
    if(currentFilter==='kibun')return modeFor(spot)==='kibun_image';
    if(currentFilter==='static')return modeFor(spot)==='static';
    if(currentFilter==='reviewed')return Boolean(reviews[spot.spot_id]);
    return true;
  }
  function matchesQuery(spot){
    const q=currentQuery.trim().toLowerCase();if(!q)return true;
    return [spot.name,spot.spot_id,spot.prefecture,spot.city,spot.address,...(spot.aliases||[])].join(' ').toLowerCase().includes(q);
  }
  function statusCounts(spots){
    const counts={all:spots.length,action:0,needs:0,google:0,kibun:0,static:0,reviewed:0};
    const reviews=readReviews();
    for(const s of spots){
      const st=classify(s).status,mode=modeFor(s);
      if(st==='needs_static_source'){counts.needs++;counts.action++;} else if(st==='google_pinned') counts.action++;
      if(mode==='detail_google')counts.google++;else if(mode==='static')counts.static++;else counts.kibun++;
      if(reviews[s.spot_id])counts.reviewed++;
    }
    return counts;
  }
  function updateReview(spotId,patch){const reviews=readReviews(),old=reviews[spotId]||{};reviews[spotId]={...old,...patch,updated_at:new Date().toISOString()};writeReviews(reviews);}
  function recordDecision(spotId,decision){updateReview(spotId,{decision});}
  function recordUrl(spot){const old=readReviews()[spot.spot_id]||{};const value=prompt(`${spot.name}\n候補画像の「出典ページURL」を記録`,old.source_url||'');if(value!==null)updateReview(spot.spot_id,{source_url:value.trim()});}
  function setMode(spot,mode){if(window.KibunMedia?.setAuditDisplayMode?.(spot.spot_id,mode)){updateReview(spot.spot_id,{display_mode:mode});return true;}return false;}

  function outreachText(spot){
    const name=spot.name||'施設';
    const subject=`【掲載画像ご提供のお願い】${name}｜Kibun Trip`;
    const email=`${name} ご担当者様\n\nはじめまして。関東近郊のおでかけ情報サービス「Kibun Trip」（https://kibuntrip.com/）を運営しております。\n\n現在、${name}様をKibun Tripのスポット紹介として掲載・ご紹介するにあたり、施設の雰囲気を正確にお伝えできる公式画像を1〜3点ご提供いただけないかと思い、ご連絡いたしました。\n\n【主な利用予定】\n・Kibun Trip内のスポット紹介ページ、一覧カード\n・関連記事、プランページ\n・Kibun Trip公式SNSでの紹介（必要に応じて）\n\n外観・内観・体験風景など、施設の魅力が伝わる横長のお写真がございましたら幸いです。クレジット表記、利用範囲、掲載期限、加工条件などの指定がございましたら、その条件に従います。画像の加工は原則として表示サイズに合わせたトリミング・リサイズ程度を想定しています。\n\nなお、Kibun Tripは編集型のおでかけ情報サービスで、サイト内に一部アフィリエイトリンクを含む場合があります。画像のご提供に費用が必要な場合も、その旨お知らせください。\n\nご提供可能な場合は、画像データまたはダウンロード可能なURLと、必要なクレジット表記・利用条件をご共有いただけますと幸いです。\n\nどうぞよろしくお願いいたします。\n\nKibun Trip 運営事務局\nWeb：https://kibuntrip.com/\nInstagram：@kibuntrip\nEmail：hello@kibuntrip.com`;
    const form=`お世話になります。関東近郊のおでかけ情報サービス「Kibun Trip」（https://kibuntrip.com/）を運営しております。${name}様を当サイトでご紹介するにあたり、Web掲載に使用可能な公式画像を1〜3点ご提供いただくことは可能でしょうか。外観・内観・体験風景など、施設の魅力が伝わる横長写真を希望しています。クレジット表記、利用範囲、掲載期限、加工条件等の指定がございましたら従います。サイト内には一部アフィリエイトリンクを含む場合があります。ご提供可能な場合は、画像データまたはダウンロードURLと利用条件をご案内いただけますと幸いです。Kibun Trip運営事務局 / hello@kibuntrip.com`;
    return {subject,email,form};
  }
  async function copyText(text,label){try{await navigator.clipboard.writeText(text);alert(`${label}をコピーしました。`);}catch(_e){prompt(label,text);}}
  async function copyExport(spots){
    const reviews=readReviews();
    const payload={exported_at:new Date().toISOString(),display_mode_overrides:window.KibunMedia?.getAuditDisplayModeOverrides?.()||{},source_reviews:Object.entries(reviews).map(([spot_id,v])=>({spot_id,...v})),summary:statusCounts(spots)};
    await copyText(JSON.stringify(payload,null,2),'画像ソース監査JSON');
  }

  function installStyles(){
    if(document.getElementById('kibun-image-source-audit-style'))return;
    const style=document.createElement('style');style.id='kibun-image-source-audit-style';style.textContent=`
.hero-source-btn{background:#f4efe5!important;color:#3e4d3e!important;border:1px solid #ded5c5!important}
.hero-source-panel,.hero-request-panel{position:fixed;inset:0;z-index:10050;background:rgba(24,29,25,.48);display:none;align-items:flex-end;justify-content:center;padding:18px}
.hero-source-panel.is-open,.hero-request-panel.is-open{display:flex}
.hero-source-sheet,.hero-request-sheet{width:min(980px,100%);height:min(88vh,900px);background:#fffdf9;border-radius:24px 24px 18px 18px;box-shadow:0 24px 70px rgba(24,29,25,.28);display:flex;flex-direction:column;overflow:hidden}
.hero-source-head,.hero-request-head{padding:18px 18px 12px;border-bottom:1px solid #eee8de;background:#fffdf9}
.hero-source-title-row,.hero-request-title-row{display:flex;align-items:flex-start;gap:12px;justify-content:space-between}
.hero-source-title-row h2,.hero-request-title-row h2{font-size:20px;line-height:1.25;margin:2px 0 4px;color:#28342c}
.hero-source-title-row p,.hero-request-title-row p{font-size:12px;line-height:1.55;color:#6d746d;margin:0;max-width:720px}
.hero-source-close,.hero-request-close{border:0;background:#f2eee7;border-radius:999px;width:36px;height:36px;font-size:20px;color:#3c463e;flex:0 0 auto}
.hero-source-controls{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;margin-top:13px}.hero-source-controls input,.hero-source-controls select,.hero-request-body input,.hero-request-body textarea{border:1px solid #dcd6cc;border-radius:12px;padding:10px 11px;background:white;font-size:14px;min-width:0;box-sizing:border-box;width:100%}
.hero-source-filter-row,.hero-source-modes,.hero-source-decisions,.hero-source-links{display:flex;gap:7px;flex-wrap:wrap}.hero-source-filter-row{overflow-x:auto;padding:10px 0 0;flex-wrap:nowrap;scrollbar-width:none}.hero-source-filter-row::-webkit-scrollbar{display:none}
.hero-source-filter,.hero-source-mode,.hero-source-decision{white-space:nowrap;border:1px solid #ddd6ca;background:#fff;border-radius:999px;padding:7px 10px;font-size:11px;color:#566057}.hero-source-filter.is-active,.hero-source-mode.is-selected,.hero-source-decision.is-selected{background:#40513d;color:white;border-color:#40513d}
.hero-source-summary{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;font-size:12px;color:#70776f}.hero-source-export{border:0;background:transparent;color:#40513d;text-decoration:underline;font-size:12px;padding:4px}
.hero-source-list{padding:12px 14px 24px;overflow:auto;display:grid;gap:10px;background:#f6f3ee;overscroll-behavior:contain}.hero-source-card{background:white;border:1px solid #e8e2d9;border-radius:16px;padding:13px;display:grid;gap:10px}.hero-source-card-top{display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.hero-source-card h3{font-size:15px;line-height:1.4;margin:0;color:#2d382f}.hero-source-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:5px;font-size:10px;color:#777f78}.hero-source-badge,.hero-source-review,.hero-source-mode-label{display:inline-flex;align-items:center;border-radius:999px;padding:4px 7px;font-size:10px;font-weight:700}.hero-source-badge.need{background:#fff0df;color:#9b5f24}.hero-source-badge.google{background:#eaf1ff;color:#466698}.hero-source-badge.ok{background:#e8f2e9;color:#4a6a4e}.hero-source-review{color:#776b59;background:#f4efe5}.hero-source-mode-label{background:#eef0eb;color:#40513d}
.hero-source-links a,.hero-source-open,.hero-source-url,.hero-source-request,.hero-source-more{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid #d9d4ca;background:#fff;color:#40513d;border-radius:10px;padding:8px 9px;font-size:11px;font-weight:600}.hero-source-request{background:#40513d;color:#fff;border-color:#40513d}.hero-source-more{margin:4px auto 0;min-width:180px}.hero-source-empty{padding:40px 20px;text-align:center;color:#777f78;font-size:13px}
.hero-request-body{padding:14px 16px 28px;overflow:auto;display:grid;gap:12px;background:#f6f3ee;overscroll-behavior:contain}.hero-request-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hero-request-field{display:grid;gap:5px}.hero-request-field span{font-size:11px;font-weight:700;color:#5c665d}.hero-request-body textarea{min-height:210px;resize:vertical;line-height:1.55}.hero-request-body textarea.short{min-height:140px}.hero-request-actions{display:flex;gap:8px;flex-wrap:wrap}.hero-request-actions button,.hero-request-actions a{border:0;border-radius:10px;background:#40513d;color:#fff;padding:10px 12px;font-size:12px;text-decoration:none}.hero-request-actions .secondary{background:#fff;color:#40513d;border:1px solid #d9d4ca}
@media(max-width:760px){.hero-source-panel,.hero-request-panel{padding:0;align-items:flex-end}.hero-source-sheet,.hero-request-sheet{height:92dvh;border-radius:22px 22px 0 0}.hero-source-head,.hero-request-head{padding:15px 14px 10px}.hero-source-title-row h2,.hero-request-title-row h2{font-size:18px}.hero-source-controls,.hero-request-grid{grid-template-columns:1fr}.hero-source-list{padding:10px 10px 28px}.hero-source-links a,.hero-source-open,.hero-source-url,.hero-source-request{flex:1 1 auto}.hero-source-card{padding:12px}}
`;
    document.head.appendChild(style);
  }

  function createRequestPanel(onSaved){
    const panel=document.createElement('div');panel.className='hero-request-panel';panel.setAttribute('aria-hidden','true');
    panel.innerHTML=`<section class="hero-request-sheet" role="dialog" aria-modal="true" aria-label="画像提供依頼文"><header class="hero-request-head"><div class="hero-request-title-row"><div><small style="font-size:10px;letter-spacing:.12em;color:#8a7e6c">OFFICIAL IMAGE REQUEST</small><h2>公式画像をお願いする</h2><p class="hero-request-spot"></p></div><button type="button" class="hero-request-close" aria-label="閉じる">×</button></div></header><div class="hero-request-body"><div class="hero-request-grid"><label class="hero-request-field"><span>連絡先メール（任意）</span><input type="email" data-request-email placeholder="press@example.jp"></label><label class="hero-request-field"><span>問い合わせフォームURL（任意）</span><input type="url" data-request-form placeholder="https://..."></label></div><label class="hero-request-field"><span>件名</span><input data-request-subject></label><label class="hero-request-field"><span>メール本文</span><textarea data-request-email-body></textarea></label><label class="hero-request-field"><span>問い合わせフォーム用（短縮版）</span><textarea class="short" data-request-form-body></textarea></label><div class="hero-request-actions"><button type="button" data-copy-email>メール文をコピー</button><button type="button" class="secondary" data-copy-form>フォーム文をコピー</button><a class="secondary" data-mailto href="#">メールアプリで開く</a><a class="secondary" data-open-form href="#" target="_blank" rel="noopener" hidden>フォームを開く</a></div></div></section>`;
    document.body.appendChild(panel);
    let current=null;
    const emailInput=panel.querySelector('[data-request-email]'),formInput=panel.querySelector('[data-request-form]'),subjectInput=panel.querySelector('[data-request-subject]'),emailBody=panel.querySelector('[data-request-email-body]'),formBody=panel.querySelector('[data-request-form-body]'),mailto=panel.querySelector('[data-mailto]'),openForm=panel.querySelector('[data-open-form]');
    const syncLinks=()=>{mailto.href=`mailto:${encodeURIComponent(emailInput.value.trim())}?subject=${encodeURIComponent(subjectInput.value)}&body=${encodeURIComponent(emailBody.value)}`;const form=formInput.value.trim();openForm.hidden=!/^https:\/\//.test(form);if(!openForm.hidden)openForm.href=form;};
    const save=()=>{if(!current)return;updateReview(current.spot_id,{contact_email:emailInput.value.trim(),contact_form_url:formInput.value.trim(),outreach_prepared:true});syncLinks();onSaved?.();};
    [emailInput,formInput].forEach(x=>x.addEventListener('change',save));[subjectInput,emailBody].forEach(x=>x.addEventListener('input',syncLinks));
    panel.querySelector('[data-copy-email]').addEventListener('click',()=>{save();copyText(`件名：${subjectInput.value}\n\n${emailBody.value}`,'メール文');});
    panel.querySelector('[data-copy-form]').addEventListener('click',()=>{save();copyText(formBody.value,'問い合わせフォーム文');});
    panel.querySelector('.hero-request-close').addEventListener('click',()=>{save();panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');});
    panel.addEventListener('click',e=>{if(e.target===panel){save();panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');}});
    panel.openFor=spot=>{current=spot;const review=readReviews()[spot.spot_id]||{},known=contactFor(spot)||{},text=outreachText(spot);panel.querySelector('.hero-request-spot').textContent=`${spot.name}への掲載画像提供依頼。${known.note?known.note+' · ':''}連絡先もここに記録できます。`;emailInput.value=review.contact_email||known.contact_email||'';formInput.value=review.contact_form_url||known.contact_form_url||'';subjectInput.value=text.subject;emailBody.value=text.email;formBody.value=text.form;syncLinks();panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');};
    return panel;
  }

  function createPanel(spots){
    const panel=document.createElement('div');panel.className='hero-source-panel';panel.setAttribute('aria-hidden','true');
    panel.innerHTML=`<section class="hero-source-sheet" role="dialog" aria-modal="true" aria-label="画像ソース監査"><header class="hero-source-head"><div class="hero-source-title-row"><div><small style="font-size:10px;letter-spacing:.12em;color:#8a7e6c">PRIVATE · IMAGE SOURCE AUDIT</small><h2>画像運用をまとめて管理</h2><p>一覧ではGoogleを呼ばず、各スポットを「静的画像 / Kibunイメージ / 詳細のみGoogle」に振り分けます。公式画像が必要なら依頼文もここで作れます。</p></div><button type="button" class="hero-source-close" aria-label="閉じる">×</button></div><div class="hero-source-controls"><input type="search" class="hero-source-search" placeholder="スポット名・地域で検索"><select class="hero-source-sort" aria-label="並び順"><option value="priority">要対応を上に</option><option value="name">名前順</option></select></div><div class="hero-source-filter-row"></div><div class="hero-source-summary"><span class="hero-source-count"></span><button type="button" class="hero-source-export">設定JSONをコピー</button></div></header><div class="hero-source-list"></div></section>`;
    document.body.appendChild(panel);
    const list=panel.querySelector('.hero-source-list'),search=panel.querySelector('.hero-source-search'),sort=panel.querySelector('.hero-source-sort'),filters=panel.querySelector('.hero-source-filter-row'),count=panel.querySelector('.hero-source-count');
    const requestPanel=createRequestPanel(()=>render());
    const filterDefs=[['action','要対応'],['google','詳細Google'],['kibun','Kibun画像'],['static','静的画像'],['reviewed','確認済み'],['all','すべて']];

    function render(){
      const counts=statusCounts(spots);
      filters.innerHTML=filterDefs.map(([key,label])=>`<button type="button" class="hero-source-filter ${key===currentFilter?'is-active':''}" data-filter="${key}">${label} ${counts[key]}</button>`).join('');
      let rows=spots.map(s=>({spot:s,c:classify(s)})).filter(({spot,c})=>matchesFilter(spot,c.status)&&matchesQuery(spot));
      if(sort.value==='name')rows.sort((a,b)=>String(a.spot.name).localeCompare(String(b.spot.name),'ja'));else rows.sort((a,b)=>{const weight={needs_static_source:0,google_pinned:1,verified_static:2,existing_static:2};return (weight[a.c.status]??9)-(weight[b.c.status]??9)||String(a.spot.name).localeCompare(String(b.spot.name),'ja');});
      const total=rows.length,shown=rows.slice(0,visibleLimit);count.textContent=`${Math.min(visibleLimit,total)}件表示 / 該当${total}件 / 全${spots.length}件`;
      const reviews=readReviews();
      list.innerHTML=shown.length?shown.map(({spot,c})=>{
        const urls=searchUrls(spot),review=reviews[spot.spot_id]||{},known=contactFor(spot),reviewLabel=review.decision?DECISION_LABELS[review.decision]||review.decision:'',mode=modeFor(spot);
        return `<article class="hero-source-card" data-spot-id="${escapeHtml(spot.spot_id)}"><div class="hero-source-card-top"><div><h3>${escapeHtml(spot.name)}</h3><div class="hero-source-meta"><span class="hero-source-badge ${c.tone}">${escapeHtml(c.label)}</span><span class="hero-source-mode-label">${escapeHtml(MODE_LABELS[mode]||mode)}</span>${reviewLabel?`<span class="hero-source-review">確認: ${escapeHtml(reviewLabel)}</span>`:''}${review.outreach_prepared?'<span class="hero-source-review">依頼文準備済み</span>':''}${known?'<span class="hero-source-review">連絡先候補あり</span>':''}<span>${escapeHtml(spot.city||spot.area||spot.prefecture||'')}</span>${hasPinnedPlace(spot)?'<span>Place ID固定</span>':''}</div></div><button type="button" class="hero-source-open" data-open-spot>Hero監査</button></div><div class="hero-source-modes">${Object.entries(MODE_LABELS).map(([key,label])=>`<button type="button" class="hero-source-mode ${mode===key?'is-selected':''}" data-mode="${key}">${label}</button>`).join('')}</div><div class="hero-source-links">${urls.official?`<a href="${escapeHtml(urls.official)}" target="_blank" rel="noopener">公式</a>`:''}<a href="${escapeHtml(urls.commons)}" target="_blank" rel="noopener">Commons</a><a href="${escapeHtml(urls.openverse)}" target="_blank" rel="noopener">Openverse</a><button type="button" class="hero-source-request" data-request>画像提供を依頼</button><button type="button" class="hero-source-url" data-record-url>${review.source_url?'候補URL ✓':'候補URLを記録'}</button></div><div class="hero-source-decisions">${Object.entries(DECISION_LABELS).map(([key,label])=>`<button type="button" class="hero-source-decision ${review.decision===key?'is-selected':''}" data-decision="${key}">${label}</button>`).join('')}</div>${review.contact_email?`<div style="font-size:10px;color:#6d746d">連絡先: ${escapeHtml(review.contact_email)}</div>`:''}${review.contact_form_url?`<div style="font-size:10px;color:#6d746d;word-break:break-all">フォーム: ${escapeHtml(review.contact_form_url)}</div>`:''}</article>`;
      }).join(''):'<div class="hero-source-empty">条件に合うスポットはありません。</div>';
      if(total>visibleLimit)list.insertAdjacentHTML('beforeend',`<button type="button" class="hero-source-more" data-more>さらに${Math.min(PAGE_SIZE,total-visibleLimit)}件表示</button>`);
      filters.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter;visibleLimit=PAGE_SIZE;render();}));
      list.querySelector('[data-more]')?.addEventListener('click',()=>{visibleLimit+=PAGE_SIZE;render();});
      list.querySelectorAll('.hero-source-card').forEach(card=>{
        const spot=spots.find(s=>s.spot_id===card.dataset.spotId);if(!spot)return;
        card.querySelector('[data-open-spot]')?.addEventListener('click',()=>{panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');const dock=document.querySelector('.hero-audit-dock'),sel=dock?.querySelector('#heroAuditSpotSelect'),searchBox=dock?.querySelector('#heroAuditSpotSearch');if(searchBox){searchBox.value=spot.name;searchBox.dispatchEvent(new Event('input',{bubbles:true}));}if(sel)sel.value=spot.spot_id;dock?.querySelector('#heroAuditOpen')?.click();});
        card.querySelector('[data-request]')?.addEventListener('click',()=>requestPanel.openFor(spot));
        card.querySelector('[data-record-url]')?.addEventListener('click',()=>{recordUrl(spot);render();});
        card.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.mode==='detail_google'&&!hasPinnedPlace(spot)){alert('「詳細のみGoogle」にするには、先にHero監査でGoogle Place IDを固定してください。');return;}setMode(spot,btn.dataset.mode);render();}));
        card.querySelectorAll('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>{recordDecision(spot.spot_id,btn.dataset.decision);render();}));
      });
    }
    search.addEventListener('input',()=>{currentQuery=search.value;visibleLimit=PAGE_SIZE;render();});sort.addEventListener('change',()=>{visibleLimit=PAGE_SIZE;render();});
    panel.querySelector('.hero-source-close').addEventListener('click',()=>{panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');});panel.addEventListener('click',e=>{if(e.target===panel){panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');}});panel.querySelector('.hero-source-export').addEventListener('click',()=>copyExport(spots));
    panel.openAudit=()=>{visibleLimit=PAGE_SIZE;render();panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');setTimeout(()=>search.focus(),50);};render();return panel;
  }

  async function loadData(){
    try{const url=new URL('verified-image-sources.json',document.baseURI),res=await fetch(url,{cache:'no-store'});if(res.ok){const data=await res.json();if(Array.isArray(data))verified=new Map(data.map(x=>[x.spot_id,x]));}}catch(_e){}
    try{const url=new URL('official-image-contacts.json',document.baseURI),res=await fetch(url,{cache:'no-store'});if(res.ok){const data=await res.json();if(Array.isArray(data))knownContacts=data;}}catch(_e){}
  }
  async function boot(){
    const spots=window.ODEKAKE_SEED?.spots||[];if(!spots.length){setTimeout(boot,150);return;}installStyles();await loadData();const panel=createPanel(spots);let tries=0;
    const attach=()=>{const dock=document.querySelector('.hero-audit-dock');if(!dock){if(tries++<80)setTimeout(attach,100);return;}if(dock.querySelector('[data-image-source-audit]'))return;const btn=document.createElement('button');btn.type='button';btn.className='hero-source-btn';btn.dataset.imageSourceAudit='1';btn.textContent='画像運用';btn.addEventListener('click',()=>panel.openAudit());const exportBtn=dock.querySelector('#heroAuditExport');if(exportBtn)exportBtn.insertAdjacentElement('beforebegin',btn);else dock.appendChild(btn);};attach();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);

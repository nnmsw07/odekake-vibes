const seed = window.ODEKAKE_SEED;
const { recommend } = window.OdekakeRecommender;

const VIBE_UI = {
  cool: ['🧊','涼みたい','暑さから逃げたい'],
  nature: ['🌿','自然に浸りたい','緑・山・川へ'],
  extraordinary: ['✨','非日常を味わいたい','いつもと違う一日'],
  culture: ['🏛️','文化にふれたい','博物館・音楽・歴史'],
  waterside: ['🌊','水辺へ行きたい','海・川・湖のそばへ'],
  animals: ['🐾','生きものに会いたい','動物・魚と出会う'],
  creative: ['🎨','何か作りたい','音・工作・表現'],
  food: ['🍓','おいしい体験がしたい','食べる・採る・作る'],
  active: ['🏃','思いっきり遊びたい','身体を動かす'],
  relax: ['🛋️','のんびりしたい','頑張らない一日'],
};

const vibeKeys = Object.keys(VIBE_UI);
let selectedVibes = [];
let lastResult = null;
let favorites = new Set(JSON.parse(localStorage.getItem('kibun-favorites') || '[]'));

const $ = (id) => document.getElementById(id);
const vibeGrid = $('vibeGrid');
const recommendBtn = $('recommendBtn');
const resultsSection = $('resultsSection');
const resultsGrid = $('resultsGrid');
const warningBox = $('coverageWarning');
const dialog = $('spotDialog');

function renderVibes(){
  vibeGrid.innerHTML = vibeKeys.map(key => {
    const [emoji,name,desc] = VIBE_UI[key];
    return `<button class="vibe-card ${selectedVibes.includes(key)?'selected':''}" data-vibe="${key}" type="button" aria-pressed="${selectedVibes.includes(key)}">
      <span class="vibe-emoji">${emoji}</span><span><span class="vibe-name">${name}</span><span class="vibe-desc">${desc}</span></span>
    </button>`;
  }).join('');
  vibeGrid.querySelectorAll('.vibe-card').forEach(btn => btn.addEventListener('click', () => toggleVibe(btn.dataset.vibe)));
  updateSelectionUi();
}

function toggleVibe(key){
  if(selectedVibes.includes(key)) selectedVibes = selectedVibes.filter(v=>v!==key);
  else if(selectedVibes.length < 3) selectedVibes.push(key);
  else selectedVibes = [...selectedVibes.slice(0,2), key];
  renderVibes();
}

function updateSelectionUi(){
  $('selectedHint').textContent = selectedVibes.length
    ? `${selectedVibes.length}/3 選択中${selectedVibes.length===3?' · これで十分！':' · もう少し重ねてもOK'}`
    : 'まずは気分を1つ選んでください';
  $('clearVibes').hidden = !selectedVibes.length;
  recommendBtn.disabled = !selectedVibes.length;
}

function context(){
  const ageVal = $('ageSelect').value;
  return {
    selectedVibes: [...selectedVibes],
    childAgeMonths: ageVal === '' ? null : Number(ageVal),
    weather: $('weatherSelect').value,
    availableMinutes: Number($('timeSelect').value),
    maxTravelMinutes: null,
  };
}

function vibeLabel(key){ return VIBE_UI[key]?.[1] || key; }
function vibeEmoji(key){ return VIBE_UI[key]?.[0] || '•'; }
function findSpot(id){ return seed.spots.find(s=>s.spot_id===id); }

function imageBadge(image){
  if(!image || image.type === 'photo') return '';
  return `<span class="image-badge">${image.label || 'イメージ'}</span>`;
}

function imageCredit(image, compact=false){
  if(!image) return '';
  if(image.type === 'photo' && image.credit){
    const label = [image.credit, image.license].filter(Boolean).join(' · ');
    return image.source_url
      ? `<a class="image-credit ${compact?'compact':''}" href="${image.source_url}" target="_blank" rel="noopener">Photo: ${label}</a>`
      : `<span class="image-credit ${compact?'compact':''}">Photo: ${label}</span>`;
  }
  return compact ? '' : `<p class="image-note">※ ${image.credit || '生成イメージ'}。実在施設の正確な外観・内観を示すものではありません。</p>`;
}

function imageBlock(s, variant='card'){
  const image = s.hero_image;
  if(!image?.url) return `<div class="${variant}-image image-fallback"><span>${vibeEmoji(Object.entries(s.vibes_seed||{}).sort((a,b)=>b[1]-a[1])[0]?.[0])}</span></div>`;
  return `<div class="${variant}-image image-shell">
    <img src="${image.url}" alt="${image.alt || s.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.classList.add('image-fallback');this.remove()">
    ${imageBadge(image)}
    ${variant==='card' ? imageCredit(image,true) : ''}
  </div>`;
}

function renderRecommendations(){
  lastResult = recommend(seed, context());
  warningBox.hidden = !lastResult.coverage_warning;
  warningBox.textContent = lastResult.coverage_warning || '';
  if(!lastResult.recommendations.length){
    resultsGrid.innerHTML = `<article class="result-card empty-result"><div class="empty-icon">🧭</div><h3>この気分、まだ開拓中です。</h3><p class="editorial">ぴったりと言える場所が少ないので、無理に3件は出しません。このバイブスのスポットをこれから増やしていきます。</p></article>`;
  } else {
    resultsGrid.innerHTML = lastResult.recommendations.map(resultCard).join('');
    wireResultActions();
  }
  resultsSection.hidden = false;
  setTimeout(()=>resultsSection.scrollIntoView({behavior:'smooth',block:'start'}),50);
}

function resultCard(r){
  const s=findSpot(r.spot_id);
  const css = r.slot==='best_match'?'best':r.slot==='adventure'?'adventure':'easy';
  const tags = selectedVibes.filter(v => (s.vibes_seed?.[v]||0)>=50).slice(0,3).map(v=>`<span class="mini-tag">${vibeEmoji(v)} ${vibeLabel(v)}</span>`).join('');
  const why = (r.why||[]).slice(0,2).map(x=>`<li>${translateReason(x)}</li>`).join('');
  const isFav=favorites.has(s.spot_id);
  return `<article class="result-card ${css}">
    <div class="card-media">
      ${imageBlock(s,'card')}
      <div class="slot-chip">${r.slot_label}</div>
      <div class="match-chip"><span>今日の気分との相性</span><strong>${Math.round(r.scores.overall)}<small>%</small></strong></div>
    </div>
    <div class="card-content">
      <h3>${s.name}</h3>
      <p class="editorial">${s.editorial_reason || ''}</p>
      <div class="vibe-tags">${tags}</div>
      <ul class="why-list">${why}</ul>
      <div class="card-actions"><button class="detail-btn" data-detail="${s.spot_id}">この場所を見る <span>→</span></button><button class="fav-btn ${isFav?'active':''}" data-fav="${s.spot_id}" aria-label="お気に入り">${isFav?'♥':'♡'}</button></div>
    </div>
  </article>`;
}

function wireResultActions(){
  resultsGrid.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>openSpot(b.dataset.detail)));
  resultsGrid.querySelectorAll('[data-fav]').forEach(b=>b.addEventListener('click',()=>toggleFavorite(b.dataset.fav)));
}

function translateReason(text){
  for(const key of vibeKeys){ if(text.startsWith(key+' ')) return text.replace(key,vibeLabel(key)); }
  return text;
}

function openSpot(id){
  const s=findSpot(id); if(!s) return;
  const ranked = Object.entries(s.vibes_seed||{}).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const d=s.dynamic_snapshot||{};
  $('dialogContent').innerHTML = `
    <div class="dialog-media">${imageBlock(s,'dialog')}</div>
    <div class="dialog-hero">
      <p class="eyebrow">${s.prefecture} · ${s.category_primary}</p>
      <h2>${s.name}</h2>
      <p class="dialog-copy">${s.editorial_reason||''}</p>
      <div class="info-pills"><span class="info-pill">🕐 約${Math.round((s.stay_minutes_seed||120)/60*10)/10}時間</span><span class="info-pill">👶 1歳相性 ${s.experience_seed?.baby_fit??'-'}</span><span class="info-pill">🌧 雨 ${s.experience_seed?.rain_resilience??'-'}</span><span class="info-pill">☀️ 暑さ ${s.experience_seed?.heat_resilience??'-'}</span></div>
      ${imageCredit(s.hero_image)}
    </div>
    <div class="dialog-body">
      <h3>この場所に合うバイブス</h3>
      <div class="vibe-bars">${ranked.map(([k,v])=>`<div class="vibe-bar"><span>${vibeEmoji(k)} ${vibeLabel(k).replace('したい','').replace('行きたい','')}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${v}%"></span></span><strong>${v}</strong></div>`).join('')}</div>
      <div class="fact-box"><h4>今日行く前に確認</h4><p><strong>営業時間：</strong>${d.opening_hours_text||'要確認'}</p><p><strong>料金：</strong>${d.price_summary||'要確認'}</p><p><strong>予約：</strong>${d.reservation_summary||'要確認'}</p>${d.age_note?`<p><strong>年齢：</strong>${d.age_note}</p>`:''}${d.temporary_note?`<p><strong>臨時情報：</strong>${d.temporary_note}</p>`:''}<p class="freshness">最終確認: ${d.checked_at||'未記録'} ※営業時間・料金は必ず公式サイトで再確認してください。</p></div>
      <div class="fact-box"><h4>アクセス</h4><p>${s.address}</p><a class="official-link" href="${s.official_url}" target="_blank" rel="noopener">公式サイトを見る →</a></div>
    </div>`;
  dialog.showModal();
}

function toggleFavorite(id){
  favorites.has(id)?favorites.delete(id):favorites.add(id);
  localStorage.setItem('kibun-favorites',JSON.stringify([...favorites]));
  $('favoriteCount').textContent=favorites.size;
  if(lastResult && !resultsSection.hidden){
    const y=window.scrollY;
    resultsGrid.innerHTML = lastResult.recommendations.map(resultCard).join('');
    wireResultActions();
    window.scrollTo(0,y);
  }
}

$('clearVibes').addEventListener('click',()=>{selectedVibes=[];renderVibes()});
recommendBtn.addEventListener('click',renderRecommendations);
$('editBtn').addEventListener('click',()=>document.querySelector('.hero').scrollIntoView({behavior:'smooth'}));
$('dialogClose').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
$('favoritesBtn').addEventListener('click',()=>alert(favorites.size?`お気に入り ${favorites.size}件\n${[...favorites].map(id=>'・'+findSpot(id)?.name).join('\n')}`:'まだお気に入りはありません。'));
document.querySelectorAll('.collection-card').forEach(btn=>btn.addEventListener('click',()=>{
  selectedVibes=btn.dataset.vibes.split(',').slice(0,3);
  renderVibes();
  document.querySelector('.hero').scrollIntoView({behavior:'smooth'});
}));
$('favoriteCount').textContent=favorites.size;
renderVibes();

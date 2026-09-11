(()=>{
const seed=window.ODEKAKE_SEED||{spots:[]},perf=window.KIBUN_PERFORMANCES||{performances:[]},evt=window.KIBUN_EVENTS||{events:[]};
const spots=seed.spots||[],byId=Object.fromEntries(spots.map(s=>[s.spot_id,s]));
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TYPE_LABEL={all:'すべて',performance:'舞台・音楽',exhibition:'企画展・展示',seasonal:'季節イベント',family:'親子イベント',workshop:'ワークショップ',festival:'フェス・催事',experience:'体験',show:'ショー'};
const GENRE_LABEL={ballet:'バレエ',opera:'オペラ',musical:'ミュージカル',theater:'演劇',kabuki:'歌舞伎',noh_kyogen:'能・狂言',classical:'クラシック',dance:'ダンス',live:'ライブ',family:'親子向け'};
const typeOrder=['all','performance','exhibition','seasonal','family','workshop','festival','experience','show'];
const areas=[['all','すべて'],['tokyo','東京'],['kanagawa','神奈川']];
const whens=[['all','今後すべて'],['today','今日'],['7','7日以内'],['30','30日以内'],['90','90日以内']];
const audiences=[['all','すべて'],['family','子どもと'],['adult','大人時間'],['international','海外ゲストにも']];
let type=new URLSearchParams(location.search).get('type')||'all',area='all',when='all',audience='all';
const localToday=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
const today=localToday();
function parse(s){return new Date(`${s}T00:00:00`)}
function fmt(a,b){const x=parse(a),y=parse(b||a),md=d=>`${d.getMonth()+1}.${d.getDate()}`;return a===(b||a)?`${x.getMonth()+1}月${x.getDate()}日`:x.getFullYear()===y.getFullYear()&&x.getMonth()===y.getMonth()?`${x.getMonth()+1}月${x.getDate()}日–${y.getDate()}日`:`${md(x)}–${md(y)}`}
function norm(){
 const p=(perf.performances||[]).map(x=>({...x,item_kind:'performance',event_type:'performance',audience:(x.tags||[]).includes('family')?['family']:[],venue_label:null}));
 const e=(evt.events||[]).map(x=>({...x,item_kind:'event'}));
 return [...p,...e].filter(x=>(x.end_date||x.start_date)>=today).sort((a,b)=>a.start_date.localeCompare(b.start_date)||String(a.title).localeCompare(String(b.title),'ja'));
}
function isToday(x){
 if(x.item_kind==='performance') return x.start_date===today&&x.end_date===today;
 if(x.availability==='specific_dates') return (x.specific_dates||[]).includes(today);
 if(x.availability==='scheduled_range') return false;
 return x.start_date<=today&&(x.end_date||x.start_date)>=today;
}
function withinDays(x,n){const end=new Date();end.setHours(0,0,0,0);end.setDate(end.getDate()+n);return parse(x.start_date)<=end&&parse(x.end_date||x.start_date)>=parse(today)}
function matches(x){
 const s=byId[x.venue_spot_id]||{};
 if(type!=='all'&&x.event_type!==type)return false;
 if(area==='tokyo'&&s.prefecture!=='東京都')return false;
 if(area==='kanagawa'&&s.prefecture!=='神奈川県')return false;
 if(when==='today'&&!isToday(x))return false;
 if(['7','30','90'].includes(when)&&!withinDays(x,Number(when)))return false;
 if(audience!=='all'){
   const a=x.audience||[];
   if(audience==='adult'&&!(a.includes('adult')||x.item_kind==='performance'))return false;
   if(audience!=='adult'&&!a.includes(audience))return false;
 }
 const q=$('whatsOnSearch').value.trim().toLowerCase();
 const hay=[x.title,x.title_en,x.venue_label,s.name,...(s.aliases||[]),x.schedule_summary].filter(Boolean).join(' ').toLowerCase();
 return !q||hay.includes(q);
}
function label(x){return x.item_kind==='performance'?(GENRE_LABEL[x.genre]||'舞台・音楽'):(TYPE_LABEL[x.event_type]||x.event_type)}
function status(x){if(isToday(x))return '今日';if(x.start_date<=today&&(x.end_date||x.start_date)>=today)return '開催中';return 'これから'}
function card(x){const s=byId[x.venue_spot_id]||{},venue=x.venue_label||s.name||'',summary=x.schedule_summary||'';return `<article class="performance-hub-card whats-on-card"><div class="performance-date-block"><b>${esc(fmt(x.start_date,x.end_date))}</b><span>${esc(label(x))}</span><em>${esc(status(x))}</em></div><div class="performance-card-copy"><small>${esc(s.city||'')} · ${esc(venue)}</small><h3>${esc(x.title)}</h3>${summary?`<p>${esc(summary)}</p>`:''}<div class="performance-card-tags">${(x.audience||[]).includes('family')?'<span>子どもと</span>':''}${x.indoor===true?'<span>雨の日◎</span>':''}${x.reservation_expected===true?'<span>予約推奨</span>':''}${x.age_note?`<span>${esc(x.age_note)}</span>`:''}</div></div><div class="performance-card-actions"><a class="outline-btn" href="/?spot=${encodeURIComponent(x.venue_spot_id)}&source=whats_on">場所を見る</a><a class="primary-link" href="${esc(x.official_url||s.official_url||'#')}" target="_blank" rel="noopener">公式で確認 →</a></div></article>`}
function chips(root,items,current,key){root.innerHTML=items.map(([k,l])=>`<button type="button" class="performance-filter-chip ${current===k?'active':''}" data-${key}="${k}">${l}</button>`).join('')}
function renderFilters(){
 chips($('whatsOnTypeFilters'),typeOrder.map(k=>[k,TYPE_LABEL[k]]),type,'type');chips($('whatsOnAreaFilters'),areas,area,'area');chips($('whatsOnWhenFilters'),whens,when,'when');chips($('whatsOnAudienceFilters'),audiences,audience,'audience');
 document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{type=b.dataset.type;renderFilters();render()});document.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{area=b.dataset.area;renderFilters();render()});document.querySelectorAll('[data-when]').forEach(b=>b.onclick=()=>{when=b.dataset.when;renderFilters();render()});document.querySelectorAll('[data-audience]').forEach(b=>b.onclick=()=>{audience=b.dataset.audience;renderFilters();render()});
}
function render(){const items=norm().filter(matches);$('whatsOnCount').textContent=`${items.length}件`;$('whatsOnGrid').innerHTML=items.map(card).join('');$('whatsOnEmpty').hidden=items.length>0}
$('whatsOnSearch').addEventListener('input',render);renderFilters();render();
})();

(() => {
  'use strict';

  const STORAGE_KEY = 'kibun-mini-plan-v1';
  const MODE_KEY = 'kibun-mini-plan-mode-v1';
  const COORD_CACHE_KEY = 'kibun-mini-plan-coords-v1';
  const API_BASE = location.hostname.endsWith('.app.github.dev') ? '/api' : 'https://kibun-api.misawa-nana7.workers.dev';
  const seed = window.ODEKAKE_SEED || {};
  const spots = Array.isArray(seed.spots) ? seed.spots : [];
  const byId = new Map(spots.map((spot) => [String(spot.spot_id), spot]));
  let travelMode = localStorage.getItem(MODE_KEY) || 'transit';
  let coordCache = readJson(COORD_CACHE_KEY, {});
  let routeToken = 0;
  let swapTargetId = null;
  let observerBusy = false;

  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (_) { return fallback; }
  }
  function saveJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function planIds() { return (readJson(STORAGE_KEY, []) || []).map(String).filter((id) => byId.has(id)); }

  function toast(message) {
    const el = $('mpToast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(el._enhanceTimer);
    el._enhanceTimer = setTimeout(() => { el.hidden = true; }, 2100);
  }

  function ensureEnhanceStyles() {
    if (document.getElementById('mpEnhanceV6Styles')) return;
    const style = document.createElement('style');
    style.id = 'mpEnhanceV6Styles';
    style.textContent = `
      .mp-swap-stop{
        width:auto!important;height:auto!important;margin-top:7px;padding:5px 8px!important;
        display:inline-flex;align-items:center;gap:4px;border:1px solid rgba(83,107,87,.16)!important;
        border-radius:999px!important;background:#f1f4ef!important;color:var(--mp-green-dark)!important;
        font:inherit!important;font-size:8px!important;font-weight:800!important;line-height:1.2!important;
      }
      .mp-swap-stop .mp-swap-icon{font-size:12px;line-height:1}
      .mp-travel-status-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:7px 2px 0}
      .mp-travel-status-row .mp-travel-status{margin:0;min-width:0}
      .mp-travel-retry{flex:0 0 auto;border:1px solid var(--mp-line);border-radius:999px;background:#fff;color:var(--mp-green-dark);padding:6px 9px;font:inherit;font-size:8px;font-weight:800}
      .mp-travel-status.is-error{color:#9a6255}
      .mp-travel-status.is-ok{color:var(--mp-green-dark);font-weight:700}
    `;
    document.head.appendChild(style);
  }

  function ensureTravelRetryUi() {
    const status = $('mpTravelStatus');
    if (!status || status.parentElement?.classList.contains('mp-travel-status-row')) return;
    const row = document.createElement('div');
    row.className = 'mp-travel-status-row';
    status.parentNode.insertBefore(row, status);
    row.appendChild(status);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.id = 'mpTravelRetry';
    retry.className = 'mp-travel-retry';
    retry.textContent = '再取得';
    retry.hidden = true;
    row.appendChild(retry);
    retry.addEventListener('click', refreshTravelTimes);
  }

  function setTravelStatus(message, state = 'neutral', retry = false) {
    const status = $('mpTravelStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', state === 'error');
    status.classList.toggle('is-ok', state === 'ok');
    const button = $('mpTravelRetry');
    if (button) button.hidden = !retry;
  }

  function roleFor(spot) {
    const keys = [spot?.category_primary, ...(spot?.categories || [])].join(' ').toLowerCase();
    if (/restaurant|cafe|food|dining|afternoon/.test(keys)) return ['食事・休憩', 'eat'];
    if (/park|garden|nature|outdoor|beach|water/.test(keys)) return ['外で過ごす', 'outdoor'];
    if (/museum|art|culture|library|theater|stage/.test(keys)) return ['観る・知る', 'culture'];
    if (/shopping|mall|market/.test(keys)) return ['買い物・寄り道', 'shop'];
    if (/spa|bath|onsen|relax|hotel/.test(keys)) return ['休む・整える', 'relax'];
    if (/kids|play|amusement|zoo|aquarium|experience/.test(keys)) return ['遊ぶ・体験', 'play'];
    return ['立ち寄る', 'place'];
  }

  function stayMinutes(spot) {
    const value = Number(spot?.stay_minutes_seed || spot?.recommended_duration || 120);
    return Number.isFinite(value) && value > 0 ? value : 120;
  }

  function durationFor(spot) {
    const minutes = stayMinutes(spot);
    return minutes < 60 ? `滞在 約${minutes}分` : `滞在 約${Math.round((minutes / 60) * 10) / 10}時間`;
  }

  function areaScore(a, b) {
    let score = 0;
    if (a.city && b.city && a.city === b.city) score += 55;
    else if (a.prefecture && b.prefecture && a.prefecture === b.prefecture) score += 20;
    const at = `${a.city || ''} ${a.address || ''}`;
    const bt = `${b.city || ''} ${b.address || ''}`;
    for (const key of ['横浜','みなとみらい','鎌倉','藤沢','川崎','渋谷','新宿']) if (at.includes(key) && bt.includes(key)) score += 15;
    return score;
  }

  function similarCandidates(target) {
    const selected = new Set(planIds());
    const targetRole = roleFor(target)[1];
    const targetCategories = new Set(target.categories || []);
    return spots
      .filter((spot) => String(spot.spot_id) !== String(target.spot_id) && !selected.has(String(spot.spot_id)))
      .map((spot) => {
        const roleScore = roleFor(spot)[1] === targetRole ? 100 : 0;
        const overlap = (spot.categories || []).filter((c) => targetCategories.has(c)).length;
        const durationPenalty = Math.min(40, Math.abs(stayMinutes(spot) - stayMinutes(target)) / 6);
        const buzz = Number(spot.buzz?.score || 0) / 8;
        return { spot, score: roleScore + areaScore(target, spot) + overlap * 8 + buzz - durationPenalty };
      })
      .filter((entry) => entry.score >= 55)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.spot);
  }

  function addSwapButtons() {
    document.querySelectorAll('#mpPlanStops .mp-plan-stop').forEach((stop) => {
      const copy = stop.querySelector('.mp-stop-copy');
      const actions = stop.querySelector('.mp-stop-actions');
      const move = actions?.querySelector('[data-move-stop]');
      if (!copy || !move || stop.querySelector('[data-swap-stop]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mp-swap-stop';
      button.dataset.swapStop = move.dataset.moveStop;
      button.setAttribute('aria-label', '似た候補に入れ替える');
      button.innerHTML = '<span class="mp-swap-icon" aria-hidden="true">↺</span><span>似た候補に入れ替え</span>';
      copy.appendChild(button);
    });
  }

  function openSwap(targetId) {
    const target = byId.get(String(targetId));
    if (!target) return;
    swapTargetId = String(targetId);
    const candidates = similarCandidates(target);
    $('mpSwapTitle').textContent = `「${target.name || 'このスポット'}」を入れ替える`;
    $('mpSwapSubtitle').textContent = '近いエリア・似た過ごし方から3件だけ。';
    $('mpSwapList').innerHTML = candidates.length ? candidates.map((spot) => {
      const [role] = roleFor(spot);
      return `<button class="mp-swap-card" type="button" data-swap-to="${esc(spot.spot_id)}"><span><small>${esc(spot.city || spot.prefecture || '')} · ${esc(role)} · ${esc(durationFor(spot))}</small><strong>${esc(spot.name || '')}</strong></span><b>入れ替える</b></button>`;
    }).join('') : '<p class="mp-swap-empty">近い条件の候補が見つかりませんでした。</p>';
    $('mpSwapPanel').hidden = false;
    $('mpSwapPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeSwap() {
    swapTargetId = null;
    if ($('mpSwapPanel')) $('mpSwapPanel').hidden = true;
  }

  function forceGridSpot(newId, callback) {
    const activeArea = document.querySelector('#mpAreaFilters [data-area].active')?.dataset.area || 'all';
    const oldQuery = $('mpSearch').value;
    document.querySelector('#mpAreaFilters [data-area="all"]')?.click();
    $('mpSearch').value = byId.get(String(newId))?.name || '';
    $('mpSearch').dispatchEvent(new Event('input', { bubbles: true }));
    const add = document.querySelector(`[data-add-spot="${CSS.escape(String(newId))}"]`);
    if (add && !add.disabled) add.click();
    $('mpSearch').value = oldQuery;
    $('mpSearch').dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector(`#mpAreaFilters [data-area="${CSS.escape(activeArea)}"]`)?.click();
    setTimeout(callback, 0);
  }

  function moveNewSpotToIndex(newId, targetIndex) {
    let safety = 8;
    while (safety-- > 0) {
      const ids = planIds();
      const current = ids.indexOf(String(newId));
      if (current <= targetIndex || current < 0) break;
      const up = document.querySelector(`#mpPlanStops [data-move-stop="${CSS.escape(String(newId))}"][data-direction="-1"]`);
      if (!up || up.disabled) break;
      up.click();
    }
  }

  function replaceSpot(newId) {
    if (!swapTargetId || !byId.has(String(newId))) return;
    const ids = planIds();
    const targetIndex = ids.indexOf(String(swapTargetId));
    if (targetIndex < 0) return;
    const removeTarget = () => document.querySelector(`#mpPlanStops [data-remove-stop="${CSS.escape(String(swapTargetId))}"]`)?.click();

    if (ids.length < 4) {
      forceGridSpot(newId, () => {
        removeTarget();
        setTimeout(() => { moveNewSpotToIndex(newId, targetIndex); closeSwap(); toast('似た候補に入れ替えました'); }, 0);
      });
    } else {
      removeTarget();
      setTimeout(() => forceGridSpot(newId, () => {
        moveNewSpotToIndex(newId, targetIndex);
        closeSwap();
        toast('似た候補に入れ替えました');
      }), 0);
    }
  }

  function coordKey(spot) { return String(spot.spot_id || `${spot.name}|${spot.address}`); }

  async function apiReady() {
    try {
      const response = await fetch(`${API_BASE}/health`, { headers:{accept:'application/json'}, cache:'no-store' });
      if (!response.ok) return false;
      const payload = await response.json();
      return payload?.ok === true;
    } catch (_) {
      return false;
    }
  }

  async function resolveCoord(spot) {
    const lat = Number(spot.lat ?? spot.latitude), lng = Number(spot.lng ?? spot.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    const key = coordKey(spot), cached = coordCache[key];
    if (cached && Number.isFinite(Number(cached.lat)) && Number.isFinite(Number(cached.lng))) return { lat:Number(cached.lat), lng:Number(cached.lng) };
    const q = [spot.name, spot.address || `${spot.prefecture || ''} ${spot.city || ''}`].filter(Boolean).join(' ');
    const response = await fetch(`${API_BASE}/location-search?q=${encodeURIComponent(q)}`, { headers:{accept:'application/json'} });
    if (!response.ok) throw new Error(`location-search:${response.status}`);
    const candidate = (await response.json()).candidates?.[0];
    if (!candidate) throw new Error('location-not-found');
    const coord = { lat:Number(candidate.lat), lng:Number(candidate.lng) };
    coordCache[key] = coord;
    saveJson(COORD_CACHE_KEY, coordCache);
    return coord;
  }

  async function segmentMinutes(from, to) {
    const [origin, dest] = await Promise.all([resolveCoord(from), resolveCoord(to)]);
    const response = await fetch(`${API_BASE}/travel-times`, {
      method:'POST', headers:{'content-type':'application/json',accept:'application/json'},
      body:JSON.stringify({origin,destinations:[{spot_id:String(to.spot_id),lat:dest.lat,lng:dest.lng}],mode:travelMode})
    });
    if (!response.ok) throw new Error(`travel-times:${response.status}`);
    const minutes = Number((await response.json()).times?.[String(to.spot_id)]);
    return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
  }

  function renderMode() {
    document.querySelectorAll('[data-travel-mode]').forEach((button) => button.classList.toggle('active', button.dataset.travelMode === travelMode));
  }

  async function refreshTravelTimes() {
    const token = ++routeToken;
    const ids = planIds();
    const chosen = ids.map((id) => byId.get(id)).filter(Boolean);
    const rows = [...document.querySelectorAll('#mpPlanStops .mp-move-row')];
    if (!rows.length || chosen.length < 2) return;

    ensureTravelRetryUi();
    setTravelStatus(`${travelMode === 'transit' ? '公共交通' : '車'}の実移動時間を取得中…`);
    rows.forEach((row) => { const span=row.querySelector('.mp-move-copy span'); if(span) span.textContent='実際の所要時間を確認中…'; });

    const ready = await apiReady();
    if (token !== routeToken) return;
    if (!ready) {
      rows.forEach((row) => { const span=row.querySelector('.mp-move-copy span'); if(span) span.textContent='Google Mapsで確認'; });
      setTravelStatus(
        location.hostname.endsWith('.app.github.dev')
          ? '移動時間APIに接続できません。Previewサーバーを再起動してください'
          : 'Kibun APIに接続できません。しばらくして再取得してください',
        'error', true
      );
      return;
    }

    const tasks = chosen.slice(0,-1).map(async (from,index) => {
      try {
        const minutes = await segmentMinutes(from, chosen[index+1]);
        return { minutes, error:null };
      } catch (error) {
        return { minutes:null, error:String(error?.message || error) };
      }
    });
    const results = await Promise.all(tasks);
    if (token !== routeToken) return;

    results.forEach((result,index) => {
      const span=rows[index]?.querySelector('.mp-move-copy span');
      if(span) span.textContent=result.minutes ? `${travelMode === 'transit' ? '公共交通' : '車'} 約${result.minutes}分` : 'Google Mapsで確認';
    });

    const values = results.map((result) => result.minutes);
    const valid=values.filter(Number.isFinite);
    if(valid.length===values.length && valid.length){
      setTravelStatus(`移動の目安 合計約${valid.reduce((a,b)=>a+b,0)}分（${travelMode === 'transit' ? '公共交通' : '車'}）`, 'ok', false);
      return;
    }

    const errors = results.map((result) => result.error).filter(Boolean);
    const routeError = errors.some((error) => error.startsWith('travel-times:'));
    setTravelStatus(
      routeError
        ? 'Google Routesから取得できない区間があります。再取得または地図で確認してください'
        : '位置情報を取得できないスポットがあります。再取得または地図で確認してください',
      'error', true
    );
  }

  function enhancePlan() {
    if(observerBusy) return;
    observerBusy=true;
    try { addSwapButtons(); renderMode(); refreshTravelTimes(); } finally { observerBusy=false; }
  }

  $('mpPlanStops')?.addEventListener('click', (event) => {
    const swap=event.target.closest('[data-swap-stop]');
    if(swap){ event.preventDefault(); event.stopPropagation(); openSwap(swap.dataset.swapStop); }
  }, true);

  $('mpSwapPanel')?.addEventListener('click', (event) => {
    if(event.target.closest('#mpSwapClose')){ closeSwap(); return; }
    const candidate=event.target.closest('[data-swap-to]');
    if(candidate) replaceSpot(candidate.dataset.swapTo);
  });

  $('mpTravelModes')?.addEventListener('click', (event) => {
    const button=event.target.closest('[data-travel-mode]');
    if(!button) return;
    travelMode=button.dataset.travelMode;
    localStorage.setItem(MODE_KEY,travelMode);
    renderMode();
    refreshTravelTimes();
  });

  $('mpBuildPlan')?.addEventListener('click', () => setTimeout(enhancePlan, 0));
  $('mpRecommendOrder')?.addEventListener('click', () => setTimeout(enhancePlan, 0));

  const observer = new MutationObserver(() => setTimeout(enhancePlan, 0));
  if($('mpPlanStops')) observer.observe($('mpPlanStops'), {childList:true});
  ensureEnhanceStyles();
  ensureTravelRetryUi();
  renderMode();
})();

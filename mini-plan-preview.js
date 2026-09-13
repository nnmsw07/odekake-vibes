(() => {
  'use strict';

  const STORAGE_KEY = 'kibun-mini-plan-v1';
  const MAX_SPOTS = 4;
  const HALF_DAY_MAX_MINUTES = 330;
  const seed = window.ODEKAKE_SEED || {};
  const spots = Array.isArray(seed.spots) ? seed.spots : [];
  const byId = new Map(spots.map((spot) => [String(spot.spot_id), spot]));

  const $ = (id) => document.getElementById(id);
  const grid = $('mpSpotGrid');
  const search = $('mpSearch');
  const count = $('mpResultCount');
  const showMore = $('mpShowMore');
  const dock = $('mpDock');
  const buildButton = $('mpBuildPlan');
  const planDialog = $('mpPlanDialog');
  const filters = $('mpAreaFilters');

  let area = 'yokohama';
  let visibleLimit = 16;
  let selectedIds = sanitizeSelection(loadSelection());
  let toastTimer = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function loadSelection() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch (_) {
      return [];
    }
  }

  function sanitizeSelection(ids) {
    const unique = [];
    for (const id of ids) {
      const normalized = String(id);
      if (!byId.has(normalized) || unique.includes(normalized)) continue;
      unique.push(normalized);
      if (unique.length >= MAX_SPOTS) break;
    }
    return unique;
  }

  function saveSelection() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch (_) {
      // Preview remains usable in-memory when localStorage is unavailable.
    }
  }

  function areaMatch(spot) {
    const prefecture = String(spot.prefecture || '');
    const city = String(spot.city || '');
    const address = String(spot.address || '');
    const text = `${prefecture} ${city} ${address}`;
    if (area === 'all') return true;
    if (area === 'yokohama') return /横浜/.test(text);
    if (area === 'tokyo') return /東京都|東京/.test(prefecture);
    if (area === 'shonan') return /鎌倉|藤沢|茅ヶ崎|逗子|葉山|湘南/.test(text);
    return true;
  }

  function searchMatch(spot, query) {
    if (!query) return true;
    const haystack = [
      spot.name, spot.prefecture, spot.city, spot.address,
      ...(spot.aliases || []), ...(spot.categories || []), ...(spot.ui_tags || [])
    ].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function roleFor(spot) {
    const keys = [spot.category_primary, ...(spot.categories || [])].join(' ').toLowerCase();
    if (/restaurant|cafe|food|dining|afternoon/.test(keys)) return ['EAT / CAFE', '食事・休憩'];
    if (/park|garden|nature|outdoor|beach|water/.test(keys)) return ['OUTDOOR', '外で過ごす'];
    if (/museum|art|culture|library|theater|stage/.test(keys)) return ['CULTURE', '観る・知る'];
    if (/shopping|mall|market/.test(keys)) return ['SHOP', '買い物・寄り道'];
    if (/spa|bath|onsen|relax|hotel/.test(keys)) return ['RELAX', '休む・整える'];
    if (/kids|play|amusement|zoo|aquarium|experience/.test(keys)) return ['PLAY / TRY', '遊ぶ・体験'];
    return ['PLACE', '立ち寄る'];
  }

  function stayMinutes(spot) {
    const value = Number(spot.stay_minutes_seed || spot.recommended_duration || 120);
    return Number.isFinite(value) && value > 0 ? value : 120;
  }

  function durationFor(spot) {
    const minutes = stayMinutes(spot);
    if (minutes < 60) return `滞在 約${minutes}分`;
    const hours = Math.round((minutes / 60) * 10) / 10;
    return `滞在 約${hours}時間`;
  }

  function planMeta(chosen) {
    const minutes = chosen.reduce((sum, spot) => sum + stayMinutes(spot), 0);
    const isDay = chosen.length >= 4 || minutes > HALF_DAY_MAX_MINUTES;
    const hours = Math.round((minutes / 60) * 10) / 10;
    return {
      minutes,
      hours,
      isDay,
      title: isDay ? '今日の1日プラン' : '今日の半日プラン',
      label: isDay ? '1日向き' : '半日向き',
      note: isDay
        ? '4スポットまたは滞在時間が長めです。ゆったり回るなら1日プランがおすすめ。'
        : '2〜3スポットで、無理なく回りやすいボリュームです。'
    };
  }

  function heroSource(spot) {
    const hero = spot.hero_image;
    if (typeof hero === 'string') return hero;
    if (!hero || typeof hero !== 'object') return '';
    return hero.src || hero.url || hero.path || hero.local_path || '';
  }

  function selectedSpots() {
    return selectedIds.map((id) => byId.get(id)).filter(Boolean);
  }

  function filteredSpots() {
    const query = String(search?.value || '').trim();
    return spots
      .filter((spot) => areaMatch(spot) && searchMatch(spot, query))
      .sort((a, b) => {
        const aSelected = selectedIds.includes(String(a.spot_id)) ? 1 : 0;
        const bSelected = selectedIds.includes(String(b.spot_id)) ? 1 : 0;
        if (aSelected !== bSelected) return bSelected - aSelected;
        const aBuzz = Number(a.buzz?.score || 0);
        const bBuzz = Number(b.buzz?.score || 0);
        return bBuzz - aBuzz || String(a.name || '').localeCompare(String(b.name || ''), 'ja');
      });
  }

  function cardHtml(spot) {
    const id = String(spot.spot_id);
    const isSelected = selectedIds.includes(id);
    const isFull = selectedIds.length >= MAX_SPOTS;
    const [roleEnglish, roleJapanese] = roleFor(spot);
    const hero = heroSource(spot);
    const image = hero ? `<img src="${escapeHtml(hero)}" alt="" loading="lazy" onerror="this.remove()">` : '';
    const copy = String(spot.public_copy || spot.editorial?.lead || '').trim();
    const buttonLabel = isSelected
      ? '✓ プランに追加済み'
      : isFull
        ? '4件選択済み'
        : '＋ プランに追加';

    return `
      <article class="mp-spot-card ${isSelected ? 'is-selected' : ''}" data-spot-card="${escapeHtml(id)}">
        <div class="mp-spot-visual">
          ${image}
          <span class="mp-role">${escapeHtml(roleEnglish)}</span>
          <span class="mp-added-mark" aria-hidden="true">✓</span>
        </div>
        <div class="mp-spot-copy">
          <small>${escapeHtml(spot.prefecture || '')}${spot.city ? ` · ${escapeHtml(spot.city)}` : ''} · ${escapeHtml(roleJapanese)}</small>
          <strong>${escapeHtml(spot.name || '名称未設定')}</strong>
          ${copy ? `<p>${escapeHtml(copy)}</p>` : ''}
        </div>
        <button class="mp-add-button" type="button" data-add-spot="${escapeHtml(id)}"
          aria-pressed="${isSelected}" ${!isSelected && isFull ? 'disabled' : ''}>
          ${buttonLabel}
        </button>
      </article>`;
  }

  function renderGrid() {
    const items = filteredSpots();
    const shown = items.slice(0, visibleLimit);
    count.textContent = `${items.length}スポット · ${selectedIds.length}/${MAX_SPOTS}件選択中`;
    grid.innerHTML = shown.length ? shown.map(cardHtml).join('') :
      '<div class="mp-empty">条件に合うスポットがありません。エリアや検索ワードを変えてみてください。</div>';
    showMore.hidden = items.length <= visibleLimit;
    showMore.textContent = `もっと見る（残り${Math.max(0, items.length - visibleLimit)}件）`;
    updateDock();
    $('mpClearPlanTop').hidden = selectedIds.length === 0;
  }

  function renderFilters() {
    filters.querySelectorAll('[data-area]').forEach((button) => {
      button.classList.toggle('active', button.dataset.area === area);
    });
  }

  function toggleSpot(id) {
    const normalized = String(id);
    if (selectedIds.includes(normalized)) {
      selectedIds = selectedIds.filter((item) => item !== normalized);
      showToast('プランから外しました');
    } else {
      if (!byId.has(normalized)) return;
      if (selectedIds.length >= MAX_SPOTS) {
        showToast('Mini Planは4スポットまでです');
        return;
      }
      selectedIds.push(normalized);
      showToast(selectedIds.length === 1 ? '追加しました。あと1ヶ所選んでみてください' : 'Mini Planに追加しました');
    }
    saveSelection();
    renderGrid();
    if (planDialog?.open) renderPlan();
  }

  function moveSpot(id, direction) {
    const normalized = String(id);
    const from = selectedIds.indexOf(normalized);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= selectedIds.length) return;
    [selectedIds[from], selectedIds[to]] = [selectedIds[to], selectedIds[from]];
    saveSelection();
    renderGrid();
    renderPlan();
    showToast('順番を入れ替えました');
  }

  function clearPlan() {
    selectedIds = [];
    saveSelection();
    renderGrid();
    if (planDialog?.open) planDialog.close();
    showToast('Mini Planを空にしました');
  }

  function updateDock() {
    const length = selectedIds.length;
    dock.hidden = length === 0;
    if (!length) return;

    $('mpDockCount').textContent = `${length}スポット選択中`;
    if (length === 1) {
      $('mpDockHint').textContent = 'あと1つでプランにできます';
    } else {
      const meta = planMeta(selectedSpots());
      $('mpDockHint').textContent = meta.isDay
        ? 'この組み合わせは1日プラン向き'
        : '半日プランにちょうどいい';
    }

    $('mpDockDots').innerHTML = selectedIds.map(() => '<i></i>').join('');
    buildButton.disabled = length < 2;
    buildButton.querySelector('span').textContent = length < 2 ? 'もう1つ選ぶ' : 'プランを見る';
  }

  function mapPointFor(spot) {
    const lat = Number(spot.lat ?? spot.latitude);
    const lng = Number(spot.lng ?? spot.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return `${lat},${lng}`;

    const name = String(spot.name || '').trim();
    const address = String(spot.address || '').trim();
    const city = String(spot.city || '').trim();
    const prefecture = String(spot.prefecture || '').trim();
    return [name, address || [prefecture, city].filter(Boolean).join(' ')].filter(Boolean).join(' ');
  }

  function googleMapsRouteUrl(chosen) {
    if (chosen.length < 2) return '';
    const params = new URLSearchParams();
    params.set('api', '1');
    params.set('destination', mapPointFor(chosen[chosen.length - 1]));
    const waypoints = chosen.slice(0, -1).map(mapPointFor).filter(Boolean);
    if (waypoints.length) params.set('waypoints', waypoints.join('|'));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function openGoogleMaps() {
    const chosen = selectedSpots();
    const url = googleMapsRouteUrl(chosen);
    if (!url) {
      showToast('2スポット以上選んでください');
      return;
    }
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = url;
  }

  function renderPlan() {
    const chosen = selectedSpots();
    const meta = planMeta(chosen);
    $('mpPlanTitle').textContent = meta.title;
    $('mpPlanSummary').textContent = `${chosen.length}スポット · 滞在の目安 合計${meta.hours}時間（移動時間を除く）`;

    const notice = $('mpPlanNotice');
    notice.classList.toggle('is-day', meta.isDay);
    notice.innerHTML = `<strong>${meta.label}</strong><span>${escapeHtml(meta.note)}</span>`;

    $('mpPlanStops').innerHTML = chosen.map((spot, index) => {
      const [, roleJapanese] = roleFor(spot);
      const id = escapeHtml(spot.spot_id);
      const name = escapeHtml(spot.name || '名称未設定');
      return `
        <article class="mp-plan-stop">
          <span class="mp-stop-num">${String(index + 1).padStart(2, '0')}</span>
          <div class="mp-stop-copy">
            <small>${escapeHtml(roleJapanese)} · ${escapeHtml(durationFor(spot))}</small>
            <strong>${name}</strong>
          </div>
          <div class="mp-stop-actions" aria-label="${name}の順番を変更">
            <button type="button" class="mp-order-button" data-move-stop="${id}" data-direction="-1"
              aria-label="${name}を前へ" ${index === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="mp-order-button" data-move-stop="${id}" data-direction="1"
              aria-label="${name}を後ろへ" ${index === chosen.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="mp-remove-stop" data-remove-stop="${id}" aria-label="${name}を外す">外す</button>
          </div>
        </article>`;
    }).join('');

    $('mpAddAnother').hidden = chosen.length >= MAX_SPOTS;
    $('mpGoogleMaps').disabled = chosen.length < 2;
  }

  function openPlan() {
    if (selectedIds.length < 2) {
      showToast('あと1ヶ所選ぶとプランにできます');
      return;
    }
    renderPlan();
    planDialog.showModal();
  }

  function showToast(message) {
    const toast = $('mpToast');
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2100);
  }

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-spot]');
    if (!button) return;
    toggleSpot(button.dataset.addSpot);
  });

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-area]');
    if (!button) return;
    area = button.dataset.area;
    visibleLimit = 16;
    renderFilters();
    renderGrid();
  });

  search.addEventListener('input', () => {
    visibleLimit = 16;
    renderGrid();
  });

  showMore.addEventListener('click', () => {
    visibleLimit += 16;
    renderGrid();
  });

  buildButton.addEventListener('click', openPlan);
  $('mpPlanClose').addEventListener('click', () => planDialog.close());
  $('mpGoogleMaps').addEventListener('click', openGoogleMaps);
  $('mpAddAnother').addEventListener('click', () => {
    planDialog.close();
    setTimeout(() => search.focus(), 80);
  });
  $('mpClearPlan').addEventListener('click', clearPlan);
  $('mpClearPlanTop').addEventListener('click', clearPlan);

  $('mpPlanStops').addEventListener('click', (event) => {
    const moveButton = event.target.closest('[data-move-stop]');
    if (moveButton) {
      moveSpot(moveButton.dataset.moveStop, Number(moveButton.dataset.direction));
      return;
    }
    const removeButton = event.target.closest('[data-remove-stop]');
    if (!removeButton) return;
    toggleSpot(removeButton.dataset.removeStop);
    if (selectedIds.length < 2 && planDialog.open) planDialog.close();
  });

  planDialog.addEventListener('click', (event) => {
    if (event.target === planDialog) planDialog.close();
  });

  saveSelection();
  renderFilters();
  renderGrid();

  if (!spots.length) {
    count.textContent = 'スポットデータを読み込めませんでした';
    grid.innerHTML = '<div class="mp-empty">data.js のスポットデータを読み込めませんでした。</div>';
  }
})();

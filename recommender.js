(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OdekakeRecommender = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DEFAULT_VIBE_WEIGHTS = [1, .7, .7];
  const UNKNOWN_VIBE_SCORE = 50;
  const MAX_RECOMMENDATIONS = 10;
  const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

  function weightedMean(values, neutral = 70) {
    if (!values.length) return neutral;
    const den = values.reduce((a, [, w]) => a + w, 0);
    return den ? values.reduce((a, [v, w]) => a + v * w, 0) / den : neutral;
  }

  function vibeMatchScore(spot, selected) {
    if (!selected?.length) return 70;
    if (selected.length > 3) throw new Error('気分は最大3つまでです');
    const vibes = spot.vibes_seed || {};
    return weightedMean(selected.map((v, i) => {
      const value = Number(vibes[v]);
      return [Number.isFinite(value) ? value : UNKNOWN_VIBE_SCORE, DEFAULT_VIBE_WEIGHTS[i]];
    }));
  }

  function ageFitScore(spot, ageMonths) {
    if (ageMonths === null || ageMonths === undefined || ageMonths === '') return 70;
    const e = spot.experience_seed || {};
    const baby = Number(e.baby_fit ?? 50), toddler = Number(e.toddler_fit ?? 50), age = Number(ageMonths);
    if (age < 18) return baby;
    if (age < 48) return toddler;
    return .7 * toddler + 30;
  }

  function audienceFitScore(spot, audience) {
    return Number((spot.audience_fit || {})[audience || 'family'] ?? 70);
  }

  function weatherFitScore(spot, weather) {
    const e = spot.experience_seed || {};
    if (!weather || weather === 'any') return 70;
    if (weather === 'rain') return Number(e.rain_resilience ?? 50);
    if (weather === 'hot') return Number(e.heat_resilience ?? 50);
    if (weather === 'clear') return clamp(65 + .15 * Math.max(Number(e.outdoor ?? 50), Number(e.indoor ?? 50)));
    if (weather === 'cold') return clamp(55 + .4 * Number(e.indoor ?? 50));
    return 70;
  }

  function timeFitScore(spot, m) {
    if (!m) return 70;
    const stay = Number(spot.stay_minutes_seed || 120);
    if (Number(m) >= stay) {
      const margin = Math.min(Number(m) - stay, stay);
      return clamp(90 + 10 * margin / Math.max(stay, 1));
    }
    return clamp(90 - 85 * (stay - Number(m)) / Math.max(stay, 1));
  }

  function travelFitScore(id, max, map) {
    if (!max || !map) return 70;
    const raw = map[id];
    if (raw === null || raw === undefined || raw === '' || !Number.isFinite(Number(raw))) return 70;
    return clamp(100 - 48 * Number(raw) / Math.max(Number(max), 1));
  }

  function jstDateKey(value) {
    const d = value ? new Date(value) : new Date();
    if (Number.isNaN(d.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    const m = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return `${m.year}-${m.month}-${m.day}`;
  }

  function inDateRange(day, range) {
    if (!day || !range) return false;
    const from = range.from || '0000-01-01', until = range.until || '9999-12-31';
    return day >= from && day <= until;
  }

  function availabilityConstraintReason(avc, ctx) {
    if (!avc || !Object.keys(avc).length) return null;
    const now = ctx.currentDate ? new Date(ctx.currentDate) : new Date();
    if (avc.unavailable_until) {
      const resume = new Date(`${avc.unavailable_until}T00:00:00+09:00`);
      if (!Number.isNaN(resume.getTime()) && now < resume) return avc.note || '現在は利用できない';
    }
    const day = jstDateKey(now);
    if (!day) return null;
    const available = Array.isArray(avc.available_ranges) ? avc.available_ranges : [];
    if (available.length && !available.some(r => inDateRange(day, r))) return avc.note || '営業期間外';
    const unavailable = Array.isArray(avc.unavailable_ranges) ? avc.unavailable_ranges : [];
    const blocked = unavailable.find(r => inDateRange(day, r));
    if (blocked) return blocked.note || avc.note || '休館・休業日';
    return null;
  }

  function shoppingIntentEligible(spot) {
    const p = String(spot?.category_primary || '').toLowerCase(), v = Number(spot?.vibes_seed?.shopping || 0);
    if (v < 75) return false;
    if (/theme|amusement|aquarium|zoo|pool|water_resort|resort_pool|entertainment_park|character_theme/.test(p)) return false;
    return /shopping|mall|outlet|market|mixed_use|urban_.*complex|culture_complex|lifestyle|district|street|t-site|wellbeing_complex/.test(p)
      || (/shopping/.test((spot?.categories || []).join('|').toLowerCase()) && !/theme|amusement|aquarium|zoo|pool/.test(p));
  }

  function hardFilterReason(spot, ctx) {
    const sid = spot.spot_id;
    if (ctx.audience === 'dog' && spot.pet_profile?.status !== true) return '犬連れ条件を公式確認できていない';
    if (spot.recommendation_mode === 'browse_only' && !ctx.includeBrowseOnly) return '日時指定型スポットはブラウズ向け';
    if (spot.overnight && !ctx.allowOvernight) return '宿泊候補はオフ';
    const age = (ctx.childAgeMonths === null || ctx.childAgeMonths === undefined || ctx.childAgeMonths === '') ? null : Number(ctx.childAgeMonths);
    const ac = spot.age_constraints || {};
    if (age !== null && !ac.soft) {
      if (ac.min_months !== undefined && age < Number(ac.min_months)) return ac.note || '年齢条件に合わない';
      if (ac.max_months !== undefined && age > Number(ac.max_months)) return ac.note || '年齢条件に合わない';
    }
    const avc = spot.availability_constraints || {};
    const constraintReason = availabilityConstraintReason(avc, ctx);
    if (constraintReason) return constraintReason;
    const av = (ctx.availabilityBySpot || {})[sid] || {};
    if (av.age_allowed === false) return '年齢条件に合わない';
    if ((ctx.goNow || ctx.requireOpenNow) && av.is_open === false) return '営業していない';
    if (ctx.requireReservation && av.reservation_available === false) return '予約枠がない';
    if (ctx.maxTravelMinutes) {
      const raw = ctx.travelMinutesBySpot?.[sid];
      const known = raw !== null && raw !== undefined && raw !== '' && Number.isFinite(Number(raw));
      if (ctx.requireKnownTravel && !known) return '所要時間を取得できない';
      if (known && Number(raw) > Number(ctx.maxTravelMinutes)) return '移動時間が上限を超える';
    }
    return null;
  }

  function baseScores(spot, ctx) {
    const legacy = !ctx.audience;
    const audience = legacy ? 70 : audienceFitScore(spot, ctx.audience);
    const hasChild = legacy
      ? (ctx.childAgeMonths !== null && ctx.childAgeMonths !== undefined && ctx.childAgeMonths !== '')
      : ctx.audience === 'family' && ctx.childAgeMonths !== null && ctx.childAgeMonths !== undefined && ctx.childAgeMonths !== '';
    const scores = {
      vibe: vibeMatchScore(spot, ctx.selectedVibes || []),
      audience,
      age: hasChild ? ageFitScore(spot, ctx.childAgeMonths) : 70,
      weather: weatherFitScore(spot, ctx.weather),
      time: timeFitScore(spot, ctx.availableMinutes),
      travel: travelFitScore(spot.spot_id, ctx.maxTravelMinutes, ctx.travelMinutesBySpot)
    };
    const weights = legacy
      ? {vibe:.55,audience:0,age:.15,weather:.10,time:.10,travel:.10}
      : hasChild
        ? {vibe:.47,audience:.13,age:.12,weather:.09,time:.09,travel:.10}
        : {vibe:.50,audience:.20,age:0,weather:.10,time:.09,travel:.11};
    scores.overall = Object.entries(weights).reduce((sum, [k, w]) => sum + scores[k] * w, 0);
    if (ctx.allowOvernight && spot.overnight) scores.overall = clamp(scores.overall + 8);
    if ((ctx.selectedVibes || []).includes('shopping') && !shoppingIntentEligible(spot)) scores.overall = clamp(scores.overall - 10);
    const av = (ctx.availabilityBySpot || {})[spot.spot_id] || {};
    if (!ctx.goNow && !ctx.requireOpenNow && av.is_open === false) scores.overall = clamp(scores.overall - 6);
    if (!ctx.requireReservation && av.reservation_available === false) scores.overall = clamp(scores.overall - 4);
    return scores;
  }

  function easyScore(spot, overall, audience = 'family') {
    const e = spot.experience_seed || {}, v = spot.vibes_seed || {};
    const ease = 100 - Number(e.planning_friction ?? 50), lowWalk = 100 - Number(e.walking_load ?? 50), rest = Number(e.parent_rest ?? 50), quiet = Number(e.quietness ?? 50), adult = Number(spot.adult_enjoyment_seed ?? 50);
    if (audience === 'partner') return .48 * overall + .16 * ease + .12 * quiet + .12 * adult + .12 * Number(v.relax ?? 50);
    if (audience === 'solo') return .46 * overall + .18 * ease + .17 * quiet + .11 * lowWalk + .08 * adult;
    if (audience === 'friends') return .52 * overall + .16 * ease + .12 * Number(e.food_experience ?? 50) + .10 * lowWalk + .10 * Number(e.hands_on ?? 50);
    if (audience === 'dog') return .50 * overall + .17 * ease + .13 * Number(v.stroll ?? 50) + .10 * Number(v.relax ?? 50) + .10 * (spot.pet_profile?.dog_run ? 100 : 65);
    return .45 * overall + .25 * ease + .15 * lowWalk + .15 * rest;
  }

  function adventureScore(spot, overall, bestCat) {
    const extra = Number((spot.vibes_seed || {}).extraordinary ?? 50), active = Number((spot.experience_seed || {}).physical_activity ?? 50);
    let score = .60 * overall + .28 * extra + .12 * active;
    if (bestCat && spot.category_primary === bestCat) score -= 12;
    return score;
  }

  function reasonLines(spot, ctx, scores) {
    const lines = [], v = spot.vibes_seed || {}, e = spot.experience_seed || {}, aud = ctx.audience || 'family';
    for (const vibe of (ctx.selectedVibes || []).slice(0, 2)) {
      const val = v[vibe];
      if (val !== undefined && val >= 75) lines.push(`${vibe} が強い（${Math.round(val)}）`);
    }
    if (aud === 'family') {
      if (scores.audience >= 86) lines.push('子どもと一緒に過ごしやすい');
      if (ctx.childAgeMonths !== null && ctx.childAgeMonths !== undefined && ctx.childAgeMonths !== '' && scores.age >= 85) lines.push('子どもの年齢との相性が良い');
    } else if (aud === 'partner') {
      if (scores.audience >= 86) lines.push('ふたりで過ごす休日に向いている');
      if (Number(v.scenic ?? 0) >= 80) lines.push('景色も一緒に楽しみやすい');
      else if (Number(v.food ?? 0) >= 80) lines.push('食事やカフェを組み合わせやすい');
      else if (Number(v.relax ?? 0) >= 80) lines.push('急がずゆっくり過ごしやすい');
    } else if (aud === 'solo') {
      if (scores.audience >= 86) lines.push('ひとりで自分のペースを作りやすい');
      if (Number(e.quietness ?? 0) >= 75) lines.push('落ち着いて過ごしやすい');
      else if (Number(v.culture ?? 0) >= 80) lines.push('ひとりでじっくり見て回りやすい');
    } else if (aud === 'friends') {
      if (scores.audience >= 86) lines.push('友だちと一緒に楽しみやすい');
      if (Number(e.hands_on ?? 0) >= 75 || Number(v.active ?? 0) >= 80) lines.push('一緒に体験して盛り上がりやすい');
      else if (Number(v.food ?? 0) >= 80 || Number(v.shopping ?? 0) >= 80) lines.push('食べる・見るを一緒に楽しみやすい');
    } else if (aud === 'dog') {
      if (scores.audience >= 86) lines.push('わんこと一緒に過ごしやすい');
      if (spot.pet_profile?.dog_run) lines.push('ドッグランも使える');
      else if ((spot.pet_profile?.areas || []).some(x => String(x).includes('terrace'))) lines.push('犬同伴でテラスを使いやすい');
      else if (Number(v.stroll ?? 0) >= 80) lines.push('一緒に散歩を楽しみやすい');
    }
    if (spot.overnight && ctx.allowOvernight) lines.push('泊まりで日常を切り替えやすい');
    if (ctx.weather === 'hot' && scores.weather >= 85) lines.push('暑い日でも過ごしやすい');
    if (ctx.weather === 'rain' && scores.weather >= 85) lines.push('雨でも過ごしやすい');
    if (ctx.travelMinutesBySpot?.[spot.spot_id] != null) lines.push(`${ctx.travelMinutesBySpot[spot.spot_id]}分くらいで行けそう`);
    if (!lines.length && spot.public_copy) lines.push(spot.public_copy);
    return [...new Set(lines)].slice(0, 3);
  }

  function slotLabels(audience) {
    return audience === 'partner' ? {best_match:'いちばんハマる',adventure:'ちょっと特別',easy:'ゆっくり過ごす'}
      : audience === 'solo' ? {best_match:'いちばんハマる',adventure:'気分転換',easy:'自分のペース'}
      : audience === 'friends' ? {best_match:'いちばんハマる',adventure:'盛り上がる',easy:'ゆるく楽しむ'}
      : audience === 'dog' ? {best_match:'一緒に行きたい',adventure:'のびのび遊ぶ',easy:'ゆっくり散歩'}
      : {best_match:'いちばんハマる',adventure:'ちょっと冒険',easy:'無理しない'};
  }

  function payload(spot, ctx, scores) {
    return {
      spot_id: spot.spot_id,
      name: spot.name,
      slug: spot.slug,
      category_primary: spot.category_primary,
      public_copy: spot.public_copy,
      scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v * 10) / 10])),
      travel_minutes: ctx.travelMinutesBySpot?.[spot.spot_id] ?? null,
      why: reasonLines(spot, ctx, scores)
    };
  }

  function groupKey(spot) {
    return spot.recommendation_group || spot.spot_id;
  }

  function categoryFamily(spot) {
    const p = String(spot?.category_primary || '').toLowerCase();
    const all = [spot?.category_primary, ...(spot?.categories || [])].join('|').toLowerCase();
    const x = `${p}|${all}`;
    if (/food|cafe|restaurant|dining|market|afternoon_tea|hotel_lounge/.test(x)) return 'food';
    if (/park|nature|garden|forest|beach|waterside|outdoor/.test(x)) return 'nature';
    if (/museum|gallery|culture|art|library|temple|architecture|theater|stage|performing/.test(x)) return 'culture';
    if (/theme|amusement|zoo|aquarium|pool|play|activity|entertainment/.test(x)) return 'activity';
    if (/shopping|mall|outlet|market|district|street|complex/.test(x)) return 'shopping';
    if (/workshop|creative|craft|experience|pottery|glass|fragrance|hands_on/.test(x)) return 'experience';
    if (/spa|onsen|bath|relax|lounge/.test(x)) return 'relax';
    if (spot?.overnight || /hotel|stay|ryokan/.test(x)) return 'stay';
    return p || 'other';
  }

  function chooseSpecial(candidates, used, usedGroups, scorer, minVibe) {
    let best = null;
    for (const pair of candidates) {
      const [spot, scores] = pair;
      if (used.has(spot.spot_id) || usedGroups.has(groupKey(spot)) || scores.vibe < minVibe) continue;
      const value = scorer(pair);
      if (!best || value > best.value) best = {pair, value};
    }
    return best?.pair || null;
  }

  function fillDiversified(candidates, recs, used, usedGroups, ctx, minVibe, limit) {
    const categoryCounts = new Map();
    for (const rec of recs) {
      const spot = candidates.find(([s]) => s.spot_id === rec.spot_id)?.[0];
      if (!spot) continue;
      const key = categoryFamily(spot);
      categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
    }
    while (recs.length < limit) {
      let best = null;
      for (const pair of candidates) {
        const [spot, scores] = pair;
        if (used.has(spot.spot_id) || usedGroups.has(groupKey(spot)) || scores.vibe < minVibe) continue;
        const family = categoryFamily(spot);
        const repeatPenalty = (categoryCounts.get(family) || 0) * 5.5;
        const strongVibeBonus = scores.vibe >= 70 ? 2.5 : scores.vibe >= 55 ? 1 : 0;
        const value = scores.overall + strongVibeBonus - repeatPenalty;
        if (!best || value > best.value) best = {pair, value, family};
      }
      if (!best) break;
      const [spot, scores] = best.pair;
      const p = payload(spot, ctx, scores);
      p.slot = 'more';
      p.slot_label = 'こんなのも';
      p.rank = recs.length + 1;
      recs.push(p);
      used.add(spot.spot_id);
      usedGroups.add(groupKey(spot));
      categoryCounts.set(best.family, (categoryCounts.get(best.family) || 0) + 1);
    }
  }

  function recommend(seed, ctx) {
    const valid = new Set(Object.keys(seed.vibe_definitions || {}));
    const selected = ctx.selectedVibes || [];
    const unknown = selected.filter(v => !valid.has(v));
    if (unknown.length) throw new Error(`未知のvibe: ${unknown.join(', ')}`);
    if (selected.length > 3) throw new Error('気分は最大3つまでです');

    const candidates = [], excluded = [];
    for (const spot of seed.spots || []) {
      const reason = hardFilterReason(spot, ctx);
      if (reason) excluded.push({spot_id:spot.spot_id,name:spot.name,reason});
      else candidates.push([spot, baseScores(spot, ctx)]);
    }
    if (!candidates.length) {
      return {input:ctx,recommendations:[],coverage_warning:'必須条件に合う候補がありません。移動時間や年齢条件を少し広げてみてください。',approximate:false,excluded};
    }

    candidates.sort((a, b) => b[1].overall - a[1].overall);
    const strictCount = selected.length ? candidates.filter(([, sc]) => sc.vibe >= 45).length : candidates.length;
    const approximate = selected.length > 0 && strictCount < Math.min(3, candidates.length);
    const primaryMinVibe = selected.length && !approximate ? 45 : 0;
    const supplementalMinVibe = selected.length && strictCount >= 3 ? 35 : 0;
    const labels = slotLabels(ctx.audience || 'family');
    const used = new Set(), usedGroups = new Set(), recs = [];

    const [bestSpot, bestScores] = candidates[0];
    let p = payload(bestSpot, ctx, bestScores);
    p.slot = 'best_match'; p.slot_label = labels.best_match; p.rank = 1;
    recs.push(p); used.add(bestSpot.spot_id); usedGroups.add(groupKey(bestSpot));

    const adventure = chooseSpecial(candidates, used, usedGroups, ([spot, scores]) => adventureScore(spot, scores.overall, bestSpot.category_primary), primaryMinVibe);
    if (adventure) {
      p = payload(adventure[0], ctx, adventure[1]);
      p.slot = 'adventure'; p.slot_label = labels.adventure; p.rank = recs.length + 1;
      recs.push(p); used.add(adventure[0].spot_id); usedGroups.add(groupKey(adventure[0]));
    }

    const easy = chooseSpecial(candidates, used, usedGroups, ([spot, scores]) => easyScore(spot, scores.overall, ctx.audience || 'family'), primaryMinVibe);
    if (easy) {
      p = payload(easy[0], ctx, easy[1]);
      p.slot = 'easy'; p.slot_label = labels.easy; p.rank = recs.length + 1;
      recs.push(p); used.add(easy[0].spot_id); usedGroups.add(groupKey(easy[0]));
    }

    fillDiversified(candidates, recs, used, usedGroups, ctx, primaryMinVibe, Math.min(3, MAX_RECOMMENDATIONS));
    fillDiversified(candidates, recs, used, usedGroups, ctx, supplementalMinVibe, MAX_RECOMMENDATIONS);

    return {
      input: ctx,
      recommendations: recs,
      coverage_warning: approximate ? 'ぴったり一致する候補が少ないため、条件に近いおすすめも混ぜて表示しています。' : null,
      approximate,
      excluded
    };
  }

  return {
    recommend,
    baseScores,
    hardFilterReason,
    shoppingIntentEligible,
    vibeMatchScore,
    ageFitScore,
    audienceFitScore,
    weatherFitScore,
    timeFitScore,
    easyScore,
    adventureScore,
    slotLabels,
    categoryFamily
  };
});

(function installExpandedRecommendationUi(root){
  if (typeof document === 'undefined') return;
  const STYLE_ID = 'kibun-expanded-recommendations-v1';

  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .results-grid .kibun-results-label{grid-column:1/-1;margin:24px 2px 0;padding-top:18px;border-top:1px solid var(--line);font-family:Georgia,"Yu Mincho",serif;font-size:24px;letter-spacing:-.035em;color:var(--ink)}
      .results-grid .kibun-results-label small{display:block;margin-top:4px;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic UI","Yu Gothic",sans-serif;font-size:10px;font-weight:600;letter-spacing:0;color:var(--muted)}
      .results-grid .result-card.kibun-secondary,.results-grid .result-card.kibun-extra{border-radius:24px;box-shadow:0 12px 34px rgba(55,45,35,.07)}
      .results-grid .result-card.kibun-secondary .card-image,.results-grid .result-card.kibun-extra .card-image{height:180px!important}
      .results-grid .result-card.kibun-secondary .card-content,.results-grid .result-card.kibun-extra .card-content{padding:14px 15px 16px}
      .results-grid .result-card.kibun-secondary h3,.results-grid .result-card.kibun-extra h3{font-size:20px!important;margin-bottom:6px}
      .results-grid .result-card.kibun-secondary .plan-lead,.results-grid .result-card.kibun-extra .plan-lead{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:10px}
      .results-grid .result-card.kibun-secondary .plan-stops,.results-grid .result-card.kibun-extra .plan-stops{display:none}
      .results-grid .result-card.kibun-secondary .plan-card-meta,.results-grid .result-card.kibun-extra .plan-card-meta{font-size:8px}
      .results-grid .result-card.kibun-secondary .detail-btn,.results-grid .result-card.kibun-extra .detail-btn{padding:9px 11px;font-size:10px}
      .results-grid .kibun-extra[hidden]{display:none!important}
      .kibun-more-results{grid-column:1/-1;display:flex;justify-content:center;margin:6px 0 2px}
      .kibun-more-results button{appearance:none;border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:999px;padding:11px 18px;font:800 11px/1.2 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic UI","Yu Gothic",sans-serif;cursor:pointer;box-shadow:0 8px 22px rgba(55,45,35,.06)}
      .kibun-more-results button span{margin-left:10px;color:var(--green)}
      @media(max-width:760px){
        .results-grid .kibun-results-label{margin-top:18px;padding-top:16px;font-size:22px}
        .results-grid .result-card.kibun-secondary,.results-grid .result-card.kibun-extra{display:grid!important;grid-template-columns:minmax(0,38%) minmax(0,62%);min-height:164px;border-radius:20px;overflow:hidden}
        .results-grid .result-card.kibun-secondary .card-media,.results-grid .result-card.kibun-extra .card-media{height:100%;min-height:164px}
        .results-grid .result-card.kibun-secondary .card-image,.results-grid .result-card.kibun-extra .card-image{height:100%!important;min-height:164px}
        .results-grid .result-card.kibun-secondary .card-content,.results-grid .result-card.kibun-extra .card-content{padding:12px;min-width:0}
        .results-grid .result-card.kibun-secondary .plan-card-meta,.results-grid .result-card.kibun-extra .plan-card-meta{font-size:7px;margin-bottom:4px}
        .results-grid .result-card.kibun-secondary h3,.results-grid .result-card.kibun-extra h3{font-size:17px!important;line-height:1.25;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .results-grid .result-card.kibun-secondary .plan-lead,.results-grid .result-card.kibun-extra .plan-lead{display:none}
        .results-grid .result-card.kibun-secondary .card-actions,.results-grid .result-card.kibun-extra .card-actions{margin-top:auto}
        .results-grid .result-card.kibun-secondary .slot-chip,.results-grid .result-card.kibun-extra .slot-chip{left:8px;top:8px;padding:5px 7px;font-size:8px}
        .results-grid .result-card.kibun-secondary .travel-chip,.results-grid .result-card.kibun-extra .travel-chip{left:8px;bottom:8px;padding:5px 7px;font-size:8px}
        .results-grid .result-card.kibun-secondary .match-chip,.results-grid .result-card.kibun-extra .match-chip{right:8px;top:8px;padding:5px 6px}
        .results-grid .result-card.kibun-secondary .match-chip span,.results-grid .result-card.kibun-extra .match-chip span{display:none}
        .results-grid .result-card.kibun-secondary .match-chip strong,.results-grid .result-card.kibun-extra .match-chip strong{font-size:17px}
        .kibun-more-results{margin:4px 0 0}
        .kibun-more-results button{width:100%;padding:12px 16px}
      }
    `;
    document.head.appendChild(style);
  }

  function decorate(){
    const grid = document.getElementById('resultsGrid');
    if (!grid) return;
    const cards = Array.from(grid.children).filter(el => el.classList?.contains('plan-card'));
    if (!cards.length || cards[0].classList.contains('kibun-primary')) return;

    grid.querySelectorAll('.kibun-results-label,.kibun-more-results').forEach(el => el.remove());
    cards.forEach((card, i) => {
      card.classList.remove('kibun-primary','kibun-secondary','kibun-extra');
      card.hidden = false;
      if (i < 3) card.classList.add('kibun-primary');
      else if (i < 6) card.classList.add('kibun-secondary');
      else { card.classList.add('kibun-extra'); card.hidden = true; }
    });

    const heading = document.getElementById('resultsHeading');
    if (heading && cards.length > 3) heading.innerHTML = '今日のあなたなら、<br>まずはこの3つ。';

    if (cards.length > 3) {
      const label = document.createElement('div');
      label.className = 'kibun-results-label';
      label.innerHTML = 'こんなのもよさそう。<small>気分は近いまま、少し違う過ごし方も。</small>';
      grid.insertBefore(label, cards[3]);
    }

    if (cards.length > 6) {
      const extraCount = cards.length - 6;
      const wrap = document.createElement('div');
      wrap.className = 'kibun-more-results';
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = `さらに${extraCount}件見る <span>↓</span>`;
      wrap.appendChild(button);
      grid.insertBefore(wrap, cards[6]);
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        cards.slice(6).forEach(card => { card.hidden = expanded; });
        button.setAttribute('aria-expanded', String(!expanded));
        button.innerHTML = expanded ? `さらに${extraCount}件見る <span>↓</span>` : `候補を閉じる <span>↑</span>`;
      });
    }
  }

  function start(){
    ensureStyles();
    const grid = document.getElementById('resultsGrid');
    if (!grid) return;
    const observer = new MutationObserver(() => queueMicrotask(decorate));
    observer.observe(grid, {childList:true});
    decorate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})(typeof globalThis !== 'undefined' ? globalThis : this);

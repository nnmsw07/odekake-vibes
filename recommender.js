(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.OdekakeRecommender = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DEFAULT_VIBE_WEIGHTS = [1.0, 0.7, 0.7];
  const BASE_WEIGHTS = { vibe: 0.55, age: 0.15, weather: 0.10, time: 0.10, travel: 0.10 };

  const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

  function weightedMean(values, neutral = 70) {
    if (!values.length) return neutral;
    const den = values.reduce((a, [, w]) => a + w, 0);
    return den ? values.reduce((a, [v, w]) => a + v * w, 0) / den : neutral;
  }

  function vibeMatchScore(spot, selectedVibes) {
    if (!selectedVibes?.length) return 70;
    if (selectedVibes.length > 3) throw new Error('気分は最大3つまでです');
    return weightedMean(selectedVibes.map((v, i) => {
      if (!(v in (spot.vibes_seed || {}))) throw new Error(`未知のvibe: ${v}`);
      return [Number(spot.vibes_seed[v]), DEFAULT_VIBE_WEIGHTS[i]];
    }));
  }

  function ageFitScore(spot, ageMonths) {
    if (ageMonths === null || ageMonths === undefined || ageMonths === '') return 70;
    const exp = spot.experience_seed || {};
    const baby = Number(exp.baby_fit ?? 50);
    const toddler = Number(exp.toddler_fit ?? 50);
    const age = Number(ageMonths);
    if (age < 18) return baby;
    if (age < 48) return toddler;
    return 0.7 * toddler + 30;
  }

  function weatherFitScore(spot, weather) {
    const exp = spot.experience_seed || {};
    if (!weather || weather === 'any') return 70;
    if (weather === 'rain') return Number(exp.rain_resilience ?? 50);
    if (weather === 'hot') return Number(exp.heat_resilience ?? 50);
    if (weather === 'clear') return clamp(65 + 0.15 * Math.max(Number(exp.outdoor ?? 50), Number(exp.indoor ?? 50)));
    if (weather === 'cold') return clamp(55 + 0.4 * Number(exp.indoor ?? 50));
    return 70;
  }

  function timeFitScore(spot, availableMinutes) {
    if (!availableMinutes) return 70;
    const stay = Number(spot.stay_minutes_seed || 120);
    if (Number(availableMinutes) >= stay) {
      const margin = Math.min(Number(availableMinutes) - stay, stay);
      return clamp(90 + 10 * margin / Math.max(stay, 1));
    }
    const shortageRatio = (stay - Number(availableMinutes)) / Math.max(stay, 1);
    return clamp(90 - 85 * shortageRatio);
  }

  function travelFitScore(spotId, maxTravelMinutes, travelMinutesBySpot) {
    if (!maxTravelMinutes || !travelMinutesBySpot || !(spotId in travelMinutesBySpot)) return 70;
    const travel = Number(travelMinutesBySpot[spotId]);
    return clamp(100 - 50 * travel / Math.max(Number(maxTravelMinutes), 1));
  }

  function hardFilterReason(spot, ctx) {
    const sid = spot.spot_id;
    const availability = (ctx.availabilityBySpot || {})[sid] || {};
    const checks = [
      ['is_open', '営業していない'],
      ['reservation_available', '予約枠がない'],
      ['age_allowed', '年齢条件に合わない'],
    ];
    for (const [key, label] of checks) {
      const val = availability[key];
      if (val === false) return label;
      if (ctx.requireKnownAvailability && (val === null || val === undefined)) return `${key} が未確認`;
    }
    if (ctx.maxTravelMinutes && ctx.travelMinutesBySpot && sid in ctx.travelMinutesBySpot) {
      if (Number(ctx.travelMinutesBySpot[sid]) > Number(ctx.maxTravelMinutes)) return '移動時間が上限を超える';
    }
    return null;
  }

  function baseScores(spot, ctx) {
    const scores = {
      vibe: vibeMatchScore(spot, ctx.selectedVibes || []),
      age: ageFitScore(spot, ctx.childAgeMonths),
      weather: weatherFitScore(spot, ctx.weather),
      time: timeFitScore(spot, ctx.availableMinutes),
      travel: travelFitScore(spot.spot_id, ctx.maxTravelMinutes, ctx.travelMinutesBySpot),
    };
    scores.overall = Object.entries(BASE_WEIGHTS).reduce((sum, [k, w]) => sum + scores[k] * w, 0);
    return scores;
  }

  function easyScore(spot, overall) {
    const exp = spot.experience_seed || {};
    const ease = 100 - Number(exp.planning_friction ?? 50);
    const lowWalk = 100 - Number(exp.walking_load ?? 50);
    const rest = Number(exp.parent_rest ?? 50);
    return 0.45 * overall + 0.25 * ease + 0.15 * lowWalk + 0.15 * rest;
  }

  function adventureScore(spot, overall, bestCategory) {
    const extraordinary = Number((spot.vibes_seed || {}).extraordinary ?? 50);
    const active = Number((spot.experience_seed || {}).physical_activity ?? 50);
    let score = 0.60 * overall + 0.28 * extraordinary + 0.12 * active;
    if (bestCategory && spot.category_primary === bestCategory) score -= 12;
    return score;
  }

  function reasonLines(spot, ctx, scores) {
    const lines = [];
    const vibes = spot.vibes_seed || {};
    for (const vibe of (ctx.selectedVibes || []).slice(0, 2)) {
      const val = vibes[vibe];
      if (val !== undefined && val >= 75) lines.push(`${vibe} が強い（${Math.round(val)}）`);
    }
    if (ctx.weather === 'hot' && scores.weather >= 85) lines.push('暑い日との相性が良い');
    if (ctx.weather === 'rain' && scores.weather >= 85) lines.push('雨でも過ごしやすい');
    if (ctx.childAgeMonths !== null && ctx.childAgeMonths !== undefined && ctx.childAgeMonths !== '' && scores.age >= 85) lines.push('子どもの年齢との相性が良い');
    if (scores.time >= 90 && ctx.availableMinutes) lines.push('使える時間に収まりやすい');
    if (!lines.length && spot.editorial_reason) lines.push(spot.editorial_reason);
    return lines.slice(0, 3);
  }

  function payload(spot, ctx, scores) {
    return {
      spot_id: spot.spot_id,
      name: spot.name,
      slug: spot.slug,
      category_primary: spot.category_primary,
      editorial_reason: spot.editorial_reason,
      scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v * 10) / 10])),
      why: reasonLines(spot, ctx, scores),
    };
  }

  function recommend(seed, ctx) {
    const validVibes = new Set(Object.keys(seed.vibe_definitions || {}));
    const selectedVibes = ctx.selectedVibes || [];
    const unknown = selectedVibes.filter(v => !validVibes.has(v));
    if (unknown.length) throw new Error(`未知のvibe: ${unknown.join(', ')}`);
    if (selectedVibes.length > 3) throw new Error('気分は最大3つまでです');

    const candidates = [];
    const excluded = [];
    for (const spot of seed.spots || []) {
      const reason = hardFilterReason(spot, ctx);
      if (reason) excluded.push({ spot_id: spot.spot_id, name: spot.name, reason });
      else candidates.push([spot, baseScores(spot, ctx)]);
    }

    if (!candidates.length) return { recommendations: [], coverage_warning: '条件に合う候補がありません。', excluded };

    if (selectedVibes.length) {
      const primary = selectedVibes[0];
      const maxPrimary = Math.max(...candidates.map(([s]) => Number((s.vibes_seed || {})[primary] || 0)));
      const maxVibeMatch = Math.max(...candidates.map(([, sc]) => sc.vibe));
      if (maxPrimary < 35 || maxVibeMatch < 35) {
        return {
          input: ctx,
          recommendations: [],
          coverage_warning: `選んだ気分にぴったりと言えるスポットが、今のDBにはまだ少ないようです。`,
          excluded,
        };
      }
    }

    candidates.sort((a, b) => b[1].overall - a[1].overall);
    const [bestSpot, bestScores] = candidates[0];
    const used = new Set([bestSpot.spot_id]);

    const remaining1 = candidates.filter(([s]) => !used.has(s.spot_id));
    let adventure = null;
    if (remaining1.length) {
      adventure = remaining1.reduce((best, cur) => {
        const score = adventureScore(cur[0], cur[1].overall, bestSpot.category_primary);
        return !best || score > best.score ? { pair: cur, score } : best;
      }, null);
      used.add(adventure.pair[0].spot_id);
    }

    const remaining2 = candidates.filter(([s]) => !used.has(s.spot_id));
    let easy = null;
    if (remaining2.length) {
      easy = remaining2.reduce((best, cur) => {
        const score = easyScore(cur[0], cur[1].overall);
        return !best || score > best.score ? { pair: cur, score } : best;
      }, null);
    }

    const recs = [];
    let p = payload(bestSpot, ctx, bestScores);
    p.slot = 'best_match'; p.slot_label = 'いちばんハマる';
    recs.push(p);
    if (adventure) {
      p = payload(adventure.pair[0], ctx, adventure.pair[1]);
      p.slot = 'adventure'; p.slot_label = 'ちょっと冒険'; p.slot_score = Math.round(adventure.score * 10) / 10;
      recs.push(p);
    }
    if (easy) {
      p = payload(easy.pair[0], ctx, easy.pair[1]);
      p.slot = 'easy'; p.slot_label = '無理しない'; p.slot_score = Math.round(easy.score * 10) / 10;
      recs.push(p);
    }

    let coverageWarning = null;
    if (selectedVibes.length) {
      const primary = selectedVibes[0];
      const maxPrimary = Math.max(...candidates.map(([s]) => Number((s.vibes_seed || {})[primary] || 0)));
      const maxVibeMatch = Math.max(...candidates.map(([, sc]) => sc.vibe));
      if (maxPrimary < 50 || maxVibeMatch < 45) coverageWarning = `この気分に強く合うスポットは、今のDBではまだ少なめです。`;
    }

    return { input: ctx, recommendations: recs, coverage_warning: coverageWarning, excluded };
  }

  return { recommend, baseScores, vibeMatchScore, ageFitScore, weatherFitScore, timeFitScore, easyScore, adventureScore };
});

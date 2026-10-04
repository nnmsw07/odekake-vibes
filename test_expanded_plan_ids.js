const assert = require('assert');
const R = require('./recommender.js');
const P = require('./plans.js');

const seed = {
  vibe_definitions: { nature: {} },
  spots: Array.from({length: 8}, (_, i) => ({
    spot_id: `spot_test_${i + 1}`,
    name: `Test Spot ${i + 1}`,
    category_primary: i % 2 ? 'park' : 'museum',
    categories: [],
    stay_minutes_seed: 90,
    vibes_seed: { nature: 80 - i },
    experience_seed: { baby_fit: 85, toddler_fit: 85 },
    audience_fit: { family: 85 }
  }))
};

const ctx = {
  audience: 'family',
  selectedVibes: ['nature'],
  childAgeMonths: 15,
  weather: 'clear',
  availableMinutes: 90,
  allowOvernight: false
};

const result = R.recommend(seed, ctx);
assert.ok(result.recommendations.length >= 7, 'expanded recommendations should include supplemental candidates');

const supplementalSlots = result.recommendations.slice(3).map(r => r.slot);
assert.equal(new Set(supplementalSlots).size, supplementalSlots.length, 'supplemental slots must be unique');

const plans = P.buildPlans(seed, result, ctx, { displayMinutes: 90 });
assert.ok(plans.length >= 7, 'expanded recommendations should build matching plans');
const planIds = plans.map(p => p.plan_id);
assert.equal(new Set(planIds).size, planIds.length, 'every rendered plan must have a unique plan_id');

console.log('PASS: expanded recommendation cards keep unique plan ids');

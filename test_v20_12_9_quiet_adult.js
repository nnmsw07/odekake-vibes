const fs=require('fs');
const css=fs.readFileSync('styles.css','utf8');
const js=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
function ok(cond,msg){if(!cond){console.error('FAIL:',msg);process.exit(1)} console.log('PASS:',msg)}
ok(js.includes("['c4 quiet-adult','culture','静かな大人時間'"),'partner quiet-adult class is rendered');
ok(css.includes(".collection-card.quiet-adult{"),'specific quiet-adult CSS override exists');
ok(css.lastIndexOf('.collection-card.quiet-adult{')>css.lastIndexOf('.c4{'),'quiet-adult override comes after legacy .c4 rule');
ok(css.includes("url('/images/ai/quiet-adult-time.webp') !important"),'quiet-adult hero URL is forced');
ok(fs.existsSync('images/ai/quiet-adult-time.webp'),'quiet-adult image asset exists');
ok(html.includes('styles.css?v=201290'),'CSS cache key bumped');
ok(html.includes('app.js?v=201290'),'JS cache key bumped');

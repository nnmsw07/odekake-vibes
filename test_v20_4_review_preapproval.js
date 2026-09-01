const fs=require('fs');
function ok(x,m){if(!x)throw new Error(m)}
const home=fs.readFileSync('index.html','utf8');
ok(!home.includes('affiliateAudit'), 'preapproval home must not expose affiliateAudit shortcut');
ok(!fs.existsSync('affiliate-audit'), 'preapproval build must not contain affiliate-audit directory');
ok(home.includes('「一日の予告編」から、今日を探してみてください。'), 'top user-facing copy missing');
ok(!home.includes('編集部が選んだ「一日の予告編」'), 'operator-facing editorial copy remains on top');
const mag=fs.readFileSync('magazine/index.html','utf8');
ok(mag.includes('食べることから、休日を決める。'), 'food destination copy missing');
ok(!mag.includes('スポット検索に「アフタヌーンティー」を追加しました'), 'operator-facing add copy remains on magazine hub');
const tea=fs.readFileSync('magazine/yokohama-afternoon-tea/index.html','utf8');
ok(!tea.includes('追加しました'), 'operator-facing add copy remains in afternoon tea article');
ok(tea.includes('午後を過ごす場所を探す →'), 'new user-facing afternoon tea CTA missing');
const plans=fs.readFileSync('plans/index.html','utf8');
ok(!plans.includes('Kibunが編集した過ごし方'), 'operator-facing plan intro remains');
const affcfg=fs.readFileSync('affiliate-config.js','utf8');
ok(!affcfg.includes('linkSwitch:'), 'LinkSwitch config must not be in preapproval build');
console.log('v20.4 preapproval review tests passed');

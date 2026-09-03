const fs=require('fs');
const vm=require('vm');
const code=fs.readFileSync('app.js','utf8');
if(!code.includes('instagramSearchUrl')) throw new Error('instagramSearchUrl missing');
if(!(code.includes('Instagramでこのスポットを検索')||code.includes('Instagramで投稿を見る'))) throw new Error('CTA missing');
if(!code.includes("link_type:'instagram_search'")) throw new Error('tracking missing');
if(!/app\.js\?v=(?:2070|2080|2081|2090|2091)/.test(fs.readFileSync('index.html','utf8'))) throw new Error('cache buster missing');
console.log('v20.6.5 Instagram search static checks: OK');

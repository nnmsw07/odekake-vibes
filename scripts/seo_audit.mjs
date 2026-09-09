#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT=process.cwd();
const SITE='https://kibuntrip.com';
const args=new Set(process.argv.slice(2));
const valueOf=(flag, fallback=null)=>{const i=process.argv.indexOf(flag);return i>=0&&process.argv[i+1]?process.argv[i+1]:fallback};
const live=args.has('--live');
const baseUrl=valueOf('--base-url',live?SITE:null);
const reportPrefix=valueOf('--report',null);
const errors=[]; const warnings=[];
const check=(ok,msg,detail)=>{if(!ok)errors.push(detail?`${msg}: ${detail}`:msg)};
const warn=(ok,msg,detail)=>{if(!ok)warnings.push(detail?`${msg}: ${detail}`:msg)};
const normPath=p=>{try{return decodeURIComponent(p)}catch{return p}};
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');

function attr(tag,name){const m=tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`,'i'));return m?m[2]:null}
function canonicalOf(html){for(const tag of html.match(/<link\b[^>]*>/gi)||[]){if((attr(tag,'rel')||'').toLowerCase().split(/\s+/).includes('canonical'))return attr(tag,'href')}return null}
function robotsMeta(html){for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){if((attr(tag,'name')||'').toLowerCase()==='robots')return (attr(tag,'content')||'').toLowerCase()}return ''}
function hrefs(html){return (html.match(/<a\b[^>]*>/gi)||[]).map(t=>attr(t,'href')).filter(Boolean)}
function baseOf(html,pageUrl){for(const tag of html.match(/<base\b[^>]*>/gi)||[]){const h=attr(tag,'href');if(h){try{return new URL(h,pageUrl).href}catch{}}}return pageUrl}
function urlToFile(url){const u=new URL(url,SITE);let p=normPath(u.pathname);if(p==='/')return path.join(ROOT,'index.html');p=p.replace(/^\//,'');const direct=path.join(ROOT,p);if(fs.existsSync(direct)&&fs.statSync(direct).isFile())return direct;const idx=path.join(ROOT,p,'index.html');if(fs.existsSync(idx))return idx;return null}
function routeOfFile(file){let rel=path.relative(ROOT,file).split(path.sep).join('/');if(rel==='index.html')return '/';if(rel.endsWith('/index.html'))return '/'+rel.slice(0,-'index.html'.length);return '/'+rel}
function targetStaticPages(){const out=[];for(const d of ['spots','magazine','plans','guide']){const base=path.join(ROOT,d);if(!fs.existsSync(base))continue;const stack=[base];while(stack.length){const cur=stack.pop();for(const ent of fs.readdirSync(cur,{withFileTypes:true})){const full=path.join(cur,ent.name);if(ent.isDirectory())stack.push(full);else if(ent.isFile()&&ent.name==='index.html'){const html=fs.readFileSync(full,'utf8');if(!robotsMeta(html).includes('noindex'))out.push(full)}}}}return out}
function parseSitemap(){const sm=read('sitemap.xml');return [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'))}
function robotsBlocked(pathname,robots){const rules=[];let active=false;for(const raw of robots.split(/\r?\n/)){const line=raw.replace(/#.*/,'').trim();if(!line)continue;const [k,...rest]=line.split(':');const v=rest.join(':').trim();if(k.toLowerCase()==='user-agent')active=v==='*';else if(active&&k.toLowerCase()==='disallow'&&v)rules.push(v)}return rules.some(r=>pathname.startsWith(r))}
function localHrefTargetExists(href,fromUrl){if(/^(?:mailto:|tel:|javascript:)/i.test(href)||href.startsWith('#'))return true;let u;try{u=new URL(href,fromUrl)}catch{return false}if(u.origin!==SITE)return true;return !!urlToFile(u)}

const sitemapUrls=parseSitemap();
check(sitemapUrls.length>0,'sitemap が空です');
check(new Set(sitemapUrls).size===sitemapUrls.length,'sitemap に重複URLがあります');
const sitemapSet=new Set(sitemapUrls.map(u=>new URL(u).pathname));
const targetPages=targetStaticPages();
for(const file of targetPages){const route=routeOfFile(file);check(sitemapSet.has(route),`sitemap掲載漏れ`,route)}

const robots=read('robots.txt');
check(/Sitemap:\s*https:\/\/kibuntrip\.com\/sitemap\.xml/i.test(robots),'robots.txt の sitemap 宣言が不正です');
for(const u of sitemapUrls){const url=new URL(u);check(!robotsBlocked(url.pathname,robots),'robots.txt が sitemap URL をブロック',url.pathname)}

const pageMap=new Map();
for(const u of sitemapUrls){const file=urlToFile(u);check(!!file,'sitemap URL に対応するローカルページがありません',u);if(!file)continue;const html=fs.readFileSync(file,'utf8');pageMap.set(u,{file,html,base:baseOf(html,u)});const canon=canonicalOf(html);check(!!canon,'canonical がありません',u);if(canon){let c;try{c=new URL(canon,u).href}catch{}check(c===u,'self-canonical 不一致',`${u} -> ${canon}`)}const rm=robotsMeta(html);check(!rm.includes('noindex'),'noindex が sitemap URL に付いています',u)}

const incoming=new Map(sitemapUrls.map(u=>[new URL(u).pathname,0]));
for(const [u,{html,base}] of pageMap){for(const href of hrefs(html)){check(localHrefTargetExists(href,base),'内部リンク切れ',`${u} -> ${href}`);let dest;try{dest=new URL(href,base)}catch{continue}if(dest.origin===SITE&&incoming.has(dest.pathname)&&dest.pathname!==new URL(u).pathname)incoming.set(dest.pathname,incoming.get(dest.pathname)+1)}}
for(const [pathname,count] of incoming){if(pathname==='/')continue;check(count>0,'孤立ページ',pathname)}

// Accepted SEO migration guard: public guide cards should point to unique spot URLs, not legacy ?spot= links.
let legacySpotLinks=0, guideSpotLinks=0;
for(const [u,{html}] of pageMap){for(const href of hrefs(html)){if(/[?&]spot=spot_/i.test(href))legacySpotLinks++;if(new URL(u).pathname.startsWith('/guide/')&&/\/spots\/[^/?#]+\/?$/.test(href))guideSpotLinks++}}
warn(legacySpotLinks===0,'旧 ?spot= 内部リンクが残っています',String(legacySpotLinks));
check(guideSpotLinks>0,'ガイドから個別スポットへの通常リンクがありません');

async function localHttpStatuses(){const server=http.createServer((req,res)=>{let pathname;try{pathname=normPath(new URL(req.url,'http://local').pathname)}catch{res.statusCode=400;return res.end('bad')}let file=urlToFile(`${SITE}${pathname}`);if(!file){res.statusCode=404;return res.end('not found')}res.statusCode=200;res.setHeader('content-type','text/html; charset=utf-8');res.end(fs.readFileSync(file))});await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;try{for(const u of sitemapUrls){const pathname=new URL(u).pathname;const r=await fetch(`http://127.0.0.1:${port}${pathname}`,{redirect:'manual'});check(r.status===200,'ローカル200応答チェック失敗',`${pathname} -> ${r.status}`)}}finally{await new Promise(r=>server.close(r))}}
async function liveChecks(){const origin=(baseUrl||SITE).replace(/\/$/,'');for(let i=0;i<sitemapUrls.length;i+=8){await Promise.all(sitemapUrls.slice(i,i+8).map(async u=>{const pathname=new URL(u).pathname;const target=origin+pathname;try{const r=await fetch(target,{redirect:'follow',signal:AbortSignal.timeout(12000)});check(r.status===200,'公開URL 200応答チェック失敗',`${target} -> ${r.status}`);if((r.headers.get('content-type')||'').includes('text/html')){const html=await r.text();const canon=canonicalOf(html);check(!!canon,'公開ページ canonical なし',target);if(canon)check(new URL(canon,target).href===`${SITE}${pathname}`,'公開ページ self-canonical 不一致',`${target} -> ${canon}`);check(!robotsMeta(html).includes('noindex'),'公開ページ noindex',target)}}catch(e){errors.push(`公開URL取得失敗: ${target} (${e.message})`)}}))}}

if(live) await liveChecks(); else await localHttpStatuses();
const baselinePath=path.join(ROOT,'seo-audit','search-console-baseline.json');let baseline=null;if(fs.existsSync(baselinePath)){try{baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'))}catch{}}
const summary={mode:live?'live':'local',checked_at:new Date().toISOString(),sitemap_urls:sitemapUrls.length,target_static_pages:targetPages.length,guide_spot_links:guideSpotLinks,legacy_spot_links:legacySpotLinks,search_console_baseline:baseline,errors,warnings,ok:errors.length===0};
console.log(`SEO audit ${summary.ok?'PASS':'FAIL'}: ${sitemapUrls.length} sitemap URLs / ${errors.length} errors / ${warnings.length} warnings`);for(const x of errors)console.error('ERROR',x);for(const x of warnings)console.warn('WARN ',x);if(baseline)console.log(`Search Console baseline (${baseline.as_of}): 検出-未登録 ${baseline.discovered_not_indexed}, クロール済み-未登録 ${baseline.crawled_not_indexed}`);
if(reportPrefix){const jp=path.join(ROOT,`${reportPrefix}.json`), mp=path.join(ROOT,`${reportPrefix}.md`);fs.mkdirSync(path.dirname(jp),{recursive:true});fs.writeFileSync(jp,JSON.stringify(summary,null,2));fs.writeFileSync(mp,`# Kibun SEO Audit\n\n- mode: ${summary.mode}\n- checked: ${summary.checked_at}\n- sitemap URLs: ${summary.sitemap_urls}\n- target static pages: ${summary.target_static_pages}\n- guide → spot links: ${summary.guide_spot_links}\n- legacy ?spot= links: ${summary.legacy_spot_links}\n- result: **${summary.ok?'PASS':'FAIL'}**\n${baseline?`- Search Console baseline (${baseline.as_of}): 検出-未登録 ${baseline.discovered_not_indexed} / クロール済み-未登録 ${baseline.crawled_not_indexed}\n`:''}\n## Errors\n${errors.length?errors.map(x=>`- ${x}`).join('\n'):'- none'}\n\n## Warnings\n${warnings.length?warnings.map(x=>`- ${x}`).join('\n'):'- none'}\n`.replace('w warnings','warnings'));}
if(errors.length)process.exit(1);

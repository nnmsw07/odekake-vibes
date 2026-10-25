'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../magazine/magazine-media.js'),'utf8');
function element(tag){
  const el={tagName:tag.toUpperCase(),children:[],attributes:{},dataset:{},style:{},className:'',textContent:'',parentElement:null,src:'',
    getAttribute(k){return k==='src'?this.src:this.attributes[k]??null;},
    setAttribute(k,v){this.attributes[k]=v;},
    appendChild(node){this.children.push(node);node.parentElement=this;return node;},
    remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);},
    querySelector(selector){const cls=selector.match(/\.([a-z0-9_-]+)/i)?.[1];return this.children.find(n=>n.className?.split(' ').includes(cls))||null;}
  };
  for(const prop of ['href','target','rel'])Object.defineProperty(el,prop,{get(){return this.attributes[prop];},set(v){this.attributes[prop]=v;}});
  return el;
}
async function render(response,attrs={}){
  const host=element('div'),img=element('img'),head=element('head');
  img.src='../../images/ai/forest-path.jpg';
  img.dataset={heroClean:'1',heroSpot:'spot_020',...attrs};host.appendChild(img);
  const doc={
    head,createElement:element,
    querySelectorAll(selector){return selector==='img[data-hero-spot]'?[img]:[];},
    querySelector(){return null;}
  };
  let calls=0;
  const win={KIBUN_CONFIG:{placePhotoApiUrl:'https://example.test/place-photo'},getComputedStyle:()=>({position:'static'})};
  class Probe{set src(value){this.value=value;this.onload?.();}}
  const context={window:win,document:doc,location:{href:'https://kibuntrip.com/magazine/animals-close/'},URL,Date,Image:Probe,
    fetch:async()=>{calls++;return{ok:true,json:async()=>response};}};
  vm.runInNewContext(code,context,{filename:'magazine-media.js'});
  for(let i=0;i<10;i++)await Promise.resolve();
  return {host,img,calls};
}
async function main(){
  const good={photoUri:'https://lh3.googleusercontent.com/p.jpg',photoGoogleMapsUri:'https://www.google.com/maps/photo',
    authors:[{displayName:'撮影者',uri:'https://maps.google.com/contrib/123',photoUri:'https://lh3.googleusercontent.com/avatar.jpg'}],
    matchConfidence:'high'};
  const ok=await render(good);
  const caption=ok.host.querySelector('.kibun-gmaps-photo-credit');
  assert(caption,'Google photo attribution missing');
  assert.equal(ok.img.dataset.heroState,'ready');
  assert.equal(caption.children[0].textContent,'Google Maps');
  assert.equal(caption.children[0].href,'https://www.google.com/maps/photo');
  assert.equal(caption.children[1].href,'https://maps.google.com/contrib/123');
  assert.equal(caption.children[1].children[1].textContent,'撮影者');

  const missing=await render({...good,photoGoogleMapsUri:null,placeGoogleMapsUri:null});
  assert.equal(missing.img.dataset.heroState,'fallback');
  assert(!missing.host.querySelector('.kibun-gmaps-photo-credit'));
  assert(missing.host.querySelector('.kibun-synthetic-photo-note'));

  const malicious=await render({...good,authors:[{displayName:'<script>alert(1)</script>',uri:'javascript:alert(1)',photoUri:'javascript:alert(1)'}]});
  const a=malicious.host.querySelector('.kibun-gmaps-photo-credit').children[1];
  assert.equal(a.tagName,'SPAN');
  assert.equal(a.children.length,1);
  assert.equal(a.children[0].textContent,'<script>alert(1)</script>');

  const official=await render(good,{photoProvider:'official_permission',photoCredit:'施設提供',photoSourceUrl:'https://example.org/photo'});
  assert.equal(official.calls,0);
  assert.equal(official.img.dataset.heroState,'fallback');
  assert(official.host.querySelector('.kibun-editorial-photo-credit'));
  console.log('PASS magazine Google Maps author/source, fallback, link sanitization, licensed-photo precedence');
}
main().catch(e=>{console.error(e);process.exitCode=1;});

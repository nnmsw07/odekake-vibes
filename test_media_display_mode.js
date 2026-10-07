const fs=require('fs');
const vm=require('vm');

function makeContext({audit=false}={}){
  const store={};
  const dialog={open:false,querySelector(){return null;}};
  const context={
    console,URL,URLSearchParams,setTimeout,clearTimeout,
    fetch:async()=>({ok:true,json:async()=>({photoUri:'https://example.invalid/photo.jpg',matchConfidence:'high'})}),
    location:{search:audit?'?heroAudit=1':'',hash:''},
    localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
    document:{getElementById:id=>id==='spotDialog'?dialog:null}
  };
  context.window=context;
  context.KIBUN_CONFIG={placePhotoEnabled:true,placePhotoApiUrl:'https://example.invalid/place-photo',placePhotosApiUrl:'https://example.invalid/place-photos',placePhotoMode:'replace_ai_only'};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('media.js','utf8'),context);
  return {context,dialog};
}

const pinned={spot_id:'spot_pinned',name:'Pinned',hero_image:{type:'ai',exact_spot:false},media_strategy:{current_provider:'ai',google_places:{place_id:'abc'}}};
const unpinned={spot_id:'spot_unpinned',name:'Unpinned',hero_image:{type:'ai',exact_spot:false},media_strategy:{current_provider:'ai',google_places:{}}};
const staticSpot={spot_id:'spot_static',name:'Static',hero_image:{type:'licensed',exact_spot:true},media_strategy:{current_provider:'official_permission',google_places:{place_id:'def'}}};

{
  const {context,dialog}=makeContext();
  if(context.KibunMedia.displayMode(pinned)!=='detail_google') throw new Error('Pinned AI spot must default to detail_google');
  if(context.KibunMedia.displayMode(unpinned)!=='kibun_image') throw new Error('Unpinned AI spot must default to kibun_image');
  if(context.KibunMedia.displayMode(staticSpot)!=='static') throw new Error('Verified static provider must default to static');
  if(context.KibunMedia.shouldUsePlacePhoto(pinned)!==false) throw new Error('Public list/card must not call Google Places photo');
  dialog.open=true;
  dialog.querySelector=()=>({getAttribute:key=>key==='data-media-spot'?'spot_pinned':null});
  if(context.KibunMedia.shouldUsePlacePhoto(pinned)!==true) throw new Error('Pinned detail_google spot should use Google only in open spot detail');
  if(context.KibunMedia.shouldUsePlacePhoto(unpinned)!==false) throw new Error('Unpinned spot must never use public Places photo');
}

{
  const {context}=makeContext({audit:true});
  if(!context.KibunMedia.shouldUsePlacePhoto(unpinned)) throw new Error('Hero Audit must still be able to inspect unpinned AI spots');
  if(!context.KibunMedia.setAuditDisplayMode('spot_unpinned','kibun_image')) throw new Error('Audit display mode must be writable');
}

console.log('media display mode tests passed');

function allowedCors(request, env){
  const reqOrigin=request.headers.get('Origin');
  const configured=String(env.ALLOWED_ORIGIN||'*').split(',').map(x=>x.trim()).filter(Boolean);
  const allowAll=configured.includes('*');
  const allowed=allowAll ? '*' : (reqOrigin && configured.includes(reqOrigin) ? reqOrigin : null);
  if(reqOrigin && !allowed) return null;
  return {
    'Access-Control-Allow-Origin': allowed || configured[0] || '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary':'Origin'
  };
}
function json(data,status,headers){return Response.json(data,{status,headers:{...headers,'Cache-Control':'no-store'}})}
function norm(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/[\s　・･()（）\[\]【】「」『』\-‐–—_]/g,'').replace(/店$/,'')}
function matchConfidence(queryName, displayName){
  const q=norm(queryName),d=norm(displayName); if(!q||!d)return'low';
  if(q===d || q.includes(d) || d.includes(q)) return 'high';
  let common=0; const set=new Set([...q]); for(const ch of new Set([...d])) if(set.has(ch)) common++;
  const ratio=common/Math.max(1,Math.min(new Set([...q]).size,new Set([...d]).size));
  return ratio>=0.72?'medium':'low';
}
function photoScore(p,index){
  const w=Number(p.widthPx||0),h=Number(p.heightPx||1),r=w/h;
  const landscape=r>=1.08?22:-12;
  const heroFit=Math.max(-8,18-Math.abs(r-1.55)*18);
  const resolution=w>=1200?10:w>=800?6:0;
  return 100-index*10+landscape+heroFit+resolution;
}
function pickPhoto(photos, override){
  if(Number.isInteger(override) && photos[override]) return {photo:photos[override],index:override};
  return photos.slice(0,8).map((p,i)=>({photo:p,index:i,score:photoScore(p,i)})).sort((a,b)=>b.score-a.score)[0]||null;
}
async function getPlace(env,{name,address,placeId}){
  const fields='id,displayName,formattedAddress,googleMapsUri,photos';
  if(placeId){
    const r=await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,{headers:{'X-Goog-Api-Key':env.GOOGLE_MAPS_API_KEY,'X-Goog-FieldMask':fields,'Accept-Language':'ja'}});
    if(!r.ok) throw new Error(`Places details ${r.status}: ${await r.text()}`);
    return await r.json();
  }
  const r=await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{'content-type':'application/json','X-Goog-Api-Key':env.GOOGLE_MAPS_API_KEY,'X-Goog-FieldMask':`places.${fields.replace(/,/g,',places.')}`},body:JSON.stringify({textQuery:`${name} ${address||''}`.trim(),languageCode:'ja',regionCode:'JP',maxResultCount:1})});
  if(!r.ok) throw new Error(`Places search ${r.status}: ${await r.text()}`);
  return (await r.json()).places?.[0]||null;
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url),cors=allowedCors(request,env);
    if(!cors) return new Response('Origin not allowed',{status:403});
    if(request.method==='OPTIONS') return new Response(null,{headers:cors});
    if(!env.GOOGLE_MAPS_API_KEY && url.pathname!=='/health') return json({error:'GOOGLE_MAPS_API_KEY is not configured'},503,cors);
    try{
      if(url.pathname==='/health') return json({ok:true,service:'kibun-api'},200,cors);

      if(url.pathname.endsWith('/travel-times') && request.method==='POST'){
        const {origin,destinations,mode}=await request.json();
        if(!origin || !Array.isArray(destinations) || !destinations.length) return json({error:'origin and destinations required'},400,cors);
        const body={origins:[{waypoint:{location:{latLng:{latitude:origin.lat,longitude:origin.lng}}}}],destinations:destinations.slice(0,50).map(d=>({waypoint:{location:{latLng:{latitude:d.lat,longitude:d.lng}}}})),travelMode:mode==='transit'?'TRANSIT':'DRIVE',languageCode:'ja',regionCode:'JP',units:'METRIC'};
        if(mode!=='transit') body.routingPreference='TRAFFIC_AWARE';
        const r=await fetch('https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',{method:'POST',headers:{'content-type':'application/json','X-Goog-Api-Key':env.GOOGLE_MAPS_API_KEY,'X-Goog-FieldMask':'originIndex,destinationIndex,status,condition,distanceMeters,duration'},body:JSON.stringify(body)});
        if(!r.ok) throw new Error(`Routes ${r.status}: ${await r.text()}`);
        const rows=await r.json(),times={};
        for(const row of rows){const d=destinations[row.destinationIndex];if(!d||!row.duration)continue;times[d.spot_id]=Math.ceil(parseFloat(row.duration)/60);}
        return json({provider:'google_routes',times},200,cors);
      }

      if(url.pathname.endsWith('/place-photo') && request.method==='GET'){
        const name=url.searchParams.get('name'),address=url.searchParams.get('address')||'',placeId=url.searchParams.get('placeId')||'';
        const rawIndex=url.searchParams.get('photoIndex'),photoIndex=rawIndex===null?null:Number(rawIndex);
        if(!name && !placeId) return json({error:'name or placeId required'},400,cors);
        const place=await getPlace(env,{name,address,placeId});
        if(!place) return json({photoUri:null,reason:'place_not_found'},200,cors);
        const confidence=placeId?'high':matchConfidence(name,place.displayName?.text);
        if(confidence==='low') return json({photoUri:null,reason:'low_match',matchedPlaceName:place.displayName?.text||'',matchedAddress:place.formattedAddress||'',placeId:place.id||null,matchConfidence:confidence},200,cors);
        const photos=place.photos||[],picked=pickPhoto(photos,Number.isInteger(photoIndex)?photoIndex:null);
        if(!picked) return json({photoUri:null,reason:'no_photo',placeId:place.id||null,matchConfidence:confidence},200,cors);
        const selected=picked.photo;
        const mediaUrl=`https://places.googleapis.com/v1/${selected.name}/media?maxWidthPx=1600&skipHttpRedirect=true`;
        const pr=await fetch(mediaUrl,{headers:{'X-Goog-Api-Key':env.GOOGLE_MAPS_API_KEY}});
        if(!pr.ok) throw new Error(`Place photo ${pr.status}: ${await pr.text()}`);
        const pj=await pr.json();
        return json({
          photoUri:pj.photoUri||null,
          placeId:place.id||null,
          matchedPlaceName:place.displayName?.text||'',
          matchedAddress:place.formattedAddress||'',
          placeGoogleMapsUri:place.googleMapsUri||null,
          photoGoogleMapsUri:selected.googleMapsUri||place.googleMapsUri||null,
          flagContentUri:selected.flagContentUri||null,
          authors:(selected.authorAttributions||[]).map(a=>({displayName:a.displayName||'',uri:a.uri||'',photoUri:a.photoUri||''})),
          selectedPhotoIndex:picked.index,
          matchConfidence:confidence,
          source:'google_places'
        },200,cors);
      }

      // Hero監査用: 1回のPlace検索で複数の写真候補を返す。
      // 通常UIからは呼ばず、?heroAudit=1 の管理用UIだけで使用する。
      if(url.pathname.endsWith('/place-photos') && request.method==='GET'){
        const name=url.searchParams.get('name'),address=url.searchParams.get('address')||'',placeId=url.searchParams.get('placeId')||'';
        const requested=Math.max(1,Math.min(8,Number(url.searchParams.get('limit')||6)));
        if(!name && !placeId) return json({error:'name or placeId required'},400,cors);
        const place=await getPlace(env,{name,address,placeId});
        if(!place) return json({candidates:[],reason:'place_not_found'},200,cors);
        const confidence=placeId?'high':matchConfidence(name,place.displayName?.text);
        if(confidence==='low') return json({candidates:[],reason:'low_match',matchedPlaceName:place.displayName?.text||'',matchedAddress:place.formattedAddress||'',placeId:place.id||null,matchConfidence:confidence},200,cors);
        const photos=(place.photos||[]).slice(0,requested);
        const candidates=[];
        for(let index=0;index<photos.length;index++){
          const selected=photos[index];
          try{
            const mediaUrl=`https://places.googleapis.com/v1/${selected.name}/media?maxWidthPx=1200&skipHttpRedirect=true`;
            const pr=await fetch(mediaUrl,{headers:{'X-Goog-Api-Key':env.GOOGLE_MAPS_API_KEY}});
            if(!pr.ok) continue;
            const pj=await pr.json();
            if(!pj.photoUri) continue;
            candidates.push({
              index,
              photoUri:pj.photoUri,
              widthPx:Number(selected.widthPx||0),
              heightPx:Number(selected.heightPx||0),
              score:photoScore(selected,index),
              photoGoogleMapsUri:selected.googleMapsUri||place.googleMapsUri||null,
              authors:(selected.authorAttributions||[]).map(a=>({displayName:a.displayName||'',uri:a.uri||'',photoUri:a.photoUri||''}))
            });
          }catch(_e){}
        }
        const auto=pickPhoto(place.photos||[],null);
        return json({
          candidates,
          autoSelectedPhotoIndex:auto?.index??null,
          placeId:place.id||null,
          matchedPlaceName:place.displayName?.text||'',
          matchedAddress:place.formattedAddress||'',
          placeGoogleMapsUri:place.googleMapsUri||null,
          matchConfidence:confidence,
          source:'google_places'
        },200,cors);
      }
      return new Response('Kibun API',{headers:cors});
    }catch(e){return json({error:String(e.message||e)},500,cors);}
  }
};

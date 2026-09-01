const fs=require('fs'),vm=require('vm');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);
const spots=Object.fromEntries(ctx.window.ODEKAKE_SEED.spots.map(s=>[s.spot_id,s]));
const expected={
spot_212:5,spot_213:2,spot_214:0,spot_215:2,spot_216:1,spot_217:0,spot_218:5,spot_219:1,spot_221:5,spot_222:1,spot_223:1,spot_225:0,spot_226:4,spot_227:2,spot_228:1,spot_230:0,spot_231:2,spot_234:5,spot_237:4,spot_241:5,spot_255:2,spot_242:5,spot_244:2,spot_249:4,spot_251:1,spot_252:5,spot_253:2,spot_254:2,spot_256:5,spot_257:0,spot_260:5,spot_262:4,spot_263:0,spot_264:4,spot_265:3,spot_267:1,spot_268:5,spot_271:3,spot_273:0,spot_277:3,spot_278:0,spot_279:5,spot_280:1,spot_283:2,spot_284:0,spot_287:0,spot_288:2,spot_289:0,spot_290:0,spot_291:0,spot_292:5,spot_293:0,spot_294:2,spot_295:3,spot_297:0,spot_298:5,spot_299:3,spot_300:2,spot_301:2,spot_302:3,spot_303:3,spot_304:1,spot_305:4,spot_306:3,spot_307:0,spot_308:5,spot_309:0,spot_310:0,spot_311:1,spot_312:3,spot_313:0,spot_314:0,spot_315:2,spot_316:4};
for(const [id,n] of Object.entries(expected)){
 const got=spots[id]?.media_strategy?.google_places?.photo_index_override;
 if(got!==n) throw new Error(`${id} photo index ${got} != ${n}`);
}
const places={
 spot_213:'ChIJz7WQw9meGWAR8_Ijv9AMs4Q',
 spot_225:'ChIJy4fajMFHGGARY--QDTV8SY4',
 spot_253:'ChIJFeML4xaJGGAR9qblCXuLpCc',
 spot_255:'ChIJ-UvoWx-PGGAR-0_-mg948ck'};
for(const [id,pid] of Object.entries(places)){
 const got=spots[id]?.media_strategy?.google_places?.place_id;
 if(got!==pid) throw new Error(`${id} place id ${got} != ${pid}`);
}
console.log(`v20.4 hero overrides passed (${Object.keys(expected).length} photo indices, 4 place IDs)`);

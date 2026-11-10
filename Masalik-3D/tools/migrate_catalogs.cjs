// Deterministic extraction of existing browser content. Run from repository root.
const fs = require('node:fs'), vm = require('node:vm');
const {stripTypeScriptTypes} = require('node:module');
function extract(file, stop, suffix) {
 let s=fs.readFileSync(file,'utf8');
 s=s.replace(/import[\s\S]*?from\s+'[^']+';/g,'');
 if(stop) s=s.slice(0,s.indexOf(stop));
 s=stripTypeScriptTypes(s).replace(/export /g,'');
 const context={THREE:{MathUtils:{degToRad:n=>n*Math.PI/180}}};
 vm.createContext(context); vm.runInContext(s+'\nresult='+suffix,context);return context.result;
}
function write(path, data){fs.writeFileSync('Masalik-3D/data/'+path,JSON.stringify(data,null,2)+'\n');}
write('vehicles/fleet.json',extract('src/game/vehicleFleet.ts','export const TIRE_COMPOUND_GRIP','VEHICLE_SPECS'));
write('missions/catalog.json',extract('src/game/missionsCatalog.ts',null,'({chapters:STORY_CHAPTERS,missions:ALL_OFFLINE_MISSIONS})'));
let r=fs.readFileSync('src/game/roadSpline.ts','utf8');r=r.slice(r.indexOf('export const YEMEN_REGIONS'),r.indexOf('export const WORLD_POIS'));r=stripTypeScriptTypes(r).replace('export ','');write('maps/regions.json',vm.runInNewContext(r+'; YEMEN_REGIONS').map(x=>{delete x.statusAr;return x}));

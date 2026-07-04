(function(){
'use strict';
const $=id=>document.getElementById(id);
const incidents=[
 {zone:'zone-tide', key:'tide', icon:'tide', theme:'Mareomotriz', badge:'Mareomotriz', title:'MAREOMOTRIZ-02', subtitle:'Dispositivo mareomotriz', scenario:'Una turbina situada en una zona de corrientes fuertes necesita una revisión de mantenimiento.', question:'¿Cuándo es más seguro realizar el mantenimiento de un dispositivo mareomotriz?', options:['Cuando la corriente es máxima.','Cuando la corriente es mínima.','Durante una tormenta.','Cuando haya más oleaje.'], correct:1, hint:'Pensad en el momento en que el agua se mueve menos.', assetIndex:1},
 {zone:'zone-solar', key:'solar', icon:'solar', theme:'Solar flotante', badge:'Solar flotante', title:'Solar-03', subtitle:'Plataforma solar flotante', scenario:'Un grupo de plataformas solares está produciendo menos energía de lo habitual aunque hay buena radiación solar.', question:'¿Por qué unos paneles solares en el mar pueden producir cada vez menos energía, aunque siga haciendo sol?', options:['Poco a poco se les acumula sal, algas y suciedad encima, y eso bloquea parte de la luz.','Los cables que llevan la electricidad hasta tierra se desgastan con el paso de los meses.','Los paneles no se desgastan.','Las plataformas se mueven con las olas y quedan mal orientadas hacia el sol.'], correct:0, hint:'Piensa en lo que se va acumulando sobre la superficie del panel.', assetIndex:2},
 {zone:'zone-wind', key:'wind', icon:'wind', theme:'Eólica marina', badge:'Eólica marina', title:'EÓLICA-03', subtitle:'Aerogenerador flotante', scenario:'La empresa está decidiendo si construir un nuevo parque eólico en tierra o en el mar, y sus ingenieros recomiendan la opción marina.', question:'¿Cuál es la principal ventaja de instalar aerogeneradores en el mar en vez de en tierra?', options:['El viento en el mar es más fuerte y constante, al no encontrar montañas, edificios ni árboles que lo frenen','El agua del mar refrigera las turbinas y aumenta su potencia.','Los aerogeneradores marinos no necesitan mantenimiento porque la sal protege sus piezas.','No hay ninguna ventaja.'], correct:1, hint:'Si el viento no falta, busca el problema en la parte eléctrica.', assetIndex:2},
 {zone:'zone-sub', key:'sub', icon:'sub', theme:'Subestación eléctrica', badge:'Subestación eléctrica', title:'SUBESTACIÓN-02', subtitle:'Subestación eléctrica flotante', scenario:'Toda la electricidad que generan los paneles solares, los aerogeneradores y las turbinas mareomotrices llega primero a un punto central en medio del mar, antes de viajar hasta las casas en tierra.', question:'¿Para qué sirve una subestación eléctrica en un parque marino?', options:['Para guardar las piezas de repuesto y las herramientas que se usan para arreglar y mantener el parque.','Para transformar y enviar la electricidad hacia tierra.','Para limpiar los paneles solares.','Para vigilar con cámaras el parque.'], correct:1, hint:'Piensa en qué hace falta antes de enviar la electricidad a tierra.', assetIndex:1},
 {zone:'zone-bio', key:'bio', icon:'bio', theme:'Biodiversidad marina', badge:'Biodiversidad marina', title:'SENSOR-08', subtitle:'Biodiversidad', scenario:'Los sensores detectan actividad de fauna y flora marina en una zona próxima al parque.', question:'¿Qué medida ayuda a reducir el impacto de los parques sobre los peces, las aves y la flora marina?', options:['Aumentar la iluminación nocturna del parque.','Detener las operaciones durante las épocas de reproducción y cría de la fauna.','Incrementar el ruido mientras se construye el parque.','Ignorar los sensores ambientales'], correct:1, hint:'Piensa en proteger los momentos más sensibles para la fauna.', assetIndex:7}
];
let selected=null, chosen={}; const answered=new Set(), solved=new Set(), earned=new Set();
// iconInner() devuelve SOLO el contenido (paths/circles), sin envoltorio <svg>.
// Esto es lo que se debe insertar dentro del mapa SVG principal: un <svg> anidado
// sin width/height hereda por defecto el tamaño del viewport del SVG padre,
// lo que provoca iconos gigantes que tapan el mapa.
function iconInner(type){
 const common='stroke="#183b5e" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"';
 const wave='<path d="M6 50q8 5 16 0t16 0t16 0" stroke="#2ba6df" stroke-width="3" fill="none"/>';
 if(type==='solar')return `<rect x="16" y="18" width="40" height="26" rx="2" ${common}/><path d="M16 31h40M29 18v26M43 18v26" ${common}/>${wave}<path class="solar-shine" d="M12 10L5 5M60 10l7-5M36 8V0" stroke="#0b73d1" stroke-width="3" fill="none"/>`;
 if(type==='wind')return `<g class="wind-rotor"><circle cx="36" cy="22" r="3" fill="#183b5e"/><path d="M36 22V4M36 22l16 10M36 22L20 32" ${common}/></g><path d="M36 25v35" ${common}/>${wave}`;
 if(type==='tide')return `
  <path class="tide-wave" d="M7 53q8 5 16 0t16 0t16 0" stroke="#2ba6df" stroke-width="3" fill="none"/>
  <path class="tide-wave" d="M10 61q8 5 16 0t16 0t16 0" stroke="#2ba6df" stroke-width="3" fill="none"/>
  <path d="M18 24h36M22 24v31M50 24v31M36 24v31" ${common}/>
  <circle cx="36" cy="45" r="10" ${common}/>
  <path d="M36 35v20M26 45h20M30 38l12 14M42 38L30 52" ${common}/>`;
 if(type==='sub')return `<rect x="16" y="26" width="40" height="32" ${common}/><path d="M24 26v-12M36 26v-16M48 26v-12" ${common}/><path class="electric-pulse" d="M39 30l-10 17h9l-5 13 13-20h-9z" fill="#0b73d1" stroke="none"/>`;
 if(type==='bio')return `<path d="M10 25q12-10 24 0q-12 10-24 0z" ${common}/><circle cx="28" cy="24" r="1.6" fill="#183b5e"/><path d="M48 18q-8 8 0 16q8-8 0-16zM51 30q8 5 14 0" ${common}/><path class="bio-sway" d="M38 56c-4-10 4-18 0-28M48 58c-5-12 6-20 2-31M57 58c-4-8 4-14 0-22" stroke="#159568" stroke-width="3" fill="none"/>${wave}`;
 return `<circle cx="36" cy="36" r="20" ${common}/>`;
}
// makeIcon() envuelve iconInner() en un <svg> completo, para usarlo en contextos
// HTML normales (insignias, panel de incidencias, recompensa), donde el <svg>
// resultante es el elemento raíz y sí puede dimensionarse por CSS con normalidad.
function makeIcon(type){
 return `<svg viewBox="0 0 72 72">${iconInner(type)}</svg>`;
}
function populateMap(){
 const grids={'solar-grid':'solar','wind-grid':'wind','tide-grid':'tide','bio-grid':'bio'};
 Object.entries(grids).forEach(([cls,type])=>{
  const inc=incidents.find(i=>i.icon===type);
  const g=document.querySelector('.'+cls); let html='';
  for(let i=0;i<9;i++){
   const x=(i%3)*72, y=Math.floor(i/3)*72, isTarget=i===inc.assetIndex;
   html+=`<g class="asset ${type}${isTarget?' asset-alarm':''}" data-zone="${inc.zone}" transform="translate(${x} ${y}) scale(.86)">`;
   if(isTarget) html+='<circle class="ring-pulse" cx="36" cy="36" r="33"/>';
   html+=iconInner(type);
   if(isTarget) html+='<circle class="asset-dot" cx="60" cy="10" r="9"/>';
   html+='</g>';
  }
  g.innerHTML=html;
 });
 document.querySelectorAll('.substation').forEach((g,i)=>{
  const inc=incidents.find(i=>i.icon==='sub'), isTarget=i===inc.assetIndex; let html='';
  if(isTarget) html+='<circle class="ring-pulse" cx="36" cy="36" r="33"/>';
  html+=iconInner('sub');
  if(isTarget) html+='<circle class="asset-dot" cx="60" cy="10" r="9"/>';
  g.classList.toggle('asset-alarm', isTarget);
  g.dataset.zone=inc.zone;
  g.innerHTML=html;
 });
}
function updateHud(){
 $('statAlarms').textContent=incidents.length-solved.size;
 const energy=Math.round(solved.size/incidents.length*100); $('statEnergy').textContent=energy+'%'; $('statBadges').textContent=earned.size+'/'+incidents.length;
}
function initZones(){
 incidents.forEach((inc,idx)=>{
  const z=$(inc.zone); z.classList.add('alarm');
  z.addEventListener('click',()=>select(idx));
 });
}
function select(idx){selected=idx; document.querySelectorAll('.zone').forEach(z=>z.classList.remove('selected')); $(incidents[idx].zone).classList.add('selected'); renderIncident(idx);}
function renderIncident(idx){
 const inc=incidents[idx], done=answered.has(idx); let opts='';
 inc.options.forEach((op,i)=>{const cls=done?(i===inc.correct&&solved.has(idx)?'right':(chosen[idx]===i&&!solved.has(idx)?'wrong':'')):''; opts+=`<button class="opt ${cls}" data-opt="${i}" ${done?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${op}</button>`});
 $('questionCol').innerHTML=`<div class="panel question-panel">
    <div class="q-header">
      <div class="q-icon">${makeIcon(inc.icon)}</div>
      <div class="q-titles"><span class="kicker small">${inc.title}</span><h4>${inc.subtitle}</h4></div>
      <button class="hint-btn" id="hintBtn" type="button">💡 Pista</button>
    </div>
    <p class="scenario">${inc.scenario}</p>
    <h3>Pregunta</h3>
    <p>${inc.question}</p>
    <div class="options">${opts}</div>
    <div class="feedback" id="feedback"></div>
    <div class="actions"><button class="secondary" id="clearBtn" ${done?'disabled':''}>Cancelar</button><button class="confirm" id="confirmBtn" disabled ${done?'disabled':''}>Confirmar respuesta</button></div>
  </div>
 <div class="hint-modal hidden" id="hintModal">
  <div class="hint-modal-card">
    <button class="hint-close" id="hintClose" type="button">✕</button>
    <h4>💡 Pista</h4>
    <p>${inc.hint}</p>
  </div>
 </div>`;
 $('rewardRow').classList.remove('hidden');
 $('rewardRow').innerHTML=`<div class="reward-icon">${makeIcon(inc.icon)}</div><div class="reward-text"><h3>Recompensa</h3><p>Si respondéis correctamente, apagaréis esta alarma y conseguiréis la insignia de <strong>${inc.badge}</strong>.</p></div>`;
 $('hintBtn').onclick=()=>$('hintModal').classList.remove('hidden');
 $('hintClose').onclick=()=>$('hintModal').classList.add('hidden');
 $('hintModal').onclick=(e)=>{if(e.target.id==='hintModal')$('hintModal').classList.add('hidden');};
 if(done){const fb=$('feedback'); fb.className='feedback show '+(solved.has(idx)?'ok':'err'); fb.innerHTML=solved.has(idx)?'<strong>Alarma apagada.</strong> Sistema recuperado.':'<strong>Pregunta bloqueada.</strong> Esta alarma quedó activa.'; return;}
 let pending=null; document.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{pending=Number(b.dataset.opt); document.querySelectorAll('.opt').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); $('confirmBtn').disabled=false;}));
 $('clearBtn').onclick=()=>{document.querySelectorAll('.opt').forEach(x=>x.classList.remove('selected')); pending=null; $('confirmBtn').disabled=true;};
 $('confirmBtn').onclick=()=>answer(idx,pending);
}
function answer(idx,opt){
 const inc=incidents[idx]; answered.add(idx); chosen[idx]=opt; const z=$(inc.zone); const fb=$('feedback');
 if(opt===inc.correct){solved.add(idx); earned.add(inc.badge); z.classList.remove('alarm'); z.classList.add('done'); fb.className='feedback show ok'; fb.innerHTML='<strong>Alarma apagada.</strong> Sistema recuperado e insignia desbloqueada.';}
 else{fb.className='feedback show err'; fb.innerHTML='<strong>Respuesta incorrecta.</strong> La alarma permanece activa y la pregunta queda bloqueada.';}
 updateHud(); renderIncident(idx); if(answered.size===incidents.length)setTimeout(finish,900);
}
function finish(){
 const energy=Math.round(solved.size/incidents.length*100); $('gameLayout').classList.add('hidden'); $('finale').classList.remove('hidden');
 const success=energy===100;
 $('finalIcon').innerHTML=success
  ?'<svg viewBox="0 0 72 72"><path d="M22 16h28v12a14 14 0 0 1-28 0z" stroke="#0b73d1" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 20h-8a8 8 0 0 0 8 14M50 20h8a8 8 0 0 1-8 14" stroke="#0b73d1" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M36 42v10M26 58h20M30 52h12" stroke="#0b73d1" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  :'<svg viewBox="0 0 72 72"><path d="M15 49q6 5 12 0t12 0t12 0t12 0" stroke="#0b73d1" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M15 59q6 5 12 0t12 0t12 0t12 0" stroke="#0b73d1" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M36 14v27M36 22l16 10M36 22L20 32" stroke="#0b73d1" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="36" cy="22" r="3" fill="#0b73d1"/></svg>';
 $('finalText').innerHTML=success
  ?'Habéis apagado todas las alarmas y recuperado el <strong>100%</strong> de la energía del parque. ¡Misión cumplida!'
  :`Habéis recuperado el <strong>${energy}%</strong> de la energía del parque. Podéis reiniciar la misión para intentar apagarlas todas.`;
 $('finalBadges').innerHTML=incidents.map(i=>`<div class="final-badge ${earned.has(i.badge)?'earned':''}"><i>${makeIcon(i.icon)}</i><span>${i.badge}</span></div>`).join('');
 window.scrollTo({top:0,behavior:'smooth'});
}
function restart(){answered.clear();solved.clear();earned.clear();selected=null;chosen={};document.querySelectorAll('.zone').forEach(z=>z.classList.remove('selected','done'));incidents.forEach(i=>$(i.zone).classList.add('alarm'));$('questionCol').innerHTML='<div class="panel empty-state"><h2>Seleccionad una alarma del mapa</h2><p>Podéis empezar por cualquier temática. Una vez respondida, esa pregunta quedará bloqueada.</p></div>';$('rewardRow').classList.add('hidden');$('rewardRow').innerHTML='';$('finale').classList.add('hidden');$('gameLayout').classList.remove('hidden');updateHud();$('gameScreen').classList.add('hidden');$('startScreen').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});}
populateMap(); initZones(); updateHud(); $('restartBtn').onclick=restart;
$('startBtn').onclick=()=>{$('startScreen').classList.add('hidden'); $('gameScreen').classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'});};
})();

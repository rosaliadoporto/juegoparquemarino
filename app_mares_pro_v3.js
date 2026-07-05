(function(){
'use strict';
const $=id=>document.getElementById(id);
const incidents=[
 {zone:'zone-tide', key:'tide', icon:'tide', theme:'Mareomotriz', badge:'Mareomotriz', title:'Reto 1', subtitle:'Energía de las mareas', idea:'Las turbinas mareomotrices aprovechan el movimiento del agua. Para trabajar con seguridad conviene elegir momentos de corriente baja.', question:'¿Cuándo es más seguro revisar una turbina mareomotriz?', options:['Cuando hay mucho oleaje.','Cuando hay poco oleaje.','Durante una tormenta.'], correct:1, hint:'Busca el momento en el que el agua se mueve con menos fuerza.', assetIndex:1, cardTitle:'Turbinas mareomotrices', summary:'Conversión de la energía de las mareas en electricidad.', cardImg:'carta_mareomotriz.jpg'},
 {zone:'zone-solar', key:'solar', icon:'solar', theme:'Solar flotante', badge:'Solar flotante', title:'Reto 2', subtitle:'Paneles solares flotantes', idea:'Los paneles flotantes producen electricidad con la luz solar, pero en el mar pueden ensuciarse con sal, algas o aves.', question:'¿Qué puede hacer que produzcan menos aunque siga haciendo sol?', options:['La suciedad sobre el panel.','Que el agua sea salada.','Que estén pintados de azul.'], correct:0, hint:'Piensa en algo que pueda tapar la superficie del panel.', assetIndex:2, cardTitle:'Plataformas solares flotantes', summary:'Conversión de la energía del sol en electricidad.', cardImg:'carta_solar.jpg'},
 {zone:'zone-wind', key:'wind', icon:'wind', theme:'Eólica marina', badge:'Eólica marina', title:'Reto 3', subtitle:'Aerogeneradores marinos', physical:true, physicalTask:'Ve a la mesa de cartas de curiosidades de la eólica marina y forma las 6 parejas (foto + nombre con su descripción). Cuando tengas todas las parejas correctas, responde a la pregunta.', memoryGame:'memoria_eolica.html', idea:'En el mar suele haber vientos más constantes. Por eso muchos parques eólicos se instalan lejos de la costa.', question:'¿El viento en el mar es más fuerte y constante que el viento que llega a la costa?', options:['Sí.','No.','Son iguales.'], correct:0, hint:'Piensa en el tamaño de la pala: un giro lento en algo tan grande implica velocidad alta en la punta.', assetIndex:2, cardTitle:'Aerogeneradores flotantes', summary:'Conversión de la energía del viento en electricidad.', cardImg:'carta_eolica.jpg'},
 {zone:'zone-sub', key:'sub', icon:'sub', theme:'Subestación eléctrica', badge:'Subestación eléctrica', title:'Reto 4', subtitle:'Subestación eléctrica', physical:true, type:'code', code:'EXP-07', physicalTask:'Ve al puzle del parque marino híbrido y móntalo entero: aerogeneradores, plataformas solares, dispositivos mareomotrices, subestación y cable a tierra. Cuando esté completo, busca la identificación del cable submarino de exportación.', puzzleGame:'puzzle_parque_mares_sin_linea.html', idea:'La electricidad generada en el parque se concentra en la subestación antes de viajar hacia tierra.', question:'Localiza en el puzle la identificación del cable submarino de exportación e introduce su código.', codeLabel:'Código del cable de exportación', hint:'Es el único cable que sale del parque hacia la costa, no entre dispositivos del parque.', assetIndex:1, cardTitle:'Subestación flotante', summary:'Conecta el parque con la red eléctrica.', cardImg:'carta_subestacion.jpg'},
 {zone:'zone-bio', key:'bio', icon:'bio', theme:'Biodiversidad marina', badge:'Biodiversidad marina', title:'Reto 5', subtitle:'Biodiversidad marina', idea:'Un parque renovable también debe cuidar el entorno: aves, peces, flora marina y fondos.', type:'truefalse', question:'Marca si cada afirmación es verdadera o falsa.', statements:[
   {text:'Antes de instalar un parque marino conviene estudiar qué especies viven en la zona.', answer:true},
   {text:'El ruido bajo el agua durante la construcción no afecta a los animales marinos.', answer:false},
   {text:'Los cables y estructuras del parque pueden servir de refugio para algunas especies.', answer:true},
   {text:'Cuanto más ruido se genere en la instalación, mejor para la biodiversidad.', answer:false}
  ], hint:'Piensa en qué acciones reducen el impacto y cuáles lo aumentan.', assetIndex:7, cardTitle:'Fauna y flora marina', summary:'Protección de la biodiversidad marina.', cardImg:'carta_biodiversidad.jpg'}
];
let selected=null, chosen={}; const answered=new Set(), solved=new Set(), earned=new Set();

/* ============================================================
   CUENTA ATRÁS DE LA MISIÓN — 20 minutos, pensada para escape room
   ============================================================ */
const MISSION_SECONDS=20*60;
let timeLeft=MISSION_SECONDS, timerInterval=null, timeExpired=false, missionEnded=false;
function formatTime(s){
 const m=Math.floor(s/60), sec=s%60;
 return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}
function updateTimerDisplay(){
 const chip=$('timerChip'), val=$('timerValue'); if(!val) return;
 val.textContent=formatTime(Math.max(timeLeft,0));
 chip.classList.remove('warning','critical');
 if(timeLeft<=60) chip.classList.add('critical');
 else if(timeLeft<=300) chip.classList.add('warning');
}
function startTimer(){
 clearInterval(timerInterval); timeLeft=MISSION_SECONDS; timeExpired=false; updateTimerDisplay();
 timerInterval=setInterval(()=>{
  timeLeft--; updateTimerDisplay();
  if(timeLeft<=0){ clearInterval(timerInterval); timeExpired=true; timeUp(); }
 },1000);
}
function stopTimer(){ clearInterval(timerInterval); }
function timeUp(){
 document.querySelectorAll('.zone').forEach(z=>z.classList.add('locked'));
 const confirmBtn=$('confirmBtn'); if(confirmBtn) confirmBtn.disabled=true;
 finish();
}

/* ============================================================
   BURBUJAS DE FONDO — ambiente oceánico sutil del centro de control
   ============================================================ */
function spawnBubbles(){
 const bg=$('oceanBg'); if(!bg) return; let html='';
 for(let i=0;i<16;i++){
  const size=(5+Math.random()*14).toFixed(1);
  const left=(Math.random()*100).toFixed(1);
  const dur=(14+Math.random()*14).toFixed(1);
  const delay=(Math.random()*16).toFixed(1);
  const drift=(Math.random()*40-20).toFixed(0);
  html+=`<span class="bubble" style="--size:${size}px;--left:${left}vw;--dur:${dur}s;--delay:${delay}s;--drift:${drift}px"></span>`;
 }
 bg.innerHTML=html;
}

/* ============================================================
   ICONOS DE ESTADO — usados en la cabecera de feedback (correcto/incorrecto)
   ============================================================ */
function statusIcon(ok){
 return ok
  ?'<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="status-ico-ring ok"/><path d="M12 21l5 5 11-13" class="status-ico-mark"/></svg>'
  :'<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="status-ico-ring err"/><path d="M20 11v12" class="status-ico-mark"/><circle cx="20" cy="28" r="1.6" class="status-ico-dot"/></svg>';
}

// iconInner() devuelve SOLO el contenido (paths/circles), sin envoltorio <svg>.
// Esto es lo que se debe insertar dentro del mapa SVG principal: un <svg> anidado
// sin width/height hereda por defecto el tamaño del viewport del SVG padre,
// lo que provoca iconos gigantes que tapan el mapa.
function iconInner(type){
 const common='stroke="#dbeeff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"';
 const wave='<path d="M6 50q8 5 16 0t16 0t16 0" stroke="#3fb6d8" stroke-width="3" fill="none"/>';
 if(type==='solar')return `<rect x="16" y="18" width="40" height="26" rx="2" ${common}/><path d="M16 31h40M29 18v26M43 18v26" ${common}/>${wave}<path class="solar-shine" d="M12 10L5 5M60 10l7-5M36 8V0" stroke="#8fd0e6" stroke-width="3" fill="none"/>`;
 if(type==='wind')return `<g class="wind-rotor"><circle cx="36" cy="22" r="3" fill="#dbeeff"/><path d="M36 22V4M36 22l16 10M36 22L20 32" ${common}/></g><path d="M36 25v35" ${common}/>${wave}`;
 if(type==='tide')return `
  <path class="tide-wave" d="M7 53q8 5 16 0t16 0t16 0" stroke="#3fb6d8" stroke-width="3" fill="none"/>
  <path class="tide-wave" d="M10 61q8 5 16 0t16 0t16 0" stroke="#3fb6d8" stroke-width="3" fill="none"/>
  <path d="M18 24h36M22 24v31M50 24v31M36 24v31" ${common}/>
  <circle cx="36" cy="45" r="10" ${common}/>
  <path d="M36 35v20M26 45h20M30 38l12 14M42 38L30 52" ${common}/>`;
 if(type==='sub')return `<rect x="16" y="26" width="40" height="32" ${common}/><path d="M24 26v-12M36 26v-16M48 26v-12" ${common}/><path class="electric-pulse" d="M39 30l-10 17h9l-5 13 13-20h-9z" fill="#8fd0e6" stroke="none"/>`;
 if(type==='bio')return `<path d="M10 25q12-10 24 0q-12 10-24 0z" ${common}/><circle cx="28" cy="24" r="1.6" fill="#dbeeff"/><path d="M48 18q-8 8 0 16q8-8 0-16zM51 30q8 5 14 0" ${common}/><path class="bio-sway" d="M38 56c-4-10 4-18 0-28M48 58c-5-12 6-20 2-31M57 58c-4-8 4-14 0-22" stroke="#4fd3a8" stroke-width="3" fill="none"/>${wave}`;
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
 const energy=Math.round(solved.size/incidents.length*100);
 const energyStat=$('statEnergy');
 energyStat.textContent=energy+'%';
 $('statBadges').textContent=earned.size+'/'+incidents.length;
 const statCard=energyStat.closest('.stat');
 if(statCard){
   statCard.classList.add('energy-stat');
   let bar=statCard.querySelector('.progress-bar');
   if(!bar){
     const shell=document.createElement('div');
     shell.className='progress-shell';
     shell.innerHTML='<div class="progress-bar"></div>';
     statCard.appendChild(shell);
     bar=shell.querySelector('.progress-bar');
   }
   bar.style.width=energy+'%';
 }
}
function initZones(){
 incidents.forEach((inc,idx)=>{
  const z=$(inc.zone); z.classList.add('alarm');
  z.addEventListener('click',()=>select(idx));
 });
}
function select(idx){selected=idx; document.querySelectorAll('.zone').forEach(z=>z.classList.remove('selected')); $(incidents[idx].zone).classList.add('selected'); renderIncident(idx);}
let tfPending={};
function renderIncident(idx){
 const inc=incidents[idx], done=answered.has(idx), type=inc.type||'quiz';
 const physicalTag=inc.physical?`<span class="physical-tag"><svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>Prueba física</span>`:'';
 const physicalCallout=inc.physical?`<div class="physical-callout">
    <div class="physical-callout-icon"><svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg></div>
    <div class="physical-callout-text">
      <strong>Antes de responder</strong>${inc.physicalTask}
      ${inc.memoryGame?`<button class="memory-open-btn" type="button" data-memory-src="${inc.memoryGame}"><svg viewBox="0 0 24 24"><path d="M2 8h13a2.5 2.5 0 1 0-2-4"/><path d="M2 13h17a2.5 2.5 0 1 1-2 4"/></svg>Jugar memoria digital</button>`:''}
      ${inc.puzzleGame?`<button class="memory-open-btn" type="button" data-puzzle-src="${inc.puzzleGame}"><svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>Montar puzle digital</button>`:''}
    </div>
  </div>`:'';

 let bodyHtml='';
 if(type==='truefalse'){
  const storedTf=chosen[idx]||{};
  bodyHtml=`<div class="tf-list">${inc.statements.map((s,si)=>{
    const chosenVal=done?storedTf[si]:undefined;
    const trueCls=done?(chosenVal===true?(s.answer===true?'right':'wrong'):(s.answer===true?'reveal':'')):'';
    const falseCls=done?(chosenVal===false?(s.answer===false?'right':'wrong'):(s.answer===false?'reveal':'')):'';
    return `<div class="tf-item" data-si="${si}">
      <p class="tf-text">${s.text}</p>
      <div class="tf-btns">
        <button class="tf-btn ${trueCls}" data-si="${si}" data-val="true" ${done?'disabled':''}>Verdadero</button>
        <button class="tf-btn ${falseCls}" data-si="${si}" data-val="false" ${done?'disabled':''}>Falso</button>
      </div>
    </div>`;
  }).join('')}</div>`;
 } else if(type==='code'){
  const storedCode=done?(chosen[idx]||''):'';
  bodyHtml=`<div class="code-entry">
    <label class="code-label" for="codeInput">${inc.codeLabel||'Introduce el código'}</label>
    <input type="text" id="codeInput" class="code-input" autocomplete="off" placeholder="Ej. ABC-01" value="${storedCode}" ${done?'disabled':''}/>
  </div>`;
 } else {
  bodyHtml=`<div class="options">${inc.options.map((op,i)=>{
    const cls=done?(i===inc.correct&&solved.has(idx)?'right':(chosen[idx]===i&&!solved.has(idx)?'wrong':'')):'';
    return `<button class="opt ${cls}" data-opt="${i}" ${done?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${op}</button>`;
  }).join('')}</div>`;
 }

 $('questionCol').innerHTML=`<div class="panel question-panel">
    <div class="mission-top">
      <div class="mission-icon">${makeIcon(inc.icon)}</div>
      <div class="mission-top-text">
        <div class="mission-meta-row"><span class="mission-meta">${inc.title} · ${inc.theme}</span>${physicalTag}</div>
        <h3>${inc.subtitle}</h3>
      </div>
    </div>
    <div class="mission-body">
      ${physicalCallout}
      <div class="question-block">
        <div class="question-label">Ahora responde</div>
        <p class="question-text">${inc.question}</p>
        ${bodyHtml}
      </div>
      <div class="feedback" id="feedback"></div>
      <div class="actions"><button class="confirm" id="confirmBtn" disabled ${done?'disabled':''}>Comprobar</button></div>
    </div>
  </div>`;

 document.querySelectorAll('.memory-open-btn').forEach(btn=>{
  if(btn.dataset.memorySrc) btn.addEventListener('click',()=>openMemoryModal(btn.dataset.memorySrc));
  if(btn.dataset.puzzleSrc) btn.addEventListener('click',()=>openPuzzleModal(btn.dataset.puzzleSrc));
 });

 if(done){
  const fb=$('feedback'); const ok=solved.has(idx);
  fb.className='feedback show '+(ok?'ok':'err');
  fb.innerHTML=`<div class="feedback-inner"><div class="feedback-icon">${statusIcon(ok)}</div><div class="feedback-msg">${ok?'<strong>Sistema recuperado.</strong> La zona vuelve a producir energía.':'<strong>Alarma pendiente.</strong> Esta pregunta ya quedó bloqueada.'}</div></div>`;
  return;
 }

 if(type==='truefalse'){
  tfPending={};
  document.querySelectorAll('.tf-btn').forEach(b=>b.addEventListener('click',()=>{
   const si=Number(b.dataset.si), val=b.dataset.val==='true';
   tfPending[si]=val;
   document.querySelectorAll(`.tf-btn[data-si="${si}"]`).forEach(x=>x.classList.remove('selected'));
   b.classList.add('selected');
   $('confirmBtn').disabled = Object.keys(tfPending).length < inc.statements.length;
  }));
  $('confirmBtn').onclick=()=>{
   const ok=inc.statements.every((s,si)=>tfPending[si]===s.answer);
   submitAnswer(idx, ok, {...tfPending});
  };
 } else if(type==='code'){
  const input=$('codeInput');
  input.addEventListener('input',()=>{ $('confirmBtn').disabled = input.value.trim().length===0; });
  $('confirmBtn').onclick=()=>{
   const val=input.value.trim();
   const ok=val.toUpperCase()===String(inc.code).toUpperCase();
   submitAnswer(idx, ok, val);
  };
 } else {
  let pending=null;
  document.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{
   pending=Number(b.dataset.opt);
   document.querySelectorAll('.opt').forEach(x=>x.classList.remove('selected'));
   b.classList.add('selected'); $('confirmBtn').disabled=false;
  }));
  $('confirmBtn').onclick=()=>submitAnswer(idx, pending===inc.correct, pending);
 }
}

function submitAnswer(idx, ok, storedValue){
 const inc=incidents[idx]; answered.add(idx); chosen[idx]=storedValue; const z=$(inc.zone);
 if(ok){ solved.add(idx); earned.add(inc.badge); z.classList.remove('alarm'); z.classList.add('done'); }
 else{ z.classList.add('wrong'); }
 updateHud();
 showResultModal(ok,
  ok?'<strong>Correcto.</strong> Sistema recuperado e insignia desbloqueada.':'<strong>No es correcto.</strong> La alarma permanece activa y la pregunta queda bloqueada.',
  ()=>{ renderIncident(idx); if(answered.size===incidents.length) setTimeout(finish,250); }
 );
}

/* ============================================================
   VENTANA EMERGENTE DE RESULTADO — sustituye el aviso en línea
   ============================================================ */
function showResultModal(ok,msgHtml,onClose){
 const modal=$('resultModal'); if(!modal) return;
 modal.classList.remove('ok','err'); modal.classList.add(ok?'ok':'err');
 $('resultIcon').innerHTML=statusIcon(ok);
 $('resultTitle').textContent=ok?'Respuesta correcta':'Respuesta incorrecta';
 $('resultMsg').innerHTML=msgHtml;
 modal.classList.remove('hidden');
 const close=()=>{ modal.classList.add('hidden'); if(onClose) onClose(); };
 modal.dataset.pendingClose='1';
 modal._close=close;
}
/* ============================================================
   VENTANA EMERGENTE DEL JUEGO DE MEMORIA — se usa en el reto eólico
   como alternativa digital a la mesa de cartas físicas. Se carga
   en un iframe para no mezclar su CSS/JS con el resto de la app.
   ============================================================ */
function openMemoryModal(src){
 if(missionEnded) return;
 const modal=$('memoryModal'); if(!modal||!src) return;
 $('memoryFrame').src=src;
 modal.classList.remove('hidden');
}
function closeMemoryModal(){
 const modal=$('memoryModal'); if(!modal) return;
 modal.classList.add('hidden');
 $('memoryFrame').src='';
}
/* ============================================================
   VENTANA EMERGENTE DEL PUZLE — se usa en el reto de la subestación
   como alternativa digital a la mesa del puzle físico. Mismo patrón
   que la ventana de la memoria: iframe aislado dentro de un modal.
   ============================================================ */
function openPuzzleModal(src){
 if(missionEnded) return;
 const modal=$('puzzleModal'); if(!modal||!src) return;
 $('puzzleFrame').src=src;
 modal.classList.remove('hidden');
}
function closePuzzleModal(){
 const modal=$('puzzleModal'); if(!modal) return;
 modal.classList.add('hidden');
 $('puzzleFrame').src='';
}
/* ============================================================
   PANTALLA FINAL — insignia de misión, tarjeta de energía,
   fotografía del parque con badges y colección de cartas MARES
   ============================================================ */
const CHECK_SVG='<svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>';
const CROSS_SVG='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

// El atributo src de cada carta usa inc.cardImg (definido junto a cada incidencia,
// arriba de este archivo). Sustituye esos nombres de archivo por tus propias
// imágenes (por ejemplo carta_mareomotriz.jpg) y colócalas junto al index.html.
function buildCollectionGrid(){
 return incidents.map(inc=>{
  const e=earned.has(inc.badge);
  return `<div class="collection-card ${e?'earned':'locked'}" data-type="${inc.icon}">
    <div class="collection-card-top">
      <span class="collection-card-status ${e?'earned':'locked'}">${e?CHECK_SVG:CROSS_SVG}</span>
    </div>
    <div class="collection-card-photo">
      <img src="${inc.cardImg}" alt="${inc.cardTitle}" onerror="this.closest('.collection-card-photo').classList.add('img-missing')"/>
    </div>
    <h4>${inc.cardTitle}</h4>
    <p>${inc.summary}</p>
  </div>`;
 }).join('');
}
function finish(){
 stopTimer();
 missionEnded=true;
 closeMemoryModal(); closePuzzleModal();
 const resultModal=$('resultModal');
 if(resultModal && !resultModal.classList.contains('hidden')) resultModal.classList.add('hidden');
 document.body.classList.remove('screen-game','screen-start');
 document.body.classList.add('screen-final');
 const energy=Math.round(solved.size/incidents.length*100);
 $('gameLayout').classList.add('hidden'); $('finale').classList.remove('hidden');
 const success=energy===100;

 const badge=$('missionBadge');
 badge.className='mission-badge'+(success?'':' partial');
 badge.innerHTML=success
  ?'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg><span>Parque restablecido</span>'
  :(timeExpired?'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 7v6.5M12 16.5v.1"/></svg><span>Tiempo agotado</span>'
             :'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 7v6.5M12 16.5v.1"/></svg><span>Recuperación parcial</span>');

 $('finalHeadline').textContent=success?'¡Parque restablecido!':(timeExpired?'Se agotó el tiempo':'Sistema parcialmente restablecido');
 $('finalText').textContent=success
  ?'Habéis desactivado las cinco alarmas antes de que se acabara el tiempo. La tormenta ya no supone una amenaza: el parque marino MARES vuelve a funcionar al 100%.'
  :(timeExpired?'Se acabaron los 20 minutos con el parque parcialmente recuperado. Revisad juntos las alarmas pendientes.'
              :'El parque queda parcialmente recuperado. Volved a intentar las alarmas pendientes para restablecer el sistema por completo.');

 $('finalEnergyValue').textContent=energy+'%';
 const circumference=2*Math.PI*42;
 const ringFill=$('energyRingFill');
 ringFill.style.strokeDasharray=circumference;
 ringFill.style.strokeDashoffset=circumference-(circumference*energy/100);

 $('collectionGrid').innerHTML=buildCollectionGrid();
 $('collectionCount').textContent=earned.size+'/'+incidents.length;
 $('collectionNote').textContent=success
  ?'Busca las cartas físicas correspondientes a tus insignias y añádelas a tu colección MARES.'
  :'Consigue todas las insignias para desbloquear tu colección completa MARES.';

 window.scrollTo({top:0,behavior:'smooth'});
}
function restart(){
 stopTimer(); timeLeft=MISSION_SECONDS; timeExpired=false; missionEnded=false; updateTimerDisplay();
 document.body.classList.remove('screen-game','screen-final');document.body.classList.add('screen-start');
 answered.clear();solved.clear();earned.clear();selected=null;chosen={};
 document.querySelectorAll('.zone').forEach(z=>z.classList.remove('selected','done','wrong','locked'));
 incidents.forEach(i=>$(i.zone).classList.add('alarm'));
 $('questionCol').innerHTML='<div class="panel empty-state"><h2>Selecciona un sistema del mapa</h2><p>Elige una alarma activa para abrir su ficha técnica con una pregunta y tres posibles respuestas.</p></div>';
 $('finale').classList.add('hidden');$('gameLayout').classList.remove('hidden');
 updateHud();$('gameScreen').classList.add('hidden');$('startScreen').classList.remove('hidden');
 window.scrollTo({top:0,behavior:'smooth'});
}
populateMap(); initZones(); updateHud(); spawnBubbles();
(function initResultModal(){
 const modal=$('resultModal'); if(!modal) return;
 const trigger=()=>{ if(modal._close) modal._close(); };
 $('resultClose').onclick=trigger;
 $('resultContinue').onclick=trigger;
 modal.addEventListener('click',(ev)=>{ if(ev.target===modal) trigger(); });
 document.addEventListener('keydown',(ev)=>{ if(ev.key==='Escape' && !modal.classList.contains('hidden')) trigger(); });
})();
(function initMemoryModal(){
 const modal=$('memoryModal'); if(!modal) return;
 $('memoryClose').onclick=closeMemoryModal;
 modal.addEventListener('click',(ev)=>{ if(ev.target===modal) closeMemoryModal(); });
 document.addEventListener('keydown',(ev)=>{ if(ev.key==='Escape' && !modal.classList.contains('hidden')) closeMemoryModal(); });
})();
(function initPuzzleModal(){
 const modal=$('puzzleModal'); if(!modal) return;
 $('puzzleClose').onclick=closePuzzleModal;
 modal.addEventListener('click',(ev)=>{ if(ev.target===modal) closePuzzleModal(); });
 document.addEventListener('keydown',(ev)=>{ if(ev.key==='Escape' && !modal.classList.contains('hidden')) closePuzzleModal(); });
})();
$('restartBtn').onclick=restart;
$('startBtn').onclick=()=>{document.body.classList.remove('screen-start','screen-final');document.body.classList.add('screen-game');$('startScreen').classList.add('hidden'); $('gameScreen').classList.remove('hidden'); startTimer(); window.scrollTo({top:0,behavior:'smooth'});};
})();

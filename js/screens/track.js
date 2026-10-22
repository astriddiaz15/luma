/* ============================================================
   LUMA — screens: TRACK / racha / fotografía de progreso
   Figma nodes: 71:3333, 118:5182, 223:5877, 297:2910,
                67:2190, 181:5102, 181:5792, 118:5470
   ============================================================ */

/* Estrella exacta exportada de Figma (I71:3337;70:2918, 66×66,
   stroke #fff w4 INSIDE → render ROUND / miterlimit 10).
   SVG vectorial original como <img> (rasterización nativa exacta). */
const TRACK_STAR_SVG = `<img class="track__staricon" src="assets/luma/star-track.svg" width="66" height="66" alt="">`;

/* Glifo de calendario exacto exportado de Figma
   (I82:4695;56:1577;52:1432, 31×31, stroke 2.26829 #F8F8F8) */
const TRACK_CAL_SVG = `<img class="track__calicon" src="assets/luma/glyph-calendar.svg" width="31" height="31" alt="">`;

/* Burbujas «día de progreso» — 4×125×125 (Figma 71:3333):
   [71,-37] y [242,143] azul rgba(49,76,225,.80);
   [35,593] y [238,678] pálida rgba(217,217,217,.20);
   Ellipse 39 = fill + GLASS + drop-shadow(0,6,15,.25), sin strokes.
   En 118:5182 la inferior va en x=232. */
function trackStars(done){
  return `<div class="track__stars">
    <div class="track__star track__star--top"><div class="track__bub track__bub--blue">${TRACK_STAR_SVG}</div></div>
    <div class="track__star track__star--right"><div class="track__bub track__bub--blue">${TRACK_STAR_SVG}</div></div>
    <div class="track__star track__star--left"><div class="track__bub track__bub--pale">${TRACK_STAR_SVG}</div></div>
    <div class="track__star track__star--bottom${done ? ' track__star--bottom--done' : ''}"><div class="track__bub track__bub--pale">${TRACK_STAR_SVG}</div></div>
  </div>`;
}

/* Pantalla TRACK — 71:3333 (base) / 118:5182 (done) / 223:5877 (pale)
   / 67:2190-style registro foto (saved: modal «Your picture has been saved») */
function trackScreen({done=false, pale=false, saved=false}={}){
  return `<div class="scr scr--track">
    ${statusBar(false)}
    ${trackStars(done)}

    ${topSearchBar()}

    <button class="track__cal" data-go="/history">${TRACK_CAL_SVG}</button>

     <button class="track__blob${pale ? ' track__blob--pale' : ''}${done ? ' track__blob--done' : ''}"${pale?' data-go="/track"':''} aria-label="Continue">${mascot(244,{face: done ? 'calm' : 'sleepy'})}</button>

    <button class="track__racha" data-go="/racha" aria-label="Day streak"><img src="assets/luma/face-racha.png" alt=""></button>
    <button class="track__add" data-go="/photo" aria-label="Add photo"><span>+</span></button>

    ${bottomNav('routine',{labels:true})}

    ${saved ? `<div class="trackmodal fade-in">
      <button class="trackmodal__close" data-go="/track">${Icons.close('#B9B9BE',16)}</button>
      <span class="trackmodal__badge trackmodal__badge--check"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7.5"/></svg></span>
      <p class="trackmodal__text">Your picture has been saved</p>
    </div>` : ''}
    ${done ? `<div class="trackmodal fade-in">
      <button class="trackmodal__close" data-go="/track">${Icons.close('#B9B9BE',16)}</button>
      <span class="trackmodal__badge"><svg width="18.6" height="18.8" viewBox="0 0 24 24" fill="#fff"><path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8-5.3-2.9-5.3 2.9 1.1-5.8L3.5 9.6l5.9-.8z"/></svg></span>
       <p class="trackmodal__text">Congratulations, you have completed your daily routine.</p>
    </div>` : ''}
  </div>`;
}

/* La sección «Progreso» se abre con el SEGUNDO icono de la navegación
   (pestaña Progress de Figma, icono de destellos). Se arma al entrar Y al
   pulsar el ícono: cualquiera de los dos deja la app a la espera de UNA
   detección real del sensor. */
App.route('/track',        { render: ()=>trackScreen({}), init(){
  Store.set('progressArmed', true);          // armada al entrar (y también con el ícono)
  LumaDevice.log('ARM', 'Progreso armado: esperando detección del sensor');
  if(Store.get('trackPending',false)){
    Store.set('trackPending',false);
    App.after(()=>go('/track/done'),500);
  }
} });
App.route('/track/complete', { render: ()=>trackScreen({pale:true}), init(node){
  node.querySelector('.track__blob').addEventListener('click',()=>Store.set('trackPending',true));
} });
App.route('/track/done', { render: ()=>trackScreen({done:true}), init(){
  /* Detección real del sensor: Track 2 permanece ~2 s y vuelve a Track,
     donde la app se queda. El recorrido manual conserva sus 400 ms. */
  if(Store.get('trackFromDevice', false)){
    Store.set('trackFromDevice', false);
    LumaDevice.log('NAV', 'Track 2 visible: vuelta a Track en 2 s');
    App.after(()=>go('/track'), 2000);
    return;
  }
  App.after(()=>go('/track'),400);
} });
App.route('/track/pale',   { render: ()=>trackScreen({pale:true}) });
App.route('/track/saved',  { render: ()=>trackScreen({saved:true}) });

/* ---------- evento REAL del sensor de proximidad ----------
   Sólo actúa cuando el usuario está en la pantalla de Progreso (Track),
   es decir, después de seleccionar el segundo icono de la navegación.
   Se arma al entrar a Progreso y también al pulsar ese icono; la detección
   consume el armado, así que una sola aproximación produce una sola
   transición. En cualquier otra pantalla la detección se ignora. */

/* Pulsar el segundo icono (pestaña Progress) estando YA en Progreso no
   cambia el hash, así que el init de la ruta no corre: re-armamos aquí.
   Si todavía no hay enlace, el mismo gesto del clic abre el puerto USB
   ya autorizado (nunca una segunda conexión). */
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-nav="routine"]');
  if(!b) return;
  Store.set('progressArmed', true);
  LumaDevice.log('ARM', 'ícono de destellos · esperando detección real del sensor');
  if(LumaDevice.state === 'off' && LumaDevice.supported){
    LumaDevice.log('ARM', 'sin enlace: abriendo el puerto USB existente');
    LumaDevice.requestLink();
  }
});

document.addEventListener('luma:routine', ()=>{
  if(location.hash !== '#/track'){
    LumaDevice.log('NAV', 'detección ignorada: pantalla ' + (location.hash || '#/'));
    return;
  }
  if(!Store.get('progressArmed', false)){
    LumaDevice.log('NAV', 'detección ignorada: flujo no armado');
    return;
  }
  Store.set('progressArmed', false);              // una sola vez
  Store.set('trackFromDevice', true);

  /* El guardado del contador (añadido con las rachas) NO puede cortar el
     flujo: si el perfil o localStorage fallan, la felicitación, el regreso
     a Track y el re-armado siguen ocurriendo igual. */
  let total = null;
  try{
    total = Profile.completeRoutine();            // 1 rutina por detección
  }catch(e){
    LumaDevice.log('ERROR', 'no se pudo guardar la rutina: ' + (e && e.message ? e.message : e));
  }

  if(total === null){
    LumaDevice.log('NAV', 'detección aceptada sin registro de contador · abriendo Track 2');
  }else{
    LumaDevice.log('NAV', 'rutina ' + total + ' completada · racha +1 · calendario actualizado · abriendo Track 2');
  }
  go('/track/done');                              // Track 2
});

/* =========================== RACHA =========================== */
App.route('/racha', {
  render(){
    const days = ['M','T','W','T','F','S','S'];
    const state = ['burn','burn','burn','today','off','off','off'];
     return `<div class="scr scr--racha">
      ${statusBar(false)}
      <button class="roundbtn racha__back" data-go="/track">${Icons.back('#E08A3C',20)}</button>
      <div class="scr__body racha__body">
         <div class="racha__blob"><img class="racha__original" src="assets/luma/streak-original.svg" alt=""></div>
        <div class="racha__num${String(Profile.current().routines).length > 3 ? ' racha__num--long' : ''}">${Profile.current().routines}</div>
        <div class="racha__label">day streak</div>
         <p class="racha__msg">You're doing an amazing job${DB.user.name ? ' ' + DB.user.name : ''}!</p>
        <div class="racha__week card">
          ${days.map((d,i)=>`<div class="racha__day">
            <span class="racha__letter">${d}</span>
            <span class="racha__flame racha__flame--${state[i]}">${flameSvg(state[i])}</span>
          </div>`).join('')}
        </div>
        <div style="height:60px"></div>
      </div>
    </div>`;
  }
});

function flameSvg(kind){
  const c = kind==='burn' ? '#E08A3C' : kind==='today' ? '#4A62E8' : 'transparent';
  const ring = kind==='off' ? '#EBEBEF' : 'transparent';
  return `<span class="flame" style="background:${kind==='off'?'#F1F1F4':'linear-gradient(180deg,#EFA257,#E0832F)'};box-shadow:${kind==='off'?'none':'0 4px 10px rgba(224,131,47,.35)'}">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round">
      <path d="M12 3s5 4.2 5 8.6A5 5 0 0 1 7 11.6C7 9 9 7.6 9 7.6s.4 2 1.6 2.6C11.4 8 12 5.6 12 3Z"/>
      <path d="M12 20.5a3.4 3.4 0 0 1-3.4-3.4c0-2 1.7-3.1 1.7-3.1s.4 1.2 1 1.6c.5-1.3 1-2.5 1-2.5s2.1 1.4 2.1 4a3.4 3.4 0 0 1-2.4 3.4Z" opacity=".9"/>
    </svg>
  </span>`;
}

/* ================= FOTOGRAFÍA DE PROGRESO (cámara) ================= */
App.route('/photo', {
  render(){
    return `<div class="scr scr--photo">
      ${statusBar(false)}
      <div class="photo__head">
        <button class="roundbtn photo__back" data-go="/track">${Icons.back('#fff',22)}</button>
        <h1 class="photo__title">Ready?</h1>
        <p class="photo__sub">Give a big smile ${DB.user.name}</p>
      </div>
      <div class="scr__body photo__body">
        <div class="photo__frame">
          ${[0,1,2].map(()=>`<div class="photo__row"><i></i><i></i><i></i></div>`).join('')}
        </div>
        <button class="photo__shutter" data-capture><span></span></button>
        <button class="photo__upload" data-upload>Upload from device ${upArrow()}</button>
        <div style="height:40px"></div>
      </div>
    </div>`;
  },
  init(el){
    el.querySelector('[data-capture]').addEventListener('click', ()=>go('/glowing'));
    el.querySelector('[data-upload]').addEventListener('click', ()=>go('/glowing'));
  }
});

function upArrow(){
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px"><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></svg>`;
}

/* --------- foto guardada / galería de progreso --------- */
App.route('/photo/saved', {
  render(){
    return `<div class="scr scr--photo scr--photo-saved">
      ${statusBar(false)}
      <div class="photo__head">
        <button class="roundbtn photo__back" data-go="/track">${Icons.back('#fff',22)}</button>
        <h1 class="photo__title">Nice!</h1>
        <p class="photo__sub">Your progress photo was saved</p>
      </div>
      <div class="scr__body photo__body">
        <div class="photo__saved">
          <img src="assets/img/progress-photo.png" alt="Progress" onerror="this.style.display='none'">
        </div>
        <div class="photo__dates">
          <span>Aug 14, 2025</span><span>Aug 28, 2025</span><span>Sep 14, 2025</span>
        </div>
        <button class="btn btn--glass photo__cta" data-go="/track">Done</button>
        <button class="photo__link" data-go="/photo">Take another one</button>
        <div style="height:40px"></div>
      </div>
    </div>`;
  }
});

/* --------- galería de fotos de progreso --------- */
App.route('/photos', {
  render(){
    return `<div class="scr scr--photos">
      ${statusBar(false)}
      <div class="photos__head">
        <button class="roundbtn" data-go="/track">${Icons.back('#fff',22)}</button>
        <h1 class="photos__title">My progress</h1>
      </div>
      <div class="scr__body photos__body">
        <div class="photos__grid">
          ${['Sep 14, 2025','Aug 28, 2025','Aug 14, 2025','Jul 30, 2025'].map(d=>`
            <figure class="photos__item">
              <img src="assets/img/progress-photo.png" alt="${d}" onerror="this.style.display='none'">
              <figcaption>${d}</figcaption>
            </figure>`).join('')}
        </div>
        <button class="btn btn--glass photos__cta" data-go="/photo">New photo</button>
        <div style="height:40px"></div>
      </div>
    </div>`;
  }
});

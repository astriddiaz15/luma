/* ============================================================
   LUMA — screens: dispositivos (LUMA Moduls + flujo Steps 1-5)
   Figma nodes: 172:3000, 177:3371, 177:3306, 177:3603, 233:6003,
                257:6530, 257:6665, 257:6716, 298:7025, 298:7115,
                298:7292, 298:7326, 298:7439, 298:7987, 298:8064, 298:8242
   ============================================================ */

const DEVICE_IMG = 'assets/img/device-photo.png';

function deviceCard(d, opts={}){
  /* opts.linked: estado real del enlace (punto azul #314CE1 / gris #D9D9D9) */
  const linked = (opts.linked !== undefined);
  const on = linked ? !!opts.linked : d.on;
  return `<div class="devcard ${opts.cls||''}"${linked?' data-live="1"':''} data-go="/devices/module">
    <div class="devcard__photo">
      <img src="${DEVICE_IMG}" alt="Modul" onerror="this.style.display='none'">
    </div>
    <span class="devcard__dot ${on?'is-on':''}"></span>
    <p class="devcard__name">${d.name}</p>
    <p class="devcard__product">${d.product}</p>
    <p class="devcard__serial">${d.serial}</p>
  </div>`;
}

/* Punto de estado real (azul #314CE1 / gris #D9D9D9) en las tarjetas
   marcadas con data-live. Se actualiza en vivo con luma:state. */
function bindLiveDots(){
  const sync = ()=>document.querySelectorAll('[data-live] .devcard__dot')
    .forEach(dot=>dot.classList.toggle('is-on', LumaDevice.state==='connected'));
  if(window.__lumaStateSync) document.removeEventListener('luma:state', window.__lumaStateSync);
  window.__lumaStateSync = sync;
  document.addEventListener('luma:state', sync);
  sync();
}

const DEVICES = [
  { name:'Module 2', product:"CeraVe Oii", serial:'DIS092930', on:true },
  { name:'Module 1', product:'Serum', serial:'DIS092930', on:false }
];

const DEVICES_FULL = [
  { name:'Module 3', product:'Marine Serum', serial:'DIS092930', on:true },
  { name:'Module 2', product:"CeraVe Oii", serial:'DIS092930', on:true },
  { name:'Module 1', product:'Serum', serial:'DIS092930', on:false }
];

/* ---------- LUMA Moduls (lista de dispositivos) ---------- */
App.route('/devices', {
  render(){
    return `<div class="scr scr--violet scr--devices">
      ${statusBar(true)}
      <div class="scr__body devices__body">
        <div class="devices__top">
          ${backBtn('/home')}
          <button class="devices__edit"><span>Edit</span><img src="assets/luma/glyph-edit.png" alt="" aria-hidden="true" onerror="this.replaceWith(document.createRange().createContextualFragment(Icons.edit('#fff',18)))"></button>
        </div>
        <h1 class="devices__h">LUMA<br>Moduls</h1>
        <p class="devices__sub">Link your new device!</p>
        <div class="devices__grid">
          <button class="devadd" data-go="/devices/looking"><span>+</span></button>
          ${DEVICES.map(d=>deviceCard(d)).join('')}
        </div>
        <div style="height:40px"></div>
      </div>
    </div>`;
  },
  init(el){
    const add = el.querySelector('.devadd');
    if(add) add.addEventListener('click', ()=>LumaDevice.requestLink());
  }
});

/* ---------- buscando dispositivos ---------- */
App.route('/devices/looking', {
  render(){
    return `<div class="scr scr--violet scr--devices">
      ${statusBar(true)}
      <div class="scr__body devices__body">
        <div class="devices__top">${backBtn('/devices')}</div>
        <h1 class="devices__h">LUMA<br>Moduls</h1>
        <p class="devices__sub">Link your new device!</p>
        <div class="devices__grid">
          <div class="devadd"><span>+</span></div>
          ${DEVICES.map(d=>deviceCard(d)).join('')}
        </div>
      </div>
      <div class="devoverlay">
        <div class="devsearching fade-in">
          <span>Looking for new devices</span>
          <span class="spinner">${burstSvg('#fff')}</span>
        </div>
      </div>
    </div>`;
  },
  init(){
    /* El enlace inalámbrico es la simulación visual de Figma; el parpadeo
       del LED sí es real y se envía al dispositivo por USB (LUMA_LINK). */
    LumaDevice.requestLink();
    App.after(()=>go('/devices/added'), 2200);
  }
});

/* ---------- dispositivo agregado ---------- */
App.route('/devices/added', {
  render(){
    return `<div class="scr scr--violet scr--devices scr--devadded">
      ${statusBar(true)}
      <div class="scr__body devices__body">
        <div class="devices__top">
          ${backBtn('/devices')}
          <button class="devices__edit"><span>Edit</span><img src="assets/luma/glyph-edit.png" alt="" aria-hidden="true" onerror="this.replaceWith(document.createRange().createContextualFragment(Icons.edit('#fff',18)))"></button>
        </div>
        <h1 class="devices__h">LUMA<br>Moduls</h1>
        <p class="devices__sub">Link your new device!</p>
        <div class="devices__grid">
          <div class="devadd"><span>+</span></div>
          ${deviceCard(DEVICES_FULL[0], {linked: LumaDevice.state==='connected'})}
          ${DEVICES.map(d=>deviceCard(d)).join('')}
        </div>
      </div>
      <div class="devtoast fade-in">
        <span class="devtoast__circle"></span>
        <svg class="devtoast__check" viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="3.03" stroke-linecap="round" stroke-linejoin="round"><path d="M5.63 15.3L12.1 21.82L26.63 8.82"/></svg>
        <p class="devtoast__text">You're all set!</p>
        <button class="devtoast__x" data-close-devtoast aria-label="Close">
          <svg viewBox="0 0 14.39 14.39" fill="none" stroke="#6d6d6d" stroke-width="1.51" stroke-linecap="round"><path d="M3 3L11.39 11.39"/><path d="M11.39 3L3 11.39"/></svg>
        </button>
      </div>
    </div>`;
  },
  init(){
    const t = document.querySelector('.devtoast');
    const x = document.querySelector('[data-close-devtoast]');
    if(x && t) x.addEventListener('click', ()=>{ t.style.display='none'; });

    /* El punto del módulo refleja el enlace real, también si cambia en vivo */
    bindLiveDots();
  }
});

/* ---------- detalle de módulo (233:6003) ---------- */
App.route('/devices/module', {
  render(){
    const d = DEVICES_FULL[0];
    return `<div class="scr scr--violet scr--devices">
      ${statusBar(true)}
      <div class="scr__body moddet__body">
        <button class="roundbtn roundbtn--png moddet__back" data-go="/devices" aria-label="Back">
          <img src="assets/luma/back-gray.png" alt="" aria-hidden="true" onerror="this.replaceWith(document.createRange().createContextualFragment(Icons.back('#fff',22)))">
        </button>
        <button class="moddet__edit"><span>Edit</span><img src="assets/luma/glyph-edit.png" alt="" aria-hidden="true" onerror="this.replaceWith(document.createRange().createContextualFragment(Icons.edit('#fff',18)))"></button>
        <div class="moddet__card">
          <div class="moddet__photo">
            <img src="${DEVICE_IMG}" alt="Modul" onerror="this.style.display='none'">
          </div>
          <h1 class="moddet__h">Module 3</h1>
          <p class="moddet__label moddet__label--product">Product:</p>
          <p class="moddet__value moddet__value--product">Marine Serum</p>
          <p class="moddet__label moddet__label--level">Level:</p>
          <p class="moddet__value moddet__value--level">79%</p>
          <span class="moddet__line moddet__line--1"></span>
          <p class="moddet__label moddet__label--days">Days:</p>
          <p class="moddet__value moddet__value--days">Tuesday, Thursday, Saturday</p>
          <span class="moddet__line moddet__line--2"></span>
          <p class="moddet__label moddet__label--schedule">Schedule:</p>
          <p class="moddet__value moddet__value--schedule">8:00 am, 8:00 pm</p>
          <span class="moddet__line moddet__line--3"></span>
        </div>
      </div>
    </div>`;
  }
});

function burstSvg(c){
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round">
    ${[...Array(8)].map((_,i)=>{const a=i*Math.PI/4;return `<line x1="${(12+Math.cos(a)*3.2).toFixed(2)}" y1="${(12+Math.sin(a)*3.2).toFixed(2)}" x2="${(12+Math.cos(a)*9).toFixed(2)}" y2="${(12+Math.sin(a)*9).toFixed(2)}"/>`}).join('')}
  </svg>`;
}

/* ======================= STEPS 1..5 ======================= */
function stepBar(n){
  const names = ['Step 1','Step 2','Step 3','Step 4','Step 5'];
  return `<div class="steps__bar">
    ${n<5?`<button class="steps__skip" data-go="/home">Skip</button>`:''}
    <div class="steps__labels">
      ${names.map((s,i)=>`<span class="${i===n-1?'is-active':''}">${s}</span>`).join('')}
    </div>
    <div class="steps__track"><div class="steps__fill" style="width:${(n/5)*100}%"></div></div>
  </div>`;
}

function timeWheel(kind, value, index, max){
  const values = kind==='hours' ? Array.from({length:13},(_,i)=>i) : kind==='ampm' ? ['am','pm'] : Array.from({length:max+1},(_,i)=>i);
  const suffix=kind==='hours'?' hours':kind==='min'?' min':'';
  return `<div class="timewheel" data-wheel="${kind}" data-time="${index}" tabindex="0"><div class="timewheel__window">${values.map(v=>`<button type="button" class="timewheel__value ${v===value?'is-selected':''}" data-value="${v}">${v}${suffix}</button>`).join('')}</div></div>`;
}

function wireTimeWheels(el){
  el.querySelectorAll('[data-wheel]').forEach(wheel=>{
    const kind=wheel.dataset.wheel,index=Number(wheel.dataset.time||0),box=wheel.querySelector('.timewheel__window');
    const values=[...box.querySelectorAll('[data-value]')];
    const field=kind==='hours'?'h':kind==='ampm'?'ap':'m';
    const selected=values.findIndex(v=>String(v.dataset.value)===String(getTimes()[index][field]));
    const row=36; box.scrollTop=Math.max(0,selected)*row;
    box.addEventListener('wheel',event=>{
      event.preventDefault();
      const max=Math.max(0,(values.length-1)*row);
      const next=Math.max(0,Math.min(values.length-1,Math.round((box.scrollTop+event.deltaY)/row)));
      box.scrollTop=next*row;
      values.forEach((v,j)=>v.classList.toggle('is-selected',j===next));
      const times=getTimes(); times[index][field]=kind==='ampm'?values[next].dataset.value:Number(values[next].dataset.value); saveTimes(times);
    },{passive:false});
    values.forEach(value=>value.addEventListener('click',()=>{
      const i=values.indexOf(value); box.scrollTo({top:i*row,behavior:'smooth'});
    }));
    box.addEventListener('scroll',()=>{
      const i=Math.max(0,Math.min(values.length-1,Math.round(box.scrollTop/row)));
      values.forEach((v,j)=>v.classList.toggle('is-selected',j===i));
      const times=getTimes(); times[index][field]=kind==='ampm'?values[i].dataset.value:Number(values[i].dataset.value); saveTimes(times);
    });
  });
}

/* ---------- Step 1: Link your device ---------- */
App.route('/step/1', {
  render(){
    return `<div class="scr scr--violet scr--steps">
      ${statusBar(true)}
      ${stepBar(1)}
      <div class="scr__body steps__body">
        <h1 class="steps__h">Link your<br>device!</h1>
        <button class="devadd devadd--big" data-go="/step/1/charging"><span>${Icons.plus('#fff',20)}</span></button>
      </div>
    </div>`;
  },
  init(el){
    /* "Link your device!": el gesto del clic permite abrir el puerto USB
       y el firmware hace parpadear el LED verde (LUMA_LINK). */
    const add = el.querySelector('.devadd--big');
    if(add) add.addEventListener('click', ()=>LumaDevice.requestLink());
  }
});

/* ---------- Step 1: buscando (charging) ---------- */
App.route('/step/1/charging', {
  render(){
    return `<div class="scr scr--violet scr--steps">
      ${statusBar(true)}
      ${stepBar(1)}
      <div class="scr__body steps__body">
        <h1 class="steps__h">Link your<br>device!</h1>
        <div class="devadd devadd--big"></div>
      </div>
      <div class="devoverlay devoverlay--steps">
        <div class="devsearching fade-in">
          <span>Looking for new devices</span>
          <span class="spinner">${burstSvg('#fff')}</span>
        </div>
      </div>
    </div>`;
  },
  init(){
    /* La búsqueda inalámbrica es la simulación visual de Figma; el
       parpadeo del LED verde sí es real y viaja por USB (LUMA_LINK). */
    LumaDevice.requestLink();
    App.after(()=>go('/step/1/added'), 2200);
  }
});

/* ---------- Step 1: "Amazing!" (added) ---------- */
App.route('/step/1/added', {
  render(){
    return `<div class="scr scr--violet scr--steps">
      ${statusBar(true)}
      ${stepBar(1)}
      <div class="scr__body steps__body">
        <h1 class="steps__h">Amazing!</h1>
        <div class="devices__grid steps__grid">
          ${deviceCard({name:'Module 1',product:'Serum',serial:'DIS092930'}, {linked: LumaDevice.state==='connected'})}
        </div>
        <div class="steps__next"><button class="btn btn--glass steps__nextbtn" data-go="/step/2">Next</button></div>
      </div>
    </div>`;
  },
  init(){ bindLiveDots(); }
});

/* ---------- Step 2: Add your product ---------- */
App.route('/step/2', {
  render(){
    return `<div class="scr scr--violet scr--steps">
      ${statusBar(true)}
      ${stepBar(2)}
      <div class="scr__body steps__body">
        <h1 class="steps__h">Add your<br>product</h1>
        <p class="steps__sub">Pour your product into the compartment to continue.</p>
        <div class="steps__photo"><img src="assets/img/step2-device.png" alt="" onerror="this.style.display='none'"></div>
        <div class="steps__next"><button class="btn btn--glass steps__nextbtn" data-go="/step/3">Next</button></div>
      </div>
    </div>`;
  }
});

/* ---------- Step 3: Scan your product ---------- */
App.route('/step/3', {
  render(){
    return `<div class="scr scr--violet scr--steps">
      ${statusBar(true)}
      ${stepBar(3)}
      <div class="scr__body steps__body">
        <h1 class="steps__h steps__h--sm">What’s your<br>product called?</h1>
        <p class="steps__sub">Scan or add your product to explore its ingredients and benefits to your skin.</p>
        <div class="scanbox">
          <p class="scanbox__title">Scan a new one!</p>
          <p class="scanbox__sub">and make routine even better.</p>
          <button class="scanbox__area" data-go="/step/3/photo"><span>${Icons.plus('#FAFAFA',18)}</span></button>
        </div>
        <button class="manualbtn" data-go="/step/3/photo">
          <span><small>or</small>Add it manually</span>${Icons.chevron('#fff',20)}
        </button>
      </div>
    </div>`;
  }
});

/* ---------- Step 3 - Foto (298:7292 / 298:7326) ---------- */
App.route('/step/3/photo', {
  render(){
    return `<div class="scr scr--phcam">
      ${statusBar(true)}
      <h1 class="phcam__title">Ready?</h1>
      <button class="phcam__skip" data-go="/home">Skip</button>
      <p class="phcam__sub">Make sure you have good lighting.</p>
      <div class="phcam__frame">
        <img src="assets/img/picture-frame-original.png" alt="" onerror="this.style.display='none'">
        <span class="phcam__guide"></span>
      </div>
      <button class="phcam__shutter" data-shoot><span></span></button>
      <div class="phcam__saved" hidden>
        <div class="phcam__card">
          <span class="phcam__check"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7.5"/></svg></span>
          <p>All saved, all set!</p>
          <button class="phcam__x" data-close aria-label="Close">${Icons.close('#1C1C1E',15)}</button>
        </div>
      </div>
    </div>`;
  },
  init(el){
    const saved = el.querySelector('.phcam__saved');
    el.querySelector('[data-shoot]').addEventListener('click', ()=>{ saved.hidden = false; });
    el.querySelector('[data-close]').addEventListener('click', ()=>go('/step/4'));
  }
});

/* ---------- Step 4 (298:7439): Almost done / días ---------- */
App.route('/step/4', {
  render(){
    const sel = Store.get('days', []);
    return `<div class="scr scr--violet scr--steps">
      ${statusBar(true)}
      ${stepBar(4)}
      <div class="scr__body steps__body">
        <h1 class="steps__h steps__h--up">Almost done!</h1>
        <p class="steps__sub">Let’s set your rutine and choose when you'd like to be reminded.</p>
        <div class="steps__seg">${segToggle('Days','Hours',0)}</div>
        <h2 class="steps__mod">Module 1</h2>
        <p class="steps__glabel">Weekdays</p>
        <div class="steps__chips steps__chips--days">${DB.weekdays.map(d=>`<button class="pill ${sel.includes(d)?'is-selected':''}" data-day="${d}">${d}</button>`).join('')}</div>
        <p class="steps__glabel">Weekends</p>
        <div class="steps__chips steps__chips--ends">${DB.weekends.map(d=>`<button class="pill ${sel.includes(d)?'is-selected':''}" data-day="${d}">${d}</button>`).join('')}</div>
      </div>
    </div>`;
  },
  init(el){
    wireChips(el,'days');
    const seg = el.querySelector('.seg');
    seg.addEventListener('click', e=>{
      const b = e.target.closest('[data-seg]'); if(!b) return;
      if(b.getAttribute('data-seg')==='1') go('/step/4/hours');
    });
  }
});

/* ---------- Step 4.1 (298:7987): variante Hours ---------- */

App.route('/step/4/hours', {
  render(){
    const times = getTimes();
    return `<div class="scr scr--violet scr--steps">
      ${statusBar(true)}
      ${stepBar(4)}
      <div class="scr__body steps__body">
        <h1 class="steps__h steps__h--up">Almost done!</h1>
        <p class="steps__sub">Let’s set your rutine and choose when you'd like to be reminded.</p>
        <div class="steps__seg">${segToggle('Days','Hours',1)}</div>
        <h2 class="steps__mod">Module 1</h2>
        <div class="steps__wheel-labels"><span>Hours</span><span>Minutes</span><span>AM/PM</span></div>
          <div class="steps__tp">
          ${times.map((t,i)=>`
            <div class="steps__tp__row">
              <div class="steps__tp__pill">
                ${timeWheel('hours', t.h, i, 12)}
                ${timeWheel('min', t.m, i, 59)}
              </div>
                ${timeWheel('ampm', t.ap, i, 0)}
              ${i>0?`<button class="steps__tp__del" data-del="${i}" aria-label="Remove time"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#314CE1" stroke-width="2.1" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg></button>`:''}
            </div>`).join('')}
          <button class="steps__tp__add" data-add aria-label="Add time"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#314CE1" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="7.6" x2="12" y2="16.4"/><line x1="7.6" y1="12" x2="16.4" y2="12"/></svg></button>
          <button class="steps__save" data-save>Save</button>
        </div>
      </div>
    </div>`;
  },
  init(el){
    wireTimeWheels(el);
    el.querySelector('[data-save]').addEventListener('click', ()=>go('/step/5'));
    el.querySelector('[data-add]').addEventListener('click', ()=>{
      const t = getTimes(); t.push({h:0,m:0,ap:'am'}); saveTimes(t); App.render();
    });
    el.querySelector('.steps__tp').addEventListener('click', e=>{
      const del = e.target.closest('[data-del]');
      if(del){
        const t = getTimes(); t.splice(Number(del.getAttribute('data-del')),1);
        saveTimes(t.length?t:[{h:0,m:0,ap:'am'}]); App.render(); return;
      }
      const ampm = e.target.closest('[data-ampm]');
      if(ampm){
        const i = Number(ampm.getAttribute('data-ampm')); const t = getTimes();
        t[i].ap = t[i].ap==='am' ? 'pm' : 'am'; saveTimes(t); App.render();
      }
    });
    const seg = el.querySelector('.seg');
    seg.addEventListener('click', e=>{
      const b = e.target.closest('[data-seg]'); if(!b) return;
      if(b.getAttribute('data-seg')==='0') go('/step/4');
    });
  }
});

/* ---------- Step 5 (298:8242): All set! ---------- */
App.route('/step/5', {
  render(){
    return `<div class="scr scr--violet scr--steps scr--allset">
      ${statusBar(true)}
      ${stepBar(5)}
      <div class="allset">
         <div class="allset__face">${originalFace('assets/luma/face-step5-original.svg')}</div>
        <h1 class="allset__h">All set!</h1>
        <button class="allset__btn" data-go="/home">Start!</button>
      </div>
    </div>`;
  }
});


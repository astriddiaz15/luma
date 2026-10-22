/* ============================================================
   LUMA — screens: Home / Daily Tips / menú LUMA
   Figma nodes: 67:2192, 71:3728, 233:6063, 230:2253
   ============================================================ */

/* --- Daily Tips card (photo + label) --- */
function tipCard(tip, cls='', title){
  const t = (title!==undefined) ? title : tip.title;   /* Figma home breaks titles with hard \n */
  return `<button class="tipcard ${cls}" data-go="/tip/${tip.id}">
    <img class="tipcard__img" src="${tip.img}" alt="${t}" loading="lazy"
         onerror="this.style.display='none';this.parentElement.classList.add('tipcard--fallback')">
    <span class="tipcard__grad"></span>
    <span class="tipcard__title">${t.replace(/\n/g,'<br>')}</span>
  </button>`;
}

/* --- big soft mascot used on Home --- */
function homeBlob(){
  return `<div class="home__blob">${mascot(244,{face:'sleepy'})}</div>`;
}

/* =========================== HOME =========================== */
App.route('/home', {
  render(){
    const t = DB.tips;
    return `<div class="scr scr--home">
      ${statusBar(false)}
      ${topSearchBar()}
      <div class="scr__body home__body">
        ${homeBlob()}
        <h2 class="home__section">Daily Tips</h2>
        <div class="tipscroll">
          ${tipCard(t[0],'','Honey and\ncoffee')}${tipCard(t[1],'','Sleep\n8 hours')}${tipCard(t[2]||t[0],'','Avoid\nthis today')}
        </div>
        <div class="tipscroll tipscroll--low">
          <button class="bigcard" data-go="/tip/routine">
            <img src="${t[3].img}" alt="" onerror="this.style.display='none'">
            <span class="bigcard__grad"></span>
            <span class="bigcard__title">Best products for you</span>
          </button>
          <button class="bigcard" data-go="/tip/tools">
            <img src="${t[5].img}" alt="" onerror="this.style.display='none'">
            <span class="bigcard__grad"></span>
            <span class="bigcard__title">Makeup + Skincare</span>
          </button>
        </div>
      </div>
      ${bottomNav('home')}
    </div>`;
  },
  init(el){ homeInit(el); }
});

/* variant shown behind the slide-out menu (Figma "Pantalla configuración2") */
App.route('/home/menu', {
  render(){
    const t = DB.tips;
    return `<div class="scr scr--home scr--menu">
      ${statusBar(false)}
      ${topSearchBar()}
      <div class="scr__body home__body">
        ${homeBlob()}
        <h2 class="home__section">Daily Tips</h2>
        <div class="tipscroll">${tipCard(t[0],'','Honey and\ncoffee')}${tipCard(t[1],'','Sleep\n8 hours')}${tipCard(t[2]||t[0],'','Avoid\nthis today')}</div>
      </div>
      ${bottomNav('track')}
      ${lumaMenu(true)}
    </div>`;
  },
  init(el){
    homeInit(el);
    const menu = el.querySelector('.lumamenu');
    const open = ()=>menu.classList.add('is-open');
    requestAnimationFrame(open);          /* first paint closed -> slide ... */
    setTimeout(open, 80);                 /* ... rAF may be suspended in a hidden window (idempotent) */
    menu.querySelector('[data-close]').addEventListener('click', ()=>go('/home'));
    wireMenu(el);
  }
});

/* --- lateral menu "My devices / My products" (Figma "Pantalla LUMA") ---
   Row icons are the ORIGINAL PNG exports (assets/luma/menu-*.png), not SVG. */
function lumaMenu(){
  const row = (go,glyph,label,cls)=>`
      <button class="lumamenu__row lumamenu__row--${cls}" data-go="${go}">
        <span class="lumamenu__ico"><img class="lumamenu__glyph" src="assets/luma/${glyph}" alt="" aria-hidden="true" onerror="this.style.visibility='hidden'"></span>
        <span class="lumamenu__lbl">${label}</span>
      </button>`;
  return `<div class="lumamenu">
    <div class="lumamenu__panel">
      <button class="lumamenu__close" data-close aria-label="Close">
        <img src="assets/luma/close-white.png" alt="" onerror="this.style.visibility='hidden'">
      </button>

      <h2 class="lumamenu__h lumamenu__h--1">My<br>devices</h2>
      <div class="lumamenu__rule lumamenu__rule--1"></div>
      ${row('/devices','glyph-moduls.png','LUMA Moduls','a1')}
      <div class="lumamenu__sep lumamenu__sep--1"></div>
      ${row('/dias','glyph-days.png','Days &amp; Schedules','a2')}
      <div class="lumamenu__sep lumamenu__sep--2"></div>

      <h2 class="lumamenu__h lumamenu__h--2">My<br>products</h2>
      <div class="lumamenu__rule lumamenu__rule--2"></div>
      ${row('/add-product','glyph-add.png','Add product','b1')}
      <div class="lumamenu__sep lumamenu__sep--3"></div>
      ${row('/level/all','glyph-level.png','Check your level','b2')}
      <div class="lumamenu__sep lumamenu__sep--4"></div>
    </div>
  </div>`;
}

function wireMenu(el){
  el.querySelectorAll('.lumamenu__row').forEach(r=>{
    r.addEventListener('click', e=>{
      e.preventDefault();
      e.stopPropagation();
      const m = el.querySelector('.lumamenu');
      if(m){ m.classList.remove('is-open'); App.after(()=>go(r.getAttribute('data-go')),200); }
    });
  });
}

function homeInit(el){
  const gear = el.querySelector('.topbar__gear');
  /* gear -> Step One del flujo de configuración existente (decisión del usuario) */
  if(gear) gear.addEventListener('click', e=>{ e.stopPropagation(); go('/step/1'); });
}

/* ===================== DAILY TIPS (lista) ===================== */
App.route('/tips', {
  render(){
    return `<div class="scr scr--tips">
      ${statusBar(false)}
      ${topSearchBar({value:''})}
      <div class="scr__body tips__body">
        <h1 class="tips__h">Daily Tips</h1>
        <div class="tips__grid">
          ${DB.tips.map(t=>tipCard(t,'tipcard--tall')).join('')}
        </div>
        <div style="height:140px"></div>
      </div>
      ${bottomNav('home')}
    </div>`;
  },
  init(el){ homeInit(el); }
});

/* ===================== DAILY TIPS (detalle) ===================== */
const TIP_COPY = {
  honey:{ title:'Honey and coffee', body:'Mix a spoon of honey with ground coffee for a gentle, antioxidant-rich scrub. Massage it on damp skin for 60 seconds, then rinse. Your glow comes from the circulation, not the scrub — so be kind to your barrier.' },
  sleep:{ title:'Sleep 8 hours', body:'While you sleep, your skin repairs itself and builds collagen. Aim for 7–9 hours, keep your pillow clean and try to sleep on your back to avoid morning creases.' },
  acne:{ title:'Acne fighting', body:'Keep it simple: a gentle cleanser, a light moisturizer and sunscreen every single day. Add actives slowly — one at a time — and give each one four weeks before judging it.' },
  routine:{ title:'Routine tips', body:'Cleanse, treat, moisturize, protect. Apply products from the thinnest to the thickest texture and give each layer about a minute to settle before the next one.' },
  mirror:{ title:'Morning glow', body:'Rinse with cool water, moisturize while your skin is still damp and finish with SPF. Five minutes in the morning is enough for a routine you will actually keep.' },
  tools:{ title:'Tools & devices', body:'Your LUMA Modul works best on clean, product-free skin. Use it before your serum, keep the LED surface wiped down and store it in its case.' }
};

App.route('/tip/:id', {
  render(p){
    const c = TIP_COPY[p.id] || TIP_COPY.honey;
    const img = (DB.tips.find(t=>t.id===p.id)||DB.tips[0]).img;
    return `<div class="scr scr--tipdetail">
      <div class="tipdetail__hero">
        ${statusBar(true)}
        <img src="${img}" alt="" class="tipdetail__img" onerror="this.style.display='none'">
        <span class="tipdetail__grad"></span>
        <button class="roundbtn tipdetail__back" data-go="/home">${Icons.back('#fff',22)}</button>
        <h1 class="tipdetail__title">${c.title}</h1>
      </div>
      <div class="scr__body tipdetail__body">
        <p class="tipdetail__text">${c.body}</p>
        <button class="btn btn--blue" data-go="/home">Got it</button>
        <div style="height:40px"></div>
      </div>
    </div>`;
  }
});

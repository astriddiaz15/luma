/* ============================================================
   LUMA — shared UI components (vanilla JS, no dependencies)
   ============================================================ */

const Icons = {
  device:(c='currentColor',s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="3"/><line x1="12" y1="8" x2="12" y2="13.5"/></svg>`,
  burst:(c='currentColor',s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round"><g>${[...Array(8)].map((_,i)=>{const a=i*Math.PI/4;const x1=12+Math.cos(a)*3.2,y1=12+Math.sin(a)*3.2,x2=12+Math.cos(a)*9,y2=12+Math.sin(a)*9;return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`}).join('')}</g></svg>`,
  home:(c='currentColor',s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><rect x="9.4" y="13.4" width="5.2" height="7.6" rx="1.6"/></svg>`,
  user:(c='currentColor',s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="6.4" r="3"/><path d="M14 11.2v5.5a3.1 3.1 0 0 1-3.1 3.1H7.4"/></svg>`,
  chat:(c='currentColor',s=26)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.42L4.5 20.5l1.2-3.6A6.9 6.9 0 0 1 3.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2Z"/><circle cx="8.6" cy="12.2" r=".9" fill="${c}" stroke="none"/><circle cx="12" cy="12.2" r=".9" fill="${c}" stroke="none"/><circle cx="15.4" cy="12.2" r=".9" fill="${c}" stroke="none"/></svg>`,
  gear:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8l1.5 2.2 2.6-.5.6 2.6 2.4 1.1-1 2.4 1 2.4-2.4 1.1-.6 2.6-2.6-.5L12 21.2l-1.5-2.2-2.6.5-.6-2.6-2.4-1.1 1-2.4-1-2.4 2.4-1.1.6-2.6 2.6.5z"/></svg>`,
  /* Figma Union [274,67,22x17]: ellipse 17x15 + handle to (296,83), stroke #314CE1 w2 */
  search:(c='currentColor',s=23)=>`<svg width="${s}" height="${Math.round(s*18/23)}" viewBox="0 0 23 18" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><ellipse cx="9.5" cy="9" rx="8" ry="7"/><line x1="17" y1="13" x2="21.5" y2="16.5"/></svg>`,
  back:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5 7.5 12 15 19.5"/></svg>`,
  close:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.3" stroke-linecap="round"><line x1="5.5" y1="5.5" x2="18.5" y2="18.5"/><line x1="18.5" y1="5.5" x2="5.5" y2="18.5"/></svg>`,
  chevron:(c='currentColor',s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4.5 16.5 12 9 19.5"/></svg>`,
  calendar:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><line x1="3.5" y1="9.6" x2="20.5" y2="9.6"/><line x1="8" y1="2.8" x2="8" y2="6.4"/><line x1="16" y1="2.8" x2="16" y2="6.4"/><g fill="${c}" stroke="none"><circle cx="8" cy="13.4" r="1"/><circle cx="12" cy="13.4" r="1"/><circle cx="16" cy="13.4" r="1"/><circle cx="8" cy="17" r="1"/><circle cx="12" cy="17" r="1"/></g></svg>`,
  plus:(c='currentColor',s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  star:(c='currentColor',s=26,f='none')=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${f}" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8-5.3-2.9-5.3 2.9 1.1-5.8L3.5 9.6l5.9-.8z"/></svg>`,
  lock:(c='currentColor',s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.2" width="14" height="10" rx="3"/><path d="M8.2 10.2V7.8a3.8 3.8 0 0 1 7.6 0v2.4"/></svg>`,
  eye:(c='currentColor',s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  grid:(c='currentColor',s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/></svg>`,
  filter:(c='currentColor',s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 5.5h15l-6 7v5.5l-3 1.8v-7.3z"/></svg>`,
  bell:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5Z"/><path d="M10 18.8a2.2 2.2 0 0 0 4 0"/></svg>`,
  shield:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.6v5.2c0 4.5-3 8.2-7 10.2-4-2-7-5.7-7-10.2V5.6z"/></svg>`,
  doc:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h7L18 8v12.5H6.5z"/><path d="M13 3.5V8h5"/><line x1="9" y1="12.5" x2="15" y2="12.5"/><line x1="9" y1="16" x2="13.5" y2="16"/></svg>`,
  logout:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 7.5V5.2a1.7 1.7 0 0 0-1.7-1.7H5.7A1.7 1.7 0 0 0 4 5.2v13.6a1.7 1.7 0 0 0 1.7 1.7h7.1a1.7 1.7 0 0 0 1.7-1.7v-2.3"/><line x1="9.5" y1="12" x2="20.5" y2="12"/><path d="M17.5 9l3 3-3 3"/></svg>`,
  camera:(c='currentColor',s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5h3l1.6-2.4h7.8L17.5 8.5h3v11h-17z"/><circle cx="12" cy="13.6" r="3.4"/></svg>`,
  send:(c='currentColor',s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 3.5 3.8 10.2l6.6 2.9 2.9 6.6z"/><path d="M10.4 13.1 20.5 3.5"/></svg>`,
  image:(c='currentColor',s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 17.5 9.5 13l3 2.6 3-2.4 4 4.3"/></svg>`,
  /* Google "G" mark — 24px, matching the Figma welcome frame (x≈118..142) */
  google:`<svg class="google__g" width="24" height="24" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.9 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.4 28.2c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.8-6.1C.9 16.4 0 20.1 0 23.7s.9 7.3 2.6 10.6z"/><path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.4-5.5l-7.5-5.8c-2.1 1.4-4.8 2.3-7.9 2.3-6.4 0-11.7-4.4-13.6-10.3l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5z"/></svg>`,
  play:(c='currentColor',s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M7 4.5 19.5 12 7 19.5z"/></svg>`,
  flag:(c='currentColor',s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 5h11l-2.2 3.6L17 12H6"/></svg>`,
  edit:(c='currentColor',s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>`
};

/* Botón «atrás» con el asset ORIGINAL `Imagenes Figma\botón regreso.png`, recortado en
   assets/luma/back-gray.png (estado por defecto) y back-blue.png (estado activo).
   El PNG lleva el círculo translúcido y el chevron: ver `.roundbtn--png`.
   Si el PNG fallara, se degrada al chevron SVG. */
const backBtn = (go, opts = {}) => {
  const variant = opts.variant || 'gray';
  const cls = opts.cls ? ' ' + opts.cls : '';
  const fb = variant === 'blue' ? '#fff' : '#fff';
  return `<button class="roundbtn roundbtn--png${cls}" data-go="${go}" aria-label="Back">
    <img src="assets/luma/back-${variant}.png" alt="" aria-hidden="true"
         onerror="this.replaceWith(document.createRange().createContextualFragment(Icons.back('${fb}',22)))">
  </button>`;
};

/* ---------- status bar (iOS style, as in the Figma frames) ---------- */
function statusBar(dark){
  const c = dark ? '#FFFFFF' : '#111114';
  return `<div class="statusbar" style="color:${c}">
    <span class="statusbar__time">6:25<svg width="12" height="12" viewBox="0 0 24 24" fill="${c}" style="margin-left:4px;transform:rotate(0deg)"><path d="M21 3 3 10.5l7.5 3L14 21z"/></svg></span>
    <span class="statusbar__right">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="${c}"><rect x="0" y="7" width="2.6" height="4" rx="1"/><rect x="4" y="5" width="2.6" height="6" rx="1"/><rect x="8" y="2.6" width="2.6" height="8.4" rx="1"/><rect x="12" y="0" width="2.6" height="11" rx="1"/></svg>
      <svg width="15" height="11" viewBox="0 0 16 12" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"><path d="M1 4.2a10 10 0 0 1 14 0"/><path d="M3.6 6.9a6.3 6.3 0 0 1 8.8 0"/><path d="M6.2 9.5a2.6 2.6 0 0 1 3.6 0"/></svg>
      <svg width="24" height="12" viewBox="0 0 26 13" fill="none"><rect x="0.6" y="0.6" width="21" height="11.8" rx="3.4" stroke="${c}" stroke-opacity=".5"/><rect x="2.2" y="2.2" width="17.8" height="8.6" rx="2.2" fill="${c}"/><path d="M23.4 4.4c1 .4 1 3.8 0 4.2z" fill="${c}" fill-opacity=".5"/></svg>
    </span>
  </div>`;
}

/* ---------- mascot blob ("Luma") ----------
   The face is the ORIGINAL PNG exported from Figma (assets/luma/face-white-*.png).
   opts.face: 'sleepy' | 'calm' | 'left' | 'right'
   opts.ball: optional ORIGINAL ball PNG (assets/luma/ball-*.png) to render the
              whole solid ball instead of the CSS glow.                      */
const LUMA_FACE = {
  sleepy:'assets/luma/face-white-sleepy.png',
  calm:'assets/luma/face-white-calm.png',
  wink:'assets/luma/face-white-calm.png',
  left:'assets/luma/face-white-sleepy.png',
  right:'assets/luma/face-white-calm.png'
};
/* Returns the ORIGINAL LUMA face PNG (Figma export) sized to `w` px.
   Drop-in replacement for the old hand-drawn SVG face.                    */
function mascotFace(kind='sleepy', w=100){
  const src = LUMA_FACE[kind] || LUMA_FACE.sleepy;
  const ASPECT = { sleepy:44/91, calm:40/89, wink:40/89, left:44/91, right:40/89 };
  const h = Math.round(w*(ASPECT[kind]||0.4835));
  return `<img class="lumaface" src="${src}" alt="" aria-hidden="true"
    style="width:${w}px;height:${h}px" onerror="this.style.display='none'">`;
}

function originalFace(asset, cls=''){
  return `<img class="original-face ${cls}" src="${asset}" alt="" aria-hidden="true">`;
}

function mascot(size, opts={}){
  const w = size, h = size;   /* the LUMA ball is a perfect circle in Figma */
  if(opts.ball){
    return `<div class="mascot mascot--png ${opts.className||''}" role="img" aria-label="Luma"
      style="width:${w}px;height:${h}px;background-image:url('${opts.ball}')"></div>`;
  }
  const face = opts.faceAsset || LUMA_FACE[opts.face||'sleepy'] || LUMA_FACE.sleepy;
  return `<div class="mascot ${opts.className||''}" style="width:${w}px;height:${h}px">
    <div class="mascot__ball"></div>
    <img class="mascot__face" src="${face}" alt="" aria-hidden="true"
         onerror="this.style.display='none'">
  </div>`;
}

/* ---------- floating bottom navigation ----------
   Figma exports the five nav states as ONE sheet: `Imagenes Figma/
   navegación.png` (427x865 @1x) — white bar + valley + active disc +
   icons + shadow, pixel-exact per state. We clip the row of the active
   tab (window y728..898) and overlay invisible buttons on the icon /
   disc positions measured from the sheet + the HOME frame.

   The ORIGINAL export carries a #9747FF dashed guide line on its col 0
   (export artifact — the Figma frame renders contain NO violet pixel at
   all, verified). `assets/luma/nav-sheet.png` is the derived crop: the
   source PNG with every violet pixel set to alpha 0 (originals intact). */
const NAV_SHEET = 'assets/luma/nav-sheet.png';
const NAV_ROWS = [2,1,0,3,4];                  /* NAV_ITEMS idx -> sheet row */
const NAV_BAR_TOP = [83,253,422,592,762];      /* bar top y inside the sheet */
const NAV_DISC = [[210,758.5],[140,758.5],[66,761.5],[283,759.5],[359,759.5]];
const NAV_SLOT_X = [63.5,137,212,286,365];     /* inactive icon centres       */

const NAV_ITEMS = [
  {id:'track',   label:'Device', ico:'nav-device'},
  {id:'routine', label:'Routine',ico:'nav-routine'},
  {id:'home',    label:'Home',   ico:'nav-home'},
  {id:'account', label:'Profile',ico:'nav-profile'},
  {id:'chat',    label:'Chat',   ico:'nav-chat-line'}
];

/* Figma TRACK frames (71:3333, 118:5182, 223:5877) label the four non-active
   tabs with their design names. Ink boxes measured from the ground-truth
   renders (@2x -> CSS px): Luma x46..76.5 y855.5..863.5 | Home x194..227
   y857.5..865.5 | User x274.5..298.5 y857.5..865.5 | Doctor x341..378.5
   y857.5..865.5. The Luma label sits 2px higher than the other three (its
   cap top is y855.5 vs y857.5) — kept as measured. Slot 1 (Routine) shows NO
   label in any render: never render one (word unknown, no invention). Only
   shown for inactive slots (the 3 ground truths label exactly the 4
   inactive tabs). Color = the nav's own blue rgb(30,126,201) (same as the
   sheet icons), NOT the bubble blue #324DE1. opt.labels = true only on the
   TRACK routes so closed screens stay untouched.                          */
const NAV_LABELS = {
  0: {word:'Luma',   cx:61.25, top:858.25},
  2: {word:'Home',   cx:210.5, top:860.25},
  3: {word:'User',   cx:286.5, top:860.25},
  4: {word:'Doctor', cx:359.75,top:860.25}
};

function bottomNav(active='home', opts={}){
  let idx = NAV_ITEMS.findIndex(x=>x.id===active);
  if(idx < 0) idx = 2;
  const row = NAV_ROWS[idx];
  const labels = opts.labels ? Object.keys(NAV_LABELS).filter(n=>+n!==idx).map(n=>{
    const L = NAV_LABELS[n];
    return `<span class="nav__label" style="left:${L.cx}px;top:${L.top}px">${L.word}</span>`;
  }).join('') : '';
  return `<nav class="nav ${opts.className||''}">
    <div class="nav__clip"><img class="nav__sheet" src="${NAV_SHEET}" alt="" style="top:${63-NAV_BAR_TOP[row]}px"></div>
    ${labels}
    ${NAV_ITEMS.map((it,n)=>{
      const on = n===idx;
      const [cx,cy] = on ? NAV_DISC[row] : [NAV_SLOT_X[n],830];
      return `<button class="nav__item" style="left:${cx}px;top:${cy}px" data-nav="${it.id}" aria-label="${it.label}"${on?' aria-current="page"':''}></button>`;
    }).join('')}
  </nav>`;
}

/* ---------- small building blocks ---------- */
function topSearchBar(opts={}){
  return `<div class="topbar">
    <div class="topbar__search">
      ${opts.value?`<span class="topbar__value">${opts.value}</span>`:''}
      <span class="topbar__glass">${Icons.search('#314CE1',23)}</span>
    </div>
    <button class="topbar__gear" data-go="/step/1" aria-label="Settings">
      <img src="assets/luma/gear-button.png" alt="" aria-hidden="true" onerror="this.replaceWith(document.createRange().createContextualFragment(ImagesFallback.gear()))">
    </button>
  </div>`;
}
const ImagesFallback = { gear(){ return Icons.gear('#1668E3',22); } };

function roundBtn(icon, cls=''){
  return `<button class="roundbtn ${cls}">${icon}</button>`;
}

function pill(text, {selected=false, cls=''}={}){
  return `<button class="pill ${selected?'is-selected':''} ${cls}">${text}</button>`;
}

function segToggle(a,b,active){
  return `<div class="seg">
    <button class="seg__opt ${active===0?'is-active':''}" data-seg="0">${a}</button>
    <button class="seg__opt ${active===1?'is-active':''}" data-seg="1">${b}</button>
  </div>`;
}

function go(path){ location.hash = '#'+path; }

/* ============================================================
   LUMA — app data (text & assets taken from the Figma file)
   ============================================================ */

const DB = {
  /* Datos del perfil activo registrado en Create an Account.
     Sin nombres ni correos fijos en el código. */
  user:{
    get name(){ return Profile.current().name; },
    get email(){ return Profile.current().email; }
  },

  tips:[
     { id:'honey',   title:'Honey and coffee', img:'assets/img/tip-honey-original.png' },
     { id:'sleep',   title:'Sleep 8 hours',    img:'assets/img/tip-sleep-original.png' },
     { id:'acne',    title:'Acne fighting',    img:'assets/img/tip-avoid-original.png' },
     { id:'routine', title:'Routine tips',     img:'assets/img/tip-products-original.png' },
     { id:'mirror',  title:'Morning glow',     img:'assets/img/tip-honey-original.png' },
     { id:'tools',   title:'Tools & devices',  img:'assets/img/tip-makeup-original.png' }
  ],

  products:[
    { id:'ceraVe',    name:'CeraVe', level:'Low',          img:'assets/img/card-1.png'   },
    { id:'neutrogena',name:'Neutrogena', level:'High',     img:'assets/img/card-2.png'},
    { id:'cetaphil',  name:'Cetaphil', level:'Moderate',   img:'assets/img/card-3.png' },
    { id:'proactiv',  name:'Proactiv', level:'High',       img:'assets/img/tip-honey.png' }
  ],

  weekdays:['Monday','Tuesday','Wednesday','Thursday','Friday'],
  weekends:['Saturday','Sunday'],

  hours:[
    {h:12,m:0,period:'AM'},{h:1,m:0,period:'AM'},{h:2,m:0,period:'AM'},{h:3,m:0,period:'AM'},
    {h:4,m:0,period:'AM'},{h:5,m:0,period:'AM'},{h:6,m:0,period:'AM'},{h:7,m:0,period:'AM'},
    {h:8,m:0,period:'AM'},{h:9,m:0,period:'AM'},{h:10,m:0,period:'AM'},{h:11,m:0,period:'AM'},
    {h:12,m:0,period:'PM'},{h:1,m:0,period:'PM'},{h:2,m:0,period:'PM'},{h:3,m:0,period:'PM'},
    {h:4,m:0,period:'PM'},{h:5,m:0,period:'PM'},{h:6,m:0,period:'PM'},{h:7,m:0,period:'PM'},
    {h:8,m:0,period:'PM'},{h:9,m:0,period:'PM'},{h:10,m:0,period:'PM'},{h:11,m:0,period:'PM'}
  ],

  settings:{
    account:{ label:'Pau', sub:'My account', icon:'user' },
    devices:{ label:'My LUMA Modul', sub:'Modul One', icon:'device' },
    about:{ label:'About LUMA', sub:'', icon:'info' },
    help:{ label:'Help', sub:'', icon:'chat' },
    privacy:{ label:'Privacy policy', sub:'', icon:'shield' },
    terms:{ label:'Terms & Conditions', sub:'', icon:'doc' },
    notifs:{ label:'Notifications', sub:'', icon:'bell', toggle:true, on:true }
  },

  /* Calendario del historial: meses base del diseño + los que haga falta
     para que la demostración nunca se quede sin círculos. `marked` lo
     calcula History.markedDays(). */
  get months(){ return History.months(); },

  monthsPatient:[
    { name:'March', year:2026, start:0, days:31, marked:[24,25,26,27,28] },
    { name:'April', year:2026, start:3, days:30, marked:[10] },
    { name:'May',   year:2026, start:5, days:31, marked:[2,18,31] }
  ]
};

/* ---- tiny state store persisted in localStorage ---- */
const Store = {
  get(key, fallback){
    try{ const v = localStorage.getItem('luma.'+key); return v==null?fallback:JSON.parse(v); }
    catch(e){ return fallback; }
  },
  set(key, value){
    try{ localStorage.setItem('luma.'+key, JSON.stringify(value)); }catch(e){}
  }
};

/* ============================================================
   Perfiles + progreso (localStorage; prototipo sin backend)
   Cada perfil guarda todo bajo su propio id: nombre, correo,
   rutinas completadas, racha e historial nunca se mezclan.
   Las contraseñas NO se guardan en ningún lado.
   ============================================================ */
const Profile = (function(){
  const ACTIVE = 'p.active';
  const k = (id, name) => 'p.' + id + '.' + name;

  function newId(){ return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function list(){ return Store.get('p.list', []); }
  function saveList(l){ Store.set('p.list', l); }
  function dayISO(d){
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function blank(id){
    return { id, name:'', email:'', routines:0, streak:0, log:[], demoStart:'2026-02-15' };
  }

  function create(name, email){
    const id = newId();
    Store.set(k(id,'name'), name || '');
    Store.set(k(id,'email'), email || '');
    Store.set(k(id,'routines'), 0);
    Store.set(k(id,'streak'), 0);
    Store.set(k(id,'log'), []);
    Store.set(k(id,'demoStart'), '2026-02-15');
    const l = list(); l.push({ id, name:name||'', email:email||'' }); saveList(l);
    Store.set(ACTIVE, id);
    return id;
  }

  /* Perfil activo. Migra los datos previos (luma.userName / luma.userEmail)
     a un perfil real para no perder lo ya registrado. */
  function activeId(){
    const saved = Store.get(ACTIVE, null);
    if(saved && list().some(p => p.id === saved)) return saved;
    const n = Store.get('userName', null);
    const e = Store.get('userEmail', null);
    if(n || e) return create(n || '', e || '');
    return null;
  }

  function current(){
    const id = activeId();
    if(!id) return blank(null);
    return {
      id,
      name:    Store.get(k(id,'name'), ''),
      email:   Store.get(k(id,'email'), ''),
      routines:Store.get(k(id,'routines'), 0),
      streak:  Store.get(k(id,'streak'), 0),
      log:     Store.get(k(id,'log'), []),
      demoStart: Store.get(k(id,'demoStart'), '2026-02-15')
    };
  }

  /* Create an Account:
     · correo ya registrado  → se recupera ESE perfil con su progreso;
     · perfil activo sin correo → se completa, no se duplica;
     · correo nuevo → perfil nuevo en cero (nada se mezcla). */
  function register(name, email){
    name  = String(name  || '').trim();
    email = String(email || '').trim();

    const l = list();
    const byMail = email ? l.find(p => (p.email || '').toLowerCase() === email.toLowerCase()) : null;
    if(byMail){
      Store.set(ACTIVE, byMail.id);
      if(name) Store.set(k(byMail.id,'name'), name);
      Store.set(k(byMail.id,'email'), email);
      saveList(l.map(p => p.id === byMail.id
        ? { id:p.id, name: name || p.name, email: email || p.email } : p));
      return byMail.id;
    }

    const id = activeId();
    if(id && !current().email){
      if(name)  Store.set(k(id,'name'), name);
      Store.set(k(id,'email'), email);
      saveList(list().map(p => p.id === id
        ? { id, name: name || p.name, email: email || p.email } : p));
      return id;
    }

    return create(name, email);
  }

  /* Edición desde el frame Usuario: siempre sobre el perfil activo. */
  function setIdentity(name, email){
    let id = activeId();
    if(!id) id = create('', '');
    name  = String(name  || '').trim();
    email = String(email || '').trim();
    Store.set(k(id,'name'), name);
    Store.set(k(id,'email'), email);
    saveList(list().map(p => p.id === id ? { id, name, email } : p));
    return id;
  }

  /* Días consecutivos con al menos una rutina, contando hasta hoy. */
  function streakOf(log){
    const days = [...new Set(log.map(x => x && x.d).filter(Boolean))].sort();
    if(!days.length) return 0;
    if(days[days.length - 1] !== dayISO(new Date())) return 0;
    let n = 1;
    for(let i = days.length - 1; i > 0; i--){
      const a = new Date(days[i-1] + 'T00:00:00');
      const b = new Date(days[i]   + 'T00:00:00');
      if(Math.round((b - a) / 86400000) === 1) n++;
      else break;
    }
    return n;
  }

  /* Una rutina válida = una entrada. Se llama SÓLO desde la detección
     real aceptada en Progreso (nunca al conectar el dispositivo). */
  function completeRoutine(){
    let id = activeId();
    if(!id) id = create('', '');
    const log = Store.get(k(id,'log'), []).slice();
    log.push({ d: dayISO(new Date()), at: Date.now() });
    Store.set(k(id,'log'), log);
    const routines = Store.get(k(id,'routines'), 0) + 1;
    Store.set(k(id,'routines'), routines);
    Store.set(k(id,'streak'), streakOf(log));
    return routines;
  }

  return { current, register, setIdentity, completeRoutine, activeId };
})();

/* ============================================================
   Calendario del historial
   Días reales = fechas del log (una por rutina completada).
   Demostración = 15 de febrero de 2026 + una por rutina. No tiene
   tope: al terminar el mes sigue en el siguiente (marzo, abril…),
   agregando tarjetas con el mismo diseño si hacen falta.
   Vive aparte del log para no presentar fechas simuladas como reales.
   ============================================================ */
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

/* Meses tal como están en Figma (se conservan sus valores originales). */
const DESIGN_MONTHS = [
  { name:'January',  year:2026, monthIndex:0, start:5, days:30 },
  { name:'February', year:2026, monthIndex:1, start:0, days:28 },
  { name:'April',    year:2026, monthIndex:3, start:3, days:30 },
  { name:'May',      year:2026, monthIndex:4, start:5, days:31 }
];

const History = {
  DEMO_START: '2026-02-15',
  demoDay(){ return new Date(2026, 1, 15); },   // 15 de febrero de 2026

  /* Último día que cubre la demostración según las rutinas acumuladas. */
  demoEnd(routines){
    const d = this.demoDay();
    d.setDate(d.getDate() + Math.max(0, routines) - 1);
    return d;
  },

  /* Lista de meses: los del diseño + los intermedios/faltantes hasta
     cubrir la demostración. Sin límite de tarjetas.
     Siempre llega al menos hasta mayo 2026 (último mes del diseño), así
     marzo está presente aunque todavía no haya rutinas. */
  months(){
    const prof = Profile.current();
    const end = this.demoEnd(prof.routines);
    const demoLast = { year: end.getFullYear(), monthIndex: end.getMonth() };
    const baseLast = { year: 2026, monthIndex: 4 };            // mayo 2026
    const last = (demoLast.year > baseLast.year ||
                 (demoLast.year === baseLast.year && demoLast.monthIndex > baseLast.monthIndex))
      ? demoLast : baseLast;

    const list = DESIGN_MONTHS.map(m => ({ ...m, marked: [] }));
    const has = (y, m) => list.some(x => x.year === y && x.monthIndex === m);

    let cur = { year: 2026, monthIndex: 0 };
    while(cur.year < last.year || (cur.year === last.year && cur.monthIndex <= last.monthIndex)){
      if(!has(cur.year, cur.monthIndex)){
        list.push({
          name: MONTH_NAMES[cur.monthIndex],
          year: cur.year,
          monthIndex: cur.monthIndex,
          start: new Date(cur.year, cur.monthIndex, 1).getDay(),
          days: new Date(cur.year, cur.monthIndex + 1, 0).getDate(),
          marked: []
        });
      }
      cur = cur.monthIndex === 11
        ? { year: cur.year + 1, monthIndex: 0 }
        : { year: cur.year, monthIndex: cur.monthIndex + 1 };
    }

    return list.sort((a, b) => (a.year - b.year) || (a.monthIndex - b.monthIndex));
  },

  markedDays(month){
    const prof = Profile.current();
    const days = new Set();

    /* registros reales (una entrada por rutina) en ese mes */
    (prof.log || []).forEach(entry => {
      const parts = String(entry.d || '').split('-').map(Number);
      if(parts.length === 3 && parts[0] === month.year && parts[1] === month.monthIndex + 1){
        days.add(parts[2]);
      }
    });

    /* demostración: 15 feb 2026 + una por rutina, cruzando de mes */
    const total = prof.routines || 0;
    if(total > 0){
      const from = this.demoDay();
      const to = this.demoEnd(total);
      const first = new Date(month.year, month.monthIndex, 1);
      const lastDay = new Date(month.year, month.monthIndex, month.days);
      const a = from > first ? from : first;
      const b = to < lastDay ? to : lastDay;
      const cursor = new Date(a.getFullYear(), a.getMonth(), a.getDate());
      while(cursor <= b){
        days.add(cursor.getDate());
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return [...days].sort((x, y) => x - y);
  }
};

/* Shared schedule; keep the original single-time keys compatible. */
function getTimes(){
  const times = Store.get('times', null);
  return Array.isArray(times) && times.length ? times : [{
    h:Store.get('hours',0), m:Store.get('min',0), ap:Store.get('ampm','am')
  }];
}

function saveTimes(times){
  Store.set('times', times);
  Store.set('hours', times[0].h);
  Store.set('min', times[0].m);
  Store.set('ampm', times[0].ap);
}

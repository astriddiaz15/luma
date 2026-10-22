/* ============================================================
   LUMA — screens: configuración / perfiles / historiales / chat
   Figma nodes: 233:6063, 151:2785, 145:999, 163:2518,
                67:2079, 297:2910
   ============================================================ */

/* =================== CONFIGURACIÓN =================== */
App.route('/config', {
  render(){
    const rows = [
       {label:DB.user.name, sub:'My account', icon:Icons.user('#1668E3',22), go:'/perfil'},
      {label:'My LUMA Modul', sub:'Modul One', icon:Icons.device('#1668E3',22), go:'/devices'},
      {label:'About LUMA', sub:'', icon:infoSvg(), go:'/about'},
      {label:'Help', sub:'', icon:Icons.chat('#1668E3',22), go:'/chat'},
      {label:'Privacy policy', sub:'', icon:Icons.shield('#1668E3',22), go:'/legal/privacy'},
      {label:'Terms & Conditions', sub:'', icon:Icons.doc('#1668E3',22), go:'/legal/terms'},
      {label:'Notifications', sub:'', icon:Icons.bell('#1668E3',22), toggle:true},
      {label:'Log out', sub:'', icon:Icons.logout('#1668E3',22), go:'/welcome'}
    ];
    return `<div class="scr scr--config">
      ${statusBar(false)}
      ${topSearchBar()}
      <div class="scr__body config__body">
        <div class="config__blob">${mascot(244,{face:'sleepy'})}</div>
        <div class="config__card">
          ${rows.map((r,i)=>`
            <div class="config__row" ${r.go?`data-go="${r.go}"`:''} data-row="${i}">
              <span class="config__ico">${r.icon}</span>
              <span class="config__txt">
                <b>${r.label}</b>
                ${r.sub?`<small>${r.sub}</small>`:''}
              </span>
              ${r.toggle?`<span class="switch is-on" data-switch><i></i></span>`:Icons.chevron('#C2C2C8',18)}
            </div>
            ${i<rows.length-1?'<div class="config__sep"></div>':''}
          `).join('')}
        </div>
        <div style="height:150px"></div>
      </div>
      ${bottomNav('track')}
    </div>`;
  },
  init(el){
    el.querySelectorAll('[data-row]').forEach(r=>{
      if(r.querySelector('[data-switch]')) return;
      r.addEventListener('click', ()=>{ if(r.dataset.go) go(r.dataset.go); });
    });
    el.querySelectorAll('[data-switch]').forEach(s=>{
      s.addEventListener('click', e=>{
        e.stopPropagation();
        s.classList.toggle('is-on');
      });
    });
  }
});

function infoSvg(){
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1668E3" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.8" r=".6" fill="#1668E3"/></svg>`;
}

/* pantallas legales / acerca de (mismo patrón) */
function simpleInfo(title, text){
  return `<div class="scr scr--violet">
    ${statusBar(true)}
    <div class="scr__body info__body">
      <div class="routine__top">${backBtn('/config')}</div>
      <h1 class="routine__h">${title}</h1>
      <p class="info__text">${text}</p>
      <div style="height:60px"></div>
    </div>
  </div>`;
}

App.route('/about', { render(){ return simpleInfo('About<br>LUMA','LUMA is your glow companion: a small device, a smart routine and daily tips that help you take better care of your skin.'); } });
App.route('/legal/privacy', { render(){ return simpleInfo('Privacy<br>policy','Your photos, routines and skin data belong to you. They are stored on your device and only shared with your dermatologist when you say so.'); } });
App.route('/legal/terms', { render(){ return simpleInfo('Terms &<br>Conditions','Use LUMA as designed, keep your device charged and enjoy the glow. This prototype is a design demo; no real accounts are created.'); } });

/* =================== PERFIL USUARIO (151:2785) =================== */
App.route('/perfil', {
  render(){
    const menu = [
      {t:'User', go:'/usuario'},
      {t:'Notifications', toast:'No new notifications'},
      {t:'Privacy', go:'/legal/privacy'},
      {t:'Language', toast:'Language: English'},
      {t:'More help', go:'/chat'},
      {t:'Terms and Conditions', go:'/legal/terms'}
    ];
    const who = DB.user.name;
    return `<div class="scr scr--perfil">
      ${statusBar(true)}
      <div class="scr__body perfil__body">
        <div class="pmenu">
          <div class="pmenu__hero">
            <img src="assets/img/banner-user.png" alt="" onerror="this.style.display='none'">
            <h1 class="pmenu__hi">${who ? `Hi, ${who}!` : 'Hi!'}</h1>
          </div>
          <div class="pmenu__avatar"><img src="assets/img/avatar-user.png" alt="" onerror="this.replaceWith(mascotEl(76))"></div>
          <ul class="pmenu__list">
            ${menu.map(m=>`<li ${m.go?`data-go="${m.go}"`:`data-toast="${m.toast}"`}>${m.t}</li>`).join('')}
          </ul>
        </div>
      </div>
      ${bottomNav('account')}
    </div>`;
  }
});

/* =================== PERFIL DERMATÓLOGA (145:999) =================== */
App.route('/derm', {
  render(){
    const slots = ['','','','','',''];
    return `<div class="scr scr--violet scr--derm">
      ${statusBar(true)}
      <div class="scr__body derm__body">
        <button class="derm__gear" data-go="/step/1" aria-label="Settings">
          <img src="assets/luma/gear-button.png" alt="" aria-hidden="true" onerror="this.replaceWith(document.createRange().createContextualFragment(Icons.gear('#f8f8f8',24)))">
        </button>

        <div class="derm__card">
          <div class="derm__banner">
            <img src="assets/img/banner-derm.png" alt="" onerror="this.style.display='none'">
          </div>
          <button class="derm__calbtn" aria-label="Schedule appointment"><img src="assets/luma/glyph-agendar.png" alt=""></button>
          <img class="derm__avatar" src="assets/img/avatar-derm.png" alt="Dra. Natalia Espinoza" onerror="this.replaceWith(mascotEl(96))">
          <p class="derm__name">Dr. Natalia Espinoza</p>
          <p class="derm__spec">Clinical and Cosmetic Dermatology</p>
          <button class="derm__chatbtn" aria-label="Chat"><img src="assets/luma/glyph-chat.png" alt="" onerror="this.replaceWith(document.createRange().createContextualFragment(Icons.chat('#314ce1',24)))"></button>
        </div>

        <div class="derm__panel">
          <h2 class="derm__h2">Dr. Nat,</h2>
          <p class="derm__p">this is my progress so far</p>
          <div class="derm__slots">
            ${slots.map((s,i)=>i===0
              ? `<button class="derm__slot derm__slot--add" data-go="/photo" aria-label="Add photo"><span>+</span></button>`
              : `<div class="derm__slot"></div>`).join('')}
          </div>
        </div>

      </div>
      ${bottomNav('chat')}
    </div>`;
  }
});

function mascotEl(size){ return document.createRange().createContextualFragment(mascot(size,{face:'sleepy'})).firstElementChild; }

/* =================== USUARIO (163:2518) =================== */
App.route('/usuario', {
  render(){
    const skinRows = [
      ['Normal Skin','Dry Skin','Oily Skin'],
      ['Combination Skin','Sensitive Skin']
    ];
    const concernRows = [
      ['Mature Skin','Redness-Prone Skin'],
      ['Hyperpigmented Skin','Dehydrated Skin'],
      ['Acne-Prone Skin']
    ];
    const chipRow = (labels, cls) => `<div class="uchiprow ${cls}">${labels.map(l=>`<button class="uchip" data-skin>${l}</button>`).join('')}</div>`;
    return `<div class="scr scr--violet scr--usuario">
      ${statusBar(true)}
      <div class="scr__body usuario__body">
        <h1 class="usuario__title">User</h1>
        <button class="usuario__back" data-go="/perfil" aria-label="Back">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden="true"><path d="M10 2 2 10l8 8" stroke="#f8f8f8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="usuario__avatar"><img src="assets/img/avatar-usuario.png" alt="" onerror="this.replaceWith(mascotEl(76))"><span class="usuario__edit" role="button" tabindex="0" aria-label="Edit your details">${Icons.edit('#314ce1',15)}</span></div>
        <p class="usuario__name">${DB.user.name || '—'}</p>
        <p class="usuario__email">${DB.user.email || '—'}</p>
        <button class="usuario__view">View profile</button>
        <h2 class="usuario__h2 usuario__h2--skin">My type of skin</h2>
        ${chipRow(skinRows[0],'uchiprow--skin1')}
        ${chipRow(skinRows[1],'uchiprow--skin2')}
        <h2 class="usuario__h2 usuario__h2--concerns">Skin Concerns</h2>
        ${chipRow(concernRows[0],'uchiprow--c1')}
        ${chipRow(concernRows[1],'uchiprow--c2')}
        ${chipRow(concernRows[2],'uchiprow--c3')}
      </div>
    </div>`;
  },
  init(el){
    el.querySelectorAll('[data-skin]').forEach(p=>{
      p.addEventListener('click', ()=>p.classList.toggle('is-selected'));
    });

    /* El lápiz del avatar es el único control de edición del frame
       (163:2518): habilita nombre y correo en línea, en la misma
       posición y con la misma tipografía, sin botones ni pantallas
       nuevas. */
    const pen = el.querySelector('.usuario__edit');
    if(pen) pen.addEventListener('click', ()=>editProfile(el, pen));
  }
});

function editProfile(el, pen){
  if(pen.dataset.editing === '1') return;
  pen.dataset.editing = '1';

  const pName = el.querySelector('.usuario__name');
  const pMail = el.querySelector('.usuario__email');
  const name = document.createElement('input');
  const mail = document.createElement('input');
  name.type = 'text';  name.className = 'usuario__name usuario__editinput';
  mail.type = 'email'; mail.className = 'usuario__email usuario__editinput';
  name.value = DB.user.name;  name.placeholder = 'Your name';
  mail.value = DB.user.email; mail.placeholder = 'your@email.com';
  name.setAttribute('aria-label','Your name');
  mail.setAttribute('aria-label','Your email');
  pName.replaceWith(name);
  pMail.replaceWith(mail);
  name.focus();
  name.select();

  let done = false;
  const finish = (save)=>{
    if(done) return;
    done = true;
    pen.dataset.editing = '0';
    const vName = name.value.trim();
    const vMail = mail.value.trim();
    if(save) Profile.setIdentity(vName, vMail);
    const cur = Profile.current();
    const a = document.createElement('p'); a.className = 'usuario__name';
    const b = document.createElement('p'); b.className = 'usuario__email';
    a.textContent = cur.name || '—';
    b.textContent = cur.email || '—';
    name.replaceWith(a);
    mail.replaceWith(b);
    if(save) toast('Profile updated');
  };

  name.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){ e.preventDefault(); mail.focus(); mail.select(); }
    if(e.key === 'Escape') finish(false);
  });
  mail.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){ e.preventDefault(); finish(true); }
    if(e.key === 'Escape') finish(false);
  });
  name.addEventListener('blur', ()=>{
    /* pasar al correo no cierra la edición */
    setTimeout(()=>{ if(document.activeElement !== mail) finish(true); }, 120);
  });
  mail.addEventListener('blur', ()=>finish(true));
}

/* =================== HISTORIAL (calendarios) =================== */
function calendarCard(m){
  const cells = [];
  for(let i=0;i<m.start;i++) cells.push(null);
  for(let d=1;d<=m.days;d++) cells.push(d);
  while(cells.length%7) cells.push(null);
  const rows = [];
  for(let i=0;i<cells.length;i+=7) rows.push(cells.slice(i,i+7));
  return `<div class="cal card">
    <div class="cal__head"><span>${m.name}</span><span>${m.year}</span></div>
    ${rows.map(r=>`<div class="cal__row">
      ${r.map(d=>d==null
        ? `<span class="cal__day cal__day--empty"></span>`
        : `<span class="cal__day ${m.marked.includes(d)?'is-marked':''}">${d}</span>`).join('')}
    </div>`).join('')}
  </div>`;
}

App.route('/history', {
  render(){
    return `<div class="scr scr--peach scr--history">
      ${statusBar(false)}
      <button class="roundbtn history__back" data-go="/track">${Icons.back('#E08A3C',20)}</button>
      <button class="history__gear" data-go="/step/1">${mascotFace('sleepy',26)}</button>
      <div class="scr__body history__body">
        ${DB.months.map(m=>calendarCard({...m, marked:History.markedDays(m)})).join('')}
        <div style="height:70px"></div>
      </div>
    </div>`;
  }
});

App.route('/history/derm', {
  render(){
    return `<div class="scr scr--peach scr--history">
      ${statusBar(false)}
      <button class="roundbtn history__back" data-go="/derm">${Icons.back('#E08A3C',20)}</button>
      <button class="history__gear" data-go="/step/1">${Icons.gear('#FFFFFF',24)}</button>
      <div class="scr__body history__body">
        ${DB.monthsPatient.map(calendarCard).join('')}
        <div style="height:70px"></div>
      </div>
    </div>`;
  }
});

/* =================== CHAT =================== */
App.route('/chat', {
  render(){
    const msgs = [
      {me:false, t:'Hi! How is your skin feeling this week?'},
      {me:true,  t:'Much better! The redness is almost gone.'},
      {me:false, t:'That is great news. Keep the routine every other day.'},
      {me:true,  t:'Will do 💙'}
    ];
    return `<div class="scr scr--chat">
      ${statusBar(false)}
      <div class="chat__head">
        <button class="roundbtn" data-go="/derm">${Icons.back('#1668E3',20)}</button>
        <img class="chat__avatar" src="assets/img/avatar-derm.png" alt="" onerror="this.style.display='none'">
        <div class="chat__who"><b>Dra. Natalia Espinoza</b><small>Dermatology</small></div>
      </div>
      <div class="scr__body chat__body">
        ${msgs.map(m=>`<div class="bubble ${m.me?'bubble--me':''}">${m.t}</div>`).join('')}
        <div style="height:90px"></div>
      </div>
      <div class="chat__input">
        <button class="chat__ico">${Icons.image('#8A8A8E',22)}</button>
        <input type="text" placeholder="Message">
        <button class="chat__send">${Icons.send('#fff',22)}</button>
      </div>
    </div>`;
  },
  init(el){
    const input = el.querySelector('input');
    const body = el.querySelector('.chat__body');
    const send = ()=>{
      const v = input.value.trim(); if(!v) return;
      const b = document.createElement('div');
      b.className = 'bubble bubble--me fade-in'; b.textContent = v;
      body.insertBefore(b, body.lastElementChild);
      body.scrollTop = body.scrollHeight;
      input.value = '';
    };
    el.querySelector('.chat__send').addEventListener('click', send);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') send(); });
  }
});

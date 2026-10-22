/* ============================================================
   LUMA — screens: rutina (Days & Schedules / horas / niveles)
   Figma nodes: 145:1348, 181:5141, 181:4514, 272:2493, 161:3884,
                181:4917, 181:5597, 181:5369, 181:5475
   ============================================================ */

function routineHead(activeTab){
  return `<div class="routine__top">
    ${backBtn('/home')}
    <button class="roundbtn" data-go="/step/1"><img class="roundbtn__ic" src="assets/luma/gear-header.png" alt="Settings"></button>
  </div>
  <h1 class="routine__h">Days &amp;<br>Schedules</h1>
  <p class="routine__sub">Create a routine that works for you.</p>
  ${segToggle('Days','Hours',activeTab)}`;
}

function dayChips(selected){
  const chip = d => `<button class="pill ${selected.includes(d)?'is-selected':''}" data-day="${d}">${d}</button>`;
  return `<div class="routine__module">
      <h2 class="routine__modname">Module 1</h2>
      <p class="routine__grouplabel">Weekdays</p>
      <div class="chips">${DB.weekdays.map(chip).join('')}</div>
      <p class="routine__grouplabel">Weekends</p>
      <div class="chips">${DB.weekends.map(chip).join('')}</div>
    </div>`;
}

function routineTimes(){
  return `<div class="routine-wheels">${getTimes().map((t,i)=>`<div class="timepicker">
      <div class="timepicker__group">
        ${timeWheel('hours',t.h,i,12)}
        ${timeWheel('min',t.m,i,59)}
      </div>
      ${timeWheel('ampm',t.ap,i,0)}
    </div>`).join('')}</div>`;
}

function wireRoutineTimes(el, nextPath){
  wireTimeWheels(el);
  const add=el.querySelector('[data-addtime]');
  if(add) add.addEventListener('click',()=>go(nextPath));
}

/* ---------- Days & Schedules (tab Days) ---------- */
App.route('/dias', {
  render(){
    const sel = Store.get('days', ['Monday','Tuesday']);
    return `<div class="scr scr--violet scr--routine">
      ${statusBar(true)}
      <div class="scr__body routine__body">
        ${routineHead(0)}
        ${dayChips(sel)}
        <div style="height:60px"></div>
      </div>
    </div>`;
  },
  init(el){
    wireSeg(el, '/dias', '/horas');
    wireChips(el, 'days');
  }
});

/* ---------- Days & Schedules (tab Hours) ---------- */
App.route('/horas', {
  render(){
    return `<div class="scr scr--violet scr--routine scr--hours">
      ${statusBar(true)}
      <div class="scr__body routine__body">
        ${routineHead(1)}
        <div class="routine__module">
          <h2 class="routine__modname">Module 1</h2>
          ${routineTimes()}
          <div class="routine__addrow">
            <button class="routine__add" data-addtime>${Icons.plus('#314CE1',18)}</button>
          </div>
          <div class="routine__save"><button class="btn btn--save" data-save>Save</button></div>
        </div>
        <div style="height:60px"></div>
      </div>
    </div>`;
  },
  init(el){
    wireSeg(el, '/dias', '/horas');
    wireRoutineTimes(el,'/horas-alt');
    el.querySelector('[data-save]').addEventListener('click', ()=>go('/days-ready'));
  }
});

/* ---------- combinado (días + horas) ---------- */
App.route('/dias-horas', {
  render(){
    const sel = Store.get('days', ['Monday','Tuesday']);
    return `<div class="scr scr--violet scr--routine">
      ${statusBar(true)}
      <div class="scr__body routine__body">
        ${routineHead(1)}
        ${dayChips(sel)}
        <div class="routine__module">
          <h2 class="routine__modname">Module 1</h2>
          ${routineTimes()}
          <div class="routine__addrow"><button class="routine__add" data-addtime>${Icons.plus('#314CE1',18)}</button></div>
          <div class="routine__save"><button class="btn btn--save" data-save>Save</button></div>
        </div>
        <div style="height:60px"></div>
      </div>
    </div>`;
  },
  init(el){
    wireSeg(el, '/dias', '/horas');
    wireChips(el, 'days');
    wireRoutineTimes(el,'/horas-alt');
    el.querySelector('[data-save]').addEventListener('click', ()=>go('/schedule'));
  }
});

/* Second Registro horas frame (272:2493), reached by the Figma + action. */
App.route('/horas-alt', {
  render(){
    return `<div class="scr scr--violet scr--routine scr--hours">
      ${statusBar(true)}
      <div class="scr__body routine__body">
        ${routineHead(1)}
        <div class="routine__module">
          <h2 class="routine__modname">Module 1</h2>
          ${routineTimes()}
          <div class="routine__addrow"><button class="routine__add" data-addtime>${Icons.plus('#314CE1',18)}</button></div>
          <div class="routine__save"><button class="btn btn--save" data-save>Save</button></div>
        </div>
      </div>
    </div>`;
  },
  init(el){
    wireSeg(el,'/dias','/horas');
    wireRoutineTimes(el,'/horas');
    el.querySelector('[data-save]').addEventListener('click',()=>go('/days-ready'));
  }
});

/* ---------- bottom-sheet "Days and Schedules" (145:1596) ---------- */
App.route('/schedule', {
  render(){
    const sel = Store.get('days', ['Monday','Tuesday']);
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    return `<div class="scr scr--sheet">
      <div class="sheet">
        <h1 class="sheet__title">Days and<br>Schedules</h1>
        <div class="sheet__grid">
          ${days.map(d=>`<button class="pill sheet__pill ${sel.includes(d)?'is-selected':''}" data-day="${d}">${d}</button>`).join('')}
        </div>
        <div class="timepicker sheet__tp">
          <div class="timepicker__group sheet__tpgroup">
            <button class="timepicker__cell sheet__tpcell" data-pick="hours"><b>${getTimes()[0].h}</b> hours</button>
            <button class="timepicker__cell sheet__tpcell" data-pick="min"><b>${getTimes()[0].m}</b> min</button>
          </div>
        </div>
        <button class="sheet__confirm" data-confirm>Confirm</button>
      </div>
    </div>`;
  },
  init(el){
    wireChips(el, 'days');
    openPicker(el);
    el.querySelector('[data-confirm]').addEventListener('click', ()=>go('/dias'));
  }
});

/* ---------- helpers ---------- */
function wireSeg(el, daysPath, hoursPath){
  const seg = el.querySelector('.seg');
  if(!seg) return;
  seg.addEventListener('click', e=>{
    const b = e.target.closest('[data-seg]'); if(!b) return;
    const idx = b.getAttribute('data-seg');
    go(idx==='0' ? daysPath : hoursPath);
  });
}

function wireChips(el, storeKey){
  const sel = new Set([...el.querySelectorAll('[data-day].is-selected')].map(c=>c.getAttribute('data-day')));
  el.querySelectorAll('[data-day]').forEach(c=>{
    c.addEventListener('click', ()=>{
      const d = c.getAttribute('data-day');
      if(sel.has(d)){ sel.delete(d); c.classList.remove('is-selected'); }
      else { sel.add(d); c.classList.add('is-selected'); }
      Store.set(storeKey, [...sel]);
    });
  });
}

/* bottom-sheet picker tipo iOS */
function openPicker(el){
  el.querySelectorAll('[data-pick]').forEach(b=>{
    b.addEventListener('click', ()=>showPicker(el, b.getAttribute('data-pick'), Number(b.dataset.time || 0)));
  });
  const add = el.querySelector('[data-addtime]');
  if(add) add.addEventListener('click', ()=>{
    const times = getTimes();
    times.push({h:0,m:0,ap:'am'});
    saveTimes(times);
    App.render();
  });
}

function showPicker(el, kind, index=0){
  const phone = document.getElementById('phone');
  closePicker();
  let cols, current;
  const time = getTimes()[index];
  if(kind==='hours'){ cols=[[...new Set(DB.hours.map(h=>h.h))].map(v=>({v,l:String(v)}))]; current=[time.h]; }
  else if(kind==='min'){ cols=[[0,5,10,15,20,25,30,35,40,45,50,55].map(v=>({v,l:String(v)}))]; current=[time.m]; }
  else { cols=[[{v:'am',l:'am'},{v:'pm',l:'pm'}]]; current=[time.ap]; }

  const wrap = document.createElement('div');
  wrap.className = 'picker';
  wrap.innerHTML = `<div class="picker__sheet">
      <div class="picker__bar"><button class="picker__done" data-cancel>Cancel</button><span></span><button class="picker__done picker__done--ok" data-ok>Done</button></div>
      <div class="picker__cols">
        ${cols.map((c,ci)=>`<div class="picker__col" data-col="${ci}">
          ${c.map(o=>`<button class="picker__opt ${o.v===current[ci]?'is-sel':''}" data-v="${o.v}">${o.l}</button>`).join('')}
        </div>`).join('')}
      </div>
    </div>`;
  phone.appendChild(wrap);
  requestAnimationFrame(()=>wrap.classList.add('is-open'));

  const sel = {...{0:current[0]}, col0:current[0]};
  wrap.querySelector('[data-col]').addEventListener('click', e=>{
    const o = e.target.closest('.picker__opt'); if(!o) return;
    wrap.querySelectorAll('[data-col] .picker__opt').forEach(x=>x.classList.remove('is-sel'));
    o.classList.add('is-sel');
    sel.col0 = isNaN(Number(o.dataset.v)) ? o.dataset.v : Number(o.dataset.v);
  });
  wrap.querySelector('[data-cancel]').addEventListener('click', closePicker);
  wrap.addEventListener('click', e=>{ if(e.target===wrap) closePicker(); });
  wrap.querySelector('[data-ok]').addEventListener('click', ()=>{
    const times = getTimes();
    times[index][kind==='hours'?'h':kind==='min'?'m':'ap'] = sel.col0;
    saveTimes(times);
    closePicker();
    App.render();
  });
}

function closePicker(){
  const p = document.querySelector('.picker');
  if(p){ p.classList.remove('is-open'); setTimeout(()=>p.remove(),220); }
}

/* ---------- confirmación sobre el menú lateral ---------- */
function readyModal(text){
  return `<div class="readymodal fade-in">
    <button class="readymodal__close" data-go="/home">${Icons.close('#8A8A8E',16)}</button>
    <span class="readymodal__check">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7.5"/></svg>
    </span>
    <p class="readymodal__text">${text}</p>
  </div>`;
}

App.route('/days-ready', {
  render(){
    return `<div class="scr scr--home">
      ${statusBar(false)}
      ${topSearchBar()}
      <div class="scr__body home__body">
        <div class="home__blob">${mascot(244,{face:'sleepy'})}</div>
      </div>
      ${bottomNav('home')}
      ${lumaMenu()}
      ${readyModal('That was fast!')}
    </div>`;
  }
});

App.route('/product-ready', {
  render(){
    return `<div class="scr scr--home">
      ${statusBar(false)}
      ${topSearchBar()}
      <div class="scr__body home__body">
        <div class="home__blob">${mascot(244,{face:'sleepy'})}</div>
      </div>
      ${bottomNav('home')}
      ${lumaMenu()}
      ${readyModal('All saved, all set!')}
    </div>`;
  }
});

/* ---------- Check your level ---------- */
function levelBars(modules){
  return `<div class="levels">
    ${modules.map(m=>`<div class="level">
      <span class="level__label">Module ${m.n}</span>
      <div class="level__track"><div class="level__fill" style="height:${m.pct}%"></div></div>
    </div>`).join('')}
  </div>`;
}

function levelDonut(pct){
  return `<div class="leveldonut-wrap"><div class="leveldonut" style="--level:${pct*3.6}deg"></div><span>${pct}%</span></div>`;
}

function levelHead(activeIdx){
  const tabs = ['All','Module 1','Module 2','Module 3'];
  return `<div class="routine__top">
      ${backBtn('/home')}
      <button class="roundbtn" data-go="/step/1"><img class="roundbtn__ic" src="assets/luma/gear-header.png" alt="Settings"></button>
    </div>
    <h1 class="routine__h">Check your<br>level</h1>
    <p class="routine__sub">See how much you have left.</p>
    <div class="leveltabs">
      ${tabs.map((t,i)=>`<button class="leveltab ${i===activeIdx?'is-active':''}" data-lvl="${i}">${t}</button>`).join('')}
    </div>`;
}

App.route('/level/all', {
  render(){
    return `<div class="scr scr--violet scr--routine">
      ${statusBar(true)}
      <div class="scr__body routine__body">
        ${levelHead(0)}
        ${levelBars([{n:1,pct:80},{n:2,pct:62},{n:3,pct:43}])}
        <div style="height:60px"></div>
      </div>
    </div>`;
  },
  init(el){ wireLevels(el); }
});

App.route('/level/:mod', {
  render(p){
    const n = p.mod==='1'||p.mod==='m1'?1:p.mod==='2'||p.mod==='m2'?2:3;
    const pct = {1:79,2:62,3:43}[n];
    return `<div class="scr scr--violet scr--routine">
      ${statusBar(true)}
      <div class="scr__body routine__body">
        ${levelHead(n)}
         ${n===1 ? `<div class="levelm1"><h2>Serum</h2><p>Capacity: 100 ml</p>${levelDonut(pct)}</div>` : levelBars([{n,pct}])}
        <div style="height:60px"></div>
      </div>
    </div>`;
  },
  init(el){ wireLevels(el); }
});

function wireLevels(el){
  el.addEventListener('click', e=>{
    const b = e.target.closest('[data-lvl]'); if(!b) return;
    const i = b.getAttribute('data-lvl');
    go(i==='0' ? '/level/all' : '/level/m'+i);
  });
}

/* ---------- Add product ---------- */
App.route('/add-product', {
  render(){
    return `<div class="scr scr--violet scr--routine">
      ${statusBar(true)}
      <div class="scr__body routine__body">
        <div class="routine__top">
          ${backBtn('/home')}
          <button class="roundbtn" data-go="/step/1"><img class="roundbtn__ic" src="assets/luma/gear-header.png" alt="Settings"></button>
        </div>
        <h1 class="routine__h">Add a<br>product</h1>
        <p class="routine__sub">Keep all your skincare favorites in one place.</p>
        <div class="scanbox addprod__scanbox">
          <p class="scanbox__title">Scan a new one!</p>
          <p class="scanbox__sub">and make routine even better.</p>
          <button class="scanbox__area" data-go="/step/3/photo"><span>${Icons.plus('#FAFAFA',18)}</span></button>
        </div>
        <button class="manualbtn" data-go="/step/3/photo"><span><small>or</small>Add it manually</span>${Icons.chevron('#fff',20)}</button>
        <div style="height:60px"></div>
      </div>
    </div>`;
  },
  init(){}
});

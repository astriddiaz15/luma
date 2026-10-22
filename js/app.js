/* ============================================================
   LUMA — hash router + app bootstrap
   ============================================================ */

const App = (function(){
  const routes = {};
  const root = document.getElementById('screen');
  const timers = new Set();

  function after(callback, delay){
    const path = currentPath();
    const id = setTimeout(()=>{
      timers.delete(id);
      if(currentPath()===path) callback();
    }, delay);
    timers.add(id);
  }

  function route(path, def){ routes[path] = def; }

  function currentPath(){
    const h = location.hash.replace(/^#/, '');
    return h || '/';
  }

  function match(path){
    if(routes[path]) return {def:routes[path], params:{}};
    // pattern match like /step/:n
    for(const key in routes){
      const kp = key.split('/').filter(Boolean);
      const pp = path.split('/').filter(Boolean);
      if(kp.length!==pp.length) continue;
      const params = {}; let ok = true;
      for(let i=0;i<kp.length;i++){
        if(kp[i].startsWith(':')){
          try{ params[kp[i].slice(1)] = decodeURIComponent(pp[i]); }
          catch(e){ ok=false; break; }
        }
        else if(kp[i]!==pp[i]){ ok=false; break; }
      }
      if(ok) return {def:routes[key], params};
    }
    return null;
  }

  function render(){
    timers.forEach(clearTimeout);
    timers.clear();
    document.querySelectorAll('.picker').forEach(p=>p.remove());
    const path = currentPath();
    const m = match(path) || match('/splash');
    root.innerHTML = '';
    const el = document.createElement('div');
    el.innerHTML = m.def.render(m.params);
    const node = el.firstElementChild;
    root.appendChild(node);
    if(m.def.init) m.def.init(node, m.params);
    root.scrollTop = 0;
  }

  /* delegated navigation: any element with data-go */
  document.addEventListener('click', e=>{
    const t = e.target.closest('[data-go]');
    if(t){ e.preventDefault(); go(t.getAttribute('data-go')); }
  });

  window.addEventListener('hashchange', render);

  function fit(){
    const phone = document.getElementById('phone');
    if(window.innerWidth<=480){ phone.style.removeProperty('--phone-scale'); return; }
    const s = Math.min(1,(window.innerHeight-48)/912,(window.innerWidth-48)/420);
    phone.style.setProperty('--phone-scale', s.toFixed(3));
  }
  window.addEventListener('resize', fit);

  function start(){
    fit();
    if(!location.hash) location.replace('#/splash');
    render();
  }

  return {route, start, render, after};
})();

/* small helpers used across screens */
function toast(msg){
  const phone = document.getElementById('phone');
  const old = phone.querySelector('.toast'); if(old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  phone.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; }, 1600);
  setTimeout(()=>t.remove(), 2100);
}

/* nav buttons shared by every screen with a bottom bar */
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-nav]');
  if(!b) return;
  const id = b.getAttribute('data-nav');
  const map = {
    /* Figma prototipo: el botÃ³n LUMA (nav izq.) abre "Pantalla LUMA" (71:3728) */
    track:'/home/menu', routine:'/track', home:'/home', account:'/perfil', chat:'/derm',
    config:'/config'
  };
  if(map[id]) go(map[id]);
});

document.addEventListener('click', e=>{
  const t = e.target.closest('[data-toast]');
  if(t) toast(t.getAttribute('data-toast'));
});

document.addEventListener('click', e=>{
  const s = e.target.closest('[data-seg]');
  if(!s) return;
  const seg = s.parentElement;
  [...seg.children].forEach(c=>c.classList.remove('is-active'));
  s.classList.add('is-active');
  if(seg.dataset.onchange){
    const fn = window[seg.dataset.onchange];
    if(fn) fn(s.getAttribute('data-seg'), seg);
  }
});

/* boot after every screen module has registered its routes */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>App.start());
}else{
  App.start();
}

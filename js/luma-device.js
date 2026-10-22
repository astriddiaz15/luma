/* ============================================================
   LUMA — puente con el dispositivo físico (USB / Web Serial)
   ------------------------------------------------------------
   Comunicación REAL por cable USB. No hay Bluetooth: el enlace
   inalámbrico del prototipo es únicamente una simulación visual
   del flujo de Figma ("Looking for new devices").
   ------------------------------------------------------------
   Mensajes que ya emite el firmware (sin renombrar nada):
     SISTEMA INICIADO          → el dispositivo arrancó / handshake
     LUMA_ALIVE                → latido cada 2 s
     OBJETO DETECTADO A 3 CM   → inicio de una detección
     ACCION REALIZADA          → rutina completada (evento real)
     Distancia: X cm           → telemetría (no se usa en la UI)
   Comandos que envía la app:
     LUMA_LINK                 → parpadeo del LED de vinculación
     LUMA_PING                 → el dispositivo responde LUMA_ALIVE
   ============================================================ */

const LumaDevice = (function(){
  const BAUD = 9600;
  const HEARTBEAT_TIMEOUT = 6000;  // ms sin latido → desconectado
  const ROUTINE_COOLDOWN  = 3000;  // anti-duplicado; el firmware ya emite 1 evento por aproximación
  const OPEN_RETRIES      = 3;     // intentos al abrir un puerto ocupado
  const OPEN_RETRY_MS     = 1500;  // espera entre intentos

  let port = null;
  let reader = null;
  let reading = false;
  let watchdog = null;

  let state = 'off';            // off | linking | connected
  let pendingLink = false;      // el usuario pidió vincular (parpadeo)
  let connecting = null;        // promesa de apertura en curso (evita duplicados)
  let sending = Promise.resolve(); // cola de escritura (una a la vez)
  let lastBeat = 0;
  let lastRoutine = 0;
  let wantPort = false;         // el usuario vinculó: queremos mantener el puerto
  let reconnectTimer = null;
  let reconnectTries = 0;
  let lastDistance = null;      // última lectura del HC-SR04 (cm)
  let nearWarnAt = 0;           // anti-inundación del aviso de re-armo
  let lastDistanceAt = 0;       // momento de la última lectura del sensor
  let lastTelemetryLog = 0;     // anti-inundación: 1 línea de telemetría cada 10 s
  let rxLines = 0;              // líneas recibidas del Arduino
  let rxBytes = 0;              // bytes recibidos del Arduino
  let noDataWarnAt = 0;         // aviso "conectado pero sin datos"
  let rxTelemetrySeen = 0;      // lecturas de distancia recibidas en este enlace

  /* Tomado del ?v= del propio script: así el log siempre coincide con
     la versión servida por index.html (sirve para detectar caché vieja). */
  const APP_VERSION = (function(){
    try{
      const tag = [...document.scripts].find(s => /luma-device\.js/.test(s.src));
      return (tag && new URL(tag.src).searchParams.get('v')) || 'dev';
    }catch(e){ return 'dev'; }
  })();

  /* ---------- diagnóstico verificable ----------
     Consola siempre; panel en pantalla sólo con ?debug=1 en la URL.
     No cambia el diseño ni simula eventos: sólo registra lo que llega. */
  const DEBUG = /(?:[?&]debug=1)/.test(location.search + location.hash);
  const debugLines = [];

  function pushDebug(text){
    debugLines.push(text);
    if(debugLines.length > 40) debugLines.shift();
    document.dispatchEvent(new CustomEvent('luma:debug', {detail:{text}}));
  }

  function log(kind, message, data){
    let extra = '';
    try{ if(data !== undefined) extra = ' ' + JSON.stringify(data); }catch(e){}
    const text = new Date().toLocaleTimeString() + ' [' + kind + '] ' + message + extra;
    pushDebug(text);
    console.log('%c' + text, 'color:#314CE1;font-weight:600');
  }

  function supported(){
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  function emit(name, detail){
    document.dispatchEvent(new CustomEvent(name, {detail: detail || {}}));
  }

  function setState(next){
    if(state === next) return;
    log('STATE', state + ' → ' + next);
    state = next;
    Store.set('deviceLinked', next === 'connected');
    emit('luma:state', {state: next});
  }

  /* ---------- lectura de líneas ---------- */
  function handleLine(line){
    const text = line.trim();
    if(!text) return;
    rxLines++;
    lastBeat = Date.now();          // cualquier línea prueba que la placa está viva

    const isHandshake = text.indexOf('SISTEMA INICIADO') >= 0 || text.indexOf('LUMA_ALIVE') >= 0;

    /* Cualquier dato del sensor también confirma el enlace. Antes sólo se
       daba por conectado con el handshake: si la placa ya estaba despierta
       (o corría un firmware sin latido) el estado quedaba en "linking" y
       nunca se enviaba LUMA_LINK → el LED verde no parpadeaba. */
    if(state !== 'connected'){
      log('SERIAL', (isHandshake ? 'handshake del dispositivo: "' : 'datos del dispositivo: "') + text + '"');
      setState('connected');
      if(pendingLink && !isHandshake) sendLinkCommand('datos del sensor');
    }

    if(isHandshake){
      if(pendingLink) sendLinkCommand('handshake');
      return;
    }

    /* Telemetría del HC-SR04 (10 lecturas/s). NO se copia al registro de
       actividad para que los eventos reales no se pierdan entre lecturas:
       la distancia viva va en la cabecera del panel y aquí sólo se deja
       1 línea cada 10 s + los avisos de re-armado. */
    if(text.indexOf('Distancia:') >= 0){
      const m = text.match(/(\d+(?:[.,]\d+)?)/);
      if(m){
        const d = parseFloat(m[1].replace(',', '.'));
        if(!isNaN(d)) lastDistance = d;
      }
      lastDistanceAt = Date.now();

      if(!rxTelemetrySeen++){
        lastTelemetryLog = Date.now();
        log('SERIAL', 'primer dato del sensor: ' + (lastDistance === null ? '—' : lastDistance.toFixed(1) + ' cm'));
      }else if(Date.now() - lastTelemetryLog > 10000){
        lastTelemetryLog = Date.now();
        log('SERIAL', 'lectura ' + (lastDistance === null ? '—' : lastDistance.toFixed(1) + ' cm'));
      }

      if(lastDistance !== null && lastDistance < 6 && Date.now() - nearWarnAt > 7000){
        nearWarnAt = Date.now();
        log('ARM', 'sin re-armo: objeto a ' + lastDistance.toFixed(1) + ' cm (se arma al alejarse a más de 6 cm)');
      }
      return;
    }

    /* EVENTO REAL DE PROXIMIDAD.
       El firmware emite "OBJETO DETECTADO A 3 CM" una sola vez por
       aproximación (se re-arma cuando el objeto se aleja). Este es el
       evento que mueve la navegación, no el fin del ciclo. */
    if(text.indexOf('OBJETO DETECTADO') >= 0){
      const now = Date.now();
      if(now - lastRoutine < ROUTINE_COOLDOWN){
        log('DETECT', 'lectura repetida ignorada (' + (now - lastRoutine) + ' ms): la mano sigue frente al sensor');
        return;
      }
      lastRoutine = now;
      log('DETECT', 'Hand detected — Routine interaction registered');
      emit('luma:routine', {at: now});
      log('NAV', 'evento luma:routine enviado a la lógica de Progreso');
      return;
    }

    /* Fin del ciclo de luz (11 s después de la detección).
       Sólo informativo: no navega ni duplica el evento. */
    if(text.indexOf('ACCION REALIZADA') >= 0){
      log('SERIAL', 'fin del ciclo de luz');
      return;
    }

    if(text.indexOf('SENSOR:') >= 0){
      log('WARN', text);
      return;
    }

    /* Acuse de recibo del parpadeo: confirma que el comando llegó y que la
       placa lo ejecutó (o que lo descartó porque había una rutina en curso). */
    if(text.indexOf('VINCULACION: PARPADEO LED') >= 0){
      log('LINK', 'Arduino confirmó la vinculación · 3 destellos en curso');
      return;
    }
    if(text.indexOf('VINCULACION: LED RESTABLECIDO') >= 0){
      log('LINK', 'parpadeo terminado · LED verde restablecido');
      return;
    }
    if(text.indexOf('VINCULACION:') >= 0){
      log('WARN', text);
      return;
    }

    log('SERIAL', text);
  }

  async function readLoop(){
    reading = true;
    log('LINK', 'lectura serial activa (9600 baudios)');
    const decoder = new TextDecoderStream();
    const closed = port.readable.pipeTo(decoder.writable).catch(()=>{});
    reader = decoder.readable.getReader();
    let buffer = '';

    try{
      while(reading){
        const {value, done} = await reader.read();
        if(done) break;
        rxBytes += (value ? value.length : 0);
        buffer += value;
        let idx;
        while((idx = buffer.indexOf('\n')) >= 0){
          handleLine(buffer.slice(0, idx).replace(/\r/g, ''));
          buffer = buffer.slice(idx + 1);
        }
      }
    }catch(e){
      /* el puerto se cerró o el cable se retiró */
      log('LINK', 'error de lectura: ' + (e && e.message ? e.message : e));
    }finally{
      try{ reader.releaseLock(); }catch(e){}
      reader = null;
      await closed;
      if(reading){                 // se cortó sin que nosotros lo pidiéramos
        reading = false;
        log('LINK', 'la lectura se interrumpió; intentando reconectar');
        queueReconnect();
      }
    }
  }

  /* Reabre el MISMO puerto ya autorizado (sin segundo selector) cuando la
     lectura se cae por un reinicio del Arduino, un tirón del cable o una
     suspensión del navegador. Sin esto, la app quedaba "muerta" para siempre:
     el LED seguía funcionando pero ningún evento volvía a llegar. */
  function queueReconnect(){
    if(!wantPort || reconnectTimer) return;
    if(reconnectTries >= 20){
      log('LINK', 'reconexión agotada: volvé a vincular el dispositivo');
      return;
    }
    const delay = reconnectTries === 0 ? 400 : 1500;
    reconnectTries++;
    reconnectTimer = setTimeout(async()=>{
      reconnectTimer = null;
      if(!wantPort) return;
      if(port && port.readable) return;      // ya volvió a abrirse
      if(port){
        try{
          await port.open({baudRate: BAUD});
          log('LINK', 'reconectado automáticamente');
          reconnectTries = 0;
          setState('linking');
          startWatchdog();
          lastBeat = Date.now();
          readLoop();
          /* Aviso visual de reconexión: el LED verde hace sus 3 destellos.
             Se espera 2,5 s porque la UNO se reinicia al reabrir el puerto
             y los primeros bytes se pierden. Si hay una rutina de luces en
             curso, el firmware ignora el comando (no la interrumpe). */
          setTimeout(()=>{
            if(reading && port && !pendingLink) sendLinkCommand('reconectado');
          }, 2500);
          return;
        }catch(e){
          log('LINK', 'reintento fallido: ' + (e && e.message ? e.message : e));
        }
      }
      queueReconnect();
    }, delay);
  }

  function startWatchdog(){
    if(watchdog) return;
    watchdog = setInterval(()=>{
      if(state === 'connected' && Date.now() - lastBeat > HEARTBEAT_TIMEOUT){
        setState('off');
      }
      /* Conectado pero sin datos: cable/firmware/lector atascado.
         Se avisa como máximo cada 15 s para que se vea en la caja. */
      if(state === 'connected'){
        const ref = lastDistanceAt || lastBeat;
        if(ref && Date.now() - ref > 5000 && Date.now() - noDataWarnAt > 15000){
          noDataWarnAt = Date.now();
          log('WARN', 'conectado pero sin datos del Arduino hace ' +
                      Math.round((Date.now() - ref) / 1000) + ' s (¿lector detenido o puerto de otra pestaña?)');
        }
      }
    }, 1500);
  }

  function stopWatchdog(){
    if(watchdog){ clearInterval(watchdog); watchdog = null; }
  }

  /* ---------- apertura / cierre ---------- */
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function portInfo(p){
    try{
      const i = p && p.getInfo ? p.getInfo() : {};
      if(i.usbVendorId != null){
        const hex = n => '0x' + Number(n).toString(16).toUpperCase().padStart(4, '0');
        return 'USB ' + hex(i.usbVendorId) + ':' + (i.usbProductId != null ? hex(i.usbProductId) : '----');
      }
      return 'USB s/id';
    }catch(e){ return 'USB ?'; }
  }

  async function openPort(target){
    const p = target || port;
    if(!p) return false;
    if(p.readable) return true;      // ya está abierto: no abrir dos veces
    try{
      await p.open({baudRate: BAUD});
    }catch(e){
      /* Causa habitual: otra pestaña/navegador/aplicación tiene el puerto. */
      log('ERROR', 'no se pudo abrir el puerto ' + portInfo(p) + ': ' + (e && e.message ? e.message : e));
      return false;
    }
    port = p;
    log('LINK', 'puerto abierto a ' + BAUD + ' baudios · ' + portInfo(p));
    rxLines = 0; rxBytes = 0; rxTelemetrySeen = 0;
    lastDistance = null; lastDistanceAt = 0; noDataWarnAt = 0; lastTelemetryLog = 0;
    wantPort = true;
    Store.set('wantPort', true);
    setState('linking');
    startWatchdog();
    lastBeat = Date.now();
    readLoop();

    /* Si el puerto abre pero el Arduino no dice nada, casi siempre es que se
       eligió otro dispositivo o que el monitor serial del IDE sigue abierto. */
    setTimeout(()=>{
      if(reading && rxLines === 0){
        log('WARN', 'puerto abierto pero sin datos del Arduino (¿COM equivocado o monitor serial de Arduino IDE abierto?)');
      }
    }, 5000);

    /* La UNO se reinicia al abrir el puerto y los primeros bytes se pierden.
       Si el handshake no llegó (placa ya despierta o firmware sin latido),
       se manda el comando igual para que el LED verde parpadee. */
    if(pendingLink){
      setTimeout(()=>{
        if(reading && port === p && pendingLink){
          sendLinkCommand('puerto abierto, sin handshake');
        }
      }, 2500);
    }

    return true;
  }

  /* Windows/Web Serial dan el puerto a un solo proceso. Si está ocupado,
     se reintenta unas veces por si la otra pestaña/aplicación lo suelta. */
  async function openWithRetries(target){
    for(let intento = 1; intento <= OPEN_RETRIES; intento++){
      if(await openPort(target)) return true;
      if(intento < OPEN_RETRIES){
        log('LINK', 'reintento ' + (intento + 1) + '/' + OPEN_RETRIES + ' en ' +
                    (OPEN_RETRY_MS / 1000) + ' s (el puerto puede estar tomado)');
        await wait(OPEN_RETRY_MS);
      }
    }
    log('ERROR', 'el puerto sigue ocupado: cerralo en la otra aplicación y tocá + de nuevo ' +
                 '(Monitor Serial de Arduino IDE, otra pestaña de LUMA en Chrome o Edge)');
    return false;
  }

  async function requestLink(){
    if(!supported()){
      log('ERROR', 'este navegador no expone Web Serial (navigator.serial)');
      return false;
    }

    if(state === 'connected'){
      return sendLinkCommand('enlace ya activo');
    }

    pendingLink = true;
    wantPort = true;

    if(state === 'linking' && port){
      /* Ya hay puerto abierto (p. ej. clic repetido en "+"): mandar el
         comando en vez de salir en silencio, que era lo que dejaba el LED
         verde sin parpadear. */
      return sendLinkCommand('enlace recién abierto');
    }

    /* Una sola solicitud a la vez: el clic en "+" y el init de
       "/devices/looking" llegan casi juntos y no deben abrir dos
       veces el selector ni borrar el parpadeo pendiente. */
    if(connecting) return connecting;

    connecting = (async()=>{
      try{
        const granted = await navigator.serial.getPorts();
        log('LINK', 'puertos autorizados: ' + (granted ? granted.length : 0) +
                    (granted && granted[0] ? ' · ' + portInfo(granted[0]) : ''));

        /* Candidatos: el puerto ya usado + todos los autorizados.
           Antes sólo se probaba granted[0]; si ese fallaba, todos los
           intentos siguientes reusaban el mismo objeto y nunca abría. */
        const candidates = [];
        if(port) candidates.push(port);
        (granted || []).forEach(p => { if(!candidates.includes(p)) candidates.push(p); });

        if(!candidates.length){
          log('LINK', 'sin permiso guardado: el navegador pedirá elegir el puerto (COM9)');
          const chosen = await navigator.serial.requestPort(); // requiere gesto del usuario
          if(chosen) candidates.push(chosen);
        }

        if(!candidates.length){
          pendingLink = false;
          log('ERROR', 'vinculación fallida: no se eligió ningún puerto');
          return false;
        }

        for(let i = 0; i < candidates.length; i++){
          const c = candidates[i];
          log('LINK', 'intentando puerto ' + (i + 1) + '/' + candidates.length + ' · ' + portInfo(c));
          const ok = await openWithRetries(c);
          if(ok){
            log('LINK', 'enlace listo · esperando datos del dispositivo');
            return true;
          }
          if(port === c) port = null;   // descartar el candidato que falló
        }

        pendingLink = false;
        return false;
      }catch(e){
        pendingLink = false;
        /* Sin esto, un permiso cancelado o un requestPort sin gesto quedaba
           en silencio y la app parecía "conectada" sin recibir nada. */
        const name = e && e.name ? e.name : '';
        const msg = name === 'SecurityError'
          ? 'el navegador exige un clic real para elegir el puerto (usá el botón +)'
          : name === 'NotFoundError'
            ? 'no se eligió ningún puerto'
            : (e && e.message ? e.message : String(e));
        log('ERROR', 'vinculación fallida: ' + msg);
        return false;
      }finally{
        connecting = null;
      }
    })();

    return connecting;
  }

  function send(cmd){
    if(!port || !port.writable) return Promise.resolve(false);
    /* Una escritura a la vez: nunca dos escritores solapados en el puerto. */
    sending = sending.then(async()=>{
      if(!port || !port.writable) return false;
      try{
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode(cmd + '\r\n'));
        writer.releaseLock();
        return true;
      }catch(e){
        return false;
      }
    }).catch(()=>false);
    return sending;
  }

  /* Comando de vinculación: el firmware hace parpadear 3 veces el LED verde
     del pin 5 (no toca la tira NeoPixel ni interrumpe el sensor).
     Sólo se descarta el pendiente si la escritura salió bien; si falla,
     se reintenta una vez para no perder el aviso visual. */
  function sendLinkCommand(origen, reintento){
    if(!port || !port.writable){
      log('WARN', 'no se pudo enviar LUMA_LINK: el puerto no está abierto');
      return Promise.resolve(false);
    }
    return send('LUMA_LINK').then(ok=>{
      if(ok){
        pendingLink = false;
        log('LINK', 'LUMA_LINK enviado (' + origen + ') · el LED verde debe parpadear 3 veces');
      }else{
        log('ERROR', 'LUMA_LINK no salió por el puerto (' + origen + ')');
        if(!reintento){
          setTimeout(()=>sendLinkCommand(origen + ' · reintento', true), 600);
        }
      }
      return ok;
    });
  }

  async function close(){
    reading = false;
    pendingLink = false;
    wantPort = false;
    Store.set('wantPort', false);
    if(reconnectTimer){ clearTimeout(reconnectTimer); reconnectTimer = null; }
    stopWatchdog();
    try{ if(reader) await reader.cancel(); }catch(e){}
    try{ if(port) await port.close(); }catch(e){}
    reader = null;
    port = null;
    setState('off');
    log('LINK', 'puerto cerrado por la aplicación');
  }

  /* ---------- eventos del navegador ---------- */
  if(supported()){
    navigator.serial.addEventListener('disconnect', e=>{
      if(e.target === port){
        log('LINK', 'dispositivo desconectado del USB');
        reading = false;
        wantPort = false;
        stopWatchdog();
        port = null;
        reader = null;
        setState('off');
      }
    });
  }

  /* ---------- panel de diagnóstico (sólo ?debug=1) ---------- */
  function mountDebugPanel(){
    if(!DEBUG || document.getElementById('lumadebug')) return;
    const el = document.createElement('div');
    el.id = 'lumadebug';
    el.style.cssText = [
      'position:fixed','left:8px','bottom:8px','width:420px','max-height:50vh',
      'overflow:auto','background:rgba(12,18,40,.92)','color:#cfe0ff',
      'font:11px/1.45 ui-monospace,Consolas,monospace','padding:8px 10px',
      'border-radius:10px','z-index:99999','white-space:pre-wrap',
      'pointer-events:none','box-shadow:0 8px 24px rgba(0,0,0,.25)'
    ].join(';');
    document.body.appendChild(el);
    const since = () => {
      const ref = lastDistanceAt || lastBeat;
      if(!ref) return '—';
      return ((Date.now() - ref) / 1000).toFixed(1) + 's';
    };
    const render = ()=>{
      el.textContent =
        'LUMA ' + APP_VERSION +
        ' · serial:' + (supported() ? 'sí' : 'NO') +
        ' · estado:' + state +
        ' · puerto:' + (port ? 'abierto' : 'sin abrir') +
        ' · pantalla:' + (location.hash || '#/') +
        ' · armado:' + (Store.get('progressArmed', false) ? 'sí' : 'no') +
        '\n' +
        'dist:' + (lastDistance === null ? '—' : lastDistance.toFixed(1) + ' cm') +
        ' · rx:' + rxLines + ' líneas / ' + rxBytes + ' B' +
        ' · último dato:' + since() +
        '\n' + debugLines.slice(-14).join('\n');
      el.scrollTop = el.scrollHeight;
    };
    document.addEventListener('luma:debug', render);
    document.addEventListener('luma:routine', render);
    document.addEventListener('luma:state', render);
    window.addEventListener('hashchange', render);
    setInterval(render, 1000);   // refresca dist/rx aunque no lleguen eventos
    render();
  }

  log('INIT', 'app v' + APP_VERSION +
              ' · Web Serial ' + (supported() ? 'disponible' : 'NO DISPONIBLE') +
              ' · contexto ' + (window.isSecureContext ? 'seguro' : 'NO seguro') +
              ' · ' + location.protocol + '//' + location.host);
  /* Reconexión silenciosa tras recargar: si el puerto ya tiene permiso,
     se reabre solo (sin selector) y la app vuelve a recibir detecciones. */
  if(supported() && Store.get('wantPort', false)){
    navigator.serial.getPorts().then(granted=>{
      if(granted && granted.length){
        port = granted[0];
        log('LINK', 'reconectando el puerto autorizado tras la recarga');
        openPort();
      }else{
        log('LINK', 'el puerto no tiene permiso guardado en este origen: usá el botón +');
      }
    }).catch(()=>{});
  }

  if(DEBUG){
    console.log('%cLUMA · diagnóstico activo','background:#314CE1;color:#fff;padding:4px 8px;border-radius:4px');
    mountDebugPanel();
  }

  return {
    get state(){ return state; },
    get supported(){ return supported(); },
    get distance(){ return lastDistance; },
    get version(){ return APP_VERSION; },
    get logs(){ return debugLines.slice(); },
    log,
    requestLink,
    send,
    close
  };
})();

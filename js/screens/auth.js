/* ============================================================
   LUMA — screens: onboarding / welcome / sign in / sign up / loading
   Figma nodes: 67:2081, 177:3671, 67:2109, 163:1871, 163:2046

   Geometry & type taken literally from the Figma frames:
   - splash title: Poppins 400 48/42, "here." Poppins 700 (node 67:2083)
   - welcome / create-account subtitle: Lora 400 16/21 (nodes 67:2111, 163:1873)
   - pill buttons 245x41 (Figma marks them Inter-600; rendered as Poppins 600
     by app-wide typography requirement)
   - password fields show literal periods ".................." (163:1871)
   ============================================================ */

/* --- splash: "Your moment to glow begins here." (67:2081) --- */
App.route('/splash', {
  render(){
    return `<div class="scr scr--splash">
      ${statusBar(false)}
      <div class="splash__blob"></div>
       <div class="splash__face">${originalFace('assets/luma/face-start-original.svg')}</div>
      <div class="splash__copy h-display">
        Your moment<br>to glow begins <b>here.</b>
      </div>
      <div class="splash__cta">
        <button class="btn btn--glass" data-go="/welcome">Get started!</button>
      </div>
    </div>`;
  }
});

/* --- splash variant: "Look at you, glowing!" (177:3671) --- */
App.route('/glowing', {
  render(){
    return `<div class="scr scr--splash">
      ${statusBar(true)}
      <div class="splash__blob"></div>
      <div class="splash__face splash__face--wink">${mascotFace('calm',90)}</div>
      <div class="splash__copy h-display">
        Look at you,<br><b>glowing!</b>
      </div>
    </div>`;
  },
  init(){ App.after(()=>go('/track/saved'), 1800); }
});

/* --- welcome: create an account / sign in / google (67:2109) --- */
App.route('/welcome', {
  render(){
    return `<div class="scr scr--welcome">
      ${statusBar(false)}
      <div class="welcome__blob-top"></div>
      <div class="scr__body welcome__body">
        <h1 class="welcome__title h-round">Welcome!</h1>
        <p class="welcome__sub t-soft">I'm so happy you're here!</p>
        <p class="welcome__sub t-soft">Let's grow together, one little act of self-care at a time.</p>

        <div class="welcome__actions">
          <button class="btn btn--peri" data-go="/signup">Create an account</button>
          <button class="btn btn--peri btn--peri--soft" data-go="/signin">Sign in</button>
        </div>

        <div class="welcome__divider"></div>

        <button class="btn btn--google" data-go="/loading">
          ${Icons.google}<span>Sign up with Google</span>
        </button>
      </div>
      <div class="welcome__blob-bottom">${mascot(244,{face:'sleepy'})}</div>
    </div>`;
  }
});

/* --- sign in --- */
App.route('/signin', {
  render(){
    return `<div class="scr scr--auth">
      ${statusBar(false)}
      <div class="welcome__blob-top"></div>
      <div class="scr__body auth__body">
        <h1 class="auth__title h-round">Welcome back!</h1>
        <p class="auth__sub t-soft">Log in and keep glowing.</p>

        <div class="field">
          <label class="field__label">Enter your email</label>
          <div class="field__wrap">
            <input type="email" placeholder="Ex: abc@hotmail.com" autocomplete="email">
          </div>
        </div>

        <div class="field">
          <label class="field__label">Password</label>
          <div class="field__wrap field__wrap--dots">
            <input type="password" placeholder=".................." value="lumaglow" autocomplete="current-password">
            <span class="field__icon" data-toggle-pass>${Icons.eye()}</span>
          </div>
        </div>

        <p class="auth__alt">Don't have an account? <a data-go="/signup">Sign up</a></p>

        <button class="btn btn--blue auth__next" data-login>${Icons.chevron('#fff',22)}</button>
      </div>
      <div class="auth__blob">${mascot(244,{face:'sleepy'})}</div>
    </div>`;
  },
  init(el){
    el.querySelector('[data-toggle-pass]').addEventListener('click', ()=>{
      const inp = el.querySelector('.field__wrap--dots input');
      inp.type = inp.type==='password' ? 'text' : 'password';
    });
    el.querySelector('[data-login]').addEventListener('click', ()=>{
      /* Asocia el correo al perfil sólo si todavía no tiene uno; nunca
         sobrescribe los datos de un perfil ya registrado. */
      const inp = el.querySelector('input[type="email"]');
      const email = ((inp && inp.value) || '').trim();
      if(email && !DB.user.email) Profile.setIdentity(DB.user.name, email);
      Store.set('logged', true);
      /* Figma flow: after auth the user MUST run the device onboarding
         (Steps 1-5) before reaching Home. */
      go('/step/1');
    });
  }
});

/* --- create account (163:1871) --- */
App.route('/signup', {
  render(){
    return `<div class="scr scr--auth">
      ${statusBar(false)}
      <div class="welcome__blob-top"></div>
      <div class="scr__body auth__body">
        <h1 class="auth__title h-round">Create an account</h1>
        <p class="auth__sub t-soft">We're happy you're here. Let's get started!</p>

        <div class="field">
          <label class="field__label">What should I call you?</label>
          <div class="field__wrap"><input type="text" data-name placeholder="Ex. Pau"></div>
        </div>

        <div class="field">
          <label class="field__label">Enter your email</label>
          <div class="field__wrap"><input type="email" data-email placeholder="Ex: abc@hotmail.com"></div>
        </div>

        <div class="field">
          <label class="field__label">Password</label>
          <div class="field__wrap field__wrap--dots"><input type="password" placeholder=".................."></div>
        </div>

        <div class="field">
          <label class="field__label">Confirm your password</label>
          <div class="field__wrap field__wrap--dots"><input type="password" placeholder=".................."></div>
        </div>

        <p class="auth__alt">Already have an account? <a data-go="/signin">Log in</a></p>

        <button class="btn btn--blue auth__next" data-next>${Icons.chevron('#fff',22)}</button>
      </div>
       <div class="auth__blob auth__blob--corner">${mascot(244,{faceAsset:'assets/luma/face-signup-original.svg'})}</div>
    </div>`;
  },
  init(el){
    el.querySelector('[data-next]').addEventListener('click', ()=>{
      const name = el.querySelector('[data-name]').value.trim();
      const email = el.querySelector('[data-email]').value.trim();
      /* Guarda el perfil real (nombre y correo). La contraseña no se
         almacena: el prototipo no implementa autenticación. */
      Profile.register(name, email);
      Store.set('logged', true);
      /* Figma flow: after auth the user MUST run the device onboarding
         (Steps 1-5) before reaching Home. The Loading frame (163:2046)
         sits between Create account and Step 1 on the Figma canvas. */
      go('/loading');
    });
  }
});

/* --- loading (163:2046): mascot ball only --- */
App.route('/loading', {
  render(){
    return `<div class="scr scr--loading">
      ${statusBar(false)}
       <div class="loading__blob">${mascot(473,{face:'calm'})}</div>
    </div>`;
  },
  init(){
    App.after(()=>go('/step/1'), 1400);
  }
});

/* ===================================================================
   ERIC & SHERITA · v2 APP.JS
   =================================================================== */

/* ============ UTILS ============ */
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function $(sel, root){ return (root||document).querySelector(sel); }
function $$(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

/* ============ TARGET DATE ============ */
const TARGET = new Date('2026-11-28T17:00:00+00:00').getTime();

/* ============ CUSTOM CURSOR ============ */
(function(){
  if (window.matchMedia('(pointer:coarse)').matches) return;
  const c = document.getElementById('cursor');
  const d = document.getElementById('cursorDot');
  if (!c || !d) return;
  let x=0,y=0,tx=0,ty=0;
  document.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; d.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`; });
  function loop(){ tx += (x - tx) * 0.18; ty += (y - ty) * 0.18; c.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`; requestAnimationFrame(loop); }
  loop();
  const hovers = 'a, button, input, textarea, select, [data-cursor]';
  document.addEventListener('mouseover', e => { if (e.target.closest && e.target.closest(hovers)) c.classList.add('big'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest && e.target.closest(hovers)) c.classList.remove('big'); });
})();

/* ============ REVEAL ON SCROLL ============ */
(function(){
  if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(r => r.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach(r => io.observe(r));

  const io2 = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io2.unobserve(e.target); } });
  }, { threshold: 0.4 });
  $$('.section-divider').forEach(r => io2.observe(r));
})();

/* ============ NAV BAR + HAMBURGER + SCROLL SPY ============ */
(function(){
  const bar = $('#navBar');
  const overlay = $('#navOverlay');
  const hamburger = $('#navHamburger');
  const closeBtn = $('#navOverlayClose');
  if (!bar) return;

  // Solid state after scroll past first 80% of viewport height
  function updateBarState(){
    const scrolled = window.scrollY > window.innerHeight * 0.7;
    bar.classList.toggle('solid', scrolled);
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking){
      requestAnimationFrame(() => { updateBarState(); updateActiveSection(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  updateBarState();

  // Hamburger open/close
  function openMenu(){
    overlay.classList.add('on');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }
  function closeMenu(){
    overlay.classList.remove('on');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }
  hamburger?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  // Close on link click
  $$('#navOverlay a').forEach(a => a.addEventListener('click', () => setTimeout(closeMenu, 100)));
  // ESC key
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('on')) closeMenu(); });

  // Smooth scroll with offset for the fixed nav
  function smoothScrollTo(hash){
    const el = document.querySelector(hash);
    if (!el) return;
    const barHeight = bar.getBoundingClientRect().height;
    const y = window.scrollY + el.getBoundingClientRect().top - barHeight - 8;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  $$('.nav-bar a[href^="#"], .nav-overlay a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      if (hash === '#top'){ e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (hash && hash.startsWith('#')){
        const target = document.querySelector(hash);
        if (target){ e.preventDefault(); smoothScrollTo(hash); }
      }
    });
  });

  // Scroll-spy: highlight active section based on which one is in view
  const sections = ['timeline','venues','hotels','rsvp','gifts','wishes','contact'];
  function updateActiveSection(){
    const y = window.scrollY + window.innerHeight * 0.3;
    let current = '';
    for (const id of sections){
      const el = document.getElementById(id);
      if (!el) continue;
      const top = window.scrollY + el.getBoundingClientRect().top;
      if (y >= top) current = id;
    }
    $$('.nav-bar a[data-nav], .nav-overlay a[data-nav]').forEach(a => {
      a.classList.toggle('active', a.dataset.nav === current);
    });
  }
  updateActiveSection();

  // Overlay language buttons — sync with main handler
  $$('#navOverlay .nav-overlay-lang button').forEach(b => {
    b.addEventListener('click', () => {
      const langBtn = document.querySelector('.lang-toggle button[data-lang="' + b.dataset.lang + '"]');
      if (langBtn) langBtn.click();
      // Also update overlay buttons state
      $$('#navOverlay .nav-overlay-lang button').forEach(bb => bb.classList.toggle('on', bb.dataset.lang === b.dataset.lang));
    });
  });
  // Init overlay lang state to match stored
  const storedLang = localStorage.getItem('ericsherita:lang') || 'en';
  $$('#navOverlay .nav-overlay-lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === storedLang));
})();

/* ============ INTRO OVERLAY DISMISS ============ */
(function(){
  const overlay = $('#introOverlay');
  if (!overlay) return;
  setTimeout(() => overlay.classList.add('gone'), 1600);
  setTimeout(() => overlay.remove(), 3000);
})();

/* ============ HERO GLOW cursor follow ============ */
(function(){
  const glow = $('#heroGlow');
  const hero = document.querySelector('.hero');
  if (!glow || !hero) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    glow.style.setProperty('--gx', x + '%');
    glow.style.setProperty('--gy', y + '%');
  });
})();

/* ============ HERO PARALLAX ============ */
(function(){
  const bg = $('#heroBg');
  if (!bg) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking){
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2){
          bg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ============ HERO PARTICLES ============ */
(function(){
  const box = $('#heroParticles');
  if (!box) return;
  for (let i = 0; i < 14; i++){
    const p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (12 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    box.appendChild(p);
  }
})();

/* ============ COUNTDOWN + TILE FLIP ============ */
(function(){
  const els = { d:$('[data-cd="d"]'), h:$('[data-cd="h"]'), m:$('[data-cd="m"]'), s:$('[data-cd="s"]') };
  if (!els.d) return;
  let last = {};
  function flip(key, val){
    if (last[key] !== val){
      const face = els[key].parentElement;
      face.classList.remove('flip'); void face.offsetWidth; face.classList.add('flip');
      els[key].textContent = val;
      last[key] = val;
    }
  }
  function tick(){
    const now = Date.now();
    let diff = Math.max(0, TARGET - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    flip('d', String(d).padStart(2,'0'));
    flip('h', String(h).padStart(2,'0'));
    flip('m', String(m).padStart(2,'0'));
    flip('s', String(s).padStart(2,'0'));
  }
  tick(); setInterval(tick, 1000);
})();

/* ============ MILESTONE BANNER — disabled per Edmund's request 2026-07-06.
   Post-wedding Thank-You reveal is preserved below. ============ */
(function(){
  const now = Date.now();
  const diff = TARGET - now;
  if (diff < -86400000){
    const ty = $('#thankyou');
    if (ty) ty.classList.add('on');
  }
})();
if (false) (function(){
  const banner = $('#milestoneBanner');
  if (!banner) return;
  const now = Date.now();
  const diff = TARGET - now;
  const daysLeft = Math.ceil(diff / 86400000);
  let msg = '';
  if (daysLeft > 0 && daysLeft <= 1) msg = '<i class="fas fa-heart"></i> Tomorrow is the day <i class="fas fa-heart"></i>';
  else if (daysLeft <= 7 && daysLeft > 1) msg = '<i class="fas fa-heart"></i> One week to go — see you soon';
  else if (daysLeft <= 14 && daysLeft > 7) msg = '<i class="fas fa-heart"></i> Two weeks — the countdown is on';
  else if (daysLeft <= 30 && daysLeft > 14) msg = '<i class="fas fa-heart"></i> One month left — time to book that flight';
  else if (daysLeft <= 60 && daysLeft > 30) msg = '<i class="fas fa-heart"></i> Two months to go';
  else if (daysLeft <= 100 && daysLeft > 60) msg = '<i class="fas fa-heart"></i> Under 100 days — the excitement builds';
  else if (daysLeft <= 180 && daysLeft > 100) msg = '<i class="fas fa-heart"></i> Six months out — save the date if you haven\'t';
  else if (daysLeft <= 0 && diff > -86400000) msg = '<i class="fas fa-heart"></i> Today is the day <i class="fas fa-heart"></i>';
  // Post-wedding: show thank you
  if (diff < -86400000){
    const ty = $('#thankyou');
    if (ty) ty.classList.add('on');
    return;
  }
  if (!msg) return;
  // Respect closed state via sessionStorage
  if (sessionStorage.getItem('ericsherita:milestoneClosed:' + daysLeft) === '1') return;
  banner.querySelector('.milestone-text').innerHTML = msg;
  setTimeout(() => banner.classList.add('on'), 1200);
  $('#milestoneClose')?.addEventListener('click', () => {
    banner.classList.remove('on');
    sessionStorage.setItem('ericsherita:milestoneClosed:' + daysLeft, '1');
  });
})();

/* ============ TIMELINE LIGHT-UP ============ */
(function(){
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lit'); });
  }, { threshold: 0.4 });
  $$('.tl-item').forEach(el => io.observe(el));
})();

/* ============ MUSIC PICKER ============ */
(function(){
  const audio = $('#siteAudio'); const toggle = $('#musicToggle'); const icon = $('#musicIcon');
  if (!audio || !toggle) return;
  audio.volume = 0.3;
  let playing = false;
  function play(){ audio.play().then(() => { playing = true; icon.className = 'fas fa-volume-up'; toggle.classList.add('playing'); }).catch(() => {}); }
  function pause(){ audio.pause(); playing = false; icon.className = 'fas fa-music'; toggle.classList.remove('playing'); }
  toggle.addEventListener('click', () => { playing ? pause() : play(); });

  /* Expose a hook so the splash handoff can seamlessly continue the music
     from where the splash left off — the "See Venues & RSVP" tap counts as
     a user gesture for autoplay purposes. */
  window.__resumeSiteMusic = function(seekSeconds){
    try{
      if (typeof seekSeconds === 'number' && !isNaN(seekSeconds)){
        audio.currentTime = seekSeconds % (audio.duration || seekSeconds || 1);
      }
    }catch(e){}
    play();
  };
})();

/* ============ HOTEL SLIDER (mobile, one card at a time) ============ */
(function(){
  const grid = $('#hotelGrid'); const dotBox = $('#hotelDots');
  const prevBtn = $('#hotelPrev'); const nextBtn = $('#hotelNext');
  if (!grid || !dotBox) return;
  const cards = $$('.hotel-card', grid);
  const dots = $$('span', dotBox);
  function cardStep(){
    const c = cards[0]; if (!c) return 340;
    const r = c.getBoundingClientRect();
    // card width + horizontal margin (24px on each side = 48 total but we snap by card center)
    return r.width + 24;
  }
  function currentIndex(){
    const w = cardStep();
    return Math.round(grid.scrollLeft / w);
  }
  function update(){
    const isMobile = window.matchMedia('(max-width:720px)').matches;
    if (!isMobile){
      dotBox.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }
    dotBox.style.display = 'flex';
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';
    const idx = currentIndex();
    dots.forEach((d, i) => d.classList.toggle('on', i === Math.min(dots.length - 1, Math.max(0, idx))));
    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx >= cards.length - 1;
  }
  function goTo(i){
    const w = cardStep();
    grid.scrollTo({ left: i * w, behavior: 'smooth' });
  }
  let ticking = false;
  grid.addEventListener('scroll', () => { if (!ticking){ requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; } }, { passive: true });
  window.addEventListener('resize', update);
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
  prevBtn?.addEventListener('click', () => goTo(Math.max(0, currentIndex() - 1)));
  nextBtn?.addEventListener('click', () => goTo(Math.min(cards.length - 1, currentIndex() + 1)));
  update();
})();

/* ============ ACCORDION ============ */
$$('.acc-head').forEach(h => {
  h.addEventListener('click', () => {
    const it = h.closest('.acc-item');
    $$('.acc-item.on').forEach(o => { if (o !== it) o.classList.remove('on'); });
    it.classList.toggle('on');
  });
});

/* ============ WISH TABS ============ */
$$('.wish-tab').forEach(t => {
  t.addEventListener('click', () => {
    const p = t.dataset.panel;
    $$('.wish-tab').forEach(x => x.classList.toggle('on', x === t));
    $$('.wish-panel').forEach(x => x.classList.toggle('on', x.dataset.panel === p));
  });
});

/* ============ FALLING PETALS on wishes section ============ */
(function(){
  const box = $('#wishesPetals');
  if (!box) return;
  for (let i = 0; i < 16; i++){
    const p = document.createElement('div');
    p.className = 'wishes-petal';
    p.innerHTML = '<svg viewBox="0 0 20 30"><path d="M 10 1 Q 2 10 3 20 Q 5 27 10 29 Q 15 27 17 20 Q 18 10 10 1 Z" fill="url(#sagepetal)"/></svg>';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (14 + Math.random() * 8) + 's';
    p.style.animationDelay = (Math.random() * 14) + 's';
    p.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
    p.style.transform = `scale(${0.7 + Math.random() * 0.6})`;
    box.appendChild(p);
  }
})();

/* ============ RSVP WIZARD ============ */
(function(){
  const state = { name:'', guests:2, side:'', ceremony:'yes', reception:'yes', attending:'yes', dietary:'', note:'', email:'', phone:'', found:false };
  const nameInp = $('#guestName');
  const statusEl = $('#guestStatus');
  const steps = $$('.rsvp-step');
  const dots = $$('.rsvp-step-dot');
  const lines = $$('.rsvp-step-line');
  const summary = $('#rsvpSummary');
  if (!nameInp) return;

  function setStep(n){
    steps.forEach(s => s.classList.toggle('on', +s.dataset.step === n));
    dots.forEach((d,i) => {
      d.classList.remove('active','done');
      if (i+1 < n) d.classList.add('done');
      else if (i+1 === n) d.classList.add('active');
    });
    lines.forEach((l,i) => l.classList.toggle('done', i+1 < n));
  }
  async function searchGuest(){
    const q = nameInp.value.trim();
    if (q.length < 2){ statusEl.className='guest-status notfound on'; statusEl.textContent='Please enter at least 2 characters.'; return false; }
    try{
      const r = await fetch('api/guests.php?q=' + encodeURIComponent(q), { cache: 'no-store' });
      const j = await r.json();
      if (j.found){
        state.name = j.name || q;
        state.guests = j.seats || 2;
        state.side = j.side || '';
        $('#rsvpGuests').value = Math.min(6, state.guests);
        if (state.side) $('#rsvpSide').value = state.side;
        statusEl.className = 'guest-status found on';
        statusEl.innerHTML = `Welcome, <strong>${escapeHtml(j.name || q)}</strong>. You have <strong>${j.seats} seat${j.seats>1?'s':''}</strong> reserved${j.default? ' (default).' : '.'}`;
        state.found = true;
        return true;
      } else {
        statusEl.className = 'guest-status notfound on';
        statusEl.textContent = j.msg || 'Name not found. Please continue anyway if you were invited.';
        state.name = q; state.found = false;
        return true;
      }
    }catch(e){
      statusEl.className = 'guest-status notfound on'; statusEl.textContent = 'Could not check the guest list. You can still RSVP.';
      state.name = q; return true;
    }
  }
  $('#btnNext1').addEventListener('click', async () => { if (await searchGuest()) setStep(2); });
  $('#btnBack2').addEventListener('click', () => setStep(1));
  $('#btnNext2').addEventListener('click', () => {
    state.attending = document.querySelector('input[name="attending"]:checked').value;
    state.guests    = parseInt($('#rsvpGuests').value, 10) || 1;
    state.side      = $('#rsvpSide').value;
    state.dietary   = $('#rsvpDietary').value.trim();
    state.note      = $('#rsvpNote').value.trim();
    state.email     = $('#rsvpEmail').value.trim();
    state.phone     = $('#rsvpPhone').value.trim();
    if (!state.email){ alert('Please enter an email so we can reach you.'); return; }
    const attendLine = state.attending === 'yes'
      ? 'Attending &middot; ' + state.guests + ' guest' + (state.guests > 1 ? 's' : '')
      : 'Not attending';
    let html = '<div class="rsvp-summary-name">' + escapeHtml(state.name || 'Guest') + '</div>';
    html += '<div class="rsvp-summary-line"><strong>' + attendLine + '</strong></div>';
    if (state.side) html += '<div class="rsvp-summary-line">' + escapeHtml(state.side) + "'s side</div>";
    if (state.dietary) html += '<div class="rsvp-summary-line"><em>Dietary:</em> ' + escapeHtml(state.dietary) + '</div>';
    html += '<div class="rsvp-summary-line"><em>Email:</em> ' + escapeHtml(state.email) + '</div>';
    summary.innerHTML = html;
    setStep(3);
  });
  $('#btnBack3').addEventListener('click', () => setStep(2));
  $('#btnSubmit').addEventListener('click', async () => {
    const btn = $('#btnSubmit');
    btn.disabled = true; btn.innerHTML = 'Sending…';
    const payload = {
      name: state.name, email: state.email, phone: state.phone,
      attending: state.attending, guests: state.guests, side: state.side,
      ceremony: 'yes', reception: 'yes', dietary: state.dietary, note: state.note
    };
    try{
      const r = await fetch('api/rsvp.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Could not send.');
      confettiBurst();
      btn.innerHTML = state.attending === 'yes' ? 'Thank you — see you on 28 Nov! ' : 'Thank you — you\'ll be missed.';
      bumpTicker(j.guests);
      refreshLiveTicker();
      refreshProgress(j.guests);
      setTimeout(() => { btn.disabled = false; btn.innerHTML = 'Confirm RSVP <i class="fas fa-heart"></i>'; setStep(1); nameInp.value=''; statusEl.className='guest-status'; }, 4200);
    }catch(err){
      alert(err.message || 'Could not send RSVP.');
      btn.disabled = false; btn.innerHTML = 'Confirm RSVP <i class="fas fa-heart"></i>';
    }
  });
})();

/* ============ RSVP TICKER + PROGRESS + LIVE ============ */
const RSVP_TARGET = 200; // adjust when guest list uploaded
async function refreshTickerAndProgress(){
  try{
    const r = await fetch('api/rsvp.php', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    setTicker(j.guests || 0);
    refreshProgress(j.guests || 0);
  }catch(e){}
}
function setTicker(n){ const el = $('#ticker'); if (el) el.textContent = n; }
function bumpTicker(n){
  const el = $('#ticker'); if (!el) return;
  el.textContent = n;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}
let progressCurrent = 0;
function refreshProgress(n){
  const fill = $('#progressFill');
  const label = $('#progressLabel');
  if (!fill) return;
  const pct = Math.min(100, Math.round((n / RSVP_TARGET) * 100));
  fill.style.width = pct + '%';
  // Animate the number counting up
  const start = progressCurrent;
  const end = n;
  const dur = 900;
  const t0 = performance.now();
  function step(t){
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const cur = Math.round(start + (end - start) * eased);
    if (label) label.textContent = cur + ' of ' + RSVP_TARGET + ' guests confirmed · ' + Math.round((cur / RSVP_TARGET) * 100) + '%';
    if (p < 1) requestAnimationFrame(step);
    else progressCurrent = end;
  }
  requestAnimationFrame(step);
}
refreshTickerAndProgress();
setInterval(refreshTickerAndProgress, 30000);

/* ============ LIVE-ATTENDING TICKER (scrolling names) ============ */
async function refreshLiveTicker(){
  try{
    const r = await fetch('api/rsvp.php?names=1', { cache: 'no-store' });
    // API only returns counts publicly. For the ticker, we use fake names + real count.
    // Real names would require a public-names endpoint we haven't built for privacy.
    // Instead — display a rotating template of first-name variations.
  }catch(e){}
  const track = $('#liveTrack');
  if (!track) return;
  // Fetch real count and generate friendly ticker
  try{
    const r = await fetch('api/rsvp.php', { cache: 'no-store' });
    const j = await r.json();
    const items = [];
    // Show the count as ticker items
    if (j.accept > 0) {
      const seed = ['Kwame','Ama','Yaw','Akosua','Kojo','Efua','Nana','Adjoa','Kofi','Abena','Kwabena','Serwaa','Kwaku','Yaa'];
      for (let i = 0; i < Math.min(j.accept, 14); i++){
        const name = seed[i % seed.length];
        items.push(`<span class="rsvp-live-item"><i class="fas fa-heart"></i> <strong>${name}</strong> is coming</span>`);
      }
      items.push(`<span class="rsvp-live-item"><i class="fas fa-users"></i> <strong>${j.guests}</strong> guests expected</span>`);
    } else {
      items.push('<span class="rsvp-live-item"><i class="fas fa-heart"></i> Be the first to say yes</span>');
    }
    // duplicate for seamless loop
    const html = items.join('') + items.join('');
    track.innerHTML = html;
  }catch(e){}
}
refreshLiveTicker();
setInterval(refreshLiveTicker, 60000);

/* ============ CONFETTI ============ */
function confettiBurst(){
  const box = $('#confetti');
  if (!box) return;
  box.innerHTML = '';
  box.classList.add('on');
  const colors = ['#c9a24a','#d4b464','#7d8e6d','#a5b490','#f7efdd','#fff'];
  for (let i = 0; i < 90; i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (2.4 + Math.random() * 1.6) + 's';
    p.style.animationDelay = (Math.random() * 0.8) + 's';
    p.style.transform = 'rotate(' + (Math.random()*360) + 'deg)';
    if (Math.random() > 0.5) p.style.borderRadius = '50%';
    box.appendChild(p);
  }
  setTimeout(() => { box.classList.remove('on'); box.innerHTML = ''; }, 5200);
}

/* ============ SPARKLE BURST helper ============ */
function sparkleBurst(x, y, count){
  count = count || 10;
  const box = document.createElement('div');
  box.className = 'sparkle-burst';
  box.style.top = y + 'px'; box.style.left = x + 'px';
  document.body.appendChild(box);
  for (let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'sparkle-star';
    const angle = (i / count) * Math.PI * 2;
    const dist = 40 + Math.random() * 40;
    s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    s.style.animationDelay = (i * 0.03) + 's';
    const sc = 0.6 + Math.random() * 0.7;
    s.style.width = (8 * sc) + 'px'; s.style.height = (8 * sc) + 'px';
    box.appendChild(s);
  }
  setTimeout(() => box.remove(), 1400);
}

/* ============ ZELLE COPY ============ */
(function(){
  const btn = $('#zelleCopyBtn');
  const phoneEl = $('#zellePhone');
  const msg = $('#zelleCopied');
  if (!btn || !phoneEl) return;
  const phone = phoneEl.textContent.trim();
  btn.addEventListener('click', async (e) => {
    try{ await navigator.clipboard.writeText(phone); }
    catch(e){
      const ta = document.createElement('textarea');
      ta.value = phone; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); }catch(e){}
      document.body.removeChild(ta);
    }
    if (msg){ msg.classList.add('on'); setTimeout(() => msg.classList.remove('on'), 2400); }
    const r = btn.getBoundingClientRect();
    sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 14);
  });
})();

/* ============ CURRENCY CONVERTER (USD → GHS live rate) ============ */
(function(){
  const inp = $('#convUsd');
  const out = $('#convGhs');
  const rateEl = $('#convRate');
  if (!inp || !out) return;
  let rate = 15.5; // sensible default
  async function fetchRate(){
    try{
      const r = await fetch('https://open.er-api.com/v6/latest/USD');
      const j = await r.json();
      if (j && j.rates && j.rates.GHS){
        rate = j.rates.GHS;
        if (rateEl) rateEl.textContent = '1 USD ≈ ' + rate.toFixed(2) + ' GHS · live rate';
      }
    }catch(e){
      if (rateEl) rateEl.textContent = '1 USD ≈ ' + rate.toFixed(2) + ' GHS · approximate';
    }
    convert();
  }
  function convert(){
    const usd = parseFloat(inp.value) || 0;
    const ghs = usd * rate;
    out.textContent = ghs.toLocaleString('en-GB', { style:'currency', currency:'GHS', maximumFractionDigits:0 });
  }
  inp.addEventListener('input', convert);
  fetchRate();
})();

/* ============ WEATHER WIDGET ============ */
(function(){
  const icon = $('#weatherIcon');
  const temp = $('#weatherTemp');
  const desc = $('#weatherDesc');
  if (!temp) return;
  async function fetchWeather(){
    // North Brunswick NJ: lat 40.4501, lon -74.4646
    try{
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.45&longitude=-74.46&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America/New_York&start_date=2026-11-28&end_date=2026-11-28');
      const j = await r.json();
      let t, tMax, tMin, code, isDaily;
      const today = new Date();
      const wedding = new Date('2026-11-28T12:00:00-05:00');
      if (Math.abs(wedding - today) < 3 * 86400000){
        // Within 3 days — use current
        t = j.current?.temperature_2m;
        code = j.current?.weather_code;
      } else {
        // Use forecast for wedding day (may return null if too far out)
        tMax = j.daily?.temperature_2m_max?.[0];
        tMin = j.daily?.temperature_2m_min?.[0];
        code = j.daily?.weather_code?.[0];
        isDaily = true;
      }
      const wmap = {
        0: ['Clear sky','fa-sun'],
        1: ['Mostly clear','fa-sun'],
        2: ['Partly cloudy','fa-cloud-sun'],
        3: ['Overcast','fa-cloud'],
        45: ['Foggy','fa-smog'],
        48: ['Foggy','fa-smog'],
        51: ['Light drizzle','fa-cloud-rain'],
        53: ['Drizzle','fa-cloud-rain'],
        55: ['Heavy drizzle','fa-cloud-rain'],
        61: ['Light rain','fa-cloud-rain'],
        63: ['Rain','fa-cloud-showers-heavy'],
        65: ['Heavy rain','fa-cloud-showers-heavy'],
        71: ['Light snow','fa-snowflake'],
        73: ['Snow','fa-snowflake'],
        75: ['Heavy snow','fa-snowflake'],
        80: ['Rain showers','fa-cloud-showers-heavy'],
        81: ['Rain showers','fa-cloud-showers-heavy'],
        82: ['Heavy showers','fa-cloud-showers-heavy'],
        95: ['Thunderstorm','fa-bolt'],
      };
      const [descText, iconClass] = wmap[code] || ['Typical New Jersey November','fa-cloud-sun'];
      if (icon) icon.className = 'weather-icon fas ' + iconClass;
      if (isDaily && tMax != null){
        temp.textContent = Math.round(tMax) + '° / ' + Math.round(tMin) + '°C';
      } else if (t != null){
        temp.textContent = Math.round(t) + '°C';
      } else {
        temp.textContent = '~ 8°C';
      }
      desc.textContent = descText + ' expected on 28 November 2026';
      temp.classList.remove('weather-loading');
    }catch(e){
      if (icon) icon.className = 'weather-icon fas fa-cloud-sun';
      temp.textContent = '~ 8°C';
      desc.textContent = 'Late November in NJ · typically 5–10°C, chance of first snow';
      temp.classList.remove('weather-loading');
    }
  }
  fetchWeather();
})();

/* ============ WISHES REAL-TIME POLLING ============ */
const wishList = $('#wishList');
let wishLastAt = 0;
function renderWish(w, animate){
  const el = document.createElement('div');
  el.className = 'wish-card' + (animate ? ' wish-new' : '');
  el.innerHTML = `<div class="wish-msg">${escapeHtml(w.msg)}</div><div class="wish-author">— ${escapeHtml(w.name)}</div>`;
  return el;
}
async function refreshWishes(){
  if (!wishList) return;
  try{
    const r = await fetch('api/wishes.php', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    const items = j.items || [];
    const newItems = items.filter(w => (w.at || 0) > wishLastAt);
    if (wishLastAt === 0){
      wishList.innerHTML = '';
      items.forEach(w => wishList.appendChild(renderWish(w, false)));
    } else if (newItems.length){
      newItems.reverse().forEach(w => wishList.insertBefore(renderWish(w, true), wishList.firstChild));
      while (wishList.children.length > 40) wishList.removeChild(wishList.lastChild);
    }
    wishLastAt = j.lastAt || wishLastAt;
  }catch(e){}
}
$('#wishSubmit')?.addEventListener('click', async () => {
  const name = $('#wishName').value.trim();
  const msg  = $('#wishMsg').value.trim();
  if (!name || !msg){ alert('Please enter your name and a message.'); return; }
  const btn = $('#wishSubmit');
  const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Sending…';
  try{
    const r = await fetch('api/wishes.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, msg }) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Could not send.');
    $('#wishName').value = '';
    $('#wishMsg').value = '';
    btn.innerHTML = 'Thank you — God bless!';
    refreshWishes();
    setTimeout(() => { btn.disabled = false; btn.innerHTML = old; }, 2400);
  }catch(err){ alert(err.message || 'Could not send.'); btn.disabled = false; btn.innerHTML = old; }
});
refreshWishes();
setInterval(refreshWishes, 30000);

/* ============ VOICE TRIBUTE RECORDER ============ */
(function(){
  const mic = $('#voiceMic'); const timer = $('#voiceTimer'); const hint = $('#voiceHint');
  const recBtn = $('#voiceRecordBtn'); const stopBtn = $('#voiceStopBtn'); const sendBtn = $('#voiceSendBtn');
  const preview = $('#voicePreview'); const nameInp = $('#voiceName'); const list = $('#voiceList');
  const helpEl = $('#voiceHelp'); const helpTitle = $('#voiceHelpTitle'); const helpSteps = $('#voiceHelpSteps');
  const retryBtn = $('#voiceRetryBtn'); const useTextBtn = $('#voiceUseTextBtn');
  if (!mic) return;
  let recorder = null, chunks = [], blob = null, stream = null, startedAt = 0, tickInt = null;

  /* Detect the running browser + environment so we can offer specific instructions
     for enabling the microphone. Falls back to a generic guide if unknown. */
  function detectBrowser(){
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isInApp = /(FBAN|FBAV|Instagram|Line\/|WhatsApp|Snapchat|Twitter|TikTok)/i.test(ua);
    // Order matters — Edge/Opera contain "Chrome"
    let name = 'other';
    if (/Edg\//i.test(ua)) name = 'edge';
    else if (/OPR\//i.test(ua)) name = 'opera';
    else if (/SamsungBrowser/i.test(ua)) name = 'samsung';
    else if (/Firefox/i.test(ua)) name = 'firefox';
    else if (/Chrome/i.test(ua)) name = 'chrome';
    else if (/Safari/i.test(ua)) name = 'safari';
    return {name, isIOS, isAndroid, isInApp};
  }

  /* Fill the help panel with browser-specific instructions and show it.
     Also hides the record controls so it's clear what to do next. */
  function showHelp(title, steps){
    if (!helpEl) return;
    helpTitle.textContent = title;
    helpSteps.innerHTML = '';
    steps.forEach(s => { const li = document.createElement('li'); li.innerHTML = s; helpSteps.appendChild(li); });
    helpEl.hidden = false;
    // Dim the record button so the eye is drawn to Try Again instead
    recBtn.disabled = true;
  }
  function hideHelp(){
    if (helpEl) helpEl.hidden = true;
    recBtn.disabled = false;
  }

  /* Compose the browser-specific "how to enable mic" steps. */
  function permissionDeniedSteps(){
    const b = detectBrowser();
    if (b.isInApp){
      return [
        "You're viewing this inside another app (like Facebook or Instagram) which blocks the microphone.",
        "Tap the menu (usually <b>&#8942;</b> or <b>&#8943;</b>) at the top of that app &rarr; <b>Open in Browser</b> (Safari on iPhone, Chrome on Android).",
        "Once the page opens in a real browser, come back to the Voice Tribute tab and try again."
      ];
    }
    if (b.isIOS){
      return [
        "Tap the <b>aA</b> icon on the left of the address bar.",
        "Choose <b>Website Settings</b>.",
        "Set <b>Microphone</b> to <b>Allow</b>, then reload the page."
      ];
    }
    if (b.isAndroid){
      return [
        "Tap the <b>&#128274; lock icon</b> in the address bar.",
        "Tap <b>Permissions</b> &rarr; <b>Microphone</b> &rarr; <b>Allow</b>.",
        "Reload the page and try again."
      ];
    }
    // Desktop
    if (b.name === 'firefox'){
      return [
        "Click the <b>shield</b> or <b>microphone</b> icon on the left of the address bar.",
        "Choose <b>Allow</b> for Microphone.",
        "Reload the page (Ctrl/Cmd + R) and click <b>Try Again</b>."
      ];
    }
    if (b.name === 'safari'){
      return [
        "In the top menu, click <b>Safari</b> &rarr; <b>Settings for This Website</b>.",
        "Set <b>Microphone</b> to <b>Allow</b>.",
        "Reload the page and click <b>Try Again</b>."
      ];
    }
    // Chrome / Edge / Opera / Samsung / other
    return [
      "Click the <b>&#128274; lock icon</b> on the left of the address bar.",
      "Set <b>Microphone</b> to <b>Allow</b>.",
      "Reload the page (Ctrl/Cmd + R) and click <b>Try Again</b>."
    ];
  }

  async function startRec(){
    hideHelp();
    // Pre-flight checks so we surface useful errors before hitting getUserMedia
    if (!window.isSecureContext){
      hint.textContent = 'Voice recording needs a secure (HTTPS) connection.';
      showHelp('Secure connection required', [
        'This page must be opened over HTTPS for the microphone to work.',
        'Make sure the URL in the address bar starts with <b>https://</b>.'
      ]);
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      hint.textContent = 'Your browser does not support voice recording.';
      showHelp('Browser not supported', [
        'Try opening this page in <b>Chrome</b>, <b>Safari</b>, or <b>Firefox</b>.',
        "If you're in a social-media in-app browser (Facebook, Instagram, etc.), tap the menu (<b>&#8942;</b>) &rarr; <b>Open in Browser</b>."
      ]);
      return;
    }
    // Check current permission state where possible (skip errors silently)
    try{
      if (navigator.permissions && navigator.permissions.query){
        const status = await navigator.permissions.query({ name: 'microphone' });
        if (status.state === 'denied'){
          hint.textContent = 'Microphone access is blocked.';
          showHelp('Microphone blocked', permissionDeniedSteps());
          return;
        }
      }
    }catch(e){ /* some browsers reject the 'microphone' permission query — ignore */ }

    try{ stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch(e){
      const name = (e && e.name) || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError'){
        hint.textContent = 'Microphone access was blocked.';
        showHelp('Microphone blocked', permissionDeniedSteps());
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError'){
        hint.textContent = 'No microphone was found on this device.';
        showHelp('No microphone detected', [
          'Plug in or enable a microphone, then click <b>Try Again</b>.',
          'On a laptop, check that no other app has taken over the built-in mic.'
        ]);
      } else if (name === 'NotReadableError' || name === 'TrackStartError'){
        hint.textContent = 'Your microphone is being used by another app.';
        showHelp('Microphone in use', [
          'Close any other app that might be using the mic (Zoom, Teams, Meet, WhatsApp, etc.).',
          'Then click <b>Try Again</b>.'
        ]);
      } else if (name === 'AbortError'){
        hint.textContent = 'Recording was interrupted.';
        showHelp('Recording interrupted', [
          'Something interrupted the microphone. Please click <b>Try Again</b>.'
        ]);
      } else {
        hint.textContent = 'Could not start recording.';
        showHelp('Could not start recording', [
          'Please click <b>Try Again</b>. If the problem persists, try a different browser.',
          "Or use the <b>Written Wish</b> tab instead — your kind words matter just as much."
        ]);
      }
      return;
    }
    chunks = []; blob = null;
    const mimeOptions = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'];
    let mime = '';
    for (const m of mimeOptions){ if (MediaRecorder.isTypeSupported(m)){ mime = m; break; } }
    recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      blob = new Blob(chunks, { type: mime || 'audio/webm' });
      preview.src = URL.createObjectURL(blob);
      preview.hidden = false;
      stream.getTracks().forEach(t => t.stop());
      sendBtn.disabled = false;
      hint.textContent = 'Recorded. Add your name and tap Send.';
    };
    recorder.start();
    mic.classList.add('recording');
    startedAt = Date.now();
    tickInt = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      timer.textContent = `0:${String(s).padStart(2,'0')} / 0:30`;
      if (s >= 30) stopRec();
    }, 250);
    recBtn.disabled = true; stopBtn.disabled = false; sendBtn.disabled = true;
    hint.textContent = 'Recording… tap Stop when done.';
  }
  function stopRec(){
    if (!recorder) return;
    try{ recorder.stop(); }catch(e){}
    mic.classList.remove('recording');
    clearInterval(tickInt); tickInt = null;
    recBtn.disabled = false; stopBtn.disabled = true;
  }
  async function sendRec(){
    if (!blob) return;
    const name = nameInp.value.trim();
    if (!name){ alert('Please add your name.'); return; }
    sendBtn.disabled = true; sendBtn.innerHTML = 'Sending…';
    const form = new FormData();
    form.append('audio', blob, 'tribute.webm');
    form.append('name', name);
    try{
      const r = await fetch('api/voice.php', { method:'POST', body: form });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Upload failed');
      hint.textContent = 'Thank you! Your tribute has been sent for review.';
      sendBtn.innerHTML = 'Sent — awaiting approval';
      timer.textContent = '0:00 / 0:30';
      preview.hidden = true; blob = null;
      nameInp.value = '';
      setTimeout(() => { sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send'; sendBtn.disabled = true; hint.textContent = 'Tap the microphone to record another.'; }, 3200);
    }catch(err){
      alert(err.message || 'Could not send.');
      sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send'; sendBtn.disabled = false;
    }
  }
  mic.addEventListener('click', () => { if (!recorder || recorder.state === 'inactive') startRec(); else stopRec(); });
  recBtn.addEventListener('click', startRec);
  stopBtn.addEventListener('click', stopRec);
  sendBtn.addEventListener('click', sendRec);

  /* Help-panel actions */
  if (retryBtn) retryBtn.addEventListener('click', () => { hideHelp(); startRec(); });
  if (useTextBtn) useTextBtn.addEventListener('click', () => {
    hideHelp();
    // Switch to the Written Wish tab
    const writtenTab = document.querySelector('.wish-tab[data-panel="written"]');
    const voiceTab   = document.querySelector('.wish-tab[data-panel="voice"]');
    const writtenPanel = document.querySelector('.wish-panel[data-panel="written"]');
    const voicePanel   = document.querySelector('.wish-panel[data-panel="voice"]');
    if (writtenTab && voiceTab && writtenPanel && voicePanel){
      writtenTab.classList.add('on'); voiceTab.classList.remove('on');
      writtenPanel.classList.add('on'); voicePanel.classList.remove('on');
      writtenPanel.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });

  async function refreshTributes(){
    if (!list) return;
    try{
      const r = await fetch('api/voice.php', { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      list.innerHTML = '';
      (j.items || []).forEach(v => {
        if (v.status !== 'approved') return;
        const el = document.createElement('div');
        el.className = 'voice-tribute';
        el.innerHTML = `
          <div class="voice-tribute-name">${escapeHtml(v.name)}</div>
          <audio controls src="${escapeHtml(v.file)}"></audio>
          ${v.note ? '<div class="voice-tribute-note">'+escapeHtml(v.note)+'</div>' : ''}
        `;
        list.appendChild(el);
      });
    }catch(e){}
  }
  refreshTributes();
  setInterval(refreshTributes, 45000);
})();

/* ============ PHOTO BOOTH — REMOVED ============ */
/* (Section removed 2026-07-05 per Edmund's feedback: camera permission was
   unreliable across browsers/in-app WebViews.) */
if (false) (function(){
  const video = $('#boothVideo');
  const canvas = $('#boothCanvas');
  const placeholder = $('#boothPlaceholder');
  const startBtn = $('#boothStart');
  const captureBtn = $('#boothCapture');
  const retakeBtn = $('#boothRetake');
  const downloadBtn = $('#boothDownload');
  const shareBtn = $('#boothShare');
  if (!video) return;
  let stream = null; let captured = null;

  function boothMessage(text, isError){
    placeholder.style.display = 'flex';
    const p = placeholder.querySelector('p');
    p.textContent = text;
    const icon = placeholder.querySelector('i');
    if (icon) icon.className = isError ? 'fas fa-exclamation-triangle' : 'fas fa-camera';
    if (icon) icon.style.color = isError ? '#e0a040' : 'var(--gold-bright)';
  }

  async function startCamera(){
    // Pre-flight checks BEFORE calling getUserMedia so we surface useful errors
    if (!window.isSecureContext){
      boothMessage('Camera requires a secure (HTTPS) connection. Please open the site via https://', true);
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      boothMessage('Your browser does not support the camera API. Try Chrome, Safari, or Firefox.', true);
      return;
    }
    // Check current permission state (Chrome/Edge)
    try{
      if (navigator.permissions && navigator.permissions.query){
        const status = await navigator.permissions.query({ name: 'camera' });
        if (status.state === 'denied'){
          boothMessage('Camera access was blocked. Tap the lock icon in your browser bar → Site settings → Camera → Allow, then reload.', true);
          return;
        }
      }
    }catch(e){ /* not all browsers support the permissions API for camera; continue */ }

    boothMessage('Requesting camera…');
    // Try user-facing camera first with sensible constraints
    const attempts = [
      { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false },
      { video: { facingMode: 'user' }, audio: false },
      { video: true, audio: false }
    ];
    let lastErr = null;
    for (const constraints of attempts){
      try{
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      }catch(e){ lastErr = e; }
    }
    if (!stream){
      const name = (lastErr && lastErr.name) || '';
      let msg = 'Could not open the camera.';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError'){
        msg = 'You blocked camera access. Tap the lock icon in the address bar → Site settings → Camera → Allow, then reload.';
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError'){
        msg = 'No camera was found on this device.';
      } else if (name === 'NotReadableError' || name === 'TrackStartError'){
        msg = 'Camera is being used by another app. Close it and try again.';
      } else if (name === 'OverconstrainedError'){
        msg = 'Camera does not support the requested settings.';
      } else if (name === 'SecurityError'){
        msg = 'Camera blocked by browser security. Open the page directly, not inside another app or embedded frame.';
      }
      boothMessage(msg, true);
      return;
    }

    try{
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.style.display = 'block';
      await video.play();
      placeholder.style.display = 'none';
      startBtn.disabled = true;
      captureBtn.disabled = false;
    }catch(e){
      boothMessage('Camera opened but could not start playback. Try again.', true);
    }
  }
  function capture(){
    if (!video.videoWidth) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // mirror video horizontally to match preview
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height); ctx.restore();
    // overlay the frame (matches SVG in the DOM)
    drawFrame(ctx, canvas.width, canvas.height);
    canvas.style.display = 'block'; video.style.display = 'none';
    captureBtn.disabled = true; retakeBtn.disabled = false; downloadBtn.disabled = false; shareBtn.disabled = false;
    captured = canvas.toDataURL('image/jpeg', 0.92);
  }
  function drawFrame(ctx, w, h){
    // Inset gold border
    const pad = w * 0.03;
    ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = w * 0.005;
    ctx.strokeRect(pad, pad, w - pad*2, h - pad*2);
    ctx.strokeStyle = '#8a6a23'; ctx.lineWidth = w * 0.002;
    ctx.strokeRect(pad*1.6, pad*1.6, w - pad*3.2, h - pad*3.2);
    // Top: "Eric & Sherita" in serif
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = w * 0.008;
    ctx.textAlign = 'center';
    ctx.font = 'italic 700 ' + (w * 0.075) + 'px "Cormorant Garamond", serif';
    ctx.strokeText('Eric & Sherita', w/2, h * 0.11);
    ctx.fillText('Eric & Sherita', w/2, h * 0.11);
    // Bottom: date
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = w * 0.006;
    ctx.font = '600 ' + (w * 0.028) + 'px "Cinzel", serif';
    ctx.strokeText('28 NOVEMBER 2026 · NEW JERSEY', w/2, h * 0.94);
    ctx.fillText('28 NOVEMBER 2026 · NEW JERSEY', w/2, h * 0.94);
  }
  function retake(){
    canvas.style.display = 'none'; video.style.display = 'block';
    captureBtn.disabled = false; retakeBtn.disabled = true; downloadBtn.disabled = true; shareBtn.disabled = true;
    captured = null;
  }
  function download(){
    if (!captured) return;
    const a = document.createElement('a');
    a.href = captured; a.download = 'ericsherita-photobooth.jpg'; a.click();
  }
  async function share(){
    if (!captured) return;
    try{
      const blob = await (await fetch(captured)).blob();
      const file = new File([blob], 'ericsherita.jpg', { type:'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })){
        await navigator.share({ files: [file], title: 'Eric & Sherita Photo Booth', text: 'From Eric & Sherita\'s wedding!' });
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent('From Eric & Sherita\'s photo booth: ' + location.href), '_blank');
      }
    }catch(e){}
  }
  startBtn?.addEventListener('click', startCamera);
  captureBtn?.addEventListener('click', capture);
  retakeBtn?.addEventListener('click', retake);
  downloadBtn?.addEventListener('click', download);
  shareBtn?.addEventListener('click', share);
})();

/* ============ TWI TRANSLATIONS ============ */
const I18N = {
  'You Are Invited': 'Woahyɛ Wo Nsa',
  'to the wedding of': 'ma ayeforohyia a ɛfa',
  'Scroll': 'Twe ase',
  'Order of the Day': 'Da No Nhyehyɛe',
  'The Day in Motion': 'Da No Nkɔso',
  'From the first prayer at noon to the last dance under starlight — the flow of the day, in one glance.': 'Ɛfiri anɔpahyia mpaebɔ a ɛdi kan kɔsi asa a ɛtwa toɔ wɔ anadwo mu — da mu nsɛm nyinaa wɔ baabi.',
  'Guest Arrival': 'Ahɔhoɔ Bra',
  'Ceremony Begins': 'Dwumadi No Fi Ase',
  'Ceremony Ends · Photographs': 'Dwumadi Wie · Mfoni',
  'Reception at The Sapphire Grand': 'Ahɔhoɔ Gyeɛ wɔ The Sapphire Grand',
  'Dinner · Speeches · Cake': 'Anadwo Aduane · Nsɛm · Keeki',
  'Open Floor · Dancing': 'Asaeɛ · Asa',
  'Send-Off': 'Nnyaeɛ',
  'The Two Venues': 'Baabi Mmienu',
  'Where It Happens': 'Baabi a Ɛbɛba',
  'Ceremony · 12PM': 'Dwumadi · 12PM',
  'Reception · 5PM': 'Ahɔhoɔ Gyeɛ · 5PM',
  'Get Directions': 'Nya Ɛkwan',
  'Dress code': 'Ntadeɛ',
  'To be shared': 'Yɛbɛka akyerɛ',
  'Where to Stay': 'Baabi a Wobɛtena',
  'Reception Venue': 'Ahɔhoɔ Gyeɛ Baabi',
  'BOOK NOW': 'YƐ NHYEHYƐE SEISEI',
  'Save Your Seat': 'Fa Wo Nkonnwa Sie',
  "We're so looking forward to your presence. Please let us know if you'll be joining us — the sooner, the better.": 'Yɛpɛ sɛ wobɛka yɛn ho. Yɛsrɛ wo, ma yɛnhu sɛ wobɛba anaa — na ɛyɛ sɛ wobɛka ntɛm.',
  'Kindly Confirm': 'Yɛsrɛ Wo, Bɔ Amaneɛ',
  'guests are already looking forward to the day': 'ahɔhoɔ atwɛn da no dedaw',
  'Enter Your Full Name': 'Kyerɛw Wo Din Nyinaa',
  'Continue': 'Kɔ so',
  'Will You Be Attending?': 'Woreba Anaa?',
  'Joyfully Yes': 'Aane, Anigyeɛ mu',
  'Sadly No': 'Awerɛhoɔ mu, Dabi',
  'Number of Guests': 'Ahɔhoɔ Dodow',
  'Whose Side': 'Hena Fam',
  "Bride's (Sherita)": 'Ayeforo (Sherita) fam',
  "Groom's (Eric)": 'Ayefo (Eric) fam',
  'A friend to both': 'Baanu nyinaa adamfo',
  'Dietary Requirements (Optional)': 'Aduane a Wompɛ (Sɛ wopɛ)',
  'A Short Note (Optional)': 'Nsɛm Tia (Sɛ wopɛ)',
  'Email': 'Email',
  'Phone (Optional)': 'Telefon (Sɛ wopɛ)',
  'Back': 'San kɔ',
  'Review': 'Hwɛ',
  'Confirm RSVP': 'Bɔ Amaneɛ',
  'Bless the Couple': 'Hyira Ayeforohyia No',
  'Gift Registry': 'Akyɛdeɛ Krataa',
  '"Your presence is our greatest gift. But if you wish to bless us further, we are grateful for your generosity as we begin this new chapter together." Our Zelle details are below.': '"Wo ba a woaba yɛ yɛn akyɛdeɛ kɛseɛ paa. Nanso sɛ wopɛ sɛ wohyira yɛn bio a, yɛda wo ase pii wɔ wʼadom yi ho, ɛberɛ a yɛrehyɛ asetena foforɔ yi ase." Yɛn Zelle nsɛm no wɔ ase.',
  'Copy': 'Kɔpi',
  'Copied to clipboard': 'Wɔakɔpi',
  'Thank you, with all our hearts': 'Yɛda wo ase, firi yɛn akoma nyinaa mu',
  'Currency Converter': 'Sika Sesa',
  'A Word From You': 'Wo Nsɛm',
  'Wishes & Blessings': 'Nhyira & Mpaebɔ',
  'Leave a written wish, or record a 30-second voice blessing for the couple.': 'Kyerɛw nhyira, anaa yi ne nne 30-second mma ayeforohyia no.',
  'Written Wish': 'Nhyira A Wɔakyerɛw',
  'Voice Tribute': 'Nne Nhyira',
  'Send My Wish': 'Mena Me Nhyira',
  'Tap the microphone to start. You have 30 seconds.': 'Bɔ mikrophone no fa ase. Wo wɔ 30 seconds.',
  'Record': 'Yi',
  'Stop': 'Gyae',
  'Send': 'Mena',
  'Photo Booth': 'Mfoni Booth',
  'Frame Your Selfie': 'Yɛ Wo Selfie Ho Hyia',
  'Take a photo with the couple\'s branded frame and share with everyone.': 'Twa mfoni fa ayeforohyia no adwuma ho hyia mu na fa kyerɛ obiara.',
  'Start Camera': 'Bue Kamera',
  'Capture': 'Twa',
  'Retake': 'Twa bio',
  'Download': 'Kyɛre',
  'Share': 'Kyɛ',
  'Wedding Day Weather': 'Ayeforohyia Da Wim Tebea',
  "Travelling In?": 'Woreba Baabi Foforo?',
  'Diaspora Guide': 'Amanaman Adwennwan',
  'A few practical notes for guests flying in from Ghana, UK, and further afield.': 'Nsɛm a ɛbɛboa ahɔhoɔ a wɔfiri Ghana, UK, ne baabi foforo bɛba.',
  'Airports & Transport': 'Wimhyɛn Baabi & Akwantuo',
  'Weather in New Jersey': 'New Jersey Wim Tebea',
  'Packing & TSA': 'Nneɛma Anhyehyɛe & TSA',
  'Little Things That Matter': 'Nneɛma Nketewa A Ɛho Hia',
  'Your Table Assignment': 'Wo Pon',
  'Your table will be shared closer to the day.': 'Wɔbɛka wo pon akyerɛ wo bere a da no rebɛn.',
  'For Enquiries': 'Sɛ Wopɛ Sɛ Wubisa',
  'Speak to Us': 'Ka Kyerɛ Yɛn',
  "For directions, RSVP questions, or anything else about the day — please don't hesitate to reach out.": 'Sɛ wopɛ akwan, RSVP ho nsɛmmisa, anaa biribi foforo a ɛfa da no ho a — yɛsrɛ wo, twerɛ yɛn.',
  'Officiating Pastor': 'Ɔsɔfoɔ',
  'Family Coordinator': 'Abusua Ho Boafo',
  'Call': 'Frɛ',
  'WhatsApp': 'WhatsApp',
  'Strictly by Invitation': 'Sɛ wɔyɛɛ wo nsa nkoara na wobɛba',
};
(function(){
  const btns = $$('.lang-toggle button');
  const stored = localStorage.getItem('ericsherita:lang') || 'en';
  function apply(lang){
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('ericsherita:lang', lang);
    btns.forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
    $$('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n-orig') || el.textContent.trim();
      el.setAttribute('data-i18n-orig', key);
      if (lang === 'tw'){
        const t = I18N[key];
        if (t) el.textContent = t;
      } else {
        el.textContent = key;
      }
    });
  }
  btns.forEach(b => b.addEventListener('click', () => apply(b.dataset.lang)));
  apply(stored);
})();

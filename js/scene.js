/* VERDÉ — scena din fundal: copaci în ceață, frunziș, particule în lumină, ploaie, parallax și sunet ambient */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var Art = window.VerdeArt;
  function $(id) { return document.getElementById(id); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  function setup(c) {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var w = c.clientWidth, h = c.clientHeight;
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    var ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  /* ---------- Copaci în ceață (3 rânduri de adâncime) ---------- */
  function paintTrees() {
    var c = $("trees"); if (!c) return;
    var s = setup(c), ctx = s.ctx, w = s.w, h = s.h, r = Art.rng(42);
    var rows = [
      { n: Math.round(w / 38), wMin: 4, wMax: 10, col: "rgba(52,84,66,0.55)", canopy: "rgba(40,72,54,0.5)", fog: 0.16 },
      { n: Math.round(w / 90), wMin: 9, wMax: 20, col: "rgba(26,48,36,0.85)", canopy: "rgba(22,44,32,0.8)", fog: 0.1 },
      { n: Math.round(w / 220), wMin: 22, wMax: 46, col: "rgba(9,18,13,0.95)", canopy: "rgba(10,22,15,0.92)", fog: 0 }
    ];
    rows.forEach(function (row, ri) {
      for (var i = 0; i < row.n; i++) {
        var x = r() * w, tw = row.wMin + r() * (row.wMax - row.wMin);
        if (ri === 2 && x > w * 0.28 && x < w * 0.72) x = r() < 0.5 ? r() * w * 0.25 : w * (0.75 + r() * 0.25);
        var lean = (r() - 0.5) * 0.04 * h;
        ctx.beginPath();
        ctx.moveTo(x - tw / 2, h); ctx.lineTo(x - tw * 0.32 + lean, -10); ctx.lineTo(x + tw * 0.32 + lean, -10); ctx.lineTo(x + tw / 2, h); ctx.closePath();
        ctx.fillStyle = row.col; ctx.fill();
        /* ramuri subțiri */
        ctx.strokeStyle = row.col; ctx.lineWidth = Math.max(1, tw * 0.15);
        for (var b = 0; b < 3; b++) {
          var by = h * (0.08 + r() * 0.35), dir = r() < 0.5 ? -1 : 1;
          ctx.beginPath(); ctx.moveTo(x + lean * (1 - by / h), by); ctx.quadraticCurveTo(x + dir * tw * 2, by - 20, x + dir * tw * (3 + r() * 3), by - 40 - r() * 30); ctx.stroke();
        }
      }
      /* coroane în partea de sus */
      for (var k = 0; k < row.n * 3; k++) {
        var cx = r() * w, cy = r() * h * (0.12 + ri * 0.05), rad = (30 + r() * 70) * (1 + ri * 0.6);
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fillStyle = row.canopy; ctx.fill();
      }
      if (row.fog) {
        var g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(150,190,160," + row.fog * 0.4 + ")"); g.addColorStop(0.55, "rgba(170,205,180," + row.fog * 0.6 + ")"); g.addColorStop(1, "rgba(120,160,135," + row.fog + ")");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }
    });
    /* pământul și lumina de jos */
    var gg = ctx.createLinearGradient(0, h * 0.7, 0, h);
    gg.addColorStop(0, "rgba(8,16,11,0)"); gg.addColorStop(1, "rgba(8,16,11,0.9)");
    ctx.fillStyle = gg; ctx.fillRect(0, h * 0.7, w, h * 0.3);
  }

  /* ---------- Frunziș pe margini ---------- */
  function fernFrond(ctx, x, y, ang, len, bend, c1, c2, r) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    var end = [x + Math.sin(ang) * len + bend * len * 0.4 * ca, y - Math.cos(ang) * len + bend * len * 0.4 * sa];
    var mid = [x + Math.sin(ang) * len * 0.55, y - Math.cos(ang) * len * 0.55];
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mid[0], mid[1], end[0], end[1]); ctx.strokeStyle = c1; ctx.lineWidth = 2; ctx.stroke();
    for (var t = 0.08; t < 1; t += 0.04) {
      var u = 1 - t, px = u * u * x + 2 * u * t * mid[0] + t * t * end[0], py = u * u * y + 2 * u * t * mid[1] + t * t * end[1];
      var d = Math.atan2(end[0] - mid[0] + (mid[0] - x) * u, (mid[1] - end[1]) + (y - mid[1]) * u);
      for (var side = -1; side <= 1; side += 2)
        Art.paintLeaf(ctx, Art.leafGeom(px, py, d + side * 1.15, len * 0.17 * (1 - t * 0.7), len * 0.022, "lance", side * 0.3), c1, c2, { gloss: 0.04, rib: false });
    }
  }

  function paintFoliage(id, side, seed, palette, density) {
    var c = $(id); if (!c) return;
    var s = setup(c), ctx = s.ctx, w = s.w, h = s.h, r = Art.rng(seed);
    var edgeX = side < 0 ? 0 : w, n = Math.round(9 * density);
    for (var i = 0; i < n; i++) {
      var y = h * (0.15 + r() * 0.95), x = edgeX - side * r() * w * 0.12;
      var ang = side * -(0.55 + r() * 0.9), len = Math.min(w * 1.1, h * 0.55) * (0.5 + r() * 0.6);
      var col = palette[Math.floor(r() * palette.length)];
      var kind = r();
      if (kind < 0.45) fernFrond(ctx, x, y, ang, len, side * -0.6, col[0], col[1], r);
      else if (kind < 0.8) {
        for (var k = 0; k < 4; k++) Art.paintLeaf(ctx, Art.leafGeom(x, y, ang + (k - 1.5) * 0.25, len * (0.55 + r() * 0.3), len * 0.13, "lance", side * -0.35), col[0], col[1], { gloss: 0.05, ribColor: "rgba(0,0,0,0.25)" });
      } else {
        Art.paintLeaf(ctx, Art.leafGeom(x, y, ang, len * 0.7, len * 0.3, "heart", side * -0.3), col[0], col[1], { gloss: 0.05, ribW: 2 });
      }
    }
  }

  function paintFront(id, side, seed) {
    var c = $(id); if (!c) return;
    var s = setup(c), ctx = s.ctx, w = s.w, h = s.h, r = Art.rng(seed);
    var edgeX = side < 0 ? 0 : w;
    for (var i = 0; i < 5; i++) {
      var y = h * (0.35 + r() * 0.7), ang = side * -(0.4 + r() * 0.9), len = Math.min(w * 1.2, h * 0.9) * (0.6 + r() * 0.4);
      Art.paintLeaf(ctx, Art.leafGeom(edgeX - side * r() * w * 0.1, y, ang, len, len * (0.18 + r() * 0.12), r() < 0.5 ? "lance" : "heart", side * -0.3),
        "#0A1A10", "#1B3A24", { gloss: 0.03, ribColor: "rgba(0,0,0,0.35)", ribW: 2 });
    }
  }

  function paintAll() {
    paintTrees();
    var small = window.innerWidth < 760;
    var pal = [["#173424", "#2C5A3A"], ["#1B3B28", "#36694A"], ["#14301F", "#285034"]];
    paintFoliage("foliage-left", -1, 7, pal, small ? 0.7 : 1);
    paintFoliage("foliage-right", 1, 19, pal, small ? 0.7 : 1);

  }

  /* ---------- Particule în lumină ---------- */
  var motes = [], ms = null;
  function initMotes() {
    var c = $("motes"); if (!c) return;
    ms = setup(c); motes = [];
    var n = Math.min(32, Math.round(ms.w / 40));
    for (var i = 0; i < n; i++) motes.push(newMote(true));
  }
  function newMote(anywhere) {
    var gold = Math.random() < 0.18;
    return {
      x: Math.random() * ms.w * (gold ? 1 : 0.75), y: anywhere ? Math.random() * ms.h : ms.h + 10,
      r: gold ? 1.2 + Math.random() * 1.4 : 0.5 + Math.random() * 1.3,
      vx: (Math.random() - 0.3) * 0.15, vy: -(0.05 + Math.random() * 0.18),
      ph: Math.random() * 6.28, sp: 0.01 + Math.random() * 0.02, gold: gold
    };
  }
  function drawMotes(step) {
    if (!ms) return;
    var ctx = ms.ctx; ctx.clearRect(0, 0, ms.w, ms.h);
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      if (step) { m.x += m.vx + Math.sin(m.ph) * 0.12; m.y += m.vy; m.ph += m.sp; if (m.y < -10 || m.x > ms.w + 10) motes[i] = m = newMote(false); }
      var a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(m.ph * 2))) * (m.gold ? 0.75 : 0.45);
      var g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
      g.addColorStop(0, m.gold ? "rgba(240,215,150," + a + ")" : "rgba(225,240,220," + a + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* ---------- Ploaie ---------- */
  var drops = [], rs = null, rainOn = store("verde-rain") === "1";
  function initRain() {
    var c = $("rain"); if (!c) return;
    rs = setup(c); drops = [];
    var n = Math.min(220, Math.round(rs.w / 7));
    for (var i = 0; i < n; i++) drops.push(newDrop(Math.random() * rs.h));
  }
  function newDrop(y) {
    var d = Math.random();
    return { x: Math.random() * (rs.w + 200) - 100, y: y === undefined ? -30 : y, len: 9 + d * 20, v: 6 + d * 10, a: 0.05 + d * 0.16, w: d > 0.9 ? 1.3 : 0.9 };
  }
  function drawRain(step) {
    if (!rs) return;
    var ctx = rs.ctx; ctx.clearRect(0, 0, rs.w, rs.h); ctx.lineCap = "round";
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      ctx.strokeStyle = "rgba(210,232,218," + d.a.toFixed(3) + ")"; ctx.lineWidth = d.w;
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 0.16 * d.len, d.y + d.len); ctx.stroke();
      if (step) { d.y += d.v; d.x -= 0.16 * d.v; if (d.y > rs.h) drops[i] = newDrop(); }
    }
  }

  /* ---------- Parallax (mouse + scroll) ---------- */
  var layers = [], px = 0, py = 0, tx = 0, ty = 0;
  function collectLayers() {
    layers = Array.prototype.map.call(document.querySelectorAll(".layer[data-depth]"), function (el) { return { el: el, d: parseFloat(el.getAttribute("data-depth")) }; });
  }
  function applyParallax() {
    px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    var sc = Math.min(window.scrollY || 0, 1600);
    var base = document.documentElement.getAttribute("data-view") === "acasa" ? 0 : 0.45;
    document.documentElement.style.setProperty("--scrim", Math.min(0.9, base + (sc / 650) * (0.9 - base)).toFixed(3));
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      L.el.style.transform = "translate3d(" + (-px * L.d * 22).toFixed(2) + "px," + (-py * L.d * 14 - sc * L.d * 0.045).toFixed(2) + "px,0)";
    }
  }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    tx = e.clientX / window.innerWidth * 2 - 1; ty = e.clientY / window.innerHeight * 2 - 1;
  }, { passive: true });

  /* ---------- Bucla de animație ---------- */
  var last = 0, running = true;
  function loop(ts) {
    if (!running) return;
    if (ts - last > 32) {
      drawMotes(true);
      if (rainOn) drawRain(true);
      last = ts;
    }
    applyParallax();
    requestAnimationFrame(loop);
  }

  function boot() {
    collectLayers(); paintAll(); initMotes(); initRain(); drawMotes(false);
    var rainEl = $("rain"), rainBtn = $("toggle-rain");
    function setRain(on) {
      rainOn = on; store("verde-rain", on ? "1" : "0");
      if (rainEl) rainEl.classList.toggle("off", !on);
      if (rainBtn) rainBtn.setAttribute("aria-pressed", on ? "true" : "false");
      if (on) drawRain(false);
    }
    setRain(rainOn);
    if (rainBtn) rainBtn.addEventListener("click", function () { setRain(!rainOn); if (sound.on) sound.update(); });
    if (!reduce) {
      requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) requestAnimationFrame(loop); });
    } else {
      window.addEventListener("scroll", applyParallax, { passive: true });
    }
    var tid;
    window.addEventListener("resize", function () {
      clearTimeout(tid);
      tid = setTimeout(function () { paintAll(); initMotes(); initRain(); drawMotes(false); if (rainOn) drawRain(false); }, 220);
    });
  }

  /* ---------- Sunet ambient: ploaie, vânt și păsări (generate în browser) ---------- */
  var sound = { ac: null, master: null, rainGain: null, on: false, timers: [] };
  function noise(ac, sec) {
    var len = ac.sampleRate * sec, buf = ac.createBuffer(2, len, ac.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch), lastV = 0;
      for (var i = 0; i < len; i++) { var wv = Math.random() * 2 - 1; lastV = (lastV + 0.05 * wv) / 1.05; d[i] = lastV * 2.4 + wv * 0.16; }
    }
    return buf;
  }
  sound.start = function () {
    var Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return false;
    var ac = sound.ac = new Ctx();
    sound.master = ac.createGain(); sound.master.gain.value = 0; sound.master.connect(ac.destination);
    var src = ac.createBufferSource(); src.buffer = noise(ac, 4); src.loop = true;
    var hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 380;
    var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
    sound.rainGain = ac.createGain(); sound.rainGain.gain.value = rainOn ? 0.5 : 0;
    src.connect(hp); hp.connect(lp); lp.connect(sound.rainGain); sound.rainGain.connect(sound.master);
    var w = ac.createBufferSource(); w.buffer = noise(ac, 5); w.loop = true;
    var wl = ac.createBiquadFilter(); wl.type = "lowpass"; wl.frequency.value = 420;
    var wg = ac.createGain(); wg.gain.value = 0.35;
    var lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.18; lfo.connect(lg); lg.connect(wg.gain); lfo.start();
    w.connect(wl); wl.connect(wg); wg.connect(sound.master);
    src.start(); w.start();
    return true;
  };
  sound.update = function () { if (sound.rainGain) sound.rainGain.gain.setTargetAtTime(rainOn ? 0.5 : 0, sound.ac.currentTime, 0.8); };
  function chirp() {
    if (!sound.on) return;
    var ac = sound.ac, now = ac.currentTime, notes = 2 + Math.floor(Math.random() * 3), base = 2600 + Math.random() * 1600;
    for (var i = 0; i < notes; i++) {
      var o = ac.createOscillator(), g = ac.createGain(), t0 = now + i * (0.11 + Math.random() * 0.05);
      o.type = "sine"; o.frequency.setValueAtTime(base, t0); o.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.3), t0 + 0.07);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.03, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
      o.connect(g); g.connect(sound.master); o.start(t0); o.stop(t0 + 0.1);
    }
    sound.timers.push(setTimeout(chirp, 5000 + Math.random() * 9000));
  }
  function drip() {
    if (!sound.on || !rainOn) { sound.timers.push(setTimeout(drip, 1200)); return; }
    var ac = sound.ac, now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(1300 + Math.random() * 1500, now); o.frequency.exponentialRampToValueAtTime(480, now + 0.08);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.035, now + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o.connect(g); g.connect(sound.master); o.start(now); o.stop(now + 0.14);
    sound.timers.push(setTimeout(drip, 250 + Math.random() * 1100));
  }
  var sBtn = $("toggle-sound");
  if (sBtn) sBtn.addEventListener("click", function () {
    if (!sound.ac && !sound.start()) { sBtn.hidden = true; return; }
    sound.on = !sound.on;
    if (sound.ac.state === "suspended") sound.ac.resume();
    sound.master.gain.cancelScheduledValues(sound.ac.currentTime);
    sound.master.gain.setTargetAtTime(sound.on ? 0.32 : 0, sound.ac.currentTime, 0.7);
    sBtn.setAttribute("aria-pressed", sound.on ? "true" : "false");
    sound.timers.forEach(clearTimeout); sound.timers = [];
    if (sound.on) { sound.timers.push(setTimeout(chirp, 2500)); drip(); }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

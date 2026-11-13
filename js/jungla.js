/* VERDÉ — intrarea în junglă: straturi de frunze care se despart la scroll, cu adâncime
   (estompare pe frunzele apropiate, praf auriu în lumină, mișcare după mouse / telefon). */
(function () {
  var track = document.getElementById("jungle");
  if (!track) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.documentElement.classList.add("no-jungle-motion");

  /* ---------- frunzele ---------- */
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function r(a, b) { return a + rnd() * (b - a); }
  var PAL = [
    ["#0B2416", "#1B442C", "#2C6442"],
    ["#10301D", "#225537", "#39794F"],
    ["#163D27", "#2A6342", "#478B5C"],
    ["#1C4A30", "#35754D", "#5A9C69"],
    ["#265E3B", "#48885A", "#77B27B"],
    ["#387749", "#63A06F", "#99C890"]
  ];
  var SHAPES = {
    oval: "M0 0 C180 -210 640 -250 1000 0 C640 250 180 210 0 0Z",
    lung: "M0 0 C260 -120 700 -140 1000 0 C700 140 260 120 0 0Z",
    lat: "M0 0 C120 -300 600 -360 1000 0 C600 360 120 300 0 0Z",
    monstera: "M0 0 C120 -330 640 -400 1000 -10 C700 380 160 340 0 0Z"
  };
  function veins(kind) {
    var w = kind === "lung" ? 120 : (kind === "lat" || kind === "monstera" ? 300 : 210), d = "";
    for (var k = 1; k <= 11; k++) {
      var x = k * 80, h = w * Math.sin(Math.PI * x / 1000) * 0.9;
      d += "M" + x + " 0 Q" + (x + 70) + " " + (-h * 0.55) + " " + (x + 150) + " " + (-h) + " ";
      d += "M" + x + " 0 Q" + (x + 70) + " " + (h * 0.55) + " " + (x + 150) + " " + h + " ";
    }
    return d;
  }
  function splits() {
    var d = "";
    for (var k = 0; k < 6; k++) {
      var x = 230 + k * 110, h = 300 * Math.sin(Math.PI * (x + 120) / 1000);
      d += "M" + (x + 130) + " " + (-h - 20) + " L" + (x + 20) + " " + (-h * 0.25) + " ";
      d += "M" + (x + 130) + " " + (h + 20) + " L" + (x + 20) + " " + (h * 0.25) + " ";
    }
    return d;
  }
  var uid = 0;
  function leaf(gid, kind, pal, x, y, rot, s) {
    var id = uid++, defs = '<clipPath id="jc' + id + '"><path d="' + SHAPES[kind] + '"/></clipPath>', mask = "";
    if (kind === "monstera") {
      defs += '<mask id="jm' + id + '" maskUnits="userSpaceOnUse" x="-50" y="-500" width="1100" height="1000"><path d="' + SHAPES.monstera + '" fill="#fff"/><path d="' + splits() + '" stroke="#000" stroke-width="34" stroke-linecap="round"/></mask>';
      mask = ' mask="url(#jm' + id + ')"';
    }
    return '<defs>' + defs + '</defs><g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')"><g' + mask + '>' +
      '<path d="' + SHAPES[kind] + '" fill="url(#jg' + gid + ')"/>' +
      '<path d="' + SHAPES[kind] + '" fill="url(#jsh)"/>' +
      '<path clip-path="url(#jc' + id + ')" d="' + veins(kind) + '" stroke="' + pal[2] + '" stroke-opacity=".45" stroke-width="2.5" fill="none"/>' +
      '<path d="M0 0 C300 -8 700 -6 1000 0" stroke="' + pal[2] + '" stroke-width="7" fill="none" stroke-opacity=".9"/></g></g>';
  }
  function grad(gid, pal) {
    return '<linearGradient id="jg' + gid + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset=".55" stop-color="' + pal[1] + '"/><stop offset="1" stop-color="' + pal[2] + '"/></linearGradient>';
  }
  var SHADE = '<linearGradient id="jsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>';

  var host = document.getElementById("jungle-layers"), N = PAL.length, layers = [];
  for (var i = 0; i < N; i++) {
    var pal = PAL[i];
    var side = function () {
      var out = "", count = 7 - Math.floor(i / 2), kinds = ["oval", "lung", "lat", "monstera"];
      for (var k = 0; k < count; k++) {
        var y = 60 + k * (1080 / (count - 1)) + r(-60, 60);
        out += leaf(i, kinds[(k + i) % 4], pal, r(-260, -80), y, (y - 600) * -0.045 + r(-14, 14), r(1.05, 1.5) * (i === 0 ? 1.25 : 1));
      }
      out += leaf(i, "lat", pal, r(-120, 0), r(420, 720), r(-8, 8), r(1.4, 1.7));
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -400 2600 2000" preserveAspectRatio="none" width="2600" height="2000"><defs>' + grad(i, pal) + SHADE + '</defs>' + out + '</svg>';
    };
    var el = document.createElement("div");
    el.className = "jl";
    el.style.zIndex = String(15 - i);
    /* frunzele devin imagini: browserul le desenează o dată, apoi doar le mută (scroll fluid) */
    var img = function (svg) { return '<img alt="" decoding="async" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '">'; };
    el.innerHTML = '<div class="jh l"><div class="flip">' + img(side()) + '</div></div><div class="jh r"><div class="flip">' + img(side()) + '</div></div>';
    host.appendChild(el);
    layers.push({ el: el, l: el.children[0], r: el.children[1] });
  }

  /* frunzele pot ieși din cutia lor (ca înainte), deci imaginea e mai mare și poziționată exact */
  function placeLeaves() {
    var box = layers[0].l, bw = box.clientWidth, bh = box.clientHeight;
    var s = Math.max(bw / 1000, bh / 1200), oy = (bh - 1200 * s) / 2;
    document.querySelectorAll(".jh img").forEach(function (im) {
      im.style.left = (-300 * s) + "px"; im.style.top = (oy - 400 * s) + "px";
      im.style.width = (2600 * s) + "px"; im.style.height = (2000 * s) + "px";
    });
  }

  /* ---------- praful auriu ---------- */
  var dust = document.getElementById("jungle-dust"), ctx = dust.getContext("2d"), motes = [], dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  function sizeDust() {
    dust.width = dust.clientWidth * dpr; dust.height = dust.clientHeight * dpr;
    motes = [];
    var n = Math.round(Math.min(55, dust.clientWidth / 22));
    for (var k = 0; k < n; k++) motes.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 2.2, v: 0.00012 + Math.random() * 0.0004, ph: Math.random() * 6.28, z: Math.random() });
  }

  /* ---------- starea ---------- */
  var hero = document.getElementById("jungle-hero"), hint = document.getElementById("jungle-hint"),
      mid = document.getElementById("jungle-mid"), end = document.getElementById("jungle-end"),
      light = document.getElementById("jungle-light");
  var P = 0, mx = 0, my = 0, tmx = 0, tmy = 0, visible = true, running = false;
  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function progress() {
    var vh = window.innerHeight, total = track.offsetHeight - vh, top = track.getBoundingClientRect().top;
    visible = top < vh && top + track.offsetHeight > 90;
    return reduce ? 1 : clamp(-top / total);
  }

  function draw(t) {
    var p = P, vw = window.innerWidth;
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
    for (var i = 0; i < N; i++) {
      var start = i * 0.115, li = ease(clamp((p - start) / 0.3));
      var depth = (1 - i * 0.05) * (i > 0 ? 1 + clamp(p / start) * 0.12 : 1);
      var sc = depth * (1 + li * 1.1), dx = li * vw * 0.85, rot = li * 16;
      var px = mx * (N - i) * 7, py = my * (N - i) * 5; /* frunzele din față se mișcă mai mult */
      var sway = reduce ? 0 : Math.sin(t / 2200 + i) * 0.8;
      layers[i].l.style.transform = "translate3d(" + (-dx + px) + "px," + py + "px,0) rotate(" + (-rot + sway) + "deg) scale(" + sc + ")";
      layers[i].r.style.transform = "translate3d(" + (dx + px) + "px," + py + "px,0) rotate(" + (rot - sway) + "deg) scale(" + sc + ")";
      layers[i].el.style.opacity = li > 0.9 ? 1 - (li - 0.9) * 10 : 1;
      layers[i].el.style.visibility = li >= 1 ? "hidden" : "visible";
    }
    var h = clamp(p / 0.1);
    hero.style.opacity = 1 - h;
    hero.style.transform = "translate(" + (mx * -10) + "px," + (-h * 60 + my * -6) + "px) scale(" + (1 + h * 0.15) + ")";
    hint.style.opacity = 1 - clamp(p / 0.04);
    var m = p < 0.3 ? clamp((p - 0.2) / 0.05) : 1 - clamp((p - 0.42) / 0.06);
    mid.style.opacity = m; mid.style.transform = "scale(" + (0.94 + m * 0.06) + ")";
    var e = clamp((p - 0.7) / 0.18);
    end.style.opacity = e; end.style.transform = "translateY(" + ((1 - e) * 30) + "px)";
    end.style.pointerEvents = e > 0.5 ? "auto" : "none";
    end.setAttribute("aria-hidden", e > 0.5 ? "false" : "true");
    var lg = clamp((p - 0.3) / 0.45);
    light.style.opacity = lg;
    document.body.classList.toggle("jungle-dark", visible && p < 0.82);

    /* praf: mai mult și mai strălucitor spre lumină */
    var W = dust.width, H = dust.height;
    ctx.clearRect(0, 0, W, H);
    var a = 0.25 + lg * 0.75;
    for (var k = 0; k < motes.length; k++) {
      var o = motes[k];
      if (!reduce) { o.y -= o.v; o.x += Math.sin(t / 3000 + o.ph) * 0.00015; if (o.y < -0.02) { o.y = 1.02; o.x = Math.random(); } }
      var x = (o.x + mx * 0.01 * (1 + o.z)) * W, y = o.y * H, tw = 0.55 + 0.45 * Math.sin(t / 700 + o.ph * 3);
      ctx.beginPath(); ctx.arc(x, y, o.r * dpr * (0.7 + o.z * 0.6), 0, 6.283);
      ctx.fillStyle = "rgba(240,214,150," + (a * tw * (0.35 + o.z * 0.55)).toFixed(3) + ")"; ctx.fill();
    }
  }

  function loop(t) {
    if (!visible || document.hidden || track.offsetParent === null) { running = false; return; }
    draw(t || 0);
    requestAnimationFrame(loop);
  }
  function setHome() { var v = document.getElementById("view-acasa"); document.body.classList.toggle("home", !!v && !v.hidden); }
  function kick() { setHome(); P = progress(); if (visible && !running && track.offsetParent !== null) { running = true; requestAnimationFrame(loop); } if (!visible) document.body.classList.remove("jungle-dark"); }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", function () { placeLeaves(); sizeDust(); kick(); });
  window.addEventListener("hashchange", function () { setTimeout(kick, 60); });
  document.addEventListener("visibilitychange", kick);
  if (!reduce) {
    window.addEventListener("pointermove", function (e) { tmx = (e.clientX / window.innerWidth - 0.5) * 2; tmy = (e.clientY / window.innerHeight - 0.5) * 2; }, { passive: true });
    window.addEventListener("deviceorientation", function (e) { if (e.gamma == null) return; tmx = Math.max(-1, Math.min(1, e.gamma / 25)); tmy = Math.max(-1, Math.min(1, (e.beta - 45) / 25)); }, { passive: true });
  }
  placeLeaves(); sizeDust(); kick();
})();

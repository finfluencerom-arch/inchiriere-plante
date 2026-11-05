/* VERDÉ — ilustrații de plante desenate în browser (fără fotografii, fără fișiere externe).
   Fiecare specie are o formă proprie: sabie, palmier, frunze decupate, cascadă etc. */
(function () {
  "use strict";

  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h) || 7; }
  function qpt(a, c, b, t) { var u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }

  var PROFILES = {
    lance: function (t) { return t < 0.32 ? Math.sin(t / 0.32 * Math.PI / 2) : Math.cos((t - 0.32) / 0.68 * Math.PI / 2); },
    oval: function (t) { return Math.pow(Math.sin(Math.PI * t), 0.75); },
    heart: function (t) { return Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * t)), 0.6) * (1.05 - 0.25 * t); },
    sword: function (t) { return Math.min(1, t * 7) * Math.pow(1 - t, 0.55); },
    strap: function (t) { return Math.min(1, t * 9) * (1 - Math.pow(t, 3)); },
    fiddle: function (t) { return Math.pow(Math.sin(Math.PI * t), 0.6) * (0.5 + 0.62 * t); }
  };

  /* Construiește o frunză curbată în coordonate absolute.
     x,y = baza; ang = direcția (0 = în sus); bend = cât se arcuiește (+ spre dreapta) */
  function leafGeom(x, y, ang, len, wid, profile, bend) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    function rot(px, py) { return [x + px * ca - py * sa, y + px * sa + py * ca]; }
    var a = [0, 0], c = [bend * len * 0.45, -len * 0.55], b = [bend * len * 0.95, -len * (1 - Math.min(0.6, Math.abs(bend) * 0.38))];
    var n = 26, center = [], left = [], right = [], f = PROFILES[profile] || PROFILES.lance;
    for (var i = 0; i <= n; i++) {
      var t = i / n, p = qpt(a, c, b, t);
      var p2 = qpt(a, c, b, Math.min(1, t + 0.01)), p1 = qpt(a, c, b, Math.max(0, t - 0.01));
      var dx = p2[0] - p1[0], dy = p2[1] - p1[1], dl = Math.hypot(dx, dy) || 1;
      var nx = -dy / dl, ny = dx / dl, wv = wid * f(t);
      center.push(rot(p[0], p[1]));
      left.push(rot(p[0] - nx * wv, p[1] - ny * wv));
      right.push(rot(p[0] + nx * wv, p[1] + ny * wv));
    }
    return { center: center, left: left, right: right, base: rot(0, 0), tip: rot(b[0], b[1]) };
  }

  function pathOf(ctx, g) {
    ctx.beginPath(); ctx.moveTo(g.left[0][0], g.left[0][1]);
    for (var i = 1; i < g.left.length; i++) ctx.lineTo(g.left[i][0], g.left[i][1]);
    for (var j = g.right.length - 1; j >= 0; j--) ctx.lineTo(g.right[j][0], g.right[j][1]);
    ctx.closePath();
  }

  var LINE = true, INK = "rgba(238,233,214,0.86)", INK_SOFT = "rgba(238,233,214,0.42)", WASH = "rgba(160,205,170,0.09)";
  function paintLeaf(ctx, g, c1, c2, opt) {
    opt = opt || {};
    if (LINE && !opt.solid) {
      pathOf(ctx, g); ctx.fillStyle = opt.wash || WASH; ctx.fill();
      ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.lineWidth = opt.lineW || 0.9; ctx.stroke();
      if (opt.rib !== false) {
        ctx.beginPath(); ctx.moveTo(g.center[0][0], g.center[0][1]);
        for (var q = 1; q < g.center.length - 4; q++) ctx.lineTo(g.center[q][0], g.center[q][1]);
        ctx.strokeStyle = INK_SOFT; ctx.lineWidth = 0.6; ctx.stroke();
      }
      return;
    }
    var gr = ctx.createLinearGradient(g.base[0], g.base[1], g.tip[0], g.tip[1]);
    gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    pathOf(ctx, g); ctx.fillStyle = gr; ctx.fill();
    /* jumătatea luminată */
    ctx.beginPath(); ctx.moveTo(g.center[0][0], g.center[0][1]);
    for (var i = 1; i < g.center.length; i++) ctx.lineTo(g.center[i][0], g.center[i][1]);
    for (var j = g.left.length - 1; j >= 0; j--) ctx.lineTo(g.left[j][0], g.left[j][1]);
    ctx.closePath(); ctx.fillStyle = "rgba(255,255,240," + (opt.gloss || 0.08) + ")"; ctx.fill();
    if (opt.edge) { pathOf(ctx, g); ctx.strokeStyle = opt.edge; ctx.lineWidth = opt.edgeW || 1.4; ctx.stroke(); }
    if (opt.rib !== false) {
      ctx.beginPath(); ctx.moveTo(g.center[0][0], g.center[0][1]);
      for (var k = 1; k < g.center.length - 3; k++) ctx.lineTo(g.center[k][0], g.center[k][1]);
      ctx.strokeStyle = opt.ribColor || "rgba(10,25,12,0.28)"; ctx.lineWidth = opt.ribW || 1; ctx.stroke();
    }
  }

  function leaf(ctx, x, y, ang, len, wid, profile, bend, c1, c2, opt) {
    var g = leafGeom(x, y, ang, len, wid, profile, bend); paintLeaf(ctx, g, c1, c2, opt); return g;
  }

  function stem(ctx, a, c, b, w, color) {
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]);
    ctx.strokeStyle = LINE ? INK : color; ctx.lineWidth = LINE ? Math.min(w, 1.2) : w; ctx.lineCap = "round"; ctx.stroke();
  }

  var POTS = {
    stone: ["#CFC9BC", "#8F897D", "#5F5A51"],
    cream: ["#EDE5D3", "#B9AE98", "#7E7461"],
    charcoal: ["#5A5D58", "#33362F", "#1D1F1B"],
    terracotta: ["#C98A63", "#93573A", "#5E3624"]
  };

  function drawPot(ctx, cx, top, pw, ph, kind, back) {
    var c = POTS[kind] || POTS.stone, bw = pw * 0.76, rimH = ph * 0.13;
    if (LINE) {
      if (back) return;
      ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.fillStyle = "rgba(10,18,13,0.92)";
      ctx.beginPath(); ctx.moveTo(cx - pw * 0.48, top + rimH); ctx.lineTo(cx - bw / 2, top + ph); ctx.lineTo(cx + bw / 2, top + ph); ctx.lineTo(cx + pw * 0.48, top + rimH); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(cx - pw * 0.52, top, pw * 1.04, rimH); ctx.fill(); ctx.stroke();
      /* hașură pe partea din umbră a ghiveciului */
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx - pw * 0.48, top + rimH); ctx.lineTo(cx - bw / 2, top + ph); ctx.lineTo(cx + bw / 2, top + ph); ctx.lineTo(cx + pw * 0.48, top + rimH); ctx.closePath(); ctx.clip();
      ctx.strokeStyle = INK_SOFT; ctx.lineWidth = 0.6;
      for (var hx = cx + pw * 0.12; hx < cx + pw * 0.7; hx += 4.5) { ctx.beginPath(); ctx.moveTo(hx, top + rimH); ctx.lineTo(hx - ph * 0.5, top + ph); ctx.stroke(); }
      ctx.restore();
      if (kind === "terracotta" || kind === "charcoal") { ctx.strokeStyle = INK_SOFT; ctx.beginPath(); ctx.moveTo(cx - pw * 0.47, top + ph * 0.45); ctx.lineTo(cx + pw * 0.47, top + ph * 0.45); ctx.stroke(); }
      return;
    }
    if (back) {
      ctx.beginPath(); ctx.ellipse(cx, top + rimH * 0.5, pw * 0.5, rimH * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#2A1D14"; ctx.fill();
      return;
    }
    var g = ctx.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0);
    g.addColorStop(0, c[1]); g.addColorStop(0.28, c[0]); g.addColorStop(0.7, c[1]); g.addColorStop(1, c[2]);
    ctx.beginPath();
    ctx.moveTo(cx - pw * 0.48, top + rimH);
    ctx.bezierCurveTo(cx - pw * 0.47, top + ph * 0.6, cx - bw * 0.52, top + ph * 0.9, cx - bw / 2, top + ph);
    ctx.lineTo(cx + bw / 2, top + ph);
    ctx.bezierCurveTo(cx + bw * 0.52, top + ph * 0.9, cx + pw * 0.47, top + ph * 0.6, cx + pw * 0.48, top + rimH);
    ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    /* buza ghiveciului */
    ctx.beginPath(); ctx.moveTo(cx - pw * 0.52, top); ctx.lineTo(cx + pw * 0.52, top);
    ctx.lineTo(cx + pw * 0.5, top + rimH); ctx.lineTo(cx - pw * 0.5, top + rimH); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(cx - pw * 0.5, top + rimH, pw, 2);
    ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(cx - pw * 0.52, top, pw * 1.04, 1.5);
  }

  /* ---------- Specii ---------- */
  var DRAW = {};

  DRAW.sword = function (ctx, o, H, W, r) {
    var n = 9;
    for (var i = 0; i < n; i++) {
      var a = (i / (n - 1) - 0.5) * 0.75 + (r() - 0.5) * 0.12;
      leaf(ctx, o[0] + a * W * 0.12, o[1], a, H * (0.6 + r() * 0.35) * (1 - Math.abs(a) * 0.35), W * 0.05, "sword", (r() - 0.5) * 0.12,
        "#2A4E30", i % 2 ? "#4F7F47" : "#5D8D4F", { edge: "rgba(214,206,120,0.85)", edgeW: 1.6, rib: false, gloss: 0.06 });
    }
  };

  DRAW.pinnate = function (ctx, o, H, W, r) {
    for (var s = 0; s < 7; s++) {
      var a = (s / 6 - 0.5) * 1.1 + (r() - 0.5) * 0.15, L = H * (0.6 + r() * 0.35);
      var bend = a * 0.25, end = [o[0] + Math.sin(a) * L + bend * L * 0.4, o[1] - Math.cos(a) * L], c = [o[0] + Math.sin(a) * L * 0.4, o[1] - L * 0.55];
      stem(ctx, o, c, end, 3, "#3E5A2E");
      for (var k = 0; k < 8; k++) {
        var t = 0.3 + k * 0.09, p = qpt(o, c, end, Math.min(1, t)), pa = Math.atan2(end[0] - c[0], c[1] - end[1]);
        for (var side = -1; side <= 1; side += 2) leaf(ctx, p[0], p[1], pa + side * 0.85, W * 0.085, W * 0.03, "oval", side * 0.08, "#1C3B20", "#3C6C38", { gloss: 0.16, rib: false, lineW: 0.75 });
      }
      leaf(ctx, end[0], end[1], a, W * 0.08, W * 0.03, "oval", 0, "#1C3B20", "#3C6C38", { gloss: 0.16 });
    }
  };

  function broadLeaves(ctx, o, H, W, r, n, c1, c2, gloss) {
    for (var i = 0; i < n; i++) {
      var a = (i / (n - 1) - 0.5) * 1.25 + (r() - 0.5) * 0.15;
      leaf(ctx, o[0], o[1], a, H * (0.55 + r() * 0.35) * (1 - Math.abs(a) * 0.25), W * 0.075, "lance", a * 0.45 + (r() - 0.5) * 0.2, c1, c2, { gloss: gloss });
    }
  }
  DRAW.broad = function (ctx, o, H, W, r) { broadLeaves(ctx, o, H, W, r, 10, "#21452A", "#4E8749", 0.08); };
  DRAW.lily = function (ctx, o, H, W, r) {
    broadLeaves(ctx, o, H * 0.85, W, r, 9, "#173A22", "#3B7A3E", 0.14);
    for (var f = 0; f < 3; f++) {
      var a = (f - 1) * 0.28 + (r() - 0.5) * 0.1, L = H * (0.72 + r() * 0.2), e = [o[0] + Math.sin(a) * L, o[1] - Math.cos(a) * L];
      stem(ctx, o, [o[0] + Math.sin(a) * L * 0.5, o[1] - L * 0.5], e, 1.6, "#4F7D44");
      leaf(ctx, e[0], e[1] + W * 0.02, a + 0.15, W * 0.12, W * 0.045, "oval", 0.1, "#E3E7DA", "#FBFBF4", { rib: false, gloss: 0.2, wash: "rgba(250,248,235,0.35)" });
      ctx.beginPath(); ctx.ellipse(e[0] + 2, e[1] - W * 0.035, 2.6, W * 0.025, a, 0, Math.PI * 2); ctx.fillStyle = "#EFE6B8"; ctx.fill();
    }
  };

  DRAW.paddle = function (ctx, o, H, W, r) {
    for (var i = 0; i < 6; i++) {
      var a = (i / 5 - 0.5) * 0.8 + (r() - 0.5) * 0.1, L = H * (0.35 + r() * 0.2);
      var e = [o[0] + Math.sin(a) * L, o[1] - Math.cos(a) * L];
      stem(ctx, o, [o[0] + Math.sin(a) * L * 0.5, o[1] - L * 0.5], e, 3.2, "#5C7A45");
      var g = leaf(ctx, e[0], e[1], a * 1.1, H * (0.4 + r() * 0.12), W * 0.09, "oval", a * 0.4 + (r() - 0.5) * 0.2, "#2C5932", "#5E9452", { gloss: 0.1, ribColor: "rgba(220,235,190,0.35)", ribW: 1.4 });
      /* rupturi naturale în frunză */
      ctx.strokeStyle = "rgba(10,20,12,0.35)"; ctx.lineWidth = 1;
      for (var k = 0; k < 3; k++) {
        var ti = 6 + Math.floor(r() * 16), side = r() < 0.5 ? g.left : g.right;
        ctx.beginPath(); ctx.moveTo(side[ti][0], side[ti][1]); ctx.lineTo((side[ti][0] + g.center[ti][0]) / 2, (side[ti][1] + g.center[ti][1]) / 2 - 3); ctx.stroke();
      }
    }
  };

  function vine(ctx, pts, W, r, c1, c2) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = "#5C7F3E"; ctx.lineWidth = 1.6; ctx.stroke();
    for (var j = 1; j < pts.length; j += 2) {
      var p = pts[j], q = pts[Math.min(pts.length - 1, j + 1)], d = Math.atan2(q[0] - p[0], p[1] - q[1]);
      var side = j % 4 === 1 ? 1 : -1, s = 0.75 + r() * 0.35;
      var g = leaf(ctx, p[0], p[1], d + side * 1.2, W * 0.075 * s, W * 0.045 * s, "heart", side * 0.15, c1, c2, { gloss: 0.12 });
      if (!LINE) { ctx.beginPath(); ctx.moveTo(g.center[2][0], g.center[2][1]); ctx.lineTo(g.center[18][0], g.center[18][1]);
      ctx.strokeStyle = "rgba(225,215,120,0.5)"; ctx.lineWidth = 2; ctx.stroke(); }
    }
  }
  DRAW.trail = function (ctx, o, H, W, r) {
    for (var i = 0; i < 6; i++) {
      var a = (i / 5 - 0.5) * 1.6, pts = [];
      for (var t = 0; t <= 1; t += 0.12) pts.push([o[0] + Math.sin(a) * H * 0.35 * t + Math.sin(t * 5 + i) * 4, o[1] - Math.cos(a) * H * 0.35 * t]);
      vine(ctx, pts, W, r, "#2F6A33", "#77AD58");
    }
  };
  DRAW.trailFront = function (ctx, o, H, W, r, pw, ph) {
    var drops = [-0.46, -0.3, 0.32, 0.47, -0.05];
    for (var i = 0; i < drops.length; i++) {
      var sx = o[0] + drops[i] * pw, out = drops[i] < 0 ? -1 : 1, depth = ph * (0.9 + r() * 0.9), pts = [];
      for (var t = 0; t <= 1.001; t += 0.09) pts.push([sx + out * (Math.sin(t * Math.PI * 0.8) * pw * 0.12) + Math.sin(t * 9 + i) * 3, o[1] - 4 + t * depth]);
      vine(ctx, pts, W, r, "#2C6531", "#73A955");
    }
  };

  function frond(ctx, o, a, L, bend, W, r, leafLen, leafWid, c1, c2, stemCol) {
    var end = [o[0] + Math.sin(a) * L + bend * L * 0.55, o[1] - Math.cos(a) * L * (1 - Math.abs(bend) * 0.45)];
    var c = [o[0] + Math.sin(a) * L * 0.6, o[1] - Math.cos(a) * L * 0.85];
    stem(ctx, o, c, end, 2, stemCol);
    for (var t = 0.18; t <= 1; t += 0.045) {
      var p = qpt(o, c, end, t), p2 = qpt(o, c, end, Math.min(1, t + 0.02)), d = Math.atan2(p2[0] - p[0], p[1] - p2[1]);
      var ll = leafLen * (1 - t * 0.55);
      for (var side = -1; side <= 1; side += 2)
        leaf(ctx, p[0], p[1], d + side * (1.05 + r() * 0.2), ll, leafWid, "strap", side * 0.55, c1, c2, { gloss: 0.06, ribW: 0.6, rib: false, lineW: 0.55 });
    }
  }
  DRAW.palm = function (ctx, o, H, W, r) {
    for (var i = 0; i < 9; i++) {
      var a = (i / 8 - 0.5) * 1.9 + (r() - 0.5) * 0.15;
      frond(ctx, [o[0] + (r() - 0.5) * 6, o[1]], a * 0.55, H * (0.72 + r() * 0.26) * (1 - Math.abs(a) * 0.2), a * 0.6, W, r, W * 0.11, W * 0.01, "#24502D", "#5E9454", "#55693A");
    }
  };
  DRAW.smallpalm = function (ctx, o, H, W, r) {
    for (var i = 0; i < 8; i++) {
      var a = (i / 7 - 0.5) * 1.4 + (r() - 0.5) * 0.15;
      frond(ctx, [o[0] + (r() - 0.5) * 10, o[1]], a * 0.6, H * (0.55 + r() * 0.35), a * 0.55, W, r, W * 0.11, W * 0.016, "#2A5B30", "#6CA35A", "#5D7A3E");
    }
  };

  DRAW.fan = function (ctx, o, H, W, r) {
    for (var i = 0; i < 6; i++) {
      var a = (i / 5 - 0.5) * 0.5 + (r() - 0.5) * 0.08, L = H * (0.45 + r() * 0.45);
      var top = [o[0] + Math.sin(a) * L, o[1] - Math.cos(a) * L];
      stem(ctx, [o[0] + (i - 2.5) * 3, o[1]], [o[0] + Math.sin(a) * L * 0.5, o[1] - L * 0.5], top, 3, "#5B4A33");
      for (var f = 0; f < 3; f++) {
        var t = 0.55 + f * 0.2, p = [o[0] + Math.sin(a) * L * t, o[1] - Math.cos(a) * L * t];
        var dir = a + (f % 2 ? 0.9 : -0.9) * (r() * 0.5 + 0.5);
        var e = [p[0] + Math.sin(dir) * W * 0.06, p[1] - Math.cos(dir) * W * 0.06];
        stem(ctx, p, [(p[0] + e[0]) / 2, (p[1] + e[1]) / 2], e, 1.2, "#5E7A44");
        for (var s = 0; s < 7; s++) leaf(ctx, e[0], e[1], dir + (s / 6 - 0.5) * 1.8, W * 0.1, W * 0.014, "strap", (s / 6 - 0.5) * 0.4, "#24502C", "#5A9150", { gloss: 0.08, ribW: 0.5, rib: false, lineW: 0.6 });
      }
    }
  };

  DRAW.split = function (ctx, o, H, W, r, pw, ph, tmp) {
    for (var i = 0; i < 7; i++) {
      var a = (i / 6 - 0.5) * 1.3 + (r() - 0.5) * 0.15, L = H * (0.3 + r() * 0.35);
      var e = [o[0] + Math.sin(a) * L, o[1] - Math.cos(a) * L];
      stem(ctx, o, [o[0] + Math.sin(a) * L * 0.3, o[1] - L * 0.6], e, 2.4, "#4E7A3C");
      var t = tmp.getContext("2d"); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, tmp.width, tmp.height); t.setTransform(ctx.getTransform());
      var g = leaf(t, e[0], e[1] + W * 0.02, a * 1.4, W * (0.2 + r() * 0.05), W * 0.12, "heart", a * 0.5, "#1E4A26", "#468A45", { gloss: 0.12, ribW: 1.4, ribColor: "rgba(200,230,170,0.35)" });
      t.globalCompositeOperation = "destination-out"; t.fillStyle = "#000";
      for (var k = 5; k < 23; k += 3) {
        [g.left, g.right].forEach(function (side) {
          var ep = side[k], cp = g.center[k], mx = ep[0] + (cp[0] - ep[0]) * 0.6, my = ep[1] + (cp[1] - ep[1]) * 0.6;
          t.beginPath(); t.moveTo(ep[0], ep[1] - 2.5); t.lineTo(mx, my); t.lineTo(ep[0], ep[1] + 2.5); t.closePath(); t.fill();
        });
        if (k > 8 && k < 18) { t.beginPath(); t.arc((g.left[k][0] + g.center[k][0] * 2) / 3, (g.left[k][1] + g.center[k][1] * 2) / 3, 1.8, 0, Math.PI * 2); t.fill(); }
      }
      t.globalCompositeOperation = "source-over";
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(tmp, 0, 0); ctx.restore();
    }
  };

  DRAW.lobed = function (ctx, o, H, W, r) {
    for (var i = 0; i < 12; i++) {
      var a = (i / 11 - 0.5) * 2.6 + (r() - 0.5) * 0.15, L = H * (0.18 + r() * 0.2);
      var e = [o[0] + Math.sin(a) * L, o[1] - Math.cos(a) * L * 0.8];
      stem(ctx, o, [o[0] + Math.sin(a) * L * 0.5, o[1] - L * 0.5], e, 1.8, "#4B7438");
      var d = a * 1.1, len = W * 0.17;
      for (var k = 1; k <= 5; k++) {
        var t = k / 6, p = [e[0] + Math.sin(d) * len * t, e[1] - Math.cos(d) * len * t];
        for (var side = -1; side <= 1; side += 2) leaf(ctx, p[0], p[1], d + side * 0.95, len * 0.42 * (1 - t * 0.5), W * 0.022, "lance", side * 0.2, "#21502A", "#4E8E46", { gloss: 0.1, ribW: 0.6, rib: false, lineW: 0.7 });
      }
      leaf(ctx, e[0], e[1], d, len * 1.05, W * 0.025, "lance", 0, "#21502A", "#4E8E46", { gloss: 0.1, ribColor: "rgba(210,235,190,0.3)" });
    }
  };

  function trunk(ctx, a, c, b, w0, w1, col) {
    for (var i = 0; i < 12; i++) {
      var t0 = i / 12, t1 = (i + 1) / 12, p0 = qpt(a, c, b, t0), p1 = qpt(a, c, b, t1);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
      ctx.strokeStyle = LINE ? INK : col; ctx.lineWidth = LINE ? 1.1 + (w0 + (w1 - w0) * t0) * 0.18 : w0 + (w1 - w0) * t0; ctx.lineCap = "round"; ctx.stroke();
    }
  }
  DRAW.fiddle = function (ctx, o, H, W, r) {
    var top = [o[0] + W * 0.02, o[1] - H * 0.92], c = [o[0] - W * 0.03, o[1] - H * 0.5];
    trunk(ctx, o, c, top, 6, 3, "#6A5440");
    for (var i = 0; i < 15; i++) {
      var t = 0.38 + (i / 14) * 0.62, p = qpt(o, c, top, t), side = i % 2 ? 1 : -1;
      leaf(ctx, p[0], p[1], side * (0.55 + r() * 0.7) * (1.2 - t * 0.5), W * (0.15 + r() * 0.05), W * 0.075, "fiddle", side * 0.25, "#1D4626", "#4C8A45", { gloss: 0.12, ribW: 1.4, ribColor: "rgba(205,230,170,0.45)" });
    }
  };

  DRAW.olive = function (ctx, o, H, W, r) {
    var top = [o[0] + W * 0.03, o[1] - H * 0.5];
    trunk(ctx, o, [o[0] - W * 0.05, o[1] - H * 0.25], top, 7, 4, "#7A6C5A");
    var tips = [];
    for (var b = 0; b < 4; b++) {
      var a = (b / 3 - 0.5) * 1.6, e = [top[0] + Math.sin(a) * W * 0.16, top[1] - Math.cos(a) * H * 0.3];
      trunk(ctx, top, [top[0] + Math.sin(a) * W * 0.05, top[1] - H * 0.14], e, 3.5, 1.5, "#7A6C5A"); tips.push(e);
    }
    for (var i = 0; i < 140; i++) {
      var tp = tips[i % tips.length], ang = r() * Math.PI * 2, rad = Math.sqrt(r());
      var x = tp[0] + Math.cos(ang) * W * 0.12 * rad, y = tp[1] + Math.sin(ang) * H * 0.12 * rad;
      leaf(ctx, x, y, r() * 6.28, W * 0.055, W * 0.009, "lance", (r() - 0.5) * 0.3, "#5E7660", "#AFC0A6", { rib: false, gloss: 0.1, wash: "rgba(200,215,195,0.14)", lineW: 0.7 });
    }
  };

  DRAW.umbrella = function (ctx, o, H, W, r) {
    for (var s = 0; s < 5; s++) {
      var a = (s / 4 - 0.5) * 0.7, L = H * (0.6 + r() * 0.35), e = [o[0] + Math.sin(a) * L, o[1] - Math.cos(a) * L], c = [o[0] + Math.sin(a) * L * 0.3, o[1] - L * 0.5];
      stem(ctx, o, c, e, 2.6, "#5E6E3E");
      for (var k = 0; k < 4; k++) {
        var t = 0.35 + k * 0.22, p = qpt(o, c, e, Math.min(1, t)), dir = a + (k % 2 ? 1 : -1) * (0.5 + r() * 0.5);
        var q = [p[0] + Math.sin(dir) * W * 0.07, p[1] - Math.cos(dir) * W * 0.07];
        stem(ctx, p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 3], q, 1.2, "#6B8247");
        for (var l = 0; l < 7; l++) leaf(ctx, q[0], q[1], dir + (l / 6 - 0.5) * 2.6, W * 0.065, W * 0.024, "oval", 0.05, "#265C2D", "#69A251", { gloss: 0.18, ribW: 0.6, rib: false, lineW: 0.7 });
      }
    }
  };

  DRAW.cane = function (ctx, o, H, W, r) {
    var hs = [0.42, 0.62, 0.8], xs = [-0.05, 0.04, -0.01];
    for (var i = 0; i < 3; i++) {
      var x = o[0] + xs[i] * W, top = o[1] - H * hs[i], cw = W * 0.025;
      var g = ctx.createLinearGradient(x - cw, 0, x + cw, 0); g.addColorStop(0, "#5C4A36"); g.addColorStop(0.4, "#8E7A60"); g.addColorStop(1, "#4A3A2A");
      if (LINE) { ctx.fillStyle = "rgba(10,18,13,0.9)"; ctx.fillRect(x - cw / 2, top, cw, o[1] - top); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.strokeRect(x - cw / 2, top, cw, o[1] - top); ctx.strokeStyle = INK_SOFT; }
      else { ctx.fillStyle = g; ctx.fillRect(x - cw / 2, top, cw, o[1] - top); ctx.strokeStyle = "rgba(40,28,18,0.45)"; }
      ctx.lineWidth = LINE ? 0.6 : 1;
      for (var y = top + 8; y < o[1]; y += 9) { ctx.beginPath(); ctx.moveTo(x - cw / 2, y); ctx.lineTo(x + cw / 2, y + 1.5); ctx.stroke(); }
      for (var l = 0; l < 16; l++) {
        var a = (l / 15 - 0.5) * 3.0 + (r() - 0.5) * 0.15;
        var gg = leaf(ctx, x, top + 4, a, W * (0.17 + r() * 0.06), W * 0.02, "strap", a * 0.45, "#2B5C30", "#6FA45A", { gloss: 0.08, rib: false });
        if (!LINE) { ctx.beginPath(); ctx.moveTo(gg.center[1][0], gg.center[1][1]);
        for (var k = 2; k < 22; k++) ctx.lineTo(gg.center[k][0], gg.center[k][1]);
        ctx.strokeStyle = "rgba(200,220,120,0.55)"; ctx.lineWidth = 1.6; ctx.stroke(); }
      }
    }
  };

  /* ---------- Desenarea unei plante în pânză ---------- */
  var tmpCanvas = null;
  function draw(canvas, plant, opts) {
    opts = opts || {};
    LINE = opts.line === true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    if (!tmpCanvas) tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = canvas.width; tmpCanvas.height = canvas.height;

    var r = rng(hash(plant.id + (opts.seed || "")));
    var W = Math.min(w, h * 0.95);
    var ground = h * 0.95, ph = h * 0.2, pw = W * 0.36, top = ground - ph, cx = w / 2;
    var o = [cx, top + ph * 0.07], H = top - h * 0.04;

    /* umbra de sub ghiveci */
    var sg = ctx.createRadialGradient(cx, ground, 2, cx, ground, pw * 0.9);
    sg.addColorStop(0, "rgba(0,0,0,0.45)"); sg.addColorStop(1, "rgba(0,0,0,0)");
    if (LINE) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx + pw * 0.15, ground, pw * 0.75, ph * 0.12, 0, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(238,233,214,0.22)"; ctx.lineWidth = 0.6;
      for (var hx2 = cx - pw; hx2 < cx + pw * 1.2; hx2 += 4) { ctx.beginPath(); ctx.moveTo(hx2, ground - ph * 0.2); ctx.lineTo(hx2 + ph * 0.3, ground + ph * 0.2); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = "rgba(238,233,214,0.35)"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(cx - pw * 1.1, ground + 0.5); ctx.lineTo(cx + pw * 1.1, ground + 0.5); ctx.stroke();
    } else { ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(cx, ground, pw * 0.9, ph * 0.16, 0, 0, Math.PI * 2); ctx.fill(); }

    drawPot(ctx, cx, top, pw, ph, plant.pot, true);
    (DRAW[plant.art] || DRAW.broad)(ctx, o, H, W, r, pw, ph, tmpCanvas);
    drawPot(ctx, cx, top, pw, ph, plant.pot, false);
    if (plant.art === "trail") DRAW.trailFront(ctx, o, H, W, r, pw, ph);
  }

  window.VerdeArt = { draw: draw, leafGeom: leafGeom, paintLeaf: function (c, g, a, b, o) { o = o || {}; o.solid = true; paintLeaf(c, g, a, b, o); }, rng: rng };
})();

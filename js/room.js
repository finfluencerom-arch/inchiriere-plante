/* VERDÉ — „Studiu de lumină”: o cameră desenată ca o planșă de arhitectură (axonometrie).
   Cinci situații din aceeași cameră: lumină naturală, umbră, lângă ușă (curent și răcoare),
   pe raft sau pe masă, piesă de impact la intrare. Plantele potrivite „merg” la locul lor,
   apoi animația trece singură la situația următoare. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Geometrie izometrică ---------- */
  var W = 6, D = 5, H = 3, S = 58, C = Math.cos(Math.PI / 6), SN = 0.5, OX = 330, OY = 240;
  function P(x, y, z) { return [OX + (x - y) * C * S, OY + (x + y) * SN * S - (z || 0) * S]; }
  function f1(n) { return n.toFixed(1); }
  function pts(arr) { return arr.map(function (a) { var p = P(a[0], a[1], a[2]); return f1(p[0]) + "," + f1(p[1]); }).join(" "); }
  function line(a, b, cls) { var p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]); return '<line class="' + (cls || "ln") + '" x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '"/>'; }
  function poly(arr, cls, extra) { return '<polygon class="' + cls + '" ' + (extra || "") + ' points="' + pts(arr) + '"/>'; }

  /* ---------- Plante desenate în linie ---------- */
  function leaf(x, y, ang, len, w) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    function r(px, py) { return f1(x + px * ca - py * sa) + "," + f1(y + px * sa + py * ca); }
    return '<path d="M' + r(0, 0) + " Q" + r(w, -len * 0.5) + " " + r(0, -len) + " Q" + r(-w, -len * 0.5) + " " + r(0, 0) + 'Z"/>';
  }
  function stem(x1, y1, x2, y2, thin) { return '<line class="stem' + (thin ? " thin" : "") + '" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '"/>'; }
  function pot(k) { return '<path class="pot" d="M' + (-13 * k) + "," + (-22 * k) + " L" + 13 * k + "," + (-22 * k) + " L" + 10 * k + ",0 L" + (-10 * k) + ',0Z"/><line class="ln" x1="' + (-14 * k) + '" y1="' + (-22 * k) + '" x2="' + 14 * k + '" y2="' + (-22 * k) + '"/>'; }
  var PLANT = {
    lyrata: function () { var s = stem(0, -22, 2, -96); [[-0.9, -60], [0.9, -66], [-1.1, -76], [1.0, -82], [-0.6, -92], [0.5, -98], [0, -104]].forEach(function (l) { s += leaf(1, l[1], l[0], 22, 9); }); return pot(1) + s; },
    strelitzia: function () { var s = ""; [-0.5, -0.2, 0.1, 0.35, 0.6].forEach(function (a, i) { var len = 46 + (i % 2) * 14, ex = Math.sin(a) * len, ey = -22 - Math.cos(a) * len; s += stem(0, -22, ex, ey) + leaf(ex, ey, a * 1.2, 40, 11); }); return pot(1.05) + s; },
    olive: function () { var s = '<path class="stem" d="M0,-22 C-4,-40 6,-50 0,-66"/>'; for (var i = 0; i < 26; i++) { var a = i * 2.4, rr = 6 + (i % 5) * 4; s += leaf(Math.cos(a) * rr, -74 + Math.sin(a) * rr * 0.7, a, 10, 2.4); } return pot(0.95) + s; },
    aspidistra: function () { var s = ""; [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75, 0].forEach(function (a, i) { s += leaf(0, -22, a, 46 + (i % 3) * 8, 7); }); return pot(1) + s; },
    zz: function () { var s = ""; [-0.45, -0.15, 0.15, 0.45].forEach(function (a) { var len = 52, ex = Math.sin(a) * len, ey = -22 - Math.cos(a) * len; s += stem(0, -22, ex, ey); for (var t = 0.35; t <= 1; t += 0.16) { var px = Math.sin(a) * len * t, py = -22 - Math.cos(a) * len * t; s += leaf(px, py, a + 0.9, 9, 3.5) + leaf(px, py, a - 0.9, 9, 3.5); } }); return pot(0.95) + s; },
    kentia: function () { var s = ""; [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].forEach(function (a) { var len = 62, ex = Math.sin(a) * len, ey = -22 - Math.cos(a) * len * 0.9, cx = Math.sin(a) * len * 0.4, cy = -22 - len * 0.85; s += '<path class="stem" d="M0,-22 Q' + f1(cx) + "," + f1(cy) + " " + f1(ex) + "," + f1(ey) + '"/>'; for (var t = 0.25; t < 1; t += 0.09) { var u = 1 - t, px = 2 * u * t * cx + t * t * ex, py = u * u * -22 + 2 * u * t * cy + t * t * ey; s += stem(px, py, px - 7, py + 9, true) + stem(px, py, px + 7, py + 9, true); } }); return pot(1.05) + s; },
    sansevieria: function () { var s = ""; [-0.32, -0.18, -0.05, 0.08, 0.2, 0.33].forEach(function (a, i) { s += leaf(0, -22, a, 40 + (i % 3) * 9, 4.2); }); return pot(0.9) + s; },
    rhapis: function () { var s = ""; [-0.22, -0.08, 0.06, 0.2].forEach(function (a, i) { var len = 58 + (i % 2) * 18, ex = Math.sin(a) * len, ey = -22 - Math.cos(a) * len; s += stem(0, -22, ex, ey); for (var k = 0; k < 7; k++) s += leaf(ex, ey, (k / 6 - 0.5) * 2.2 + a, 18, 2.6); }); return pot(1) + s; },
    pothos: function () { var s = ""; [[-1, 1.2], [1, 1.0], [-0.4, 1.6]].forEach(function (v) { var x = v[0] * 10, d = 34 * v[1]; s += '<path class="stem" d="M' + x + ",-20 C" + (x + v[0] * 10) + ",-12 " + (x + v[0] * 4) + "," + f1(d * 0.4) + " " + (x + v[0] * 6) + "," + f1(d) + '"/>'; for (var t = 0.15; t < 1; t += 0.2) s += leaf(x + v[0] * (6 + 4 * Math.sin(t * 3)), -18 + (d + 18) * t, v[0] * 1.6, 9, 5); }); for (var i = 0; i < 5; i++) s += leaf((i - 2) * 5, -22, (i - 2) * 0.5, 13, 6); return pot(0.85) + s; },
    lily: function () { var s = ""; [-0.6, -0.3, 0, 0.3, 0.6].forEach(function (a) { s += leaf(0, -22, a, 32, 7); }); [-0.15, 0.2].forEach(function (a) { var ex = Math.sin(a) * 44, ey = -22 - Math.cos(a) * 44; s += stem(0, -22, ex, ey, true) + '<g class="bloom">' + leaf(ex, ey + 6, a, 14, 5) + "</g>"; }); return pot(0.85) + s; },
    monstera: function () {
      var s = "";
      [-0.7, -0.35, 0, 0.35, 0.7].forEach(function (a, i) {
        var len = 40 + (i % 2) * 12, ex = Math.sin(a) * len, ey = -22 - Math.cos(a) * len, ang = a * 1.3, ca = Math.cos(ang), sa = Math.sin(ang), by = ey + 4;
        s += stem(0, -22, ex, ey) + leaf(ex, by, ang, 34, 15);
        for (var k = 1; k <= 3; k++) {
          var ty = -k * 8.5;
          [-1, 1].forEach(function (sd) {
            var w = 13 * Math.sin(Math.PI * (k * 8.5) / 34) + 1, x1 = ex + sd * w * ca - ty * sa, y1 = by + sd * w * sa + ty * ca, x2 = ex + sd * 4 * ca - (ty + 2) * sa, y2 = by + sd * 4 * sa + (ty + 2) * ca;
            s += '<line class="slit" x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '"/>';
          });
        }
      });
      return pot(1.05) + s;
    }
  };

  var SCENES = [
    { id: "lumina", tab: "Lumină naturală", title: "Lângă geam: plante care cer lumină",
      text: "Ficus lyrata, Strelitzia și Măslinul cresc frumos doar aproape de o fereastră luminoasă. Le așezăm unde cade lumina naturală.",
      sheet: "Scena 01: lumină naturală",
      plants: [
        { kind: "olive", name: "Măslin", from: [3.6, 3.9, 0], to: [1.2, 3.3, 0], lab: [-110, -50] },
        { kind: "lyrata", name: "Ficus lyrata", from: [3.8, 2.6, 0], to: [1.5, 2.1, 0], lab: [-120, -120] },
        { kind: "strelitzia", name: "Strelitzia", from: [4.2, 3.5, 0], to: [2.6, 3.4, 0], lab: [60, -110] }] },
    { id: "umbra", tab: "Umbră", title: "În colțul umbrit: plante care nu cer soare",
      text: "Aspidistra, Zamioculcas și Palmierul Kentia rezistă departe de geam. Pentru colțurile fără lumină alegem doar specii ca acestea.",
      sheet: "Scena 02: umbră",
      plants: [
        { kind: "kentia", name: "Palmier Kentia", from: [1.6, 2.4, 0], to: [5.4, 0.6, 0], lab: [46, -120] },
        { kind: "aspidistra", name: "Aspidistra", from: [1.4, 3.0, 0], to: [4.55, 0.65, 0], lab: [-60, -110] },
        { kind: "zz", name: "Zamioculcas", from: [2.3, 3.2, 0], to: [5.3, 1.9, 0], lab: [74, -30] }] },
    { id: "usa", tab: "Lângă ușă", title: "Lângă intrare: curent și răcoare",
      text: "Ușa deschisă des aduce curent și aer rece iarna. Aici punem plante care rezistă la 10–16 °C: Aspidistra, Sansevieria și Palmierul evantai.",
      sheet: "Scena 03: curent de aer",
      plants: [
        { kind: "rhapis", name: "Palmier evantai", from: [4.6, 3.8, 0], to: [2.2, 1.3, 0], lab: [-120, -110] },
        { kind: "aspidistra", name: "Aspidistra", from: [5.0, 3.2, 0], to: [4.2, 1.0, 0], lab: [64, -96] },
        { kind: "sansevieria", name: "Sansevieria", from: [4.4, 4.2, 0], to: [3.1, 2.4, 0], lab: [70, -30] }] },
    { id: "raft", tab: "Raft și masă", title: "Pe raft și pe masă: plante mici",
      text: "Nu orice spațiu are loc pe jos. Pothos curge frumos de pe un raft, Sansevieria stă dreaptă lângă el, iar Spathiphyllum înflorește pe masă.",
      sheet: "Scena 04: raft și masă",
      plants: [
        { kind: "pothos", name: "Pothos", from: [1.2, 3.9, 0], to: [0.2, 3.8, 1.35], lab: [-40, -70], k: 0.85 },
        { kind: "sansevieria", name: "Sansevieria", from: [1.4, 4.5, 0], to: [0.2, 4.45, 1.35], lab: [-20, -112], k: 0.8 },
        { kind: "lily", name: "Spathiphyllum", from: [3.0, 4.6, 0], to: [4.3, 3.6, 0.72], lab: [64, -70], k: 0.85 }] },
    { id: "intrare", tab: "Piesă de impact", title: "La intrare: o piesă de impact",
      text: "Într-un spațiu mare, o plantă înaltă schimbă tot decorul. Monstera și Strelitzia primesc oaspeții chiar de la intrare.",
      sheet: "Scena 05: piesă de impact",
      plants: [
        { kind: "monstera", name: "Monstera", from: [3.0, 2.6, 0], to: [5.5, 2.7, 0], lab: [70, -120], k: 1.2 },
        { kind: "strelitzia", name: "Strelitzia", from: [3.0, 3.6, 0], to: [4.4, 4.5, 0], lab: [-120, -120], k: 1.2 }] }
  ];

  function roomSVG(sc, idx) {
    var s = '<svg viewBox="0 0 760 600" role="img" aria-label="' + sc.title + '"><defs>' +
      '<pattern id="hatch' + idx + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="hatch-line"/></pattern>' +
      '<pattern id="poche' + idx + '" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="4" class="poche-line"/></pattern>' +
      '<linearGradient id="beam' + idx + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2DFA8" stop-opacity="0.5"/><stop offset="1" stop-color="#F2DFA8" stop-opacity="0"/></linearGradient>' +
      '<marker id="arrow' + idx + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" class="arrowhead"/></marker>' +
      '<marker id="wind' + idx + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" class="windhead"/></marker></defs>';

    /* podea, grilă, pereți */
    s += poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], "floor");
    for (var gx = 1; gx < W; gx++) s += line([gx, 0, 0], [gx, D, 0], "grid");
    for (var gy = 1; gy < D; gy++) s += line([0, gy, 0], [W, gy, 0], "grid");
    s += poly([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], "wall wall-a");
    s += poly([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], "wall wall-b");
    var t = 0.18, cutPts = pts([[0, 0, H], [W, 0, H], [W, -t, H], [-t, -t, H], [-t, D, H], [0, D, H]]);
    s += '<polygon class="cut" points="' + cutPts + '"/><polygon class="cut-fill" fill="url(#poche' + idx + ')" points="' + cutPts + '"/>';

    /* ușa din peretele din spate, cu arcul de deschidere desenat pe podea */
    var dx0 = 2.7, dx1 = 3.6, dh = 2.2;
    s += poly([[dx0, 0, 0], [dx1, 0, 0], [dx1, 0, dh], [dx0, 0, dh]], "door");
    s += line([dx0, 0, 0], [dx0, 0, dh], "frame") + line([dx0, 0, dh], [dx1, 0, dh], "frame") + line([dx1, 0, dh], [dx1, 0, 0], "frame");
    var arc = [];
    for (var ai = 0; ai <= 12; ai++) { var an = ai / 12 * Math.PI / 2; arc.push([dx0 + Math.cos(an) * 0.9, Math.sin(an) * 0.9, 0]); }
    s += '<polyline class="swing" points="' + pts(arc) + '"/>' + line([dx0, 0, 0], [dx0, 0.9, 0], "swing");

    /* raftul de pe peretele din stânga */
    s += poly([[0, 3.5, 1.35], [0.38, 3.5, 1.35], [0.38, 4.8, 1.35], [0, 4.8, 1.35]], "shelf");
    s += line([0.38, 3.5, 1.35], [0.38, 4.8, 1.35], "frame thin") + line([0.38, 3.5, 1.29], [0.38, 4.8, 1.29], "frame thin");

    /* zona de umbră și zona de intrare */
    s += poly([[3.9, 0, 0], [W, 0, 0], [W, 2.6, 0], [3.9, 2.6, 0]], "shade-zone", 'fill="url(#hatch' + idx + ')"');
    var ent = [];
    for (var ei = 0; ei <= 32; ei++) { var ea = ei / 32 * Math.PI * 2; ent.push([5.0 + Math.cos(ea) * 0.9, 3.6 + Math.sin(ea) * 1.2, 0]); }
    s += '<polygon class="entry-zone" points="' + pts(ent) + '"/>';

    /* fereastra */
    var y0 = 1.3, y1 = 3.1, z0 = 0.8, z1 = 2.5;
    s += poly([[0, y0, z0], [0, y1, z0], [0, y1, z1], [0, y0, z1]], "glass");
    s += line([0, y0, z0], [0, y1, z0], "frame") + line([0, y1, z0], [0, y1, z1], "frame") + line([0, y1, z1], [0, y0, z1], "frame") + line([0, y0, z1], [0, y0, z0], "frame");
    s += line([0, (y0 + y1) / 2, z0], [0, (y0 + y1) / 2, z1], "frame thin") + line([0, y0, 2.0], [0, y1, 2.0], "frame thin");
    s += line([0.12, y0 - 0.05, z0], [0.12, y1 + 0.05, z0], "frame");

    /* lumina */
    var kx = 1 / 0.8, ky = 0.35 / 0.8;
    function hit(y, z) { return [z * kx, y + z * ky, 0]; }
    var f = [hit(y0, z0), hit(y1, z0), hit(y1, z1), hit(y0, z1)];
    s += '<g class="beam"><polygon fill="url(#beam' + idx + ')" points="' + pts([[0, y0, z1], [0, y1, z1], f[2], f[3]]) + '"/>' +
      '<polygon fill="url(#beam' + idx + ')" points="' + pts([[0, y1, z0], [0, y1, z1], f[2], f[1]]) + '"/>' + poly(f, "patch") + "</g>";
    [[y0 + 0.3, z1], [y0 + 1.0, z1], [y1 - 0.2, z1], [y0 + 0.6, 1.6]].forEach(function (r) { s += line([0, r[0], r[1]], hit(r[0], r[1]), "ray"); });

    /* curentul de aer care intră pe ușă */
    s += '<g class="wind">';
    [[2.95, 1.2], [3.2, 0.7], [3.45, 1.5]].forEach(function (w, i) {
      var a = P(w[0], 0.2, w[1]), b = P(w[0] + 0.3, 2.6, w[1] - 0.5), m = P(w[0] - 0.3, 1.3, w[1] + 0.25);
      s += '<path style="--i:' + i + '" marker-end="url(#wind' + idx + ')" d="M' + f1(a[0]) + "," + f1(a[1]) + " Q" + f1(m[0]) + "," + f1(m[1]) + " " + f1(b[0]) + "," + f1(b[1]) + '"/>';
    });
    s += "</g>";

    /* mobilier: bancă și masă rotundă */
    function box(x0, y0b, x1, y1b, h, cls) {
      return poly([[x0, y1b, 0], [x1, y1b, 0], [x1, y1b, h], [x0, y1b, h]], cls + " side") +
        poly([[x1, y0b, 0], [x1, y1b, 0], [x1, y1b, h], [x1, y0b, h]], cls + " side2") +
        poly([[x0, y0b, h], [x1, y0b, h], [x1, y1b, h], [x0, y1b, h]], cls + " top");
    }
    s += box(0.9, 0.05, 2.3, 0.7, 0.45, "furn");
    var tc = P(4.3, 3.6, 0.72), tb = P(4.3, 3.6, 0);
    s += '<line class="ln" x1="' + f1(tb[0]) + '" y1="' + f1(tb[1]) + '" x2="' + f1(tc[0]) + '" y2="' + f1(tc[1]) + '"/><ellipse class="furn top" cx="' + f1(tc[0]) + '" cy="' + f1(tc[1]) + '" rx="' + f1(0.55 * S * C * 1.15) + '" ry="' + f1(0.55 * S * 0.58) + '"/>';

    /* cote */
    var a1 = P(0, D + 0.55, 0), a2 = P(W, D + 0.55, 0), b1 = P(W + 0.55, 0, 0), b2 = P(W + 0.55, D, 0);
    var am = [(a1[0] + a2[0]) / 2, (a1[1] + a2[1]) / 2], bm = [(b1[0] + b2[0]) / 2, (b1[1] + b2[1]) / 2];
    s += '<g class="dim"><line x1="' + f1(a1[0]) + '" y1="' + f1(a1[1]) + '" x2="' + f1(a2[0]) + '" y2="' + f1(a2[1]) + '"/><line x1="' + f1(b1[0]) + '" y1="' + f1(b1[1]) + '" x2="' + f1(b2[0]) + '" y2="' + f1(b2[1]) + '"/>' +
      line([0, D, 0], [0, D + 0.7, 0], "dimx") + line([W, D, 0], [W, D + 0.7, 0], "dimx") + line([W, 0, 0], [W + 0.7, 0, 0], "dimx") + line([W, D, 0], [W + 0.7, D, 0], "dimx") +
      '<text x="' + f1(am[0] + 10) + '" y="' + f1(am[1] + 18) + '" transform="rotate(30 ' + f1(am[0]) + " " + f1(am[1]) + ')">6,00 m</text>' +
      '<text x="' + f1(bm[0] + 6) + '" y="' + f1(bm[1] + 16) + '" transform="rotate(-30 ' + f1(bm[0]) + " " + f1(bm[1]) + ')">5,00 m</text></g>';

    /* soarele și notele */
    var sun = P(-1.4, 1.2, 3.6);
    s += '<g class="sun" transform="translate(' + f1(sun[0]) + "," + f1(sun[1]) + ')"><circle r="13"/>';
    for (var k = 0; k < 8; k++) { var sa = k * Math.PI / 4; s += '<line x1="' + f1(Math.cos(sa) * 19) + '" y1="' + f1(Math.sin(sa) * 19) + '" x2="' + f1(Math.cos(sa) * 26) + '" y2="' + f1(Math.sin(sa) * 26) + '"/>'; }
    s += "</g>";
    var wl = P(0, y0 - 0.2, z1 + 0.35);
    s += '<text class="note" x="' + f1(wl[0] - 110) + '" y="' + f1(wl[1]) + '">Fereastră spre sud</text>';
    var sl = P(5.0, 2.6, 0); s += '<text class="note n-umbra" x="' + f1(sl[0] + 8) + '" y="' + f1(sl[1] + 22) + '">Zonă umbrită</text>';
    var dl = P(3.15, 0, dh + 0.25); s += '<text class="note n-usa" x="' + f1(dl[0] - 44) + '" y="' + f1(dl[1]) + '">Ușă: curent, 10–16 °C</text>';
    var rl = P(0, 4.15, 2.05); s += '<text class="note n-raft" x="' + f1(rl[0] - 50) + '" y="' + f1(rl[1]) + '">Raft</text>';
    var il = P(5.3, 4.9, 0); s += '<text class="note n-intrare" x="' + f1(il[0] - 20) + '" y="' + f1(il[1] + 26) + '">Intrare</text>';

    /* plantele care „merg” la locul lor */
    var order = sc.plants.slice().sort(function (a, b) { return (a.to[0] + a.to[1]) - (b.to[0] + b.to[1]); });
    order.forEach(function (pl, i) {
      var to = P(pl.to[0], pl.to[1], pl.to[2]), fr = P(pl.from[0], pl.from[1], pl.from[2]), delay = (0.5 + i * 0.45).toFixed(2) + "s", k = (pl.k || 1) * 1.3;
      var mid = [(to[0] + fr[0]) / 2, Math.min(to[1], fr[1]) - 34];
      s += '<path class="trail" style="--delay:' + delay + '" marker-end="url(#arrow' + idx + ')" d="M' + f1(fr[0]) + "," + f1(fr[1]) + " Q" + f1(mid[0]) + "," + f1(mid[1]) + " " + f1(to[0]) + "," + f1(to[1]) + '"/>';
      s += '<g transform="translate(' + f1(to[0]) + "," + f1(to[1]) + ')"><g class="walker" style="--dx:' + f1(fr[0] - to[0]) + "px;--dy:" + f1(fr[1] - to[1]) + "px;--delay:" + delay + '"><g class="bob">' +
        '<ellipse class="shadow" cx="0" cy="1" rx="' + f1(18 * k) + '" ry="' + f1(4.6 * k) + '"/><g class="plant" transform="scale(' + k.toFixed(2) + ')">' + PLANT[pl.kind]() + "</g></g></g>" +
        '<g class="label" style="--delay:' + (parseFloat(delay) + 1.7).toFixed(2) + 's"><line x1="0" y1="' + f1(-44 * k) + '" x2="' + pl.lab[0] + '" y2="' + pl.lab[1] + '"/><circle cx="0" cy="' + f1(-44 * k) + '" r="2.2"/><text x="' + (pl.lab[0] + (pl.lab[0] < 0 ? -4 : 4)) + '" y="' + (pl.lab[1] - 5) + '" text-anchor="' + (pl.lab[0] < 0 ? "end" : "start") + '">' + pl.name + "</text></g></g>";
    });

    /* cartușul planșei */
    s += '<g class="sheet" transform="translate(538,524)"><rect width="206" height="62"/><line x1="0" y1="24" x2="206" y2="24"/><line x1="140" y1="24" x2="140" y2="62"/>' +
      '<text x="10" y="17" class="sheet-title">VERDÉ, studiu de lumină</text><text x="10" y="40">' + sc.sheet + '</text><text x="10" y="55">Oradea</text><text x="150" y="40">Scara</text><text x="150" y="55">1:50</text></g>';
    return s + "</svg>";
  }

  function mount(host) {
    host.classList.add("room");
    host.innerHTML =
      '<div class="room-tabs" role="tablist" aria-label="Situații"></div>' +
      '<div class="room-viewport"><div class="room-track"></div></div>' +
      '<div class="room-caption" aria-live="polite"><p class="room-count"></p><h3></h3><p class="room-text"></p></div>';
    var tabs = host.querySelector(".room-tabs"), track = host.querySelector(".room-track"), cap = host.querySelector(".room-caption");
    var slides = SCENES.map(function (sc, i) {
      var sl = document.createElement("div"); sl.className = "room-slide scene-" + sc.id; sl.innerHTML = roomSVG(sc, host.dataset.uid + i); track.appendChild(sl);
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "tab");
      b.innerHTML = "<span>" + sc.tab + '</span><i class="bar"></i>';
      b.addEventListener("click", function () { go(i, true); });
      tabs.appendChild(b);
      return sl;
    });
    var cur = -1, paused = false;
    function go(i, user) {
      i = (i + SCENES.length) % SCENES.length;
      if (i === cur && !user) return;
      cur = i;
      track.style.transform = "translateX(" + (-100 * i) + "%)";
      tabs.querySelectorAll("button").forEach(function (b, k) {
        b.setAttribute("aria-selected", k === i ? "true" : "false");
        var bar = b.querySelector(".bar"); bar.classList.remove("run"); if (k === i && !reduce) { void bar.offsetWidth; bar.classList.add("run"); }
      });
      slides.forEach(function (s) { s.classList.remove("play"); });
      var sl = slides[i]; void sl.offsetWidth;
      setTimeout(function () { sl.classList.add("play"); }, reduce ? 0 : 450);
      cap.querySelector(".room-count").textContent = "Situația " + (i + 1) + " din " + SCENES.length;
      cap.querySelector("h3").textContent = SCENES[i].title; cap.querySelector(".room-text").textContent = SCENES[i].text;
    }
    tabs.addEventListener("animationend", function (e) { if (e.target.classList.contains("bar") && !paused) go(cur + 1); });
    host.addEventListener("mouseenter", function () { paused = true; host.classList.add("paused"); });
    host.addEventListener("mouseleave", function () { paused = false; host.classList.remove("paused"); });
    var vp = host.querySelector(".room-viewport"), sx = null;
    vp.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    vp.addEventListener("pointerup", function (e) { if (sx === null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 40) go(cur + (d < 0 ? 1 : -1), true); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting && cur === -1) go(0); }); }, { threshold: 0.25 });
      io.observe(host);
    }
    setTimeout(function () { if (cur === -1) go(0); }, 1500);
  }

  var uid = 0;
  window.VerdeRoom = { mountAll: function () { document.querySelectorAll("[data-room]:not(.room)").forEach(function (h) { h.dataset.uid = "r" + (uid++); mount(h); }); } };
})();

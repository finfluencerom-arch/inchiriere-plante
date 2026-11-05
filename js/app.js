/* VERDÉ — logica platformei: navigare, catalog, Plant Match, selecție, abonamente, cerere, Plant Passport */
(function () {
  "use strict";

  var D = window.VERDE, Art = window.VerdeArt;
  var PLANTS = D.plants, BY_ID = {};
  PLANTS.forEach(function (p) { BY_ID[p.id] = p; });
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stocarea poate fi blocată */ } }

  var MONTHS = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."];
  var DAYS = ["dum.", "lun.", "mar.", "mie.", "joi", "vin.", "sâm."];
  function fmtDate(iso) { var p = iso.split("-"); return parseInt(p[2], 10) + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0]; }

  var LIGHT = { low: "Lumină slabă", medium: "Lumină moderată", bright: "Lumină multă" };
  var SIZE = { small: "Mică, pentru blat", medium: "Medie, pe pardoseală", large: "Mare, piesă centrală" };
  var STYLE = { minimal: "Minimalist", luxuriant: "Luxuriant", elegant: "Elegant" };
  var ICON = {
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10"/></svg>'
  };

  /* ================= Selecția ================= */
  var sel = load("verde-sel", { items: {}, pack: null });
  if (!sel.items) sel = { items: {}, pack: null };
  function selCount() { var n = 0; for (var k in sel.items) n += sel.items[k]; return n; }
  function persist() { save("verde-sel", sel); updateBadge(); renderDrawer(); syncAddButtons(); if (current === "cerere") renderSummary(); if (current === "abonamente") renderPackages(); }
  function addPlant(id, qty, silent) {
    sel.items[id] = (sel.items[id] || 0) + (qty || 1); persist();
    var b = $("cart-count"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    if (!silent) toast(esc(BY_ID[id].name) + " a fost adăugată în selecție.", "Vezi selecția", openDrawer);
  }
  function setQty(id, q) { if (q <= 0) delete sel.items[id]; else sel.items[id] = q; persist(); }
  function updateBadge() { $("cart-count").textContent = selCount(); }
  function syncAddButtons() {
    document.querySelectorAll(".add-btn[data-id]").forEach(function (b) {
      var q = sel.items[b.getAttribute("data-id")];
      b.classList.toggle("in", !!q);
      var nm = BY_ID[b.getAttribute("data-id")].name;
      b.innerHTML = q ? ICON.check : ICON.plus;
      b.setAttribute("aria-label", q ? nm + " e în selecție (" + q + "). Adaugă încă una" : "Adaugă " + nm + " în selecție");
    });
  }

  /* ================= Toast ================= */
  var toastTimer;
  function toast(msg, action, fn) {
    var t = $("toast"); t.innerHTML = "<span>" + msg + "</span>";
    if (action) { var b = el("button", "", esc(action)); b.type = "button"; b.addEventListener("click", function () { t.hidden = true; fn(); }); t.appendChild(b); }
    t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 4200);
  }

  /* ================= Desenarea ilustrațiilor ================= */
  function paintCanvases(root) {
    (root || document).querySelectorAll("canvas[data-plant]").forEach(function (c) {
      if (c.dataset.painted === String(c.clientWidth) || !c.clientWidth) return;
      Art.draw(c, BY_ID[c.getAttribute("data-plant")]); c.dataset.painted = String(c.clientWidth);
    });
  }
  window.addEventListener("resize", function () { clearTimeout(paintCanvases.t); paintCanvases.t = setTimeout(function () { paintCanvases(); drawFeature(true); }, 250); });

  /* ================= Card de plantă ================= */
  function plantCard(p, score) {
    var c = el("article", "plant-card");
    c.innerHTML =
      '<button class="card-art" type="button" aria-label="Detalii ' + esc(p.name) + '"><canvas data-plant="' + p.id + '"></canvas>' +
      (score ? '<span class="match-score">' + score + "% potrivire</span>" : "") + "</button>" +
      '<div class="card-body"><div class="card-text"><h3><button type="button">' + esc(p.name) + '</button></h3><p class="latin">' + esc(p.latin) + "</p></div>" +
      '<button type="button" class="add-btn" data-id="' + p.id + '"></button></div>';
    c.querySelector(".card-art").addEventListener("click", function () { openPlant(p.id); });
    c.querySelector("h3 button").addEventListener("click", function () { openPlant(p.id); });
    c.querySelector(".add-btn").addEventListener("click", function () { addPlant(p.id); });
    return c;
  }

  /* ================= Router ================= */
  var current = null, rendered = {};
  var VIEWS = ["acasa", "plante", "potrivire", "abonamente", "pasaport", "despre", "cerere"];
  function route() {
    var h = (location.hash || "").replace("#", "");
    var name = h, code = null;
    if (h.indexOf("pasaport-") === 0) { name = "pasaport"; code = h.slice(9).toUpperCase(); }
    if (VIEWS.indexOf(name) === -1) name = "acasa";
    var changed = name !== current;
    VIEWS.forEach(function (v) { $("view-" + v).hidden = v !== name; });
    document.querySelectorAll(".nav a").forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-route") === name); });
    closeMenu();
    var view = $("view-" + name);
    if (changed) {
      view.classList.remove("enter"); void view.offsetWidth; view.classList.add("enter");
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    current = name; document.documentElement.setAttribute("data-view", name);
    if (!rendered[name]) { (INIT[name] || function () {})(); rendered[name] = true; }
    if (name === "pasaport") showPassport(code);
    if (name === "cerere") renderSummary();
    if (name === "abonamente") renderPackages();
    requestAnimationFrame(function () { paintCanvases(view); if (name === "acasa") drawFeature(); if (window.VerdeRoom) window.VerdeRoom.mountAll(); });
  }
  window.addEventListener("hashchange", route);

  /* ================= Acasă ================= */
  var FEATURED = ["kentia", "monstera", "strelitzia", "lyrata"], fIndex = 0, fTimer = null, fPaused = false;
  function drawFeature(force) {
    var c = $("feature-canvas"); if (!c || !c.clientWidth) return;
    var p = BY_ID[FEATURED[fIndex]];
    if (force || c.dataset.plant !== p.id) { Art.draw(c, p); c.dataset.plant = p.id; }
  }
  function showFeature(i) {
    fIndex = (i + FEATURED.length) % FEATURED.length;
    var p = BY_ID[FEATURED[fIndex]], c = $("feature-canvas");
    var apply = function () {
      $("feature-name").textContent = p.name; $("feature-latin").textContent = p.latin; $("feature-note").textContent = p.note;
      drawFeature(); c.classList.remove("swap");
    };
    if (reduce || !c.dataset.plant) apply(); else { c.classList.add("swap"); setTimeout(apply, 380); }
    document.querySelectorAll("#feature-dots button").forEach(function (b, k) { b.setAttribute("aria-selected", k === fIndex ? "true" : "false"); });
  }
  function initHome() {
    var dots = $("feature-dots");
    FEATURED.forEach(function (id, k) {
      var b = el("button"); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-label", BY_ID[id].name);
      b.addEventListener("click", function () { showFeature(k); restartFeature(); }); dots.appendChild(b);
    });
    $("feature-add").addEventListener("click", function () { addPlant(FEATURED[fIndex]); });
    $("feature-more").addEventListener("click", function () { openPlant(FEATURED[fIndex]); });
    var card = $("feature-card");
    card.addEventListener("mouseenter", function () { fPaused = true; }); card.addEventListener("mouseleave", function () { fPaused = false; });
    showFeature(0); restartFeature();
    var car = $("home-carousel");
    if (car) ["monstera", "kentia", "zz", "spathiphyllum", "strelitzia", "pothos", "olea", "rhapis"].forEach(function (id) { car.appendChild(plantCard(BY_ID[id])); });
    syncAddButtons();
  }
  function restartFeature() {
    clearInterval(fTimer); if (reduce) return;
    fTimer = setInterval(function () { if (!fPaused && current === "acasa" && !document.hidden) showFeature(fIndex + 1); }, 7000);
  }

  /* ================= Catalog ================= */
  var filt = { light: null, size: null, cool: false, drafts: false, petSafe: false, q: "" };
  function initCatalog() {
    document.querySelectorAll(".fchip").forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f"), v = b.getAttribute("data-v");
        if (f === "light" || f === "size") filt[f] = filt[f] === v ? null : v; else filt[f] = !filt[f];
        renderCatalog();
      });
    });
    $("f-search").addEventListener("input", function () { filt.q = this.value.trim().toLowerCase(); renderCatalog(); });
    $("f-reset").addEventListener("click", function () { filt = { light: null, size: null, cool: false, drafts: false, petSafe: false, q: "" }; $("f-search").value = ""; renderCatalog(); });
    renderCatalog();
  }
  function renderCatalog() {
    document.querySelectorAll(".fchip").forEach(function (b) {
      var f = b.getAttribute("data-f"), v = b.getAttribute("data-v");
      b.setAttribute("aria-pressed", (f === "light" || f === "size") ? String(filt[f] === v) : String(!!filt[f]));
    });
    var list = PLANTS.filter(function (p) {
      if (filt.light && p.light.indexOf(filt.light) === -1) return false;
      if (filt.size && p.size !== filt.size) return false;
      if (filt.cool && !p.cool) return false;
      if (filt.drafts && !p.drafts) return false;
      if (filt.petSafe && !p.petSafe) return false;
      if (filt.q && (p.name + " " + p.latin).toLowerCase().indexOf(filt.q) === -1) return false;
      return true;
    });
    var active = filt.light || filt.size || filt.cool || filt.drafts || filt.petSafe || filt.q;
    $("f-reset").hidden = !active;
    $("result-count").textContent = list.length === PLANTS.length ? "Toate cele " + list.length + " plante" : list.length + (list.length === 1 ? " plantă potrivită" : " plante potrivite");
    var g = $("plant-grid"); g.innerHTML = "";
    if (!list.length) {
      var e = el("div", "empty", "<h3>Nicio plantă nu bifează toate condițiile</h3><p>Scoate unul dintre filtre sau programează o evaluare și găsim împreună o soluție pentru spațiul tău.</p>");
      var b = el("button", "btn small", "Șterge filtrele"); b.type = "button"; b.addEventListener("click", function () { $("f-reset").click(); });
      e.appendChild(b); g.appendChild(e);
    } else list.forEach(function (p) { g.appendChild(plantCard(p)); });
    syncAddButtons(); requestAnimationFrame(function () { paintCanvases(g); });
  }

  /* ================= Plant Match ================= */
  var SVG = {
    lowLight: '<svg viewBox="0 0 32 32"><path d="M20 8a9 9 0 1 0 4 15A10 10 0 0 1 20 8z"/></svg>',
    midLight: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="5"/><path d="M16 5v3M16 24v3M5 16h3M24 16h3"/></svg>',
    highLight: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M7 25l3-3M22 10l3-3"/></svg>',
    small: '<svg viewBox="0 0 32 32"><path d="M11 20h10l-1 7h-8z"/><path d="M16 20v-6M16 15c-3 0-4-3-4-5 3 0 4 2 4 5zM16 14c3 0 4-3 4-5-3 0-4 2-4 5z"/></svg>',
    medium: '<svg viewBox="0 0 32 32"><path d="M10 22h12l-1.5 7h-9z"/><path d="M16 22V9M16 13c-4 0-6-3-6-6 4 0 6 3 6 6zM16 17c4 0 6-3 6-6-4 0-6 3-6 6z"/></svg>',
    large: '<svg viewBox="0 0 32 32"><path d="M9 24h14l-2 6H11z"/><path d="M16 24V3M16 8c-4 0-7-2-8-5 4 0 7 2 8 5zM16 13c4 0 7-2 8-5-4 0-7 2-8 5zM16 18c-4 0-7-2-8-5 4 0 7 2 8 5z"/></svg>',
    warm: '<svg viewBox="0 0 32 32"><path d="M14 6a2 2 0 0 1 4 0v12a5 5 0 1 1-4 0z"/><path d="M16 12v8"/></svg>',
    cool: '<svg viewBox="0 0 32 32"><path d="M16 4v24M5 10l22 12M27 10 5 22"/></svg>',
    calm: '<svg viewBox="0 0 32 32"><path d="M6 26V8l10-4 10 4v18"/><path d="M13 26v-8h6v8"/></svg>',
    draft: '<svg viewBox="0 0 32 32"><path d="M4 12h16a4 4 0 1 0-4-4M4 18h20a4 4 0 1 1-4 4M4 24h8"/></svg>',
    minimal: '<svg viewBox="0 0 32 32"><rect x="7" y="7" width="18" height="18" rx="2"/></svg>',
    luxuriant: '<svg viewBox="0 0 32 32"><path d="M16 28C6 22 6 10 16 4c10 6 10 18 0 24z"/><path d="M16 8v20"/></svg>',
    elegant: '<svg viewBox="0 0 32 32"><path d="M16 4 26 16 16 28 6 16z"/></svg>'
  };
  var QUESTIONS = [
    { key: "light", q: "Câtă lumină naturală are locul?", opts: [
      ["low", "Puțină", "Departe de geam, hol, colț interior", SVG.lowLight],
      ["medium", "Moderată", "Lumină indirectă, la câțiva metri de geam", SVG.midLight],
      ["bright", "Multă", "Lângă vitrină sau o fereastră mare", SVG.highLight]] },
    { key: "size", q: "Unde va sta planta?", opts: [
      ["small", "Pe blat sau raft", "Recepție, bar, birou", SVG.small],
      ["medium", "Pe jos, într-un colț", "Lângă o canapea sau o masă", SVG.medium],
      ["large", "Piesă centrală", "Intrare, lobby, spațiu mare", SVG.large]] },
    { key: "temp", q: "Ce temperatură e acolo iarna?", opts: [
      ["normal", "Peste 16 °C", "Spațiu încălzit normal", SVG.warm],
      ["cool", "Răcoros", "Între 10 și 16 °C", SVG.cool]] },
    { key: "drafts", q: "E aproape de o ușă deschisă des?", opts: [
      ["no", "Nu", "Loc ferit de curent", SVG.calm],
      ["yes", "Da", "Intrare, ușă spre terasă", SVG.draft]] },
    { key: "style", q: "Ce stil are spațiul?", opts: [
      ["minimal", "Minimalist", "Linii curate, puține obiecte", SVG.minimal],
      ["luxuriant", "Luxuriant", "Verde mult, aer tropical", SVG.luxuriant],
      ["elegant", "Elegant", "Clasic, calm, rafinat", SVG.elegant]] }
  ];
  var answers = {}, step = 0;
  function initWizard() { step = 0; answers = {}; renderStep(); }
  function renderStep() {
    var body = $("wiz-body"); body.innerHTML = "";
    $("wiz-bar").style.width = (step / QUESTIONS.length * 100) + "%";
    if (step >= QUESTIONS.length) return renderResults();
    var Q = QUESTIONS[step], wrap = el("div", "wiz-step");
    wrap.innerHTML = '<p class="wiz-count">Întrebarea ' + (step + 1) + " din " + QUESTIONS.length + "</p><h2>" + Q.q + "</h2>";
    var opts = el("div", "options");
    Q.opts.forEach(function (o) {
      var b = el("button", "option", o[3] + "<strong>" + o[1] + "</strong><span>" + o[2] + "</span>");
      b.type = "button"; b.setAttribute("aria-pressed", answers[Q.key] === o[0] ? "true" : "false");
      b.addEventListener("click", function () {
        answers[Q.key] = o[0];
        opts.querySelectorAll(".option").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        setTimeout(function () { step++; renderStep(); }, reduce ? 0 : 260);
      });
      opts.appendChild(b);
    });
    wrap.appendChild(opts);
    var nav = el("div", "wiz-nav");
    if (step > 0) { var back = el("button", "link-btn", "Înapoi"); back.type = "button"; back.addEventListener("click", function () { step--; renderStep(); }); nav.appendChild(back); } else nav.appendChild(el("span"));
    wrap.appendChild(nav); body.appendChild(wrap);
    var first = opts.querySelector('[aria-pressed="true"]') || opts.querySelector(".option");
    if (first && document.activeElement && document.activeElement.closest && document.activeElement.closest("#wizard")) first.focus();
  }
  function matchPlants(a) {
    var ORDER = ["small", "medium", "large"];
    return PLANTS.filter(function (p) {
      return p.light.indexOf(a.light) !== -1 && !(a.temp === "cool" && !p.cool) && !(a.drafts === "yes" && !p.drafts);
    }).map(function (p) {
      var dist = Math.abs(ORDER.indexOf(p.size) - ORDER.indexOf(a.size));
      var s = (dist === 0 ? 3 : dist === 1 ? 1 : 0) + (p.styles.indexOf(a.style) !== -1 ? 2 : 0);
      return { p: p, s: s, pct: Math.round(60 + s / 5 * 39) };
    }).filter(function (x) { return x.s > 0; }).sort(function (x, y) { return y.s - x.s; }).slice(0, 6);
  }
  function renderResults() {
    var body = $("wiz-body"), res = matchPlants(answers), wrap = el("div", "wiz-step wiz-results");
    $("wiz-bar").style.width = "100%";
    var cond = [LIGHT[answers.light].toLowerCase(), answers.temp === "cool" ? "spațiu răcoros" : null, answers.drafts === "yes" ? "curent de aer" : null, STYLE[answers.style].toLowerCase()].filter(Boolean).join(", ");
    if (!res.length) {
      wrap.innerHTML = "<h2>Locul acesta cere o evaluare la fața locului</h2><p>Puține plante rezistă la " + esc(cond) + " în formatul ales. Programează o evaluare gratuită și găsim împreună o soluție.</p>";
      var b0 = el("a", "btn", "Programează evaluarea"); b0.href = "#cerere"; wrap.appendChild(b0);
    } else {
      wrap.innerHTML = '<p class="wiz-count">Rezultat</p><h2>' + res.length + " plante potrivite pentru spațiul tău</h2><p class=\"latin\" style=\"font-style:normal\">Condiții: " + esc(cond) + ".</p>";
      var actions = el("div", "btn-row");
      var all = el("button", "btn", "Adaugă toate în selecție"); all.type = "button";
      all.addEventListener("click", function () { res.forEach(function (x) { if (!sel.items[x.p.id]) sel.items[x.p.id] = 1; }); persist(); toast("Am adăugat " + res.length + " plante în selecție.", "Vezi selecția", openDrawer); });
      var again = el("button", "btn ghost", "Refă potrivirea"); again.type = "button"; again.addEventListener("click", initWizard);
      actions.appendChild(all); actions.appendChild(again); wrap.appendChild(actions);
      var g = el("div", "plant-grid"); res.forEach(function (x) { g.appendChild(plantCard(x.p, x.pct)); }); wrap.appendChild(g);
    }
    body.innerHTML = ""; body.appendChild(wrap); syncAddButtons();
    requestAnimationFrame(function () { paintCanvases(body); });
  }

  /* ================= Abonamente ================= */
  function renderPackages() {
    var box = $("packages"); box.innerHTML = "";
    D.packages.forEach(function (pk) {
      var c = el("article", "package" + (pk.featured ? " featured" : "") + (sel.pack === pk.id ? " chosen" : ""));
      c.innerHTML = (pk.featured ? '<span class="ribbon">Recomandat</span>' : "") + "<h2>" + esc(pk.name) + '</h2><p class="tagline">' + esc(pk.tagline) + "</p>" +
        '<div class="price">' + (pk.price ? esc(pk.price) : "Preț după evaluare") + "<small>abonament lunar, stabilit după vizita gratuită</small></div>" +
        "<ul>" + pk.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>";
      var b = el("button", "btn" + (pk.featured ? "" : " ghost"), sel.pack === pk.id ? "Pachet ales" : "Alege " + esc(pk.name)); b.type = "button";
      b.addEventListener("click", function () { sel.pack = pk.id; persist(); toast("Ai ales pachetul " + esc(pk.name) + ".", "Vezi selecția", openDrawer); });
      c.appendChild(b); box.appendChild(c);
    });
  }

  /* ================= Sertarul cu selecția ================= */
  function openDrawer() { renderDrawer(); $("drawer").classList.add("open"); $("drawer").setAttribute("aria-hidden", "false"); $("drawer-back").hidden = false; document.body.classList.add("lock"); setTimeout(function () { $("drawer-close").focus(); paintCanvases($("drawer")); }, 60); }
  function closeDrawer() { $("drawer").classList.remove("open"); $("drawer").setAttribute("aria-hidden", "true"); $("drawer-back").hidden = true; document.body.classList.remove("lock"); }
  function renderDrawer() {
    var body = $("drawer-body"), foot = $("drawer-foot"); body.innerHTML = ""; foot.innerHTML = "";
    var ids = Object.keys(sel.items);
    if (!ids.length) {
      var e = el("div", "d-empty", "<p>Selecția e goală. Adaugă plante din catalog sau lasă-ne pe noi să le alegem la evaluare.</p>");
      var a = el("a", "btn small", "Vezi plantele"); a.href = "#plante"; a.addEventListener("click", closeDrawer); e.appendChild(a); body.appendChild(e);
    }
    ids.forEach(function (id) {
      var p = BY_ID[id]; if (!p) return;
      var row = el("div", "d-item");
      row.innerHTML = '<canvas data-plant="' + id + '"></canvas><div><h3>' + esc(p.name) + '</h3><p class="latin">' + esc(p.height) + '</p><button type="button" class="d-remove">Scoate</button></div>' +
        '<div class="qty"><button type="button" aria-label="Mai puține">−</button><span>' + sel.items[id] + '</span><button type="button" aria-label="Mai multe">+</button></div>';
      var qb = row.querySelectorAll(".qty button");
      qb[0].addEventListener("click", function () { setQty(id, sel.items[id] - 1); });
      qb[1].addEventListener("click", function () { setQty(id, sel.items[id] + 1); });
      row.querySelector(".d-remove").addEventListener("click", function () { setQty(id, 0); });
      body.appendChild(row);
    });
    var pk = el("div", "d-pack", "<h3>Pachet de abonament</h3>");
    var opts = el("div", "pack-opts");
    D.packages.forEach(function (p) {
      var b = el("button", "fchip", esc(p.name)); b.type = "button"; b.setAttribute("aria-pressed", sel.pack === p.id ? "true" : "false");
      b.addEventListener("click", function () { sel.pack = sel.pack === p.id ? null : p.id; persist(); });
      opts.appendChild(b);
    });
    pk.appendChild(opts); body.appendChild(pk);
    var n = selCount();
    foot.appendChild(el("p", "", n ? n + (n === 1 ? " plantă" : " plante") + " în selecție. Prețul îl primești după evaluarea gratuită." : "Poți programa evaluarea și fără plante alese."));
    var go = el("a", "btn wide", "Continuă spre programare"); go.href = "#cerere"; go.addEventListener("click", closeDrawer); foot.appendChild(go);
    if ($("drawer").classList.contains("open")) requestAnimationFrame(function () { paintCanvases(body); });
  }

  /* ================= Detalii plantă ================= */
  var lastFocus = null;
  function openPlant(id) {
    var p = BY_ID[id]; if (!p) return;
    lastFocus = document.activeElement;
    $("modal-info").innerHTML =
      '<h2 id="modal-title">' + esc(p.name) + '</h2><p class="latin">' + esc(p.latin) + "</p><p>" + esc(p.note) + "</p>" +
      '<div class="care-grid">' +
      "<div><span>Lumină</span><strong>" + p.light.map(function (l) { return LIGHT[l].replace("Lumină ", ""); }).join(", ") + "</strong></div>" +
      "<div><span>Udare</span><strong>" + esc(p.water) + "</strong></div>" +
      "<div><span>Temperatură</span><strong>" + esc(p.temp) + "</strong></div>" +
      "<div><span>Înălțime</span><strong>" + esc(p.height) + "</strong></div>" +
      "<div><span>Curent de aer</span><strong>" + (p.drafts ? "Rezistă" : "De evitat") + "</strong></div>" +
      "<div><span>Animale de companie</span><strong>" + (p.petSafe ? "Netoxică" : "Toxică dacă e mâncată") + "</strong></div></div>" +
      '<div class="card-meta">' + p.styles.map(function (s) { return '<span class="meta">' + STYLE[s] + "</span>"; }).join("") + (p.petSafe ? '<span class="meta">Sigură pentru animale</span>' : "") + "</div>" +
      '<div class="btn-row" style="margin-top:.6rem"><button type="button" class="btn add-modal">Adaugă în selecție</button></div>' +
      '<p class="latin" style="font-style:normal;font-size:.88rem">Udarea și îngrijirea sunt incluse în abonament. Le facem noi.</p>';
    $("modal-info").querySelector(".add-modal").addEventListener("click", function () { addPlant(id); closeModal(); });
    $("modal-back").hidden = false; document.body.classList.add("lock");
    requestAnimationFrame(function () { Art.draw($("modal-canvas"), p); $("modal-close").focus(); });
  }
  function closeModal() { $("modal-back").hidden = true; document.body.classList.remove("lock"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  /* ================= Plant Passport ================= */
  function initPassport() {
    $("lookup-form").addEventListener("submit", function (e) { e.preventDefault(); var v = $("lookup-code").value.trim().toUpperCase().replace(/\s+/g, ""); if (/^VRD\d+$/.test(v)) v = "VRD-" + v.slice(3); location.hash = "pasaport-" + v; });
    document.querySelectorAll(".code-chip").forEach(function (b) { b.addEventListener("click", function () { location.hash = "pasaport-" + b.getAttribute("data-code"); }); });
  }
  function showPassport(code) {
    var view = $("passport-view"), err = $("lookup-error"); view.innerHTML = ""; err.hidden = true;
    if (!code) return;
    $("lookup-code").value = code;
    var d = D.passports[code];
    if (!d) { err.hidden = false; err.textContent = "Nu am găsit nicio plantă cu codul " + code + ". Verifică eticheta: codul începe cu VRD și are patru cifre."; return; }
    var p = BY_ID[d.plant];
    var wrap = el("div", "passport");
    wrap.innerHTML =
      '<div class="pp-top"><div class="pp-art"><canvas data-plant="' + p.id + '"></canvas></div>' +
      '<div class="pp-main glass"><div class="pp-code"><span class="status ' + d.status + '">' + esc(d.statusLabel) + '</span><span class="latin" style="font-style:normal">' + esc(code) + "</span></div>" +
      "<h2>" + esc(p.latin) + '</h2><p class="lead" style="font-size:1.15rem">' + esc(p.name) + "</p>" +
      '<div class="facts"><div><span>Amplasare</span><strong>' + esc(d.location) + "</strong></div><div><span>Înălțime</span><strong>" + esc(d.height) + "</strong></div>" +
      "<div><span>Ghiveci</span><strong>" + esc(d.pot) + "</strong></div><div><span>Instalată</span><strong>" + fmtDate(d.installed) + "</strong></div>" +
      "<div><span>Ultima vizită</span><strong>" + fmtDate(d.lastVisit) + "</strong></div><div><span>Următoarea vizită</span><strong>" + fmtDate(d.nextVisit) + "</strong></div></div>" +
      '<div class="pp-qr"><div class="qr" id="pp-qr"></div><p>Codul QR de pe etichetă deschide această pagină. Profil demonstrativ.</p></div></div></div>' +
      '<div class="pp-cols"><div><h3>Sfaturi de îngrijire</h3><ul class="tips">' + d.tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" +
      '<div><h3>Istoric</h3><ol class="timeline">' + d.history.map(function (h) { return '<li><time datetime="' + h[0] + '">' + fmtDate(h[0]) + "</time><span>" + esc(h[1]) + "</span></li>"; }).join("") + "</ol></div></div>";
    view.appendChild(wrap);
    var q = $("pp-qr");
    if (typeof window.QRCode === "function") new window.QRCode(q, { text: location.href.split("#")[0] + "#pasaport-" + code, width: 144, height: 144, colorDark: "#13241A", colorLight: "#ffffff", correctLevel: window.QRCode.CorrectLevel.M });
    else q.hidden = true;
    requestAnimationFrame(function () { paintCanvases(view); });
  }

  /* ================= Cerere de evaluare ================= */
  var pick = { date: null, slot: null };
  function initRequest() {
    var dates = $("r-dates"), d = new Date(), added = 0;
    d.setDate(d.getDate() + 1);
    while (added < 10) {
      var wd = d.getDay();
      if (wd !== 0 && wd !== 6) {
        var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        var b = el("button", "date", "<small>" + DAYS[wd] + "</small><b>" + d.getDate() + "</b><small>" + MONTHS[d.getMonth()] + "</small>");
        b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false"); b.dataset.date = iso;
        b.setAttribute("aria-label", DAYS[wd] + " " + d.getDate() + " " + MONTHS[d.getMonth()]);
        b.addEventListener("click", function () { pick.date = this.dataset.date; dates.querySelectorAll(".date").forEach(function (x) { x.setAttribute("aria-checked", String(x.dataset.date === pick.date)); }); });
        dates.appendChild(b); added++;
      }
      d.setDate(d.getDate() + 1);
    }
    document.querySelectorAll("#r-slots .slot").forEach(function (s) {
      s.setAttribute("role", "radio"); s.setAttribute("aria-checked", "false");
      s.addEventListener("click", function () { pick.slot = s.dataset.slot; document.querySelectorAll("#r-slots .slot").forEach(function (x) { x.setAttribute("aria-checked", String(x === s)); }); });
    });
    $("request-form").addEventListener("submit", submitRequest);
    renderMyRequests();
  }
  function renderSummary() {
    var s = $("summary"), ids = Object.keys(sel.items);
    var pk = D.packages.filter(function (p) { return p.id === sel.pack; })[0];
    s.innerHTML = "<h3>Selecția ta</h3>" +
      (ids.length ? '<ul class="sum-list">' + ids.map(function (id) { return "<li><span>" + esc(BY_ID[id].name) + "</span><span>× " + sel.items[id] + "</span></li>"; }).join("") + "</ul>"
        : '<p class="sum-note">Nu ai ales încă plante. Nicio problemă: le alegem împreună la evaluare.</p>') +
      '<div class="sum-pack"><small>Pachet</small><strong>' + (pk ? esc(pk.name) : "Încă nu ai ales") + "</strong></div>" +
      '<p class="sum-note">Evaluarea e gratuită. Prețul abonamentului îl primești după vizită.</p>';
    var row = el("div", "btn-row");
    var e1 = el("button", "btn ghost small", "Modifică selecția"); e1.type = "button"; e1.addEventListener("click", openDrawer); row.appendChild(e1);
    s.appendChild(row);
  }
  function submitRequest(e) {
    e.preventDefault();
    var req = [["r-business", "numele afacerii"], ["r-address", "adresa"], ["r-name", "numele tău"], ["r-phone", "telefonul"]], missing = [];
    req.forEach(function (r) { var f = $(r[0]); var bad = !f.value.trim(); f.closest(".field").classList.toggle("invalid", bad); if (bad) missing.push(r[1]); });
    var em = $("r-email").value.trim();
    if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) missing.push("un email valid");
    if (!pick.date) missing.push("ziua vizitei"); if (!pick.slot) missing.push("intervalul orar");
    if (!$("r-consent").checked) missing.push("acordul pentru a fi contactat");
    var err = $("r-error");
    if (missing.length) { err.hidden = false; err.textContent = "Mai completează: " + missing.join(", ") + "."; return; }
    err.hidden = true;

    var code = "CER-" + String(Date.now()).slice(-5);
    var data = {
      cod: code, afacere: $("r-business").value.trim(), tip: $("r-type").value, adresa: $("r-address").value.trim(), suprafata: $("r-area").value,
      data: pick.date, interval: pick.slot, nume: $("r-name").value.trim(), telefon: $("r-phone").value.trim(), email: em, observatii: $("r-notes").value.trim(),
      plante: Object.keys(sel.items).map(function (id) { return BY_ID[id].name + " × " + sel.items[id]; }),
      pachet: (D.packages.filter(function (p) { return p.id === sel.pack; })[0] || {}).name || "nealeas"
    };
    var list = load("verde-req", []); list.unshift({ cod: code, afacere: data.afacere, data: data.data, interval: data.interval, trimisa: new Date().toISOString().slice(0, 10) }); save("verde-req", list);
    var text = "Cerere de evaluare " + code + "\n\nAfacere: " + data.afacere + " (" + data.tip + ")\nAdresă: " + data.adresa + "\nSuprafață: " + data.suprafata +
      "\nVizită: " + fmtDate(data.data) + ", " + data.interval + "\n\nContact: " + data.nume + ", " + data.telefon + (data.email ? ", " + data.email : "") +
      "\nPlante: " + (data.plante.join(", ") || "de ales la evaluare") + "\nPachet: " + data.pachet + (data.observatii ? "\n\nObservații: " + data.observatii : "");
    var sent = false;
    if (D.settings.formEndpoint) {
      fetch(D.settings.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); }).catch(function () { mailto(code, text); });
      sent = true;
    } else mailto(code, text);
    sel.items = {}; persist();
    showConfirmation(code, data, sent, text);
  }
  function mailto(code, text) {
    try { window.location.href = "mailto:" + D.settings.email + "?subject=" + encodeURIComponent("Cerere evaluare VERDÉ " + code) + "&body=" + encodeURIComponent(text); } catch (e) { /* ignorat */ }
  }
  function showConfirmation(code, data, sent, text) {
    $("checkout").hidden = true;
    var c = $("confirmation"); c.hidden = false;
    c.innerHTML = '<div class="confirm"><span class="seal">' + ICON.check.replace("<svg", '<svg width="32" height="32"') + "</span><h2>Cererea a fost înregistrată</h2>" +
      '<p class="req-code">' + code + "</p><p>Vizită propusă: <strong>" + fmtDate(data.data) + ", " + data.interval + "</strong>. Te contactăm la " + esc(data.telefon) + " ca să confirmăm.</p>" +
      (sent ? "" : "<p>Am deschis mesajul în aplicația ta de email. Dacă nu s-a deschis, trimite codul cererii la <strong>" + esc(D.settings.email) + '</strong>. <button type="button" class="link-btn" id="copy-req">Copiază detaliile</button></p>') +
      '<div class="btn-row"><a class="btn ghost" href="#plante">Înapoi la plante</a><button class="btn ghost" type="button" id="new-req">Cerere nouă</button></div></div>';
    var cp = $("copy-req");
    if (cp) cp.addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { cp.textContent = "Copiat"; }, function () {}); });
    $("new-req").addEventListener("click", function () { $("confirmation").hidden = true; $("checkout").hidden = false; $("request-form").reset(); pick = { date: null, slot: null }; document.querySelectorAll(".date,.slot").forEach(function (x) { x.setAttribute("aria-checked", "false"); }); renderSummary(); });
    renderMyRequests(); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }
  function renderMyRequests() {
    var list = load("verde-req", []), box = $("my-requests");
    if (!list.length) { box.innerHTML = ""; return; }
    box.innerHTML = "<h2>Cererile tale</h2>" + '<ul class="req-list">' + list.slice(0, 5).map(function (r) {
      return '<li><strong>' + esc(r.cod) + "</strong><span>" + esc(r.afacere) + "</span><span>Vizită: " + fmtDate(r.data) + ", " + esc(r.interval) + "</span><span>Trimisă</span></li>";
    }).join("") + "</ul>";
  }

  var INIT = { acasa: initHome, plante: initCatalog, potrivire: initWizard, pasaport: initPassport, cerere: initRequest };

  /* ================= Elemente comune ================= */
  function closeMenu() { $("nav").classList.remove("open"); $("menu-btn").setAttribute("aria-expanded", "false"); }
  function boot() {
    $("footer-email").textContent = D.settings.email;
    $("footer-phone").textContent = D.settings.phone || D.settings.city;
    $("cart-btn").addEventListener("click", openDrawer);
    $("drawer-close").addEventListener("click", closeDrawer);
    $("drawer-back").addEventListener("click", closeDrawer);
    $("modal-close").addEventListener("click", closeModal);
    $("modal-back").addEventListener("click", function (e) { if (e.target === this) closeModal(); });
    var ab = $("atmo-btn"), ap = $("ambient");
    ab.addEventListener("click", function (e) { e.stopPropagation(); ap.hidden = !ap.hidden; ab.setAttribute("aria-expanded", String(!ap.hidden)); });
    document.addEventListener("click", function (e) { if (!ap.hidden && !ap.contains(e.target)) { ap.hidden = true; ab.setAttribute("aria-expanded", "false"); } });
    $("menu-btn").addEventListener("click", function () { var o = $("nav").classList.toggle("open"); this.setAttribute("aria-expanded", String(o)); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (!$("modal-back").hidden) closeModal(); else if ($("drawer").classList.contains("open")) closeDrawer(); else closeMenu(); } });
    var hdr = $("site-header");
    window.addEventListener("scroll", function () { hdr.classList.toggle("scrolled", window.scrollY > 12); }, { passive: true });
    updateBadge(); renderDrawer();
    route();
    /* romburile de pe prima pagină */
    requestAnimationFrame(function () { paintCanvases(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

/* VERDÉ — „Același birou”: la scroll, o cortină aurie trece peste poză și biroul gri devine verde. */
(function () {
  var sec = document.getElementById("tf");
  if (!sec) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var photo = document.getElementById("tf-photo"), after = document.getElementById("tf-after"), line = document.getElementById("tf-line"),
      labAfter = document.getElementById("tf-lab-after"), count = document.getElementById("tf-count"), bar = document.getElementById("tf-bar"),
      steps = Array.prototype.slice.call(sec.querySelectorAll(".tf-step"));
  var TOTAL = 5; /* plantele din poza „după” */
  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function frame() {
    if (sec.offsetParent === null) return;
    var total = sec.offsetHeight - window.innerHeight;
    var p = reduce ? 1 : clamp(-sec.getBoundingClientRect().top / total);
    var w = ease(clamp((p - 0.12) / 0.66)); /* cât din poză e deja verde */
    after.style.clipPath = "inset(0 " + ((1 - w) * 100).toFixed(2) + "% 0 0)";
    line.style.left = (w * 100).toFixed(2) + "%";
    line.style.opacity = w > 0.003 && w < 0.997 ? 1 : 0;
    labAfter.style.opacity = clamp((w - 0.25) * 4);
    photo.style.filter = "grayscale(" + (0.55 - w * 0.3).toFixed(3) + ") brightness(.92)";
    count.textContent = Math.round(w * TOTAL);
    var si = p < 0.12 ? 0 : (w < 0.98 ? 1 : 2);
    steps.forEach(function (s, k) { s.classList.toggle("on", k === si); });
    bar.style.transform = "scaleX(" + p.toFixed(3) + ")";
  }
  var tick = false;
  function onScroll() { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; frame(); }); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("hashchange", function () { setTimeout(frame, 120); });
  frame();
})();

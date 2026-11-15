// Two bodies under Newtonian gravity, moving about their common centre of mass.
// The relative motion is integrated with the leapfrog (Stormer-Verlet) method, which is
// symplectic. Buttons switch between a circular, an elliptic and a hyperbolic (scattering) orbit.
(function () {
  "use strict";

  var canvas = document.getElementById("twobody-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var readout = document.getElementById("twobody-readout");
  var buttons = document.querySelectorAll("[data-orbit]");

  var css = getComputedStyle(document.documentElement);
  var C1 = (css.getPropertyValue("--violet") || "#6a3d9a").trim();
  var C2 = (css.getPropertyValue("--teal") || "#1c7a80").trim();
  var INK = (css.getPropertyValue("--muted") || "#5a6475").trim();

  var m1 = 1.0, m2 = 0.45, M = m1 + m2;          // masses, G(m1 + m2) = 1 in these units
  var dt = 0.002;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var cases = {
    circular:   { v: 1.0,  label: "Circular orbit" },
    elliptic:   { v: 1.28, label: "Elliptic orbit" },
    hyperbolic: { v: 1.6,  label: "Hyperbolic flyby" }
  };

  function accel(x, y) {
    var r2 = x * x + y * y, r3 = r2 * Math.sqrt(r2);
    return [-x / r3, -y / r3];
  }

  // leapfrog for the relative coordinate r = r2 - r1
  function integrate(x, y, vx, vy, n, h) {
    var out = [[x, y]], a = accel(x, y);
    for (var i = 0; i < n; i++) {
      vx += 0.5 * h * a[0]; vy += 0.5 * h * a[1];
      x += h * vx; y += h * vy;
      a = accel(x, y);
      vx += 0.5 * h * a[0]; vy += 0.5 * h * a[1];
      out.push([x, y]);
    }
    return { pts: out, state: [x, y, vx, vy] };
  }

  var path = [], bound = true, current = "elliptic", frame = 0, last = null, pause = 0;
  var scale = 1, W = 0, H = 0;

  function build(name) {
    current = name;
    var v = cases[name].v;
    // start at periapsis r = 1, velocity perpendicular
    var e = v * v - 1, E = 0.5 * v * v - 1;
    bound = E < 0;
    var stride = 6;
    if (bound) {
      var a = 1 / (2 - v * v), period = 2 * Math.PI * Math.pow(a, 1.5);
      var n = Math.ceil(period / dt);
      var res = integrate(1, 0, 0, v, n, dt);
      path = res.pts.filter(function (_, i) { return i % stride === 0; });
    } else {
      // integrate backwards from periapsis, then forwards, to get the incoming and outgoing branches
      var tHalf = 7.5, nh = Math.ceil(tHalf / dt);
      var back = integrate(1, 0, 0, -v, nh, dt).pts.reverse().map(function (p) { return [p[0], -p[1]]; });
      var fwd = integrate(1, 0, 0, v, nh, dt).pts;
      path = back.concat(fwd.slice(1)).filter(function (_, i) { return i % stride === 0; });
    }
    // body positions about the centre of mass
    var k1 = -m2 / M, k2 = m1 / M, ext = 0;
    path = path.map(function (p) {
      var b1 = [k1 * p[0], k1 * p[1]], b2 = [k2 * p[0], k2 * p[1]];
      ext = Math.max(ext, Math.abs(b1[0]), Math.abs(b1[1]), Math.abs(b2[0]), Math.abs(b2[1]));
      return [b1, b2];
    });
    path.ext = ext;
    frame = bound ? 0 : 0;
    pause = 0;
    if (readout) {
      readout.innerHTML = cases[name].label + ": eccentricity e = " + Math.abs(e).toFixed(2) +
        (bound ? ", energy below zero, so the bodies stay bound."
               : ", energy above zero, so the bodies scatter and separate.");
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", buttons[i].getAttribute("data-orbit") === name ? "true" : "false");
    }
    resize();
    if (reduce) { frame = Math.floor(path.length / 2); draw(path.length); }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = (Math.min(W, H) / 2 - 14) / (path.ext || 1);
    if (reduce) draw(path.length);
  }

  function P(p) { return [W / 2 + p[0] * scale, H / 2 - p[1] * scale]; }

  function trail(idx, upto, color, alpha) {
    ctx.beginPath();
    var s = P(path[0][idx]); ctx.moveTo(s[0], s[1]);
    for (var i = 1; i < upto; i++) { s = P(path[i][idx]); ctx.lineTo(s[0], s[1]); }
    ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.4; ctx.stroke();
  }

  function draw(upto) {
    ctx.clearRect(0, 0, W, H);
    var n = path.length;
    // full path, faint
    trail(0, n, C1, 0.28); trail(1, n, C2, 0.28);
    // recent history, stronger
    var start = Math.max(0, frame - (bound ? n : 400));
    ctx.globalAlpha = 0.9;
    for (var b = 0; b < 2; b++) {
      ctx.beginPath();
      var s = P(path[start][b]); ctx.moveTo(s[0], s[1]);
      for (var i = start + 1; i <= frame && i < n; i++) { s = P(path[i][b]); ctx.lineTo(s[0], s[1]); }
      ctx.strokeStyle = b === 0 ? C1 : C2; ctx.lineWidth = 1.8; ctx.stroke();
    }
    // centre of mass
    var c = P([0, 0]);
    ctx.globalAlpha = 1; ctx.strokeStyle = INK; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(c[0] - 5, c[1]); ctx.lineTo(c[0] + 5, c[1]);
    ctx.moveTo(c[0], c[1] - 5); ctx.lineTo(c[0], c[1] + 5); ctx.stroke();
    // bodies, radius grows with mass
    var f = Math.min(frame, n - 1);
    var p1 = P(path[f][0]), p2 = P(path[f][1]);
    ctx.fillStyle = C1; ctx.beginPath(); ctx.arc(p1[0], p1[1], 9 * Math.cbrt(m1), 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = C2; ctx.beginPath(); ctx.arc(p2[0], p2[1], 9 * Math.cbrt(m2), 0, 2 * Math.PI); ctx.fill();
  }

  function tick(t) {
    if (last === null) last = t;
    var elapsed = t - last; last = t;
    if (pause > 0) {
      pause -= elapsed;
      if (pause <= 0) frame = 0;
    } else {
      frame += Math.max(1, Math.round(elapsed / 16 * (bound ? 2 : 3)));
      if (frame >= path.length) {
        if (bound) frame = frame % path.length;
        else { frame = path.length - 1; pause = 1200; }
      }
    }
    draw(path.length);
    window.requestAnimationFrame(tick);
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function (ev) { build(ev.currentTarget.getAttribute("data-orbit")); });
  }
  window.addEventListener("resize", resize);

  build("elliptic");
  if (!reduce) window.requestAnimationFrame(tick);
})();

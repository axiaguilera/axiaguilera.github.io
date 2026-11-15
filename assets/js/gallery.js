// Photo albums. Each <figure class="album"> shows a cover; clicking it opens a viewer
// with every photo listed in the figure's hidden <ul class="album-items">.
// Without JavaScript the list links still open each photo directly.
(function () {
  "use strict";

  var albums = document.querySelectorAll(".album");
  if (!albums.length || typeof HTMLDialogElement === "undefined") return;

  // ---- build the viewer once -------------------------------------------------
  var dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Photo album");
  dlg.innerHTML =
    '<div class="lb-stage">' +
    '  <button type="button" class="lb-btn lb-prev" aria-label="Previous photo">&#8249;</button>' +
    '  <figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-caption"></figcaption></figure>' +
    '  <button type="button" class="lb-btn lb-next" aria-label="Next photo">&#8250;</button>' +
    "</div>" +
    '<div class="lb-bar"><span class="lb-title"></span><span class="lb-count" aria-live="polite"></span>' +
    '<button type="button" class="lb-close">Close</button></div>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector(".lb-img"), cap = dlg.querySelector(".lb-caption");
  var title = dlg.querySelector(".lb-title"), count = dlg.querySelector(".lb-count");
  var items = [], index = 0, opener = null;

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    img.src = it.src; img.alt = it.alt;
    cap.textContent = it.caption || "";
    cap.hidden = !it.caption;
    count.textContent = (index + 1) + " of " + items.length;
    // preload the next photo
    var nxt = items[(index + 1) % items.length];
    if (nxt) { var pre = new Image(); pre.src = nxt.src; }
  }

  function open(album, button) {
    var links = album.querySelectorAll(".album-items a");
    items = Array.prototype.map.call(links, function (a) {
      return { src: a.getAttribute("href"), alt: a.textContent.trim(), caption: a.getAttribute("data-caption") || "" };
    });
    if (!items.length) return;
    opener = button;
    title.textContent = album.querySelector("figcaption") ? album.querySelector("figcaption").textContent : "";
    var single = items.length < 2;
    dlg.querySelector(".lb-prev").hidden = single;
    dlg.querySelector(".lb-next").hidden = single;
    show(0);
    dlg.showModal();
    (single ? dlg.querySelector(".lb-close") : dlg.querySelector(".lb-next")).focus();
  }

  function close() { dlg.close(); }

  dlg.addEventListener("close", function () { if (opener) opener.focus(); });
  dlg.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
  dlg.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });
  dlg.querySelector(".lb-close").addEventListener("click", close);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });   // click on the backdrop
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { show(index - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { show(index + 1); e.preventDefault(); }
  });

  // swipe on touch screens
  var x0 = null;
  dlg.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
  dlg.addEventListener("pointerup", function (e) {
    if (x0 === null || items.length < 2) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  // ---- wire up each album ------------------------------------------------------
  Array.prototype.forEach.call(albums, function (album) {
    var button = album.querySelector(".album-cover");
    var n = album.querySelectorAll(".album-items a").length;
    if (!button || !n) return;
    var label = album.querySelector("figcaption") ? album.querySelector("figcaption").textContent : "album";
    button.setAttribute("aria-label", "Open " + label + ", " + n + (n === 1 ? " photo" : " photos"));
    var badge = album.querySelector(".album-count");
    if (badge) badge.textContent = n + (n === 1 ? " photo" : " photos");
    button.addEventListener("click", function () { open(album, button); });
  });
})();

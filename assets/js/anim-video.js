// Looping research animations stored as video. They play muted while on screen,
// pause when scrolled away, and start paused for readers who prefer reduced motion.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".anim[data-video]").forEach(function (box) {
    var video = box.querySelector("video"), button = box.querySelector(".anim-toggle");
    if (!video) return;
    var wanted = !reduce, visible = true;

    function sync() {
      if (wanted && visible) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
      if (button) button.textContent = wanted ? "Pause" : "Play";
    }
    if (button) button.addEventListener("click", function () { wanted = !wanted; sync(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting; sync();
      }).observe(box);
    }
    sync();
  });
})();

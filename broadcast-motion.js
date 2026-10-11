(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visible = new Set();
  function update(image) {
    var animated = visible.has(image) && !reduced.matches && !document.hidden;
    var src = animated ? image.dataset.motionSrc : image.dataset.motionPoster;
    if (image.getAttribute('src') !== src) image.setAttribute('src', src);
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
      update(entry.target);
    });
  }, { threshold: 0.05 });
  function observe() {
    document.querySelectorAll('img.broadcast-motion').forEach(function (image) {
      if (image.dataset.observed) return;
      image.dataset.observed = 'true';
      observer.observe(image);
    });
  }
  function refresh() { visible.forEach(update); }
  reduced.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  document.addEventListener('sitedata', observe);
  observe();
})();

(function () {
  if (window.__rsSmoothScroll) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.__rsSmoothScroll = true;

  var st = document.createElement('style');
  st.textContent = 'html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}.lenis.lenis-stopped{overflow:hidden}[data-no-smooth]{overscroll-behavior:contain}';
  document.head.appendChild(st);

  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js';
  s.onload = function () {
    var html = document.documentElement;
    var lenis = new Lenis({ prevent: function (n) { return n.closest && n.closest('[data-no-smooth]'); } });
    window.__lenis = lenis;
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    // page loader locks scroll via html.is-loading
    function sync() { html.classList.contains('is-loading') ? lenis.stop() : lenis.start(); }
    new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ['class'] });
    sync();
  };
  document.head.appendChild(s);
})();

(function () {
  if (window.__rsClickSound) return;
  window.__rsClickSound = true;
  var SRC = 'uploads/click-button.mp3';
  var pool = [], idx = 0;
  for (var i = 0; i < 4; i++) { var a = new Audio(SRC); a.preload = 'auto'; a.volume = 0.35; pool.push(a); }
  function interactiveEl(el) {
    return !!(el && el.closest && el.closest('a, button, [data-filter], select, [role="button"], input[type="submit"]'));
  }
  document.addEventListener('pointerdown', function (e) {
    if (!interactiveEl(e.target)) return;
    var s = pool[idx = (idx + 1) % pool.length];
    try { s.currentTime = 0; var p = s.play(); if (p && p.catch) p.catch(function () {}); } catch (err) {}
  }, { passive: true, capture: true });
})();

(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.__rsCursor) return;
  window.__rsCursor = true;

  var style = document.createElement('style');
  style.textContent = [
    'html:not(.rs-cursor-off), html:not(.rs-cursor-off) body, html:not(.rs-cursor-off) a, html:not(.rs-cursor-off) button, html:not(.rs-cursor-off) [data-filter], html:not(.rs-cursor-off) select, html:not(.rs-cursor-off) label, html:not(.rs-cursor-off) [data-loader], html:not(.rs-cursor-off) [data-loader] * { cursor: none !important; }',
    'html.rs-cursor-off [data-rs-cursor] { opacity: 0 !important; }',
    'html.rs-cursor-off, html.rs-cursor-off body, html.rs-cursor-off * { cursor: default !important; }',
    'html.rs-cursor-off input, html.rs-cursor-off textarea { cursor: text !important; }',
    'input, textarea { cursor: text !important; }',
    '[data-rs-cursor] { position: fixed; top: 0; left: 0; z-index: 2147483600; pointer-events: none; mix-blend-mode: difference; will-change: transform; }',
    '@media (prefers-reduced-motion: reduce) { [data-rs-cursor] { display: none !important; } }'
  ].join('\n');
  (document.head || document.documentElement).appendChild(style);

  var ring = document.createElement('div');
  ring.setAttribute('data-rs-cursor', 'ring');
  ring.style.cssText = 'width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid #fff;border-radius:999px;opacity:0;transition:width .25s cubic-bezier(0.16,1,0.3,1),height .25s cubic-bezier(0.16,1,0.3,1),margin .25s cubic-bezier(0.16,1,0.3,1),opacity .3s ease,border-color .2s ease';

  var dot = document.createElement('div');
  dot.setAttribute('data-rs-cursor', 'dot');
  dot.style.cssText = 'width:4px;height:4px;margin:-2px 0 0 -2px;background:#fff;border-radius:999px;opacity:0;transition:opacity .25s ease';
  var dotScale = 1;

  function mount() {
    var host = document.body || document.documentElement;
    if (!ring.isConnected) host.appendChild(ring);
    if (!dot.isConnected) host.appendChild(dot);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  setInterval(mount, 500);

  var tx = window.innerWidth / 2, ty = window.innerHeight / 2, rx = tx, ry = ty, shown = false;

  document.addEventListener('mousemove', function (e) {
    tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; }
    ring.style.opacity = '1'; dot.style.opacity = '1';
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    shown = false; ring.style.opacity = '0'; dot.style.opacity = '0';
  });

  function cursorOff() {
    document.documentElement.classList.add('rs-cursor-off');
    ring.style.opacity = '0'; dot.style.opacity = '0';
  }
  var lock = false;
  function cursorOn() {
    if (lock) return;
    if (!document.hasFocus() || document.hidden) return;
    document.documentElement.classList.remove('rs-cursor-off');
  }
  window.addEventListener('blur', cursorOff);
  window.addEventListener('pagehide', cursorOff);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cursorOff(); else cursorOn();
  });
  window.addEventListener('focus', function () { lock = false; document.documentElement.classList.remove('rs-cursor-off'); });
  function externalLink(el) {
    var a = el && el.closest && el.closest('a[href]');
    if (!a) return null;
    var h = a.getAttribute('href') || '';
    return (/^(tel:|mailto:|sms:)/i.test(h) || a.target === '_blank') ? a : null;
  }
  document.addEventListener('pointerdown', function (e) {
    if (externalLink(e.target)) { lock = true; cursorOff(); return; }
    lock = false; document.documentElement.classList.remove('rs-cursor-off');
  }, { capture: true, passive: true });
  document.addEventListener('mousemove', cursorOn, { passive: true });
  document.addEventListener('click', function (e) {
    var a = externalLink(e.target);
    if (!a) return;
    if (a.dataset.rsGo) { delete a.dataset.rsGo; return; }
    e.preventDefault();
    lock = true;
    cursorOff();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        a.dataset.rsGo = '1';
        a.click();
      });
    });
  }, { capture: true });

  var hovering = false;
  function interactive(el) {
    return !!(el && el.closest && el.closest('a, button, [data-filter], select, [role="button"]'));
  }
  document.addEventListener('mouseover', function (e) {
    var on = interactive(e.target);
    if (on === hovering) return;
    hovering = on;
    ring.style.width = on ? '56px' : '34px';
    ring.style.height = on ? '56px' : '34px';
    ring.style.margin = on ? '-28px 0 0 -28px' : '-17px 0 0 -17px';
    dotScale = on ? 2.2 : 1;
  }, { passive: true });

  document.addEventListener('mousedown', function () {
    ring.style.width = '22px'; ring.style.height = '22px'; ring.style.margin = '-11px 0 0 -11px';
    dotScale = 0.45;
  }, { passive: true });

  document.addEventListener('mouseup', function () {
    ring.style.width = hovering ? '56px' : '34px';
    ring.style.height = hovering ? '56px' : '34px';
    ring.style.margin = hovering ? '-28px 0 0 -28px' : '-17px 0 0 -17px';
    dotScale = hovering ? 2.2 : 1;
  }, { passive: true });

  var ds = 1;
  (function loop() {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';
    ds += (dotScale - ds) * 0.25;
    dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + ds.toFixed(3) + ')';
    requestAnimationFrame(loop);
  })();
})();

/* Portfolio image ribbon: autonomous motion with cursor takeover. */
(function () {
  const images = ["./uploads/portfolio/spotify-wrapped-2025-trail-1.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-2.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-3.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-4.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-5.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-6.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-7.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-8.webp", "./uploads/portfolio/compass-lan-2025-trail-1.webp", "./uploads/portfolio/compass-lan-2025-trail-2.webp", "./uploads/portfolio/compass-lan-2025-trail-3.webp", "./uploads/portfolio/compass-lan-2025-trail-4.webp", "./uploads/portfolio/compass-lan-2025-trail-5.webp", "./uploads/portfolio/compass-lan-2025-trail-6.webp", "./uploads/portfolio/compass-lan-2025-trail-7.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-1.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-2.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-3.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-4.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-5.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-6.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-7.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-1.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-2.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-3.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-4.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-5.webp", "./uploads/portfolio/aab-e-dubai-trail-1.webp", "./uploads/portfolio/aab-e-dubai-trail-2.webp", "./uploads/portfolio/aab-e-dubai-trail-3.webp", "./uploads/portfolio/aab-e-dubai-trail-4.webp", "./uploads/portfolio/aab-e-dubai-trail-5.webp", "./uploads/portfolio/elixir-beauty-trail-1.webp", "./uploads/portfolio/elixir-beauty-trail-2.webp", "./uploads/portfolio/elixir-beauty-trail-3.webp", "./uploads/portfolio/elixir-beauty-trail-4.webp", "./uploads/portfolio/elixir-beauty-trail-5.webp", "./uploads/portfolio/red-bull-meo-trail-1.webp", "./uploads/portfolio/red-bull-meo-trail-2.webp", "./uploads/portfolio/red-bull-meo-trail-3.webp", "./uploads/portfolio/red-bull-meo-trail-4.webp", "./uploads/portfolio/red-bull-meo-trail-5.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-1.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-2.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-3.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-4.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-5.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-6.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-7.webp", "./uploads/portfolio/creative-studio-interiors-trail-1.webp", "./uploads/portfolio/creative-studio-interiors-trail-2.webp", "./uploads/portfolio/creative-studio-interiors-trail-3.webp", "./uploads/portfolio/creative-studio-interiors-trail-4.webp", "./uploads/portfolio/creative-studio-interiors-trail-5.webp", "./uploads/portfolio/creative-studio-interiors-trail-6.webp", "./uploads/portfolio/creative-studio-interiors-trail-7.webp"];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none), (pointer: coarse)');
  const assets = images.map(src => { const image = new Image(); image.src = src; return image; });
  let layer, canvas, ctx, width = 0, height = 0, dpi = 1, size = 80;
  let cards = [], queue = [], lastFrame = 0, lastSpawn = -Infinity, lastMove = -Infinity;
  let previous = null, lastPoint = null, idle = true;
  const pointer = { x: -1, y: -1, sx: -1, sy: -1, vx: 0, vy: 0 };
  const outExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const outQuart = t => 1 - Math.pow(1 - t, 4);
  const inQuart = t => t * t * t * t;
  function nextImage() {
    if (!queue.length) {
      queue = assets.slice();
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    }
    return queue.shift();
  }
  function resize() {
    if (!canvas) return;
    const bounds = layer.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    dpi = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpi); canvas.height = Math.round(height * dpi);
    // Reference cards are about 80px wide inside a 634 × 499 presentation.
    size = Math.hypot(Math.min(width, 634), Math.min(height, 499)) * .1;
    previous = null; lastPoint = null;
  }
  function mount() {
    const target = document.querySelector('[data-hero-trail]');
    if (!target || target === layer) return;
    layer = target;
    canvas = document.createElement('canvas'); canvas.className = 'hero-trail-canvas';
    canvas.setAttribute('aria-hidden', 'true'); layer.appendChild(canvas);
    ctx = canvas.getContext('2d'); cards = []; idle = true; lastMove = -Infinity; lastSpawn = -Infinity; resize();
  }
  function spawn(point, vx, vy, now, automatic) {
    cards.push({ image: nextImage(), x: point.x, y: point.y, vx, vy, born: now, automatic });
    if (cards.length > 100) cards.shift();
    lastSpawn = now;
  }
  function move(event) {
    if (!layer || touch.matches || reduced.matches || event.pointerType === 'touch' || document.documentElement.classList.contains('is-loading')) return;
    const bounds = layer.getBoundingClientRect();
    const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
    if (x < 0 || y < 75 || x > width || y > height || window.scrollY > innerHeight * .8 || event.target.closest('a,button,dialog')) return;
    const now = performance.now();
    if (pointer.x === -1) { pointer.sx = x; pointer.sy = y; }
    const dx = pointer.x === -1 ? 0 : x - pointer.x;
    const dy = pointer.y === -1 ? 0 : y - pointer.y;
    pointer.vx += (Math.max(-12, Math.min(12, dx)) - pointer.vx) * .1;
    pointer.vy += (Math.max(-12, Math.min(12, dy)) - pointer.vy) * .1;
    pointer.x = x; pointer.y = y;
    if (Math.hypot(dx, dy) > .1) {
      lastMove = now;
      if (idle) {
        cards.forEach(card => { card.exit = now; });
        idle = false; lastPoint = null;
      }
    }
  }
  function frame(now) {
    requestAnimationFrame(frame); mount();
    if (!ctx || document.hidden || window.scrollY > innerHeight * .8) { lastFrame = now; return; }
    if (document.documentElement.classList.contains('is-loading')) {
      idle = true; lastMove = -Infinity; lastSpawn = -Infinity; lastPoint = null; previous = null;
      lastFrame = now; return;
    }
    const dt = Math.min(3, (now - (lastFrame || now)) / (1000 / 60)); lastFrame = now;
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0); ctx.clearRect(0, 0, width, height);
    if (reduced.matches) { cards = []; return; }
    if (now - lastMove >= 5000 && !idle) { idle = true; previous = null; lastPoint = null; }
    if (pointer.x !== -1) {
      const smoothing = 1 - Math.pow(.5, dt);
      pointer.sx += (pointer.x - pointer.sx) * smoothing;
      pointer.sy += (pointer.y - pointer.sy) * smoothing;
    }
    const phase = now * .0003 * (touch.matches ? 2 : 1.25);
    const horizontal = Math.cos(phase) * width * .5;
    const vertical = Math.sin(phase) * height * .25;
    const auto = { x: width * .5 + (horizontal + vertical) * .7071, y: height * .55 + (vertical - horizontal) * .525 };
    if (idle) {
      if (now - lastSpawn >= (touch.matches ? 350 : 500)) {
        spawn(auto, previous ? (auto.x - previous.x) * 2 / Math.max(dt, .01) : 0, previous ? (auto.y - previous.y) * 2 / Math.max(dt, .01) : 0, now, true);
      }
    } else if (pointer.x !== -1) {
      const point = {x: pointer.sx, y: pointer.sy};
      const spacing = size * .5;
      if (!lastPoint || Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) >= spacing) {
        spawn(point, pointer.vx * .5, pointer.vy * .5, now, false);
        lastPoint = point;
      }
    }
    previous = auto;
    cards = cards.filter(card => now - card.born < (card.automatic ? (touch.matches ? 3000 : 4250) : 1250) && (!card.exit || now - card.exit < 350));
    for (const card of cards) {
      if (!card.image.complete || !card.image.naturalWidth) continue;
      card.x += card.vx * dt; card.y += card.vy * dt;
      const friction = Math.pow(.94, dt); card.vx *= friction; card.vy *= friction;
      const age = (now - card.born) / 1000;
      const hold = card.automatic ? (touch.matches ? 1.5 : 2.5) : .5;
      const exitDuration = card.automatic ? (touch.matches ? 1.25 : 1.5) : .5;
      const entryDuration = card.automatic ? (touch.matches ? 1.5 : 2.25) : .75;
      const scaleDuration = card.automatic ? (touch.matches ? 2.5 : 3.3) : 1.1;
      let clip = outExpo(Math.min(1, age / entryDuration));
      let scale = 1.5 - .5 * outQuart(Math.min(1, age / scaleDuration));
      // power1.in background fade, expo.out reveal, power3.in closure.
      let overlay = Math.pow(Math.min(1, age / (hold + exitDuration)), 2);
      if (age > hold) {
        const clipAtExit = outExpo(Math.min(1, hold / entryDuration));
        clip = clipAtExit * (1 - inQuart(Math.min(1, (age - hold) / exitDuration)));
      }
      if (age > hold + .25) {
        const scaleAtExit = 1.5 - .5 * outQuart(Math.min(1, (hold + .25) / scaleDuration));
        scale = scaleAtExit + (.5 - scaleAtExit) * inQuart(Math.min(1, (age - hold - .25) / exitDuration));
      }
      let opacity = 1;
      if (card.exit) { const progress = Math.min(1, (now - card.exit) / 350); clip *= 1 - inQuart(progress); opacity *= 1 - progress; }
      const w = size, h = size;
      const cw = w * clip, ch = h * clip;
      if (cw < .1 || ch < .1) continue;
      ctx.save(); ctx.globalAlpha = opacity * (1 - overlay);
      ctx.beginPath(); ctx.roundRect(card.x - cw / 2, card.y - ch / 2, cw, ch, Math.min(8, cw / 2, ch / 2)); ctx.clip();
      const sourceSize = Math.min(card.image.naturalWidth, card.image.naturalHeight);
      ctx.drawImage(card.image, (card.image.naturalWidth - sourceSize) / 2, (card.image.naturalHeight - sourceSize) / 2, sourceSize, sourceSize, card.x - w * scale / 2, card.y - h * scale / 2, w * scale, h * scale);
      ctx.restore();

    }
  }
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.x = -1; lastPoint = null; });
  document.addEventListener('visibilitychange', () => { cards = []; lastPoint = null; });
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(frame);
})();

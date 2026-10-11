/* Curated portfolio exports. Original artwork remains on the source drive. */
(function () {
  const images = ["./uploads/portfolio/spotify-wrapped-2025-trail-1.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-2.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-3.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-4.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-5.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-6.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-7.webp", "./uploads/portfolio/spotify-wrapped-2025-trail-8.webp", "./uploads/portfolio/compass-lan-2025-trail-1.webp", "./uploads/portfolio/compass-lan-2025-trail-2.webp", "./uploads/portfolio/compass-lan-2025-trail-3.webp", "./uploads/portfolio/compass-lan-2025-trail-4.webp", "./uploads/portfolio/compass-lan-2025-trail-5.webp", "./uploads/portfolio/compass-lan-2025-trail-6.webp", "./uploads/portfolio/compass-lan-2025-trail-7.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-1.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-2.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-3.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-4.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-5.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-6.webp", "./uploads/portfolio/free-fire-world-series-2025-trail-7.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-1.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-2.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-3.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-4.webp", "./uploads/portfolio/spotify-wrapped-2024-trail-5.webp", "./uploads/portfolio/aab-e-dubai-trail-1.webp", "./uploads/portfolio/aab-e-dubai-trail-2.webp", "./uploads/portfolio/aab-e-dubai-trail-3.webp", "./uploads/portfolio/aab-e-dubai-trail-4.webp", "./uploads/portfolio/aab-e-dubai-trail-5.webp", "./uploads/portfolio/elixir-beauty-trail-1.webp", "./uploads/portfolio/elixir-beauty-trail-2.webp", "./uploads/portfolio/elixir-beauty-trail-3.webp", "./uploads/portfolio/elixir-beauty-trail-4.webp", "./uploads/portfolio/elixir-beauty-trail-5.webp", "./uploads/portfolio/red-bull-meo-trail-1.webp", "./uploads/portfolio/red-bull-meo-trail-2.webp", "./uploads/portfolio/red-bull-meo-trail-3.webp", "./uploads/portfolio/red-bull-meo-trail-4.webp", "./uploads/portfolio/red-bull-meo-trail-5.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-1.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-2.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-3.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-4.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-5.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-6.webp", "./uploads/portfolio/gamers-galaxy-venue-trail-7.webp", "./uploads/portfolio/creative-studio-interiors-trail-1.webp", "./uploads/portfolio/creative-studio-interiors-trail-2.webp", "./uploads/portfolio/creative-studio-interiors-trail-3.webp", "./uploads/portfolio/creative-studio-interiors-trail-4.webp", "./uploads/portfolio/creative-studio-interiors-trail-5.webp", "./uploads/portfolio/creative-studio-interiors-trail-6.webp", "./uploads/portfolio/creative-studio-interiors-trail-7.webp"];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = window.matchMedia('(max-width: 767px)');
  let collage, collageTimer, activeCard = 0, mobileFocus = () => {}, lastMobileFocus = 0;
  let layer, cards = [], index = 0, last = null;
  let imageQueue = [], previousImage = null;
  function nextImage() {
    if (!imageQueue.length) {
      imageQueue = images.slice();
      for (let i = imageQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [imageQueue[i], imageQueue[j]] = [imageQueue[j], imageQueue[i]];
      }
      if (imageQueue[0] === previousImage) imageQueue.push(imageQueue.shift());
    }
    previousImage = imageQueue.shift();
    return previousImage;
  }
  images.forEach(src => { const image = new Image(); image.src = src; });
  function setupCollage() {
    clearInterval(collageTimer);
    if (collage) collage.remove();
    if (!layer || (!mobile.matches && fine.matches)) return;
    collage = document.createElement('div');
    collage.className = 'hero-mobile-collage';
    layer.appendChild(collage);
    const slots = Array.from({ length: 4 }, (_, i) => {
      const slot = document.createElement('div');
      slot.className = 'hero-collage-slot hero-collage-slot-' + i;
      const image = document.createElement('img');
      image.src = nextImage(); image.alt = ''; image.draggable = false;
      slot.appendChild(image); collage.appendChild(slot);
      return image;
    });
    function focus() {
      if (document.hidden || window.scrollY > window.innerHeight * .8 ||
          document.documentElement.classList.contains('is-loading') || reduce.matches) return;
      const image = slots[activeCard++ % slots.length];
      image.animate([
        { opacity: .45, filter: 'blur(5px)', transform: 'scale(.88)', offset: 0, easing: 'cubic-bezier(.16,1,.3,1)' },
        { opacity: 1, filter: 'blur(0px)', transform: 'scale(1.12)', offset: .25 },
        { opacity: 1, filter: 'blur(0px)', transform: 'scale(1.12)', offset: .65, easing: 'cubic-bezier(.4,0,.2,1)' },
        { opacity: 0, filter: 'blur(18px)', transform: 'scale(.75)', offset: 1 }
      ], { duration: 2200, easing: 'linear' }).onfinish = () => {
        if (!image.isConnected) return;
        image.src = nextImage();
        image.animate([
          { opacity: 0, filter: 'blur(14px)', transform: 'scale(.7)' },
          { opacity: .45, filter: 'blur(5px)', transform: 'scale(.88)' }
        ], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
      };
    }
    mobileFocus = () => {
      if (performance.now() - lastMobileFocus < 900) return;
      lastMobileFocus = performance.now();
      focus();
    };
    collageTimer = setInterval(focus, 2400);
    focus();
  }
  function updateCollageScroll() {
    if (!collage) return;
    const progress = Math.min(1, window.scrollY / (window.innerHeight * .65));
    collage.style.opacity = String(1 - progress);
    collage.style.transform = 'translateY(' + (-progress * 35) + 'px) scale(' + (1 - progress * .15) + ')';
  }
  function mount() {
    const next = document.querySelector('[data-hero-trail]');
    if (!next || next === layer) return;
    layer = next;
    cards = Array.from({ length: 48 }, (_, i) => images[i % images.length]).map(src => {
      const card = document.createElement('img');
      card.src = src; card.alt = ''; card.draggable = false;
      card.className = 'hero-trail-card';
      layer.appendChild(card);
      return card;
    });
    setupCollage();
  }
  function clear() {
    cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel()));
    last = null;
  }
  function move(event) {
    mount();
    if (!layer || mobile.matches || !fine.matches || reduce.matches || document.hidden ||
        document.documentElement.classList.contains('is-loading')) return;
    const hero = layer.parentElement.getBoundingClientRect();
    if (window.scrollY > window.innerHeight * 0.8 || event.clientY < 75 ||
        event.clientY > hero.bottom || event.target.closest('a, button')) { last = null; return; }
    const point = { x: event.clientX - hero.left, y: event.clientY - hero.top };
    if (!last) { spawn(point); last = point; return; }
    const dx = point.x - last.x, dy = point.y - last.y;
    const distance = Math.hypot(dx, dy);
    const spacing = 64;
    const steps = Math.floor(distance / spacing);
    const origin = last;
    for (let i = 1; i <= steps; i++) {
      const fraction = i * spacing / distance;
      const sample = { x: origin.x + dx * fraction, y: origin.y + dy * fraction };
      spawn(sample);
      last = sample;
    }
  }
  function spawn(point) {
    const card = cards[index++ % cards.length];
    card.getAnimations().forEach(animation => animation.cancel());
    card.src = nextImage();
    card.style.left = point.x + 'px'; card.style.top = point.y + 'px';
    card.style.zIndex = String(index);
    card.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(.65)', filter: 'blur(28px)', offset: 0, easing: 'cubic-bezier(.16,1,.3,1)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(0px)', offset: .35, easing: 'linear' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(0px)', offset: .45, easing: 'cubic-bezier(.16,1,.3,1)' },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(.65)', filter: 'blur(32px)', offset: 1 }
    ], { duration: 950, easing: 'linear' });
  }
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerdown', event => {
    if ((mobile.matches || !fine.matches) && !event.target.closest('a,button,dialog')) mobileFocus();
  }, { passive:true });
  document.addEventListener('pointerleave', clear);
  document.addEventListener('visibilitychange', clear);
  window.addEventListener('scroll', () => { updateCollageScroll(); mobileFocus(); if (window.scrollY > window.innerHeight * .8) clear(); }, { passive: true });
  reduce.addEventListener('change', () => { clear(); setupCollage(); });
  fine.addEventListener('change', () => { clear(); setupCollage(); });
  mobile.addEventListener('change', () => { clear(); setupCollage(); });
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  mount();
})();

(function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let layer, host, canvas, ctx, frame = 0, lastTime = 0, lastSpawn = 0;
  let width = 1, height = 1, x = 0, y = 0, tx = 0, ty = 0;
  let lastPoint = null, trails = [], waves = [];
  function visible() { return !document.hidden && window.scrollY < innerHeight; }
  function paint() {
    layer.style.setProperty('--gradient-x', (x / width * 100).toFixed(3) + '%');
    layer.style.setProperty('--gradient-y', (y / height * 100).toFixed(3) + '%');
  }
  function resize() {
    if (!canvas) return;
    const rect = host.getBoundingClientRect(), scale = Math.min(devicePixelRatio || 1, 1.5);
    const rx = width ? x / width : .75, ry = height ? y / height : .5;
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    x = tx = rx * width; y = ty = ry * height;
    trails = []; waves = []; lastPoint = null; paint();
  }
  function tick(now) {
    frame = 0;
    if (!layer || !layer.isConnected || !visible() || reduced.matches) { lastTime = 0; return; }
    const dt = lastTime ? Math.min(now - lastTime, 50) : 16.67;
    lastTime = now;
    const follow = 1 - Math.pow(.9, dt / 16.67);
    x += (tx - x) * follow; y += (ty - y) * follow; paint();
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'screen';
    trails = trails.filter(p => now - p.born < 2300);
    for (const p of trails) {
      const progress = (now - p.born) / 2300;
      const alpha = Math.pow(1 - progress, 1.7) * .12;
      const radius = p.radius * (1 + progress * .7);
      const px = p.x + Math.sin(progress * 4 + p.phase) * 10 * progress;
      const py = p.y + Math.cos(progress * 3 + p.phase) * 8 * progress;
      const color = p.phase % 3 < 1 ? '255,119,22' : p.phase % 3 < 2 ? '255,58,35' : '155,53,255';
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, 'rgba(' + color + ',' + alpha + ')');
      gradient.addColorStop(.35, 'rgba(' + color + ',' + alpha * .7 + ')');
      gradient.addColorStop(1, 'rgba(' + color + ',0)');
      ctx.fillStyle = gradient; ctx.fillRect(px-radius, py-radius, radius*2, radius*2);
    }
    ctx.filter = 'blur(3px)';
    waves = waves.filter(p => now - p.born < 1800);
    for (const p of waves) {
      const progress = (now - p.born) / 1800;
      const alpha = Math.sin(progress * Math.PI) * (1 - progress) * .09;
      ctx.strokeStyle = 'rgba(255,165,100,' + alpha + ')';
      ctx.lineWidth = 1 + (1 - progress) * 1.5;
      const radius = 8 + progress * p.radius;
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const angle = i / 64 * Math.PI * 2;
        const ripple = radius + Math.sin(angle * 3 + progress * 7 + p.phase) * radius * .07;
        const px = p.x + Math.cos(angle) * ripple;
        const py = p.y + Math.sin(angle) * ripple * .68;
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
    }
    ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
    if (trails.length || waves.length || Math.abs(tx-x) + Math.abs(ty-y) > .2) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }
  function schedule() {
    if (reduced.matches) { x=tx; y=ty; paint(); return; }
    if (!frame && visible()) frame = requestAnimationFrame(tick);
  }
  function move(event) {
    if (!visible() || document.documentElement.classList.contains('is-loading')) return;
    const rect = host.getBoundingClientRect(), now = performance.now();
    tx = Math.max(0, Math.min(width, event.clientX-rect.left));
    ty = Math.max(0, Math.min(height, event.clientY-rect.top));
    if (!layer.classList.contains('is-awake')) { x=tx; y=ty; paint(); layer.classList.add('is-awake'); }
    const distance = lastPoint ? Math.hypot(tx-lastPoint.x, ty-lastPoint.y) : 30;
    if (!reduced.matches && distance > 12 && now-lastSpawn > 35) {
      const phase = Math.random() * 6;
      trails.push({x:tx,y:ty,born:now,radius:Math.min(width*.15,95),phase});
      // Cap the pool so fast gestures remain light on mobile.
      if (trails.length > 40) trails.shift();
      if (now-lastSpawn > 100 || !waves.length || distance > 45) {
        waves.push({x:tx,y:ty,born:now,radius:45+Math.min(distance,35),phase});
        if (waves.length > 16) waves.shift();
      }
      lastSpawn=now; lastPoint={x:tx,y:ty};
    }
    schedule();
  }
  function sync() {
    if (!layer) return;
    layer.classList.toggle('is-paused', !visible());
    if (!visible() || reduced.matches) {
      cancelAnimationFrame(frame); frame=0; lastTime=0; trails=[]; waves=[];
      ctx.clearRect(0,0,width,height);
    } else schedule();
  }
  function mount() {
    const next = document.querySelector('.hero-gradient');
    if (!next || next === layer) return;
    if (host) { host.removeEventListener('pointermove', move); host.removeEventListener('pointerdown', move); }
    cancelAnimationFrame(frame); frame=0; lastTime=lastSpawn=0;
    if (canvas) canvas.remove();
    layer=next; host=layer.parentElement;
    canvas=document.createElement('canvas'); canvas.className='hero-gradient-water'; canvas.setAttribute('aria-hidden','true');
    ctx=canvas.getContext('2d');
    if (!ctx) return;
    layer.appendChild(canvas); layer.classList.remove('is-awake');
    width=height=1; x=tx=.75; y=ty=.5; resize();
    host.addEventListener('pointermove',move,{passive:true});
    host.addEventListener('pointerdown',move,{passive:true}); sync();
  }
  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('scroll',sync,{passive:true});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true}); mount();
})();

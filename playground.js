(function () {
  let root;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ideas = [
    ['A little unexpected.', 'A perfume campaign set on another planet.', 'PRODUCT CGI'],
    ['Turn up the volume.', 'An esports stage that feels like a playable world.', 'EXPERIENTIAL'],
    ['Make the ordinary strange.', 'A familiar object, a surreal scale, a new story.', 'ART DIRECTION'],
    ['From pixels to places.', 'A music installation you can step inside.', 'SPATIAL DESIGN']
  ];
  let ideaIndex = 0, dialog, opener, surprise;
  function closePanel() { if (dialog && dialog.open) dialog.close(); }
  function panel(kind, button) {
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'studio-panel';
      dialog.setAttribute('aria-labelledby','studio-panel-title');
      dialog.setAttribute('data-no-smooth','');
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel();
      });
      dialog.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus({preventScroll:true}); });
      document.body.appendChild(dialog);
    }
    opener = button;
    const idea = ideas[ideaIndex % ideas.length];
    dialog.innerHTML = '<button type="button" class="studio-close" aria-label="Close studio panel">×</button>' +
      (kind === 'ideas' ? '<div class="studio-eyebrow">THE IDEAS FOLDER · NEVER EMPTY</div><h2 id="studio-panel-title">'+idea[0]+'</h2><div class="studio-note"><span>'+idea[2]+'</span><p>'+idea[1]+'</p><div class="studio-note-footer">✦ A spark, not a finished brief.</div></div><button type="button" class="studio-action">Shuffle an idea ↗</button>' :
      '<div class="studio-eyebrow">COLOR PLAY</div><h2 id="studio-panel-title">Pick a color.</h2><p class="studio-instruction">Tap a color to change the artwork below.</p><div class="studio-color-preview" style="--preview-color:#ff7a1a" aria-hidden="true"><div class="studio-color-orb"></div><span>MAKE<br>IT POP.</span></div><div class="studio-swatches"><button type="button" style="--swatch:#ff7a1a" data-color="#ff7a1a" data-name="Tangerine" aria-pressed="true"><span>Tangerine</span></button><button type="button" style="--swatch:#963dff" data-color="#963dff" data-name="Violet" aria-pressed="false"><span>Violet</span></button><button type="button" style="--swatch:#c8ef82" data-color="#c8ef82" data-name="Lime" aria-pressed="false"><span>Lime</span></button></div><p class="studio-caption" role="status">Now playing: Tangerine.</p>');
    dialog.querySelectorAll('[data-color]').forEach(swatch => {
      swatch.addEventListener('click', () => {
        dialog.querySelector('.studio-color-preview').style.setProperty('--preview-color',swatch.dataset.color);
        dialog.querySelectorAll('[data-color]').forEach(item => item.setAttribute('aria-pressed',String(item === swatch)));
        dialog.querySelector('.studio-caption').textContent = 'Now playing: ' + swatch.dataset.name + '.';
      });
    });
    dialog.querySelector('.studio-close').addEventListener('click',closePanel);
    const shuffle = dialog.querySelector('.studio-action');
    if (shuffle) shuffle.addEventListener('click', () => { ideaIndex++; panel('ideas',opener); dialog.querySelector('.studio-action').focus(); });
    if (!dialog.open) {
      dialog.showModal();
      if (!reduced.matches) dialog.animate([
        {opacity:0,transform:'translateY(24px) scale(.94)'},
        {opacity:1,transform:'translateY(0) scale(1)'}
      ],{duration:420,easing:'cubic-bezier(.16,1,.3,1)'});
    }
  }
  function pop(kind) {
    if (surprise) surprise.remove();
    clearTimeout(pop.timer);
    surprise = document.createElement('div'); surprise.className = 'studio-surprise';
    surprise.setAttribute('role','status');
    surprise.innerHTML = kind === 'mood' ? '<div class="studio-big-face">(⌐■_■)</div><strong>Creative mode: looking good.</strong><span>Serious about the work. Playful about the process.</span>' : '<div class="studio-big-face">✦</div><strong>What if we made it weird?</strong><span>Same brief. Unexpected perspective.</span>';
    document.body.appendChild(surprise);
    if (!reduced.matches) {
      surprise.animate([{opacity:0,transform:'translate(-50%,-45%) scale(.8)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.16},{opacity:1,offset:.8},{opacity:0,transform:'translate(-50%,-55%) scale(1.05)'}],{duration:2400,easing:'cubic-bezier(.16,1,.3,1)'});
      const colors=['#ff7a1a','#963dff','#c8ef82'];
      for (let i=0;i<14;i++) {
        const spark=document.createElement('i');spark.className='studio-spark';spark.style.background=colors[i%3];surprise.appendChild(spark);
        const angle=i/14*Math.PI*2, dx=Math.cos(angle)*150,dy=Math.sin(angle)*100;
        spark.animate([{opacity:0,transform:'translate(0,0) scale(.3)'},{opacity:1,offset:.18},{opacity:0,transform:'translate('+dx+'px,'+dy+'px) scale(.5)'}],{duration:1400,easing:'cubic-bezier(.16,1,.3,1)'});
      }
    }
    pop.timer=setTimeout(()=>{ if(surprise) { surprise.remove();surprise=null; } },2400);
  }
  function mount() {
    const hero = document.querySelector('[data-hero-trail]');
    if (!hero || root && root.isConnected) return;
    root = document.createElement('div'); root.className = 'hero-stickers';
    hero.parentElement.appendChild(root);
    ['ideas', 'mood', 'color', 'weird'].forEach(kind => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'creative-sticker creative-sticker--' + kind;
      const icon = document.createElement('span'); icon.className = 'sticker-icon'; icon.setAttribute('aria-hidden','true');
      icon.textContent = {ideas:'✦',mood:'(⌐■_■)',color:'●',weird:'↗'}[kind];
      button.appendChild(icon);
      if (kind !== 'mood') button.appendChild(document.createTextNode(' '+{ideas:'IDEAS FOLDER',color:'COLOR PLAY',weird:'MAKE IT WEIRD'}[kind]));
      button.setAttribute('aria-label', {ideas:'Open the ideas folder',mood:'Show the studio mood',color:'Explore the studio palette',weird:'Show a creative surprise'}[kind]);
      root.appendChild(button);
      let start, moved = false;
      button.addEventListener('pointerenter', () => {
        if (reduced.matches) return;
        icon.animate(kind === 'mood' ? [
          {transform:'translateY(0)'},{transform:'translateY(-4px)',offset:.4},{transform:'translateY(0)'}
        ] : [{transform:'rotate(0) scale(1)'},{transform:'rotate(90deg) scale(1.3)',offset:.5},{transform:'rotate(180deg) scale(1)'}],
        {duration:550,easing:'cubic-bezier(.16,1,.3,1)'});
      });
      button.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        const rect = button.getBoundingClientRect();
        start = { x:event.clientX, y:event.clientY, left:rect.left, top:rect.top };
        moved = false; button.setPointerCapture(event.pointerId);
      });
      button.addEventListener('pointermove', event => {
        if (!start) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (Math.hypot(dx,dy) > 5) moved = true;
        if (!moved) return;
        const bounds = root.getBoundingClientRect();
        button.style.right = 'auto';
        button.style.left = Math.max(8,Math.min(bounds.width-button.offsetWidth-8,start.left-bounds.left+dx)) + 'px';
        button.style.top = Math.max(80,Math.min(bounds.height-button.offsetHeight-16,start.top-bounds.top+dy)) + 'px';
      });
      button.addEventListener('pointerup', () => { start = null; });
      button.addEventListener('pointercancel', () => { start = null; moved = true; });
      button.addEventListener('click', () => {
        if (moved) { moved = false; return; }
        if (!reduced.matches) {
          const rect = button.getBoundingClientRect();
          for (let i=0;i<8;i++) {
            const particle=document.createElement('span'); particle.className='sticker-burst'; particle.textContent=i%2?'✦':'·';
            particle.style.left=(rect.left+rect.width/2)+'px'; particle.style.top=(rect.top+rect.height/2)+'px';
            particle.style.color={ideas:'#c8ef82',mood:'#b7a2ff',color:'#ff9a52',weird:'#fff'}[kind];
            document.body.appendChild(particle);
            const angle=i*Math.PI/4;
            particle.animate([{opacity:1,transform:'translate(-50%,-50%) scale(.5)'},
              {opacity:0,transform:'translate(calc(-50% + '+Math.cos(angle)*95+'px),calc(-50% + '+Math.sin(angle)*75+'px)) scale(1.3)'}],
              {duration:650,easing:'cubic-bezier(.16,1,.3,1)'}).onfinish=()=>particle.remove();
          }
        }
        if (kind === 'ideas' || kind === 'color') panel(kind,button);
        else pop(kind);
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) button.animate([
          { transform:'scale(1)' }, { transform:'scale(.9)',offset:.25 }, { transform:'scale(1.08)',offset:.6 }, { transform:'scale(1)' }
        ], { duration:450,easing:'cubic-bezier(.16,1,.3,1)' });
      });
    });
  }
  new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize', () => {
    if (root) root.querySelectorAll('.creative-sticker').forEach(button => {
      button.style.removeProperty('left');
      button.style.removeProperty('right');
      button.style.removeProperty('top');
    });
  });
  mount();
})();

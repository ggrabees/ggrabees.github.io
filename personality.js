(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#ff638e', '#8e79ff', '#69e6db', '#ffd76b', '#b9f66b'];
  let taps = 0, tapTime = 0, modeTimer, toastTimer;
  function toast(message) {
    let el = document.querySelector('[data-personality-toast]');
    if (!el) {
      el = document.createElement('div');
      el.dataset.personalityToast = '';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }
  function burst(x, y, count) {
    if (reduce.matches) return;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('i');
      dot.className = 'personality-particle';
      dot.style.cssText = 'left:' + x + 'px;top:' + y + 'px;background:' + colors[i % colors.length] + ';border-radius:' + (i % 3 ? '50%' : '3px');
      document.body.appendChild(dot);
      const angle = Math.PI * 2 * i / count;
      const distance = 60 + Math.random() * 100;
      const animation = dot.animate([
        { opacity: 1, transform: 'translate(-50%,-50%) scale(.5)' },
        { opacity: 1, transform: 'translate(calc(-50% + ' + Math.cos(angle) * distance * .6 + 'px),calc(-50% + ' + Math.sin(angle) * distance * .6 + 'px)) scale(1)', offset: .3 },
        { opacity: 0, transform: 'translate(calc(-50% + ' + Math.cos(angle) * distance + 'px),calc(-50% + ' + (Math.sin(angle) * distance + 45) + 'px)) scale(.2)' }
      ], { duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)' });
      animation.onfinish = () => dot.remove();
    }
  }
  function creativeMode(element) {
    clearTimeout(modeTimer);
    document.documentElement.classList.add('creative-mode');
    toast('Creative Mode unlocked. A little color. A little chaos.');
    const rect = element.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.bottom + 20, 24);
    modeTimer = setTimeout(() => document.documentElement.classList.remove('creative-mode'), 8000);
  }
  document.addEventListener('click', event => {
    const name = event.target.closest('[data-creative-trigger]');
    if (name) {
      const now = performance.now();
      taps = now - tapTime < 1500 ? taps + 1 : 1;
      tapTime = now;
      if (taps === 3) { taps = 0; creativeMode(name); }
    }
    const talk = event.target.closest('[data-talk-surprise]');
    if (!talk || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const rect = talk.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
    toast('Challenge accepted. Let’s make something good.');
    // Keep normal link navigation, including keyboard and new-tab behavior.
    const label = talk.dataset.originalLabel || talk.textContent;
    talk.dataset.originalLabel = label;
    talk.textContent = 'Challenge accepted.';
    setTimeout(() => { if (talk.isConnected) talk.textContent = label; }, 1800);
  }, true);
})();

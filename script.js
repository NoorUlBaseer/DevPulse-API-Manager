document.addEventListener('DOMContentLoaded', () => { // Animate counters
  const counters = document.querySelectorAll('[data-target]');
  counters.forEach(el => {
    const targetRaw = el.getAttribute('data-target');
    const isK = /k$/i.test(targetRaw);
    const targetNum = parseFloat(targetRaw.replace(/k/i, '')) * (isK ? 1000 : 1);
    const duration = 1600;
    const start = 0;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * (targetNum - start) + start);
      el.textContent = isK ? (value >= 1000 ? (value/1000).toFixed(1)+'k' : value) : value;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });

  // Mobile menu toggle
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const header = document.querySelector('header');
  function updateHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  }

  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight); // Update header height on window resize
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const expanded = mobileMenu.classList.contains('hidden') ? 'false' : 'true';
      menuBtn.setAttribute('aria-expanded', expanded);
      requestAnimationFrame(updateHeaderHeight); // Update header height after menu toggle
    });

    // Close mobile menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        requestAnimationFrame(updateHeaderHeight); // Update header height after menu toggle
      });
    });

    // Close mobile menu on Escape key or click outside
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        requestAnimationFrame(updateHeaderHeight); // Update header height after menu toggle
      }
    });
    
    // Close mobile menu when clicking outside of it
    document.addEventListener('pointerdown', (e) => {
      if (mobileMenu.classList.contains('hidden')) return;
      const target = e.target;
      if (!mobileMenu.contains(target) && !menuBtn.contains(target)) {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        requestAnimationFrame(updateHeaderHeight); // Update header height after menu toggle
      }
    });
  }
});

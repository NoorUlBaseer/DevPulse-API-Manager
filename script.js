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
});

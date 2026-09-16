// Star Sequential Pattern Controller
(function () {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes starPulse {
      0% {
        filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.4));
        transform: scale(1);
        opacity: 0.7;
      }
      50% {
        filter: 
          drop-shadow(0 0 10px rgba(250, 204, 21, 1))
          drop-shadow(0 0 16px rgba(250, 204, 21, 0.9));
        transform: scale(1.15);
        opacity: 1;
      }
      100% {
        filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.4));
        transform: scale(1);
        opacity: 0.7;
      }
    }

    .star-active {
      animation: starPulse 0.6s ease-in-out;
    }
  `;
  document.head.appendChild(style);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function getStars() {
    return Array.from(document.querySelectorAll("svg.text-yellow-300"));
  }

  function clearStars(stars) {
    stars.forEach(s => s.classList.remove("star-active"));
  }

  function activate(stars, indices) {
    clearStars(stars);
    indices.forEach(i => {
      if (stars[i]) stars[i].classList.add("star-active");
    });
  }

  async function runSequence() {
    while (true) {
      const stars = getStars();
      const n = stars.length;

      if (n === 0) {
        await sleep(1000);
        continue;
      }

      // pattern 1: 1 3 5 (odd indices)
      activate(stars, stars.map((_, i) => i).filter(i => i % 2 === 0));
      await sleep(800);

      // pattern 2: 2 4 (even indices)
      activate(stars, stars.map((_, i) => i).filter(i => i % 2 === 1));
      await sleep(800);

      // pattern 3: 1 then 2 then 3 then 4 then 5
      for (let i = 0; i < n; i++) {
        activate(stars, [i]);
        await sleep(350);
      }

      // pattern 4: 5 4 3 2 1
      for (let i = n - 1; i >= 0; i--) {
        activate(stars, [i]);
        await sleep(350);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSequence);
  } else {
    runSequence();
  }
})();
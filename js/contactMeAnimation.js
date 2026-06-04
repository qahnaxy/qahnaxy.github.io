(() => {
  const STAR_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
    </svg>
  `;

  const STAR_COLORS = ["#facc15", "#60a5fa", "#34d399", "#f472b6", "#fb7185", "#c084fc"];
  const wrappers = document.querySelectorAll("[data-contact-animation]");

  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function createParticle(type, color, size) {
    const particle = document.createElement("span");
    particle.className = `contact-me-particle contact-me-particle--${type}`;
    particle.style.color = color;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.innerHTML = STAR_SVG;
    return particle;
  }

  function playParticleAnimation(particle, config) {
    const {
      x,
      y,
      rotation,
      scale,
      duration,
      delay,
      finalYOffset,
      easing,
    } = config;

    const frames = [
      {
        opacity: 0,
        transform: "translate(-50%, -50%) translate(0px, 10px) scale(0.25) rotate(0deg)",
      },
      {
        offset: 0.16,
        opacity: 1,
        transform: `translate(-50%, -50%) translate(${x * 0.42}px, ${y * 0.42}px) scale(${scale}) rotate(${rotation * -0.55}deg)`,
      },
      {
        offset: 0.34,
        opacity: 1,
        transform: `translate(-50%, -50%) translate(${x * 0.74}px, ${y * 0.74}px) scale(${scale * 1.04}) rotate(${rotation}deg)`,
      },
      {
        offset: 0.46,
        opacity: 0.98,
        transform: `translate(-50%, -50%) translate(${x * 0.74}px, ${y * 0.74}px) scale(${scale * 1.02}) rotate(${rotation * -0.85}deg)`,
      },
      {
        offset: 0.64,
        opacity: 0.9,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation * 0.5}deg)`,
      },
      {
        opacity: 0,
        transform: `translate(-50%, -50%) translate(${x * 0.14}px, ${finalYOffset}px) scale(0.3) rotate(${rotation * 1.35}deg)`,
      },
    ];

    const animation = particle.animate(frames, {
      duration,
      delay,
      easing,
      fill: "forwards",
    });

    animation.finished
      .catch(() => {})
      .finally(() => particle.remove());
  }

  function triggerBurst(wrapper) {
    if (prefersReducedMotion.matches) {
      return;
    }

    const burstLayer = wrapper.querySelector("[data-contact-animation-burst]");
    if (!burstLayer) {
      return;
    }

    const now = Date.now();
    const lastPlayed = Number(wrapper.dataset.lastPlayed || 0);
    if (now - lastPlayed < 700) {
      return;
    }

    wrapper.dataset.lastPlayed = String(now);
    wrapper.classList.remove("is-animating");
    void wrapper.offsetWidth;
    wrapper.classList.add("is-animating");

    window.setTimeout(() => {
      wrapper.classList.remove("is-animating");
    }, 560);

    const starCount = 6;
    for (let index = 0; index < starCount; index += 1) {
      const star = createParticle("star", pick(STAR_COLORS), randomBetween(10, 16));
      burstLayer.appendChild(star);

      playParticleAnimation(star, {
        x: randomBetween(-84, 84),
        y: randomBetween(-118, -34),
        rotation: randomBetween(-180, 180),
        scale: randomBetween(0.75, 1.18),
        duration: randomBetween(820, 1080),
        delay: index * 34,
        finalYOffset: randomBetween(8, 14),
        easing: "cubic-bezier(0.18, 0.9, 0.22, 1)",
      });
    }
  }

  wrappers.forEach((wrapper) => {
    const trigger = wrapper.querySelector("[data-contact-animation-trigger]");
    if (!trigger) {
      return;
    }

    trigger.addEventListener("pointerenter", () => triggerBurst(wrapper));
    trigger.addEventListener("focus", () => triggerBurst(wrapper));
  });
})();

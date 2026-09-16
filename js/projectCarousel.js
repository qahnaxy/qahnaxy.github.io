document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector('[data-carousel-container="projects"]');
  const previousButton = document.querySelector("[data-carousel-prev]");
  const nextButton = document.querySelector("[data-carousel-next]");

  if (!carousel) return;

  let currentIndex = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let hasMoved = false;
  let startTime = 0;
  let isAnimating = false;
  let activePointerId = null;
  let projectsReady = false;
  let initialized = false;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function getCards() {
    return Array.from(carousel.querySelectorAll(".project-card"));
  }

  function forceMobileStack() {
    if (!isMobile()) return;

    const cards = getCards();

    if (!cards.length) return;

    carousel.style.position = "relative";

    cards.forEach((card, index) => {
      const relativeIndex =
        (index - currentIndex + cards.length) % cards.length;

      card.classList.remove("hidden");

      card.style.position = "absolute";
      card.style.left = "0";
      card.style.top = "24px";
      card.style.width = "100%";
      card.style.margin = "0";
      card.style.pointerEvents = "none";
      card.style.transition = "none";

      if (relativeIndex === 0) {
        card.style.zIndex = "30";
        card.style.transform = "translate3d(0,0,0) scale(1)";
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      } else if (relativeIndex === 1) {
        card.style.zIndex = "20";
        card.style.transform = "translate3d(12px,0,0) scale(0.97)";
        card.style.opacity = "1";
      } else if (relativeIndex === 2) {
        card.style.zIndex = "10";
        card.style.transform = "translate3d(24px,0,0) scale(0.94)";
        card.style.opacity = "1";
      } else {
        card.style.zIndex = "0";
        card.style.transform = "translate3d(36px,0,0) scale(0.91)";
        card.style.opacity = "0";
      }
    });

    const frontCard = cards[currentIndex];

    if (frontCard) {
      carousel.style.height = `${frontCard.offsetHeight + 48}px`;
    }
  }

  function updateDesktop() {
    const cards = getCards();

    if (!cards.length) return;

    const visibleCount = 3;

    if (currentIndex > cards.length - visibleCount) {
      currentIndex = Math.max(
        0,
        cards.length - visibleCount
      );
    }

    carousel.style.position = "";
    carousel.style.height = "";

    cards.forEach((card, index) => {
      card.classList.toggle(
        "hidden",
        index < currentIndex ||
        index >= currentIndex + visibleCount
      );

      card.style.position = "";
      card.style.left = "";
      card.style.top = "";
      card.style.width = "";
      card.style.margin = "";
      card.style.zIndex = "";
      card.style.transform = "";
      card.style.opacity = "";
      card.style.pointerEvents = "";
      card.style.transition = "";
    });
  }

  function updateMobile(animate = false) {
    const cards = getCards();

    if (!cards.length) return;

    carousel.style.position = "relative";

    cards.forEach((card, index) => {
      const relativeIndex =
        (index - currentIndex + cards.length) % cards.length;

      card.classList.remove("hidden");

      card.style.position = "absolute";
      card.style.left = "0";
      card.style.top = "24px";
      card.style.width = "100%";
      card.style.margin = "0";
      card.style.pointerEvents = "none";

      card.style.transition = animate
        ? "transform 350ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease"
        : "none";

      if (relativeIndex === 0) {
        card.style.zIndex = "30";
        card.style.transform = "translate3d(0,0,0) scale(1)";
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      } else if (relativeIndex === 1) {
        card.style.zIndex = "20";
        card.style.transform = "translate3d(12px,0,0) scale(0.97)";
        card.style.opacity = "1";
      } else if (relativeIndex === 2) {
        card.style.zIndex = "10";
        card.style.transform = "translate3d(24px,0,0) scale(0.94)";
        card.style.opacity = "1";
      } else {
        card.style.zIndex = "0";
        card.style.transform = "translate3d(36px,0,0) scale(0.91)";
        card.style.opacity = "0";
      }
    });

    const frontCard = cards[currentIndex];

    if (frontCard) {
      requestAnimationFrame(() => {
        carousel.style.height =
          `${frontCard.offsetHeight + 48}px`;
      });
    }
  }

  function updateCards(animate = false) {
    if (!projectsReady) return;

    const cards = getCards();

    if (!cards.length) return;

    if (isMobile()) {
      updateMobile(animate);
    } else {
      updateDesktop();
    }
  }

  function initializeCarousel() {
    const cards = getCards();

    if (!cards.length) return false;

    currentIndex = 0;
    isDragging = false;
    isAnimating = false;
    activePointerId = null;
    hasMoved = false;

    projectsReady = true;
    initialized = true;

    if (isMobile()) {
      forceMobileStack();

      requestAnimationFrame(() => {
        forceMobileStack();

        requestAnimationFrame(() => {
          forceMobileStack();
        });
      });
    } else {
      updateDesktop();
    }

    return true;
  }

  function showNext() {
    if (!initialized || !projectsReady || isAnimating) return;

    const cards = getCards();

    if (!cards.length) return;

    if (!isMobile()) {
      if (cards.length <= 3) return;

      if (currentIndex < cards.length - 3) {
        currentIndex++;
        updateDesktop();
      }

      return;
    }

    if (cards.length <= 1) return;

    const frontCard = cards[currentIndex];

    if (!frontCard) return;

    isAnimating = true;

    frontCard.style.transition =
      "transform 300ms ease, opacity 300ms ease";

    frontCard.style.transform =
      "translate3d(-120%,0,0) rotate(-8deg) scale(0.92)";

    frontCard.style.opacity = "0";

    setTimeout(() => {
      currentIndex =
        (currentIndex + 1) % cards.length;

      updateMobile(false);

      isAnimating = false;
    }, 310);
  }

  function showPrevious() {
    if (!initialized || !projectsReady || isAnimating) return;

    const cards = getCards();

    if (!cards.length) return;

    if (!isMobile()) {
      if (currentIndex > 0) {
        currentIndex--;
        updateDesktop();
      }

      return;
    }

    if (cards.length <= 1) return;

    const frontCard = cards[currentIndex];

    if (!frontCard) return;

    isAnimating = true;

    frontCard.style.transition =
      "transform 300ms ease, opacity 300ms ease";

    frontCard.style.transform =
      "translate3d(120%,0,0) rotate(8deg) scale(0.92)";

    frontCard.style.opacity = "0";

    setTimeout(() => {
      currentIndex =
        (currentIndex - 1 + cards.length) % cards.length;

      updateMobile(false);

      isAnimating = false;
    }, 310);
  }

  function startDrag(event) {
    if (!projectsReady) return;
    if (!initialized) return;
    if (!isMobile()) return;
    if (isAnimating) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const cards = getCards();

    if (cards.length <= 1) return;

    const frontCard = cards[currentIndex];

    if (!frontCard) return;

    isDragging = true;
    hasMoved = false;
    activePointerId = event.pointerId;

    startX = event.clientX;
    currentX = event.clientX;
    startTime = Date.now();

    frontCard.style.transition = "none";

    try {
      carousel.setPointerCapture(event.pointerId);
    } catch {}
  }

  function moveDrag(event) {
    if (!isDragging) return;
    if (!isMobile()) return;
    if (event.pointerId !== activePointerId) return;

    const cards = getCards();
    const frontCard = cards[currentIndex];

    if (!frontCard) return;

    currentX = event.clientX;

    const distance = currentX - startX;

    if (Math.abs(distance) > 5) {
      hasMoved = true;
    }

    const rotation = distance * 0.03;

    const scale = Math.max(
      0.96,
      1 - Math.abs(distance) / 2500
    );

    frontCard.style.transform =
      `translate3d(${distance}px,0,0) rotate(${rotation}deg) scale(${scale})`;

    if (hasMoved) {
      event.preventDefault();
    }
  }

  function endDrag(event) {
    if (!isDragging) return;
    if (!isMobile()) return;
    if (event && event.pointerId !== activePointerId) return;

    const cards = getCards();
    const frontCard = cards[currentIndex];

    isDragging = false;

    try {
      if (
        activePointerId !== null &&
        carousel.hasPointerCapture(activePointerId)
      ) {
        carousel.releasePointerCapture(activePointerId);
      }
    } catch {}

    activePointerId = null;

    if (!frontCard) return;

    const distance = currentX - startX;
    const elapsed = Date.now() - startTime;

    const velocity =
      Math.abs(distance) / Math.max(elapsed, 1);

    const shouldSwipe =
      Math.abs(distance) > 80 ||
      velocity > 0.5;

    if (shouldSwipe && hasMoved) {
      isAnimating = true;

      const direction = distance < 0 ? 1 : -1;

      frontCard.style.transition =
        "transform 300ms ease, opacity 300ms ease";

      frontCard.style.transform =
        direction === 1
          ? "translate3d(-120%,0,0) rotate(-8deg) scale(0.92)"
          : "translate3d(120%,0,0) rotate(8deg) scale(0.92)";

      frontCard.style.opacity = "0";

      setTimeout(() => {
        currentIndex =
          (currentIndex + direction + cards.length) %
          cards.length;

        updateMobile(false);

        isAnimating = false;
      }, 310);
    } else {
      frontCard.style.transition =
        "transform 300ms cubic-bezier(0.22,1,0.36,1)";

      frontCard.style.transform =
        "translate3d(0,0,0) rotate(0deg) scale(1)";
    }

    setTimeout(() => {
      hasMoved = false;
    }, 50);
  }

  carousel.addEventListener(
    "pointerdown",
    startDrag
  );

  carousel.addEventListener(
    "pointermove",
    moveDrag
  );

  carousel.addEventListener(
    "pointerup",
    endDrag
  );

  carousel.addEventListener(
    "pointercancel",
    endDrag
  );

  carousel.addEventListener(
    "click",
    event => {
      if (hasMoved) {
        event.preventDefault();
        event.stopPropagation();
        hasMoved = false;
      }
    },
    true
  );

  if (previousButton) {
    previousButton.addEventListener(
      "click",
      showPrevious
    );
  }

  if (nextButton) {
    nextButton.addEventListener(
      "click",
      showNext
    );
  }

  window.addEventListener("resize", () => {
    if (!projectsReady) return;

    isDragging = false;
    isAnimating = false;
    activePointerId = null;
    hasMoved = false;

    requestAnimationFrame(() => {
      updateCards(false);
    });
  });

  document.addEventListener(
    "projectsLoaded",
    () => {
      initializeCarousel();
    },
    { once: true }
  );

  /*
   * In case the projects are already in the DOM
   * before this script runs.
   */
  if (getCards().length > 0) {
    initializeCarousel();
  }
});

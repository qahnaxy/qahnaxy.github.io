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

  function isMobile() {
    return window.innerWidth < 768;
  }

  function getVisibleCount() {
    return window.innerWidth >= 768 ? 3 : 1;
  }

  function getCards() {
    return Array.from(carousel.querySelectorAll(".project-card"));
  }

  function updateDesktop() {
    const cards = getCards();

    if (!cards.length) return;

    const visibleCount = getVisibleCount();

    if (currentIndex > cards.length - visibleCount) {
      currentIndex = Math.max(0, cards.length - visibleCount);
    }

    carousel.style.height = "";

    cards.forEach((card, index) => {
      card.classList.remove("hidden");

      card.style.position = "";
      card.style.left = "";
      card.style.top = "";
      card.style.width = "";
      card.style.zIndex = "";
      card.style.transform = "";
      card.style.opacity = "";
      card.style.pointerEvents = "";

      const visible = index >= currentIndex && index < currentIndex + visibleCount;

      card.classList.toggle("hidden", !visible);
    });
  }

  function updateMobile(animate = true) {
    const cards = getCards();

    if (!cards.length) return;

    cards.forEach((card, index) => {
      card.classList.remove("hidden");

      card.style.position = "absolute";
      card.style.left = "0";
      card.style.top = "24px";
      card.style.width = "100%";
      card.style.zIndex = "0";
      card.style.opacity = "1";
      card.style.pointerEvents = "none";
      card.style.transition = animate
        ? "transform 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease"
        : "none";

      const relativeIndex = (index - currentIndex + cards.length) % cards.length;

      if (relativeIndex === 0) {
        card.style.zIndex = "30";
        card.style.transform = "translateX(0) scale(1)";
        card.style.pointerEvents = "auto";
      } else if (relativeIndex === 1) {
        card.style.zIndex = "20";
        card.style.transform = "translateX(12px) scale(0.97)";
      } else if (relativeIndex === 2) {
        card.style.zIndex = "10";
        card.style.transform = "translateX(24px) scale(0.94)";
      } else {
        card.style.zIndex = "0";
        card.style.transform = "translateX(36px) scale(0.91)";
        card.style.opacity = "0";
      }
    });

    requestAnimationFrame(() => {
      const frontCard = cards[currentIndex];

      if (frontCard) {
        carousel.style.height = `${frontCard.offsetHeight + 48}px`;
      }
    });
  }

  function updateCards(animate = true) {
    if (isMobile()) {
      updateMobile(animate);
    } else {
      updateDesktop();
    }
  }

  function showNext() {
    const cards = getCards();

    if (!cards.length) return;

    if (isMobile()) {
      if (cards.length <= 1) return;

      currentIndex = (currentIndex + 1) % cards.length;
      updateMobile();
      return;
    }

    const visibleCount = getVisibleCount();

    if (cards.length <= visibleCount) return;

    if (currentIndex + visibleCount < cards.length) {
      currentIndex++;
      updateDesktop();
    }
  }

  function showPrevious() {
    const cards = getCards();

    if (!cards.length) return;

    if (isMobile()) {
      if (cards.length <= 1) return;

      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      updateMobile();
      return;
    }

    if (currentIndex > 0) {
      currentIndex--;
      updateDesktop();
    }
  }

  function startDrag(event) {
    if (!isMobile()) return;

    const cards = getCards();

    if (!cards.length || cards.length <= 1) return;

    isDragging = true;
    hasMoved = false;
    startX = event.clientX;
    currentX = event.clientX;
    startTime = Date.now();

    const frontCard = cards[currentIndex];

    frontCard.style.transition = "none";
    frontCard.style.cursor = "grabbing";
  }

  function moveDrag(event) {
    if (!isDragging || !isMobile()) return;

    const cards = getCards();
    const frontCard = cards[currentIndex];

    if (!frontCard) return;

    currentX = event.clientX;

    const distance = currentX - startX;

    if (Math.abs(distance) > 5) {
      hasMoved = true;
    }

    const rotation = distance * 0.03;
    const scale = Math.max(0.96, 1 - Math.abs(distance) / 2500);

    frontCard.style.transform = `translateX(${distance}px) rotate(${rotation}deg) scale(${scale})`;
  }

  function endDrag() {
    if (!isDragging || !isMobile()) return;

    const cards = getCards();
    const frontCard = cards[currentIndex];

    if (!frontCard) {
      isDragging = false;
      return;
    }

    isDragging = false;
    frontCard.style.cursor = "";

    const distance = currentX - startX;
    const elapsed = Date.now() - startTime;
    const velocity = Math.abs(distance) / Math.max(elapsed, 1);

    const shouldSwipe = Math.abs(distance) > 80 || velocity > 0.5;

    if (shouldSwipe && hasMoved) {
      const direction = distance < 0 ? 1 : -1;

      frontCard.style.transition = "transform 300ms ease, opacity 300ms ease";

      if (direction === 1) {
        frontCard.style.transform = "translateX(-120%) rotate(-8deg) scale(0.92)";
      } else {
        frontCard.style.transform = "translateX(120%) rotate(8deg) scale(0.92)";
      }

      frontCard.style.opacity = "0";

      setTimeout(() => {
        currentIndex = (currentIndex + direction + cards.length) % cards.length;
        updateMobile(false);
      }, 280);
    } else {
      frontCard.style.transition = "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)";
      frontCard.style.transform = "translateX(0) rotate(0deg) scale(1)";
    }

    setTimeout(() => {
      hasMoved = false;
    }, 50);
  }

  carousel.addEventListener("pointerdown", startDrag);
  carousel.addEventListener("pointermove", moveDrag);
  carousel.addEventListener("pointerup", endDrag);
  carousel.addEventListener("pointercancel", endDrag);

  carousel.addEventListener("click", event => {
    if (hasMoved) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  if (previousButton) {
    previousButton.addEventListener("click", showPrevious);
  }

  if (nextButton) {
    nextButton.addEventListener("click", showNext);
  }

  window.addEventListener("resize", () => {
    updateCards(false);
  });

  document.addEventListener("projectsLoaded", () => {
    currentIndex = 0;
    updateCards(false);
  });

  updateCards(false);
});
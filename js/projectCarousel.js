(function () {
  const carouselContainer = document.querySelector('[data-carousel-container="projects"]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');

  if (!carouselContainer || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function getCards() {
    return Array.from(carouselContainer.querySelectorAll('.project-card'));
  }

  function getVisibleCount() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function scrollToProject(index) {
    const cards = getCards();
    if (!cards.length) return;

    const maxIndex = Math.max(0, cards.length - getVisibleCount());
    currentIndex = Math.min(Math.max(index, 0), maxIndex);

    carouselContainer.scrollTo({
      left: cards[currentIndex].offsetLeft - carouselContainer.offsetLeft,
      behavior: 'smooth'
    });
  }

  prevBtn.addEventListener('click', () => {
    scrollToProject(currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    scrollToProject(currentIndex + 1);
  });

  window.addEventListener('resize', () => {
    scrollToProject(currentIndex);
  });
})();

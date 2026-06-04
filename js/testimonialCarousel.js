(function () {
  const mainCard = document.querySelector('[data-testimonial-main]');
  const prevBtn = document.querySelector('[data-testimonial-prev]');
  const nextBtn = document.querySelector('[data-testimonial-next]');
  const sideCards = Array.from(document.querySelectorAll('[data-testimonial-card]'));

  if (!mainCard || !prevBtn || !nextBtn || !sideCards.length) return;

  const mainImage = mainCard.querySelector('[data-testimonial-main-image]');
  const mainQuote = mainCard.querySelector('[data-testimonial-main-quote]');
  const mainName = mainCard.querySelector('[data-testimonial-main-name]');
  const mainTitle = mainCard.querySelector('[data-testimonial-main-title]');

  const testimonials = [
    {
      name: mainName.textContent.trim(),
      title: mainTitle.textContent.trim(),
      quote: mainQuote.textContent.trim(),
      image: mainImage.getAttribute('src')
    },
    ...sideCards.map((card) => ({
      name: card.dataset.testimonialName,
      title: card.dataset.testimonialTitle,
      quote: card.dataset.testimonialQuote,
      image: card.dataset.testimonialImage
    }))
  ];

  let activeIndex = 0;

  function render() {
    const active = testimonials[activeIndex];
    mainImage.src = active.image;
    mainQuote.textContent = active.quote;
    mainName.textContent = active.name;
    mainTitle.textContent = active.title;

    const sideTestimonials = testimonials.filter((_, index) => index !== activeIndex);

    sideCards.forEach((card, index) => {
      const testimonial = sideTestimonials[index % sideTestimonials.length];
      const image = card.querySelector('[data-testimonial-card-image]');
      const name = card.querySelector('[data-testimonial-card-name]');
      const title = card.querySelector('[data-testimonial-card-title]');

      card.dataset.testimonialIndex = testimonials.indexOf(testimonial);
      image.src = testimonial.image;
      name.textContent = testimonial.name;
      title.textContent = testimonial.title;
    });
  }

  function move(direction) {
    activeIndex = (activeIndex + direction + testimonials.length) % testimonials.length;
    render();
  }

  prevBtn.addEventListener('click', () => move(-1));
  nextBtn.addEventListener('click', () => move(1));

  sideCards.forEach((card) => {
    card.addEventListener('click', () => {
      activeIndex = Number(card.dataset.testimonialIndex);
      render();
    });
  });

  render();
})();

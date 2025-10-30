document.querySelectorAll('.nav').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();

        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            const gap = 30;
            const targetTop = target.getBoundingClientRect().top + window.scrollY;
            const scrollPosition = targetTop - gap;

            window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
        }
    });
});
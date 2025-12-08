document.addEventListener('DOMContentLoaded', () => {
    const services = document.querySelectorAll('.servicesColumn .service');

    const nextBtn = document.getElementById('sNext');
    const prevBtn = document.getElementById('sPrev');

    function isMobile() {
        return window.innerWidth <= 768;
    }

    let current = 0;

    function updateView() {
        if (!isMobile()) {
            // restore all for PC
            services.forEach(s => {
                s.style.display = 'flex';
            });
            return;
        }

        services.forEach((s, index) => {
            if (index === current) {
                s.style.display = 'flex';
            } else {
                s.style.display = 'none';
            }
        });
    }

    nextBtn.addEventListener('click', () => {
        if (!isMobile()) return;
        current = (current + 1) % services.length;
        updateView();
    });

    prevBtn.addEventListener('click', () => {
        if (!isMobile()) return;
        current = (current - 1 + services.length) % services.length;
        updateView();
    });

    // on resize keep behavior correct
    window.addEventListener('resize', updateView);

    updateView();
});

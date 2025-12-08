document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.bookCall');

    if (button) {
        button.addEventListener('click', () => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });

            // [WAIT FOR SCROLL TO FINISH THEN GLOW]
            setTimeout(() => {
                const target = document.querySelector('.contactForm');
                if (target) {
                    target.style.transition = 'box-shadow 0.5s ease';
                    target.style.boxShadow = '0 0 25px #803cfc';

                    // [GLOW TIMEOUT]
                    setTimeout(() => {
                        target.style.boxShadow = '';
                    }, 600);
                }
            }, 1000); // [WAIT FOR SCROLL TO FINISH]
        });
    }
});
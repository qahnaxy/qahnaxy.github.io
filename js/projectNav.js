document.addEventListener('DOMContentLoaded', () => {
    const projects = document.querySelectorAll('.projectsCont .project');
    const leftNav = document.querySelector('.containerHeaderLeftNav');
    const rightNav = document.querySelector('.containerHeaderRightNav');

    let current = 0;

    function updateView() {
        const isMobile = window.innerWidth <= 768;
        const visibleCount = isMobile ? 1 : 3; // how many projects to show on PC

        projects.forEach((p, i) => {
            p.style.display = (i >= current && i < current + visibleCount) ? 'block' : 'none';
        });
    }

    rightNav.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 768;
        const visibleCount = isMobile ? 1 : 3;

        current += 1;
        if (current > projects.length - visibleCount) {
            current = 0;
        }
        updateView();
    });

    leftNav.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 768;
        const visibleCount = isMobile ? 1 : 3;

        current -= 1;
        if (current < 0) {
            current = projects.length - visibleCount;
        }
        updateView();
    });

    window.addEventListener('resize', () => {
        // reset current to prevent empty view when resizing
        current = 0;
        updateView();
    });

    updateView();
});

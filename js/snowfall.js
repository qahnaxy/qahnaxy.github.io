document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snowOverlay');
    const ctx = canvas.getContext('2d');

    // Fullscreen overlay
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none'; // don't block clicks
    canvas.style.zIndex = '9999'; // above everything

    // Create snowflakes
    const flakes = [];
    const maxFlakes = 100;
    for(let i = 0; i < maxFlakes; i++) {
        flakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 4 + 1,
            d: Math.random() * maxFlakes
        });
    }

    let angle = 0;
    function drawSnow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.beginPath();
        for(let i = 0; i < flakes.length; i++) {
            const f = flakes[i];
            ctx.moveTo(f.x, f.y);
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
        }
        ctx.fill();
        updateSnow();
    }

    function updateSnow() {
        angle += 0.01;
        for(let i = 0; i < flakes.length; i++) {
            const f = flakes[i];
            f.y += Math.cos(angle + f.d) + 1 + f.r / 2;
            f.x += Math.sin(angle) * 2;

            if(f.y > canvas.height) {
                flakes[i] = {x: Math.random() * canvas.width, y: -10, r: f.r, d: f.d};
            }
        }
    }

    function animate() {
        drawSnow();
        requestAnimationFrame(animate);
    }
    animate();

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
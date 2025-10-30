document.addEventListener('DOMContentLoaded', () => {
    const timeElement = document.querySelector('.localtime p');

    function updateTime() {
        const now = new Date();

        // [NAIROBI TIME]
        const options = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Nairobi' };
        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const [hour, minute] = formatter.format(now).split(':');

        // [BLINKING COLON: FIX: without shifting colons]
        const colonVisible = Math.floor(Date.now() / 500) % 2 === 0;
        const colon = `<span style="visibility:${colonVisible ? 'visible' : 'hidden'}">:</span>`;

        timeElement.innerHTML = `${hour}${colon}${minute}`;
    }

    setInterval(updateTime, 500);
    updateTime();
});
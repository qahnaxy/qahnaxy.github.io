(() => {
  const timeElement = document.getElementById("nairobiTime");

  if (!timeElement) {
    return;
  }

  let serverTime = 0;
  let serverTimeStartedAt = 0;
  let timerId;

  const toTwoDigits = (value) => String(value).padStart(2, "0");

  const showTime = () => {
    const elapsed = performance.now() - serverTimeStartedAt;
    const kenyaTime = new Date(serverTime + elapsed);

    timeElement.textContent = `${toTwoDigits(kenyaTime.getUTCHours())}:${toTwoDigits(kenyaTime.getUTCMinutes())}`;
  };

  const startClock = (timeInMs) => {
    serverTime = timeInMs;
    serverTimeStartedAt = performance.now();
    showTime();
    timerId = setInterval(showTime, 1000);
  };

  const loadNairobiTime = async () => {
    try {
      const response = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=Africa/Nairobi", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load Nairobi time");
      }

      const data = await response.json();
      const timeInMs = Date.UTC(
        data.year,
        data.month - 1,
        data.day,
        data.hour,
        data.minute,
        data.seconds,
        data.milliSeconds
      );

      clearInterval(timerId);
      startClock(timeInMs);
    } catch (error) {
      timeElement.textContent = "--:--";
    }
  };

  loadNairobiTime();
  setInterval(loadNairobiTime, 60000);
})();

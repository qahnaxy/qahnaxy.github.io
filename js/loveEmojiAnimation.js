// Love Emoji Heartbeat Animation
(function() {
  // Create and inject the heartbeat CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes heartbeat {
      0% {
        transform: scale(1);
      }
      10% {
        transform: scale(1.1);
      }
      20% {
        transform: scale(1);
      }
      30% {
        transform: scale(1.15);
      }
      40% {
        transform: scale(1);
      }
      100% {
        transform: scale(1);
      }
    }

    #loveEmoji {
      display: inline-block;
      animation: heartbeat 1.2s ease-in-out infinite;
      transform-origin: center;
    }
  `;
  document.head.appendChild(style);
})();

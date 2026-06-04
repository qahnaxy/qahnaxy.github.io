(function () {
  function setupModal(options) {
    var modal = document.querySelector(options.modalSelector);
    var triggers = document.querySelectorAll(options.triggerSelector);
    var closeButtons = document.querySelectorAll(options.closeSelector);
    var lastFocusedElement = null;

    if (!modal || !triggers.length) {
      return;
    }

    function openModal(trigger) {
      lastFocusedElement = trigger || document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("coming-soon-modal-open");

      var closeButton = modal.querySelector(".coming-soon-modal__close");
      if (closeButton) {
        closeButton.focus();
      }
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("coming-soon-modal-open");

      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        openModal(trigger);
      });
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }


  setupModal({
    modalSelector: "[data-coming-soon-modal]",
    triggerSelector: "[data-coming-soon]",
    closeSelector: "[data-coming-soon-close]",
  });

  setupModal({
    modalSelector: "[data-coaching-modal]",
    triggerSelector: "[data-coaching-modal-trigger]",
    closeSelector: "[data-coaching-modal-close]",
  });
})();

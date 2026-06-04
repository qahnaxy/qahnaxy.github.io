document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const sendButton = document.getElementById('sendEmailBtn');

  if (!form || !sendButton || typeof emailjs === 'undefined') return;

  emailjs.init('pWtBznGhF5ih1IY_Y');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const originalButtonText = sendButton.textContent;
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';

    emailjs.sendForm('service_w9nv0mc', 'template_hea5p0m', form)
      .then(function () {
        alert('Message sent successfully!');
        form.reset();
      })
      .catch(function (error) {
        alert('Failed to send message:\n' + (error.text || 'Please try again.'));
      })
      .finally(function () {
        sendButton.disabled = false;
        sendButton.textContent = originalButtonText;
      });
  });
});

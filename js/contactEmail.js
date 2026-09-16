document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const sendButton = document.getElementById('sendEmailBtn');

  console.log('Contact JS loaded');
  console.log('Form:', form);
  console.log('Button:', sendButton);
  console.log('EmailJS:', typeof emailjs);

  if (!form || !sendButton) {
    console.log('Contact form or button not found');
    return;
  }

  if (typeof emailjs === 'undefined') {
    console.log('EmailJS is not loaded');
    return;
  }

  emailjs.init('pWtBznGhF5ih1IY_Y');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    console.log('Submit intercepted');

    const originalButtonText = sendButton.textContent;

    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';

    emailjs.sendForm('service_w9nv0mc', 'template_hea5p0m', form)
      .then(function () {
        alert('Message sent successfully!');
        form.reset();
      })
      .catch(function (error) {
        console.error('EmailJS error:', error);
        alert('Failed to send message:\n' + (error.text || 'Please try again.'));
      })
      .finally(function () {
        sendButton.disabled = false;
        sendButton.textContent = originalButtonText;
      });
  });
});
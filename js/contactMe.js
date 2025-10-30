document.addEventListener("DOMContentLoaded", function () {
  emailjs.init("pWtBznGhF5ih1IY_Y"); // Your public key

  const form = document.getElementById("contactForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    emailjs.sendForm("service_w9nv0mc", "template_hea5p0m", form)
      .then(() => {
        alert("✅ Message sent successfully!");
        form.reset();
      })
      .catch((error) => {
        alert("❌ Failed to send message:\n" + error.text);
      });
  });
});
/**
 * Scroll to contact section and add a glow effect for 1 second
 */
function scrollToContact() {
  const contactSection = document.getElementById('contact');
  
  if (contactSection) {
    // Scroll to the contact section smoothly
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    const formWrapper = contactSection.querySelector('[data-contact-form-wrapper]');
    
    if (formWrapper) {
      // Add glow effect to the contact form wrapper
      formWrapper.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.8), inset 0 0 30px rgba(59, 130, 246, 0.3)';
      
      // Remove glow effect after 1 second
      setTimeout(() => {
        formWrapper.style.boxShadow = '';
      }, 1000);
    }
  }
}

// Add event listener to Contact Me button
document.addEventListener('DOMContentLoaded', () => {
  const contactButton = document.querySelector('[data-contact-animation-trigger]');
  if (contactButton) {
    contactButton.addEventListener('click', scrollToContact);
  }
});

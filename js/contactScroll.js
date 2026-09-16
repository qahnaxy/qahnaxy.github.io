document.addEventListener('DOMContentLoaded', () => {
function scrollToContact() {
const contactSection = document.getElementById('contact');

if (contactSection) {
contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

const formWrapper = contactSection.querySelector('[data-contact-form-wrapper]');

if (formWrapper) {
formWrapper.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.8), inset 0 0 30px rgba(59, 130, 246, 0.3)';

setTimeout(() => {
formWrapper.style.boxShadow = '';
}, 1000);
}
}
}

const contactButton = document.querySelector('[data-contact-animation-trigger]');

if (contactButton) {
contactButton.addEventListener('click', scrollToContact);
}
});
/* ===================================
   FOREVER HUB — ABOUT / PORTFOLIO JS
=================================== */

document.addEventListener('DOMContentLoaded', function () {

    // -------------------------------------------------
    // MOBILE NAV TOGGLE
    // -------------------------------------------------

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    function closeNav() {
        navLinks.classList.remove('open');
        navOverlay.classList.remove('active');
    }

    if (navToggle) {

        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            navOverlay.classList.toggle('active');
        });

        navOverlay.addEventListener('click', closeNav);

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeNav);
        });

    }


    // -------------------------------------------------
    // ACTIVE LINK HIGHLIGHT ON SCROLL
    // -------------------------------------------------

    const sections = document.querySelectorAll('.section[id]');
    const navLinkEls = document.querySelectorAll('.nav-link[data-section]');

    if (sections.length && navLinkEls.length) {

        const observer = new IntersectionObserver(function (entries) {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                const id = entry.target.getAttribute('id');

                navLinkEls.forEach(link => {

                    const isActive = link.dataset.section === id;

                    link.classList.toggle('active', isActive);

                });

            });

        }, {

            rootMargin: '-40% 0px -55% 0px'

        });

        sections.forEach(section => observer.observe(section));

    }


    // -------------------------------------------------
    // CYCLING ROLE TEXT
    // -------------------------------------------------

    const roleText = document.getElementById('roleText');

    const roles = [
        'Building Forever AI',
        'Building Forever Weather',
        'Building Forever Shop',
        'Building Forever Hub'
    ];

    if (roleText) {

        let roleIndex = 0;
        let charIndex = roles[0].length;
        let isDeleting = false;

        function typeLoop() {

            const current = roles[roleIndex];

            if (isDeleting) {

                charIndex--;
                roleText.textContent = current.slice(0, charIndex);

                if (charIndex === 0) {
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(typeLoop, 400);
                    return;
                }

                setTimeout(typeLoop, 35);

            } else {

                charIndex++;
                roleText.textContent = current.slice(0, charIndex);

                if (charIndex === current.length) {
                    isDeleting = true;
                    setTimeout(typeLoop, 1800);
                    return;
                }

                setTimeout(typeLoop, 55);

            }

        }

        // Kick off the delete/retype cycle after the initial
        // static text (already in the HTML) has been shown.
        isDeleting = true;
        setTimeout(typeLoop, 1800);

    }


    // -------------------------------------------------
    // CONTACT FORM (Formspree)
    // -------------------------------------------------

    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const formSubmit = document.getElementById('formSubmit');

    if (contactForm) {

        contactForm.addEventListener('submit', async function (e) {

            e.preventDefault();

            const formData = new FormData(contactForm);

            formSubmit.disabled = true;

            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status';

            try {

                const response = await fetch(contactForm.action, {

                    method: 'POST',

                    body: formData,

                    headers: {
                        'Accept': 'application/json'
                    }

                });

                if (response.ok) {

                    formStatus.textContent = "Message sent — I'll get back to you soon.";
                    formStatus.className = 'form-status success';

                    contactForm.reset();

                } else {

                    const data = await response.json().catch(() => ({}));

                    console.error('Formspree error:', data);

                    formStatus.textContent = 'Something went wrong. Please try again or use WhatsApp.';
                    formStatus.className = 'form-status error';

                }

            } catch (error) {

                console.error(error);

                formStatus.textContent = "Couldn't send right now. Please check your connection.";
                formStatus.className = 'form-status error';

            } finally {

                formSubmit.disabled = false;

            }

        });

    }

});

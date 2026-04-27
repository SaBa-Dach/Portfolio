/* ============================================================
   SCRIPT.JS — Roblox Scripter Portfolio
   What this file does:
     1. Smooth scroll for nav links
     2. Scroll-triggered fade-in animations (IntersectionObserver)
     3. Skill bar fill animation (triggers when skills section is visible)
     4. Navbar shrink effect on scroll
============================================================ */


/* ============================================================
   1. SMOOTH SCROLL FOR NAV LINKS
   Even though CSS has scroll-behavior: smooth, this gives us
   better control and works across more browsers.
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault(); // Stop the default jump-to-anchor

    const targetId = this.getAttribute('href');    // e.g. "#projects"
    const targetEl = document.querySelector(targetId);

    if (targetEl) {
      // Offset for the fixed navbar (80px tall)
      const navHeight = document.querySelector('.navbar').offsetHeight;
      const targetTop  = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    }
  });
});


/* ============================================================
   2. SCROLL-TRIGGERED FADE-IN ANIMATIONS
   IntersectionObserver watches every .fade-in element.
   When one enters the viewport, we add the .visible class
   which triggers the CSS transition (opacity + translateY).
============================================================ */
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Element is in view — make it visible
        entry.target.classList.add('visible');

        // Stop watching it once it's animated in (no need to re-animate)
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,    // Trigger when 15% of the element is visible
    rootMargin: '0px 0px -40px 0px' // Slightly before the bottom of viewport
  }
);

// Attach the observer to every .fade-in element on the page
fadeElements.forEach(el => fadeObserver.observe(el));


/* ============================================================
   3. SKILL BAR FILL ANIMATION
   The .skill-fill bars start at width: 0 in CSS.
   We use a separate IntersectionObserver to watch the skills
   section, and when it's visible we set the width to the
   value declared in the inline style attribute.
============================================================ */
const skillSection = document.querySelector('#skills');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find all skill fill bars and animate them
        document.querySelectorAll('.skill-fill').forEach(bar => {
          // The target width is stored in the element's style attribute
          // e.g. style="width: 80%" — we read it and apply it
          const targetWidth = bar.style.width;

          // Temporarily remove so we can re-apply and trigger transition
          bar.style.width = '0';

          // Small delay so the transition runs after the reset
          setTimeout(() => {
            bar.style.width = targetWidth;
          }, 100);
        });

        // Only animate once
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

if (skillSection) {
  skillObserver.observe(skillSection);
}


/* ============================================================
   4. NAVBAR SHRINK ON SCROLL
   When the user scrolls down more than 60px, we add a class
   to the navbar that tightens the padding (defined in CSS).
============================================================ */
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.style.padding = '12px 40px';   // Shrink vertically
  } else {
    navbar.style.padding = '';            // Reset to CSS default
  }
});


/* ============================================================
   5. HERO SECTION — INITIAL LOAD ANIMATION
   The hero content has .fade-in but the IntersectionObserver
   might not trigger it since it's already in view on load.
   We manually add .visible after a short delay.
============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    setTimeout(() => {
      heroContent.classList.add('visible');
    }, 200); // 200ms delay for a nice entrance feel
  }
});
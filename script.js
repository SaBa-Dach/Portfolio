(function() {
  'use strict';

  const phrases = ['Roblox Scripter', 'Systems Engineer'];
  let pIdx = 0, cIdx = 0, deleting = false;
  const typewriterEl = document.getElementById('typewriter');

  function typeWriter() {
    if (!typewriterEl) return;
    const currentPhrase = phrases[pIdx];
    typewriterEl.textContent = deleting ? currentPhrase.substring(0, cIdx - 1) : currentPhrase.substring(0, cIdx + 1);

    if (!deleting && cIdx < currentPhrase.length) {
      cIdx++;
      setTimeout(typeWriter, 110);
    } else if (deleting && cIdx > 0) {
      cIdx--;
      setTimeout(typeWriter, 60);
    } else if (!deleting && cIdx === currentPhrase.length) {
      setTimeout(() => { deleting = true; typeWriter(); }, 2200);
    } else {
      deleting = false;
      pIdx = (pIdx + 1) % phrases.length;
      setTimeout(typeWriter, 400);
    }
  }
  setTimeout(typeWriter, 800);

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
        }
      }
    });
  });

  const fadeElements = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  fadeElements.forEach(el => fadeObserver.observe(el));

  const skillSection = document.querySelector('#skills');
  if (skillSection) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.skill-fill').forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => { bar.style.width = targetWidth; }, 100);
          });
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    skillObserver.observe(skillSection);
  }

  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 60) {
        navbar.style.padding = '12px 40px';
      } else {
        navbar.style.padding = '';
      }
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      setTimeout(() => { heroContent.classList.add('visible'); }, 200);
    }

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const video = card.querySelector('video');
      if (video) {
        card.addEventListener('mouseenter', () => {
          video.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
        });
      }
    });

    const projectTitle = document.getElementById('projectTitle');
    const projectVideo = document.getElementById('projectVideo');
    const projectDesc = document.getElementById('projectDesc');
    const projectMeta = document.getElementById('projectMeta');

    if (projectTitle && projectVideo) {
      const params = new URLSearchParams(window.location.search);
      const projId = params.get('id') || 'coin';

      const projects = {
        slapping: {
          title: 'Slapping / Ragdoll System',
          video: 'videos/slapping.mp4',
          desc: 'Advanced physics-based ragdoll using BallSocketConstraints for realistic limb movement. Features server-authoritative hit detection, dynamic knockback scaling, reach validation, and multi-target detection. Includes network ownership handling and a synced get-up mechanic.',
          tags: ['Combat', 'Physics', 'Server-Auth']
        },
        coin: {
          title: 'Coin Throwing System',
          video: 'videos/CoinTrow.mp4',
          desc: 'Full game system — players buy throwable coins with Robux, throw them at others to deal damage, and earn daily rewards based on spending. Includes config module, server logic, shop UI, physics projectiles, effects handler, and remote architecture.',
          tags: ['Full Game', 'Roblox Lua', 'Server-Auth']
        },
        tipping: {
          title: 'Tipping / Donation System',
          video: 'videos/tipping.mp4',
          desc: 'Gamepass ID input, automatic price fetching from Roblox\'s API, and a full in-game purchase flow — built clean and reusable.',
          tags: ['Economy', 'Gamepass', 'API']
        },
        daily: {
          title: 'Daily Rewards System',
          video: 'videos/daily-rewards.mp4',
          desc: 'Streak tracking with persistent DataStore saving and a polished UI that shows current streak, next reward, and claim buttons.',
          tags: ['Progression', 'DataStore', 'UI']
        },
        sprint: {
          title: 'Sprint / Dash System',
          video: 'videos/sprint.mp4',
          desc: 'Smooth sprint and dash mechanics with configurable cooldowns, stamina bars, and responsive movement feel.',
          tags: ['Movement', 'Physics', 'UX']
        },
        staff: {
          title: 'Staff / Player Display System',
          video: 'videos/staff-display.mp4',
          desc: 'Live panel showing player avatars and group rank detection — great for admin dashboards or server-info boards.',
          tags: ['Systems', 'UI', 'Admin']
        },
        combat: {
          title: 'Combat System',
          video: 'videos/combat.mp4',
          desc: 'M1 combo chains, server-side hit detection, and damage handling — built with latency in mind for a fair experience.',
          tags: ['Gameplay', 'Hit Detection', 'Latency']
        },
        ui: {
          title: 'UI Systems',
          video: 'videos/ui-systems.mp4',
          desc: 'Reusable button components, animated navigation menus, and clean input handling — all written for easy plug-and-play use.',
          tags: ['Systems', 'UI', 'Components']
        }
      };

      const project = projects[projId] || projects.slapping;
      
      projectVideo.src = project.video;
      projectVideo.load();
      
      projectTitle.textContent = project.title;
      projectDesc.textContent = project.desc;

      if (projectMeta) {
        projectMeta.innerHTML = '';
        project.tags.forEach(tag => {
          const chip = document.createElement('span');
          chip.className = 'chip';
          chip.textContent = tag;
          projectMeta.appendChild(chip);
        });
      }
    }
  });

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
})();
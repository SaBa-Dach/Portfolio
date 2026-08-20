(function () {
  'use strict';

  /* =====================================================
     TYPEWRITER — fixed: height locked so layout never shifts
     ===================================================== */
  const phrases = ['Roblox Scripter', 'Luau Developer', 'Systems Engineer'];
  let pIdx = 0, cIdx = 0, deleting = false;
  const typewriterEl = document.getElementById('typewriter');
  const typewriterWrap = document.getElementById('typewriterWrap');

  function typeWriter() {
    if (!typewriterEl) return;
    const current = phrases[pIdx];
    if (deleting) {
      cIdx--;
    } else {
      cIdx++;
    }
    typewriterEl.textContent = current.substring(0, cIdx);

    if (!deleting && cIdx < current.length) {
      setTimeout(typeWriter, 100);
    } else if (deleting && cIdx > 0) {
      setTimeout(typeWriter, 55);
    } else if (!deleting && cIdx === current.length) {
      setTimeout(() => { deleting = true; typeWriter(); }, 2400);
    } else {
      deleting = false;
      pIdx = (pIdx + 1) % phrases.length;
      setTimeout(typeWriter, 450);
    }
  }
  setTimeout(typeWriter, 900);

  /* =====================================================
     NAVBAR SCROLL STATE
     ===================================================== */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  /* =====================================================
     SMOOTH SCROLL (hash links)
     ===================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      const offset = (navbar?.offsetHeight ?? 68) + 8;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      document.getElementById('navLinks')?.classList.remove('open');
      document.getElementById('menuToggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  /* =====================================================
     FADE-IN (IntersectionObserver)
     ===================================================== */
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
  window.portfolioFadeObserver = fadeObserver;
  document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

  /* =====================================================
     SKILL BARS
     ===================================================== */
  const skillSection = document.querySelector('#skills');
  if (skillSection) {
    const skillObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.skill-fill').forEach(bar => {
            const w = bar.style.width;
            bar.style.width = '0';
            requestAnimationFrame(() => { setTimeout(() => { bar.style.width = w; }, 80); });
          });
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    skillObserver.observe(skillSection);
  }

  /* =====================================================
     MOBILE MENU
     ===================================================== */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks   = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    const setMenuOpen = open => {
      navLinks.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
    };
    menuToggle.addEventListener('click', () => setMenuOpen(!navLinks.classList.contains('open')));
    navLinks.addEventListener('click', e => {
      if (e.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('click', e => {
      if (!navbar?.contains(e.target)) setMenuOpen(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setMenuOpen(false);
    });
  }

  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });

  /* =====================================================
     AUTOMATIC PROJECT COUNT
     The displayed total combines showcased project cards with
     previously shipped projects that are not listed on the site.
     ===================================================== */
  const projectGrid = document.querySelector('.projects-grid');
  const projectCountEls = document.querySelectorAll('[data-project-count]');

  function updateProjectCount() {
    if (!projectGrid || !projectCountEls.length) return;
    const showcasedCount = projectGrid.querySelectorAll(':scope > .card').length;
    const unlistedCount = Number.parseInt(projectGrid.dataset.unlistedProjects || '0', 10);
    const shippedCount = showcasedCount + (Number.isNaN(unlistedCount) ? 0 : unlistedCount);
    projectCountEls.forEach(el => { el.textContent = String(shippedCount); });
  }

  updateProjectCount();

  /* =====================================================
     HERO ENTRY
     ===================================================== */
  const heroContent = document.getElementById('heroContent');
  if (heroContent) {
    setTimeout(() => heroContent.classList.add('visible'), 220);
  }

  /* =====================================================
     PROJECT DETAIL PAGE
     ===================================================== */
  const projectData = {
    holegame: {
      title: 'Hole Game',
      category: 'Full Game / Combat Arena',
      video: 'videos/hole-game.mp4',
      poster: 'images/hole-game-poster.webp',
      tags: ['Roblox', 'Luau', 'Server-Auth', 'R6 Combat', 'DataStore'],
      desc: `A fast-paced multiplayer elimination game built around a mysterious central void. Players punch, push, and dash opponents into the hole while balancing an escalating Corruption meter.

<h3>Combat and locomotion</h3>
- Left punch, right punch, heavy push, directional dash, and sprint
- State-driven combat covering attacks, lockouts, stuns, corruption, falling, and death
- Server-authoritative validation with a six-second last-hit window for accurate elimination credit

<h3>Corruption and arena mechanics</h3>
- Distance-based corruption builds as players risk fighting near the void
- Survival points reward players who remain close to danger
- Maximum corruption locks input and forces the player toward the hole
- Successful melee hits reset the attacker's corruption to zero

<h3>Camera and controls</h3>
- First-person R6 arms remain visible across movement and combat animations
- Instant custom shift lock with stable character orientation
- Camera and input state automatically synchronize during corruption and death

<h3>Rounds and persistence</h3>
- Fifteen-minute round lifecycle with voting, loading, intermission, active play, and cleanup
- Physical lobby map voting with live counters and geometry validation
- Kill and survival scoring, winner qualification, global stats, and DataStore persistence

Built in strict Luau with a modular Service / Controller architecture, reusable instances, and optimized client-server replication.`,
    },

    trivia: {
      title: 'Multiplayer Trivia System',
      category: 'Full Game',
      videos: [
        'videos/TriviaGame1.mp4',
        'videos/TriviaGame2.mp4',
        'videos/TriviaGame3.mp4',
        'videos/TriviaGame4.mp4',
      ],
      posters: [
        'images/trivia-1.webp',
        'images/trivia-2.webp',
        'images/trivia-3.webp',
        'images/trivia-4.webp',
      ],
      tags: ['Full Game', 'Multiplayer', 'ProfileService', 'DataStore', 'Luau'],
      desc: `A multiplayer Roblox trivia game built around quick decision-making, progression, and replayability.

Players join tables and compete in a series of "Higher or Lower?" style questions across multiple categories — gaming, sports, music, social media, geography, and more. Wrong answers cost lives; correct answers reward coins, XP, and streak bonuses.

<h3>Systems built</h3>
• Multiplayer table matchmaking
• Round management and question framework
• Server-authoritative answer validation
• Lives and elimination system
• Coin and XP rewards with streak bonuses
• Daily rewards
• Global leaderboards
• Data saving and player progression
• Cosmetic rewards integration
• 1v1 duel support
• Modular, scalable architecture

<h3>Technical highlights</h3>
• Server-authoritative gameplay logic
• Multi-table support — multiple matches running simultaneously
• Secure RemoteEvent communication
• Persistent player statistics via ProfileService
• Optimised client-server data flow`,
    },

    hideandseek: {
      title: 'Hide & Seek Framework',
      category: 'Full Game',
      videos: [
        'videos/Vid Project 1.mp4',
        'videos/Vid Project 2.mp4',
      ],
      posters: [
        'images/hide-and-seek-1.webp',
        'images/hide-and-seek-2.webp',
      ],
      tags: ['Full Game', 'Modular', 'Server-Auth', 'Luau', 'Raycasting'],
      desc: `A modular, production-ready Roblox hide-and-seek framework built with clean service-based architecture, server-authoritative networking, and expandable systems.

<h3>Systems built</h3>
• Admin permission system and panel
• Role management (Ghost, Hider, Seeker)
• Spectator / Ghost mode with fly system
• Teleport system
• Round management and countdown
• Configurable hide timer
• Seeker panel with Laser Eyes ability (raycasting + Beam effects)
• Secure RemoteEvents
• Win detection and UI system
• Modular, service-based architecture`,
    },

    slapping: {
      title: 'Slapping / Ragdoll System',
      category: 'Combat / Physics',
      video: 'videos/slapping.mp4',
      poster: 'images/slapping.webp',
      tags: ['Combat', 'Physics', 'Server-Auth', 'BallSocketConstraints', 'Luau'],
      desc: `Advanced physics-based ragdoll using BallSocketConstraints for realistic limb simulation.

<h3>Features</h3>
• Server-authoritative hit detection
• Dynamic knockback scaling based on force
• Reach validation to prevent exploit abuse
• Multi-target detection
• Network ownership handling for smooth physics
• Synced get-up mechanic across all clients`,
    },

    coin: {
      title: 'Coin Throwing System',
      category: 'Full Game',
      video: 'videos/CoinTrow.mp4',
      poster: 'images/coin-throwing.webp',
      tags: ['Full Game', 'Economy', 'Robux', 'Physics', 'Server-Auth'],
      desc: `A full game system where players purchase throwable coins with Robux, throw them at others to deal damage, and earn daily rewards based on spending activity.

<h3>Features</h3>
• Config module for easy customisation
• Server-authoritative game logic
• Shop UI for coin purchases
• Physics-based projectile system
• Visual effects handler
• Clean remote architecture`,
    },

    tipping: {
      title: 'Tipping / Donation System',
      category: 'Economy',
      video: 'videos/tipping.mp4',
      poster: 'images/tipping.webp',
      tags: ['Economy', 'Gamepass', 'Roblox API', 'UI'],
      desc: `A clean, reusable donation system for Roblox experiences.

<h3>Features</h3>
• Gamepass ID input
• Automatic price fetching from the Roblox API
• Full in-game purchase flow
• Clean UI with purchase confirmation
• Modular and easy to drop into any game`,
    },

    daily: {
      title: 'Daily Rewards System',
      category: 'Progression',
      video: 'videos/daily-rewards.mp4',
      poster: 'images/daily-rewards.webp',
      tags: ['Progression', 'DataStore', 'UI', 'Luau'],
      desc: `A streak-based daily reward system with persistent storage and a polished UI.

<h3>Features</h3>
• Streak tracking with DataStore persistence
• Polished UI showing current streak, next reward, and claim state
• Configurable reward tiers
• Anti-exploit server validation`,
    },

    combat: {
      title: 'Combat System',
      category: 'Gameplay',
      video: 'videos/combat.mp4',
      poster: 'images/combat.webp',
      tags: ['Gameplay', 'Hit Detection', 'Latency', 'Server-Auth'],
      desc: `A server-side combat system built for fairness in multiplayer environments.

<h3>Features</h3>
• M1 combo chain system
• Server-side hit detection with latency compensation
• Damage handling and health management
• Combo window timing
• Clean animation integration`,
    },

    sprint: {
      title: 'Sprint / Dash System',
      category: 'Movement',
      video: 'videos/sprint.mp4',
      poster: 'images/sprint.webp',
      tags: ['Movement', 'Physics', 'UX', 'Stamina'],
      desc: `Responsive sprint and dash mechanics with configurable feel.

<h3>Features</h3>
• Smooth sprint with configurable speed multiplier
• Dash with directional input support
• Stamina bar with regeneration
• Configurable cooldowns
• Polished movement feel with proper animation blending`,
    },

    staff: {
      title: 'Staff / Player Display',
      category: 'Systems',
      video: 'videos/staff-display.mp4',
      poster: 'images/staff-display.webp',
      tags: ['Systems', 'UI', 'Admin', 'Group Ranks'],
      desc: `A live server panel displaying player avatars and group rank information.

<h3>Features</h3>
• Real-time player avatar display
• Group rank detection and labelling
• Clean, configurable UI layout
• Ideal for admin dashboards or server-info boards`,
    },

    ui: {
      title: 'UI Systems',
      category: 'Systems',
      video: 'videos/ui-systems.mp4',
      poster: 'images/ui-systems.webp',
      tags: ['Systems', 'UI', 'Components', 'Animations'],
      desc: `A collection of reusable, plug-and-play UI components for Roblox.

<h3>Features</h3>
• Reusable button components
• Animated navigation menus
• Clean input handling
• Tween-based animations
• Modular structure for easy re-use across projects`,
    },
  };

  /* --- Render project detail page --- */
  const projectTitleEl = document.getElementById('projectTitle');
  const projectVideoEl = document.getElementById('projectVideo');

  if (projectTitleEl && projectVideoEl) {
    const params  = new URLSearchParams(window.location.search);
    const id      = params.get('id');
    const project = id ? projectData[id] : null;

    if (!project) {
      window.location.replace('index.html#projects');
      return;
    }

    document.title = `${project.title} — inbo`;

    const eyebrowEl = document.getElementById('projectEyebrow');
    if (eyebrowEl) eyebrowEl.textContent = `// ${project.category.toLowerCase()}`;

    projectTitleEl.textContent = project.title;

    const metaEl = document.getElementById('projectMeta');
    if (metaEl) {
      project.tags.forEach(tag => {
        const el = document.createElement('span');
        el.className = 'chip';
        el.textContent = tag;
        metaEl.appendChild(el);
      });
    }

    const sidebarTagsEl = document.getElementById('sidebarTags');
    if (sidebarTagsEl) {
      project.tags.forEach(tag => {
        const el = document.createElement('span');
        el.className = 'chip';
        el.textContent = tag;
        sidebarTagsEl.appendChild(el);
      });
    }

    const videoList = project.videos || [project.video];
    const posterList = project.posters || [project.poster];
    let currentIdx  = 0;

    if (posterList[0]) projectVideoEl.poster = posterList[0];
    projectVideoEl.src = videoList[0];
    projectVideoEl.load();
    projectVideoEl.onended = () => {
      if (currentIdx < videoList.length - 1) {
        currentIdx++;
        switchVideo(currentIdx);
      }
    };

    const galleryEl = document.getElementById('videoGallery');
    if (galleryEl && videoList.length > 1) {
      videoList.forEach((_, i) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'video-thumb' + (i === 0 ? ' active' : '');
        thumb.setAttribute('aria-label', `Play video part ${i + 1}`);
        thumb.setAttribute('aria-pressed', String(i === 0));
        thumb.innerHTML = `<img src="${posterList[i]}" alt="" loading="lazy" decoding="async"><span>Part ${i + 1}</span>`;
        thumb.addEventListener('click', () => switchVideo(i));
        galleryEl.appendChild(thumb);
      });
    }

    function switchVideo(idx) {
      currentIdx = idx;
      if (posterList[idx]) projectVideoEl.poster = posterList[idx];
      projectVideoEl.src = videoList[idx];
      projectVideoEl.load();
      projectVideoEl.play().catch(() => {});
      document.querySelectorAll('.video-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
        t.setAttribute('aria-pressed', String(i === idx));
      });
    }

    const descEl = document.getElementById('projectDesc');
    if (descEl) {
      descEl.innerHTML = (project.desc || '')
        .replace(/\n/g, '<br>')
        .replace(/<h3>/g, '</p><h3>')
        .replace(/<\/h3>/g, '</h3><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    }
  }

})();

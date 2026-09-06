(function () {
  'use strict';

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
     The displayed total follows the project cards on the page, so
     adding another documented project updates the count automatically.
     ===================================================== */
  const projectGrid = document.querySelector('.projects-grid');
  const projectCountEls = document.querySelectorAll('[data-project-count]');

  function updateProjectCount() {
    if (!projectGrid || !projectCountEls.length) return;
    const showcasedCount = projectGrid.querySelectorAll(':scope > .card').length;
    projectCountEls.forEach(el => { el.textContent = String(showcasedCount); });
  }

  updateProjectCount();

  const projectFilters = [...document.querySelectorAll('[data-project-filter]')];
  const projectCards = projectGrid ? [...projectGrid.querySelectorAll(':scope > .card')] : [];

  function showProjectCategory(category) {
    projectCards.forEach(card => {
      card.hidden = card.dataset.projectCategory !== category;
    });

    projectFilters.forEach(button => {
      const selected = button.dataset.projectFilter === category;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  projectFilters.forEach(button => {
    button.addEventListener('click', () => showProjectCategory(button.dataset.projectFilter));
  });

  /* =====================================================
     PROJECT DETAIL PAGE
     ===================================================== */
  const projectSlugs = {
    holegame: 'hole-game.html',
    communitybot: '4r-community-bot.html',
    trivia: 'multiplayer-trivia.html',
    hideandseek: 'hide-and-seek.html',
    slapping: 'slapping-ragdoll.html',
    coin: 'coin-throwing.html',
    tipping: 'tipping-donation.html',
    daily: 'daily-rewards.html',
    combat: 'combat-system.html',
    sprint: 'sprint-dash.html',
    staff: 'staff-player-display.html',
    ui: 'ui-systems.html',
  };

  const projectData = {
    holegame: {
      title: 'Hole Game',
      category: 'Full Game / Combat Arena',
      video: 'videos/hole-game.mp4',
      poster: 'images/hole-game-poster.webp',
      tags: ['Roblox', 'Luau', 'Server Auth', 'R6 Combat', 'DataStore'],
      desc: `A fast paced multiplayer elimination game built around a mysterious central void. Players punch, push, and dash opponents into the hole while balancing an escalating Corruption meter.

<h3>Combat and locomotion</h3>
- Left punch, right punch, heavy push, directional dash, and sprint
- State based combat covering attacks, lockouts, stuns, corruption, falling, and death
- Server validation with a six second last hit window for accurate elimination credit

<h3>Corruption and arena mechanics</h3>
- Corruption builds based on distance as players risk fighting near the void
- Survival points reward players who remain close to danger
- Maximum corruption locks input and forces the player toward the hole
- Successful melee hits reset the attacker's corruption to zero

<h3>Camera and controls</h3>
- First person R6 arms remain visible across movement and combat animations
- Instant custom shift lock with stable character orientation
- Camera and input state automatically synchronize during corruption and death

<h3>Rounds and persistence</h3>
- Fifteen minute round lifecycle with voting, loading, intermission, active play, and cleanup
- Physical lobby map voting with live counters and geometry validation
- Kill and survival scoring, winner qualification, global stats, and DataStore persistence

Built in strict Luau with a modular Service / Controller architecture, reusable instances, and optimized replication between the client and server.`,
    },

    communitybot: {
      title: '4R Studios Community Bot',
      category: 'Client Project / Discord Bot',
      poster: 'images/4r-community-bot.webp',
      externalUrl: 'https://discord.gg/C6v6snyfM5',
      externalLabel: 'Visit the 4R Studios server',
      tags: ['TypeScript', 'discord.js', 'Roblox OAuth', 'Prisma', 'Docker'],
      desc: `A production Discord community bot developed and deployed for 4R Studios. The system connects a Roblox community's verification, support, moderation, engagement, and operational tooling in one configurable application. The client has approved linking the live community server from this portfolio.

<h3>Roblox verification</h3>
• Native Roblox OAuth 2.0 authorization with PKCE
• Profile code verification available as a fallback
• Duplicate account protection and account unlinking
• Automatic Discord role and nickname synchronization

<h3>Community operations</h3>
• Category based private support tickets with staff claiming and transcripts
• Persistent warnings, timeouts, bans, message purging, and moderation logs
• Persistent giveaways with role requirements, multiple winners, and rerolls
• Welcome messages, self role panels, announcements, and detailed audit logging

<h3>Security and deployment</h3>
• Short lived authorization sessions with state, nonce, and PKCE validation
• OAuth tokens discarded after verification and secrets stored outside the codebase
• Permission checks, protected mentions, rate limits, and role hierarchy validation
• Continuous hosting with Docker, Caddy HTTPS, health monitoring, and database backups

I designed, developed, tested, and deployed the complete bot, including its command architecture, OAuth pages, database structure, moderation tools, ticket workflow, security controls, and production infrastructure.`,
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
      desc: `A multiplayer Roblox trivia game built around quick decisions, progression, and replayability.

Players join tables and compete in a series of "Higher or Lower?" style questions across multiple categories, including gaming, sports, music, social media, geography, and more. Wrong answers cost lives. Correct answers reward coins, XP, and streak bonuses.

<h3>Systems built</h3>
• Multiplayer table matchmaking
• Round management and question framework
• Server controlled answer validation
• Lives and elimination system
• Coin and XP rewards with streak bonuses
• Daily rewards
• Global leaderboards
• Data saving and player progression
• Cosmetic rewards integration
• 1v1 duel support
• Modular, scalable architecture

<h3>Technical highlights</h3>
• Server controlled gameplay logic
• Support for multiple tables and simultaneous matches
• Secure RemoteEvent communication
• Persistent player statistics via ProfileService
• Optimised data flow between the client and server`,
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
      tags: ['Full Game', 'Modular', 'Server Auth', 'Luau', 'Raycasting'],
      desc: `A modular Roblox hide and seek framework with round state controlled by services, server controlled networking, and systems that can be extended independently.

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
• Modular architecture built with services`,
    },

    slapping: {
      title: 'Slapping / Ragdoll System',
      category: 'Combat / Physics',
      video: 'videos/slapping.mp4',
      poster: 'images/slapping.webp',
      tags: ['Combat', 'Physics', 'Server Auth', 'BallSocketConstraints', 'Luau'],
      desc: `Advanced physics based ragdoll using BallSocketConstraints for realistic limb simulation.

<h3>Features</h3>
• Server controlled hit detection
• Dynamic knockback scaling based on force
• Reach validation to prevent exploit abuse
• Detection for multiple targets
• Network ownership handling for smooth physics
• Synced recovery across all clients`,
    },

    coin: {
      title: 'Coin Throwing System',
      category: 'Full Game',
      video: 'videos/CoinTrow.mp4',
      poster: 'images/coin-throwing.webp',
      tags: ['Full Game', 'Economy', 'Robux', 'Physics', 'Server Auth'],
      desc: `A full game system where players purchase throwable coins with Robux, throw them at others to deal damage, and earn daily rewards based on spending activity.

<h3>Features</h3>
• Config module for easy customisation
• Server controlled game logic
• Shop UI for coin purchases
• Projectile system driven by physics
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
• Full purchase flow inside the game
• Clean UI with purchase confirmation
• Modular and easy to drop into any game`,
    },

    daily: {
      title: 'Daily Rewards System',
      category: 'Progression',
      video: 'videos/daily-rewards.mp4',
      poster: 'images/daily-rewards.webp',
      tags: ['Progression', 'DataStore', 'UI', 'Luau'],
      desc: `A daily reward system with persistent streak storage and a polished UI.

<h3>Features</h3>
• Streak tracking with DataStore persistence
• Polished UI showing current streak, next reward, and claim state
• Configurable reward tiers
• Server validation against exploits`,
    },

    combat: {
      title: 'Combat System',
      category: 'Gameplay',
      video: 'videos/combat.mp4',
      poster: 'images/combat.webp',
      tags: ['Gameplay', 'Hit Detection', 'Latency', 'Server Auth'],
      desc: `A combat system controlled by the server and built for fairness in multiplayer environments.

<h3>Features</h3>
• M1 combo chain system
• Server side hit detection with latency compensation
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
• Live player avatar display
• Group rank detection and labelling
• Clean, configurable UI layout
• Ideal for admin dashboards or server information boards`,
    },

    ui: {
      title: 'UI Systems',
      category: 'Systems',
      video: 'videos/ui-systems.mp4',
      poster: 'images/ui-systems.webp',
      tags: ['Systems', 'UI', 'Components', 'Animations'],
      desc: `A collection of reusable UI components that are ready to integrate into Roblox projects.

<h3>Features</h3>
• Reusable button components
• Animated navigation menus
• Clean input handling
• Animations driven by TweenService
• Modular structure for easy reuse across projects`,
    },
  };

  /* --- Render project detail page --- */
  const projectTitleEl = document.getElementById('projectTitle');
  const projectVideoEl = document.getElementById('projectVideo');

  if (projectTitleEl && projectVideoEl) {
    const params  = new URLSearchParams(window.location.search);
    const pageId  = document.body.dataset.projectId;
    const id      = pageId || params.get('id');
    const project = id ? projectData[id] : null;

    if (!pageId && id && projectSlugs[id]) {
      window.location.replace(projectSlugs[id]);
      return;
    }

    if (!project) {
      window.location.replace('index.html#projects');
      return;
    }

    document.title = `${project.title} | Portfolio`;

    const projectUrl = `https://inbodev.com/${projectSlugs[id]}`;
    const plainDescription = project.desc
      .replace(/<[^>]*>/g, ' ')
      .replace(/[•\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 155);
    const projectDescription = `${project.title}: ${plainDescription}`;
    const projectImage = new URL(project.poster || project.posters?.[0] || 'ib_logo.png', window.location.origin).href;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = projectUrl;

    const setMetaContent = (selector, content) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute('content', content);
    };
    setMetaContent('#projectMetaDescription', projectDescription);
    setMetaContent('#projectOgTitle', `${project.title} | Portfolio`);
    setMetaContent('#projectOgDescription', projectDescription);
    setMetaContent('#projectOgImage', projectImage);
    setMetaContent('#projectOgUrl', projectUrl);

    const eyebrowEl = document.getElementById('projectEyebrow');
    if (eyebrowEl) eyebrowEl.textContent = `// ${project.category.toLowerCase()}`;

    projectTitleEl.textContent = project.title;

    const metaEl = document.getElementById('projectMeta');
    if (metaEl) {
      metaEl.replaceChildren();
      project.tags.forEach(tag => {
        const el = document.createElement('span');
        el.className = 'chip';
        el.textContent = tag;
        metaEl.appendChild(el);
      });
    }

    const sidebarTagsEl = document.getElementById('sidebarTags');
    if (sidebarTagsEl) {
      sidebarTagsEl.replaceChildren();
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
    if (galleryEl) galleryEl.replaceChildren();
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
    // Static project pages already contain semantic headings, lists, and paragraphs
    // for readers and crawlers. Only build this block on the legacy template.
    if (descEl && !pageId) {
      descEl.innerHTML = (project.desc || '')
        .replace(/\n/g, '<br>')
        .replace(/<h3>/g, '</p><h3>')
        .replace(/<\/h3>/g, '</h3><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    }
  }

})();

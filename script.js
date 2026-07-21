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
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!navbar?.contains(e.target)) navLinks.classList.remove('open');
    });
  }

  /* =====================================================
     HERO ENTRY
     ===================================================== */
  const heroContent = document.getElementById('heroContent');
  if (heroContent) {
    setTimeout(() => heroContent.classList.add('visible'), 220);
  }

  /* =====================================================
     CARD VIDEO HOVER (index page)
     ===================================================== */
  document.querySelectorAll('.card').forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;
    card.addEventListener('mouseenter', () => video.play().catch(() => {}));
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  });

  /* =====================================================
     PROJECT DETAIL PAGE
     ===================================================== */
  const projectData = {
    trivia: {
      title: 'Multiplayer Trivia System',
      category: 'Full Game',
      videos: [
        'videos/TriviaGame1.mp4',
        'videos/TriviaGame2.mp4',
        'videos/TriviaGame3.mp4',
        'videos/TriviaGame4.mp4',
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
    const id      = params.get('id') || 'trivia';
    const project = projectData[id] || projectData.trivia;

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
    let currentIdx  = 0;

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
      videoList.forEach((src, i) => {
        const thumb = document.createElement('div');
        thumb.className = 'video-thumb' + (i === 0 ? ' active' : '');
        thumb.innerHTML = `<video src="${src}" muted preload="metadata"></video><span>Part ${i + 1}</span>`;
        thumb.addEventListener('click', () => switchVideo(i));
        galleryEl.appendChild(thumb);
      });
    }

    function switchVideo(idx) {
      currentIdx = idx;
      projectVideoEl.src = videoList[idx];
      projectVideoEl.load();
      projectVideoEl.play().catch(() => {});
      document.querySelectorAll('.video-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
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

  /* =====================================================
     REVIEWS — Supabase live system
     ===================================================== */

  // ⚠️  Replace these two values with your own from Supabase → Project Settings → API
  const SUPABASE_URL    = 'https://elagiztpcujnyfpnhjwn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYWdpenRwY3VqbnlmcG5oanduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2Mzk3OTQsImV4cCI6MjEwMDIxNTc5NH0.X7uM5FphrMFmeWOEFw7RZSWaxMfPYvHDwYMyDIJaaYQ';

  const reviewsGrid  = document.getElementById('reviewsGrid');
  const starPicker   = document.getElementById('starPicker');
  const reviewSubmit = document.getElementById('reviewSubmit');

  if (!reviewsGrid) return; // Not on a page with the review section

  // Init Supabase client (supabase-js v2 UMD exposes window.supabase)
  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* --- Star picker --- */
  let selectedRating = 0;

  if (starPicker) {
    const stars = starPicker.querySelectorAll('.star');

    function paintStars(n) {
      stars.forEach(s => s.classList.toggle('lit', +s.dataset.val <= n));
    }

    stars.forEach(s => {
      s.addEventListener('mouseenter', () => paintStars(+s.dataset.val));
      s.addEventListener('mouseleave', () => paintStars(selectedRating));
      s.addEventListener('click', () => {
        selectedRating = +s.dataset.val;
        paintStars(selectedRating);
      });
    });
  }

  /* --- Char counter --- */
  const reviewTextEl  = document.getElementById('reviewText');
  const charCountEl   = document.getElementById('reviewCharCount');
  if (reviewTextEl && charCountEl) {
    reviewTextEl.addEventListener('input', () => {
      charCountEl.textContent = `${reviewTextEl.value.length} / 600`;
    });
  }

  /* --- Render a single review card --- */
  function renderCard(r, prepend = false) {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const card  = document.createElement('div');
    card.className = 'testimonial-card' + (prepend ? ' review-new' : '');
    card.innerHTML = `
      <div class="testimonial-stars">${stars}</div>
      <p class="testimonial-text">"${escHtml(r.review)}"</p>
      <div class="testimonial-author">
        <span class="testimonial-name">— ${escHtml(r.username)}</span>
        <span class="testimonial-detail">${escHtml(r.project_type)}</span>
      </div>`;
    if (prepend) {
      reviewsGrid.prepend(card);
    } else {
      reviewsGrid.appendChild(card);
    }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* --- Load existing reviews --- */
  async function loadReviews() {
    reviewsGrid.innerHTML = '<div class="review-loading">Loading reviews…</div>';

    const { data, error } = await db
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    reviewsGrid.innerHTML = '';

    if (error || !data || data.length === 0) {
      reviewsGrid.innerHTML = '<div class="review-empty">No reviews yet — be the first!</div>';
      return;
    }

    data.forEach(r => renderCard(r));

    // Re-observe new cards for fade-in
    reviewsGrid.querySelectorAll('.testimonial-card').forEach(el => {
      el.classList.add('fade-in');
      fadeObserver.observe(el);
    });
  }

  loadReviews();

  /* --- Submit a review --- */
  if (reviewSubmit) {
    reviewSubmit.addEventListener('click', async () => {
      const errorEl   = document.getElementById('reviewError');
      const successEl = document.getElementById('reviewSuccess');
      errorEl.style.display   = 'none';
      successEl.style.display = 'none';

      const username    = document.getElementById('reviewUsername')?.value.trim();
      const projectType = document.getElementById('reviewProject')?.value.trim();
      const reviewText  = reviewTextEl?.value.trim();

      // Validation
      if (!username || username.length < 2)
        return showError(errorEl, 'Please enter your username.');
      if (!projectType || projectType.length < 2)
        return showError(errorEl, 'Please enter the project type.');
      if (selectedRating === 0)
        return showError(errorEl, 'Please select a star rating.');
      if (!reviewText || reviewText.length < 20)
        return showError(errorEl, 'Review must be at least 20 characters.');

      reviewSubmit.disabled = true;
      reviewSubmit.textContent = 'Submitting…';

      const { data, error } = await db.from('reviews').insert([{
        username,
        project_type: projectType,
        rating:       selectedRating,
        review:       reviewText,
      }]).select().single();

      reviewSubmit.disabled = false;
      reviewSubmit.textContent = 'Submit review';

      if (error) {
        return showError(errorEl, 'Something went wrong. Please try again.');
      }

      successEl.style.display = 'block';

      // Clear form
      document.getElementById('reviewUsername').value = '';
      document.getElementById('reviewProject').value  = '';
      reviewTextEl.value = '';
      charCountEl.textContent = '0 / 600';
      selectedRating = 0;
      starPicker?.querySelectorAll('.star').forEach(s => s.classList.remove('lit'));

      // Prepend the new card
      const emptyEl = reviewsGrid.querySelector('.review-empty');
      if (emptyEl) emptyEl.remove();
      renderCard(data, true);

      setTimeout(() => { successEl.style.display = 'none'; }, 4000);
    });
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
  }

})();
(function () {
  'use strict';

  const SUPABASE_URL = 'https://elagiztpcujnyfpnhjwn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYWdpenRwY3VqbnlmcG5oanduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2Mzk3OTQsImV4cCI6MjEwMDIxNTc5NH0.X7uM5FphrMFmeWOEFw7RZSWaxMfPYvHDwYMyDIJaaYQ';
  const REVIEW_AVATAR_ENDPOINT = `${SUPABASE_URL}/functions/v1/review-avatar`;
  const reviewsGrid = document.getElementById('reviewsGrid');

  if (!reviewsGrid || !window.supabase) return;

  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const ratingLabels = ['', 'Poor', 'Below Expectations', 'Good', 'Very Good', 'Excellent'];
  const reviewForm = document.getElementById('reviewForm');
  const reviewSubmit = document.getElementById('reviewSubmit');
  const reviewTextEl = document.getElementById('reviewText');
  const charCountEl = document.getElementById('reviewCharCount');
  const ratingPicker = document.getElementById('ratingPicker');
  const ratingSelection = document.getElementById('ratingSelection');
  const errorEl = document.getElementById('reviewError');
  const successEl = document.getElementById('reviewSuccess');
  let selectedRating = 0;
  let currentSession = null;

  function setHidden(element, hidden) {
    if (element) element.hidden = hidden;
  }

  function setMessage(element, message) {
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
  }

  function getDiscordProfile(user) {
    const metadata = user?.user_metadata || {};
    const username = metadata.user_name || metadata.preferred_username || metadata.name || 'Discord user';
    return {
      username,
      displayName: metadata.full_name || metadata.global_name || metadata.name || username,
      avatarUrl: metadata.avatar_url || metadata.picture || ''
    };
  }

  function initialsFor(name) {
    const words = String(name || '?').trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase() || '?';
  }

  function createAvatar(name, avatarUrl, className = '') {
    const wrap = document.createElement('div');
    wrap.className = `review-avatar-wrap ${className}`.trim();
    const fallback = document.createElement('span');
    fallback.className = 'review-avatar-fallback';
    fallback.textContent = initialsFor(name);
    wrap.appendChild(fallback);

    if (avatarUrl) {
      const image = document.createElement('img');
      image.className = 'review-avatar';
      image.src = avatarUrl;
      image.alt = '';
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', () => image.remove(), { once: true });
      wrap.appendChild(image);
    }
    return wrap;
  }

  function setRating(rating, focus = false) {
    selectedRating = rating;
    const options = [...ratingPicker.querySelectorAll('.rating-option')];
    options.forEach(option => {
      const isSelected = Number(option.dataset.rating) === rating;
      option.classList.toggle('selected', isSelected);
      option.setAttribute('aria-checked', String(isSelected));
      option.tabIndex = isSelected || (!rating && Number(option.dataset.rating) === 1) ? 0 : -1;
    });
    ratingSelection.textContent = rating ? `Rating: ${rating} / 5 — ${ratingLabels[rating]}` : 'Select a rating';
    if (focus && rating) options[rating - 1].focus();
  }

  ratingPicker.querySelectorAll('.rating-option').forEach(option => {
    option.addEventListener('click', () => setRating(Number(option.dataset.rating)));
    option.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = selectedRating || 1;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, next - 1);
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(5, next + 1);
      if (event.key === 'Home') next = 1;
      if (event.key === 'End') next = 5;
      setRating(next, true);
    });
  });
  setRating(0);

  reviewTextEl.addEventListener('input', () => {
    charCountEl.textContent = `${reviewTextEl.value.length} / 600`;
  });

  function getAverageLabel(average) {
    if (average >= 4.5) return 'Excellent';
    if (average >= 3.5) return 'Very Good';
    if (average >= 2.5) return 'Good';
    if (average >= 1.5) return 'Below Expectations';
    return 'Poor';
  }

  function updateReviewSummary(reviews) {
    const averageEl = document.getElementById('reviewsAverage');
    const labelEl = document.getElementById('reviewsAverageLabel');
    const countEl = document.getElementById('reviewsCount');
    const barEl = document.getElementById('reviewsAverageBar');
    const count = reviews.length;

    if (!count) {
      averageEl.textContent = '—';
      labelEl.textContent = 'No ratings yet';
      countEl.textContent = '0 approved reviews';
      barEl.style.width = '0%';
      return;
    }

    const average = reviews.reduce((total, item) => total + Number(item.rating), 0) / count;
    averageEl.textContent = average.toFixed(1);
    labelEl.textContent = getAverageLabel(average);
    countEl.textContent = `${count} approved ${count === 1 ? 'review' : 'reviews'}`;
    barEl.style.width = `${average * 20}%`;
  }

  function renderCard(review) {
    const rating = Number(review.rating);
    const card = document.createElement('article');
    card.className = 'testimonial-card fade-in';

    const ratingHeader = document.createElement('div');
    ratingHeader.className = 'testimonial-rating-header';
    const score = document.createElement('strong');
    score.className = 'testimonial-score';
    score.textContent = `${rating} / 5`;
    const label = document.createElement('span');
    label.className = 'testimonial-rating-label';
    label.textContent = ratingLabels[rating] || '';
    ratingHeader.append(score, label);

    const bar = document.createElement('div');
    bar.className = 'rating-bar testimonial-rating-bar';
    bar.setAttribute('aria-label', `${rating} out of 5, ${ratingLabels[rating]}`);
    const fill = document.createElement('span');
    fill.className = 'rating-bar-fill';
    fill.style.width = `${rating * 20}%`;
    bar.appendChild(fill);

    const quote = document.createElement('p');
    quote.className = 'testimonial-text';
    quote.textContent = `“${review.review}”`;

    const author = document.createElement('footer');
    author.className = 'testimonial-author';
    // Supabase returns only a server-generated masked name (for example,
    // "Sa***h"). The full Discord identity never reaches the browser.
    const authorName = review.public_display_name || 'Verified client';
    const avatarUrl = review.discord_verified && review.public_avatar_token
      ? `${REVIEW_AVATAR_ENDPOINT}?token=${encodeURIComponent(review.public_avatar_token)}`
      : '';
    author.appendChild(createAvatar(authorName, avatarUrl));

    const authorCopy = document.createElement('div');
    authorCopy.className = 'testimonial-author-copy';
    const nameRow = document.createElement('div');
    nameRow.className = 'testimonial-name-row';
    const name = document.createElement('span');
    name.className = 'testimonial-name';
    name.textContent = authorName;
    nameRow.appendChild(name);
    if (review.discord_verified) {
      const verified = document.createElement('span');
      verified.className = 'discord-verified';
      verified.textContent = '✓ Discord verified';
      nameRow.appendChild(verified);
    }

    const detail = document.createElement('span');
    detail.className = 'testimonial-detail';
    const date = new Date(review.created_at);
    detail.textContent = Number.isNaN(date.getTime())
      ? review.project_type
      : `${review.project_type} · ${date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
    authorCopy.append(nameRow, detail);
    author.appendChild(authorCopy);
    card.append(ratingHeader, bar, quote, author);
    reviewsGrid.appendChild(card);
    window.portfolioFadeObserver?.observe(card);
  }

  async function loadReviews() {
    reviewsGrid.replaceChildren();
    const loading = document.createElement('div');
    loading.className = 'review-loading';
    loading.textContent = 'Loading approved reviews…';
    reviewsGrid.appendChild(loading);

    const { data, error } = await db
      .from('reviews')
      .select('public_display_name, public_avatar_token, discord_verified, project_type, rating, review, created_at')
      .order('created_at', { ascending: false });

    reviewsGrid.replaceChildren();
    if (error) {
      const message = document.createElement('div');
      message.className = 'review-empty';
      message.textContent = 'Reviews are temporarily unavailable. Please try again later.';
      reviewsGrid.appendChild(message);
      updateReviewSummary([]);
      return;
    }

    updateReviewSummary(data || []);
    if (!data?.length) {
      const empty = document.createElement('div');
      empty.className = 'review-empty';
      empty.textContent = 'No approved reviews yet.';
      reviewsGrid.appendChild(empty);
      return;
    }
    data.forEach(renderCard);
  }

  function renderAccountAvatar(profile) {
    const mount = document.getElementById('reviewAccountAvatar');
    const avatar = createAvatar(profile.displayName, profile.avatarUrl);
    mount.replaceChildren(...avatar.childNodes);
  }

  async function updateReviewerUi(session) {
    currentSession = session;
    const loading = document.getElementById('reviewAuthLoading');
    const loggedOut = document.getElementById('reviewLoggedOut');
    const account = document.getElementById('reviewAccount');
    setHidden(loading, true);
    setHidden(successEl, true);
    setHidden(errorEl, true);

    if (!session?.user) {
      setHidden(loggedOut, false);
      setHidden(account, true);
      setHidden(reviewForm, true);
      return;
    }

    const profile = getDiscordProfile(session.user);
    document.getElementById('reviewAccountName').textContent = profile.displayName;
    renderAccountAvatar(profile);
    setHidden(loggedOut, true);
    setHidden(account, false);
    setHidden(reviewForm, false);
  }

  document.getElementById('discordLogin').addEventListener('click', async () => {
    setHidden(errorEl, true);
    const { error } = await db.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin }
    });
    if (error) setMessage(errorEl, 'Discord sign-in could not be started. Please try again.');
  });

  document.getElementById('discordSignOut').addEventListener('click', async () => {
    const { error } = await db.auth.signOut();
    if (error) setMessage(errorEl, 'Sign out failed. Please try again.');
  });

  reviewForm.addEventListener('submit', async event => {
    event.preventDefault();
    setHidden(errorEl, true);
    setHidden(successEl, true);

    const projectType = document.getElementById('reviewProject').value.trim();
    const reviewText = reviewTextEl.value.trim();
    if (!currentSession?.user) return setMessage(errorEl, 'Please sign in with Discord before submitting.');
    if (projectType.length < 2 || projectType.length > 80) return setMessage(errorEl, 'Project / Commission must be between 2 and 80 characters.');
    if (!Number.isInteger(selectedRating) || selectedRating < 1 || selectedRating > 5) return setMessage(errorEl, 'Please choose a rating from 1 to 5.');
    if (reviewText.length < 20 || reviewText.length > 600) return setMessage(errorEl, 'Review must be between 20 and 600 characters.');

    reviewSubmit.disabled = true;
    reviewSubmit.textContent = 'Submitting…';
    const { error } = await db.from('reviews').insert({
      project_type: projectType,
      rating: selectedRating,
      review: reviewText
    });
    reviewSubmit.disabled = false;
    reviewSubmit.textContent = 'Submit Review';

    if (error) {
      setMessage(errorEl, 'Your review could not be submitted. Please check the form and try again.');
      return;
    }

    reviewForm.reset();
    charCountEl.textContent = '0 / 600';
    setRating(0);
    setHidden(successEl, false);
    document.getElementById('reviewProject').focus();
  });

  loadReviews();

  db.auth.getSession().then(({ data, error }) => {
    if (error) {
      setHidden(document.getElementById('reviewAuthLoading'), true);
      setMessage(errorEl, 'Your sign-in session could not be checked. Please refresh and try again.');
      return;
    }
    updateReviewerUi(data.session);
  });

  db.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => updateReviewerUi(session), 0);
  });
})();

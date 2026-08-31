import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const rootUrl = new URL('../', import.meta.url);
const scriptSource = await readFile(new URL('script.js', rootUrl), 'utf8');
const projectObjectMatch = scriptSource.match(
  /const projectData = (\{[\s\S]*?\n  \});\n\n  \/\* --- Render project detail page --- \*\//
);

if (!projectObjectMatch) {
  throw new Error('Could not locate projectData in script.js');
}

const projects = vm.runInNewContext(`(${projectObjectMatch[1]})`);
const slugs = {
  holegame: 'hole-game.html',
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

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function plainText(markup) {
  return String(markup)
    .replace(/<[^>]*>/g, ' ')
    .replace(/[•\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function metaDescription(project) {
  const full = `${project.title}: ${plainText(project.desc)}`;
  if (full.length <= 155) return full;
  const shortened = full.slice(0, 152);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, Math.max(lastSpace, 120))}…`;
}

function descriptionHtml(description) {
  const lines = String(description).trim().split(/\r?\n/);
  const output = [];
  let paragraph = [];
  let listOpen = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${escapeHtml(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!listOpen) return;
    output.push('</ul>');
    listOpen = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^<h3>(.*?)<\/h3>$/i);
    if (heading) {
      flushParagraph();
      closeList();
      output.push(`<h2>${escapeHtml(heading[1])}</h2>`);
      continue;
    }

    const bullet = line.match(/^(?:•|-)\s*(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!listOpen) {
        output.push('<ul>');
        listOpen = true;
      }
      output.push(`<li>${escapeHtml(bullet[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  return output.join('\n              ');
}

function projectPage(id, project) {
  const slug = slugs[id];
  const canonical = `https://inbodev.com/${slug}`;
  const description = metaDescription(project);
  const videoList = project.videos || [project.video];
  const posterList = project.posters || [project.poster];
  const image = `https://inbodev.com/${posterList[0]}`;
  const tags = project.tags.map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join('\n          ');
  const sidebarTags = project.tags.map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join('\n                ');
  const gallery = videoList.length > 1
    ? videoList.map((_, index) => `
          <button class="video-thumb${index === 0 ? ' active' : ''}" type="button" aria-label="Play video part ${index + 1}" aria-pressed="${index === 0}">
            <img src="${escapeHtml(posterList[index])}" alt="" loading="lazy" decoding="async">
            <span>Part ${index + 1}</span>
          </button>`).join('')
    : '';
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description,
    url: canonical,
    image,
    creator: { '@id': 'https://inbodev.com/#inbo' },
    keywords: project.tags,
    inLanguage: 'en',
  }, null, 2).replaceAll('<', '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.title)} — Portfolio</title>
  <meta name="description" id="projectMetaDescription" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="author" content="inbo">
  <meta name="application-name" content="Portfolio">
  <meta name="theme-color" content="#08090b">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Portfolio">
  <meta property="og:title" id="projectOgTitle" content="${escapeHtml(project.title)} — Portfolio">
  <meta property="og:description" id="projectOgDescription" content="${escapeHtml(description)}">
  <meta property="og:image" id="projectOgImage" content="${image}">
  <meta property="og:image:alt" content="${escapeHtml(project.title)} project preview">
  <meta property="og:url" id="projectOgUrl" content="${canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(project.title)} — Portfolio">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${escapeHtml(project.title)} project preview">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/syne@5.1.0/latin.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/fira-code@5.1.0/latin.css">
  <link rel="stylesheet" href="style.css?v=20260831-5">
  <link rel="icon" type="image/png" href="./ib_logo.png?v=20260831-1">
  <link rel="apple-touch-icon" href="./ib_logo.png?v=20260831-1">
  <script type="application/ld+json">
${schema.split('\n').map(line => `    ${line}`).join('\n')}
  </script>
</head>
<body data-project-id="${id}">
  <nav class="navbar scrolled" id="navbar" aria-label="Primary navigation">
    <a href="index.html" class="nav-logo">inbo<span class="nav-logo-dot">.</span></a>
    <div class="nav-links" id="navLinks">
      <a href="index.html#about">About</a>
      <a href="index.html#projects">Projects</a>
      <a href="index.html#skills">Skills</a>
      <a href="index.html#pricing">Pricing</a>
      <a href="index.html#testimonials">Reviews</a>
      <a href="index.html#contact">Contact</a>
      <a href="https://discord.com/users/1481990642174263462" target="_blank" rel="noopener noreferrer" class="nav-cta">Hire me ↗</a>
    </div>
    <button class="menu-toggle" id="menuToggle" type="button" aria-label="Toggle menu" aria-controls="navLinks" aria-expanded="false">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
  </nav>

  <main>
    <div class="container project-page-header">
      <article class="project-header fade-in">
        <nav class="project-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="index.html">Portfolio</a></li>
            <li><a href="index.html#projects">Projects</a></li>
            <li aria-current="page">${escapeHtml(project.title)}</li>
          </ol>
        </nav>

        <a href="index.html#projects" class="project-back-nav">← Back to projects</a>
        <span class="project-eyebrow" id="projectEyebrow">// ${escapeHtml(project.category.toLowerCase())}</span>
        <h1 class="project-title" id="projectTitle">${escapeHtml(project.title)}</h1>
        <div class="project-meta" id="projectMeta">
          ${tags}
        </div>

        <div class="project-video-wrap">
          <video id="projectVideo" controls muted playsinline preload="metadata" poster="${escapeHtml(posterList[0])}">
            <source src="${escapeHtml(videoList[0])}" type="video/mp4">
            <p>Your browser does not support HTML5 video.</p>
          </video>
        </div>

        <div class="video-gallery" id="videoGallery">${gallery}
        </div>

        <div class="project-body">
          <div class="project-desc-text" id="projectDesc">
              ${descriptionHtml(project.desc)}
          </div>

          <aside class="project-sidebar" aria-label="Project technologies">
            <div class="sidebar-card">
              <h2>Technologies</h2>
              <div class="sidebar-tag-list" id="sidebarTags">
                ${sidebarTags}
              </div>
              <a href="https://discord.com/users/1481990642174263462" target="_blank" rel="noopener noreferrer" class="sidebar-cta">Hire me for something similar ↗</a>
            </div>
          </aside>
        </div>
      </article>
    </div>
  </main>

  <footer class="footer">
    <p>Built with care &amp; Lua &nbsp;·&nbsp; inbo &nbsp;·&nbsp; © 2022–<span data-current-year>2026</span></p>
  </footer>

  <script defer src="script.js?v=20260831-2"></script>
</body>
</html>
`;
}

for (const [id, slug] of Object.entries(slugs)) {
  if (!projects[id]) throw new Error(`Missing project data for ${id}`);
  await writeFile(new URL(slug, rootUrl), projectPage(id, projects[id]), 'utf8');
  console.log(`Generated ${slug}`);
}

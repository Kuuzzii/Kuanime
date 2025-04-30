const toggle = document.querySelector('.dark-mode-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  toggle.setAttribute('aria-pressed', isDark);
  toggle.querySelector('span').textContent = isDark ? '🌙' : '☀️';
});
toggle.addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === " ") {
    e.preventDefault();
    toggle.click();
  }
});

// AniList GraphQL queries
const spotlightQuery = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { large }
    description(asHtml: false)
    episodes
    siteUrl
    averageScore
    externalLinks { id site url }
    mediaListEntry { progress }
    synonyms
    isAdult
    status
    startDate { year month day }
    synonyms
    relations { edges { node { id title { romaji } } } }
    idMal
  }
}`;

const newReleasedQuery = `
query ($page: Int, $perPage: Int){
  Page(page: $page, perPage: $perPage, sort: START_DATE_DESC) {
    media(type: ANIME, episodes_greater: 0, status: RELEASING) {
      id
      title { romaji english native }
      coverImage { large }
      episodes
      siteUrl
      idMal
      startDate { year month day }
    }
  }
}`;

// Current spotlight episode to track for embed
let currentEpisode = 1;
let spotlightMalId = null;
let spotlightSubOrDub = 'sub'; // can add toggle feature later

const spotlightTitleEl = document.getElementById('spotlight-title');
const spotlightRatingEl = document.getElementById('spotlight-rating');
const spotlightReleaseEl = document.getElementById('spotlight-release');
const spotlightDescriptionEl = document.getElementById('spotlight-description');
const episodeCountBadge = document.querySelector('.spotlight-episode-count');
const watchBtn = document.querySelector('.watch-btn');
const prevEpBtn = document.getElementById('prev-ep-btn');
const nextEpBtn = document.getElementById('next-ep-btn');
const animePlayer = document.getElementById('anime-player');
const newAnimeContainer = document.getElementById('new-anime-list');

async function aniListFetch(query, variables = {}) {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) {
    throw new Error('AniList API error');
  }
  return res.json();
}

// Render spotlight anime data
function renderSpotlight(media) {
  const title = media.title.english || media.title.romaji || media.title.native || 'Untitled';
  spotlightTitleEl.textContent = title;
  spotlightDescriptionEl.textContent = media.description ? stripHtml(media.description).slice(0, 250) + '...' : 'No description available.';
  spotlightReleaseEl.textContent = media.startDate.year ? `Release Date: ${media.startDate.year}-${pad(media.startDate.month)}-${pad(media.startDate.day)}` : 'Release Date: -';
  spotlightRatingEl.innerHTML = `&#11088; <span class="imdb">Score: ${media.averageScore || 'N/A'}</span>`;

  spotlightMalId = media.idMal;
  currentEpisode = 1; // start at episode 1, can be extended to last watched if you implement

  episodeCountBadge.textContent = (media.episodes ? `${media.episodes} episode${media.episodes === 1 ? '' : 's'}` : 'Episodes unknown');

  // Setup iframe src for vidlink.pro
  setupEmbedIframe();

  // Enable/disable episode nav buttons
  updateEpisodeButtons(media.episodes);

  // Watch Now button can open AniList page
  watchBtn.onclick = () => {
    window.open(media.siteUrl || `https://anilist.co/anime/${media.id}`, '_blank');
  };
}

// Utility to remove HTML tags from AniList description
function stripHtml(html) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Zero pad month/day for date string
function pad(num) {
  return num ? (num < 10 ? '0' + num : num) : '00';
}

// Setup or update iframe src with current episode/sub/dub
function setupEmbedIframe() {
  if (!spotlightMalId) return;
  // vidlink url pattern: https://vidlink.pro/anime/{MALid}/{episode}/{subOrDub}
  animePlayer.src = `https://vidlink.pro/anime/${spotlightMalId}/${currentEpisode}/${spotlightSubOrDub}`;
}

// Update prev/next buttons enabled state
function updateEpisodeButtons(totalEpisodes) {
  prevEpBtn.disabled = currentEpisode <= 1;
  nextEpBtn.disabled = !totalEpisodes || currentEpisode >= totalEpisodes;
}

// Handle next/prev episode clicks
prevEpBtn.addEventListener('click', () => {
  if (currentEpisode > 1) {
    currentEpisode--;
    setupEmbedIframe();
    updateEpisodeButtons(null);
  }
});
nextEpBtn.addEventListener('click', () => {
  // Assuming we know total episodes from badge or passed param
  const totalEpisodes = parseInt(episodeCountBadge.textContent) || null;
  if (!totalEpisodes || currentEpisode < totalEpisodes) {
    currentEpisode++;
    setupEmbedIframe();
    updateEpisodeButtons(null);
  }
});

async function fetchAndRenderSpotlight() {
  try {
    // To keep it simple, fetch popular anime sorted by score descending and pick first as spotlight
    const query = `
    query ($page: Int, $perPage: Int){
      Page(page: $page, perPage: $perPage, sort: SCORE_DESC) {
        media(type: ANIME, episodes_greater: 0, status: RELEASING) {
          id
          idMal
          title { romaji english native }
          description(asHtml: false)
          episodes
          siteUrl
          averageScore
          startDate { year month day }
        }
      }
    }`;
    const res = await aniListFetch(query, { page:1, perPage: 1 });
    const media = res.data.Page.media[0];
    renderSpotlight(media);
  } catch (err) {
    console.error('Failed to fetch spotlight anime', err);
  }
}

async function fetchAndRenderNewReleasedAnime() {
  try {
    const res = await aniListFetch(newReleasedQuery, { page:1, perPage:10 });
    const mediaList = res.data.Page.media;
    newAnimeContainer.innerHTML = '';

    mediaList.forEach(media => {
      const title = media.title.english || media.title.romaji || media.title.native || 'Untitled';
      const poster = media.coverImage.large;
      const malId = media.idMal;

      const card = document.createElement('a');
      card.href = malId ? `https://myanimelist.net/anime/${malId}` : media.siteUrl || '#';
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style = 'width: 140px; color: inherit; text-decoration: none; display: flex; flex-direction: column; align-items: center;';

      const img = document.createElement('img');
      img.alt = title;
      img.loading = "lazy";
      if(poster) {
        img.src = poster;
      } else {
        img.style.background = '#444';
        img.style.width = '140px';
        img.style.height = '210px';
        img.alt = 'No image available';
      }

      const titleEl = document.createElement('span');
      titleEl.textContent = title;

      card.appendChild(img);
      card.appendChild(titleEl);
      newAnimeContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to fetch new released anime', err);
  }
}

// On page load
fetchAndRenderSpotlight();
fetchAndRenderNewReleasedAnime();

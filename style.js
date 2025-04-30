const toggle = document.querySelector('.dark-mode-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  toggle.setAttribute('aria-pressed', isDark);
  toggle.querySelector('span').textContent = isDark ? '🌙' : '☀️';
});
// Allow toggle by keyboard
toggle.addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === " ") {
    e.preventDefault();
    toggle.click();
  }
});

// AniList GraphQL query to get popular anime
const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
        }
        episodes
        averageScore
        siteUrl
      }
    }
  }
`;

async function fetchAndRenderAnime() {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { page: 1, perPage: 10 } })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const animeList = data.data.Page.media;

    const container = document.getElementById('anime-list');
    container.innerHTML = ''; // Clear container

    animeList.forEach(anime => {
      const title = anime.title.english || anime.title.romaji || anime.title.native || 'Untitled';
      const animeLink = anime.siteUrl;
      const cover = anime.coverImage.large;

      // Create a card for each anime
      const card = document.createElement('a');
      card.href = animeLink;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style =
        'width: 140px; color: inherit; text-decoration: none; display: flex; flex-direction: column; align-items: center;';

      const img = document.createElement('img');
      img.src = cover;
      img.alt = title;
      img.style.width = '140px';
      img.style.borderRadius = '8px';
      img.style.objectFit = 'cover';
      img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
      img.loading = "lazy";

      const titleEl = document.createElement('span');
      titleEl.textContent = title;
      titleEl.style.marginTop = '8px';
      titleEl.style.fontSize = '14px';
      titleEl.style.fontWeight = '600';
      titleEl.style.textAlign = 'center';

      card.appendChild(img);
      card.appendChild(titleEl);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching anime:', error);
  }
}

// Fetch and display anime on page load
fetchAndRenderAnime();

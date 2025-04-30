const API_KEY = 'b139bc417606842811f1526ae92572bc';

const BASE_URL = 'https://api.themoviedb.org/3';

const IMG_URL = 'https://image.tmdb.org/t/p/original';

const urlParams = new URLSearchParams(window.location.search);

const movieId = urlParams.get('id');

const type = urlParams.get('type'); // 'movie' or 'tv'

const season = urlParams.get('season') || 1;

const episode = urlParams.get('episode') || 1;

const backdrop = document.getElementById('movie-backdrop');

const poster = document.getElementById('movie-poster');

const titleEl = document.getElementById('movie-title');

const releaseDateEl = document.getElementById('movie-release-date');

const runtimeEl = document.getElementById('movie-runtime');

const genresEl = document.getElementById('movie-genres');

const overviewEl = document.getElementById('movie-overview');

const videoIframe = document.getElementById('movie-video');

const playBtn = document.getElementById('play-btn');

const serverSelect = document.getElementById('server-select');

const backBtn = document.getElementById('back-btn');

let currentServerIndex = null;

const servers = [];

let imdbId = null;

// Fetch IMDb id for TV shows or use movieId as IMDb for movies

async function getImdbId(tmdbId, type) {

  if (!tmdbId || !type) return null;

  try {

    const url = ${BASE_URL}/${type}/${tmdbId}?api_key=${API_KEY}&append_to_response=external_ids;

    const res = await fetch(url);

    if (!res.ok) throw new Error('Failed to fetch external IDs');

    const data = await res.json();

    if (data.external_ids && data.external_ids.imdb_id) {

      return data.external_ids.imdb_id;

    }

    return null;

  } catch (err) {

    console.error(err);

    return null;

  }

}

async function fetchDetails() {

  try {

    const res = await fetch(`${BASE_URL}/${type}/${movieId}?api_key=${API_KEY}`);

    if (!res.ok) throw new Error('Failed to fetch details');

    const data = await res.json();

    backdrop.style.backgroundImage = url(${IMG_URL}${data.backdrop_path || ''});

    poster.src = ${IMG_URL}${data.poster_path || ''};

    titleEl.textContent = data.title || data.name || '';

    overviewEl.textContent = data.overview || 'No description available.';

    releaseDateEl.textContent = new Date(data.release_date || data.first_air_date || '').toLocaleDateString();

    if (type === 'movie') {

      runtimeEl.textContent = data.runtime ? ${data.runtime} min : '';

    } else {

      runtimeEl.textContent = (data.episode_run_time && data.episode_run_time.length > 0) ? ${data.episode_run_time[0]} min per episode : '';

    }

    genresEl.innerHTML = '';

    if (data.genres) {

      data.genres.forEach(genre => {

        const span = document.createElement('span');

        span.className = 'genre-tag';

        span.textContent = genre.name;

        genresEl.appendChild(span);

      });

    }

  } catch (err) {

    console.error(err);

    alert('Failed to load movie/show details.');

  }

}

// Setup servers array with correct IMDb/TMDb IDs

async function setupServers() {

  imdbId = type === 'tv' ? await getImdbId(movieId, 'tv') : movieId;

  // Clear servers array

  servers.length = 0;

  if (type === 'movie') {

    // For movies assume movieId is IMDb id

    servers.push(

      { name: 'Vidsrc', url: https://vidsrc.me/embed/${movieId} },

      { name: 'Fsapi', url: https://fsapi.xyz/movie/${movieId} },

      { name: 'Curtstream', url: https://curtstream.com/movies/imdb/${movieId} },

      { name: 'Moviewp', url: https://moviewp.com/se.php?video_id=${movieId} },

      { name: 'ApiMDB', url: https://v2.apimdb.net/e/movie/${movieId} },

      { name: 'Gomo', url: https://gomo.to/movie/${movieId} },

      { name: 'VidCloud', url: https://vidcloud.stream/${movieId}.html },

    );

  } else if (type === 'tv') {

    if (!imdbId) {

      alert('IMDb ID not found for TV show. Some streams may not work.');

    }

    servers.push(

      { name: 'Vidsrc', url: https://vidsrc.me/embed/${movieId} },

      { name: 'Fsapi', url: https://fsapi.xyz/movie/${movieId} },

      { name: 'Fsapi TV', url: https://fsapi.xyz/tv-imdb/${imdbId || movieId}-${season}-${episode} },  // IMDb id preferred

      { name: 'Moviewp TV', url: https://moviewp.com/se.php?video_id=${movieId}&tmdb=1&s=${season}&e=${episode} }, // TMDb id

      { name: 'ApiMDB TV', url: https://v2.apimdb.net/e/tmdb/tv/${movieId}/${season}/${episode}/ }, // TMDb id

      { name: 'GDrivePlayer', url: https://databasegdriveplayer.co/player.php?type=series&tmdb=${movieId}&season=${season}&episode=${episode} }, // TMDb id

      { name: 'Curtstream TV', url: https://curtstream.com/series/tmdb/${movieId}/season/${season}/episode/${episode}/ }, // TMDb id

    );

  }

  // Populate serverSelect dropdown

  serverSelect.innerHTML = '';

  servers.forEach((srv, idx) => {

    const option = document.createElement('option');

    option.value = idx;

    option.textContent = srv.name;

    serverSelect.appendChild(option);

  });

  currentServerIndex = null;

  updateVideoSrc();

}

function updateVideoSrc() {

  const existingMsg = document.getElementById('choose-server-msg');

  if (existingMsg) existingMsg.remove();

  if (currentServerIndex === null) {

    videoIframe.src = 'about:blank';

    const msg = document.createElement('div');

    msg.id = 'choose-server-msg';

    msg.style =

      'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;background-color:rgba(0,0,0,0.75);font-size:1.4rem;z-index:10;';

    msg.textContent = '⚠️ Please choose a server first';

    const container = document.querySelector('.video-container');

    container.style.position = 'relative';

    container.appendChild(msg);

    playBtn.disabled = true;

    return;

  }

  playBtn.disabled = false;

  videoIframe.src = servers[currentServerIndex].url;

}

// Event listeners

serverSelect.addEventListener('change', (e) => {

  currentServerIndex = parseInt(e.target.value, 10);

  updateVideoSrc();

});

playBtn.addEventListener('click', () => {

  if (currentServerIndex === null) {

    alert('Please choose a streaming server first.');

    return;

  }

  document.querySelector('.video-container').scrollIntoView({ behavior: 'smooth' });

});

backBtn.addEventListener('click', () => {

  window.history.back();

});

if (!movieId || !type) {

  alert('Invalid movie or TV show ID');

  playBtn.disabled = true;

} else {

  fetchDetails();

  setupServers();

  updateVideoSrc();

}

put it here and give me the fully updated code

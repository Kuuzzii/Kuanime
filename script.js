// Elements
const newReleasedContainer = document.getElementById("newReleasedContainer");
const spotlightTitle = document.getElementById("spotlight-title");
const spotlightDescription = document.getElementById("spotlight-description");
const watchNowBtn = document.getElementById("watchNowBtn");
const searchBar = document.getElementById("searchBar");
const searchBtn = document.getElementById("searchBtn");

// Spotlight anime data (example hardcoded, you can extend to dynamic)
const spotlightAnime = {
  title: "Fullmetal Alchemist: Brotherhood",
  imdb: 9.1,
  releaseYear: 2009,
  description:
    "Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes wrong and leaves them in damaged physical forms.",
  MALid: 5114,
  episode: 1,
  subOrDub: "sub",
};

// Generate vidlink URL with optional fallback
function generateVidlinkUrl(MALid, episode = 1, subOrDub = "sub", fallback = false) {
  let url = `https://vidlink.pro/anime/${MALid}/${episode}/${subOrDub}`;
  if (fallback) url += "?fallback=true";
  return url;
}

// Load the spotlight section
function loadSpotlight() {
  spotlightTitle.textContent = spotlightAnime.title;
  spotlightDescription.textContent = spotlightAnime.description + ` (Release Year: ${spotlightAnime.releaseYear})`;
  watchNowBtn.onclick = () => {
    const url = generateVidlinkUrl(
      spotlightAnime.MALid,
      spotlightAnime.episode,
      spotlightAnime.subOrDub
    );
    window.open(url, "_blank");
  };
}

// Fetch latest seasonal anime using Jikan API and display them
async function fetchNewReleased() {
  try {
    // Fetch anime from the current season
    const response = await fetch("https://api.jikan.moe/v4/seasons/now");
    const data = await response.json();

    if (!data.data || !data.data.length) {
      newReleasedContainer.innerHTML = "<p>No new releases found.</p>";
      return;
    }

    newReleasedContainer.innerHTML = "";

    // Show up to 6 new releases
    data.data.slice(0, 6).forEach((anime) => {
      const malId = anime.mal_id;
      const title = anime.title;
      // Use jpg image url, fallback if not found
      const image = anime.images?.jpg?.image_url || "";
      const episode = 1; // Default to episode 1 for new releases
      const subOrDub = "sub"; // Default sub, you can extend with UI toggle

      const animeDiv = document.createElement("div");
      animeDiv.classList.add("anime-item");
      animeDiv.title = title;
      animeDiv.innerHTML = `
        <img src="${image}" alt="${title}" />
        <div class="anime-title">${title}</div>
        <button>Watch Ep ${episode} (Sub)</button>
      `;

      animeDiv.querySelector("button").onclick = () => {
        const url = generateVidlinkUrl(malId, episode, subOrDub);
        window.open(url, "_blank");
      };

      newReleasedContainer.appendChild(animeDiv);
    });
  } catch (error) {
    newReleasedContainer.innerHTML = `<p>Error loading new releases: ${error.message}</p>`;
  }
}

// Optional Search handler
searchBtn.onclick = () => {
  alert(`Search for: ${searchBar.value} (Search functionality not implemented)`);
};

// Initialize page
loadSpotlight();
fetchNewReleased();

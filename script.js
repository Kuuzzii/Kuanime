const MAL_ID_DEFAULT = 5114; // Example MAL ID for "Fullmetal Alchemist: Brotherhood"
const EPISODE_NUMBER_DEFAULT = 1;
const SUB_OR_DUB_DEFAULT = "sub";

// Elements
const newReleasedContainer = document.getElementById("newReleasedContainer");
const spotlightTitle = document.getElementById("spotlight-title");
const spotlightDescription = document.getElementById("spotlight-description");
const watchNowBtn = document.getElementById("watchNowBtn");
const searchBar = document.getElementById("searchBar");
const searchBtn = document.getElementById("searchBtn");

// Example spotlight anime data (hardcoded for now)
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

// Sample new released anime data: should be replaced with real API call
let newReleases = [
  {
    title: "Chainsaw Man",
    MALid: 44589,
    episode: 1,
    subOrDub: "sub",
    image:
      "https://cdn.myanimelist.net/images/anime/1987/136900.jpg",
  },
  {
    title: "Spy x Family",
    MALid: 50265,
    episode: 1,
    subOrDub: "sub",
    image:
      "https://cdn.myanimelist.net/images/anime/1476/109222.jpg",
  },
  {
    title: "Jujutsu Kaisen",
    MALid: 40748,
    episode: 1,
    subOrDub: "sub",
    image:
      "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
  },
];

// Helper to generate vidlink API url
function generateVidlinkUrl(MALid, episode, subOrDub, fallback = false) {
  let base = `https://vidlink.pro/anime/${MALid}/${episode}/${subOrDub}`;
  if (fallback) base += "?fallback=true";
  return base;
}

// Populate spotlight section
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

// Populate new releases section dynamically
function loadNewReleased() {
  newReleasedContainer.innerHTML = "";
  newReleases.forEach((anime) => {
    const animeDiv = document.createElement("div");
    animeDiv.classList.add("anime-item");
    animeDiv.title = anime.title;

    animeDiv.innerHTML = `
      <img src="${anime.image}" alt="${anime.title}" />
      <div class="anime-title">${anime.title}</div>
      <button>Watch Ep ${anime.episode} (Sub)</button>
    `;

    animeDiv.querySelector("button").onclick = () => {
      const url = generateVidlinkUrl(anime.MALid, anime.episode, anime.subOrDub);
      window.open(url, "_blank");
    };

    newReleasedContainer.appendChild(animeDiv);
  });
}

// Search functionality (for demonstration only)
searchBtn.onclick = () => {
  // For your actual app, integrate a real search API for anime here
  alert(`Search for: ${searchBar.value} (Functionality not implemented)`);
};

// Initial load
loadSpotlight();
loadNewReleased();

// Here you should add real networking code to fetch new releases and spotlight anime dynamically as they update.
// For example, from your own backend or a third-party MAL API wrapper.
// This demo uses hardcoded data as placeholders.

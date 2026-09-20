import { getStories } from "../../data/api";
import {
  getCachedStories,
  getSavedStories,
  saveStory,
  deleteSavedStory,
  saveStories,
} from "../../data/db";
import { setMessage } from "../../utils";

let stories = [];
let savedStories = [];

const renderCards = (container, items, savedIds = new Set()) => {
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = '<p class="empty">Belum ada cerita tersimpan.</p>';
    return;
  }
  items.forEach((story) => {
    const card = document.createElement("story-card");
    card.story = story;
    card.saved = savedIds.has(story.id);
    container.appendChild(card);
  });
};

const HomePage = {
  async render() {
    return `<div class="app-shell"><app-header></app-header><div class="container"><section class="hero"><div><p class="eyebrow">RUANG UNTUK BERBAGI</p><h1>Setiap cerita punya tempat.</h1><p>Temukan kisah dari berbagai sudut Indonesia, lalu bagikan ceritamu sendiri.</p><a class="primary-button inline-button" href="#/add">+ Bagikan cerita</a></div><div class="hero-art" aria-hidden="true">✦</div></section><div id="feedback" class="feedback" role="alert" tabindex="-1"></div><section class="map-section" aria-labelledby="map-title"><div class="section-heading"><div><p class="eyebrow">JELAJAHI</p><h2 id="map-title">Cerita di peta</h2></div><button id="fit-map" class="outline-button" type="button">Tampilkan semua</button></div><map-view id="story-map"></map-view></section><section aria-labelledby="stories-title" class="stories-section"><div class="section-heading"><div><p class="eyebrow">CERITA TERBARU</p><h2 id="stories-title">Dari komunitas</h2></div><p id="story-count" class="muted"></p></div><div id="story-list" class="story-grid"></div></section><section aria-labelledby="saved-title" class="stories-section saved-section"><div class="section-heading"><div><p class="eyebrow">PENYIMPANAN OFFLINE</p><h2 id="saved-title">Cerita tersimpan</h2></div><button id="refresh-saved" class="outline-button" type="button">Muat ulang</button></div><div id="saved-list" class="story-grid"></div></section></div></div>`;
  },
  async afterRender() {
    const list = document.querySelector("#story-list");
    const savedList = document.querySelector("#saved-list");
    list.innerHTML = "<loading-indicator></loading-indicator>";
    try {
      const result = await getStories();
      stories = result.listStory || [];
      await saveStories(stories);
      document.querySelector("#story-count").textContent =
        `${stories.length} cerita`;
    } catch (error) {
      stories = await getCachedStories();
      document.querySelector("#story-count").textContent =
        `${stories.length} cerita (offline)`;
      setMessage(
        "Koneksi tidak tersedia. Menampilkan data terakhir yang tersimpan.",
        "error",
      );
    }

    savedStories = await getSavedStories();
    const savedIds = new Set(savedStories.map((story) => story.id));
    renderCards(list, stories, savedIds);
    renderCards(
      savedList,
      savedStories,
      new Set(savedStories.map((story) => story.id)),
    );

    const map = document.querySelector("#story-map");
    map.setStories(stories);
    document.querySelector("#fit-map").addEventListener("click", () => {
      const withLocation = stories.filter(
        (s) => Number.isFinite(s.lat) && Number.isFinite(s.lon),
      );
      if (withLocation.length)
        map.map.fitBounds(
          L.latLngBounds(withLocation.map((s) => [s.lat, s.lon])),
          { padding: [30, 30] },
        );
    });

    const handleSaveAction = async (event) => {
      const card = event.target.closest("story-card");
      if (!card) return;
      const id = card.dataset.id;
      const story =
        stories.find((item) => item.id === id) ||
        savedStories.find((item) => item.id === id);
      if (!story) return;
      if (!event.target.closest("button")) {
        window.location.hash = `/story/${encodeURIComponent(id)}`;
        return;
      }
      if (event.target.closest(".save-story")) {
        const currentlySaved = savedStories.some((item) => item.id === id);
        if (currentlySaved) await deleteSavedStory(id);
        else await saveStory(story);
        savedStories = await getSavedStories();
        const ids = new Set(savedStories.map((item) => item.id));
        renderCards(list, stories, ids);
        renderCards(savedList, savedStories, ids);
        setMessage(
          currentlySaved
            ? "Cerita dihapus dari penyimpanan offline."
            : "Cerita disimpan untuk dibaca offline.",
          "success",
        );
      }
      if (event.target.closest(".locate-story")) map.focusStory(id, stories);
    };

    list.addEventListener("click", handleSaveAction);
    savedList.addEventListener("click", handleSaveAction);
    document
      .querySelector("#refresh-saved")
      .addEventListener("click", async () => {
        savedStories = await getSavedStories();
        renderCards(
          savedList,
          savedStories,
          new Set(savedStories.map((item) => item.id)),
        );
      });
  },
};
export default HomePage;

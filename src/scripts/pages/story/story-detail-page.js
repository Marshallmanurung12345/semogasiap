import { getStories } from "../../data/api";
import { getCachedStories } from "../../data/db";
import { escapeHtml, formatDate, setMessage } from "../../utils";

const getStoryId = () =>
  decodeURIComponent(window.location.hash.split("/")[2] || "");

const StoryDetailPage = {
  async render() {
    return '<div class="app-shell"><app-header></app-header><div class="container narrow"><div id="feedback" class="feedback" role="alert" tabindex="-1"></div><section id="story-detail" class="story-detail"><loading-indicator></loading-indicator></section></div></div>';
  },
  async afterRender() {
    const container = document.querySelector("#story-detail");
    const id = getStoryId();
    let stories;
    try {
      const result = await getStories();
      stories = result.listStory || [];
    } catch (_) {
      stories = await getCachedStories();
      setMessage(
        "Koneksi tidak tersedia. Menampilkan cerita yang tersimpan.",
        "error",
      );
    }
    const story = stories.find((item) => item.id === id);
    if (!story) {
      container.innerHTML =
        '<p class="empty">Cerita tidak ditemukan.</p><a class="outline-button inline-button" href="#/home">Kembali ke beranda</a>';
      return;
    }
    container.innerHTML = `<article class="story-detail-card"><img src="${escapeHtml(story.photoUrl)}" alt="Foto cerita oleh ${escapeHtml(story.name || "Pengguna")}"><div class="story-detail-card__body"><p class="eyebrow">${escapeHtml(story.name || "Pengguna")}</p><h1>${escapeHtml(story.description)}</h1><time datetime="${escapeHtml(story.createdAt)}">${formatDate(story.createdAt)}</time><p class="story-location">Lokasi: ${escapeHtml(String(story.lat))}, ${escapeHtml(String(story.lon))}</p><a class="outline-button inline-button" href="#/home">Kembali ke beranda</a></div></article>`;
  },
};

export default StoryDetailPage;

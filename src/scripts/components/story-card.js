import { escapeHtml, formatDate } from '../utils';

class StoryCard extends HTMLElement {
  set story(value) { this._story = value; this.render(); }
  set saved(value) { this._saved = value; this.render(); }
  render() {
    if (!this._story) return;
    const s = this._story;
    const saved = Boolean(this._saved);
    this.innerHTML = `<article class="story-card" tabindex="0" data-id="${escapeHtml(s.id)}">
      <img src="${escapeHtml(s.photoUrl)}" alt="Foto cerita oleh ${escapeHtml(s.name || 'Pengguna')}" loading="lazy">
      <div class="story-card__body"><p class="eyebrow">${escapeHtml(s.name || 'Pengguna')}</p>
      <h3>${escapeHtml(s.description.slice(0, 70))}${s.description.length > 70 ? '…' : ''}</h3>
      <time datetime="${escapeHtml(s.createdAt)}">${formatDate(s.createdAt)}</time>
      <div class="card-actions">
        <button class="text-button locate-story" type="button">Lihat di peta</button>
        <button class="text-button save-story" type="button" aria-pressed="${saved}">${saved ? 'Hapus offline' : 'Simpan offline'}</button>
      </div></div>
    </article>`;
  }
}
customElements.define('story-card', StoryCard);

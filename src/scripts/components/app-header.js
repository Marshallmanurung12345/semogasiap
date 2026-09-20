import { subscribePush, unsubscribePush, isPushSubscribed } from '../data/push';
import { setMessage } from '../utils';

class AppHeader extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<header class="site-header"><a class="brand" href="#/home" aria-label="Cerita Kita beranda">Cerita<span>Kita</span></a>
      <nav aria-label="Navigasi utama"><a href="#/home">Beranda</a><a href="#/add">Bagikan cerita</a><button id="push-toggle" class="outline-button" type="button" aria-pressed="false">Aktifkan notifikasi</button><button id="logout" class="outline-button" type="button">Keluar</button></nav></header>`;
    const pushButton = this.querySelector('#push-toggle');
    try {
      const active = await isPushSubscribed();
      pushButton.setAttribute('aria-pressed', String(active));
      pushButton.textContent = active ? 'Matikan notifikasi' : 'Aktifkan notifikasi';
    } catch (_) {}

    pushButton.addEventListener('click', async () => {
      pushButton.disabled = true;
      try {
        const active = await isPushSubscribed();
        if (active) {
          await unsubscribePush();
          setMessage('Push notification dinonaktifkan.', 'success');
        } else {
          await subscribePush();
          setMessage('Push notification berhasil diaktifkan.', 'success');
        }
        const next = await isPushSubscribed();
        pushButton.setAttribute('aria-pressed', String(next));
        pushButton.textContent = next ? 'Matikan notifikasi' : 'Aktifkan notifikasi';
      } catch (error) {
        setMessage(error.message, 'error');
      } finally {
        pushButton.disabled = false;
      }
    });

    this.querySelector('#logout').addEventListener('click', () => {
      localStorage.removeItem('story_token');
      localStorage.removeItem('story_name');
      window.location.hash = '/login';
    });
  }
}
customElements.define('app-header', AppHeader);

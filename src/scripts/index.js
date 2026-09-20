import '../styles/styles.css';
import App from './pages/app';

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./sw.js');
  } catch (error) {
    console.error('Service worker gagal didaftarkan:', error);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();
  const app = new App({ content: document.querySelector('#app') });
  await app.renderPage();
  window.addEventListener('hashchange', () => app.renderPage());
});

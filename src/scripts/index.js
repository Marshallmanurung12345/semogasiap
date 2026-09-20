import "../styles/styles.css";
import App from "./pages/app";
import { syncPendingStories } from "./data/api";

window.deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  window.deferredInstallPrompt = event;
  window.dispatchEvent(new Event("app-install-available"));
});

const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.error("Service worker gagal didaftarkan:", error);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await registerServiceWorker();
  if (navigator.onLine) syncPendingStories().catch(() => {});
  window.addEventListener("online", () => syncPendingStories().catch(() => {}));
  const app = new App({ content: document.querySelector("#app") });
  await app.renderPage();
  window.addEventListener("hashchange", () => app.renderPage());
});

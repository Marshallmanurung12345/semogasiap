import { addStory } from "../../data/api";
import { go, setMessage } from "../../utils";
import "../../components/loading";

const AddStoryPage = {
  async render() {
    return `<div class="app-shell"><app-header></app-header><div class="container narrow"><section class="page-intro"><p class="eyebrow">BAGIKAN CERITA</p><h1>Tambahkan cerita baru</h1><p>Pilih foto, tulis cerita, lalu tentukan lokasi dengan mengeklik peta.</p></section><div id="feedback" class="feedback" role="alert" tabindex="-1"></div><form id="story-form" class="story-form" novalidate><div class="form-card"><label for="description">Cerita</label><textarea id="description" name="description" rows="6" minlength="10" maxlength="500" placeholder="Apa yang ingin kamu ceritakan?" required></textarea><small class="counter" id="counter">0/500</small><small class="field-error" data-error="description"></small><label for="photo">Foto</label><input id="photo" name="photo" type="file" accept="image/*" required><small class="muted">Maksimal 1 MB. Kamu juga dapat memilih kamera saat perangkat mendukungnya.</small><button type="button" id="camera-button" class="outline-button">Buka kamera</button><div id="camera-area" class="camera-area" hidden><video id="camera" autoplay playsinline aria-label="Pratinjau kamera"></video><button type="button" id="capture" class="primary-button">Ambil foto</button><canvas id="snapshot" hidden></canvas></div><div class="location-fields"><label for="lat">Latitude</label><input id="lat" name="lat" type="number" step="any" readonly required><label for="lon">Longitude</label><input id="lon" name="lon" type="number" step="any" readonly required></div></div><div class="location-card"><div class="section-heading"><div><h2>Pilih lokasi</h2><p class="muted">Klik titik pada peta untuk menentukan koordinat.</p></div><span id="location-status" class="location-status">Belum dipilih</span></div><map-view id="pick-map"></map-view></div><div class="form-actions"><a class="outline-button inline-button" href="#/home">Batal</a><button class="primary-button" type="submit">Publikasikan cerita</button></div></form></div></div>`;
  },
  async afterRender() {
    const form = document.querySelector("#story-form");
    const map = document.querySelector("#pick-map");
    let stopCamera = null;
    let stopPick = map.pickLocation((lat, lon) => {
      form.lat.value = lat.toFixed(6);
      form.lon.value = lon.toFixed(6);
      document.querySelector("#location-status").textContent =
        `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    });
    const description = form.description;
    description.addEventListener(
      "input",
      () =>
        (document.querySelector("#counter").textContent =
          `${description.value.length}/500`),
    );
    const validate = () => {
      form
        .querySelectorAll(".field-error")
        .forEach((e) => (e.textContent = ""));
      if (!description.validity.valid)
        document.querySelector("[data-error=description]").textContent =
          "Cerita harus berisi 10–500 karakter.";
      return form.checkValidity();
    };
    const cameraButton = document.querySelector("#camera-button");
    const cameraArea = document.querySelector("#camera-area");
    const video = document.querySelector("#camera");
    const canvas = document.querySelector("#snapshot");
    cameraButton.addEventListener("click", async () => {
      try {
        stopCamera?.();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        video.srcObject = stream;
        cameraArea.hidden = false;
        stopCamera = () => stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        setMessage(
          "Kamera tidak dapat digunakan. Periksa izin browser.",
          "error",
        );
      }
    });
    document.querySelector("#capture").addEventListener("click", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          const file = new File([blob], `cerita-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          const transfer = new DataTransfer();
          transfer.items.add(file);
          form.photo.files = transfer.files;
          setMessage("Foto dari kamera berhasil dipilih.", "success");
        },
        "image/jpeg",
        0.85,
      );
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) return;
      if (form.photo.files[0]?.size > 1024 * 1024)
        return setMessage("Ukuran foto maksimal 1 MB.", "error");
      if (!form.lat.value || !form.lon.value)
        return setMessage("Pilih lokasi pada peta terlebih dahulu.", "error");
      const button = form.querySelector("button[type=submit]");
      const feedback = document.querySelector("#feedback");
      button.disabled = true;
      button.textContent = "Mengirim…";
      feedback.className = "feedback";
      feedback.innerHTML = "<loading-indicator></loading-indicator>";
      try {
        await addStory({
          description: description.value.trim(),
          photo: form.photo.files[0],
          lat: form.lat.value,
          lon: form.lon.value,
        });
        setMessage("Cerita berhasil dipublikasikan.", "success");
        setTimeout(() => go("/home"), 700);
      } catch (error) {
        setMessage(error.message, "error");
      } finally {
        button.disabled = false;
        button.textContent = "Publikasikan cerita";
      }
    });
    window.addEventListener("hashchange", () => stopCamera?.(), { once: true });
    stopPick = stopPick || (() => {});
  },
};
export default AddStoryPage;

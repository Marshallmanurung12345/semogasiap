const L = window.L;

class MapView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div class="map-shell"><div class="map" role="application" aria-label="Peta lokasi cerita"></div></div>';
    this.map = L.map(this.querySelector('.map'), { center: [-2.5, 118], zoom: 4, keyboard: true });
    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 });
    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap', maxZoom: 17 });
    street.addTo(this.map);
    L.control.layers({ 'Peta jalan': street, 'Topografi': topo }, {}, { collapsed: false }).addTo(this.map);
    this.markers = [];
    this.selectedMarker = null;
  }
  setStories(stories) {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    this.selectedMarker = null;
    stories.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lon)).forEach((story) => {
      const marker = L.marker([story.lat, story.lon]).addTo(this.map)
        .bindPopup(`<strong>${this.escape(story.name || 'Pengguna')}</strong><br>${this.escape(story.description)}`);
      marker.on('click', () => document.querySelectorAll('story-card').forEach((card) => {
        card.classList.toggle('active', card.dataset.id === story.id);
      }));
      this.markers.push(marker);
    });
  }
  focusStory(id, stories) {
    const story = stories.find((s) => s.id === id);
    if (!story || !Number.isFinite(story.lat) || !Number.isFinite(story.lon)) return;
    this.map.flyTo([story.lat, story.lon], 12, { duration: 0.8 });
    const marker = this.markers.find((m) => m.getLatLng().lat === story.lat && m.getLatLng().lng === story.lon);
    if (marker) marker.openPopup();
  }
  pickLocation(handler) {
    const onClick = (event) => {
      const { lat, lng } = event.latlng;
      handler(lat, lng);

      if (this.selectedMarker) {
        this.selectedMarker.remove();
      }

      this.selectedMarker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup(`Lokasi dipilih<br>Latitude: ${lat.toFixed(6)}<br>Longitude: ${lng.toFixed(6)}`)
        .openPopup();
    };

    this.map.on('click', onClick);
    this.map.getContainer().classList.add('pick-mode');

    return () => {
      this.map.off('click', onClick);
      this.map.getContainer().classList.remove('pick-mode');
      if (this.selectedMarker) {
        this.selectedMarker.remove();
        this.selectedMarker = null;
      }
    };
  }
  escape(v) { return String(v).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c])); }
  disconnectedCallback() { if (this.map) this.map.remove(); }
}
customElements.define('map-view', MapView);

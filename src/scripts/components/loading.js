class LoadingIndicator extends HTMLElement {
  connectedCallback() { this.innerHTML = '<div class="loading" role="status" aria-live="polite"><span></span><span></span><span></span><b>Memuat...</b></div>'; }
}
customElements.define('loading-indicator', LoadingIndicator);

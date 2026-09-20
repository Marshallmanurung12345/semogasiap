export const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;',
}[char]));

export const formatDate = (value) => new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));

export const isLoggedIn = () => Boolean(localStorage.getItem('story_token'));
export const go = (path) => { window.location.hash = path; };
export const setMessage = (text, type = 'info') => {
  const el = document.querySelector('#feedback');
  if (!el) return;
  el.textContent = text;
  el.className = `feedback ${type}`;
  el.focus();
};

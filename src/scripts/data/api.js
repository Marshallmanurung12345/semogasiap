import CONFIG from "../config";

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${CONFIG.BASE_URL}${path}`, options);
  } catch (_) {
    throw new Error(
      "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
    );
  }
  let data = {};
  try {
    data = await response.json();
  } catch (_) {}
  if (!response.ok)
    throw new Error(data.message || "Permintaan gagal diproses.");
  return data;
};

const authHeaders = () => {
  const token = localStorage.getItem("story_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const registerUser = (name, email, password) =>
  request("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

export const loginUser = (email, password) =>
  request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const getStories = () =>
  request("/stories?size=100&location=1", { headers: authHeaders() });

export const addStory = ({ description, photo, lat, lon }) => {
  const body = new FormData();
  body.append("description", description);
  body.append("photo", photo);
  if (lat !== "") body.append("lat", lat);
  if (lon !== "") body.append("lon", lon);
  return request("/stories", { method: "POST", headers: authHeaders(), body });
};

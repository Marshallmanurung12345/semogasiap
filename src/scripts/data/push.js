import CONFIG from "../config";

const base64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const authHeaders = () => {
  const token = localStorage.getItem("story_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getVapidPublicKey = async () => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/notifications/vapid-public-key`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok) throw new Error("VAPID public key tidak dapat diperoleh.");
  const data = await response.json();
  return data.vapidPublicKey || data.publicKey || data.vapidPublicKey;
};

export const subscribePush = async () => {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error("Browser tidak mendukung push notification.");
  }
  const registration = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error("Izin notifikasi belum diberikan.");

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const publicKey = await getVapidPublicKey();
    if (!publicKey)
      throw new Error("VAPID public key tidak tersedia dari API.");
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(publicKey),
    });
  }

  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok)
    throw new Error("Langganan push notification gagal disimpan.");
  return subscription;
};

export const unsubscribePush = async () => {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok)
    throw new Error("Langganan push notification gagal dihentikan.");
  await subscription.unsubscribe();
};

export const isPushSubscribed = async () => {
  if (!("serviceWorker" in navigator)) return false;
  const registration = await navigator.serviceWorker.ready;
  return Boolean(await registration.pushManager.getSubscription());
};

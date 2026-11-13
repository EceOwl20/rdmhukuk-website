"use client";

const SERVICE_WORKER_PATH = "/rdm-notification-sw.js";

export async function getNotificationRegistration() {
  if (!("serviceWorker" in navigator)) return null;

  await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
    scope: "/",
    updateViaCache: "none",
  });
  return navigator.serviceWorker.ready;
}

export async function showBrowserNotification(title: string, options: NotificationOptions) {
  const registration = await getNotificationRegistration();
  if (registration && "showNotification" in registration) {
    await registration.showNotification(title, options);
    return;
  }

  new Notification(title, options);
}

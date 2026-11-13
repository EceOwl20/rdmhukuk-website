self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/yonetim/gorevler";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const panelClient = clients.find((client) => new URL(client.url).origin === self.location.origin);
      if (panelClient) {
        return panelClient.navigate(targetUrl).then(() => panelClient.focus());
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});

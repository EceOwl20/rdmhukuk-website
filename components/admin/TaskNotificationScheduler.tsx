"use client";

import { useEffect } from "react";

import { getNotificationRegistration, showBrowserNotification } from "@/lib/browser-notifications";

const SENT_NOTIFICATIONS_KEY = "rdm-task-notifications-v1";
const CHECK_INTERVAL_MS = 30_000;
const NOTIFICATION_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

type NotificationTask = {
  id: string;
  title: string;
  dueAt: string | null;
  reminderAt: string | null;
};

type TasksResponse = {
  tasks: NotificationTask[];
};

function readSentNotifications(): Set<string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SENT_NOTIFICATIONS_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSentNotifications(keys: Set<string>) {
  localStorage.setItem(SENT_NOTIFICATIONS_KEY, JSON.stringify([...keys]));
}

function notificationTime(task: NotificationTask) {
  return task.reminderAt ?? task.dueAt;
}

function notificationBody(task: NotificationTask) {
  if (!task.reminderAt || !task.dueAt) {
    return task.reminderAt
      ? "Görev için belirlediğiniz hatırlatma zamanı geldi."
      : "Görevin son tarihi geldi.";
  }

  const dueDate = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(task.dueAt));
  return `Hatırlatma zamanı geldi. Son tarih: ${dueDate}`;
}

async function showTaskNotification(task: NotificationTask) {
  const options: NotificationOptions = {
    body: notificationBody(task),
    tag: `rdm-task-${task.id}`,
    data: { url: "/yonetim/gorevler" },
  };

  await showBrowserNotification(task.title, options);
}

async function fetchNotificationTasks(): Promise<NotificationTask[]> {
  const response = await fetch("/api/yonetim/gorevler", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) return [];

  const value = await response.json() as TasksResponse;
  return Array.isArray(value.tasks) ? value.tasks : [];
}

export default function TaskNotificationScheduler() {
  useEffect(() => {
    if (!window.isSecureContext || !("Notification" in window)) return;

    let disposed = false;
    let checking = false;
    const registrationPromise = getNotificationRegistration().catch(() => null);

    const checkTasks = async () => {
      if (disposed || checking || Notification.permission !== "granted") return;
      checking = true;

      try {
        const now = Date.now();
        const sent = readSentNotifications();
        const validKeys = new Set<string>();
        await registrationPromise;
        const tasks = await fetchNotificationTasks();

        for (const task of tasks) {
          const scheduledAt = notificationTime(task);
          if (!scheduledAt) continue;

          const key = `${task.id}:${scheduledAt}`;
          validKeys.add(key);
          if (sent.has(key)) continue;

          const scheduledTime = new Date(scheduledAt).getTime();
          if (!Number.isFinite(scheduledTime) || scheduledTime > now) continue;

          if (scheduledTime < now - NOTIFICATION_GRACE_PERIOD_MS) {
            sent.add(key);
            continue;
          }

          try {
            await showTaskNotification(task);
            sent.add(key);
          } catch {
            // Bir sonraki kontrolde yeniden denenecek.
          }
        }

        const currentKeys = new Set([...sent].filter((key) => validKeys.has(key)));
        writeSentNotifications(currentKeys);
      } finally {
        checking = false;
      }
    };

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") void checkTasks();
    };
    const checkAfterPermission = () => void checkTasks();

    void checkTasks();
    const interval = window.setInterval(() => void checkTasks(), CHECK_INTERVAL_MS);
    window.addEventListener("focus", checkAfterPermission);
    window.addEventListener("rdm:notification-permission-change", checkAfterPermission);
    document.addEventListener("visibilitychange", checkWhenVisible);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", checkAfterPermission);
      window.removeEventListener("rdm:notification-permission-change", checkAfterPermission);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, []);

  return null;
}

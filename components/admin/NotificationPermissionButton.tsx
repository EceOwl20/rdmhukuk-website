"use client";

import { useEffect, useState } from "react";
import { FiBell, FiBellOff, FiCheckCircle } from "react-icons/fi";

import { showBrowserNotification } from "@/lib/browser-notifications";

type NotificationState =
  | NotificationPermission
  | "checking"
  | "unsupported"
  | "insecure"
  | "error";

function readNotificationState(): NotificationState {
  if (!window.isSecureContext) return "insecure";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export default function NotificationPermissionButton() {
  const [permission, setPermission] = useState<NotificationState>("checking");
  const [isRequesting, setIsRequesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    const refreshPermission = () => setPermission(readNotificationState());
    refreshPermission();
    window.addEventListener("focus", refreshPermission);
    return () => window.removeEventListener("focus", refreshPermission);
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window) || !window.isSecureContext) {
      setPermission(readNotificationState());
      return;
    }

    setIsRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      window.dispatchEvent(new Event("rdm:notification-permission-change"));
    } catch {
      setPermission("error");
    } finally {
      setIsRequesting(false);
    }
  };

  const sendTestNotification = async () => {
    setTestResult("sending");
    try {
      await showBrowserNotification("RDM Hukuk bildirim testi", {
        body: "Görev bildirimleri bu tarayıcıda çalışıyor.",
        tag: "rdm-notification-test",
        data: { url: "/yonetim/gorevler" },
      });
      setTestResult("sent");
    } catch {
      setTestResult("error");
    }
  };

  if (permission === "granted") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <div className="flex items-center gap-3">
          <FiCheckCircle className="shrink-0 text-xl" />
          <span>
            <strong className="block font-bold">Bildirimler açık</strong>
            <span className="text-xs text-emerald-700">Bu tarayıcı görev bildirimlerine hazır.</span>
          </span>
        </div>
        <button
          type="button"
          onClick={sendTestNotification}
          disabled={testResult === "sending"}
          className="mt-3 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800 disabled:opacity-60"
        >
          {testResult === "sending"
            ? "Test bildirimi gönderiliyor…"
            : testResult === "sent"
              ? "Test bildirimi gönderildi"
              : testResult === "error"
                ? "Gönderilemedi, tekrar dene"
                : "Test bildirimi gönder"}
        </button>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex min-h-12 items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <FiBellOff className="shrink-0 text-xl" />
        <span>
          <strong className="block font-bold">Bildirimler engellendi</strong>
          <span className="text-xs text-amber-800">Açmak için tarayıcının site izinlerini kullanın.</span>
        </span>
      </div>
    );
  }

  if (permission === "unsupported" || permission === "insecure") {
    return (
      <div className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <FiBellOff className="shrink-0 text-xl" />
        <span>
          <strong className="block font-bold text-slate-700">Bildirim kullanılamıyor</strong>
          <span className="text-xs">
            {permission === "insecure"
              ? "Bildirim izni için güvenli HTTPS bağlantısı gerekir."
              : "Bu tarayıcı bildirim özelliğini desteklemiyor."}
          </span>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={requestPermission}
      disabled={permission === "checking" || isRequesting}
      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#152741] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#203b61] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      <FiBell className="text-xl text-[#EFB059]" />
      {permission === "checking" || isRequesting
        ? "Bildirim izni kontrol ediliyor…"
        : permission === "error"
          ? "Bildirim iznini tekrar dene"
          : "Bildirimlere izin ver"}
    </button>
  );
}

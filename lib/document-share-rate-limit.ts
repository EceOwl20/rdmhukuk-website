import "server-only";

import { createHash } from "node:crypto";

const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_REQUEST_LIMIT = 20;
const GLOBAL_WINDOW_MS = 60 * 1000;
const GLOBAL_REQUEST_LIMIT = 300;
const MAX_TRACKED_IPS = 5_000;
const PIN_WINDOW_MS = 15 * 60 * 1000;
const PIN_FAILURE_LIMIT = 5;
const MAX_TRACKED_PIN_KEYS = 5_000;

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

// Sayaçlar yalnızca çalışan sunucu süreci boyunca bellekte tutulur.
const attemptsByIp = new Map<string, number[]>();
const pinFailures = new Map<string, number[]>();
let globalAttempts: number[] = [];

function normalizeIp(ip: string) {
  return ip.trim().toLocaleLowerCase("en-US").slice(0, 180) || "unknown";
}

function pinAttemptKey(ip: string, token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return `${normalizeIp(ip)}:${tokenHash}`;
}

function recentAttempts(attempts: number[], earliest: number) {
  return attempts.filter(
    (createdAt) => createdAt > earliest && createdAt <= Date.now(),
  );
}

function retryAfterSeconds(
  attempts: number[],
  windowMs: number,
  now: number,
) {
  const oldestAttempt = Math.min(...attempts);
  return Math.max(1, Math.ceil((oldestAttempt + windowMs - now) / 1000));
}

function cleanExpiredIpEntries(now: number) {
  for (const [ip, attempts] of attemptsByIp) {
    const recent = recentAttempts(attempts, now - IP_WINDOW_MS);

    if (recent.length === 0) attemptsByIp.delete(ip);
    else attemptsByIp.set(ip, recent);
  }
}

function cleanExpiredPinEntries(now: number) {
  for (const [key, failures] of pinFailures) {
    const recent = recentAttempts(failures, now - PIN_WINDOW_MS);

    if (recent.length === 0) pinFailures.delete(key);
    else pinFailures.set(key, recent);
  }
}

export function checkDocumentShareRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const normalizedIp = normalizeIp(ip);

  globalAttempts = recentAttempts(globalAttempts, now - GLOBAL_WINDOW_MS);

  if (globalAttempts.length >= GLOBAL_REQUEST_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: retryAfterSeconds(
        globalAttempts,
        GLOBAL_WINDOW_MS,
        now,
      ),
    };
  }

  if (attemptsByIp.size >= MAX_TRACKED_IPS && !attemptsByIp.has(normalizedIp)) {
    cleanExpiredIpEntries(now);
  }

  if (attemptsByIp.size >= MAX_TRACKED_IPS && !attemptsByIp.has(normalizedIp)) {
    return { allowed: false, retryAfterSeconds: 60 };
  }

  const ipAttempts = recentAttempts(
    attemptsByIp.get(normalizedIp) ?? [],
    now - IP_WINDOW_MS,
  );

  if (ipAttempts.length >= IP_REQUEST_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: retryAfterSeconds(ipAttempts, IP_WINDOW_MS, now),
    };
  }

  ipAttempts.push(now);
  attemptsByIp.set(normalizedIp, ipAttempts);
  globalAttempts.push(now);

  return { allowed: true };
}

export function checkDocumentSharePinRateLimit(
  ip: string,
  token: string,
): RateLimitResult {
  const now = Date.now();
  const key = pinAttemptKey(ip, token);

  if (pinFailures.size >= MAX_TRACKED_PIN_KEYS && !pinFailures.has(key)) {
    cleanExpiredPinEntries(now);
  }

  if (pinFailures.size >= MAX_TRACKED_PIN_KEYS && !pinFailures.has(key)) {
    return { allowed: false, retryAfterSeconds: 60 };
  }

  const failures = recentAttempts(
    pinFailures.get(key) ?? [],
    now - PIN_WINDOW_MS,
  );

  if (failures.length >= PIN_FAILURE_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: retryAfterSeconds(failures, PIN_WINDOW_MS, now),
    };
  }

  failures.push(now);
  pinFailures.set(key, failures);

  return { allowed: true };
}

export function clearDocumentSharePinFailures(ip: string, token: string) {
  pinFailures.delete(pinAttemptKey(ip, token));
}

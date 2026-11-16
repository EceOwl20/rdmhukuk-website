import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const RATE_LIMIT_VERSION = 1 as const;
const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const IP_TEN_MINUTE_LIMIT = 3;
const EMAIL_TEN_MINUTE_LIMIT = 2;
const IP_DAILY_LIMIT = 15;

const storageRoot = path.resolve(
  process.env.CONTENT_STORAGE_PATH || path.join(process.cwd(), "uploads"),
);
const dataDirectory = path.join(storageRoot, "data");
const rateLimitFile = path.join(dataDirectory, "contact-rate-limits.json");

type ContactAttempt = {
  ipHash: string;
  emailHash: string;
  createdAt: number;
};

type ContactRateLimitStore = {
  version: typeof RATE_LIMIT_VERSION;
  attempts: ContactAttempt[];
};

type ContactRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

let rateLimitMutationQueue: Promise<void> = Promise.resolve();

function runRateLimitMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = rateLimitMutationQueue.then(operation, operation);
  rateLimitMutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function isContactAttempt(value: unknown): value is ContactAttempt {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.ipHash === "string" &&
    typeof candidate.emailHash === "string" &&
    typeof candidate.createdAt === "number" &&
    Number.isFinite(candidate.createdAt)
  );
}

function parseStore(value: unknown): ContactRateLimitStore {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("İletişim rate limit dosyasının biçimi geçersiz.");
  }

  const candidate = value as Record<string, unknown>;
  if (
    candidate.version !== RATE_LIMIT_VERSION ||
    !Array.isArray(candidate.attempts) ||
    !candidate.attempts.every(isContactAttempt)
  ) {
    throw new Error("İletişim rate limit dosyasının biçimi geçersiz.");
  }

  return {
    version: RATE_LIMIT_VERSION,
    attempts: candidate.attempts,
  };
}

async function readStore(): Promise<ContactRateLimitStore> {
  try {
    const storedValue: unknown = JSON.parse(await readFile(rateLimitFile, "utf8"));
    return parseStore(storedValue);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { version: RATE_LIMIT_VERSION, attempts: [] };
    }
    throw error;
  }
}

async function writeStore(store: ContactRateLimitStore): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryPath = `${rateLimitFile}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await rename(temporaryPath, rateLimitFile);
}

function rateLimitSecret(): string {
  const configuredSecret =
    process.env.CONTACT_RATE_LIMIT_SECRET || process.env.SESSION_SECRET;

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "rdm-local-contact-rate-limit-secret-2026";
  }

  throw new Error(
    "CONTACT_RATE_LIMIT_SECRET veya en az 32 karakterlik SESSION_SECRET tanımlı değil.",
  );
}

function hashIdentifier(kind: "ip" | "email", value: string): string {
  return createHmac("sha256", rateLimitSecret())
    .update(`contact-rate-limit:${kind}:${value}`)
    .digest("base64url");
}

function retryAfterSeconds(attempts: ContactAttempt[], windowMs: number, now: number) {
  const oldestAttempt = Math.min(...attempts.map((attempt) => attempt.createdAt));
  return Math.max(1, Math.ceil((oldestAttempt + windowMs - now) / 1000));
}

export async function checkContactRateLimit({
  ip,
  email,
}: {
  ip: string;
  email: string;
}): Promise<ContactRateLimitResult> {
  const normalizedIp = ip.trim().toLocaleLowerCase("en-US").slice(0, 180) || "unknown";
  const normalizedEmail = email.trim().toLocaleLowerCase("en-US");
  const ipHash = hashIdentifier("ip", normalizedIp);
  const emailHash = hashIdentifier("email", normalizedEmail);

  return runRateLimitMutation(async () => {
    const now = Date.now();
    const store = await readStore();
    const recentAttempts = store.attempts.filter(
      (attempt) => attempt.createdAt > now - ONE_DAY_MS && attempt.createdAt <= now,
    );
    const lastTenMinutes = recentAttempts.filter(
      (attempt) => attempt.createdAt > now - TEN_MINUTES_MS,
    );
    const ipTenMinuteAttempts = lastTenMinutes.filter(
      (attempt) => attempt.ipHash === ipHash,
    );
    const emailTenMinuteAttempts = lastTenMinutes.filter(
      (attempt) => attempt.emailHash === emailHash,
    );
    const ipDailyAttempts = recentAttempts.filter(
      (attempt) => attempt.ipHash === ipHash,
    );

    const retryWindows: number[] = [];
    if (ipTenMinuteAttempts.length >= IP_TEN_MINUTE_LIMIT) {
      retryWindows.push(retryAfterSeconds(ipTenMinuteAttempts, TEN_MINUTES_MS, now));
    }
    if (emailTenMinuteAttempts.length >= EMAIL_TEN_MINUTE_LIMIT) {
      retryWindows.push(retryAfterSeconds(emailTenMinuteAttempts, TEN_MINUTES_MS, now));
    }
    if (ipDailyAttempts.length >= IP_DAILY_LIMIT) {
      retryWindows.push(retryAfterSeconds(ipDailyAttempts, ONE_DAY_MS, now));
    }

    if (retryWindows.length) {
      if (recentAttempts.length !== store.attempts.length) {
        await writeStore({ version: RATE_LIMIT_VERSION, attempts: recentAttempts });
      }
      return {
        allowed: false,
        retryAfterSeconds: Math.max(...retryWindows),
      };
    }

    recentAttempts.push({ ipHash, emailHash, createdAt: now });
    await writeStore({ version: RATE_LIMIT_VERSION, attempts: recentAttempts });
    return { allowed: true };
  });
}

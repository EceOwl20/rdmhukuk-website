import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "rdm_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const DEVELOPMENT_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  secret: "rdm-local-development-session-secret-2026",
};

function getCredentials() {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return {
    username:
      process.env.ADMIN_USERNAME ||
      (isDevelopment ? DEVELOPMENT_CREDENTIALS.username : undefined),
    password:
      process.env.ADMIN_PASSWORD ||
      (isDevelopment ? DEVELOPMENT_CREDENTIALS.password : undefined),
    secret:
      process.env.SESSION_SECRET ||
      (isDevelopment ? DEVELOPMENT_CREDENTIALS.secret : undefined),
  };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function isAdminConfigured() {
  const { username, password, secret } = getCredentials();
  return Boolean(username && password && secret && secret.length >= 32);
}

export function validateAdminCredentials(username: string, password: string) {
  const credentials = getCredentials();
  if (!credentials.username || !credentials.password || !credentials.secret) return false;
  return safeEqual(username, credentials.username) && safeEqual(password, credentials.password);
}

export async function createAdminSession() {
  const { secret } = getCredentials();
  if (!secret) throw new Error("SESSION_SECRET tanımlı değil.");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = `admin.${expiresAt}`;
  const token = `${payload}.${sign(payload, secret)}`;
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
}

export async function deleteAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const { secret } = getCredentials();
  if (!token || !secret) return false;
  const [role, expiresAt, signature] = token.split(".");
  await io();
  if (role !== "admin" || !expiresAt || !signature || Number(expiresAt) <= Date.now() / 1000) return false;
  return safeEqual(signature, sign(`${role}.${expiresAt}`, secret));
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/yonetim/giris");
}

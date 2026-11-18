
import { NextResponse } from "next/server";
import path from "node:path";

import { getDocumentByShareToken } from "@/lib/content-store";
import {
  checkDocumentSharePinRateLimit,
  checkDocumentShareRateLimit,
  clearDocumentSharePinFailures,
} from "@/lib/document-share-rate-limit";
import type { StoredDocument } from "@/lib/site-content-types";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

const SECURITY_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy":
    "default-src 'none'; frame-ancestors 'none'",
};

function unavailableResponse() {
  return new NextResponse("Belge bulunamadı veya bağlantı geçersiz.", {
    status: 404,
    headers: SECURITY_HEADERS,
  });
}

function clientIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    forwardedFor ||
    "unknown"
  ).trim();
}

function rateLimitedResponse(retryAfterSeconds: number) {
  return new NextResponse("Çok fazla istek gönderildi.", {
    status: 429,
    headers: {
      ...SECURITY_HEADERS,
      "Retry-After": String(retryAfterSeconds),
    },
  });
}

function pinPageResponse(invalidPin = false) {
  const errorMessage = invalidPin
    ? '<p class="error" role="alert">PIN hatalı. Lütfen tekrar deneyin.</p>'
    : "";

  const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Belge PIN Doğrulaması</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f4f6f9; color: #152741; font-family: Arial, sans-serif; }
      main { width: min(100%, 420px); border: 1px solid #dbe2ea; border-radius: 18px; background: #fff; padding: 28px; box-shadow: 0 16px 45px rgba(21, 39, 65, .12); }
      .eyebrow { margin: 0 0 10px; color: #b87822; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      h1 { margin: 0; font-size: 24px; }
      .description { margin: 12px 0 22px; color: #64748b; font-size: 14px; line-height: 1.7; }
      label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 700; }
      input { width: 100%; min-height: 48px; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 14px; font-size: 20px; letter-spacing: .35em; text-align: center; outline: none; }
      input:focus { border-color: #d79b43; box-shadow: 0 0 0 3px rgba(215, 155, 67, .15); }
      button { width: 100%; min-height: 48px; margin-top: 14px; border: 0; border-radius: 10px; background: #152741; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
      .error { margin: 0 0 14px; border-radius: 9px; background: #fef2f2; padding: 10px 12px; color: #b91c1c; font-size: 13px; }
      .notice { margin: 16px 0 0; color: #94a3b8; font-size: 11px; line-height: 1.6; text-align: center; }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Güvenli belge paylaşımı</p>
      <h1>PIN doğrulaması</h1>
      <p class="description">Bu belge PIN ile korunuyor. Belgeyi indirmek için sizinle ayrıca paylaşılan 6 haneli PIN'i girin.</p>
      ${errorMessage}
      <form method="post" autocomplete="off">
        <label for="pin">Belge PIN'i</label>
        <input id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="one-time-code" required autofocus>
        <button type="submit">Belgeyi indir</button>
      </form>
      <p class="notice">PIN'i bilmiyorsanız bağlantıyı gönderen kişiyle iletişime geçin.</p>
    </main>
  </body>
</html>`;

  return new NextResponse(html, {
    status: invalidPin ? 401 : 200,
    headers: {
      ...SECURITY_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}

function encodeRFC5987(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function downloadResponse(document: StoredDocument, buffer: Buffer) {
  const extension = path.extname(document.storedName).toLowerCase();
  const encodedName = encodeRFC5987(document.name);
  const contentDisposition =
    `attachment; filename="belge${extension}"; ` +
    `filename*=UTF-8''${encodedName}`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      ...SECURITY_HEADERS,
      "Content-Type": "application/octet-stream",
      "Content-Disposition": contentDisposition,
      "Content-Length": String(buffer.length),
    },
  });
}

function isValidToken(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}

async function readPin(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return null;
  }

  const reader = request.body?.getReader();
  if (!reader) return null;

  const decoder = new TextDecoder();
  let byteLength = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteLength += value.byteLength;
    if (byteLength > 4_096) {
      await reader.cancel();
      return null;
    }

    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  const pins = new URLSearchParams(body).getAll("pin");

  return pins.length === 1 ? pins[0].trim() : null;
}

export async function GET(
  request: Request,
  { params }: Props,
) {
  try {
    const rateLimit = checkDocumentShareRateLimit(clientIpAddress(request));

    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit.retryAfterSeconds);
    }

    const { token } = await params;

    if (typeof token !== "string" || !isValidToken(token)) {
      return unavailableResponse();
    }

    const result = await getDocumentByShareToken(token);

    if (!result) {
      return unavailableResponse();
    }

    if (result.status === "requires-pin") return pinPageResponse();
    if (result.status !== "ready") return unavailableResponse();

    return downloadResponse(result.document, result.buffer);
  } catch (error) {
    // Token veya belge içeriği loglara yazılmamalı.
    console.error(
      "Belge paylaşım erişimi başarısız:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return unavailableResponse();
  }
}

export async function POST(request: Request, { params }: Props) {
  try {
    const ip = clientIpAddress(request);
    const rateLimit = checkDocumentShareRateLimit(ip);

    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit.retryAfterSeconds);
    }

    const { token } = await params;

    if (typeof token !== "string" || !isValidToken(token)) {
      return unavailableResponse();
    }

    const pinRateLimit = checkDocumentSharePinRateLimit(ip, token);

    if (!pinRateLimit.allowed) {
      return rateLimitedResponse(pinRateLimit.retryAfterSeconds);
    }

    const pin = await readPin(request);
    if (pin === null) return unavailableResponse();

    const result = await getDocumentByShareToken(token, pin);

    if (!result) return unavailableResponse();

    if (result.status === "invalid-pin" || result.status === "requires-pin") {
      return pinPageResponse(true);
    }

    clearDocumentSharePinFailures(ip, token);
    return downloadResponse(result.document, result.buffer);
  } catch (error) {
    console.error(
      "Belge PIN doğrulaması başarısız:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return unavailableResponse();
  }
}

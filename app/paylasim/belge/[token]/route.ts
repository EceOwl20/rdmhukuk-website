
import { NextResponse } from "next/server";
import path from "node:path";

import { getDocumentByShareToken } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function encodeRFC5987(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export async function GET(
  _request: Request,
  { params }: Props,
) {
  try {
    const { token } = await params;

    if (
      typeof token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(token)
    ) {
      return unavailableResponse();
    }

    const result = await getDocumentByShareToken(token);

    if (!result) {
      return unavailableResponse();
    }

    const { document, buffer } = result;

    // Güvenli ASCII dosya adı için izin verilen uzantıyı kullan.
    const extension = path.extname(
      document.storedName,
    ).toLowerCase();

    // Dosya adını HTTP başlığında güvenli biçimde kodla.
    const encodedName = encodeRFC5987(document.name);

    const contentDisposition =
      `attachment; filename="belge${extension}"; ` +
      `filename*=UTF-8''${encodedName}`;

    return new NextResponse(
      new Uint8Array(buffer),
      {
        status: 200,
        headers: {
          ...SECURITY_HEADERS,
          "Content-Type": "application/octet-stream",
          "Content-Disposition": contentDisposition,
          "Content-Length": String(buffer.length),
        },
      },
    );
  } catch (error) {
    // Token veya belge içeriği loglara yazılmamalı.
    console.error(
      "Belge paylaşım erişimi başarısız:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return unavailableResponse();
  }
}

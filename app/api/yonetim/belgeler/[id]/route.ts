
import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  getDocumentFile,
} from "@/lib/content-store";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  // Her istekte oturum kontrolü.
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return new Response("Yetkisiz erişim.", {
      status: 401,
      headers: privateHeaders,
    });
  }

  const { id } = await params;

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    return new Response("Belge bulunamadı.", {
      status: 404,
      headers: privateHeaders,
    });
  }

  let result;

  try {
    result = await getDocumentFile(id);
  } catch (error) {
    console.error("Belge okuma hatası:", error);

    return new Response("Belge okunamadı.", {
      status: 500,
      headers: privateHeaders,
    });
  }

  if (!result) {
    return new Response("Belge bulunamadı.", {
      status: 404,
      headers: privateHeaders,
    });
  }

  const wantsPreview =
    new URL(request.url).searchParams.get("goruntule") === "1";

  const isPdf =
    result.buffer.subarray(0, 5).toString("ascii") === "%PDF-";

  if (wantsPreview && !isPdf) {
    return new Response(
      "Bu dosya PDF olarak önizlenemiyor.",
      {
        status: 415,
        headers: privateHeaders,
      },
    );
  }

  const encodedName = encodeURIComponent(
    result.document.name,
  );

  return new Response(result.buffer, {
    headers: {
      ...privateHeaders,

      "Content-Type": isPdf
        ? "application/pdf"
        : "application/octet-stream",

      "Content-Disposition": `${
        wantsPreview ? "inline" : "attachment"
      }; filename*=UTF-8''${encodedName}`,

      "Content-Length": String(result.buffer.length),
    },
  });
}

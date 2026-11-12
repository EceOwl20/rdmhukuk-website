import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDocumentFile } from "@/lib/content-store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return new Response("Yetkisiz erişim.", { status: 401 });
  const { id } = await params;
  const result = await getDocumentFile(id);
  if (!result) return new Response("Belge bulunamadı.", { status: 404 });
  const wantsPreview = new URL(request.url).searchParams.get("goruntule") === "1";
  const isPdf = result.buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (wantsPreview && !isPdf) {
    return new Response("Bu dosya PDF olarak önizlenemiyor.", { status: 415 });
  }
  const encodedName = encodeURIComponent(result.document.name);
  return new Response(result.buffer, {
    headers: {
      "Content-Type": isPdf ? "application/pdf" : result.document.mimeType,
      "Content-Disposition": `${wantsPreview ? "inline" : "attachment"}; filename*=UTF-8''${encodedName}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

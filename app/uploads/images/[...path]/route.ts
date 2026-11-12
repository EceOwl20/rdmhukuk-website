import { getPublicImageFile } from "@/lib/content-store";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const file = await getPublicImageFile(path);
  if (!file) return new Response("Dosya bulunamadı.", { status: 404 });
  const extension = path.at(-1)?.split(".").pop()?.toLowerCase() ?? "";
  return new Response(file, {
    headers: {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

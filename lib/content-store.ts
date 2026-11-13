import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import { defaultSiteContent } from "@/lib/default-site-content";
import { AdminFormError } from "@/lib/admin-form-error";
import type { SiteContent, StoredDocument, StoredImage } from "@/lib/site-content-types";

const storageRoot = path.resolve(
  process.env.CONTENT_STORAGE_PATH || path.join(process.cwd(), "uploads"),
);
const dataDirectory = path.join(storageRoot, "data");
const imagesDirectory = path.join(storageRoot, "images");
const documentsDirectory = path.join(storageRoot, "documents");
const publicImagesDirectory = path.join(process.cwd(), "public", "images");
const contentFile = path.join(dataDirectory, "content.json");
const documentsFile = path.join(dataDirectory, "documents.json");
const imagesFile = path.join(dataDirectory, "images.json");

async function ensureStorage() {
  await Promise.all([
    mkdir(dataDirectory, { recursive: true }),
    mkdir(imagesDirectory, { recursive: true }),
    mkdir(documentsDirectory, { recursive: true }),
  ]);
}

async function writeJsonAtomic(filePath: string, value: unknown) {
  await ensureStorage();
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("days");
  cacheTag("site-content");

  try {
    return JSON.parse(await readFile(contentFile, "utf8")) as SiteContent;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("İçerik dosyası okunamadı:", error);
    }
    return structuredClone(defaultSiteContent);
  }
}

export async function writeSiteContent(content: SiteContent) {
  await writeJsonAtomic(contentFile, content);
}

export async function getDocuments(): Promise<StoredDocument[]> {
  try {
    return JSON.parse(await readFile(documentsFile, "utf8")) as StoredDocument[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Belge listesi okunamadı:", error);
    }
    return [];
  }
}

export async function getImages(): Promise<StoredImage[]> {
  await ensureStorage();
  let savedImages: StoredImage[] = [];
  try {
    savedImages = JSON.parse(await readFile(imagesFile, "utf8")) as StoredImage[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Görsel listesi okunamadı:", error);
    }
  }

  const savedNames = new Set(savedImages.map((image) => image.storedName));
  const orphanNames = (await readdir(imagesDirectory)).filter((name) => !savedNames.has(name));
  const orphanImages = await Promise.all(orphanNames.map(async (storedName): Promise<StoredImage> => {
    const fileStat = await stat(path.join(imagesDirectory, storedName));
    const extension = path.extname(storedName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };
    return {
      id: storedName,
      name: storedName,
      storedName,
      mimeType: mimeTypes[extension] || "application/octet-stream",
      size: fileStat.size,
      createdAt: fileStat.birthtime.toISOString(),
      url: `/uploads/images/${storedName}`,
      source: "upload",
    };
  }));

  async function readSiteImages(directory: string, relativeDirectory = ""): Promise<StoredImage[]> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return [];
    }
    const nested = await Promise.all(entries.map(async (entry): Promise<StoredImage[]> => {
      const relativeName = path.posix.join(relativeDirectory, entry.name);
      const absoluteName = path.join(directory, entry.name);
      if (entry.isDirectory()) return readSiteImages(absoluteName, relativeName);
      const extension = path.extname(entry.name).toLowerCase();
      const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
      };
      if (!mimeTypes[extension]) return [];
      const fileStat = await stat(absoluteName);
      return [{
        id: `site-${relativeName}`,
        name: relativeName,
        storedName: relativeName,
        mimeType: mimeTypes[extension],
        size: fileStat.size,
        createdAt: fileStat.birthtime.toISOString(),
        url: `/images/${relativeName}`,
        source: "site",
      }];
    }));
    return nested.flat();
  }

  const siteImages = await readSiteImages(publicImagesDirectory);
  return [
    ...savedImages.map((image) => ({ ...image, source: image.source || "upload" as const })),
    ...orphanImages,
    ...siteImages,
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function saveImage(file: File): Promise<string> {
  const allowedTypes = new Map([
    ["image/jpeg", ".jpg"],
    ["image/png", ".png"],
    ["image/webp", ".webp"],
    ["image/gif", ".gif"],
  ]);
  const extension = allowedTypes.get(file.type);
  if (!extension) throw new AdminFormError("Yalnızca JPG, PNG, WebP veya GIF yüklenebilir.");
  if (file.size > 8 * 1024 * 1024) throw new AdminFormError("Görsel en fazla 8 MB olabilir.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const existing = (await getImages()).find((image) => image.sha256 === sha256);
  if (existing) return existing.url;

  await ensureStorage();
  const storedName = `${randomUUID()}${extension}`;
  const url = `/uploads/images/${storedName}`;
  await writeFile(path.join(imagesDirectory, storedName), buffer);
  const images = await getImages();
  const image: StoredImage = {
    id: randomUUID(),
    name: file.name.slice(0, 180),
    storedName,
    mimeType: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
    url,
    sha256,
    source: "upload",
  };
  await writeJsonAtomic(imagesFile, [
    image,
    ...images.filter((item) => item.source !== "site" && item.storedName !== storedName),
  ]);
  return url;
}

export async function addDocument(file: File): Promise<StoredDocument> {
  if (!file.size) throw new AdminFormError("Belge seçilmedi.");
  if (file.size > 25 * 1024 * 1024) throw new AdminFormError("Belge en fazla 25 MB olabilir.");

  const safeExtension = path.extname(file.name).toLocaleLowerCase("tr-TR").replace(/[^.a-z0-9]/g, "").slice(0, 10);
  const document: StoredDocument = {
    id: randomUUID(),
    name: file.name.slice(0, 180),
    storedName: `${randomUUID()}${safeExtension}`,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    createdAt: new Date().toISOString(),
  };

  await ensureStorage();
  await writeFile(path.join(documentsDirectory, document.storedName), Buffer.from(await file.arrayBuffer()));
  const documents = await getDocuments();
  documents.unshift(document);
  await writeJsonAtomic(documentsFile, documents);
  return document;
}

export async function deleteDocumentById(id: string) {
  const documents = await getDocuments();
  const document = documents.find((item) => item.id === id);
  if (!document) return;
  await unlink(path.join(documentsDirectory, document.storedName)).catch(() => undefined);
  await writeJsonAtomic(documentsFile, documents.filter((item) => item.id !== id));
}

export async function getDocumentFile(id: string) {
  const document = (await getDocuments()).find((item) => item.id === id);
  if (!document) return null;
  return { document, buffer: await readFile(path.join(documentsDirectory, document.storedName)) };
}

export async function getPublicImageFile(segments: string[]) {
  if (segments.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment))) return null;
  const requestedPath = path.resolve(imagesDirectory, ...segments);
  if (!requestedPath.startsWith(`${imagesDirectory}${path.sep}`)) return null;
  try {
    return await readFile(requestedPath);
  } catch {
    return null;
  }
}

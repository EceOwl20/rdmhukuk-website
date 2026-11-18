import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import {
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rmdir,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import { defaultSiteContent } from "@/lib/default-site-content";
import { AdminFormError } from "@/lib/admin-form-error";
import type {
  ActiveDocumentShare,
  SiteContent,
  StoredDocument,
  StoredDocumentShare,
  StoredImage,
} from "@/lib/site-content-types";
import { constants } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import sharp from "sharp";

const storageRoot = path.resolve(
  process.env.CONTENT_STORAGE_PATH || path.join(process.cwd(), "uploads"),
);
const dataDirectory = path.join(storageRoot, "data");
const imagesDirectory = path.join(storageRoot, "images");
const documentsDirectory = path.join(storageRoot, "documents");
const publicImagesDirectory = path.join(process.cwd(), "public", "images");
const contentFile = path.join(dataDirectory, "content.json");
const documentsFile = path.join(dataDirectory, "documents.json");
const documentSharesFile = path.join(dataDirectory, "document-shares.json");
const imagesFile = path.join(dataDirectory, "images.json");

type JsonValidator<T> = (value: unknown) => value is T;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "string";
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isTitledItem(value: unknown, idType: "string" | "number") {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === idType &&
    hasString(value, "title") &&
    hasString(value, "description")
  );
}

function isBlogBlock(value: unknown) {
  if (!isRecord(value)) return false;

  if (typeof value.type === "string") {
    if (value.type === "heading" || value.type === "paragraph") {
      return hasString(value, "text");
    }
    if (value.type === "list") return isStringArray(value.items);
    if (value.type === "image") {
      return hasString(value, "src") && hasString(value, "alt");
    }
    return false;
  }

  return (
    (value.heading === undefined || typeof value.heading === "string") &&
    isStringArray(value.paragraphs)
  );
}

function isBlogPost(value: unknown) {
  if (!isRecord(value)) return false;
  return (
    hasString(value, "id") &&
    hasString(value, "slug") &&
    hasString(value, "title") &&
    hasString(value, "excerpt") &&
    hasString(value, "category") &&
    hasString(value, "author") &&
    (value.publishedAt === undefined ||
      typeof value.publishedAt === "string") &&
    (value.coverImage === undefined || typeof value.coverImage === "string") &&
    Array.isArray(value.content) &&
    value.content.every(isBlogBlock)
  );
}

function isSiteContent(value: unknown): value is SiteContent {
  if (!isRecord(value)) return false;
  const { home, contact, blog } = value;
  if (!isRecord(home) || !isRecord(contact) || !isRecord(blog)) return false;

  const { about, staff } = home;
  if (!isRecord(about) || !isRecord(staff) || !isRecord(about.lawyer)) {
    return false;
  }

  return (
    Array.isArray(home.heroSlides) &&
    home.heroSlides.every((item) => isTitledItem(item, "number")) &&
    hasString(home, "heroDesktopImage") &&
    hasString(home, "heroMobileImage") &&
    hasString(home, "servicesTitle") &&
    hasString(home, "servicesIntro") &&
    Array.isArray(home.services) &&
    home.services.every((item) => isTitledItem(item, "string")) &&
    Array.isArray(home.serviceSlides) &&
    home.serviceSlides.every((item) => isTitledItem(item, "string")) &&
    hasString(about, "title") &&
    isStringArray(about.paragraphs) &&
    hasString(about.lawyer, "name") &&
    hasString(about.lawyer, "description") &&
    hasString(about, "desktopImage") &&
    hasString(about, "mobileImage") &&
    hasString(staff, "name") &&
    hasString(staff, "specialization") &&
    hasString(staff, "description") &&
    hasString(staff, "image") &&
    hasString(contact, "title") &&
    hasString(contact, "heroImage") &&
    hasString(contact, "phone") &&
    hasString(contact, "phoneHref") &&
    hasString(contact, "email") &&
    hasString(contact, "emailHref") &&
    hasString(contact, "location") &&
    hasString(contact, "address") &&
    hasString(contact, "intro") &&
    hasString(contact, "mapEmbedUrl") &&
    hasString(blog, "title") &&
    hasString(blog, "description") &&
    Array.isArray(blog.posts) &&
    blog.posts.every(isBlogPost)
  );
}

function isStoredDocument(value: unknown): value is StoredDocument {
  if (!isRecord(value)) return false;
  return (
    hasString(value, "id") &&
    hasString(value, "name") &&
    hasString(value, "storedName") &&
    hasString(value, "mimeType") &&
    typeof value.size === "number" &&
    Number.isFinite(value.size) &&
    hasString(value, "createdAt") &&
    (value.shareable === undefined ||
       typeof value.shareable === "boolean")
  );
}



function isStoredDocumentShare(
  value: unknown,
): value is StoredDocumentShare {
  if (!isRecord(value)) return false;

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4,12}$/i;

  const isValidDate = (date: unknown): date is string =>
    typeof date === "string" &&
    Number.isFinite(Date.parse(date));

  return (
    typeof value.id === "string" &&
    uuidPattern.test(value.id) &&
    typeof value.documentId === "string" &&
    uuidPattern.test(value.documentId) &&
    typeof value.tokenHash === "string" &&
    /^[a-f0-9]{64}$/.test(value.tokenHash) &&
    (value.pinHash === undefined ||
      (typeof value.pinHash === "string" &&
        /^[a-f0-9]{64}$/.test(value.pinHash))) &&
    isValidDate(value.createdAt) &&
    isValidDate(value.expiresAt) &&
    Date.parse(value.expiresAt) >
      Date.parse(value.createdAt) &&
    (value.revokedAt === undefined ||
      isValidDate(value.revokedAt))
  );
}


const isStoredDocumentShareList: JsonValidator<
  StoredDocumentShare[]
> = (value): value is StoredDocumentShare[] =>
  Array.isArray(value) &&
  value.every(isStoredDocumentShare);


function isStoredImage(value: unknown): value is StoredImage {
  if (!isRecord(value)) return false;
  return (
    hasString(value, "id") &&
    hasString(value, "name") &&
    hasString(value, "storedName") &&
    hasString(value, "mimeType") &&
    typeof value.size === "number" &&
    Number.isFinite(value.size) &&
    hasString(value, "createdAt") &&
    hasString(value, "url") &&
    (value.sha256 === undefined || typeof value.sha256 === "string") &&
    (value.source === undefined ||
      value.source === "upload" ||
      value.source === "site")
  );
}

const isStoredDocumentList: JsonValidator<StoredDocument[]> = (
  value,
): value is StoredDocument[] =>
  Array.isArray(value) && value.every(isStoredDocument);

const isStoredImageList: JsonValidator<StoredImage[]> = (
  value,
): value is StoredImage[] => Array.isArray(value) && value.every(isStoredImage);

async function ensureStorage() {
  await Promise.all([
    mkdir(dataDirectory, { recursive: true }),
    mkdir(imagesDirectory, { recursive: true }),
    mkdir(documentsDirectory, { recursive: true }),
  ]);
}

async function readJsonFile<T>(
  filePath: string,
  label: string,
  validator: JsonValidator<T>,
): Promise<T | null> {
  let source: string;

  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    console.error(`${label} okunamadı:`, error);
    throw new AdminFormError(
      `${label} okunamadı. Veri kaybını önlemek için işlem durduruldu.`,
    );
  }

  try {
    const parsed: unknown = JSON.parse(source);
    if (!validator(parsed)) throw new Error("Beklenmeyen veri yapısı.");
    return parsed;
  } catch (error) {
    console.error(`${label} doğrulanamadı:`, error);
    throw new AdminFormError(
      `${label} bozuk veya beklenen biçimde değil. Veri kaybını önlemek için işlem durduruldu.`,
    );
  }
}

async function writeJsonAtomic<T>(
  filePath: string,
  value: T,
  label: string,
  validator: JsonValidator<T>,
) {
  if (!validator(value)) {
    throw new AdminFormError(
      `${label} için geçersiz veri oluşturuldu. İşlem durduruldu.`,
    );
  }

  const previousValue = await readJsonFile(filePath, label, validator);
  await ensureStorage();

  if (previousValue !== null) {
    const backupPath = `${filePath}.backup`;
    const temporaryBackupPath = `${backupPath}.${randomUUID()}.tmp`;
    await writeFile(
      temporaryBackupPath,
      `${JSON.stringify(previousValue, null, 2)}\n`,
      "utf8",
    );
    await rename(temporaryBackupPath, backupPath);
  }

  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

const CONTENT_LOCK_PATH = `${contentFile}.lock`;
const DOCUMENT_LOCK_PATH = `${documentsFile}.lock`;
const IMAGE_LOCK_PATH = `${imagesFile}.lock`;
const LOCK_OWNER_FILE = "owner";
const LOCK_STALE_AFTER_MS = 15 * 60 * 1000;
const LOCK_MAX_ATTEMPTS = 100;
const LOCK_RETRY_DELAY_MS = 100;

async function quarantineStaleLock(lockPath: string, label: string) {
  const ownerPath = path.join(lockPath, LOCK_OWNER_FILE);
  let modifiedAt: number;

  try {
    modifiedAt = (await stat(ownerPath)).mtimeMs;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") throw error;

    try {
      modifiedAt = (await stat(lockPath)).mtimeMs;
    } catch (lockError) {
      if ((lockError as NodeJS.ErrnoException).code === "ENOENT") return true;
      throw lockError;
    }
  }

  if (Date.now() - modifiedAt <= LOCK_STALE_AFTER_MS) return false;

  const stalePath = `${lockPath}.${randomUUID()}.stale`;

  try {
    await rename(lockPath, stalePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return true;
    throw error;
  }

  try {
    await unlink(path.join(stalePath, LOCK_OWNER_FILE));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`${label} eski kilit sahibi temizlenemedi:`, error);
    }
  }

  try {
    await rmdir(stalePath);
  } catch (error) {
    console.error(`${label} eski kilit karantinası temizlenemedi:`, error);
  }

  return true;
}

async function withStorageLock<T>({
  lockPath,
  label,
  busyMessage,
  operation,
}: {
  lockPath: string;
  label: string;
  busyMessage: string;
  operation: () => Promise<T>;
}): Promise<T> {
  await ensureStorage();

  const ownerToken = randomUUID();
  const ownerPath = path.join(lockPath, LOCK_OWNER_FILE);
  let locked = false;

  for (let attempt = 0; attempt < LOCK_MAX_ATTEMPTS; attempt++) {
    try {
      await mkdir(lockPath, { mode: 0o700 });

      try {
        await writeFile(ownerPath, ownerToken, {
          encoding: "utf8",
          flag: "wx",
          mode: 0o600,
        });
      } catch (error) {
        try {
          await rmdir(lockPath);
        } catch (cleanupError) {
          console.error(`${label} yarım kalan kilidi temizlenemedi:`, cleanupError);
        }

        throw error;
      }

      locked = true;
      break;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== "EEXIST") throw error;

      if (await quarantineStaleLock(lockPath, label)) continue;

      if (attempt < LOCK_MAX_ATTEMPTS - 1) {
        await sleep(LOCK_RETRY_DELAY_MS);
      }
    }
  }

  if (!locked) throw new AdminFormError(busyMessage);

  try {
    return await operation();
  } finally {
    try {
      const currentOwner = await readFile(ownerPath, "utf8");

      if (currentOwner !== ownerToken) {
        console.error(`${label} kilidi sahiplik değiştiği için kaldırılmadı.`);
      } else {
        await unlink(ownerPath);
        await rmdir(lockPath);
      }
    } catch (error) {
      console.error(`${label} kilidi kaldırılamadı:`, error);
    }
  }
}

async function withContentLock<T>(operation: () => Promise<T>): Promise<T> {
  return withStorageLock({
    lockPath: CONTENT_LOCK_PATH,
    label: "İçerik",
    busyMessage: "Site içerikleri şu anda başka bir işlem tarafından güncelleniyor.",
    operation,
  });
}

async function withDocumentLock<T>(operation: () => Promise<T>): Promise<T> {
  return withStorageLock({
    lockPath: DOCUMENT_LOCK_PATH,
    label: "Belge arşivi",
    busyMessage:
      "Belge arşivi şu anda başka bir işlem tarafından kullanılıyor. Lütfen daha sonra tekrar deneyin.",
    operation,
  });
}

async function withImageLock<T>(operation: () => Promise<T>): Promise<T> {
  return withStorageLock({
    lockPath: IMAGE_LOCK_PATH,
    label: "Görsel kütüphanesi",
    busyMessage: "Görsel kütüphanesi şu anda başka bir işlem tarafından kullanılıyor.",
    operation,
  });
}

async function readSiteContentFile(): Promise<SiteContent> {
  return (
    (await readJsonFile(contentFile, "Site içerik dosyası", isSiteContent)) ??
    structuredClone(defaultSiteContent)
  );
}

export async function updateSiteContent(
  updater: (content: SiteContent) => Promise<void> | void,
): Promise<void> {
  await withContentLock(async () => {
    const currentContent = await readSiteContentFile();
    const nextContent = structuredClone(currentContent);

    await updater(nextContent);

    // Sadece yeni eklenen görsel referanslarını belirle.
    const previousImages = getReferencedUploadedImages(currentContent);

    const nextImages = getReferencedUploadedImages(nextContent);

    const addedImages = [...nextImages].filter(
      (url) => !previousImages.has(url),
    );

    // Kilit sırası: içerik -> görsel.
    await withImageLock(async () => {
      const savedImages =
        (await readJsonFile(
          imagesFile,
          "Görsel kayıt dosyası",
          isStoredImageList,
        )) ?? [];

      for (const url of addedImages) {
        const match = url.match(
          /^\/uploads\/images\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp|gif))$/i,
        );

        if (!match) {
          throw new AdminFormError(
            "İçerikte geçersiz görsel adresi bulunuyor.",
          );
        }

        const storedName = match[1];

        const registeredImage = savedImages.find(
          (image) =>
            image.storedName === storedName &&
            image.url === url &&
            image.source !== "site",
        );

        if (!registeredImage) {
          throw new AdminFormError(
            "Seçilen görsel kütüphanede kayıtlı değil. Lütfen görseli tekrar yükleyin.",
          );
        }

        const filePath = path.resolve(imagesDirectory, storedName);

        if (path.dirname(filePath) !== imagesDirectory) {
          throw new AdminFormError("Görsel dosyasının yolu geçersiz.");
        }

        let fileInfo;

        try {
          fileInfo = await lstat(filePath);
        } catch {
          throw new AdminFormError(
            "Seçilen görsellerden biri artık mevcut değil. Lütfen görseli tekrar seçin.",
          );
        }

        if (!fileInfo.isFile() || fileInfo.isSymbolicLink()) {
          throw new AdminFormError("Seçilen görsel dosyası güvenli değil.");
        }
      }

      await writeJsonAtomic(
        contentFile,
        nextContent,
        "Site içerik dosyası",
        isSiteContent,
      );
    });
  });
}

export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("days");
  cacheTag("site-content");

  return readSiteContentFile();
}

export async function getDocuments(): Promise<StoredDocument[]> {
  return (
    (await readJsonFile(
      documentsFile,
      "Belge kayıt dosyası",
      isStoredDocumentList,
    )) ?? []
  );
}

async function getDocumentShares(): Promise<StoredDocumentShare[]> {
  return (
    (await readJsonFile(
      documentSharesFile,
      "Belge paylaşım kayıt dosyası",
      isStoredDocumentShareList,
    )) ?? []
  );
}

export async function getActiveDocumentShares(): Promise<
  ActiveDocumentShare[]
> {
  const now = Date.now();

  return (await getDocumentShares())
    .filter(
      (share) =>
        share.revokedAt === undefined && Date.parse(share.expiresAt) > now,
    )
    .map((share) => ({
      shareId: share.id,
      documentId: share.documentId,
      pinProtected: share.pinHash !== undefined,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getPublicImageFile(segments: string[]) {
  if (segments.length !== 1) return null;

  const [storedName] = segments;
  const safeStoredNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif|svg)$/i;

  if (!safeStoredNamePattern.test(storedName)) return null;

  const requestedPath = path.resolve(imagesDirectory, storedName);
  if (path.dirname(requestedPath) !== imagesDirectory) return null;

  let fileHandle;

  try {
    fileHandle = await open(
      requestedPath,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    const fileStat = await fileHandle.stat();

    if (!fileStat.isFile() || fileStat.size > MAX_IMAGE_SIZE) return null;

    return await fileHandle.readFile();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT" || code === "ENOTDIR" || code === "ELOOP") {
      return null;
    }

    throw error;
  } finally {
    await fileHandle?.close();
  }
}

export async function getImages(): Promise<StoredImage[]> {
  await ensureStorage();
  const savedImages =
    (await readJsonFile(
      imagesFile,
      "Görsel kayıt dosyası",
      isStoredImageList,
    )) ?? [];

  const savedNames = new Set(savedImages.map((image) => image.storedName));
  const safeImageNamePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/i;

  const orphanNames = (await readdir(imagesDirectory)).filter(
    (name) => !savedNames.has(name) && safeImageNamePattern.test(name),
  );

  const orphanImages = (
    await Promise.all(
      orphanNames.map(async (storedName): Promise<StoredImage | null> => {
        const filePath = path.join(imagesDirectory, storedName);

        let fileStat;

        try {
          fileStat = await lstat(filePath);
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;

          // Tarama sırasında kaldırılmış dosyayı atla.
          if (code === "ENOENT") {
            return null;
          }

          throw error;
        }

        if (!fileStat.isFile() || fileStat.isSymbolicLink()) {
          return null;
        }

        const extension = path.extname(storedName).toLowerCase();

        const mimeTypes: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".gif": "image/gif",
        };

        const mimeType = mimeTypes[extension];

        if (!mimeType) {
          return null;
        }

        return {
          id: storedName,
          name: storedName,
          storedName,
          mimeType,
          size: fileStat.size,
          createdAt: fileStat.birthtime.toISOString(),
          url: `/uploads/images/${storedName}`,
          source: "upload",
        };
      }),
    )
  ).filter((image): image is StoredImage => image !== null);

  async function readSiteImages(
    directory: string,
    relativeDirectory = "",
  ): Promise<StoredImage[]> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return [];
    }
    const nested = await Promise.all(
      entries.map(async (entry): Promise<StoredImage[]> => {
        const relativeName = path.posix.join(relativeDirectory, entry.name);
        const absoluteName = path.join(directory, entry.name);
        if (entry.isDirectory())
          return readSiteImages(absoluteName, relativeName);
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
        return [
          {
            id: `site-${relativeName}`,
            name: relativeName,
            storedName: relativeName,
            mimeType: mimeTypes[extension],
            size: fileStat.size,
            createdAt: fileStat.birthtime.toISOString(),
            url: `/images/${relativeName}`,
            source: "site",
          },
        ];
      }),
    );
    return nested.flat();
  }

  const siteImages = await readSiteImages(publicImagesDirectory);
  return [
    ...savedImages.map((image) => ({
      ...image,
      source: image.source || ("upload" as const),
    })),
    ...orphanImages,
    ...siteImages,
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function getReferencedUploadedImages(content: SiteContent): Set<string> {
  const urls = [
    content.home.heroDesktopImage,
    content.home.heroMobileImage,
    content.home.about.desktopImage,
    content.home.about.mobileImage,
    content.home.staff.image,
    content.contact.heroImage,

    ...content.blog.posts.flatMap((post) => [
      post.coverImage,
      ...post.content.flatMap((block) =>
        "type" in block && block.type === "image" ? [block.src] : [],
      ),
    ]),
  ];

  return new Set(
    urls.filter(
      (url): url is string =>
        typeof url === "string" && url.startsWith("/uploads/images/"),
    ),
  );
}


const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 24_000_000;
const MAX_IMAGE_FRAMES = 30;

const IMAGE_FORMATS = {
  "image/jpeg": {
    format: "jpeg",
    extension: ".jpg",
  },
  "image/png": {
    format: "png",
    extension: ".png",
  },
  "image/webp": {
    format: "webp",
    extension: ".webp",
  },
  "image/gif": {
    format: "gif",
    extension: ".gif",
  },
} as const;

type AllowedImageMime = keyof typeof IMAGE_FORMATS;

async function validateImageUpload(
  file: File,
): Promise<{
  buffer: Buffer;
  extension: string;
}> {
  if (
    !file.size ||
    file.size > MAX_IMAGE_SIZE
  ) {
    throw new AdminFormError(
      "Görsel boş olamaz ve en fazla 8 MB olabilir.",
    );
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      IMAGE_FORMATS,
      file.type,
    )
  ) {
    throw new AdminFormError(
      "Yalnızca JPG, PNG, WebP veya GIF yüklenebilir.",
    );
  }

  const imageType =
    IMAGE_FORMATS[file.type as AllowedImageMime];

  const buffer = Buffer.from(
    await file.arrayBuffer(),
  );

  if (buffer.length !== file.size) {
    throw new AdminFormError(
      "Görsel dosyasının boyutu doğrulanamadı.",
    );
  }

  try {
    const options = {
      animated: true,
      limitInputPixels: MAX_IMAGE_PIXELS,
      failOn: "warning" as const,
    };

    const metadata = await sharp(
      buffer,
      options,
    ).metadata();

    if (metadata.format !== imageType.format) {
      throw new AdminFormError(
        "Dosyanın gerçek biçimi ile belirtilen tür uyuşmuyor.",
      );
    }

const width = metadata.width;
const height = metadata.pageHeight ?? metadata.height;
const frames = metadata.pages ?? 1;

if (
  !width ||
  !height ||
  !Number.isSafeInteger(width) ||
  !Number.isSafeInteger(height) ||
  !Number.isSafeInteger(frames) ||
  frames < 1 ||
  frames > MAX_IMAGE_FRAMES ||
  width * height * frames > MAX_IMAGE_PIXELS
) {
  throw new AdminFormError(
    "Görselin çözünürlüğü veya animasyon kare sayısı izin verilen sınırı aşıyor.",
  );
}

    if (
      !width ||
      !height ||
      !Number.isSafeInteger(frames) ||
      frames < 1 ||
      frames > MAX_IMAGE_FRAMES ||
      width * height * frames > MAX_IMAGE_PIXELS
    ) {
      throw new AdminFormError(
        "Görselin çözünürlüğü veya animasyon kare sayısı izin verilen sınırı aşıyor.",
      );
    }

    // Görsel verisini gerçekten çözümlemeyi dene.
    await sharp(buffer, options).stats();

    return {
      buffer,
      extension: imageType.extension,
    };
  } catch (error) {
    if (error instanceof AdminFormError) {
      throw error;
    }

    console.error(
      "Görsel doğrulama hatası:",
      error,
    );

    throw new AdminFormError(
      "Görsel dosyası bozuk veya desteklenmeyen bir biçimde.",
    );
  }
}


export async function saveImage(
  file: File,
): Promise<string> {
  // Sharp ile gerçek görsel biçimini doğrula.
  const { buffer, extension } =
    await validateImageUpload(file);

  // Doğrulanan dosyanın SHA-256 değerini hesapla.
  const sha256 = createHash("sha256")
    .update(buffer)
    .digest("hex");

  return withImageLock(async () => {
    // Yalnızca gerçek metadata kayıtlarını oku.
    const images =
      (await readJsonFile(
        imagesFile,
        "Görsel kayıt dosyası",
        isStoredImageList,
      )) ?? [];

    // Aynı dosyanın tekrar yüklenmesini önle.
    const existing = images.find(
      (image) => image.sha256 === sha256 && image.source !== "site",
    );

    if (existing) {
      const existingPath = path.resolve(imagesDirectory, existing.storedName);

      const validStoredName =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/i.test(
          existing.storedName,
        );

      if (
        !validStoredName ||
        path.dirname(existingPath) !== imagesDirectory ||
        existing.url !== `/uploads/images/${existing.storedName}`
      ) {
        throw new AdminFormError("Mevcut görsel kaydı güvenli değil.");
      }

      const existingStat = await lstat(existingPath).catch(() => null);

      if (
        !existingStat ||
        !existingStat.isFile() ||
        existingStat.isSymbolicLink()
      ) {
        throw new AdminFormError(
          "Görsel kaydı mevcut ancak dosyası geçersiz. Yönetici kontrolü gerekiyor.",
        );
      }

      return existing.url;
    }

    const storedName = `${randomUUID()}${extension}`;
    const url = `/uploads/images/${storedName}`;

    const image: StoredImage = {
      id: randomUUID(),
      name: file.name.slice(0, 180),
      storedName,
      mimeType: file.type,
      size: buffer.length,
      createdAt: new Date().toISOString(),
      url,
      sha256,
      source: "upload",
    };

    const filePath = path.join(imagesDirectory, storedName);

    await writeFile(filePath, buffer, {
      flag: "wx",
      mode: 0o600,
    });

    try {
      await writeJsonAtomic(
        imagesFile,
        [image, ...images],
        "Görsel kayıt dosyası",
        isStoredImageList,
      );
    } catch (error) {
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        console.error("Kaydedilemeyen görsel temizlenemedi:", cleanupError);
      }

      throw error;
    }

    return url;
  });
}

/* -----------------------------------------
   DELETE UPLOADED IMAGE
----------------------------------------- */

export async function deleteImageById(id: string) {
  // Kilit sırası her zaman: içerik -> görsel.
  return withContentLock(async () => {
    return withImageLock(async () => {
      const images =
        (await readJsonFile(
          imagesFile,
          "Görsel kayıt dosyası",
          isStoredImageList,
        )) ?? [];

      const image = images.find((item) => item.id === id);

      if (!image) {
        throw new AdminFormError("Silinecek görsel bulunamadı.");
      }

      if (image.source !== "upload") {
        throw new AdminFormError("Siteye ait varsayılan görseller silinemez.");
      }

      const validStoredName =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/i.test(
          image.storedName,
        );

      if (!validStoredName) {
        throw new AdminFormError("Görsel dosyasının adı güvenli değil.");
      }

      if (image.url !== `/uploads/images/${image.storedName}`) {
        throw new AdminFormError("Görselin dosya yolu doğrulanamadı.");
      }

      const hasAnotherReference = images.some(
        (item) =>
          item.id !== image.id &&
          (item.url === image.url || item.storedName === image.storedName),
      );

      if (hasAnotherReference) {
        throw new AdminFormError(
          "Bu görsel başka bir medya kaydıyla ilişkili.",
        );
      }

      // İçerik kilidi altındayken güncel dosyayı oku.
      const content = await readSiteContentFile();

      const referencedImages = getReferencedUploadedImages(content);

      if (referencedImages.has(image.url)) {
        throw new AdminFormError(
          "Bu görsel bir sayfada veya blog yazısında kullanılıyor. Önce ilgili içerikten kaldırın.",
        );
      }

      const filePath = path.resolve(imagesDirectory, image.storedName);

      if (path.dirname(filePath) !== imagesDirectory) {
        throw new AdminFormError("Görsel dosyasının konumu geçersiz.");
      }

      let fileInfo;

      try {
        fileInfo = await lstat(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          throw new AdminFormError(
            "Görsel dosyası bulunamadı. Kayıt korunuyor.",
          );
        }

        throw error;
      }

      if (!fileInfo.isFile() || fileInfo.isSymbolicLink()) {
        throw new AdminFormError(
          "Yalnızca normal görsel dosyaları silinebilir.",
        );
      }

      const remainingImages = images.filter(
        (item) => item.id !== image.id && item.storedName !== image.storedName,
      );

      const temporaryPath = path.join(
        dataDirectory,
        `${randomUUID()}.pending-delete`,
      );

      await rename(filePath, temporaryPath);

      try {
        await writeJsonAtomic(
          imagesFile,
          remainingImages,
          "Görsel kayıt dosyası",
          isStoredImageList,
        );
      } catch (error) {
        try {
          await rename(temporaryPath, filePath);
        } catch (rollbackError) {
          console.error("Görsel geri yüklenemedi:", rollbackError);

          throw new AdminFormError(
            "Görsel kaydı güncellenemedi ve dosya geri yüklenemedi. Yönetici müdahalesi gerekiyor.",
          );
        }

        throw error;
      }

      try {
        await unlink(temporaryPath);
      } catch (error) {
        console.error("Silinen görselin geçici dosyası temizlenemedi:", error);
      }

      return true;
    });
  });
}

const DOCUMENT_SHARE_DURATIONS = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
} as const;

export type DocumentShareDuration =
  keyof typeof DOCUMENT_SHARE_DURATIONS;

function documentSharePinSecret() {
  const secret =
    process.env.DOCUMENT_SHARE_PIN_SECRET || process.env.SESSION_SECRET;

  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "rdm-local-document-share-pin-secret-2026";
  }

  throw new Error(
    "DOCUMENT_SHARE_PIN_SECRET veya en az 32 karakterlik SESSION_SECRET tanımlı değil.",
  );
}

function hashDocumentSharePin(shareId: string, pin: string) {
  return createHmac("sha256", documentSharePinSecret())
    .update(`document-share-pin:${shareId}:${pin}`)
    .digest("hex");
}

function safeHashEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

const DOCUMENT_TYPES = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
} as const;

type DocumentExtension = keyof typeof DOCUMENT_TYPES;

const DOCUMENT_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DOCUMENT_STORED_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|doc|docx|xls|xlsx|txt)$/i;

function isSafeDocumentStoredName(name: string) {
  return DOCUMENT_STORED_NAME_PATTERN.test(name);
}

function getDocumentExtension(fileName: string): DocumentExtension {
  const extension = path.extname(fileName).toLowerCase();

  if (!Object.prototype.hasOwnProperty.call(DOCUMENT_TYPES, extension)) {
    throw new AdminFormError(
      "Yalnızca PDF, Word, Excel ve TXT belgeleri yüklenebilir.",
    );
  }

  return extension as DocumentExtension;
}

function validateDocumentSignature(
  buffer: Buffer,
  extension: DocumentExtension,
) {
  const pdfSignature = Buffer.from("%PDF-");

  const oleSignature = Buffer.from([
    0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
  ]);

  const zipSignature = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

  if (extension === ".pdf") {
    return buffer.length >= 5 && buffer.subarray(0, 5).equals(pdfSignature);
  }

  if (extension === ".doc" || extension === ".xls") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(oleSignature);
  }

  if (extension === ".docx" || extension === ".xlsx") {
    return buffer.length >= 4 && buffer.subarray(0, 4).equals(zipSignature);
  }

  if (extension === ".txt") {
    try {
      if (buffer.includes(0)) return false;

      new TextDecoder("utf-8", {
        fatal: true,
      }).decode(buffer);

      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export async function addDocument(
  file: File,
  shareable = false,
): Promise<StoredDocument> {
  if (typeof shareable !== "boolean") {
    throw new AdminFormError("Geçersiz belge paylaşım seçeneği.");
  }
  if (!file.size) {
    throw new AdminFormError("Belge seçilmedi.");
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new AdminFormError("Belge en fazla 25 MB olabilir.");
  }

  if (
    !file.name ||
    file.name.length > 180 ||
    /[\\/\x00-\x1f\x7f]/.test(file.name)
  ) {
    throw new AdminFormError("Belge dosyasının adı geçersiz.");
  }

  const extension = getDocumentExtension(file.name);

  const buffer = Buffer.from(await file.arrayBuffer());

  if (
    buffer.length !== file.size ||
    !validateDocumentSignature(buffer, extension)
  ) {
    throw new AdminFormError("Dosyanın biçimi veya içeriği geçersiz.");
  }

  const storedName = `${randomUUID()}${extension}`;

const document: StoredDocument = {
  id: randomUUID(),
  name: file.name,
  storedName,
  mimeType: DOCUMENT_TYPES[extension],
  size: buffer.length,
  createdAt: new Date().toISOString(),
  shareable,
};

  // Kayıt dosyası bozuksa yeni belge yazma.

  return withDocumentLock(async () => {
    // Kilit alındıktan sonra en güncel kayıtları oku.
    const documents = await getDocuments();

    await ensureStorage();

    const documentPath = path.join(documentsDirectory, storedName);

    await writeFile(documentPath, buffer, {
      flag: "wx",
      mode: 0o600,
    });

    try {
      await writeJsonAtomic(
        documentsFile,
        [document, ...documents],
        "Belge kayıt dosyası",
        isStoredDocumentList,
      );
    } catch (error) {
      try {
        await unlink(documentPath);
      } catch (cleanupError) {
        console.error(
          "Belge yükleme geri alma işlemi başarısız:",
          cleanupError,
        );
      }

      throw error;
    }

    return document;
  });
}

export async function deleteDocumentById(id: string) {
  if (!DOCUMENT_UUID_PATTERN.test(id)) {
    throw new AdminFormError("Geçersiz belge kimliği.");
  }

  return withDocumentLock(async () => {
    const documents = await getDocuments();

    const document = documents.find((item) => item.id === id);

    if (!document) {
      throw new AdminFormError("Silinecek belge bulunamadı.");
    }

    if (!isSafeDocumentStoredName(document.storedName)) {
      throw new AdminFormError("Belge dosyasının adı güvenli değil.");
    }

    const hasAnotherReference = documents.some(
      (item) => item.id !== id && item.storedName === document.storedName,
    );

    if (hasAnotherReference) {
      throw new AdminFormError(
        "Bu dosya başka bir belge kaydı tarafından kullanılıyor.",
      );
    }

    const documentPath = path.resolve(documentsDirectory, document.storedName);

    if (path.dirname(documentPath) !== documentsDirectory) {
      throw new AdminFormError("Belge dosyasının yolu geçersiz.");
    }

    let fileInfo;

    try {
      fileInfo = await lstat(documentPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new AdminFormError(
          "Belge dosyası sunucuda bulunamadı. Kayıt korunuyor.",
        );
      }

      throw error;
    }

    if (!fileInfo.isFile() || fileInfo.isSymbolicLink()) {
      throw new AdminFormError("Yalnızca normal belge dosyaları silinebilir.");
    }

    const temporaryPath = path.join(
      documentsDirectory,
      `${randomUUID()}.pending-document-delete`,
    );

    await rename(documentPath, temporaryPath);

    try {
      await writeJsonAtomic(
        documentsFile,
        documents.filter((item) => item.id !== id),
        "Belge kayıt dosyası",
        isStoredDocumentList,
      );
    } catch (error) {
      try {
        await rename(temporaryPath, documentPath);
      } catch (rollbackError) {
        console.error("Belge silme geri alma işlemi başarısız:", rollbackError);

        throw new AdminFormError(
          "Belge kaydı güncellenemedi ve dosya geri yüklenemedi. Yönetici kontrolü gerekiyor.",
        );
      }

      throw error;
    }

    try {
      await unlink(temporaryPath);
    } catch (error) {
      console.error("Silinen belgenin geçici dosyası temizlenemedi:", error);
    }
  });
}

export async function getDocumentFile(id: string) {
  // Yalnızca UUID biçimindeki belge ID'lerini kabul et.
  if (!DOCUMENT_UUID_PATTERN.test(id)) {
    return null;
  }

  const documents = await getDocuments();
  const document = documents.find((item) => item.id === id);

  if (!document) {
    return null;
  }

  // Yalnızca güvenli dosya adlarına izin ver.
  if (!isSafeDocumentStoredName(document.storedName)) {
    return null;
  }

  const filePath = path.resolve(documentsDirectory, document.storedName);

  // Dosyanın belgeler dizini içerisinde kalmasını doğrula.
  if (path.dirname(filePath) !== documentsDirectory) {
    return null;
  }

  let fileHandle;

  try {
    // Sembolik bağlantıların takip edilmesini engelle.
    fileHandle = await open(
      filePath,
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );

    const fileStat = await fileHandle.stat();

    if (!fileStat.isFile() || fileStat.size > 25 * 1024 * 1024) {
      return null;
    }

    const buffer = await fileHandle.readFile();

    return {
      document,
      buffer,
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT" || code === "ENOTDIR" || code === "ELOOP") {
      return null;
    }

    throw error;
  } finally {
    await fileHandle?.close();
  }
}


export async function createDocumentShare(
  documentId: string,
  duration: DocumentShareDuration = "24h",
  pin = "",
) {
  if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
    throw new AdminFormError("Geçersiz belge kimliği.");
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      DOCUMENT_SHARE_DURATIONS,
      duration,
    )
  ) {
    throw new AdminFormError("Geçersiz paylaşım süresi.");
  }

  if (pin !== "" && !/^\d{6}$/.test(pin)) {
    throw new AdminFormError("Paylaşım PIN'i 6 rakamdan oluşmalıdır.");
  }

  return withDocumentLock(async () => {
    const documents = await getDocuments();

    const document = documents.find(
      (item) => item.id === documentId,
    );

    if (!document) {
      throw new AdminFormError("Belge bulunamadı.");
    }

    if (document.shareable !== true) {
      throw new AdminFormError(
        "Bu belge paylaşılabilir olarak işaretlenmemiş.",
      );
    }

    // Paylaşılacak dosyanın gerçekten mevcut olduğunu doğrula.
    const file = await getDocumentFile(documentId);

    if (!file) {
      throw new AdminFormError(
        "Belge dosyası bulunamadı veya güvenli değil.",
      );
    }

    const shares = await getDocumentShares();

    const hasActiveShare = shares.some(
      (share) =>
        share.documentId === documentId &&
        share.revokedAt === undefined &&
        Date.parse(share.expiresAt) > Date.now(),
    );

    if (hasActiveShare) {
      throw new AdminFormError(
        "Bu belge için zaten aktif bir paylaşım bağlantısı var. Yeni bağlantı oluşturmadan önce mevcut bağlantıyı iptal edin.",
      );
    }

    const token = randomBytes(32).toString("base64url");

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + DOCUMENT_SHARE_DURATIONS[duration],
    );

    const shareId = randomUUID();

    const share: StoredDocumentShare = {
      id: shareId,
      documentId,
      tokenHash,
      pinHash: pin ? hashDocumentSharePin(shareId, pin) : undefined,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    await writeJsonAtomic(
      documentSharesFile,
      [share, ...shares],
      "Belge paylaşım kayıt dosyası",
      isStoredDocumentShareList,
    );

    return {
      shareId: share.id,
      token,
      expiresAt: share.expiresAt,
    };
  });
}



export async function getDocumentByShareToken(
  token: string,
  pin?: string,
) {
  if (
    typeof token !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(token)
  ) {
    return null;
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const shares = await getDocumentShares();

  const share = shares.find(
    (item) => item.tokenHash === tokenHash,
  );

  if (!share || share.revokedAt !== undefined) {
    return null;
  }

  if (Date.parse(share.expiresAt) <= Date.now()) {
    return null;
  }

  if (share.pinHash !== undefined) {
    if (pin === undefined) {
      return { status: "requires-pin" as const };
    }

    if (
      !/^\d{6}$/.test(pin) ||
      !safeHashEqual(share.pinHash, hashDocumentSharePin(share.id, pin))
    ) {
      return { status: "invalid-pin" as const };
    }
  }

  const documents = await getDocuments();

  const document = documents.find(
    (item) => item.id === share.documentId,
  );

  if (!document || document.shareable !== true) {
    return null;
  }

  const file = await getDocumentFile(document.id);

  if (!file) return null;

  return {
    status: "ready" as const,
    ...file,
  };
}





export async function revokeDocumentShare(
  shareId: string,
) {
  if (!DOCUMENT_UUID_PATTERN.test(shareId)) {
    throw new AdminFormError(
      "Geçersiz paylaşım kimliği.",
    );
  }

  return withDocumentLock(async () => {
    const shares = await getDocumentShares();

    const share = shares.find(
      (item) => item.id === shareId,
    );

    if (!share) {
      throw new AdminFormError(
        "Paylaşım kaydı bulunamadı.",
      );
    }

    if (share.revokedAt !== undefined) {
      return;
    }

    const updatedShares = shares.map((item) =>
      item.id === shareId
        ? {
            ...item,
            revokedAt: new Date().toISOString(),
          }
        : item,
    );

    await writeJsonAtomic(
      documentSharesFile,
      updatedShares,
      "Belge paylaşım kayıt dosyası",
      isStoredDocumentShareList,
    );
  });
}




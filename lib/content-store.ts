import "server-only";

import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import { defaultSiteContent } from "@/lib/default-site-content";
import { AdminFormError } from "@/lib/admin-form-error";
import type { SiteContent, StoredDocument, StoredImage } from "@/lib/site-content-types";
import { constants } from "node:fs";

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

type JsonValidator<T> = (value: unknown) => value is T;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
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
    (value.publishedAt === undefined || typeof value.publishedAt === "string") &&
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
    hasString(value, "createdAt")
  );
}

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
    (value.source === undefined || value.source === "upload" || value.source === "site")
  );
}

const isStoredDocumentList: JsonValidator<StoredDocument[]> = (
  value,
): value is StoredDocument[] => Array.isArray(value) && value.every(isStoredDocument);

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
    throw new AdminFormError(`${label} için geçersiz veri oluşturuldu. İşlem durduruldu.`);
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

async function readSiteContentFile(): Promise<SiteContent> {
  return (
    (await readJsonFile(contentFile, "Site içerik dosyası", isSiteContent)) ??
    structuredClone(defaultSiteContent)
  );
}

export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("days");
  cacheTag("site-content");

  return readSiteContentFile();
}

export async function writeSiteContent(content: SiteContent) {
  await writeJsonAtomic(contentFile, content, "Site içerik dosyası", isSiteContent);
}

export async function getDocuments(): Promise<StoredDocument[]> {
  return (
    (await readJsonFile(documentsFile, "Belge kayıt dosyası", isStoredDocumentList)) ?? []
  );
}

export async function getImages(): Promise<StoredImage[]> {
  await ensureStorage();
  const savedImages =
    (await readJsonFile(imagesFile, "Görsel kayıt dosyası", isStoredImageList)) ?? [];

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
  await writeJsonAtomic(
    imagesFile,
    [
      image,
      ...images.filter((item) => item.source !== "site" && item.storedName !== storedName),
    ],
    "Görsel kayıt dosyası",
    isStoredImageList,
  );
  return url;
}


/* -----------------------------------------
   DELETE UPLOADED IMAGE
----------------------------------------- */

export async function deleteImageById(id: string) {
  await ensureStorage();

  // 1. Görseli kayıtlı ID üzerinden bul.
  const images = await getImages();
  const image = images.find((item) => item.id === id);

  if (!image) {
    throw new AdminFormError("Silinecek görsel bulunamadı.");
  }

  // 2. Site görsellerinin silinmesini engelle.
  if (image.source !== "upload") {
    throw new AdminFormError(
      "Siteye ait varsayılan görseller silinemez."
    );
  }

  // 3. Yalnızca uygulamanın oluşturduğu dosya
  // isimlerinin silinmesine izin ver.
  const validStoredName =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/i.test(
      image.storedName
    );

  if (!validStoredName) {
    throw new AdminFormError(
      "Görsel dosyasının adı güvenli değil."
    );
  }

  const expectedUrl = `/uploads/images/${image.storedName}`;

  if (image.url !== expectedUrl) {
    throw new AdminFormError(
      "Görselin dosya yolu doğrulanamadı."
    );
  }

  // 4. Aynı dosyayı işaret eden başka kayıt
  // bulunuyorsa silme.
  const hasAnotherReference = images.some(
    (item) =>
      item.id !== image.id &&
      (item.url === image.url ||
        item.storedName === image.storedName)
  );

  if (hasAnotherReference) {
    throw new AdminFormError(
      "Bu görsel başka bir medya kaydıyla ilişkili."
    );
  }

  // 5. Cache yerine doğrudan güncel içerik
  // dosyasını oku.
  const content = await readSiteContentFile();

  const { home, contact, blog } = content;

  // 6. Ana sayfa ve iletişim görselleri.
  const pageImages = [
    home.heroDesktopImage,
    home.heroMobileImage,
    home.about.desktopImage,
    home.about.mobileImage,
    home.staff.image,
    contact.heroImage,
  ];

  const usedOnPage = pageImages.includes(image.url);

  // 7. Blog kapakları ve blog içerik blokları.
  const usedInBlog = blog.posts.some((post) => {
    if (post.coverImage === image.url) {
      return true;
    }

    return post.content.some(
      (block) =>
        "type" in block &&
        block.type === "image" &&
        block.src === image.url
    );
  });

  if (usedOnPage || usedInBlog) {
    throw new AdminFormError(
      "Bu görsel şu anda bir sayfada veya blog yazısında kullanılıyor. Önce ilgili içerikteki görseli değiştirin."
    );
  }

  // 8. Dosyanın gerçek konumunu doğrula.
  const filePath = path.resolve(
    imagesDirectory,
    image.storedName
  );

  if (
    path.dirname(filePath) !== imagesDirectory
  ) {
    throw new AdminFormError(
      "Görselin dosya konumu geçersiz."
    );
  }

  let fileInfo;

  try {
    fileInfo = await lstat(filePath);
  } catch {
    throw new AdminFormError(
      "Görsel dosyası sunucuda bulunamadı."
    );
  }

  if (
    !fileInfo.isFile() ||
    fileInfo.isSymbolicLink()
  ) {
    throw new AdminFormError(
      "Yalnızca normal görsel dosyaları silinebilir."
    );
  }

  // 9. JSON kaydını doğrudan oku.
  // Orphan görseller images.json içinde
  // bulunmayabileceği için getImages() listesini
  // doğrudan JSON'a yazmıyoruz.
  const savedImages =
    (await readJsonFile(imagesFile, "Görsel kayıt dosyası", isStoredImageList)) ?? [];

  const remainingImages = savedImages.filter(
    (item) =>
      item.id !== image.id &&
      item.storedName !== image.storedName
  );

  // 10. Dosyayı önce geçici bir konuma taşı.
  // Böylece JSON güncellemesi başarısız olursa
  // dosyayı geri getirebiliriz.
  const temporaryPath = path.join(
    dataDirectory,
    `${randomUUID()}.pending-delete`
  );

  try {
    await rename(filePath, temporaryPath);
  } catch {
    throw new AdminFormError(
      "Görsel dosyası silinmek üzere taşınamadı."
    );
  }

  // 11. Görsel kütüphanesinden kaydı çıkar.
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
      console.error(
        "Görsel geri yüklenemedi:",
        rollbackError
      );
    }

    throw new AdminFormError(
      "Medya kayıtları güncellenemedi. İşlem tamamlanamadı."
    );
  }

  // 12. Geçici dosyayı fiziksel olarak kaldır.
  try {
    await unlink(temporaryPath);
  } catch (error) {
    console.error(
      "Silinen görselin geçici dosyası temizlenemedi:",
      error
    );
  }

  return true;
}


const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

const DOCUMENT_TYPES = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

function getDocumentExtension(
  fileName: string,
): DocumentExtension {
  const extension = path.extname(fileName).toLowerCase();

  if (
    !Object.prototype.hasOwnProperty.call(
      DOCUMENT_TYPES,
      extension,
    )
  ) {
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
    0xd0, 0xcf, 0x11, 0xe0,
    0xa1, 0xb1, 0x1a, 0xe1,
  ]);

  const zipSignature = Buffer.from([
    0x50, 0x4b, 0x03, 0x04,
  ]);

  if (extension === ".pdf") {
    return (
      buffer.length >= 5 &&
      buffer.subarray(0, 5).equals(pdfSignature)
    );
  }

  if (extension === ".doc" || extension === ".xls") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(oleSignature)
    );
  }

  if (extension === ".docx" || extension === ".xlsx") {
    return (
      buffer.length >= 4 &&
      buffer.subarray(0, 4).equals(zipSignature)
    );
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
): Promise<StoredDocument> {
  if (!file.size) {
    throw new AdminFormError("Belge seçilmedi.");
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new AdminFormError(
      "Belge en fazla 25 MB olabilir.",
    );
  }

  if (
    !file.name ||
    file.name.length > 180 ||
    /[\\/\x00-\x1f\x7f]/.test(file.name)
  ) {
    throw new AdminFormError(
      "Belge dosyasının adı geçersiz.",
    );
  }

  const extension = getDocumentExtension(file.name);

  const buffer = Buffer.from(await file.arrayBuffer());

  if (
    buffer.length !== file.size ||
    !validateDocumentSignature(buffer, extension)
  ) {
    throw new AdminFormError(
      "Dosyanın biçimi veya içeriği geçersiz.",
    );
  }

  const storedName = `${randomUUID()}${extension}`;

  const document: StoredDocument = {
    id: randomUUID(),
    name: file.name,
    storedName,
    mimeType: DOCUMENT_TYPES[extension],
    size: buffer.length,
    createdAt: new Date().toISOString(),
  };

  // Kayıt dosyası bozuksa yeni belge yazma.
  const documents = await getDocuments();

  await ensureStorage();

  const documentPath = path.join(
    documentsDirectory,
    storedName,
  );

  // wx: Var olan dosyanın üzerine yazmayı engeller.
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
}



export async function deleteDocumentById(id: string) {
  if (!DOCUMENT_UUID_PATTERN.test(id)) {
    throw new AdminFormError(
      "Geçersiz belge kimliği.",
    );
  }

  const documents = await getDocuments();

  const document = documents.find(
    (item) => item.id === id,
  );

  if (!document) {
    throw new AdminFormError(
      "Silinecek belge bulunamadı.",
    );
  }

  if (!isSafeDocumentStoredName(document.storedName)) {
    throw new AdminFormError(
      "Belge dosyasının adı güvenli değil.",
    );
  }

  const hasAnotherReference = documents.some(
    (item) =>
      item.id !== id &&
      item.storedName === document.storedName,
  );

  if (hasAnotherReference) {
    throw new AdminFormError(
      "Bu dosya başka bir belge kaydı tarafından kullanılıyor.",
    );
  }

  const documentPath = path.resolve(
    documentsDirectory,
    document.storedName,
  );

  if (path.dirname(documentPath) !== documentsDirectory) {
    throw new AdminFormError(
      "Belge dosyasının yolu geçersiz.",
    );
  }

  let fileInfo;

  try {
    fileInfo = await lstat(documentPath);
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      throw new AdminFormError(
        "Belge dosyası sunucuda bulunamadı. Kayıt korunuyor.",
      );
    }

    throw error;
  }

  if (
    !fileInfo.isFile() ||
    fileInfo.isSymbolicLink()
  ) {
    throw new AdminFormError(
      "Yalnızca normal belge dosyaları silinebilir.",
    );
  }

  await ensureStorage();

  const temporaryPath = path.join(
    documentsDirectory,
    `${randomUUID()}.pending-document-delete`,
  );

  // Önce dosyayı geçici isme taşı.
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
      console.error(
        "Belge silme geri alma işlemi başarısız:",
        rollbackError,
      );

      throw new AdminFormError(
        "Belge kaydı güncellenemedi ve dosya otomatik geri yüklenemedi. Yönetici kontrolü gerekiyor.",
      );
    }

    throw error;
  }

  // Metadata başarıyla güncellendikten sonra
  // geçici dosyayı fiziksel olarak kaldır.
  try {
    await unlink(temporaryPath);
  } catch (error) {
    console.error(
      "Silinen belgenin geçici dosyası temizlenemedi:",
      error,
    );
  }
}


export async function getDocumentFile(id: string) {
  // Yalnızca UUID biçimindeki belge ID'lerini kabul et.
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    return null;
  }

  const documents = await getDocuments();
  const document = documents.find((item) => item.id === id);

  if (!document) {
    return null;
  }

  // Yalnızca uygulamanın ürettiği dosya adlarına izin ver.
// Yalnızca güvenli dosya adlarına izin ver.
if (!isSafeDocumentStoredName(document.storedName)) {
  return null;
}

  const filePath = path.resolve(
    documentsDirectory,
    document.storedName,
  );

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

    if (
      !fileStat.isFile() ||
      fileStat.size > 25 * 1024 * 1024
    ) {
      return null;
    }

    const buffer = await fileHandle.readFile();

    return {
      document,
      buffer,
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (
      code === "ENOENT" ||
      code === "ENOTDIR" ||
      code === "ELOOP"
    ) {
      return null;
    }

    throw error;
  } finally {
    await fileHandle?.close();
  }
}


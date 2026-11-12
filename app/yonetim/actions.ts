"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAdminSession,
  deleteAdminSession,
  requireAdmin,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import {
  addDocument,
  deleteDocumentById,
  getSiteContent,
  saveImage,
  writeSiteContent,
} from "@/lib/content-store";
import type { BlogContentBlock, BlogPost } from "@/data/blog";

function value(formData: FormData, name: string, maxLength = 10_000) {
  return String(formData.get(name) ?? "").trim().slice(0, maxLength);
}

function required(formData: FormData, name: string, maxLength = 10_000) {
  const result = value(formData, name, maxLength);
  if (!result) throw new Error(`${name} alanı boş bırakılamaz.`);
  return result;
}

function fileValue(formData: FormData, name: string) {
  const candidate = formData.get(name);
  return candidate instanceof File && candidate.size > 0 ? candidate : null;
}

function storedImageValue(formData: FormData, name: string) {
  const url = value(formData, name, 500);
  const isUploadedImage = /^\/uploads\/images\/[a-zA-Z0-9._-]+$/.test(url);
  const isSiteImage = /^\/images\/[a-zA-Z0-9._/-]+$/.test(url) && !url.includes("..");
  return isUploadedImage || isSiteImage ? url : "";
}

function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function parseBlogBlocks(formData: FormData): Promise<BlogContentBlock[]> {
  const blockCount = Number(value(formData, "blockCount", 3));
  if (!Number.isInteger(blockCount) || blockCount < 1 || blockCount > 100) {
    throw new Error("Blog içeriği 1-100 blok arasında olmalıdır.");
  }

  const blocks: BlogContentBlock[] = [];
  for (let index = 0; index < blockCount; index += 1) {
    const type = value(formData, `blockType_${index}`, 20);
    if (type === "heading") {
      blocks.push({ type, text: required(formData, `blockText_${index}`, 300) });
      continue;
    }
    if (type === "paragraph") {
      blocks.push({ type, text: required(formData, `blockText_${index}`, 10_000) });
      continue;
    }
    if (type === "list") {
      const items = required(formData, `blockItems_${index}`, 10_000)
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 100);
      if (!items.length) throw new Error("Madde listesi boş bırakılamaz.");
      blocks.push({ type, items });
      continue;
    }
    if (type === "image") {
      const imageFile = fileValue(formData, `blockImage_${index}`);
      const existingImage = storedImageValue(formData, `blockImageUrl_${index}`);
      const src = imageFile ? await saveImage(imageFile) : existingImage;
      if (!src) throw new Error("Görsel bloğu için bir dosya seçilmelidir.");
      blocks.push({
        type,
        src,
        alt: value(formData, `blockImageAlt_${index}`, 300) || "Blog yazısı görseli",
      });
      continue;
    }
    throw new Error("Geçersiz blog içerik bloğu.");
  }
  return blocks;
}

export async function loginAction(formData: FormData) {
  const username = value(formData, "username", 100);
  const password = value(formData, "password", 300);
  if (!validateAdminCredentials(username, password)) {
    redirect("/yonetim/giris?hata=1");
  }
  await createAdminSession();
  redirect("/yonetim");
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/yonetim/giris");
}

export async function updateHomeAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  content.home.servicesTitle = required(formData, "servicesTitle", 100);
  content.home.servicesIntro = required(formData, "servicesIntro", 3000);

  content.home.heroSlides = content.home.heroSlides.map((slide, index) => ({
    ...slide,
    title: required(formData, `heroTitle_${index}`, 150),
    description: required(formData, `heroDescription_${index}`, 1000),
  }));
  content.home.services = content.home.services.map((service, index) => ({
    ...service,
    title: required(formData, `serviceTitle_${index}`, 180),
    description: required(formData, `serviceDescription_${index}`, 2500),
  }));
  content.home.serviceSlides = content.home.serviceSlides.map((service, index) => ({
    ...service,
    title: required(formData, `serviceSlideTitle_${index}`, 180),
    description: required(formData, `serviceSlideDescription_${index}`, 2500),
  }));
  content.home.about = {
    ...content.home.about,
    title: required(formData, "aboutTitle", 120),
    paragraphs: [0, 1, 2].map((index) => required(formData, `aboutParagraph_${index}`, 4000)),
    lawyer: {
      name: required(formData, "lawyerName", 150),
      description: required(formData, "lawyerDescription", 4000),
    },
  };
  content.home.staff = {
    ...content.home.staff,
    name: required(formData, "staffName", 150),
    specialization: required(formData, "staffSpecialization", 250),
    description: required(formData, "staffDescription", 4000),
  };

  const imageFields = [
    ["heroDesktopImage", "heroDesktopImage"],
    ["heroMobileImage", "heroMobileImage"],
    ["aboutDesktopImage", "about.desktopImage"],
    ["aboutMobileImage", "about.mobileImage"],
    ["staffImage", "staff.image"],
  ] as const;
  for (const [field, target] of imageFields) {
    const file = fileValue(formData, field);
    const libraryImage = storedImageValue(formData, `${field}Library`);
    if (!file && !libraryImage) continue;
    const image = file ? await saveImage(file) : libraryImage;
    if (target === "heroDesktopImage") content.home.heroDesktopImage = image;
    if (target === "heroMobileImage") content.home.heroMobileImage = image;
    if (target === "about.desktopImage") content.home.about.desktopImage = image;
    if (target === "about.mobileImage") content.home.about.mobileImage = image;
    if (target === "staff.image") content.home.staff.image = image;
  }

  await writeSiteContent(content);
  updateTag("site-content");
  redirect("/yonetim?durum=anasayfa-kaydedildi");
}

export async function updateContactAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const phone = required(formData, "phone", 80);
  const email = required(formData, "email", 254);
  content.contact = {
    ...content.contact,
    title: required(formData, "title", 100),
    phone,
    phoneHref: `tel:${phone.replace(/[^+\d]/g, "")}`,
    email,
    emailHref: `mailto:${email}`,
    location: required(formData, "location", 180),
    address: required(formData, "address", 600),
    intro: required(formData, "intro", 2000),
    mapEmbedUrl: required(formData, "mapEmbedUrl", 3000),
  };
  const heroImage = fileValue(formData, "heroImage");
  const heroLibraryImage = storedImageValue(formData, "heroImageLibrary");
  if (heroImage) content.contact.heroImage = await saveImage(heroImage);
  else if (heroLibraryImage) content.contact.heroImage = heroLibraryImage;
  await writeSiteContent(content);
  updateTag("site-content");
  redirect("/yonetim?durum=iletisim-kaydedildi");
}

export async function saveBlogPostAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const id = value(formData, "id", 100) || crypto.randomUUID();
  const title = required(formData, "title", 250);
  const requestedSlug = slugify(value(formData, "slug", 120) || title);
  if (!requestedSlug) throw new Error("Geçerli bir blog adresi oluşturulamadı.");
  const duplicate = content.blog.posts.find((post) => post.slug === requestedSlug && post.id !== id);
  if (duplicate) throw new Error("Bu blog adresi başka bir yazıda kullanılıyor.");

  const existing = content.blog.posts.find((post) => post.id === id);
  const coverFile = fileValue(formData, "coverImage");
  const libraryCover = storedImageValue(formData, "coverImageLibrary");
  const post: BlogPost = {
    id,
    slug: requestedSlug,
    title,
    excerpt: required(formData, "excerpt", 1000),
    category: required(formData, "category", 120),
    author: required(formData, "author", 160),
    publishedAt: value(formData, "publishedAt", 10) || undefined,
    coverImage: coverFile ? await saveImage(coverFile) : libraryCover || existing?.coverImage,
    content: await parseBlogBlocks(formData),
  };
  content.blog.posts = existing
    ? content.blog.posts.map((item) => (item.id === id ? post : item))
    : [post, ...content.blog.posts];
  await writeSiteContent(content);
  updateTag("site-content");
  redirect("/yonetim/blog?durum=kaydedildi");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const id = required(formData, "id", 100);
  content.blog.posts = content.blog.posts.filter((post) => post.id !== id);
  await writeSiteContent(content);
  updateTag("site-content");
  redirect("/yonetim/blog?durum=silindi");
}

export async function uploadDocumentAction(formData: FormData) {
  await requireAdmin();
  const file = fileValue(formData, "document");
  if (!file) throw new Error("Belge seçilmedi.");
  await addDocument(file);
  redirect("/yonetim/belgeler?durum=yuklendi");
}

export async function uploadLibraryImageAction(formData: FormData) {
  await requireAdmin();
  const file = fileValue(formData, "image");
  if (!file) throw new Error("Görsel seçilmedi.");
  await saveImage(file);
  redirect("/yonetim/gorseller?durum=yuklendi");
}

export async function deleteDocumentAction(formData: FormData) {
  await requireAdmin();
  await deleteDocumentById(required(formData, "id", 100));
  redirect("/yonetim/belgeler?durum=silindi");
}

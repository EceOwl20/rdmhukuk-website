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
  createDocumentShare,
  deleteDocumentById,
  deleteImageById,
  revokeDocumentShare,
  saveImage,
  updateSiteContent,
} from "@/lib/content-store";

import type {
  DocumentShareDuration,
} from "@/lib/content-store";
import {
  createTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
} from "@/lib/task-store";
import type { TaskPriority } from "@/lib/task-types";
import type { BlogContentBlock, BlogPost } from "@/data/blog";
import type { AdminActionState } from "@/lib/admin-action-state";
import { adminActionErrorState, AdminFormError } from "@/lib/admin-form-error";

function value(formData: FormData, name: string, maxLength = 10_000) {
  return String(formData.get(name) ?? "").trim().slice(0, maxLength);
}

function required(formData: FormData, name: string, maxLength = 10_000) {
  const result = value(formData, name, maxLength);
  if (!result) throw new AdminFormError(`${name} alanı boş bırakılamaz.`);
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

function taskPriorityValue(formData: FormData): TaskPriority {
  const priority = value(formData, "priority", 20);
  return priority === "low" || priority === "high" ? priority : "normal";
}

function taskDateTimeValue(formData: FormData, name: string) {
  const rawValue = value(formData, name, 40);
  if (!rawValue) return null;

  // datetime-local saat dilimi taşımaz. Panel Türkiye için kullanıldığından
  // değeri sabit UTC+3 ile ISO biçimine dönüştürüyoruz.
  const localDateTime = rawValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/);
  if (!localDateTime) return rawValue;
  return `${rawValue.length === 16 ? `${rawValue}:00` : rawValue}+03:00`;
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

async function runAdminMutation(
  mutation: () => Promise<string>,
): Promise<AdminActionState> {
  let redirectTo: string;

  try {
    redirectTo = await mutation();
  } catch (error) {
    return adminActionErrorState(error);
  }

  redirect(redirectTo);
}

type DocumentShareActionResult =
  | {
      success: true;
      shareId: string;
      token: string;
      expiresAt: string;
    }
  | {
      success: false;
      error: string;
    };

type RevokeDocumentShareActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

async function parseBlogBlocks(formData: FormData): Promise<BlogContentBlock[]> {
  const blockCount = Number(value(formData, "blockCount", 3));
  if (!Number.isInteger(blockCount) || blockCount < 1 || blockCount > 100) {
    throw new AdminFormError("Blog içeriği 1-100 blok arasında olmalıdır.");
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
      if (!items.length) throw new AdminFormError("Madde listesi boş bırakılamaz.");
      blocks.push({ type, items });
      continue;
    }
    if (type === "image") {
      const imageFile = fileValue(formData, `blockImage_${index}`);
      const existingImage = storedImageValue(formData, `blockImageUrl_${index}`);
      const src = imageFile ? await saveImage(imageFile) : existingImage;
      if (!src) throw new AdminFormError("Görsel bloğu için bir dosya seçilmelidir.");
      blocks.push({
        type,
        src,
        alt: value(formData, `blockImageAlt_${index}`, 300) || "Blog yazısı görseli",
      });
      continue;
    }
    throw new AdminFormError("Geçersiz blog içerik bloğu.");
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


async function updateHomeMutation(formData: FormData) {
  await requireAdmin();

  const imageFields = [
    ["heroDesktopImage", "heroDesktopImage"],
    ["heroMobileImage", "heroMobileImage"],
    ["aboutDesktopImage", "about.desktopImage"],
    ["aboutMobileImage", "about.mobileImage"],
    ["staffImage", "staff.image"],
  ] as const;

  const imageUpdates: Record<string, string> = {};

  // Görselleri içerik kilidinden önce hazırla.
  for (const [field, target] of imageFields) {
    const file = fileValue(formData, field);
    const libraryImage = storedImageValue(
      formData,
      `${field}Library`,
    );

    if (!file && !libraryImage) continue;

    imageUpdates[target] = file
      ? await saveImage(file)
      : libraryImage;
  }

  await updateSiteContent((content) => {
    content.home.servicesTitle = required(
      formData,
      "servicesTitle",
      100,
    );

    content.home.servicesIntro = required(
      formData,
      "servicesIntro",
      3000,
    );

    content.home.heroSlides = content.home.heroSlides.map(
      (slide, index) => ({
        ...slide,
        title: required(
          formData,
          `heroTitle_${index}`,
          150,
        ),
        description: required(
          formData,
          `heroDescription_${index}`,
          1000,
        ),
      }),
    );

    content.home.services = content.home.services.map(
      (service, index) => ({
        ...service,
        title: required(
          formData,
          `serviceTitle_${index}`,
          180,
        ),
        description: required(
          formData,
          `serviceDescription_${index}`,
          2500,
        ),
      }),
    );

    content.home.serviceSlides =
      content.home.serviceSlides.map(
        (service, index) => ({
          ...service,
          title: required(
            formData,
            `serviceSlideTitle_${index}`,
            180,
          ),
          description: required(
            formData,
            `serviceSlideDescription_${index}`,
            2500,
          ),
        }),
      );

    content.home.about = {
      ...content.home.about,
      title: required(
        formData,
        "aboutTitle",
        120,
      ),
      paragraphs: [0, 1, 2].map((index) =>
        required(
          formData,
          `aboutParagraph_${index}`,
          4000,
        ),
      ),
      lawyer: {
        name: required(
          formData,
          "lawyerName",
          150,
        ),
        description: required(
          formData,
          "lawyerDescription",
          4000,
        ),
      },
    };

    content.home.staff = {
      ...content.home.staff,
      name: required(
        formData,
        "staffName",
        150,
      ),
      specialization: required(
        formData,
        "staffSpecialization",
        250,
      ),
      description: required(
        formData,
        "staffDescription",
        4000,
      ),
    };

    // Hazırlanan görselleri güncel içeriğe uygula.
    for (const [target, image] of Object.entries(imageUpdates)) {
      if (target === "heroDesktopImage") {
        content.home.heroDesktopImage = image;
      }

      if (target === "heroMobileImage") {
        content.home.heroMobileImage = image;
      }

      if (target === "about.desktopImage") {
        content.home.about.desktopImage = image;
      }

      if (target === "about.mobileImage") {
        content.home.about.mobileImage = image;
      }

      if (target === "staff.image") {
        content.home.staff.image = image;
      }
    }
  });

  updateTag("site-content");

  return "/yonetim?durum=anasayfa-kaydedildi";
}



async function updateContactMutation(formData: FormData) {
  await requireAdmin();

  const phone = required(formData, "phone", 80);
  const email = required(formData, "email", 254);

  const heroImage = fileValue(formData, "heroImage");

  const heroLibraryImage = storedImageValue(
    formData,
    "heroImageLibrary",
  );

  // Görseli içerik kilidinden önce hazırla.
  const newHeroImage = heroImage
    ? await saveImage(heroImage)
    : heroLibraryImage;

  await updateSiteContent((content) => {
    content.contact = {
      ...content.contact,

      title: required(
        formData,
        "title",
        100,
      ),

      phone,

      phoneHref: `tel:${phone.replace(/[^+\d]/g, "")}`,

      email,

      emailHref: `mailto:${email}`,

      location: required(
        formData,
        "location",
        180,
      ),

      address: required(
        formData,
        "address",
        600,
      ),

      intro: required(
        formData,
        "intro",
        2000,
      ),

      mapEmbedUrl: required(
        formData,
        "mapEmbedUrl",
        3000,
      ),

      heroImage:
        newHeroImage ||
        content.contact.heroImage,
    };
  });

  updateTag("site-content");

  return "/yonetim?durum=iletisim-kaydedildi";
}


async function saveBlogPostMutation(formData: FormData) {
  await requireAdmin();

  const requestedId = value(formData, "id", 100);
  const id = requestedId || crypto.randomUUID();

  const title = required(
    formData,
    "title",
    250,
  );

  const requestedSlug = slugify(
    value(formData, "slug", 120) || title,
  );

  if (!requestedSlug) {
    throw new AdminFormError(
      "Geçerli bir blog adresi oluşturulamadı.",
    );
  }

  // Form verilerini önceden doğrula.
  const excerpt = required(
    formData,
    "excerpt",
    1000,
  );

  const category = required(
    formData,
    "category",
    120,
  );

  const author = required(
    formData,
    "author",
    160,
  );

  const publishedAt =
    value(formData, "publishedAt", 10) || undefined;

  const coverFile = fileValue(
    formData,
    "coverImage",
  );

  const libraryCover = storedImageValue(
    formData,
    "coverImageLibrary",
  );

  // Görselleri kilitten önce hazırla.
  const uploadedCover = coverFile
    ? await saveImage(coverFile)
    : null;

  const blocks = await parseBlogBlocks(formData);

  await updateSiteContent((content) => {
    const duplicate = content.blog.posts.find(
      (post) =>
        post.slug === requestedSlug &&
        post.id !== id,
    );

    if (duplicate) {
      throw new AdminFormError(
        "Bu blog adresi başka bir yazıda kullanılıyor.",
      );
    }

    const existing = content.blog.posts.find(
      (post) => post.id === id,
    );

    // Düzenleme istenmişse kayıt hâlâ var olmalı.
    if (requestedId && !existing) {
      throw new AdminFormError(
        "Düzenlenecek blog yazısı bulunamadı.",
      );
    }

    const post: BlogPost = {
      id,
      slug: requestedSlug,
      title,
      excerpt,
      category,
      author,
      publishedAt,

      coverImage:
        uploadedCover ||
        libraryCover ||
        existing?.coverImage,

      content: blocks,
    };

    content.blog.posts = existing
      ? content.blog.posts.map((item) =>
          item.id === id ? post : item,
        )
      : [post, ...content.blog.posts];
  });

  updateTag("site-content");

  return "/yonetim/blog?durum=kaydedildi";
}



async function deleteBlogPostMutation(formData: FormData) {
  await requireAdmin();

  const id = required(formData, "id", 100);

  await updateSiteContent((content) => {
    const exists = content.blog.posts.some(
      (post) => post.id === id,
    );

    if (!exists) {
      throw new AdminFormError(
        "Silinecek blog yazısı bulunamadı.",
      );
    }

    content.blog.posts = content.blog.posts.filter(
      (post) => post.id !== id,
    );
  });

  updateTag("site-content");

  return "/yonetim/blog?durum=silindi";
}


async function uploadDocumentMutation(formData: FormData) {
  await requireAdmin();

  const file = fileValue(formData, "document");

  if (!file) {
    throw new AdminFormError("Belge seçilmedi.");
  }

  const rawShareable = formData.getAll("shareable");

  if (
    rawShareable.length > 1 ||
    (rawShareable.length === 1 && rawShareable[0] !== "true")
  ) {
    throw new AdminFormError("Geçersiz belge paylaşım seçeneği.");
  }

  const shareable = rawShareable.length === 1;

  await addDocument(file, shareable);

  return "/yonetim/belgeler?durum=yuklendi";
}

async function uploadLibraryImageMutation(formData: FormData) {
  await requireAdmin();
  const file = fileValue(formData, "image");
  if (!file) throw new AdminFormError("Görsel seçilmedi.");
  await saveImage(file);
  return "/yonetim/gorseller?durum=yuklendi";
}

async function deleteDocumentMutation(formData: FormData) {
  await requireAdmin();
  await deleteDocumentById(required(formData, "id", 100));
  return "/yonetim/belgeler?durum=silindi";
}

async function deleteImageMutation(formData: FormData) {
  await requireAdmin();

  const id = required(formData, "id", 100);

  await deleteImageById(id);

  return "/yonetim/gorseller?durum=silindi";
}

async function createTaskMutation(formData: FormData) {
  await requireAdmin();
  await createTask({
    title: required(formData, "title", 200),
    description: value(formData, "description", 10_000),
    category: value(formData, "category", 100),
    priority: taskPriorityValue(formData),
    dueAt: taskDateTimeValue(formData, "dueAt"),
    reminderAt: taskDateTimeValue(formData, "reminderAt"),
  });
  return "/yonetim/gorevler?durum=eklendi";
}

async function updateTaskMutation(formData: FormData) {
  await requireAdmin();
  await updateTask(required(formData, "id", 100), {
    title: required(formData, "title", 200),
    description: value(formData, "description", 10_000),
    category: value(formData, "category", 100),
    priority: taskPriorityValue(formData),
    dueAt: taskDateTimeValue(formData, "dueAt"),
    reminderAt: taskDateTimeValue(formData, "reminderAt"),
  });
  return "/yonetim/gorevler?durum=guncellendi";
}

async function toggleTaskMutation(formData: FormData) {
  await requireAdmin();
  await setTaskCompleted(
    required(formData, "id", 100),
    value(formData, "completed", 10) === "true",
  );
  return "/yonetim/gorevler?durum=durum-guncellendi";
}

async function deleteTaskMutation(formData: FormData) {
  await requireAdmin();
  await deleteTask(required(formData, "id", 100));
  return "/yonetim/gorevler?durum=silindi";
}

export async function updateHomeAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => updateHomeMutation(formData));
}

export async function updateContactAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => updateContactMutation(formData));
}

export async function saveBlogPostAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => saveBlogPostMutation(formData));
}

export async function deleteBlogPostAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => deleteBlogPostMutation(formData));
}

export async function uploadDocumentAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => uploadDocumentMutation(formData));
}

export async function uploadLibraryImageAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => uploadLibraryImageMutation(formData));
}

export async function deleteDocumentAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => deleteDocumentMutation(formData));
}

export async function createTaskAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => createTaskMutation(formData));
}

export async function updateTaskAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => updateTaskMutation(formData));
}

export async function toggleTaskAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => toggleTaskMutation(formData));
}

export async function deleteTaskAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => deleteTaskMutation(formData));
}

export async function deleteImageAction(
  _previousState: AdminActionState,
  formData: FormData,
) {
  return runAdminMutation(() => deleteImageMutation(formData));
}


export async function createDocumentShareAction(
  documentId: string,
  duration: DocumentShareDuration,
  pin: string,
): Promise<DocumentShareActionResult> {
  // Kimlik doğrulamasını hata yakalama bloğının dışında tutuyoruz.
  // Yetkisiz erişimlerde mevcut requireAdmin davranışı korunur.
  await requireAdmin();

  try {
    if (
      typeof documentId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        documentId,
      )
    ) {
      throw new AdminFormError("Geçersiz belge kimliği.");
    }

    if (
      duration !== "1h" &&
      duration !== "24h" &&
      duration !== "7d"
    ) {
      throw new AdminFormError("Geçersiz paylaşım süresi.");
    }

    if (typeof pin !== "string" || (pin !== "" && !/^\d{6}$/.test(pin))) {
      throw new AdminFormError("Paylaşım PIN'i 6 rakamdan oluşmalıdır.");
    }

    const share = await createDocumentShare(
      documentId,
      duration,
      pin,
    );

    return {
      success: true,
      shareId: share.shareId,
      token: share.token,
      expiresAt: share.expiresAt,
    };
  } catch (error) {
    if (error instanceof AdminFormError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Belge paylaşımı oluşturulamadı:", error);

    return {
      success: false,
      error: "Paylaşım bağlantısı oluşturulamadı.",
    };
  }
}


export async function revokeDocumentShareAction(
  shareId: string,
): Promise<RevokeDocumentShareActionResult> {
  await requireAdmin();

  try {
    if (
      typeof shareId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        shareId,
      )
    ) {
      throw new AdminFormError(
        "Geçersiz paylaşım kimliği.",
      );
    }

    await revokeDocumentShare(shareId);

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof AdminFormError) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error("Belge paylaşımı iptal edilemedi:", error);

    return {
      success: false,
      error: "Paylaşım bağlantısı iptal edilemedi.",
    };
  }
}




"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FiArrowDown,
  FiArrowUp,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiImage,
  FiLayers,
  FiList,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import type { BlogContentBlock, BlogPost } from "@/data/blog";
import type { StoredImage } from "@/lib/site-content-types";
import { saveBlogPostAction } from "@/app/yonetim/actions";

import {
  Field,
  PanelSection,
  SaveButton,
  TextArea,
} from "@/components/admin/FormFields";

type EditorBlock = BlogContentBlock & {
  editorId: string;
};

type BlockType = BlogContentBlock["type"];

const blockLabels: Record<BlockType, string> = {
  heading: "Başlık",
  paragraph: "Paragraf",
  list: "Madde listesi",
  image: "Görsel",
};

const blockIcons = {
  heading: FiFileText,
  paragraph: FiLayers,
  list: FiList,
  image: FiImage,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 " +
  "text-sm text-[#152741] outline-none transition-all " +
  "placeholder:text-slate-400 focus:border-[#EFB059] " +
  "focus:ring-4 focus:ring-[#EFB059]/10";

const actionButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg " +
  "border border-slate-200 bg-white text-slate-500 " +
  "transition-colors hover:border-slate-300 hover:bg-slate-50 " +
  "disabled:cursor-not-allowed disabled:opacity-30";

function initialBlocks(post?: BlogPost): EditorBlock[] {
  if (!post?.content.length) {
    return [
      {
        type: "paragraph",
        text: "",
        editorId: "new-paragraph-0",
      },
    ];
  }

  return post.content.flatMap((block, blockIndex) => {
    if ("type" in block) {
      return [
        {
          ...block,
          editorId: `block-${blockIndex}`,
        },
      ];
    }

    const converted: EditorBlock[] = [];

    if (block.heading) {
      converted.push({
        type: "heading",
        text: block.heading,
        editorId: `legacy-heading-${blockIndex}`,
      });
    }

    block.paragraphs.forEach((paragraph, paragraphIndex) => {
      converted.push({
        type: "paragraph",
        text: paragraph,
        editorId: `legacy-paragraph-${blockIndex}-${paragraphIndex}`,
      });
    });

    return converted;
  });
}

function createBlock(type: BlockType): EditorBlock {
  const editorId = crypto.randomUUID();

  if (type === "list") {
    return {
      type,
      items: [""],
      editorId,
    };
  }

  if (type === "image") {
    return {
      type,
      src: "",
      alt: "",
      editorId,
    };
  }

  return {
    type,
    text: "",
    editorId,
  };
}

/* IMAGE LIBRARY */

function ImageLibrary({
  images,
  selectedUrl,
  onSelect,
}: {
  images: StoredImage[];
  selectedUrl?: string;
  onSelect: (image: StoredImage) => void;
}) {
  if (!images.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
        <FiImage className="text-3xl text-slate-400" />

        <p className="text-sm font-semibold text-[#152741]">
          Henüz görsel bulunmuyor
        </p>

        <p className="max-w-sm text-xs leading-5 text-slate-500">
          Önce Görseller bölümünden veya dosya yükleme alanından
          görsel ekleyebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#152741]">
          Medya Kütüphanesi
        </span>

        <span className="text-xs text-slate-400">
          {images.length} görsel
        </span>
      </div>

      <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => {
          const isSelected = selectedUrl === image.url;

          return (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image)}
              aria-pressed={isSelected}
              className={`group overflow-hidden rounded-xl border-2 bg-white text-left transition-all ${
                isSelected
                  ? "border-[#EFB059] shadow-md"
                  : "border-transparent hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="relative aspect-square bg-slate-100">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  sizes="160px"
                  className="object-contain p-2"
                />

                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#152741] text-white">
                    <FiCheck className="text-sm" />
                  </div>
                )}
              </div>

              <div
                className="truncate border-t border-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
                title={image.name}
              >
                {image.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* MAIN EDITOR */

export default function BlogEditor({
  post,
  images,
}: {
  post?: BlogPost;
  images: StoredImage[];
}) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    () => initialBlocks(post)
  );

  const [openLibraryFor, setOpenLibraryFor] = useState<
    string | null
  >(null);

  const [coverLibrary, setCoverLibrary] = useState("");

  const [collapsedBlocks, setCollapsedBlocks] = useState<
    string[]
  >([]);

  function insertBlock(
    type: BlockType,
    afterIndex = blocks.length - 1
  ) {
    const block = createBlock(type);

    setBlocks((current) => {
      const next = [...current];
      next.splice(afterIndex + 1, 0, block);
      return next;
    });
  }

  function updateBlock(
    index: number,
    update: Partial<EditorBlock>
  ) {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index
          ? ({ ...block, ...update } as EditorBlock)
          : block
      )
    );
  }

  function moveBlock(
    index: number,
    direction: -1 | 1
  ) {
    setBlocks((current) => {
      const target = index + direction;

      if (target < 0 || target >= current.length) {
        return current;
      }

      const next = [...current];

      [next[index], next[target]] = [
        next[target],
        next[index],
      ];

      return next;
    });
  }

  function removeBlock(index: number) {
    setBlocks((current) =>
      current.length === 1
        ? current
        : current.filter(
            (_, blockIndex) => blockIndex !== index
          )
    );
  }

  function toggleCollapse(editorId: string) {
    setCollapsedBlocks((current) =>
      current.includes(editorId)
        ? current.filter((id) => id !== editorId)
        : [...current, editorId]
    );
  }

  return (
    <form
      action={saveBlogPostAction}
      className="mx-auto max-w-[1700px] space-y-5 lg:space-y-7 pb-10"
    >
      {post && (
        <input type="hidden" name="id" value={post.id} />
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 lg:gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>YÖNETİM PANELİ</span>
            <span>/</span>
            <span>BLOG</span>
          </div>

          <h1 className="text-2xl leading-7 lg:leading-9 font-bold text-[#152741] md:text-3xl">
            {post
              ? "Blog Yazısını Düzenle"
              : "Yeni Blog Yazısı"}
          </h1>

          <p className="text-xs lg:text-sm leading-5 lg:leading-6 text-slate-500">
            Blog içeriğinizi oluşturun, görsellerinizi seçin ve
            yazınızı yayınlayın.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#EFB059]/40 bg-[#EFB059]/10 px-4 py-2 text-xs font-semibold text-[#8C6327]">
            {post ? "Düzenleme" : "Yeni içerik"}
          </span>

          <SaveButton>
            {post ? "Değişiklikleri Kaydet" : "Yazıyı Yayınla"}
          </SaveButton>
        </div>
      </div>

      {/* BLOG INFORMATION */}
      <PanelSection
        title="Yazı Bilgileri"
        description="Yazının temel bilgilerini ve arama sonuçlarında gösterilecek açıklamasını düzenleyin."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Yazı başlığı"
              name="title"
              defaultValue={post?.title}
            />
          </div>

          <Field
            label="URL adresi"
            name="slug"
            defaultValue={post?.slug}
            required={false}
            hint="Boş bırakılırsa başlıktan otomatik oluşturulur."
          />

          <Field
            label="Kategori"
            name="category"
            defaultValue={post?.category}
          />

          <Field
            label="Yazar"
            name="author"
            defaultValue={post?.author ?? "RDM Hukuk Bürosu"}
          />

          <Field
            label="Yayın tarihi"
            name="publishedAt"
            type="date"
            defaultValue={post?.publishedAt}
            required={false}
          />

          <div className="md:col-span-2">
            <TextArea
              label="Kısa özet"
              name="excerpt"
              defaultValue={post?.excerpt}
              rows={4}
            />
          </div>
        </div>
      </PanelSection>

      {/* COVER IMAGE */}
      <PanelSection
        title="Kapak Görseli"
        description="Blog kartında ve yazının detay sayfasında kullanılacak görseli seçin."
      >
        <div className="space-y-5">
          {(coverLibrary || post?.coverImage) && (
            <div className="relative aspect-[16/7] w-full max-w-[620px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <Image
                src={coverLibrary || post?.coverImage || ""}
                alt="Seçili kapak görseli"
                fill
                sizes="620px"
                className="object-contain"
              />
            </div>
          )}

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#152741] shadow-sm">
                <FiUploadCloud className="text-xl" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#152741]">
                  Yeni kapak görseli yükle
                </p>

                <p className="text-xs text-slate-500">
                  Önerilen görsel oranı 16:9
                </p>
              </div>
            </div>

            <Field
              label="Dosya seç"
              name="coverImage"
              type="file"
              hint="Dosya seçerseniz kütüphaneden seçilen görselin yerine kullanılır."
            />
          </div>

          <input
            type="hidden"
            name="coverImageLibrary"
            value={coverLibrary}
          />

          <button
            type="button"
            onClick={() =>
              setOpenLibraryFor((current) =>
                current === "cover" ? null : "cover"
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#152741] transition-colors hover:border-[#EFB059] hover:bg-slate-50"
          >
            <FiImage />

            {openLibraryFor === "cover"
              ? "Kütüphaneyi Kapat"
              : "Medya Kütüphanesinden Seç"}

            {openLibraryFor === "cover" ? (
              <FiX />
            ) : (
              <FiChevronDown />
            )}
          </button>

          {openLibraryFor === "cover" && (
            <ImageLibrary
              images={images}
              selectedUrl={
                coverLibrary || post?.coverImage
              }
              onSelect={(image) => {
                setCoverLibrary(image.url);
                setOpenLibraryFor(null);
              }}
            />
          )}
        </div>
      </PanelSection>

      {/* CONTENT EDITOR */}
      <PanelSection
        title="İçerik Editörü"
        description="Paragraflar, başlıklar, listeler ve görseller kullanarak yazınızı oluşturun."
      >
        <input
          type="hidden"
          name="blockCount"
          value={blocks.length}
        />

        <div className="space-y-5">
          {/* EDITOR INFO */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F3F6FA] px-4 py-3">
            <div className="flex items-center gap-2">
              <FiLayers className="text-[#152741]" />

              <span className="text-sm font-semibold text-[#152741]">
                İçerik Blokları
              </span>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
              {blocks.length} blok
            </span>
          </div>

          {/* BLOCK LIST */}
          {blocks.map((block, index) => {
            const isCollapsed = collapsedBlocks.includes(
              block.editorId
            );

            const BlockIcon = blockIcons[block.type];

            return (
              <div
                key={block.editorId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <input
                  type="hidden"
                  name={`blockType_${index}`}
                  value={block.type}
                />

                {/* BLOCK HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#FAFBFD] px-4 py-4 md:px-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#152741] text-xs font-bold text-white">
                      {index + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <BlockIcon className="text-slate-500" />

                      <span className="text-sm font-semibold text-[#152741]">
                        {blockLabels[block.type]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      disabled={index === 0}
                      aria-label="Bloğu yukarı taşı"
                      title="Yukarı taşı"
                      className={actionButtonClass}
                    >
                      <FiArrowUp />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      disabled={
                        index === blocks.length - 1
                      }
                      aria-label="Bloğu aşağı taşı"
                      title="Aşağı taşı"
                      className={actionButtonClass}
                    >
                      <FiArrowDown />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleCollapse(block.editorId)
                      }
                      aria-label={
                        isCollapsed
                          ? "Bloğu genişlet"
                          : "Bloğu daralt"
                      }
                      className={actionButtonClass}
                    >
                      <FiChevronDown
                        className={`transition-transform ${
                          isCollapsed ? "-rotate-90" : ""
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      disabled={blocks.length === 1}
                      aria-label="Bloğu sil"
                      title="Bloğu sil"
                      className={`${actionButtonClass} hover:border-red-200 hover:bg-red-50 hover:text-red-600`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* BLOCK BODY */}
                <div
                  className={
                    isCollapsed ? "hidden" : "space-y-5 p-4 md:p-5"
                  }
                >
                  {block.type === "heading" && (
                    <input
                      name={`blockText_${index}`}
                      value={block.text}
                      onChange={(event) =>
                        updateBlock(index, {
                          text: event.target.value,
                        })
                      }
                      required
                      maxLength={300}
                      placeholder="Bölüm başlığı yazın..."
                      className={`${inputClass} font-tusli text-lg font-bold`}
                    />
                  )}

                  {block.type === "paragraph" && (
                    <textarea
                      name={`blockText_${index}`}
                      value={block.text}
                      onChange={(event) =>
                        updateBlock(index, {
                          text: event.target.value,
                        })
                      }
                      required
                      rows={6}
                      maxLength={10000}
                      placeholder="Paragraf metnini yazın..."
                      className={`${inputClass} resize-y leading-7`}
                    />
                  )}

                  {block.type === "list" && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">
                        Her satır ayrı bir liste maddesi
                        olarak gösterilir.
                      </p>

                      <textarea
                        name={`blockItems_${index}`}
                        value={block.items.join("\n")}
                        onChange={(event) =>
                          updateBlock(index, {
                            items: event.target.value.split(
                              "\n"
                            ),
                          })
                        }
                        required
                        rows={6}
                        placeholder={
                          "Birinci madde\nİkinci madde\nÜçüncü madde"
                        }
                        className={`${inputClass} resize-y leading-7`}
                      />
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="grid gap-5 md:grid-cols-2">
                      {block.src && (
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:col-span-2">
                          <Image
                            src={block.src}
                            alt={
                              block.alt || "Blog görseli"
                            }
                            fill
                            sizes="700px"
                            className="object-contain"
                          />
                        </div>
                      )}

                      <input
                        type="hidden"
                        name={`blockImageUrl_${index}`}
                        value={block.src}
                      />

                      <label className="space-y-2 text-sm font-semibold text-[#152741]">
                        <span>
                          {block.src
                            ? "Görseli değiştir"
                            : "Görsel seç"}
                        </span>

                        <input
                          name={`blockImage_${index}`}
                          type="file"
                          required={!block.src}
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-normal text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#152741] file:px-4 file:py-2 file:font-semibold file:text-white"
                        />
                      </label>

                      <label className="space-y-2 text-sm font-semibold text-[#152741]">
                        <span>Görsel açıklaması</span>

                        <input
                          name={`blockImageAlt_${index}`}
                          value={block.alt}
                          onChange={(event) =>
                            updateBlock(index, {
                              alt: event.target.value,
                            })
                          }
                          maxLength={300}
                          placeholder="Görseli açıklayın"
                          className={inputClass}
                        />
                      </label>

                      <div className="md:col-span-2">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenLibraryFor((current) =>
                              current === block.editorId
                                ? null
                                : block.editorId
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#152741] transition-colors hover:border-[#EFB059]"
                        >
                          <FiImage />

                          {openLibraryFor === block.editorId
                            ? "Kütüphaneyi Kapat"
                            : "Kütüphaneden Görsel Seç"}
                        </button>
                      </div>

                      {openLibraryFor === block.editorId && (
                        <div className="md:col-span-2">
                          <ImageLibrary
                            images={images}
                            selectedUrl={block.src}
                            onSelect={(image) => {
                              updateBlock(index, {
                                src: image.url,
                                alt:
                                  block.alt || image.name,
                              });

                              setOpenLibraryFor(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* INSERT BLOCK */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <span className="mr-2 text-xs font-medium text-slate-500">
                      Altına ekle:
                    </span>

                    {(
                      [
                        "paragraph",
                        "heading",
                        "list",
                        "image",
                      ] as BlockType[]
                    ).map((type) => {
                      const Icon = blockIcons[type];

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            insertBlock(type, index)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-[#152741] transition-colors hover:border-[#EFB059] hover:bg-[#EFB059]/10"
                        >
                          <FiPlus />
                          <Icon />

                          {blockLabels[type]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ADD BLOCK AT END */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-6">
            <div className="mb-4 flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#152741] shadow-sm">
                <FiPlus className="text-xl" />
              </div>

              <h3 className="text-sm font-bold text-[#152741]">
                Yeni İçerik Bloğu Ekle
              </h3>

              <p className="text-xs text-slate-500">
                Yazınıza yeni bir bölüm ekleyin.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {(
                [
                  "heading",
                  "paragraph",
                  "list",
                  "image",
                ] as BlockType[]
              ).map((type) => {
                const Icon = blockIcons[type];

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      insertBlock(type, blocks.length - 1)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#152741] transition-all hover:border-[#EFB059] hover:shadow-sm"
                  >
                    <Icon />
                    {blockLabels[type]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PanelSection>

      {/* FOOTER ACTION */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#152741]">
            İçeriğiniz hazır mı?
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Kaydetmeden önce başlık, görseller ve içerikleri
            kontrol edin.
          </p>
        </div>

        <SaveButton>
          {post ? "Değişiklikleri Kaydet" : "Yazıyı Yayınla"}
        </SaveButton>
      </div>
    </form>
  );
}

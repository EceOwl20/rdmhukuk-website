"use client";

import { useState } from "react";
import Image from "next/image";

import type { BlogContentBlock, BlogPost } from "@/data/blog";
import type { StoredImage } from "@/lib/site-content-types";
import { saveBlogPostAction } from "@/app/yonetim/actions";
import { Field, PanelSection, SaveButton, TextArea } from "@/components/admin/FormFields";

type EditorBlock = BlogContentBlock & { editorId: string };
type BlockType = BlogContentBlock["type"];

const blockLabels: Record<BlockType, string> = {
  heading: "Başlık",
  paragraph: "Paragraf",
  list: "Madde listesi",
  image: "Görsel",
};

function initialBlocks(post?: BlogPost): EditorBlock[] {
  if (!post?.content.length) {
    return [{ type: "paragraph", text: "", editorId: "new-paragraph-0" }];
  }

  return post.content.flatMap((block, blockIndex) => {
    if ("type" in block) {
      return [{ ...block, editorId: `block-${blockIndex}` }];
    }
    const converted: EditorBlock[] = [];
    if (block.heading) {
      converted.push({ type: "heading", text: block.heading, editorId: `legacy-heading-${blockIndex}` });
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
  if (type === "list") return { type, items: [""], editorId };
  if (type === "image") return { type, src: "", alt: "", editorId };
  return { type, text: "", editorId };
}

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
    return <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Kütüphanede henüz görsel yok. Önce Görseller bölümünden veya buradaki dosya alanından bir görsel yükleyin.</p>;
  }
  return (
    <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-3 md:grid-cols-4">
      {images.map((image) => (
        <button key={image.id} type="button" onClick={() => onSelect(image)} className={`overflow-hidden rounded-lg border-2 text-left transition ${selectedUrl === image.url ? "border-[#EFB059]" : "border-transparent hover:border-slate-300"}`}>
          <span className="relative block aspect-square bg-slate-100">
            <Image src={image.url} alt={image.name} fill sizes="160px" className="object-contain" />
          </span>
          <span className="block truncate px-2 py-2 text-xs font-semibold" title={image.name}>{image.name}</span>
        </button>
      ))}
    </div>
  );
}

export default function BlogEditor({ post, images }: { post?: BlogPost; images: StoredImage[] }) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => initialBlocks(post));
  const [openLibraryFor, setOpenLibraryFor] = useState<string | null>(null);
  const [coverLibrary, setCoverLibrary] = useState("");

  function insertBlock(type: BlockType, afterIndex = blocks.length - 1) {
    const block = createBlock(type);
    setBlocks((current) => {
      const next = [...current];
      next.splice(afterIndex + 1, 0, block);
      return next;
    });
  }

  function updateBlock(index: number, update: Partial<EditorBlock>) {
    setBlocks((current) => current.map((block, blockIndex) => (
      blockIndex === index ? { ...block, ...update } as EditorBlock : block
    )));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeBlock(index: number) {
    setBlocks((current) => current.length === 1 ? current : current.filter((_, blockIndex) => blockIndex !== index));
  }

  return (
    <form action={saveBlogPostAction} className="space-y-7">
      {post && <input type="hidden" name="id" value={post.id} />}
      <PanelSection title={post ? "Blog yazısını düzenle" : "Yeni blog yazısı"} description="İçeriği bağımsız bloklarla oluşturun. Her bloğun altına paragraf, liste, başlık veya görsel ekleyebilirsiniz.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Yazı başlığı" name="title" defaultValue={post?.title} /></div>
          <Field label="URL adresi" name="slug" defaultValue={post?.slug} required={false} hint="Boş bırakılırsa başlıktan otomatik oluşturulur." />
          <Field label="Kategori" name="category" defaultValue={post?.category} />
          <Field label="Yazar" name="author" defaultValue={post?.author ?? "RDM Hukuk Bürosu"} />
          <Field label="Yayın tarihi" name="publishedAt" type="date" defaultValue={post?.publishedAt} required={false} />
          <div className="md:col-span-2"><TextArea label="Kısa özet" name="excerpt" defaultValue={post?.excerpt} rows={4} /></div>
          <div className="space-y-4 md:col-span-2">
            <Field label="Yeni kapak görseli yükle" name="coverImage" type="file" hint="Dosya seçerseniz kütüphaneden seçilen görselin yerine kullanılır. Önerilen oran: 16:9." />
            <input type="hidden" name="coverImageLibrary" value={coverLibrary} />
            <button type="button" onClick={() => setOpenLibraryFor((current) => current === "cover" ? null : "cover")} className="rounded-lg border border-[#152741] bg-white px-4 py-2.5 text-sm font-semibold text-[#152741]">
              {openLibraryFor === "cover" ? "Kütüphaneyi kapat" : "Kütüphaneden kapak seç"}
            </button>
            {(coverLibrary || post?.coverImage) && <p className="text-xs text-slate-500">Seçili kapak: {coverLibrary || post?.coverImage}</p>}
            {openLibraryFor === "cover" && (
              <ImageLibrary images={images} selectedUrl={coverLibrary || post?.coverImage} onSelect={(image) => { setCoverLibrary(image.url); setOpenLibraryFor(null); }} />
            )}
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Yazı içeriği" description="Blokları oklarla sıralayabilir, istediğiniz bloğun hemen altına yeni içerik ekleyebilirsiniz.">
        <input type="hidden" name="blockCount" value={blocks.length} />
        <div className="space-y-5">
          {blocks.map((block, index) => (
            <div key={block.editorId} className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
              <input type="hidden" name={`blockType_${index}`} value={block.type} />
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#152741] text-xs font-bold text-white">{index + 1}</span>
                  <strong className="text-sm text-[#152741]">{blockLabels[block.type]}</strong>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-30" aria-label="Bloğu yukarı taşı">↑</button>
                  <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-30" aria-label="Bloğu aşağı taşı">↓</button>
                  <button type="button" onClick={() => removeBlock(index)} disabled={blocks.length === 1} className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 disabled:opacity-30">Sil</button>
                </div>
              </div>

              {block.type === "heading" && (
                <input name={`blockText_${index}`} value={block.text} onChange={(event) => updateBlock(index, { text: event.target.value })} required maxLength={300} placeholder="Bölüm başlığı" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#EFB059]" />
              )}
              {block.type === "paragraph" && (
                <textarea name={`blockText_${index}`} value={block.text} onChange={(event) => updateBlock(index, { text: event.target.value })} required rows={6} maxLength={10000} placeholder="Paragraf metnini yazın…" className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 leading-7 outline-none focus:border-[#EFB059]" />
              )}
              {block.type === "list" && (
                <textarea name={`blockItems_${index}`} value={block.items.join("\n")} onChange={(event) => updateBlock(index, { items: event.target.value.split("\n") })} required rows={6} placeholder={"Her satıra bir madde yazın\nİkinci madde\nÜçüncü madde"} className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 leading-7 outline-none focus:border-[#EFB059]" />
              )}
              {block.type === "image" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {block.src && (
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-200 md:col-span-2">
                      <Image src={block.src} alt={block.alt || "Blog görseli"} fill sizes="700px" className="object-contain" />
                    </div>
                  )}
                  <input type="hidden" name={`blockImageUrl_${index}`} value={block.src} />
                  <label className="text-sm font-semibold">{block.src ? "Görseli değiştir" : "Görsel seç"}<input name={`blockImage_${index}`} type="file" required={!block.src} accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#152741] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#203b61]" /></label>
                  <label className="text-sm font-semibold">Görsel açıklaması<input name={`blockImageAlt_${index}`} value={block.alt} onChange={(event) => updateBlock(index, { alt: event.target.value })} maxLength={300} placeholder="Erişilebilirlik için görseli açıklayın" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#EFB059]" /></label>
                  <div className="md:col-span-2">
                    <button type="button" onClick={() => setOpenLibraryFor((current) => current === block.editorId ? null : block.editorId)} className="rounded-lg border border-[#152741] bg-white px-4 py-2.5 text-sm font-semibold text-[#152741]">
                      {openLibraryFor === block.editorId ? "Kütüphaneyi kapat" : "Kütüphaneden görsel seç"}
                    </button>
                  </div>
                  {openLibraryFor === block.editorId && (
                    <div className="md:col-span-2">
                      <ImageLibrary images={images} selectedUrl={block.src} onSelect={(image) => {
                        updateBlock(index, { src: image.url, alt: block.alt || image.name });
                        setOpenLibraryFor(null);
                      }} />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                <span className="mr-1 text-xs font-semibold text-slate-500">Bu bloğun altına:</span>
                {(["paragraph", "heading", "list", "image"] as BlockType[]).map((type) => (
                  <button key={type} type="button" onClick={() => insertBlock(type, index)} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#152741] hover:border-[#EFB059]">+ {blockLabels[type]}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PanelSection>
      <SaveButton>{post ? "Yazıyı güncelle" : "Yazıyı yayınla"}</SaveButton>
    </form>
  );
}

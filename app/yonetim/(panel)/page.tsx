import { updateContactAction, updateHomeAction } from "@/app/yonetim/actions";
import ContentImageField from "@/components/admin/ContentImageField";
import { Field, SaveButton, TextArea } from "@/components/admin/FormFields";
import { getImages, getSiteContent } from "@/lib/content-store";

function EditorGroup({
  number,
  title,
  description,
  children,
  open = false,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 marker:hidden md:px-7">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#152741] text-sm font-bold text-white">{number}</span>
        <span className="min-w-0 flex-1">
          <strong className="block text-lg text-[#152741]">{title}</strong>
          <span className="mt-1 block text-sm font-normal text-slate-500">{description}</span>
        </span>
        <span className="text-xl text-[#D79B43] transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="border-t border-slate-100 bg-white px-5 py-6 md:px-7">{children}</div>
    </details>
  );
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>;
}) {
  const [content, images, params] = await Promise.all([getSiteContent(), getImages(), searchParams]);
  const { home, contact } = content;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="overflow-hidden rounded-2xl bg-[#152741] px-6 py-7 text-white shadow-lg md:px-9 md:py-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#EFB059]">İçerik yönetimi</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Sayfa İçerikleri</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Düzenlemek istediğiniz sayfayı ve bölümü seçin. Bölümler açılıp kapanabilir; mevcut görseller her zaman kütüphanede korunur.</p>
          </div>
          <div className="flex gap-2">
            <a href="#anasayfa" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#152741]">Anasayfa</a>
            <a href="#iletisim" className="rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white">İletişim</a>
          </div>
        </div>
      </header>

      {params.durum && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Değişiklikler başarıyla kaydedildi ve siteye yansıtıldı.</p>}

      <section id="anasayfa" className="scroll-mt-6 space-y-5">
        <div className="flex items-center gap-4">
          <span className="h-10 w-1 rounded-full bg-[#EFB059]" />
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sayfa 01</p><h2 className="text-2xl font-bold text-[#152741]">Anasayfa</h2></div>
        </div>

        <form action={updateHomeAction} className="space-y-5">
          <EditorGroup number="01" title="Görseller" description="Kullanılan görseli görün, arşivden seçin veya yeni bir dosya yükleyin." open>
            <div className="grid gap-5 md:grid-cols-2">
              <ContentImageField label="Masaüstü ana görsel" uploadName="heroDesktopImage" libraryName="heroDesktopImageLibrary" currentUrl={home.heroDesktopImage} images={images} />
              <ContentImageField label="Mobil ana görsel" uploadName="heroMobileImage" libraryName="heroMobileImageLibrary" currentUrl={home.heroMobileImage} images={images} />
              <ContentImageField label="Hakkımızda masaüstü" uploadName="aboutDesktopImage" libraryName="aboutDesktopImageLibrary" currentUrl={home.about.desktopImage} images={images} />
              <ContentImageField label="Hakkımızda mobil" uploadName="aboutMobileImage" libraryName="aboutMobileImageLibrary" currentUrl={home.about.mobileImage} images={images} />
              <ContentImageField label="Ekip fotoğrafı" uploadName="staffImage" libraryName="staffImageLibrary" currentUrl={home.staff.image} images={images} />
            </div>
          </EditorGroup>

          <EditorGroup number="02" title="Ana ekran yazıları" description="Ana görsel üzerinde sırayla gösterilen başlık ve açıklamalar.">
            <div className="space-y-5">
              {home.heroSlides.map((slide, index) => (
                <div key={slide.id} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                  <Field label={`${index + 1}. başlık`} name={`heroTitle_${index}`} defaultValue={slide.title} />
                  <div className="md:col-span-2"><TextArea label="Açıklama" name={`heroDescription_${index}`} defaultValue={slide.description} rows={3} /></div>
                </div>
              ))}
            </div>
          </EditorGroup>

          <EditorGroup number="03" title="Hizmetlerimiz" description="Hizmet giriş yazısı, detay kartları ve açılır kart içerikleri.">
            <div className="space-y-6">
              <Field label="Bölüm başlığı" name="servicesTitle" defaultValue={home.servicesTitle} />
              <TextArea label="Giriş yazısı" name="servicesIntro" defaultValue={home.servicesIntro} rows={5} />
              <h3 className="border-b border-slate-200 pb-2 font-bold">Hizmet detayları</h3>
              {home.services.map((service, index) => (
                <div key={service.id} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                  <Field label="Başlık" name={`serviceTitle_${index}`} defaultValue={service.title} />
                  <div className="md:col-span-2"><TextArea label="Açıklama" name={`serviceDescription_${index}`} defaultValue={service.description} rows={4} /></div>
                </div>
              ))}
              <h3 className="border-b border-slate-200 pb-2 pt-2 font-bold">Açılır hizmet kartları</h3>
              {home.serviceSlides.map((service, index) => (
                <div key={service.id} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                  <Field label="Başlık" name={`serviceSlideTitle_${index}`} defaultValue={service.title} />
                  <div className="md:col-span-2"><TextArea label="Açıklama" name={`serviceSlideDescription_${index}`} defaultValue={service.description} rows={4} /></div>
                </div>
              ))}
            </div>
          </EditorGroup>

          <EditorGroup number="04" title="Hakkımızda ve ekip" description="Kurumsal tanıtım metinleri ile avukat bilgileri.">
            <div className="space-y-5">
              <Field label="Hakkımızda başlığı" name="aboutTitle" defaultValue={home.about.title} />
              {home.about.paragraphs.map((paragraph, index) => <TextArea key={index} label={`${index + 1}. paragraf`} name={`aboutParagraph_${index}`} defaultValue={paragraph} rows={5} />)}
              <div className="grid gap-5 border-t border-slate-200 pt-5 md:grid-cols-2">
                <Field label="Avukat adı" name="lawyerName" defaultValue={home.about.lawyer.name} />
                <Field label="Ekip kartı adı" name="staffName" defaultValue={home.staff.name} />
                <div className="md:col-span-2"><TextArea label="Hakkımızda avukat açıklaması" name="lawyerDescription" defaultValue={home.about.lawyer.description} rows={5} /></div>
                <Field label="Uzmanlık" name="staffSpecialization" defaultValue={home.staff.specialization} />
                <div className="md:col-span-2"><TextArea label="Ekip açıklaması" name="staffDescription" defaultValue={home.staff.description} rows={5} /></div>
              </div>
            </div>
          </EditorGroup>

          <div className="sticky bottom-4 z-10 flex justify-end rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur"><SaveButton>Anasayfayı kaydet</SaveButton></div>
        </form>
      </section>

      <section id="iletisim" className="scroll-mt-6 space-y-5 pt-6">
        <div className="flex items-center gap-4">
          <span className="h-10 w-1 rounded-full bg-[#EFB059]" />
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sayfa 02</p><h2 className="text-2xl font-bold text-[#152741]">İletişim</h2></div>
        </div>
        <form action={updateContactAction} className="space-y-5">
          <EditorGroup number="01" title="İletişim görseli" description="Sayfanın üst kısmında kullanılan görsel." open>
            <div className="max-w-2xl"><ContentImageField label="İletişim ana görseli" uploadName="heroImage" libraryName="heroImageLibrary" currentUrl={contact.heroImage} images={images} /></div>
          </EditorGroup>
          <EditorGroup number="02" title="İletişim bilgileri" description="Başlık, telefon, e-posta, adres ve harita bilgileri." open>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Sayfa başlığı" name="title" defaultValue={contact.title} />
              <Field label="Telefon" name="phone" defaultValue={contact.phone} />
              <Field label="E-posta" name="email" type="email" defaultValue={contact.email} />
              <Field label="Kısa konum" name="location" defaultValue={contact.location} />
              <div className="md:col-span-2"><TextArea label="Adres" name="address" defaultValue={contact.address} rows={3} /></div>
              <div className="md:col-span-2"><TextArea label="İletişim giriş yazısı" name="intro" defaultValue={contact.intro} rows={4} /></div>
              <div className="md:col-span-2"><TextArea label="Google Maps embed adresi" name="mapEmbedUrl" defaultValue={contact.mapEmbedUrl} rows={3} hint="Google Maps > Paylaş > Harita yerleştirme içindeki src adresi" /></div>
            </div>
          </EditorGroup>
          <div className="sticky bottom-4 z-10 flex justify-end rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur"><SaveButton>İletişim sayfasını kaydet</SaveButton></div>
        </form>
      </section>
    </div>
  );
}

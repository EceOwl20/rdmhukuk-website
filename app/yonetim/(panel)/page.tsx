
import type { ReactNode } from "react";
import Link from "next/link";

import {
  FiCheckCircle,
  FiChevronDown,
  FiEdit3,
  FiFileText,
  FiGlobe,
  FiImage,
  FiInfo,
  FiLayers,
  FiMail,
  FiMonitor,
  FiSave,
  FiSmartphone,
  FiType,
  FiUsers,
} from "react-icons/fi";

import {
  updateContactAction,
  updateHomeAction,
} from "@/app/yonetim/actions";

import ContentImageField from "@/components/admin/ContentImageField";

import {
  Field,
  SaveButton,
  TextArea,
} from "@/components/admin/FormFields";

import {
  getImages,
  getSiteContent,
} from "@/lib/content-store";
import { requireAdmin } from "@/lib/admin-auth";

/* -----------------------------------------
   COMMON STYLES
----------------------------------------- */

const editorCardClass =
  "rounded-xl border border-slate-200/80 bg-slate-50/70 " +
  "p-3 sm:p-4 lg:p-5";

const groupGridClass =
  "grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2";

const sectionDescriptionClass =
  "text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6";

/* -----------------------------------------
   EDITOR GROUP
----------------------------------------- */

function EditorGroup({
  number,
  title,
  description,
  icon: Icon,
  children,
  open = false,
}: {
  number: string;
  title: string;
  description: string;
  icon: typeof FiImage;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(21,39,65,0.035)] transition-shadow duration-200 hover:shadow-[0_6px_22px_rgba(21,39,65,0.065)]"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 marker:hidden sm:gap-4 sm:px-5 sm:py-5 lg:px-7 [&::-webkit-details-marker]:hidden">
        {/* ICON */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F3F7] text-[#152741] sm:h-12 sm:w-12">
          <Icon className="text-lg sm:text-xl" />
        </div>

        {/* TITLE */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold leading-5 text-[#152741] sm:text-[16px] lg:text-[17px]">
              {title}
            </h3>

            <span className="rounded-md bg-[#EFB059]/15 px-2 py-0.5 text-[10px] font-semibold text-[#A47434]">
              {number}
            </span>
          </div>

          <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-[12px] lg:text-[13px]">
            {description}
          </p>
        </div>

        {/* CHEVRON */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors group-hover:border-[#EFB059]/60 group-hover:text-[#152741] sm:h-9 sm:w-9">
          <FiChevronDown className="text-base transition-transform duration-200 group-open:rotate-180" />
        </div>
      </summary>

      <div className="border-t border-slate-100 px-4 py-5 sm:px-5 sm:py-6 lg:px-7 lg:py-7">
        {children}
      </div>
    </details>
  );
}

/* -----------------------------------------
   PAGE HEADING
----------------------------------------- */

function PageHeading({
  number,
  title,
  description,
  icon: Icon,
  href,
}: {
  number: string;
  title: string;
  description: string;
  icon: typeof FiImage;
  href: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF3E2] text-[#B67B2E] sm:h-12 sm:w-12">
          <Icon className="text-xl" />
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            SAYFA {number}
          </p>

          <h2 className="text-lg font-bold text-[#152741] sm:text-xl lg:text-[23px]">
            {title}
          </h2>

          <p className="mt-1 text-[11px] text-slate-500 sm:text-[13px]">
            {description}
          </p>
        </div>
      </div>

      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#152741] transition-colors hover:border-[#EFB059] sm:text-xs"
      >
        <FiGlobe className="text-sm" />
        Sayfayı Gör
      </Link>
    </div>
  );
}

/* -----------------------------------------
   INNER EDITOR CARD
----------------------------------------- */

function ItemCard({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <div className={editorCardClass}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#152741] text-[11px] font-semibold text-white">
          {number.toString().padStart(2, "0")}
        </span>

        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#738595]">
          İçerik {number}
        </span>
      </div>

      {children}
    </div>
  );
}

/* -----------------------------------------
   FORM SECTION LABEL
----------------------------------------- */

function FormSectionLabel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-slate-200 pb-3">
      <h4 className="text-[13px] font-semibold text-[#152741] sm:text-[15px]">
        {title}
      </h4>

      {description && (
        <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
          {description}
        </p>
      )}
    </div>
  );
}

/* -----------------------------------------
   SAVE BAR
----------------------------------------- */

function SaveBar({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="sticky bottom-2 z-20 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-[0_8px_35px_rgba(21,39,65,0.12)] backdrop-blur-md sm:bottom-4 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="hidden items-center gap-3 sm:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF0F5] text-[#152741]">
          <FiSave />
        </div>

        <div>
          <p className="text-xs font-semibold text-[#152741]">
            Değişiklikleri Kaydet
          </p>

          <p className="mt-0.5 text-[11px] text-slate-500">
            Düzenlediğiniz alanları siteye uygulayın.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
        <SaveButton>{children}</SaveButton>
      </div>
    </div>
  );
}

/* -----------------------------------------
   ADMIN CONTENT PAGE
----------------------------------------- */

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>;
}) {
  await requireAdmin();

  const [content, images, params] = await Promise.all([
    getSiteContent(),
    getImages(),
    searchParams,
  ]);

  const { home, contact } = content;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7 pb-10 sm:space-y-8 lg:space-y-10">

      {/* PAGE HEADER */}
      <header className="relative overflow-hidden rounded-2xl bg-[#152741] px-5 py-6 text-white shadow-[0_12px_35px_rgba(21,39,65,0.12)] sm:px-7 sm:py-8 lg:px-9 lg:py-10">
        {/* DECORATIVE ELEMENTS */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 -right-10 h-64 w-64 rounded-full border border-[#EFB059]/15"
        />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#EFB059]/20 bg-[#EFB059]/10 px-3 py-1.5">
              <FiEdit3 className="text-[12px] text-[#EFB059]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#EFB059] sm:text-[11px]">
                İçerik Yönetimi
              </span>
            </div>

            <h1 className="text-[24px] font-bold leading-tight text-white sm:text-[30px] lg:text-[36px]">
              Sayfa İçerikleri
            </h1>

            <p className="mt-3 max-w-xl text-[12px] leading-[1.8] text-white/65 sm:text-[13px] lg:text-[14px]">
              Web sitenizin ana sayfa ve iletişim içeriklerini
              kolayca düzenleyin. Metinleri güncelleyin,
              görselleri değiştirin ve kaydedin.
            </p>
          </div>

          {/* PAGE SHORTCUTS */}
          <nav
            aria-label="Sayfa bölümleri"
            className="flex w-full flex-wrap gap-2 lg:w-auto"
          >
            <a
              href="#anasayfa"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#152741] transition-colors hover:bg-[#EFB059] sm:flex-none sm:text-sm"
            >
              <FiMonitor />
              Anasayfa
            </a>

            <a
              href="#iletisim"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:flex-none sm:text-sm"
            >
              <FiMail />
              İletişim
            </a>
          </nav>
        </div>
      </header>

      {/* SUCCESS MESSAGE */}
      {params.durum && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-600" />

          <div>
            <p className="text-[13px] font-semibold text-emerald-800 sm:text-sm">
              Değişiklikler kaydedildi
            </p>

            <p className="mt-1 text-[11px] leading-5 text-emerald-700 sm:text-xs">
              İçerikler başarıyla güncellendi ve web sitesine
              yansıtıldı.
            </p>
          </div>
        </div>
      )}

      {/* =====================================
          HOME PAGE
      ===================================== */}

      <section
        id="anasayfa"
        className="scroll-mt-5 space-y-5 sm:space-y-6"
      >
        <PageHeading
          number="01"
          title="Anasayfa"
          description="Ana sayfadaki görseller ve metinler"
          icon={FiMonitor}
          href="/"
        />

        <form
          action={updateHomeAction}
          className="space-y-4 sm:space-y-5"
        >
          {/* HOME IMAGES */}
          <EditorGroup
            number="01"
            title="Görseller"
            description="Masaüstü, mobil ve ekip görsellerini yönetin."
            icon={FiImage}
            open
          >
            <div className={groupGridClass}>
              <ContentImageField
                label="Masaüstü ana görsel"
                uploadName="heroDesktopImage"
                libraryName="heroDesktopImageLibrary"
                currentUrl={home.heroDesktopImage}
                images={images}
              />

              <ContentImageField
                label="Mobil ana görsel"
                uploadName="heroMobileImage"
                libraryName="heroMobileImageLibrary"
                currentUrl={home.heroMobileImage}
                images={images}
              />

              <ContentImageField
                label="Hakkımızda masaüstü"
                uploadName="aboutDesktopImage"
                libraryName="aboutDesktopImageLibrary"
                currentUrl={home.about.desktopImage}
                images={images}
              />

              <ContentImageField
                label="Hakkımızda mobil"
                uploadName="aboutMobileImage"
                libraryName="aboutMobileImageLibrary"
                currentUrl={home.about.mobileImage}
                images={images}
              />

              <ContentImageField
                label="Ekip fotoğrafı"
                uploadName="staffImage"
                libraryName="staffImageLibrary"
                currentUrl={home.staff.image}
                images={images}
              />
            </div>
          </EditorGroup>

          {/* HERO SLIDES */}
          <EditorGroup
            number="02"
            title="Ana Ekran Yazıları"
            description="Ana görselde gösterilen başlık ve açıklamalar."
            icon={FiType}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg bg-[#F1F5F9] p-3 text-[11px] leading-5 text-slate-600 sm:text-xs">
                <FiInfo className="mt-0.5 shrink-0 text-sm text-[#738595]" />

                <p>
                  Her kart ana ekranda gösterilen bir slaytı
                  temsil eder. Buradaki sıralama sitedeki
                  gösterim sıralamasıdır.
                </p>
              </div>

              {home.heroSlides.map((slide, index) => (
                <ItemCard
                  key={slide.id}
                  number={index + 1}
                >
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                    <Field
                      label={`${index + 1}. başlık`}
                      name={`heroTitle_${index}`}
                      defaultValue={slide.title}
                    />

                    <div className="lg:col-span-2">
                      <TextArea
                        label="Açıklama"
                        name={`heroDescription_${index}`}
                        defaultValue={slide.description}
                        rows={3}
                      />
                    </div>
                  </div>
                </ItemCard>
              ))}
            </div>
          </EditorGroup>

          {/* SERVICES */}
          <EditorGroup
            number="03"
            title="Hizmetlerimiz"
            description="Hizmet başlıkları, açıklamalar ve açılır kart içerikleri."
            icon={FiLayers}
          >
            <div className="space-y-7">
              {/* INTRO */}
              <div className="space-y-4">
                <FormSectionLabel
                  title="Bölüm Giriş Alanı"
                  description="Hizmetlerimiz bölümünün üst kısmındaki metinler."
                />

                <Field
                  label="Bölüm başlığı"
                  name="servicesTitle"
                  defaultValue={home.servicesTitle}
                />

                <TextArea
                  label="Giriş yazısı"
                  name="servicesIntro"
                  defaultValue={home.servicesIntro}
                  rows={5}
                />
              </div>

              {/* SERVICE DETAILS */}
              <div className="space-y-4">
                <FormSectionLabel
                  title="Hizmet Detayları"
                  description="Hizmet açıklamalarını ayrı ayrı düzenleyin."
                />

                {home.services.map((service, index) => (
                  <ItemCard
                    key={service.id}
                    number={index + 1}
                  >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                      <Field
                        label="Başlık"
                        name={`serviceTitle_${index}`}
                        defaultValue={service.title}
                      />

                      <div className="lg:col-span-2">
                        <TextArea
                          label="Açıklama"
                          name={`serviceDescription_${index}`}
                          defaultValue={service.description}
                          rows={4}
                        />
                      </div>
                    </div>
                  </ItemCard>
                ))}
              </div>

              {/* SERVICE SLIDES */}
              <div className="space-y-4">
                <FormSectionLabel
                  title="Açılır Hizmet Kartları"
                  description="Ziyaretçilerin tıklayarak genişlettiği hizmet kartları."
                />

                {home.serviceSlides.map((service, index) => (
                  <ItemCard
                    key={service.id}
                    number={index + 1}
                  >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                      <Field
                        label="Başlık"
                        name={`serviceSlideTitle_${index}`}
                        defaultValue={service.title}
                      />

                      <div className="lg:col-span-2">
                        <TextArea
                          label="Açıklama"
                          name={`serviceSlideDescription_${index}`}
                          defaultValue={service.description}
                          rows={4}
                        />
                      </div>
                    </div>
                  </ItemCard>
                ))}
              </div>
            </div>
          </EditorGroup>

          {/* ABOUT & STAFF */}
          <EditorGroup
            number="04"
            title="Hakkımızda ve Ekip"
            description="Kurumsal tanıtım, avukat bilgileri ve ekip açıklamaları."
            icon={FiUsers}
          >
            <div className="space-y-7">
              {/* ABOUT */}
              <div className="space-y-4">
                <FormSectionLabel
                  title="Hakkımızda İçerikleri"
                />

                <Field
                  label="Hakkımızda başlığı"
                  name="aboutTitle"
                  defaultValue={home.about.title}
                />

                {home.about.paragraphs.map(
                  (paragraph, index) => (
                    <TextArea
                      key={index}
                      label={`${index + 1}. paragraf`}
                      name={`aboutParagraph_${index}`}
                      defaultValue={paragraph}
                      rows={5}
                    />
                  )
                )}
              </div>

              {/* LAWYER & STAFF */}
              <div className="space-y-4">
                <FormSectionLabel
                  title="Avukat ve Ekip Bilgileri"
                />

                <div className={groupGridClass}>
                  <Field
                    label="Avukat adı"
                    name="lawyerName"
                    defaultValue={home.about.lawyer.name}
                  />

                  <Field
                    label="Ekip kartı adı"
                    name="staffName"
                    defaultValue={home.staff.name}
                  />

                  <div className="md:col-span-2">
                    <TextArea
                      label="Hakkımızda avukat açıklaması"
                      name="lawyerDescription"
                      defaultValue={
                        home.about.lawyer.description
                      }
                      rows={5}
                    />
                  </div>

                  <Field
                    label="Uzmanlık"
                    name="staffSpecialization"
                    defaultValue={
                      home.staff.specialization
                    }
                  />

                  <div className="md:col-span-2">
                    <TextArea
                      label="Ekip açıklaması"
                      name="staffDescription"
                      defaultValue={
                        home.staff.description
                      }
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            </div>
          </EditorGroup>

          {/* HOME SAVE */}
          <SaveBar>
            Anasayfayı kaydet
          </SaveBar>
        </form>
      </section>

      {/* =====================================
          CONTACT PAGE
      ===================================== */}

      <section
        id="iletisim"
        className="scroll-mt-5 space-y-5 pt-5 sm:space-y-6 sm:pt-8"
      >
        <PageHeading
          number="02"
          title="İletişim"
          description="İletişim sayfasının görselleri ve bilgileri"
          icon={FiMail}
          href="/iletisim"
        />

        <form
          action={updateContactAction}
          className="space-y-4 sm:space-y-5"
        >
          {/* CONTACT IMAGE */}
          <EditorGroup
            number="01"
            title="İletişim Görseli"
            description="İletişim sayfasının üst bölümündeki ana görsel."
            icon={FiImage}
            open
          >
            <div className="max-w-2xl">
              <ContentImageField
                label="İletişim ana görseli"
                uploadName="heroImage"
                libraryName="heroImageLibrary"
                currentUrl={contact.heroImage}
                images={images}
              />
            </div>
          </EditorGroup>

          {/* CONTACT INFORMATION */}
          <EditorGroup
            number="02"
            title="İletişim Bilgileri"
            description="Telefon, e-posta, adres, başlık ve harita bilgileri."
            icon={FiFileText}
            open
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <FormSectionLabel
                  title="Genel Bilgiler"
                  description="Web sitesinde görünen iletişim bilgileri."
                />

                <div className={groupGridClass}>
                  <Field
                    label="Sayfa başlığı"
                    name="title"
                    defaultValue={contact.title}
                  />

                  <Field
                    label="Telefon"
                    name="phone"
                    defaultValue={contact.phone}
                  />

                  <Field
                    label="E-posta"
                    name="email"
                    type="email"
                    defaultValue={contact.email}
                  />

                  <Field
                    label="Kısa konum"
                    name="location"
                    defaultValue={contact.location}
                  />

                  <div className="md:col-span-2">
                    <TextArea
                      label="Adres"
                      name="address"
                      defaultValue={contact.address}
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <TextArea
                      label="İletişim giriş yazısı"
                      name="intro"
                      defaultValue={contact.intro}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* MAP */}
              <div className="space-y-4">
                <FormSectionLabel
                  title="Harita Ayarları"
                  description="İletişim sayfasında gösterilen Google Haritalar bağlantısı."
                />

                <TextArea
                  label="Google Maps embed adresi"
                  name="mapEmbedUrl"
                  defaultValue={contact.mapEmbedUrl}
                  rows={3}
                  hint="Google Maps > Paylaş > Harita yerleştirme içindeki src adresi"
                />
              </div>
            </div>
          </EditorGroup>

          {/* CONTACT SAVE */}
          <SaveBar>
            İletişim sayfasını kaydet
          </SaveBar>
        </form>
      </section>
    </div>
  );
}

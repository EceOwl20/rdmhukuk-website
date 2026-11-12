
export type BlogBlock = {
  heading?: string;
  paragraphs: string[];
};

export type BlogContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string };

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt?: string;
  coverImage?: string;
  content: Array<BlogBlock | BlogContentBlock>;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "kisisel-verilerin-korunmasi",
    title: "Kişisel Verilerin Korunması Hakkında Genel Bilgiler",
    excerpt:
      "Kişisel verilerin korunması, veri işleme süreçleri ve kurumların bu alandaki sorumluluklarına genel bir bakış.",
    category: "KVKK",
    author: "RDM Hukuk Bürosu",
    content: [
      {
        heading: "Kişisel Verilerin Korunması Nedir?",
        paragraphs: [
          "Kişisel verilerin korunması, bireylerin kendileriyle ilgili bilgilerin işlenmesi üzerindeki haklarıyla ve veri sorumlularının yükümlülükleriyle ilgilidir.",
          "Kurumlar açısından veri işleme faaliyetlerinin belirlenmesi, bilgilendirme süreçlerinin yürütülmesi ve uygun güvenlik tedbirlerinin değerlendirilmesi önem taşır.",
        ],
      },
      {
        heading: "Kurumsal Uyum Süreçleri",
        paragraphs: [
          "Kurumsal uyum çalışmaları, veri işleme faaliyetlerinin incelenmesini, ilgili belgelerin hazırlanmasını ve süreçlerin düzenli olarak gözden geçirilmesini kapsayabilir.",
          "Her kuruluşun faaliyetleri ve veri işleme süreçleri farklı olduğundan değerlendirmelerin somut koşullara göre yapılması gerekir.",
        ],
      },
    ],
  },
  {
    id: "2",
    slug: "saglik-hukuku-ve-hasta-haklari",
    title: "Sağlık Hukuku ve Hasta Hakları",
    excerpt:
      "Sağlık hizmetleri kapsamında hasta hakları, bilgilendirme süreçleri ve hukuki sorumluluklara ilişkin genel konular.",
    category: "Sağlık Hukuku",
    author: "RDM Hukuk Bürosu",
    content: [
      {
        heading: "Sağlık Hukukunun Kapsamı",
        paragraphs: [
          "Sağlık hukuku; sağlık hizmetlerinin sunulması, hasta hakları ve sağlık kuruluşlarının hukuki sorumlulukları gibi konuları ele alır.",
          "Sağlık hizmeti sunan kuruluşlar için sözleşmelerin, bilgilendirme süreçlerinin ve kayıt uygulamalarının değerlendirilmesi önemli olabilir.",
        ],
      },
      {
        heading: "Hasta Hakları ve Bilgilendirme",
        paragraphs: [
          "Hastaların bilgilendirilmesi ve tıbbi müdahalelere ilişkin onam süreçleri, sağlık hukukunun önemli başlıkları arasındadır.",
        ],
      },
    ],
  },
  {
    id: "3",
    slug: "sirketler-hukukuna-giris",
    title: "Şirketler Hukukuna Giriş",
    excerpt:
      "Şirket kuruluşundan sözleşmelere ve ticari uyuşmazlıklara kadar şirketler hukukunun temel çalışma alanları.",
    category: "Şirketler Hukuku",
    author: "RDM Hukuk Bürosu",
    content: [
      {
        heading: "Şirketler Hukuku Neleri Kapsar?",
        paragraphs: [
          "Şirketler hukuku, ticari şirketlerin kuruluşundan yönetimine, ortaklık ilişkilerinden yapısal değişikliklerine kadar farklı konuları kapsar.",
          "Şirketlerin hukuki ihtiyaçları faaliyet alanlarına, organizasyonlarına ve ticari ilişkilerine göre değişiklik gösterebilir.",
        ],
      },
      {
        heading: "Sözleşmelerin Önemi",
        paragraphs: [
          "Ticari ilişkilerde tarafların hak ve yükümlülüklerinin açıkça belirlenmesi, olası uyuşmazlıkların değerlendirilmesi açısından önemlidir.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(
  slug: string,
  limit = 2
) {
  return blogPosts
    .filter((post) => post.slug !== slug)
    .slice(0, limit);
}

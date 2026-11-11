
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
}

export const servicesIntro =
  "Hukuki meselelerde yanınızda olan bir partner olarak, size ve şirketinize özel, kapsamlı hukuki çözümler sunuyoruz. Mevzuat danışmanlığından mahkeme süreçlerine, KVKK uyumundan sağlık hukukuna ve şirketler hukukuna kadar geniş bir yelpazede, güncel hukuki standartlara uygun profesyonel destek sağlıyoruz. E-ticaret hukuku alanında ise dijital ticaretinizin her adımını yasal çerçeveye oturtarak sizi ve işinizi koruma altına alıyoruz.";

export const services: ServiceItem[] = [
  {
    id: "kvkk-uyumu",
    title: "KVKK Uyumu",
    description:
      "KVKK mevzuatına tam uyum sağlanarak, şirketinizin veri işleme politika ve prosedürleri titizlikle düzenlenir. Yasal zorunluluklarınıza özen göstererek, veri işleme envanterlerinizin her zaman güncel ve mevzuata uygun olmasını temin ederiz.",
  },
  {
    id: "saglik-hukuku",
    title: "SAĞLIK HUKUKU- SAĞLIK TURİZMİ HUKUKU",
    description:
      "Sağlık turizmi hukukunda, klinik ve hastane işletmelerinizin hukuki belgeleri düzenlenir, hasta onam süreçlerinizin yasalara uygun olarak yürütülmesi sağlanır ve acenta ilişkilerinizin düzenlenmesine öncülük edilir. Ek olarak hukuki sorunlara yönelik, malpraktis davalarının takibi ve uzmanlık gerektiren meselelerde profesyonel görüşler sunularak hukuki rehberlik sağlanır.",
  },
  {
    id: "sirketler-hukuku",
    title: "ŞİRKETLER HUKUKU",
    description:
      "Şirketinizin kuruluşundan iş hukuku uygulamalarına, idari işlemlerden rekabet hukukuna kadar tüm yönleriyle hukuki düzenlemeler sağlanır. Şirket birleşmeleri ve devralmaları, uyuşmazlık çözümleri gibi önemli süreçlerde danışmanlık hizmetleri verilir.",
  },
  {
    id: "e-ticaret-hukuku",
    title: "E-TİCARET HUKUKU",
    description:
      "E-ticaret faaliyetlerinizin hukuki temellerini sağlamlaştırır, mesafeli satışlardan kullanıcı sözleşmelerine kadar tüm işlemlerinizin mevzuata uygunluğu sağlanır. Yasal gereklilikler gözetilerek ticari işlemlerinizin güvenliği artırılır.",
  },
];

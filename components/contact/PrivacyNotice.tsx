
"use client";

import { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PrivacyNotice({
  isOpen,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[calc(100%-32px)] max-w-[650px]
        rounded-lg border-4 border-[#152741]
        bg-white p-5 text-[#152741]
        shadow-xl backdrop:bg-black/50
        sm:p-7"
      aria-labelledby="privacy-title"
    >
      <h2
        id="privacy-title"
        className="mb-5 text-center  text-[18px] font-bold"
      >
        AYDINLATMA METNİ
      </h2>

      <div
        className="max-h-[45vh] space-y-4
          overflow-y-auto pr-2 text-[13px] leading-relaxed
          [&_h3]:font-bold
          [&_ul]:list-disc
          [&_ul]:pl-5"
      >
        <div className="text-[14px] font-medium">
        <h2 className="font-bold text-left text-[15px]">Veri Sorumlusunun Kimliği</h2>
        <p className="text-left">AV.YAREN ERDEM – RDM HUKUK olarak, ulusal veri koruma kanunumuz 6698 Sayılı Kişisel Verilerin Korunması Kanunu madde 10 gereğince, doğan aydınlatma yükümlülüğümüzü yerine getirmek için kişisel verileriniz hakkında yerinde bilgilendirme yapmak isteriz.</p>
        
        <p className="text-left">Tarafımıza yöneltmek istediğiniz soru, talep ve görüşleriniz için web sitemizde yer alan iletişim formunu doldurarak bizimle her zaman iletişime geçebilirsiniz.</p>

        <h2 className="font-bold text-left">Kişisel Verilerin İşlenmesi</h2>
        <p className="text-left">Söz konusu formun doldurulması ve taleplerinizin alınması kapsamında işlenen kişisel verileriniz hakkında veri sorumlusu olarak sizi işbu Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni ile, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“Kanun”) ve ilgili mevzuat kapsamında bilgilendirmek isteriz.</p>

        <h2 className="font-bold text-left">Ne Tür Kişisel Verilerinizi İşliyoruz?</h2>
        <p className="text-left">Web sitemiz üzerindeki “İletişime Geç” bölümü üzerinden iletişim kurmak isteyen ilgililerin isim-soyisim ve e-posta adresi ve iletilen mesaj kapsamındaki kişisel verilerini işliyoruz.</p>
        
        <p className="text-left">İnternet sitemiz ya da diğer iletişim kanallarımız aracılığıyla bizimle herhangi bir bilgi paylaşmasanız dahi internet sitemizi ziyaretiniz sırasında elde edilebilecek diğer veriler için çerez politikamıza ve çerez aydınlatma metnimize bakabilirsiniz.</p>

        <h2 className="font-bold text-left">Kişisel Verilerinizi Hangi Amaçlarla ve Hukuki Sebeplerle İşliyoruz?</h2>
        <p className="text-left">Bize ulaşın kısmında yer alan İletişime Geç Formu’nu doldurmanız akabinde, talep, şikayet ve önerilerinizin çözümlenmesi, soru ya da talebinize cevap verebilmek, görüşlerinizi değerlendirmek ve bu kapsamda sizinle iletişime geçebilmek amacı ile kişisel verilerinizi, Kanun madde 5/2 (f) uyarınca veri sorumlusu olarak meşru menfaatlerimizin korunması için gerekli olması hukuki sebebi ile toplayacak, kaydedecek, işleyecek, saklayacak ve sınıflandıracağız.</p>

        <p className="text-left">Ayrıca, kişisel verileriniz, resmi makamlarca ilgili mevzuata uygun şekilde talep edilmesi halinde ve yürürlükteki emredici mevzuat hükümleri gereğince resmi makamlara açıklama yapılması zorunda olunan durumlarda resmi makamlara açık rızanız olmaksızın açıklanabilecektir. Kişisel verilerinizin veri sorumlusu AV.YAREN ERDEM – RDM HUKUK ’u etkileyen hukuki bir ihtilaf ile ilgili ya da potansiyel ihtilaflara ilişkin olarak gerekli olduğu ölçüde kullanılması ve mahkemeler ve diğer yetkili kurum ve kuruluşlarla paylaşılması da mümkün olabilir. Bu çerçevede kişisel verileriniz, veri sorumlusu AV.YAREN ERDEM – RDM HUKUK ’un hukuki yükümlülüklerini yerine getirmek amacıyla Kanun madde 5/2 (ç) kapsamında ve veri sorumlusu AV.YAREN ERDEM – RDM HUKUK ’un haklarının tesisi veya korunması amacıyla Kanun madde 5/2 (e) kapsamında açık rızanıza gerek olmadan işlenebilecektir.</p>

        <h2 className="font-bold text-left">Kişisel Verilerinizi Kimlere ve Hangi Amaçlarla Aktarabiliriz?</h2>
        <p className="text-left">Yalnızca yukarıda belirtilen Kişisel Verilerin işlenmesi amaçlarını yerine getirebilmek için gerekli olması halinde, veri sorumlusu AV.YAREN ERDEM – RDM HUKUK ’a ilettiğiniz Kişisel Verileriniz hizmet / destek / danışmanlık aldığımız üçüncü kişi firmalar ile ve gerekli hallerde hukuki yükümlülüklerimizi yerine getirebilmemiz ve haklarımızın tesisi / korunması için zorunlu olması halinde kamu kurum ve kuruluşları ile yargı organlarıyla paylaşılabilecektir.</p>

        <h2 className="font-bold text-left">Kişisel Verilerinizi Hangi Yöntemlerle Topluyoruz?</h2>
        <p className="text-left">Kişisel Verileriniz, web sitemiz üzerinden ilgili formların online olarak doldurulması yoluyla ya da iş ortaklarımız vasıtasıyla sözlü, yazılı veya elektronik ortamda toplanmaktadır. Talebinizi daha iyi anlayabilmek adına, sizinle iletişime geçebilir, otomatik ya da otomatik olmayan yollarla, yazılı ya da sözlü olarak da sizden ek bilgi de talep edebiliriz. Bu bilgiler de yalnızca yukarıda belirtilen kapsamda işlenecektir.</p>

        <h2 className="font-bold text-left">Kişisel Verilerinize İlişkin Haklarınız Nelerdir?</h2>
        <p className="text-left">6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca aşağıda belirtilen haklara sahip bulunmaktasınız:</p>
        <ul>
            <li className="text-left">Kişisel Verilerinizin işlenip işlenmediğini öğrenme, işlendiğine ilişkin bilgi talep etme,</li>
            <li className="text-left">Kişisel Verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li className="text-left">Kişisel Verilerinizin aktarıldığı üçüncü kişileri bilme,</li>
            <li className="text-left">Kişisel Verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini talep etme, bu hakkınızı kullanmanız halinde bu durumun Kişisel Verilerinizin aktarıldığı üçüncü kişilere de bildirilmesini isteme,</li>
            <li className="text-left">Kişisel Verilerinizin işlenme nedenlerinin ortadan kalkması halinde Kişisel Verilerinizin silinmesini veya yok edilmesini isteme, bu hakkınızı kullanmanız halinde bu durumun Kişisel Verilerinizin aktarıldığı üçüncü kişilere de bildirilmesini isteme,</li>
            <li className="text-left">Elde ettiğimiz bilgilerin otomatik sistemler ile analizi yoluyla hakkınızda ortaya çıkan sonuca itiraz etme ve zarara uğramanız halinde tazminat talep etme.</li>
        </ul>
        <p className="text-left">İlgili kişi bu haklarına ilişkin taleplerini Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun bir şekilde iletebilir. Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici gerekli bilgiler ile talep dilekçenizi bizzat elden teslim edebilir, noter kanalıyla veya Kişisel Verileri Koruma Kurulu tarafından belirlenen diğer yöntemler ile iletebilirsiniz.</p>

        <p className="text-left">İlgili kişinin talepleri, en kısa sürede ve en geç otuz (30) gün içinde ücretsiz olarak değerlendirilip sonuçlandırılacaktır. Değerlendirme ve sonuçlandırma işleminin ek bir maliyet gerektirmesi durumunda, Kişisel Verileri Koruma Kurulu tarafından belirlenen ücret tarifesine uyulacaktır.</p>
    </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 flex h-[48px] w-full
          items-center justify-center rounded-md
          bg-[#152741] text-[13px]
          font-bold text-white"
      >
        KAPAT
      </button>
    </dialog>
  );
}

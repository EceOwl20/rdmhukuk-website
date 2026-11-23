# RDM Hukuk Web Sitesi

Next.js tabanlı kurumsal site ve dahili içerik yönetim paneli.

## Yönetim paneli

Panel `/yonetim` adresindedir. İlk çalıştırmadan önce `.env.example` dosyasını `.env.local` olarak kopyalayın ve `ADMIN_USERNAME`, `ADMIN_PASSWORD` ile en az 32 karakterlik `SESSION_SECRET` değerlerini değiştirin.

Yerel geliştirmede çevre değişkenleri tanımlı değilse `admin` / `admin123` bilgileriyle giriş yapılabilir. Bu geçici bilgiler production ortamında çalışmaz.

Panelden anasayfa ve iletişim sayfası metin/görselleri, blog yazıları ve yalnızca oturum açmış panel kullanıcısının görebildiği özel belgeler yönetilir. İçerikler varsayılan olarak proje kökündeki `uploads` klasöründe tutulur. Canlı sunucuda bu klasörü kalıcı bir volume'a bağlayın veya `CONTENT_STORAGE_PATH` ile kalıcı dizini belirtin. Dağıtım sırasında bu dizin silinmemelidir.

`content.json`, `documents.json` ve `images.json` dosyaları her okumada doğrulanır. Yalnızca dosya henüz yoksa başlangıç verisi kullanılır; okunamayan veya bozuk bir kayıt dosyası veri kaybını önlemek için panel işlemini durdurur. Başarılı her yazımdan önce ilgili dosyanın son geçerli sürümü aynı dizinde `.backup` uzantısıyla saklanır.

## İletişim formu rate limit

İletişim formu denemeleri `uploads/data/contact-rate-limits.json` dosyasında ham IP veya e-posta adresi tutulmadan saklanır. IP başına 10 dakikada 3, e-posta başına 10 dakikada 2 ve IP başına 24 saatte 15 gönderim denemesine izin verilir. `CONTACT_RATE_LIMIT_SECRET` tanımlanmazsa HMAC anahtarı olarak `SESSION_SECRET` kullanılır.

Canlı sunucuda Next.js doğrudan internete açılmamalıdır. Nginx gibi güvenilir proxy, istemciden gelen IP başlıklarını ezerek gerçek IP'yi iletmelidir:

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $remote_addr;
```

Birden fazla Next.js process veya sunucu kullanılacaksa dosya tabanlı sayaç yerine ortak Redis tabanlı rate limit kullanılmalıdır.

Örnek Docker volume eşlemesi:

```yaml
volumes:
  - rdm_uploads:/app/uploads
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

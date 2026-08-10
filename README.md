# FIGHTNET

DACH bölgesinde (Almanya, Avusturya, İsviçre) dövüş sporları için bağımsız platform.
Sporcular, antrenörler, salonlar, organizatörler ve hayranlar için tek dijital ev.

> "Hessen'deki bir amatör şampiyon, tıpkı bir UFC dövüşçüsü gibi görünür olmalı."

---

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Dil | TypeScript (strict) |
| Veritabanı | MongoDB Atlas + Prisma 6 |
| Stil | Tailwind CSS v4 (CSS-first tema) |
| Medya | Cloudinary (imzalı doğrudan yükleme) |
| Kimlik | JWT oturum (jose) + bcrypt, edge proxy ile RBAC |
| Doğrulama | Zod 4 |
| İkonlar | lucide-react |

---

## Kurulum

```bash
npm install
# .env dosyasını oluştur — gereken değişkenler aşağıdaki tabloda
npm run db:push              # şemayı MongoDB'ye gönder (indeksler dahil)
npm run db:seed              # üretim çekirdeği (admin, forum, §13 Halo salonları, beta kodları)
npm run db:seed -- --demo    # üstüne geliştirme için örnek içerik
npm run dev
```

> `db:seed` idempotenttir — tekrar çalıştırmak veri çoğaltmaz. `--demo`
> olmadan hiçbir sahte sporcu profili oluşturmaz; üretimde de güvenle
> çalıştırılabilir.

### Ortam değişkenleri

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | MongoDB Atlas bağlantı dizesi (replica set gerekli) |
| `AUTH_SECRET` | Oturum imzalama anahtarı, min. 32 karakter |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Medya yükleme |
| `CLOUDINARY_FOLDER` | Medya kök klasörü (varsayılan `fightnet`) — dev/prod ayrımı için |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | İstemci tarafı görsel dönüşümleri |
| `NEXT_PUBLIC_APP_URL` | Kanonik URL (sitemap, OG etiketleri, e-posta bağlantıları) |
| `NEXT_PUBLIC_APP_NAME` | Marka adı (varsayılan `FIGHTNET`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | İlk admin hesabı — yalnızca seed için |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | §4.1 Web Push (`npx web-push generate-vapid-keys`) |
| `VAPID_SUBJECT` | Push için iletişim adresi (`mailto:…`) |
| `RESEND_API_KEY` / `MAIL_FROM` | E-posta gönderimi (veli onayı, davetler) |
| `CRON_SECRET` | §7 günlük KPI anlık görüntüsü uç noktasını yetkilendirir |

Üçü de **isteğe bağlıdır ve olmadıkları zaman uygulama çalışmaya devam eder**:

- **Cloudinary yoksa** yalnızca medya yükleme uçları `500` döner; görsel
  dönüşüm yardımcıları Cloudinary olmayan URL'leri olduğu gibi geçirir.
- **VAPID yoksa** push sessizce devre dışı kalır; bildirimler yalnızca
  uygulama içinde görünür.
- **RESEND yoksa** e-posta gönderilmez, gönderim denemesi denetim kaydına
  yazılır ve geliştirmede konsola düşer. Veli onayı bağlantısı bu durumda
  admin panelinden elle iletilebilir.
- **CRON_SECRET yoksa** `/api/cron/kpi` kapalıdır; anlık görüntü
  `/admin/kpi` sayfasındaki düğmeyle elle alınabilir.

### Seed içeriği

`npm run db:seed` şunları oluşturur:

- **Admin hesabı** — `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` ile
- **10 forum kategorisi** (§4.3)
- **13 Halo salonu** (§13) — üç akquise dalgası, `isHalo` işaretli, `PENDING`
  durumda (talep edilene kadar)
- **Beta kodları** (§6.4): `FOUNDER50`, `HALO2026`, `COACH20`, `BETA2`, `BETA3`
- **Site ayarları** — moderasyon politikası, program başlangıcı (KPI ayları
  buradan sayılır), reklam yasak kategorileri

`--demo` ek olarak 6 örnek sporcu/antrenör/organizatör (şifre `demo1234`),
bir aktif salon + ders programı, bir etkinlik + dövüş kartı, sparring
ilanları, akış içeriği ve bekleme listesi kayıtları ekler.

---

## Komutlar

```bash
npm run dev         # geliştirme sunucusu
npm run build       # prisma generate + production build
npm run start       # production sunucusu
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run db:push     # şema → MongoDB indeksleri
npm run db:seed     # üretim çekirdeği ( -- --demo ile örnek içerik )
npm run db:studio   # Prisma Studio
```

---

## Yapı

```
app/
  (site)/          Public sayfalar — dövüşçüler, salonlar, etkinlikler,
                   sparring, akış, forum, creator, pazar, harita, yasal
  (auth)/          Giriş / kayıt
  panel/           Kullanıcı paneli + server actions
  admin/           Admin panel + server actions
  salon-yonetimi/  Salon işletmecisi paneli
  organizator/     Etkinlik & canlı skor yönetimi
  api/             Route handler'lar (auth, upload imzası, sosyal, livescore)
components/        UI kit, kartlar, formlar, yükleyici
lib/               prisma, auth, session, cloudinary, queries, validators
prisma/            schema.prisma + seed.ts
proxy.ts           Edge yetkilendirme (Next 16 middleware)
```

---

## Doküman karşılığı

| Konsept (§) | Uygulama |
|---|---|
| §4.1 Dövüşçü profilleri | `/dovuscular/[slug]` — çoklu disiplin, bilanço, kemer |
| §4.5 3 seviyeli doğrulama | `/panel/dogrulama` + `/admin/dogrulama` kuyruğu |
| §4.5 Antrenör kefaleti | `/panel/kefalet` — antrenör başına 20 öğrenci limiti |
| §4.1 Antrenman günlüğü | `/panel/antrenman` — streak, yıllık ısı haritası, çevrimdışı |
| §4.1 Yorumlu livescore | `/etkinlikler/[slug]` + `/organizator/[id]` canlı kontrol |
| §4.1 Spotlight | Ana sayfa + `/admin/spotlight` |
| §4.2 Sparring arama | `/sparring` — disiplin/seviye/kilo/konum eşleştirme |
| §4.2 Salon bulucu & deneme | `/salonlar/[slug]` — özel deneme antrenmanı akışı |
| §4.2 Harita | `/harita` — SDK'sız pin görünümü, mesafe hesabı |
| §4.2 Banner reklamı | `/admin/reklamlar` — spor bahis reklamı yasak |
| §4.3 Forum | `/forum` — kategori, konu, yanıt, moderasyon |
| §4.7 Creator abonelikleri | `/creator/[username]` — 3 kademe, %15 komisyon |
| §4.4 Ekipman pazarı | `/pazar` + `/pazar/[slug]` + `/panel/pazar` — ilan, sipariş, %12 komisyon |
| §4.4 Müsabaka kayıt aracılığı | `/etkinlikler/[slug]#kayit` → `/organizator/[id]` kayıt kuyruğu |
| §4.3 Sponsor portalı | `/sponsorluk` + `/admin/sponsorlar` — teklif ve başvuru yönetimi |
| §4.1 Push bildirimleri | Web Push (VAPID) — `/panel/ayarlar`, cihaz başına |
| §3.1 Kurulabilir uygulama | PWA: manifest, service worker, çevrimdışı sayfa |
| §5.2 Çevrimdışı antrenman | localStorage kuyruğu → `/api/training/sync`, `clientId` ile tekillik |
| §6 Beta programı | Bekleme listesi + beta kodları + Kurucu Üye |
| §7 KPI & Dur/Devam | `/admin/kpi` — MAVU trendi, canlı kapı değerlendirmesi, günlük anlık görüntü |
| §8.3 Görünürlük seviyeleri | Profil, disiplin ve antrenman kaydı bazında |
| §9 Passport | `/panel/passport` — sağlık verisi yok, kanıt toplayıcı |
| §11.1 Kapı 1 Çocuk koruması | Yaş doğrulama + e-posta ile veli onayı (`/ebeveyn-onayi`), onay gelene dek DM/sparring/müsabaka kapalı |
| §11.2 Kapı 2 Sparring güvenliği | Feragatname onayı, seans sonrası değerlendirme, 3 rapor → otomatik yasak |
| §11.3 Kapı 3 İçerik moderasyonu | Rapor düğmeleri, moderasyon kuyruğu, topluluk kuralları |
| §11.4 Kapı 4 KVKK | Granüler çerez izni, JSON dışa aktarım, hesap silme, KYC belgesi imhası |
| §11.5 Kapı 5 DSA | `/seffaflik` otomatik şeffaflık raporu + `/panel/itirazlar` itiraz mekanizması |
| §11.7 Moderatör ölçekleme | `/admin/kpi` — MAVU/rapor eşiklerinde uyarı |
| §13 Halo salonları | Seed'de üç akquise dalgası, `isHalo` işaretli |

---

## Performans notları

- **Sorgu katmanı** (`lib/queries.ts`) `unstable_cache` ile etiketlenir;
  mutasyonlarda `updateTag` ile hedefli tazeleme yapılır.
- **Denormalize sayaçlar** (takipçi, beğeni, yorum, streak) okuma yolunda
  JOIN maliyetini sıfırlar.
- **Cloudinary** görselleri `f_auto,q_auto,dpr_auto` ile teslim edilir;
  video yalnızca kullanıcı oynat dediğinde indirilir.
- **Yüklemeler** tarayıcıdan doğrudan Cloudinary'ye gider — sunucu bant
  genişliği harcanmaz.
- **Edge proxy** JWT'den yetki çözer, korumalı rotalarda DB'ye gitmez.
- **Canlı skor** artımlı çekim yapar (`?after=` imleci) ve sekme arka
  plandayken yoklamayı durdurur.
- MongoDB indeksleri sorgu desenlerine göre tanımlıdır (`schema.prisma`).

---

## Zamanlanmış görev

§7 gereği günlük KPI anlık görüntüsü. `CRON_SECRET` tanımlıysa:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://…/api/cron/kpi
```

Vercel kullanılıyorsa `vercel.json` içine günlük bir cron tanımı yeterlidir.
Anlık görüntü alınmazsa `/admin/kpi` canlı değerleri yine gösterir, yalnızca
trend grafiği boş kalır.

---

## Bilinen sınırlar

- **Ödeme entegrasyonu yok.** Creator abonelikleri, salon planları ve pazar
  siparişleri veri modelinde ve komisyon hesabında hazır; sipariş şu an bir
  *rezervasyondur*, ödeme taraflar arasında yapılır. Stripe Connect Express
  (§4.6) devreye girdiğinde yalnızca tahsilat adımı eklenir.
- **Yasal metinler taslaktır.** Gizlilik, Şartlar, Sparring Sözleşmesi ve
  Künye yayına almadan önce avukat incelemesinden geçmelidir (§15.2).
- **Otomatik içerik ön filtresi** (AWS Rekognition / Perspective API)
  bağlanmadı — videolar manuel moderasyon kuyruğuna düşer (§11.3).
- **KYC sağlayıcısı yok.** Seviye 1 doğrulaması belge + selfie yüklemesiyle
  çalışır, incelemeyi admin yapar; IDnow/Onfido entegrasyonu (§5.3) sonraki adım.
- **Native uygulamalar yok.** iOS/Android için PWA kurulumu çalışır; App Store
  ve Play Store sürümleri (§3.2) ayrı bir karardır.
- **Çok dillilik.** Arayüz Türkçedir; kullanıcı `locale` tercihi saklanır ama
  Almanca/İngilizce çeviri katmanı (§5.2) henüz yok.
- **Harita** kendi SVG düzlemini kullanır; Mapbox/Google Maps katmanı
  gerekirse `components/gym-map.tsx` değiştirilerek eklenebilir.
- **Faz 3+ özellikleri** tasarım gereği yapılmadı: canlı yayın/PPV (Amazon IVS),
  veri lisansı (B2B), donanım senkronu (HealthKit/Garmin), salon sözleşme
  yönetimi (SEPA/GoBD), online koçluk, antrenör SaaS aboneliği, canlı sohbet.

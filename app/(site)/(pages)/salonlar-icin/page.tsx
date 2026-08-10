import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Badge, Card, CardBody, ButtonLink } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Salonlar İçin",
  description:
    "FIGHTNET Kurucu Üyelik: ayda 50 € ile üye kazanımı, deneme antrenmanı akışı, ders programı ve rezervasyon yönetimi.",
};

const FEATURES = [
  "Doğrulanmış salon profili ve harita görünürlüğü",
  "Deneme antrenmanı akışı — öğrenci gelmeden önce tanıyorsun",
  "Haftalık ders programı yönetimi",
  "Rezervasyon talepleri ve onay akışı",
  "Antrenörlerin için Seviye 2 doğrulama ve kefalet hakkı",
  "Üyelerinin antrenman aktivitesini görme",
  "Etkinlik oluşturma ve canlı skor",
  "Kurucu Salon rozeti",
];

export default function ForGymsPage() {
  return (
    <>
      <Badge tone="gold" className="w-fit">Kurucu Üyelik</Badge>
      <h1 className="font-display text-3xl font-black sm:text-5xl">
        Salonun için dövüş sporuna özel yazılım
      </h1>

      <p>
        Eversports ve Mindbody gibi genel salon yazılımları dövüş sporu için çalışır ama geneldir.
        Kemer doğrulamalarını, sparring seviyelerini veya müsabaka geçmişlerini anlamazlar.
        FIGHTNET yalnızca dövüş sporları için tasarlandı.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-gold-500/50">
          <CardBody className="flex flex-col gap-3">
            <Badge tone="gold" className="w-fit">Kurucu Fiyat</Badge>
            <p className="font-display text-4xl font-black">
              50 €<span className="text-lg font-semibold text-muted">/ay</span>
            </p>
            <p className="text-sm text-muted">
              İlk 6 ay için. <b className="text-[var(--fg)]">Kurucu Üyeler bu fiyatı ömür boyu korur.</b>
            </p>
            <ul className="flex flex-col gap-1.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3">
            <Badge className="w-fit">Standart</Badge>
            <p className="font-display text-4xl font-black">
              100-150 €<span className="text-lg font-semibold text-muted">/ay</span>
            </p>
            <p className="text-sm text-muted">
              Tam lansmandan sonra yeni katılan salonlar için geçerli fiyat.
            </p>
            <p className="text-sm text-muted">
              Kurucu Üyelik yalnızca Beta programı süresince açıktır — kontenjan sınırlıdır.
            </p>
          </CardBody>
        </Card>
      </div>

      <h2>Nasıl başlarız</h2>
      <ul>
        <li>Bekleme listesine kaydol — beta erişim kodun e-postana gelir</li>
        <li>Salon İşletmecisi olarak kayıt ol, Seviye 2 doğrulamasını tamamla</li>
        <li>Salon profilini oluştur: logo, kapak, disiplinler, ders programı</li>
        <li>Admin onayından sonra salonun yayına girer (24-48 saat)</li>
        <li>Üyelerini davet et — antrenörlerin öğrencilerine kefil olabilir</li>
      </ul>

      <h2>Mevcut yazılımın varsa</h2>
      <p>
        FIGHTNET'i mevcut sistemine rakip değil, üstüne katman olarak kullanabilirsin.
        Sözleşme yönetimi ve SEPA ödeme özellikleri yalnızca mevcut yazılımı olmayan
        yeni salonlar için, bölgesel pilot sonrası devreye alınacak.
      </p>

      <h2>Bekleme listesine katıl</h2>
      <Card>
        <CardBody>
          <WaitlistForm source="for-gyms" />
        </CardBody>
      </Card>

      <div className="mt-4">
        <ButtonLink href="/iletisim" variant="outline">
          Bize ulaş
        </ButtonLink>
      </div>
    </>
  );
}

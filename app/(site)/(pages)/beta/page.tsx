import type { Metadata } from "next";
import { Badge, Card, CardBody } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Beta Programı",
  description: "FIGHTNET davetli erken erişim programı — Kurucu Üye ayrıcalıkları ve 12 aylık yol haritası.",
};

const TIMELINE = [
  { phase: "Beta 0", months: "Ay 1–2", what: "Landing sayfası yayında, bekleme listesi kayıtları başlar" },
  { phase: "Beta 1", months: "Ay 3–5", what: "MVP temel özellikleri: profiller, doğrulama, antrenman günlüğü, sparring" },
  { phase: "Beta 2 (Kapalı)", months: "Ay 6–8", what: "İlk Kurucu Üyeler beta erişim kodu alır, yoğun geri bildirim" },
  { phase: "Beta 3 (Açık)", months: "Ay 9–12", what: "Bekleme listesinden daha fazla davet, pazarlama artışı, tam lansman" },
];

export default function BetaPage() {
  return (
    <>
      <Badge tone="red" className="w-fit">Davetli Erken Erişim</Badge>
      <h1 className="font-display text-3xl font-black sm:text-5xl">Beta Programı</h1>

      <p>
        FIGHTNET büyük bir halka açık lansmanla başlamaz. Bunun yerine küçük bir Kurucu Üye
        grubuyla test edilir — Superhuman, Notion ve Linear'ın izlediği yol.
        Gerçek geri bildirimle şekillenen bir ürün, herkese açılmadan önce olgunlaşır.
      </p>

      <h2>12 aylık zaman çizelgesi</h2>
      <div className="flex flex-col gap-3">
        {TIMELINE.map((t, i) => (
          <Card key={t.phase}>
            <CardBody className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600/10 font-display text-lg font-black text-blood-500">
                {i + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{t.phase}</h3>
                  <Badge>{t.months}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{t.what}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2>Kurucu Üye ayrıcalıkları</h2>
      <ul>
        <li>İlk 6 ay için ayda 50 € — <b>ömür boyu bu fiyatı korursun</b></li>
        <li>Profilinde ve salon sayfanda Kurucu rozeti</li>
        <li>Ürün yol haritasına doğrudan etki: geri bildirimin özelliğe dönüşür</li>
        <li>Yeni özelliklere ilk erişim</li>
      </ul>

      <h2>Nasıl davet alınır</h2>
      <ul>
        <li>Bekleme listesine kaydol</li>
        <li>Beta erişim kodun e-posta ile gelir</li>
        <li>Kayıt sırasında kodu gir — Kurucu ayrıcalıkların otomatik tanımlanır</li>
      </ul>

      <Card>
        <CardBody>
          <WaitlistForm source="beta-page" />
        </CardBody>
      </Card>
    </>
  );
}

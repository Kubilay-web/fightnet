import type { Metadata } from "next";
import { Badge, Card, CardBody, ButtonLink } from "@/components/ui";
import { KPI_GATES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "FIGHTNET, DACH bölgesinde dövüş sporları için bağımsız platformdur. Vizyonumuz, ilkelerimiz ve yol haritamız.",
};

export default function AboutPage() {
  return (
    <>
      <Badge tone="red" className="w-fit">Hakkımızda</Badge>
      <h1 className="font-display text-3xl font-black sm:text-5xl">
        Amatör şampiyon, bir UFC dövüşçüsü kadar görünür olmalı
      </h1>

      <p>
        FIGHTNET, Almanca konuşulan bölgede (Almanya, Avusturya, İsviçre) dövüş sporları için
        bağımsız bir platformdur. Sporcuları, antrenörleri, salonları, organizatörleri, hayranları
        ve sponsorları tek bir uygulamada bir araya getirir.
      </p>

      <h2>Neden var olduk</h2>
      <p>
        Bugün bir amatör turnuva bulmak için bölge federasyonuna, bir UFC maçı için Tapology'ye,
        salon aramak için Google'a, sparring partneri için tanıdıklara bakılıyor. Merkezi bir yer yok.
        Üstelik Tapology, Sherdog ve BoxRec yalnızca profesyonelleri kapsıyor — bir Alman BJJ amatör
        şampiyonu dijital olarak görünmez.
      </p>

      <h2>Bizi farklı kılan üç şey</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            t: "Federasyondan bağımsızlık",
            b: "Ne boks, ne MMA, ne BJJ federasyonu platformu sahiplenir. Bu, sporcuları politik araç olmaktan korur.",
          },
          {
            t: "Dikey uzmanlaşma",
            b: "Çapraz-spor platformlarının aksine yalnızca dövüş sporlarına odaklanıyoruz. Her özellik spora özel.",
          },
          {
            t: "Profesyonel standart, amatör seviye",
            b: "Almanya ve Avusturya'nın amatör alanı dijital olarak görünmez. Bunu değiştiriyoruz.",
          },
        ].map((x) => (
          <Card key={x.t}>
            <CardBody>
              <h3 className="font-bold">{x.t}</h3>
              <p className="mt-1 text-sm text-muted">{x.b}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2>Temel ilkelerimiz</h2>
      <ul>
        <li>
          <b>Community First</b> — Önce topluluk yaşasın, sonra dövüş sporu organize edilsin.
          Topluluk özellikleri SaaS özelliklerinden önce gelir.
        </li>
        <li>
          <b>Value First</b> — Veri yalnızca kullanıcı net bir fayda gördüğünde toplanır.
          Onboarding'de gereksiz alan yok.
        </li>
        <li>
          <b>Görünürlük seviyeleri</b> — Her veri noktası için kimin ne göreceğine kullanıcı karar verir.
        </li>
        <li>
          <b>Trust by Design</b> — Güven pazarlama vaadiyle değil sistem tasarımıyla kurulur:
          doğrulama seviyeleri, kefalet modeli, şeffaf moderasyon.
        </li>
      </ul>

      <h2>Yol haritası</h2>
      <ul>
        <li><b>Beta (12 ay)</b> — Davetli erken erişim, Kurucu Üyelerle test ve iterasyon</li>
        <li><b>Faz 1a</b> — Profiller, doğrulama, antrenman günlüğü, sparring, canlı skor</li>
        <li><b>Faz 1b</b> — Salon bulucu, rezervasyon, harita, çoklu spor profilleri</li>
        <li><b>Faz 2</b> — Organizatör paneli, video yüklemeleri, forum, Creator abonelikleri</li>
        <li><b>Faz 3</b> — Tam SaaS, ekipman pazarı, canlı yayın/PPV, veri lisansı</li>
      </ul>

      <h2>Dur/Devam kapıları</h2>
      <p>
        Şeffaflık gereği kilometre taşlarımızı açık paylaşıyoruz. Her kapıda yeşil/sarı/kırmızı
        değerlendirmesi yapılır ve gerekirse yön değiştirilir.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase text-muted">
              <th className="py-2 pr-3">Ay</th>
              <th className="py-2 pr-3">Yeşil</th>
              <th className="py-2">Kırmızı</th>
            </tr>
          </thead>
          <tbody>
            {KPI_GATES.map((g) => (
              <tr key={g.month} className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-black">Ay {g.month}</td>
                <td className="py-2 pr-3 text-emerald-500">{g.green}</td>
                <td className="py-2 text-blood-500">{g.red}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Veri koruması</h2>
      <p>
        Tüm sunucularımız AB'dedir (AWS Frankfurt). KVKK/GDPR uyumluyuz: granüler izin,
        30 gün içinde silme hakkı, JSON/CSV veri taşınabilirliği ve TLS 1.2+ / AES-256 şifreleme.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/kayit">Ücretsiz Katıl</ButtonLink>
        <ButtonLink href="/salonlar-icin" variant="outline">
          Salonlar İçin
        </ButtonLink>
      </div>
    </>
  );
}

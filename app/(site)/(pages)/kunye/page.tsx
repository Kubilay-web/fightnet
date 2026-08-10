import type { Metadata } from "next";
import { Alert } from "@/components/ui";

export const metadata: Metadata = {
  title: "Künye (Impressum)",
  description: "FIGHTNET yasal künye bilgileri.",
};

export default function ImprintPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">Künye (Impressum)</h1>

      <Alert tone="amber" title="Doldurulması gerekiyor">
        Almanya'da TMG §5 gereği künye bilgileri zorunludur. Aşağıdaki alanlar tüzel kişilik
        kurulduktan sonra doldurulmalıdır.
      </Alert>

      <h2>Hizmet sağlayıcı</h2>
      <ul>
        <li>Şirket adı: [Doldurulacak]</li>
        <li>Adres: [Sokak, Posta kodu, Şehir]</li>
        <li>Ülke: Almanya</li>
      </ul>

      <h2>Temsilci</h2>
      <ul>
        <li>Yetkili kişi: [Ad Soyad]</li>
      </ul>

      <h2>İletişim</h2>
      <ul>
        <li>E-posta: [kontakt@fightnet.app]</li>
        <li>Telefon: [Opsiyonel]</li>
      </ul>

      <h2>Sicil bilgileri</h2>
      <ul>
        <li>Ticaret sicili: [Amtsgericht, HRB numarası]</li>
        <li>Vergi numarası (USt-IdNr.): [DE...]</li>
      </ul>

      <h2>İçerikten sorumlu kişi (§18 Abs. 2 MStV)</h2>
      <ul>
        <li>[Ad Soyad, Adres]</li>
      </ul>

      <h2>AB uyuşmazlık çözümü</h2>
      <p>
        Avrupa Komisyonu çevrimiçi uyuşmazlık çözümü platformu:{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener" className="underline">
          ec.europa.eu/consumers/odr
        </a>
        . Tüketici hakem heyeti nezdinde uyuşmazlık çözümüne katılma zorunluluğumuz bulunmamaktadır.
      </p>

      <h2>Sorumluluk</h2>
      <p>
        Kullanıcılar tarafından oluşturulan içerikten FIGHTNET sorumlu değildir. Bir ihlal
        bildirimi aldığımızda ilgili içeriği derhal inceler ve gerekirse kaldırırız
        (Notice-and-Action, DSA).
      </p>
    </>
  );
}

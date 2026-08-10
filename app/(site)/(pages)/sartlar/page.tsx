import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "FIGHTNET platform kullanım şartları ve koşulları.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">Kullanım Şartları</h1>
      <p>Son güncelleme: {new Date().toLocaleDateString("tr-TR")}</p>

      <Alert tone="amber" title="Taslak metin">
        Bu metin bir taslaktır ve yayına almadan önce avukat incelemesinden geçmelidir.
      </Alert>

      <h2>1. Kapsam</h2>
      <p>
        Bu şartlar FIGHTNET web ve mobil uygulamalarının kullanımını düzenler. Hesap
        oluşturarak bu şartları kabul etmiş sayılırsınız.
      </p>

      <h2>2. Hesap</h2>
      <ul>
        <li>Hesap açmak için en az 14 yaşında olmalısınız; 18 yaş altı için ebeveyn onayı zorunludur</li>
        <li>Doğru ve güncel bilgi vermekle yükümlüsünüz</li>
        <li>Hesap güvenliğinden ve şifrenizden siz sorumlusunuz</li>
        <li>Bir kişi yalnızca bir kişisel hesap açabilir</li>
      </ul>

      <h2>3. Doğrulama ve kefalet</h2>
      <p>
        Doğrulama seviyeleri platform güvenliği içindir. Sahte belge sunmak hesabın kalıcı
        kapatılmasına yol açar. Antrenörler kefil oldukları sporcular için itibarlarıyla
        sorumludur; sahte kefalet antrenör statüsünün geri alınmasıyla sonuçlanır.
      </p>

      <h2>4. Sparring — önemli sorumluluk feragati</h2>
      <p>
        FIGHTNET yalnızca sporcuları buluşturan bir aracıdır. Sparring seanslarına
        katılım tamamen kullanıcıların kendi sorumluluğundadır. Ayrıntılar için{" "}
        <Link href="/sparring-sozlesmesi" className="font-bold underline">
          Sparring Sözleşmesi
        </Link>{" "}
        sayfasına bakın.
      </p>

      <h2>5. İçerik kuralları</h2>
      <ul>
        <li>Yüklediğiniz içeriğin haklarına sahip olmalısınız</li>
        <li>Cinsel içerik, nefret söylemi, taciz ve şiddet teşviki yasaktır</li>
        <li>Doping teşviki ve aşırı kilo düşürme talimatı yasaktır</li>
        <li>Yüklediğiniz içerik sizin kalır; FIGHTNET'e platformda gösterme lisansı verirsiniz</li>
        <li>Video içerikler otomatik ön filtreden ve moderasyon onayından geçer</li>
      </ul>

      <h2>6. Ücretli hizmetler</h2>
      <ul>
        <li>Salon abonelikleri aylık faturalandırılır, istediğiniz zaman iptal edilebilir</li>
        <li>Kurucu Üyeler ömür boyu ayrıcalıklı fiyatı korur</li>
        <li>Creator aboneliklerinde FIGHTNET %15 komisyon alır, %85 içerik üreticisine gider</li>
        <li>Ekipman pazarında platform komisyonu %12'dir</li>
      </ul>

      <h2>7. Fesih</h2>
      <p>
        Hesabınızı istediğiniz zaman silebilirsiniz. FIGHTNET, kural ihlali durumunda
        hesapları askıya alabilir veya kapatabilir. 3 güvensiz sparring raporu otomatik
        askıya alma ile sonuçlanır.
      </p>

      <h2>8. Sorumluluk sınırı</h2>
      <p>
        FIGHTNET, kullanıcılar arasındaki anlaşmazlıklardan, sparring sırasında oluşan
        yaralanmalardan veya salonların sunduğu hizmetlerden sorumlu değildir. Platform
        "olduğu gibi" sunulur.
      </p>

      <h2>9. Değişiklikler</h2>
      <p>
        Şartlarda yapılan önemli değişiklikler 30 gün önceden e-posta ile bildirilir.
        Devam eden kullanım, yeni şartların kabulü anlamına gelir.
      </p>

      <h2>10. Uygulanacak hukuk</h2>
      <p>
        Alman hukuku uygulanır. Tüketici koruma mevzuatının zorunlu hükümleri saklıdır.
      </p>
    </>
  );
}

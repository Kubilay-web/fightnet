import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { Alert, Card, CardBody } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sparring Sözleşmesi",
  description: "FIGHTNET sparring güvenlik kuralları ve sorumluluk feragatnamesi.",
};

export default function SparringAgreementPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">Sparring Sözleşmesi</h1>

      <Alert tone="red" title="Sparring bir müsabaka değildir">
        <span className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          Sparring, kontrollü bir antrenmandır. Amaç öğrenmektir, rakibi yenmek değil.
          Bu ayrımı kabul etmeyen kullanıcılar platformdan çıkarılır.
        </span>
      </Alert>

      <h2>1. Kendi sorumluluğunda katılım</h2>
      <p>
        FIGHTNET yalnızca sporcuları buluşturan bir aracıdır. Sparring seansına katılım
        tamamen kendi sorumluluğunuzdadır. FIGHTNET seansa katılmaz, denetlemez ve
        oluşabilecek yaralanmalardan sorumlu tutulamaz.
      </p>

      <h2>2. Sağlık beyanı</h2>
      <ul>
        <li>Sparring yapmaya sağlık durumunuzun elverişli olduğunu beyan edersiniz</li>
        <li>Bilinen bir kalp rahatsızlığı, sarsıntı geçmişi veya iyileşmemiş sakatlık varsa katılmayın</li>
        <li>Son 30 gün içinde nakavt/sarsıntı yaşadıysanız doktor onayı olmadan sparring yapmayın</li>
      </ul>

      <h2>3. Güvenlik kuralları</h2>
      <ul>
        <li>Uygun koruyucu ekipman zorunludur: dişlik, eldiven, kasık koruyucu, gerekiyorsa kask</li>
        <li>Seans öncesi yoğunluk seviyesi (hafif / orta / sert) açıkça konuşulur</li>
        <li>"Dur" veya tap sinyali anında saygı görür — istisnasız</li>
        <li>Bilinçli sertleştirme, uyarısız güç artırma ve ego sparring yasaktır</li>
        <li>Seviye farkı varsa daha deneyimli olan yoğunluğu ayarlamakla yükümlüdür</li>
        <li>Sparring gözetimli bir salonda yapılmalıdır; halka açık alanda sparring önerilmez</li>
      </ul>

      <h2>4. Reşit olmayanlar</h2>
      <p>
        18 yaş altı sporcularla sparring yalnızca Seviye 2 doğrulanmış kullanıcılar tarafından
        ve antrenör gözetiminde talep edilebilir. Ebeveyn onayı olmadan buluşma yapılamaz.
      </p>

      <h2>5. Değerlendirme sistemi</h2>
      <p>
        Her sparring seansından sonra karşılıklı değerlendirme yapılır: güvenlik, teknik ve
        dakiklik puanlanır. Bu, topluluk içinde itibar oluşturur ve güvenli olmayan
        davranışları görünür kılar.
      </p>

      <Card className="border-blood-500/40">
        <CardBody>
          <h3 className="font-bold">Otomatik yasak eşiği</h3>
          <p className="mt-1 text-sm text-muted">
            Bir kullanıcı hakkında <b className="text-[var(--fg)]">3 güvensiz sparring raporu</b>{" "}
            açıldığında hesap otomatik olarak askıya alınır ve moderasyon incelemesine girer.
          </p>
        </CardBody>
      </Card>

      <h2>6. Sorumluluk feragati</h2>
      <p>
        Sparring talebi göndererek veya kabul ederek; dövüş sporlarının doğası gereği
        yaralanma riski taşıdığını anladığınızı, bu riski gönüllü olarak üstlendiğinizi ve
        FIGHTNET'i her türlü talepten ari tuttuğunuzu kabul edersiniz. Bu feragat, kasıt
        veya ağır ihmal hallerini kapsamaz.
      </p>

      <h2>7. Sigorta önerisi</h2>
      <p>
        Kendi spor sigortanızın sparring antrenmanlarını kapsadığından emin olun.
        Birçok salon üyeliği bu kapsamı zaten sunar.
      </p>

      <Alert tone="amber" title="Hukuki inceleme gerekli">
        Bu metin bir taslaktır. Sparring sorumluluk feragatnamesi, yayına almadan önce
        spor hukuku alanında uzman bir avukat tarafından hazırlanmalı/onaylanmalıdır.
      </Alert>
    </>
  );
}

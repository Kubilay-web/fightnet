import type { Metadata } from "next";
import { Alert } from "@/components/ui";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "FIGHTNET KVKK/GDPR uyumlu veri koruma açıklaması.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">Gizlilik Politikası</h1>
      <p>Son güncelleme: {new Date().toLocaleDateString("tr-TR")}</p>

      <Alert tone="amber" title="Taslak metin">
        Bu metin teknik uygulamayı yansıtan bir taslaktır. Yayına almadan önce KVKK/GDPR
        uzmanı bir avukat tarafından gözden geçirilmelidir.
      </Alert>

      <h2>1. Veri sorumlusu</h2>
      <p>
        FIGHTNET platformunu işleten tüzel kişi veri sorumlusudur. İletişim bilgileri Künye
        (Impressum) sayfasında yer alır.
      </p>

      <h2>2. Hangi verileri işliyoruz</h2>
      <ul>
        <li><b>Hesap verileri:</b> ad, kullanıcı adı, e-posta, şifre (Bcrypt ile hash'lenir)</li>
        <li><b>Profil verileri:</b> biyografi, şehir, doğum tarihi, boy/kulaç, disiplin ve müsabaka bilançosu</li>
        <li><b>Doğrulama verileri:</b> kimlik belgesi ve selfie (yalnızca KYC için, onay sonrası silinir)</li>
        <li><b>Aktivite verileri:</b> antrenman kayıtları, sparring ilanları, rezervasyonlar, gönderiler</li>
        <li><b>Teknik veriler:</b> IP adresi, tarayıcı bilgisi (güvenlik ve kötüye kullanım önleme amacıyla)</li>
      </ul>

      <h2>3. Hukuki dayanak</h2>
      <ul>
        <li>Sözleşmenin ifası (GDPR Md. 6/1-b): hesap yönetimi, rezervasyon, abonelik</li>
        <li>Meşru menfaat (Md. 6/1-f): güvenlik, dolandırıcılık önleme, hizmet iyileştirme</li>
        <li>Açık rıza (Md. 6/1-a): pazarlama e-postaları, isteğe bağlı profil alanları</li>
        <li>Yasal yükümlülük (Md. 6/1-c): fatura saklama, moderasyon kayıtları (DSA)</li>
      </ul>

      <h2>4. Sağlık verisi toplamıyoruz</h2>
      <p>
        FIGHTNET Passport bilinçli olarak sağlık verisi içermez. GDPR Md. 9 kapsamındaki
        özel kategori veriler (sağlık raporu, doktor onayı) platformda saklanmaz.
      </p>

      <h2>5. Görünürlük seviyeleri</h2>
      <p>
        Her veri noktası için kimin ne göreceğine sen karar verirsin: Herkese Açık, Topluluk,
        Salon, Antrenör, Organizatör, Federasyon veya Özel. Antrenman kayıtları varsayılan
        olarak <b>Özel</b>'dir.
      </p>

      <h2>6. Barındırma ve aktarım</h2>
      <p>
        Tüm sunucular Avrupa Birliği içindedir (AWS Frankfurt, eu-central-1). Medya dosyaları
        Cloudinary üzerinde AB bölgesinde saklanır. Veriler AB dışına aktarılmaz.
      </p>

      <h2>7. Güvenlik</h2>
      <ul>
        <li>Aktarımda TLS 1.2+ şifreleme</li>
        <li>Depolamada AES-256 şifreleme</li>
        <li>Şifreler Bcrypt (cost 11) ile hash'lenir — düz metin saklanmaz</li>
        <li>Yönetici erişimi için çok faktörlü doğrulama</li>
        <li>Günlük yedekleme, 30 gün saklama</li>
        <li>Ödeme verileri asla FIGHTNET'te tutulmaz (PCI-DSS uyumlu sağlayıcı)</li>
      </ul>

      <h2>8. Saklama süreleri</h2>
      <ul>
        <li>Hesap verileri: hesap aktif olduğu sürece</li>
        <li>KYC belgeleri: doğrulama onayından sonra 30 gün içinde silinir</li>
        <li>Moderasyon kayıtları: yasal gereklilik gereği 2 yıl</li>
        <li>Silme talebi sonrası: 30 gün içinde tüm veriler silinir</li>
      </ul>

      <h2>9. Haklarınız</h2>
      <ul>
        <li>Bilgi talep etme (Md. 15)</li>
        <li>Düzeltme (Md. 16)</li>
        <li>Silme — "unutulma hakkı" (Md. 17): Ayarlar → Hesabı sil</li>
        <li>İşlemenin kısıtlanması (Md. 18)</li>
        <li>Veri taşınabilirliği (Md. 20): Ayarlar → Verilerimi indir (JSON)</li>
        <li>İtiraz (Md. 21) ve denetim makamına şikayet</li>
      </ul>

      <h2>10. Çerezler</h2>
      <p>
        Yalnızca zorunlu çerezler kullanılır: oturum çerezi (fn_session) ve tema tercihi
        (fn_theme). İzleme veya reklam çerezi kullanılmaz. Analitik için KVKK uyumlu,
        çerezsiz ölçüm tercih edilir.
      </p>

      <h2>11. 18 yaş altı kullanıcılar</h2>
      <p>
        18 yaş altı üyeler için ebeveyn onayı zorunludur. Doğrulanmamış yetişkinler reşit
        olmayan kullanıcılara doğrudan mesaj gönderemez. Reşit olmayanlar için ek içerik
        filtresi uygulanır.
      </p>

      <h2>12. İletişim</h2>
      <p>
        Veri koruma talepleriniz için İletişim sayfasındaki adresi kullanabilirsiniz.
        Taleplere en geç 30 gün içinde yanıt verilir.
      </p>
    </>
  );
}

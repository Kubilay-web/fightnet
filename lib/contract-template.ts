/**
 * §4.6 — Üyelik sözleşmesi metni.
 *
 * Bu modül bilinçli olarak SAFTIR: ne veritabanına ne de `new Date()`'e dokunur.
 * Sebebi eIDAS: imza mührü (`signDocument`) burada üretilen metnin SHA-256
 * özetine bağlanır. Aynı girdiden farklı bir metin çıkarsa `verifySeal`
 * sonradan false döner ve imza kanıt değerini yitirir. Bu yüzden tarih ve para
 * biçimlendirmesi de `Intl` yerine elle yapılır — ICU sürümü değişse bile
 * çıktı aynı kalır.
 */

export interface MembershipContractInput {
  gymName: string;
  gymAddress: string;
  memberName: string;
  memberEmail: string;
  planName: string;
  /** Aylık ücret — KDV dahil brüt */
  monthlyFee: number;
  termMonths: number;
  noticeDays: number;
  startsAt: Date;
  contractNo: string;
  /** Gläubiger-Identifikationsnummer */
  creditorId: string;
  mandateRef: string;
  /** Salonun ülkesine göre KDV oranı; verilmezse Almanya (%19) */
  vatRate?: number;
}

/** 01.09.2026 — UTC üzerinden, sunucu saat dilimine bağlı değil. */
function formatDay(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${d}.${m}.${date.getUTCFullYear()}`;
}

/** 49,90 € — Almanca ondalık ayracı, Intl'e bağımlılık yok. */
function eur(value: number): string {
  return `${(Math.round(value * 100) / 100).toFixed(2).replace(".", ",")} €`;
}

function addMonths(date: Date, months: number): Date {
  const out = new Date(date.getTime());
  const day = out.getUTCDate();
  out.setUTCMonth(out.getUTCMonth() + months);
  // 31 Ocak + 1 ay taşmasını önle (JS ayı 3 Mart'a kaydırır)
  if (out.getUTCDate() < day) out.setUTCDate(0);
  return out;
}

export function renderMembershipContract(input: MembershipContractInput): string {
  const vatRate = input.vatRate ?? 0.19;
  const gross = Math.round(input.monthlyFee * 100) / 100;
  const net = Math.round((gross / (1 + vatRate)) * 100) / 100;
  const vat = Math.round((gross - net) * 100) / 100;
  const vatPercent = `${(Math.round(vatRate * 1000) / 10).toString().replace(".", ",")}%`;

  const minEnd = addMonths(input.startsAt, input.termMonths);
  const creditorId = input.creditorId || "(Gläubiger-ID atanmadı)";

  return `ÜYELİK SÖZLEŞMESİ — MITGLIEDSCHAFTSVERTRAG
Sözleşme No: ${input.contractNo}

§1 TARAFLAR
Hizmet veren (Salon):
  ${input.gymName}
  ${input.gymAddress}
Üye:
  ${input.memberName}
  ${input.memberEmail}

§2 SÖZLEŞMENİN KONUSU
Salon, üyeye "${input.planName}" tarifesi kapsamında antrenman tesislerini ve
tarifeye dahil ders programını kullanma hakkı tanır. Üyelik kişiye özeldir ve
devredilemez. Salon, ders programında mevsimsel değişiklik yapma hakkını saklı
tutar; tarifenin kapsamı esaslı biçimde daralırsa üye olağanüstü fesih hakkını
kullanabilir.

§3 ÜCRET VE KATMA DEĞER VERGİSİ
Aylık üyelik ücreti: ${eur(gross)} (KDV dahil)
  Net tutar          : ${eur(net)}
  KDV (${vatPercent})        : ${eur(vat)}
Ücret her ayın başında peşin olarak muaccel olur ve §6'daki SEPA mandatı
uyarınca tahsil edilir. Fiyat artışı ancak üyeye en az 8 hafta önceden yazılı
bildirimle ve üyenin artış tarihine kadar fesih hakkı tanınarak yapılabilir.

§4 BAŞLANGIÇ, ASGARİ SÜRE VE OTOMATİK UZAMA
Başlangıç tarihi   : ${formatDay(input.startsAt)}
Asgari süre        : ${input.termMonths} ay (${formatDay(minEnd)} tarihine kadar)
BGB §309 Nr. 9 uyarınca asgari süre 24 ayı aşamaz. Asgari sürenin sonunda
sözleşme kendiliğinden SONA ERMEZ; belirsiz süreli (unbefristet) olarak devam
eder. Belirsiz süreye dönüşen sözleşme, üye tarafından her zaman ve en fazla
1 ay ihbar süresiyle feshedilebilir. Sözleşmenin sabit bir süreyle otomatik
olarak yeniden uzatılması geçersizdir.

§5 FESİH
Asgari süre için olağan fesih ihbar süresi: ${input.noticeDays} gün.
Fesih, asgari sürenin bitiminden en geç ${input.noticeDays} gün önce yapılmalıdır;
aksi halde sözleşme §4 uyarınca belirsiz süreli olarak devam eder ve 1 aylık
ihbar süresiyle her zaman feshedilebilir.
Fesih metin biçiminde (BGB §126b: e-posta, platform üzerinden fesih düğmesi)
geçerlidir; ıslak imza aranmaz. Salon fesih beyanını gecikmeksizin metin
biçiminde teyit eder.
Olağanüstü fesih (BGB §314) hakkı — kalıcı hastalık, taşınma, tesisin uzun
süreli kapanması gibi haklı sebeplerde — saklıdır.

§6 SEPA LASTSCHRIFT MANDATI (TEMEL TAHSİLAT / CORE)
Gläubiger-ID (Alacaklı kimliği): ${creditorId}
Mandat referansı (Mandatsreferenz): ${input.mandateRef}

Üye, yukarıda anılan alacaklıyı, hesabından SEPA Temel Lastschrift yöntemiyle
tahsilat yapmaya yetkilendirir. Aynı zamanda kendi kredi kuruluşuna, alacaklı
tarafından hesabına gönderilen Lastschrift talimatlarını ödemesi yönünde
talimat verir.

Ön bildirim (Pre-Notification): İlk tahsilat en erken, tahsilat tarihinden
5 iş günü önce yapılacak bildirimin ardından gerçekleştirilir. Tekrar eden
tahsilatlar için bildirim süresi 2 iş günüdür. Bildirim e-posta ile yapılır.

İtiraz hakkı: Üye, hesabından çekilen tutarın iadesini, borçlandırma
tarihinden itibaren 8 HAFTA içinde talep edebilir. Bu durumda kendi kredi
kuruluşuyla kararlaştırılan koşullar geçerlidir. Yetkisiz bir tahsilatta iade
talebi süresi 13 aydır.

Üye, hesabında yeterli bakiye bulundurmakla yükümlüdür. Karşılıksız iade
(Rücklastschrift) hâlinde bankanın yansıttığı masraflar üyeye aittir; bu
masraflar salonun kusurundan kaynaklanıyorsa talep edilemez.

Mandat, sözleşmenin sona ermesiyle veya üyenin metin biçimindeki beyanıyla her
zaman geri alınabilir. Geri alma, alacaklıya ulaşmasından sonraki tahsilatlar
için hüküm doğurur.

IBAN GÜVENLİĞİ: Üyenin IBAN'ı platformda AÇIK OLARAK SAKLANMAZ. Yalnızca
maskelenmiş biçimi (ör. DE89 **** **** **** **00) ve geri döndürülemez bir
parmak izi tutulur; tahsilat yetkisi ödeme kuruluşunda saklanır.

§7 VERİ KORUMA
Kişisel veriler yalnızca bu sözleşmenin ifası için (DSGVO Art. 6 Abs. 1 lit. b)
ve yasal saklama yükümlülükleri için (lit. c) işlenir. Fatura belgeleri GoBD
ve HGB §257 uyarınca 10 yıl saklanır. Üyenin erişim (Art. 15), düzeltme
(Art. 16), silme (Art. 17), işlemeyi kısıtlama (Art. 18), veri taşınabilirliği
(Art. 20) ve itiraz (Art. 21) hakları saklıdır. Ayrıntılar salonun ve
platformun gizlilik politikasında yer alır.

§8 CAYMA HAKKI (FERNABSATZ — MESAFELİ SÖZLEŞME)
Bu sözleşme uzaktan iletişim araçlarıyla kurulduğundan üye tüketici sıfatıyla
cayma hakkına sahiptir:
  - Cayma süresi: sözleşmenin kurulmasından itibaren 14 GÜN.
  - Cayma bildirimi açık bir beyanla (e-posta, mektup) yapılır; gerekçe
    gösterilmesi gerekmez.
  - Cayma hâlinde alınan ödemeler, bildirimin ulaşmasından itibaren en geç
    14 gün içinde iade edilir.
  - Üyenin açık talebiyle hizmet cayma süresi içinde başlatılmışsa, üye
    yalnızca o ana kadar fiilen kullanılan hizmetin orantılı bedelini öder.
Cayma süresi, üye bu bilgilendirmeyi metin biçiminde almadan başlamaz.

§9 İMZA VE GEÇERLİLİK
Sözleşme, üyenin platform üzerinden verdiği elektronik onayla kurulur. Onay,
eIDAS Tüzüğü (AB) 910/2014 anlamında GELİŞMİŞ ELEKTRONİK İMZA (FES) olarak
üretilir: imzalayanın kimliği, zaman damgası, IP ve cihaz bilgisi ile bu
metnin SHA-256 özeti tek bir mühürde kriptografik olarak birbirine bağlanır.
Metnin tek bir karakteri sonradan değişirse mühür doğrulaması başarısız olur.
BGB §126b'nin aradığı metin biçimi bu yolla sağlanır.
Sözleşmenin bir hükmü geçersiz olursa diğer hükümler geçerliliğini korur;
geçersiz hüküm yerine yasanın öngördüğü düzenleme uygulanır.
Uygulanacak hukuk Almanya Federal Cumhuriyeti hukukudur; tüketicinin mutat
meskeni hukukunun emredici koruyucu hükümleri saklıdır.
`;
}

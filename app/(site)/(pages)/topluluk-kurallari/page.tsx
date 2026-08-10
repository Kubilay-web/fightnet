import type { Metadata } from "next";
import { Card, CardBody, Alert } from "@/components/ui";

export const metadata: Metadata = {
  title: "Topluluk Kuralları",
  description: "FIGHTNET topluluk kuralları — saygı, güvenlik ve şeffaf moderasyon.",
};

const RULES = [
  {
    t: "Saygı esastır",
    b: "Hakaret, aşağılama, ırkçılık, cinsiyetçilik ve nefret söylemi yasaktır. Rakibine saygı duymak dövüş sporunun temelidir.",
  },
  {
    t: "Güvenlik her şeyden önce gelir",
    b: "Güvensiz sparring davranışını bildir. Tehlikeli teknik önerileri ve gözetimsiz ağır sparring teşviki kaldırılır.",
  },
  {
    t: "Doping yok",
    b: "Performans artırıcı madde tavsiyesi, satışı veya kullanımının teşviki kesinlikle yasaktır.",
  },
  {
    t: "Aşırı kilo düşürme yok",
    b: "Tehlikeli kilo düşürme yöntemleri (susuz kalma, aşırı sauna, kusma) paylaşılamaz. Yeme bozukluğunu teşvik eden içerik kaldırılır.",
  },
  {
    t: "Çocukları koru",
    b: "18 yaş altı kullanıcılarla doğrudan iletişim doğrulama gerektirir. Reşit olmayanların özel bilgilerini paylaşma.",
  },
  {
    t: "Cinsel içerik yok",
    b: "Platform bir spor topluluğudur. Cinsel içerik ve müstehcen paylaşım anında kaldırılır.",
  },
  {
    t: "Sahte profil yok",
    b: "Başkası adına hesap açmak, sahte müsabaka bilançosu girmek veya sahte belge sunmak hesabın kapatılmasıyla sonuçlanır.",
  },
  {
    t: "Spam ve reklam kısıtlı",
    b: "İzinsiz ticari tanıtım yapma. Ekipman satışı için Pazar bölümünü kullan.",
  },
];

export default function CommunityRulesPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">Topluluk Kuralları</h1>
      <p>
        FIGHTNET bir dövüş sporu topluluğudur. Bu kurallar herkesin güvenli ve saygılı bir
        ortamda antrenman yapabilmesi içindir.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {RULES.map((r, i) => (
          <Card key={r.t}>
            <CardBody>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blood-600/10 font-display font-black text-blood-500">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold">{r.t}</h3>
                  <p className="mt-1 text-sm text-muted">{r.b}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2>Nasıl moderasyon yapıyoruz</h2>
      <ul>
        <li>Her içerikte rapor butonu vardır</li>
        <li>Raporlar 24 saat içinde incelenir (Notice-and-Action, DSA gerekliliği)</li>
        <li>Videolar otomatik ön filtreden geçer, sonra insan incelemesi yapılır</li>
        <li>Çocuk güvenliği, güvensiz sparring ve şiddet raporları öncelikli işleme alınır</li>
        <li>Yıllık şeffaflık raporu yayınlanır</li>
      </ul>

      <h2>Yaptırımlar</h2>
      <ul>
        <li><b>Uyarı</b> — ilk hafif ihlal</li>
        <li><b>İçerik kaldırma</b> — kural ihlali içeren gönderi/yorum</li>
        <li><b>Geçici askı (30 gün)</b> — tekrarlanan veya ciddi ihlal</li>
        <li><b>Kalıcı kapatma</b> — çocuk güvenliği, sahte kimlik, ağır taciz</li>
      </ul>

      <h2>İtiraz hakkı</h2>
      <p>
        Bir moderasyon kararına itiraz edebilirsiniz. İtirazlar bağımsız olarak yeniden
        değerlendirilir ve sonucu size bildirilir.
      </p>

      <Alert tone="blue" title="Bir şey mi gördün?">
        Kural ihlali gördüğünde içeriğin yanındaki bayrak simgesine tıkla. Bildirimlerin
        gizlidir — bildirdiğin kişi kimliğini görmez.
      </Alert>
    </>
  );
}

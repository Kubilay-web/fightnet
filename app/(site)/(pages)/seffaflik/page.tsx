import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { Card, CardBody, Alert } from "@/components/ui";
import { REPORT_REASON_LABEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Şeffaflık Raporu",
  description:
    "FIGHTNET moderasyon şeffaflık raporu — bildirim sayıları, işlem süreleri ve itiraz sonuçları. DSA uyumlu.",
};

// Rapor gün içinde birkaç kez tazelenir; canlı sayaç olması gerekmiyor
export const revalidate = 3600;

/**
 * §11.5 Kapı 5 — DSA Light uyum: "Yıllık şeffaflık raporu".
 *
 * Rakamlar elle güncellenmez; doğrudan moderasyon kayıtlarından üretilir.
 * Sayılar toplamdır — hiçbir kullanıcı, içerik veya bildiren kişi
 * tanımlanabilir değildir.
 */
async function loadReport() {
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  const [total, byReason, byStatus, resolvedSample, appeals, appealsByStatus] = await Promise.all([
    prisma.report.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.report.groupBy({
      by: ["reason"],
      where: { createdAt: { gte: yearStart } },
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ["status"],
      where: { createdAt: { gte: yearStart } },
      _count: { _all: true },
    }),
    // Ortalama tepki süresi için çözülmüş bildirimlerin zaman damgaları
    prisma.report.findMany({
      where: { createdAt: { gte: yearStart }, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      take: 500,
      orderBy: { resolvedAt: "desc" },
    }),
    prisma.appeal.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.appeal.groupBy({
      by: ["status"],
      where: { createdAt: { gte: yearStart } },
      _count: { _all: true },
    }),
  ]);

  const durations = resolvedSample
    .map((r) => (r.resolvedAt!.getTime() - r.createdAt.getTime()) / 36e5)
    .filter((h) => h >= 0);
  const avgHours = durations.length
    ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
    : null;
  const within24h = durations.length
    ? Math.round((durations.filter((h) => h <= 24).length / durations.length) * 100)
    : null;

  return {
    year: now.getUTCFullYear(),
    total,
    byReason: byReason.map((r) => ({ reason: r.reason, count: r._count._all })).sort((a, b) => b.count - a.count),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])) as Record<string, number>,
    avgHours,
    within24h,
    appeals,
    appealsByStatus: Object.fromEntries(appealsByStatus.map((s) => [s.status, s._count._all])) as Record<string, number>,
  };
}

const EMPTY = {
  year: new Date().getUTCFullYear(),
  total: 0,
  byReason: [] as { reason: string; count: number }[],
  byStatus: {} as Record<string, number>,
  avgHours: null as number | null,
  within24h: null as number | null,
  appeals: 0,
  appealsByStatus: {} as Record<string, number>,
};

export default async function TransparencyPage() {
  const d = await safe(loadReport, EMPTY);

  return (
    <>
      <h1 className="font-display text-3xl font-black tracking-tight">Şeffaflık Raporu {d.year}</h1>
      <p>
        Bu sayfa Dijital Hizmetler Yasası (DSA) kapsamındaki şeffaflık yükümlülüğümüzü karşılar.
        Rakamlar moderasyon kayıtlarımızdan otomatik üretilir ve saatlik tazelenir — elle
        düzenlenmez. Hiçbir sayı tek bir kullanıcıya, içeriğe veya bildirimi yapan kişiye
        geri götürülemez.
      </p>

      <Alert tone="neutral" title="Beta aşaması notu">
        Platform Beta programındadır. Bu dönemde moderasyon kurucu tarafından yürütülür ve
        otomatik ön filtreler (görsel/video ve metin analizi) ile desteklenir. Kullanıcı sayısı
        1.000 aylık aktif doğrulanmış üyeyi aştığında ayrı bir moderasyon ekibi kurulur.
      </Alert>

      <h2>Bildirimler</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Toplam bildirim" value={String(d.total)} />
        <MetricCard label="Açık" value={String((d.byStatus.OPEN ?? 0) + (d.byStatus.IN_REVIEW ?? 0))} />
        <MetricCard label="İşlem yapıldı" value={String(d.byStatus.RESOLVED ?? 0)} />
        <MetricCard label="Reddedildi" value={String(d.byStatus.DISMISSED ?? 0)} />
      </div>

      <h2>Tepki süresi</h2>
      <p>
        Notice-and-Action prosedürümüz 24 saat içinde tepki verilmesini öngörür (DSA gerekliliği).
        Aşağıdaki değerler bu yıl sonuçlandırılan bildirimlerin son 500 kaydından hesaplanır.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Ortalama tepki süresi"
          value={d.avgHours === null ? "—" : `${d.avgHours} saat`}
        />
        <MetricCard
          label="24 saat içinde sonuçlanan"
          value={d.within24h === null ? "—" : `%${d.within24h}`}
        />
      </div>

      <h2>Bildirim gerekçeleri</h2>
      {d.byReason.length === 0 ? (
        <p>Bu yıl henüz bildirim alınmadı.</p>
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--border)]">
            {d.byReason.map((r) => (
              <li key={r.reason} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-sm">{REPORT_REASON_LABEL[r.reason] ?? r.reason}</span>
                <span className="text-sm font-black tabular-nums">{r.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <h2>İtirazlar</h2>
      <p>
        Moderasyon kararlarına itiraz edilebilir. İtiraz, kararı veren kişiden bağımsız olarak
        yeniden değerlendirilir ve sonuç kullanıcıya bildirilir.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Toplam itiraz" value={String(d.appeals)} />
        <MetricCard label="İnceleniyor" value={String(d.appealsByStatus.OPEN ?? 0)} />
        <MetricCard label="Karar korundu" value={String(d.appealsByStatus.UPHELD ?? 0)} />
        <MetricCard label="Karar geri alındı" value={String(d.appealsByStatus.OVERTURNED ?? 0)} />
      </div>

      <h2>Nasıl bildirim yaparım?</h2>
      <ul>
        <li>Her gönderi, yorum, profil, ilan ve etkinlikte bayrak simgeli bildir düğmesi vardır.</li>
        <li>
          Hesabın yoksa veya acil bir güvenlik durumu varsa{" "}
          <Link href="/iletisim" className="font-semibold text-blood-500 hover:underline">
            iletişim sayfasından
          </Link>{" "}
          bize ulaş.
        </li>
        <li>
          Hakkında işlem yapılan içeriğin sahibiysen{" "}
          <Link href="/panel/itirazlar" className="font-semibold text-blood-500 hover:underline">
            panelinden itiraz edebilirsin
          </Link>
          .
        </li>
      </ul>

      <h2>Otomatik araçlar</h2>
      <p>
        Yüklenen görsel ve videolar otomatik ön filtreden geçer; metin içeriği zararlı dil
        tespiti için taranır. Otomatik filtre tek başına kalıcı bir karar vermez — işaretlenen
        içerik her zaman bir insan tarafından incelenir.
      </p>

      <h2>İlgili belgeler</h2>
      <ul>
        <li>
          <Link href="/topluluk-kurallari" className="font-semibold text-blood-500 hover:underline">
            Topluluk Kuralları
          </Link>{" "}
          — hangi içeriğin kaldırıldığı
        </li>
        <li>
          <Link href="/gizlilik" className="font-semibold text-blood-500 hover:underline">
            Gizlilik Açıklaması
          </Link>{" "}
          — verilerin nasıl işlendiği
        </li>
        <li>
          <Link href="/kunye" className="font-semibold text-blood-500 hover:underline">
            Künye (Impressum)
          </Link>{" "}
          — yasal sorumlu ve iletişim noktası
        </li>
      </ul>

      <p className="text-xs">
        Son güncelleme: otomatik · Kapsam: 1 Ocak {d.year} – bugün
      </p>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody className="p-3 sm:p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 font-display text-2xl font-black tabular-nums">{value}</p>
      </CardBody>
    </Card>
  );
}

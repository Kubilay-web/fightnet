import { cn } from "@/lib/utils";

/**
 * Yıllık antrenman ısı haritası (GitHub tarzı).
 * Sunucu bileşeni — istemciye JS gitmez, sadece HTML.
 */
export function StreakCalendar({ days }: { days: { date: string; minutes: number }[] }) {
  const byDate = new Map<string, number>();
  for (const d of days) byDate.set(d.date, (byDate.get(d.date) ?? 0) + d.minutes);

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  // Pazartesi ile hizala
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const weeks: { date: string; minutes: number }[][] = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const week: { date: string; minutes: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const key = cursor.toISOString().slice(0, 10);
      week.push({ date: key, minutes: byDate.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  function level(min: number): string {
    if (min === 0) return "bg-ink-200 dark:bg-ink-800";
    if (min < 45) return "bg-blood-900";
    if (min < 75) return "bg-blood-700";
    if (min < 120) return "bg-blood-500";
    return "bg-blood-400";
  }

  const todayKey = today.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-2">
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex gap-[3px]">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <span
                  key={day.date}
                  title={`${day.date}: ${day.minutes} dk`}
                  className={cn(
                    "size-[10px] rounded-[2px]",
                    level(day.minutes),
                    day.date === todayKey && "ring-1 ring-gold-500",
                    day.date > todayKey && "opacity-0",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted">
        <span>Az</span>
        <span className="size-[10px] rounded-[2px] bg-ink-200 dark:bg-ink-800" />
        <span className="size-[10px] rounded-[2px] bg-blood-900" />
        <span className="size-[10px] rounded-[2px] bg-blood-700" />
        <span className="size-[10px] rounded-[2px] bg-blood-500" />
        <span className="size-[10px] rounded-[2px] bg-blood-400" />
        <span>Çok</span>
      </div>
    </div>
  );
}

import { Link } from "@/components/i18n/link";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { Badge, LiveBadge } from "@/components/ui";
import { VerifiedMark } from "@/components/ui/avatar";
import { cld } from "@/lib/image";
import { cn, initials } from "@/lib/utils";
import { getDict, getLocale } from "@/lib/i18n/server";
import { labelsFor, type Labels } from "@/lib/i18n/labels";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Corner as CornerEnum, Discipline, FightResultMethod, FightStatus, VerificationLevel } from "@prisma/client";

export interface FightData {
  id: string;
  order: number;
  isMainEvent: boolean;
  isTitleFight: boolean;
  discipline: Discipline;
  weightClass: string | null;
  rounds: number;
  redName: string;
  redRecord: string | null;
  redImage: string | null;
  blueName: string;
  blueRecord: string | null;
  blueImage: string | null;
  status: FightStatus;
  winnerCorner: CornerEnum | null;
  method: FightResultMethod | null;
  endRound: number | null;
  endTime: string | null;
  currentRound: number;
  red: { slug: string; avatarUrl: string | null; verification: VerificationLevel } | null;
  blue: { slug: string; avatarUrl: string | null; verification: VerificationLevel } | null;
}

export async function FightCardList({ fights }: { fights: FightData[] }) {
  const [locale, d] = await Promise.all([getLocale(), getDict()]);
  const L = labelsFor(locale);

  if (!fights.length) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-muted">
        {d.fightCard.empty}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {fights.map((f) => (
        <FightRow key={f.id} f={f} d={d} L={L} />
      ))}
    </div>
  );
}

function FightRow({ f, d, L }: { f: FightData; d: Dictionary; L: Labels }) {
  const isLive = f.status === "LIVE";
  const done = f.status === "FINISHED";

  return (
    <article
      className={cn(
        "surface overflow-hidden rounded-2xl transition-colors",
        isLive && "border-blood-500 shadow-lg shadow-blood-600/10",
      )}
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-4 py-2">
        {f.isMainEvent && <Badge tone="gold">{d.fightCard.mainEvent}</Badge>}
        {f.isTitleFight && <Badge tone="red">{d.fightCard.titleFight}</Badge>}
        <Badge>{L.discipline[f.discipline]}</Badge>
        {f.weightClass && <span className="text-xs text-muted">{f.weightClass}</span>}
        <span className="text-xs text-muted">{f.rounds} {d.fightCard.rounds}</span>
        <span className="ml-auto">
          {isLive ? (
            <LiveBadge />
          ) : done ? (
            <Badge tone="green">{d.fightCard.finished}</Badge>
          ) : f.status === "CANCELLED" ? (
            <Badge tone="neutral">{d.fightCard.cancelled}</Badge>
          ) : null}
        </span>
      </header>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-4">
        <FighterCorner side="red" f={f} won={done && f.winnerCorner === "RED"} />

        <div className="flex flex-col items-center gap-1 px-1">
          <span className="font-display text-xl font-black text-muted">VS</span>
          {isLive && f.currentRound > 0 && (
            <span className="rounded-full bg-blood-600 px-2 py-0.5 text-[10px] font-black text-white">
              R{f.currentRound}
            </span>
          )}
        </div>

        <FighterCorner side="blue" f={f} won={done && f.winnerCorner === "BLUE"} />
      </div>

      {done && f.method && (
        <footer className="border-t border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2 text-center text-xs">
          <span className="font-bold">
            {f.winnerCorner === "RED" ? f.redName : f.winnerCorner === "BLUE" ? f.blueName : L.fightMethod.DRAW}
          </span>{" "}
          <span className="text-muted">
            · {L.fightMethod[f.method]}
            {f.endRound ? ` · R${f.endRound}` : ""}
            {f.endTime ? ` ${f.endTime}` : ""}
          </span>
        </footer>
      )}
    </article>
  );
}

function FighterCorner({ side, f, won }: { side: "red" | "blue"; f: FightData; won: boolean }) {
  const isRed = side === "red";
  const name = isRed ? f.redName : f.blueName;
  const record = isRed ? f.redRecord : f.blueRecord;
  const linked = isRed ? f.red : f.blue;
  const img = linked?.avatarUrl ?? (isRed ? f.redImage : f.blueImage);

  const inner = (
    <div className={cn("flex items-center gap-2.5", !isRed && "flex-row-reverse text-right")}>
      <span
        className={cn(
          "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 sm:size-14",
          isRed ? "ring-blood-500" : "ring-blue-500",
          won && "ring-4 ring-gold-500",
        )}
      >
        {img ? (
          <Image src={cld(img, { w: 112, h: 112 })} alt={name} width={56} height={56} className="size-full object-cover" />
        ) : (
          <span className={cn("flex size-full items-center justify-center font-black text-white", isRed ? "bg-blood-700" : "bg-blue-700")}>
            {initials(name)}
          </span>
        )}
      </span>

      <div className="min-w-0">
        <div className={cn("flex items-center gap-1", !isRed && "flex-row-reverse")}>
          <p className="truncate text-sm font-bold sm:text-base">{name}</p>
          {linked && <VerifiedMark level={linked.verification} />}
          {won && <Trophy className="size-3.5 shrink-0 text-gold-500" />}
        </div>
        {record && <p className="truncate text-xs tabular-nums text-muted">{record}</p>}
      </div>
    </div>
  );

  return linked?.slug ? (
    <Link href={`/dovuscular/${linked.slug}`} className="min-w-0 transition-opacity hover:opacity-80">
      {inner}
    </Link>
  ) : (
    <div className="min-w-0">{inner}</div>
  );
}

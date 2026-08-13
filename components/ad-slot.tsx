import { Link } from "@/components/i18n/link";
import Image from "next/image";
import { getActiveAd } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { entitlementsFor } from "@/lib/billing";
import { getDict } from "@/lib/i18n/server";
import { cld } from "@/lib/image";
import { cn } from "@/lib/utils";

/**
 * §4.2 banner reklamı + §4.4 Premium (reklamsız) kademesi.
 *
 * Premium aboneye reklam **sunucuda** hiç render edilmez — istemcide gizlenmez.
 * Böylece hem gereksiz istek yapılmaz hem de "reklamsız" sözü teknik olarak
 * gerçekten karşılanır (CSS ile gizlemek reklamı yine indirirdi).
 */
export async function AdSlot({
  placement,
  width = 1280,
  height = 200,
  className,
}: {
  placement: "HOME_TOP" | "FEED_INLINE" | "EVENT_SIDEBAR" | "GYM_LIST";
  width?: number;
  height?: number;
  className?: string;
}) {
  const [session, dict] = await Promise.all([getSession(), getDict()]);
  const { premium } = await entitlementsFor(session?.sub);
  if (premium) return null;

  const ad = await getActiveAd(placement);
  if (!ad) return null;

  return (
    <Link
      href={ad.linkUrl}
      target="_blank"
      rel="sponsored noopener"
      aria-label={`Reklam — ${ad.advertiser}`}
      className={cn("block overflow-hidden rounded-2xl border border-[var(--border)]", className)}
    >
      <Image
        src={cld(ad.imageUrl, { w: width, h: height })}
        alt={ad.advertiser}
        width={width}
        height={height}
        className="h-auto w-full object-cover"
      />
      <span className="sr-only">{dict.ui.sponsored}</span>
    </Link>
  );
}

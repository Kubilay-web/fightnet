"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/i18n/provider";
import { panelPostsCopy } from "@/lib/i18n/pages/panel-posts";

/**
 * İyimser takip düğmesi — sunucu yanıtı beklenmeden UI güncellenir,
 * hata durumunda geri alınır.
 */
export function FollowButton({
  targetId,
  initialFollowing,
  authed,
  size = "sm",
}: {
  targetId: string;
  initialFollowing: boolean;
  authed: boolean;
  size?: "sm" | "md";
}) {
  const t = panelPostsCopy[useLocale()].follow;
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [optimistic, setOptimistic] = useOptimistic(following);
  const [, startTransition] = useTransition();

  function toggle() {
    if (!authed) {
      router.push("/giris?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    const next = !following;
    startTransition(async () => {
      setOptimistic(next);
      const res = await fetch(`/api/follow/${targetId}`, {
        method: next ? "POST" : "DELETE",
      });
      if (res.ok) {
        setFollowing(next);
        router.refresh();
      }
    });
  }

  return (
    <Button
      onClick={toggle}
      size={size}
      variant={optimistic ? "outline" : "primary"}
      aria-pressed={optimistic}
    >
      {optimistic ? (
        <>
          <UserCheck className="size-4" /> {t.following}
        </>
      ) : (
        <>
          <UserPlus className="size-4" /> {t.follow}
        </>
      )}
    </Button>
  );
}

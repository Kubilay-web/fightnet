import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { markNotificationsRead } from "@/app/panel/actions";
import { Avatar } from "@/components/ui/avatar";
import { Card, Section, EmptyState, Button } from "@/components/ui";
import { timeAgo, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Bildirimler", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await safe(
    () =>
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 60,
        select: {
          id: true, type: true, title: true, body: true, url: true, isRead: true, createdAt: true,
          actor: { select: { name: true, slug: true, avatarUrl: true } },
        },
      }),
    [],
  );

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Bildirimler"
        subtitle={unread > 0 ? `${unread} okunmamış` : "Hepsi okundu"}
        action={
          unread > 0 ? (
            <form action={markNotificationsRead}>
              <Button type="submit" variant="outline" size="sm">
                <CheckCheck className="size-4" /> Tümünü okundu işaretle
              </Button>
            </form>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-10" />}
          title="Bildirim yok"
          description="Takip, sparring talebi ve canlı skor bildirimleri burada görünür."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--border)]">
            {notifications.map((n) => {
              const content = (
                <div className={cn("flex items-start gap-3 p-4", !n.isRead && "bg-blood-500/5")}>
                  {n.actor ? (
                    <Avatar src={n.actor.avatarUrl} name={n.actor.name} size="md" />
                  ) : (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blood-600/10 text-blood-500">
                      <Bell className="size-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", !n.isRead && "font-bold")}>{n.title}</p>
                    {n.body && <p className="mt-0.5 line-clamp-2-safe text-xs text-muted">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-muted">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blood-500" />}
                </div>
              );
              return (
                <li key={n.id}>
                  {n.url ? (
                    <Link href={n.url} className="block transition-colors hover:bg-ink-100 dark:hover:bg-ink-800">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

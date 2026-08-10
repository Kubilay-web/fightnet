import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, Section, EmptyState, Alert } from "@/components/ui";
import { timeAgo, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mesajlar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await requireUser();

  const conversations = await safe(
    () =>
      prisma.conversationMember.findMany({
        where: { userId: user.id },
        orderBy: { conversation: { lastMessageAt: "desc" } },
        take: 50,
        select: {
          unreadCount: true,
          conversation: {
            select: {
              id: true,
              lastMessage: true,
              lastMessageAt: true,
              members: {
                where: { userId: { not: user.id } },
                select: {
                  user: {
                    select: { id: true, name: true, slug: true, avatarUrl: true, verification: true },
                  },
                },
                take: 1,
              },
            },
          },
        },
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Mesajlar"
        subtitle="Sporcular, antrenörler ve salonlarla doğrudan iletişim"
      />

      {user.isMinor && !user.guardianConsent && (
        <Alert tone="amber" title="Mesajlaşma kısıtlı">
          Velinin onayı gelene kadar yetişkinler sana mesaj gönderemez ve sen de mesaj başlatamazsın.
        </Alert>
      )}

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="size-10" />}
          title="Henüz mesajın yok"
          description="Bir sporcunun profilinden ya da sparring eşleşmesinden sohbet başlatabilirsin."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--border)]">
            {conversations.map(({ conversation: c, unreadCount }) => {
              const other = c.members[0]?.user;
              return (
                <li key={c.id}>
                  <Link
                    href={`/panel/mesajlar/${c.id}`}
                    className="flex items-center gap-3 p-3 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800/60"
                  >
                    <Avatar src={other?.avatarUrl} name={other?.name ?? "Silinmiş kullanıcı"} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                        {other?.name ?? "Silinmiş kullanıcı"}
                        {other && <VerifiedMark level={other.verification} />}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {c.lastMessage ? truncate(c.lastMessage, 70) : "Sohbet başladı"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[11px] text-muted">{timeAgo(c.lastMessageAt)}</span>
                      {unreadCount > 0 && <Badge tone="red">{unreadCount}</Badge>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

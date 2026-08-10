import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Card, CardBody, Alert } from "@/components/ui";
import { ReportButton } from "@/components/report-button";
import { MessageComposer } from "@/components/message-forms";
import { formatDateTime, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sohbet", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const membership = await prisma.conversationMember.findFirst({
    where: { conversationId: id, userId: user.id },
    select: { id: true },
  });
  if (!membership) notFound();

  const [other, messages] = await Promise.all([
    prisma.conversationMember.findFirst({
      where: { conversationId: id, userId: { not: user.id } },
      select: {
        user: {
          select: {
            id: true, name: true, slug: true, avatarUrl: true, verification: true,
            isMinor: true, guardianConsent: true, isBanned: true,
          },
        },
      },
    }),
    prisma.message.findMany({
      where: { conversationId: id, moderation: { not: "REMOVED" } },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: { id: true, body: true, senderId: true, createdAt: true },
    }),
  ]);

  // Okundu işaretle. Render sırasında `revalidatePath` çağrılamayacağı için
  // sayaç doğrudan güncellenir; liste sayfası zaten force-dynamic.
  await prisma.conversationMember
    .updateMany({
      where: { conversationId: id, userId: user.id, unreadCount: { gt: 0 } },
      data: { unreadCount: 0, lastReadAt: new Date() },
    })
    .catch(() => {});

  const partner = other?.user;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/panel/mesajlar"
          aria-label="Mesajlara dön"
          className="inline-flex size-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <Avatar src={partner?.avatarUrl} name={partner?.name ?? "Silinmiş kullanıcı"} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate font-bold">
            {partner ? (
              <Link href={`/dovuscular/${partner.slug}`} className="hover:underline">
                {partner.name}
              </Link>
            ) : (
              "Silinmiş kullanıcı"
            )}
            {partner && <VerifiedMark level={partner.verification} />}
          </p>
          {partner?.isMinor && (
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-500">
              18 yaş altı — koruma kuralları geçerli
            </p>
          )}
        </div>
        {partner && (
          <ReportButton targetType="USER" targetId={partner.id} reportedUserId={partner.id} authed compact />
        )}
      </div>

      {partner?.isBanned && (
        <Alert tone="amber">Bu kullanıcının hesabı askıya alınmış. Yeni mesaj gönderilemez.</Alert>
      )}

      <Card>
        <CardBody className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              Henüz mesaj yok. İlk mesajı sen yaz.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div key={m.id} className={cn("flex flex-col gap-0.5", mine ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-md bg-blood-600 text-white"
                      : "rounded-bl-md bg-ink-100 dark:bg-ink-800",
                  )}
                >
                  {m.body}
                </div>
                <span className="px-1 text-[11px] text-muted">{formatDateTime(m.createdAt)}</span>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {!partner?.isBanned && <MessageComposer conversationId={id} />}
    </div>
  );
}

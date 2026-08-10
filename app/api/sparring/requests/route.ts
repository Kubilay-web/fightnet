import prisma from "@/lib/prisma";
import { guard, isResponse, parseBody, ok, fail } from "@/lib/api";
import { sparringRequestSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notify";
import { isRestrictedMinor } from "@/lib/guardian";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard({ bucket: "sparring-req", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  // §4.5 — Sparring araması Seviye 1'de açılır
  if (session.verification === "LEVEL_0") {
    return fail("Sparring talebi için Seviye 1 doğrulama gerekir", 403);
  }

  const parsed = await parseBody(req, sparringRequestSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  const listing = await prisma.sparringListing.findUnique({
    where: { id: d.listingId },
    select: { id: true, userId: true, status: true, discipline: true },
  });
  if (!listing || listing.status !== "OPEN") return fail("İlan bulunamadı veya kapalı", 404);
  if (listing.userId === session.sub) return fail("Kendi ilanına talep gönderemezsin", 400);

  // §11.1 — Reşit olmayanlarla doğrulanmamış yetişkin teması engeli
  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.sub }, select: { isMinor: true, guardianConsent: true } }),
    prisma.user.findUnique({ where: { id: listing.userId }, select: { isMinor: true, guardianConsent: true, name: true } }),
  ]);
  if (receiver?.isMinor && !sender?.isMinor && session.verification !== "LEVEL_2") {
    return fail("18 yaş altı sporculara talep göndermek için Seviye 2 doğrulama gerekir", 403);
  }
  // Kapı 1 — veli onayı gelmeden reşit olmayan taraf fiziksel buluşmaya eşleşemez
  if (sender && isRestrictedMinor(sender)) {
    return fail("Sparring talebi için velinin onayı gerekiyor. Panelinden onay bağlantısı gönderebilirsin.", 403);
  }
  if (receiver?.isMinor && !receiver.guardianConsent) {
    return fail("Bu sporcunun veli onayı henüz alınmadı. Onay gelene kadar talep gönderilemez.", 403);
  }

  try {
    const request = await prisma.sparringRequest.create({
      data: {
        listingId: listing.id,
        senderId: session.sub,
        receiverId: listing.userId,
        message: d.message || null,
        proposedDate: d.proposedDate ? new Date(d.proposedDate) : null,
        waiverAccepted: true,
        waiverAcceptedAt: new Date(),
      },
      select: { id: true },
    });

    notify({
      userId: listing.userId,
      actorId: session.sub,
      type: "SPARRING_REQUEST",
      title: `${session.name} sparring talebi gönderdi`,
      body: d.message || undefined,
      url: "/panel/sparring",
    });

    return ok({ ok: true, id: request.id }, { status: 201 });
  } catch {
    return fail("Bu ilana zaten talep gönderdin", 409);
  }
}

/** Talebi yanıtla (kabul / reddet) */
export async function PATCH(req: Request) {
  const g = await guard({ bucket: "sparring-res", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;

  const { id, action } = (await req.json().catch(() => ({}))) as { id?: string; action?: string };
  if (!id || !["ACCEPT", "DECLINE", "CANCEL"].includes(action ?? "")) {
    return fail("Geçersiz istek", 400);
  }

  const request = await prisma.sparringRequest.findUnique({
    where: { id },
    select: { id: true, senderId: true, receiverId: true, status: true, listingId: true },
  });
  if (!request) return fail("Talep bulunamadı", 404);

  const isReceiver = request.receiverId === session.sub;
  const isSender = request.senderId === session.sub;
  if (!isReceiver && !isSender) return fail("Yetkisiz", 403);
  if (action === "CANCEL" && !isSender) return fail("Yetkisiz", 403);
  if (action !== "CANCEL" && !isReceiver) return fail("Yetkisiz", 403);

  const status = action === "ACCEPT" ? "ACCEPTED" : action === "DECLINE" ? "DECLINED" : "CANCELLED";

  await prisma.sparringRequest.update({ where: { id }, data: { status } });

  if (action === "ACCEPT") {
    await prisma.sparringListing.update({ where: { id: request.listingId }, data: { status: "MATCHED" } });
    notify({
      userId: request.senderId,
      actorId: session.sub,
      type: "SPARRING_ACCEPTED",
      title: `${session.name} sparring talebini kabul etti`,
      url: "/panel/sparring",
    });
  }

  return ok({ ok: true, status });
}

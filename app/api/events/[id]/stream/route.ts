import { z } from "zod";
import prisma from "@/lib/prisma";
import { guard, isResponse, ok, fail, parseBody, noStore } from "@/lib/api";
import { LIMITS } from "@/lib/rate-limit";
import { audit } from "@/lib/notify";
import {
  createChannel,
  deleteChannel,
  getStreamState,
  authorizedPlaybackUrl,
  streamConfigured,
} from "@/lib/services/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * §4.4 — Canlı yayın ve PPV erişimi.
 *
 * GET  → izleyici için oynatma adresi. Ücretli etkinlikte satın alma kaydı
 *        doğrulanmadan adres **hiç döndürülmez**; IVS yetkili kanallarda
 *        ayrıca kısa ömürlü oynatma jetonu imzalanır.
 * POST → organizatör kanal açar veya harici HLS adresi bağlar.
 * DELETE → kanalı kapatır.
 */

export async function GET(_req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "stream-read", ...LIMITS.search });
  if (isResponse(g)) return g;
  const session = g.session;
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true, isPPV: true, ppvPrice: true, status: true, organizerId: true,
      streamChannel: {
        select: { playbackUrl: true, channelArn: true, status: true, authorized: true, viewerPeak: true },
      },
    },
  });
  if (!event) return fail("Etkinlik bulunamadı", 404);
  if (!event.streamChannel) return noStore({ available: false, reason: "no_channel" });

  // Ücretsiz yayın: herkes izleyebilir
  if (!event.isPPV) {
    return noStore({
      available: true,
      playbackUrl: event.streamChannel.playbackUrl,
      status: event.streamChannel.status,
    });
  }

  if (!session) return fail("Bu yayın ücretlidir, giriş yapmalısın", 401, { code: "ppv_login" });

  // Organizatör kendi yayınını her zaman görür
  const isOrganizer = session.sub === event.organizerId;
  if (!isOrganizer) {
    const purchase = await prisma.ppvPurchase.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: session.sub } },
      select: { status: true, accessUntil: true },
    });
    const valid =
      purchase?.status === "PAID" && (!purchase.accessUntil || purchase.accessUntil > new Date());
    if (!valid) {
      return fail("Bu yayın için erişimin yok", 402, { code: "ppv_required", price: event.ppvPrice });
    }
  }

  return noStore({
    available: true,
    playbackUrl: authorizedPlaybackUrl(
      event.streamChannel.playbackUrl,
      event.streamChannel.channelArn,
      session.sub,
    ),
    status: event.streamChannel.status,
  });
}

const setupSchema = z.object({
  mode: z.enum(["IVS", "EXTERNAL"]).default("IVS"),
  externalUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "stream-setup", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;
  const { id } = await params;

  const parsed = await parseBody(req, setupSchema);
  if ("error" in parsed) return parsed.error;

  const event = await prisma.event.findFirst({
    where: { id, organizerId: session.sub },
    select: { id: true, title: true, isPPV: true, streamChannel: { select: { id: true } } },
  });
  if (!event) return fail("Etkinlik bulunamadı veya organizatörü değilsin", 404);
  if (event.streamChannel) return fail("Bu etkinliğin zaten bir yayın kanalı var", 409);

  if (parsed.data.mode === "EXTERNAL") {
    if (!parsed.data.externalUrl) return fail("Harici yayın adresi gerekli", 422);
    const channel = await prisma.streamChannel.create({
      data: {
        eventId: event.id,
        provider: "EXTERNAL",
        playbackUrl: parsed.data.externalUrl,
        // Harici kaynakta jeton imzalanamaz; PPV kilidi sunucu tarafında
        // satın alma kaydıyla uygulanır (GET ucu adresi hiç vermez).
        authorized: false,
      },
      select: { id: true, playbackUrl: true },
    });
    audit({ userId: session.sub, action: "STREAM_EXTERNAL_SET", targetType: "EVENT", targetId: event.id });
    return ok({ channel, provider: "EXTERNAL" }, { status: 201 });
  }

  if (!streamConfigured) {
    return fail(
      "Amazon IVS yapılandırılmamış. Harici bir HLS/DASH adresi bağlayabilirsin.",
      503,
      { code: "ivs_unavailable" },
    );
  }

  const ivs = await createChannel({
    name: `fightnet-${event.id}`,
    authorized: event.isPPV,
    tags: { platform: "fightnet", eventId: event.id },
  });
  if (!ivs) return fail("IVS kanalı oluşturulamadı", 502);

  const channel = await prisma.streamChannel.create({
    data: {
      eventId: event.id,
      provider: "IVS",
      channelArn: ivs.arn,
      playbackUrl: ivs.playbackUrl,
      streamKey: ivs.streamKey,
      ingestEndpoint: ivs.ingestEndpoint,
      authorized: ivs.authorized,
    },
    select: { id: true, playbackUrl: true, streamKey: true, ingestEndpoint: true },
  });

  audit({ userId: session.sub, action: "STREAM_CHANNEL_CREATE", targetType: "EVENT", targetId: event.id });
  return ok({ channel, provider: "IVS" }, { status: 201 });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "stream-setup", auth: true, ...LIMITS.write });
  if (isResponse(g)) return g;
  const session = g.session!;
  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id, organizerId: session.sub },
    select: { streamChannel: { select: { id: true, channelArn: true } } },
  });
  if (!event?.streamChannel) return fail("Kanal bulunamadı", 404);

  if (event.streamChannel.channelArn) await deleteChannel(event.streamChannel.channelArn);
  await prisma.streamChannel.delete({ where: { id: event.streamChannel.id } });

  return ok({ ok: true });
}

/** Organizatör panosunun canlı durumu için — izleyici sayısı ve yayın durumu. */
export async function PATCH(_req: Request, { params }: Ctx) {
  const g = await guard({ bucket: "stream-state", ...LIMITS.search });
  if (isResponse(g)) return g;
  const { id } = await params;

  const channel = await prisma.streamChannel.findUnique({
    where: { eventId: id },
    select: { id: true, channelArn: true, status: true, viewerPeak: true },
  });
  if (!channel?.channelArn) return noStore({ live: false, viewerCount: 0 });

  const state = await getStreamState(channel.channelArn);

  // Durum değiştiyse kalıcı hâle getir — etkinlik sayfası bunu okur
  const nextStatus = state.live ? "LIVE" : channel.status === "LIVE" ? "ENDED" : channel.status;
  if (nextStatus !== channel.status || state.viewerCount > channel.viewerPeak) {
    await prisma.streamChannel.update({
      where: { id: channel.id },
      data: {
        status: nextStatus,
        viewerPeak: Math.max(channel.viewerPeak, state.viewerCount),
        ...(state.live && channel.status !== "LIVE" ? { startedAt: new Date() } : {}),
        ...(!state.live && channel.status === "LIVE" ? { endedAt: new Date() } : {}),
      },
    });
  }

  return noStore(state);
}

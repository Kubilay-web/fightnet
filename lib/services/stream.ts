import "server-only";
import { createPrivateKey, createSign } from "node:crypto";
import { awsConfigured, awsRequest, AWS_REGION } from "./aws";

/**
 * §4.4 — Canlı yayın / PPV altyapısı (Amazon IVS).
 *
 * Üç parça:
 *   1. Kanal yönetimi — organizatör etkinliğe kanal açar, yayın anahtarı alır
 *   2. Yetkili oynatma — PPV kanalları `authorized: true` açılır; oynatma
 *      yalnızca imzalı jetonla mümkündür, böylece paylaşılan URL işe yaramaz
 *   3. Fallback — IVS yapılandırılmamışsa organizatör harici bir HLS/DASH
 *      adresi girer (`Event.streamUrl`); PPV kilidi bu durumda uygulama
 *      tarafında (imzalı playback jetonu + sunucu tarafı kontrol) uygulanır
 */

const PLAYBACK_KEY_ARN = process.env.IVS_PLAYBACK_KEY_ARN;
const PLAYBACK_PRIVATE_KEY = process.env.IVS_PLAYBACK_PRIVATE_KEY;

export const streamConfigured = awsConfigured;
export const streamAuthConfigured = Boolean(PLAYBACK_KEY_ARN && PLAYBACK_PRIVATE_KEY);

const IVS_HOST = `ivs.${AWS_REGION}.amazonaws.com`;

export interface IvsChannel {
  arn: string;
  playbackUrl: string;
  ingestEndpoint: string;
  streamKey: string;
  authorized: boolean;
}

interface CreateChannelResponse {
  channel?: { arn?: string; playbackUrl?: string; ingestEndpoint?: string; authorized?: boolean };
  streamKey?: { value?: string };
}

/**
 * @param authorized PPV etkinliklerinde true — oynatma jetonsuz reddedilir.
 */
export async function createChannel(input: {
  name: string;
  authorized: boolean;
  /** BASIC (1080p, düşük maliyet) veya STANDARD (transcoding) */
  type?: "BASIC" | "STANDARD";
  tags?: Record<string, string>;
}): Promise<IvsChannel | null> {
  if (!awsConfigured) return null;
  try {
    const json = await awsRequest<CreateChannelResponse>({
      service: "ivs",
      host: IVS_HOST,
      path: "/CreateChannel",
      contentType: "application/json",
      body: {
        name: input.name.slice(0, 128),
        authorized: input.authorized,
        latencyMode: "LOW",
        type: input.type ?? "BASIC",
        ...(input.tags ? { tags: input.tags } : {}),
      },
    });
    if (!json.channel?.arn || !json.channel.playbackUrl) return null;
    return {
      arn: json.channel.arn,
      playbackUrl: json.channel.playbackUrl,
      ingestEndpoint: json.channel.ingestEndpoint ?? "",
      streamKey: json.streamKey?.value ?? "",
      authorized: Boolean(json.channel.authorized),
    };
  } catch {
    return null;
  }
}

export async function deleteChannel(arn: string): Promise<boolean> {
  if (!awsConfigured) return false;
  try {
    await awsRequest({
      service: "ivs",
      host: IVS_HOST,
      path: "/DeleteChannel",
      contentType: "application/json",
      body: { arn },
    });
    return true;
  } catch {
    return false;
  }
}

export interface StreamState {
  live: boolean;
  viewerCount: number;
  startedAt: string | null;
}

export async function getStreamState(channelArn: string): Promise<StreamState> {
  if (!awsConfigured) return { live: false, viewerCount: 0, startedAt: null };
  try {
    const json = await awsRequest<{
      stream?: { state?: string; viewerCount?: number; startTime?: string };
    }>({
      service: "ivs",
      host: IVS_HOST,
      path: "/GetStream",
      contentType: "application/json",
      body: { channelArn },
    });
    return {
      live: json.stream?.state === "LIVE",
      viewerCount: json.stream?.viewerCount ?? 0,
      startedAt: json.stream?.startTime ?? null,
    };
  } catch {
    // GetStream, kanal yayında değilken ChannelNotBroadcasting hatası döner
    return { live: false, viewerCount: 0, startedAt: null };
  }
}

// ---------------------------------------------------------------------------
// Oynatma jetonu — PPV paywall'ın teknik dayanağı
// ---------------------------------------------------------------------------

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * IVS yetkili oynatma jetonu (ES384 imzalı JWT).
 * Yalnızca satın alma doğrulandıktan sonra üretilir ve kısa ömürlüdür.
 */
export function signPlaybackToken(input: {
  channelArn: string;
  /** Saniye cinsinden geçerlilik — varsayılan 4 saat (bir etkinlik süresi) */
  ttlSec?: number;
  viewerId: string;
}): string | null {
  if (!PLAYBACK_KEY_ARN || !PLAYBACK_PRIVATE_KEY) return null;
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: "ES384", typ: "JWT", kid: PLAYBACK_KEY_ARN }));
    const payload = base64url(
      JSON.stringify({
        "aws:channel-arn": input.channelArn,
        "aws:access-control-allow-origin": process.env.NEXT_PUBLIC_APP_URL ?? "*",
        exp: now + (input.ttlSec ?? 4 * 3600),
        iat: now,
        sub: input.viewerId,
      }),
    );
    const signer = createSign("SHA384");
    signer.update(`${header}.${payload}`);
    const key = createPrivateKey(PLAYBACK_PRIVATE_KEY.replace(/\\n/g, "\n"));
    const signature = signer.sign({ key, dsaEncoding: "ieee-p1363" });
    return `${header}.${payload}.${base64url(signature)}`;
  } catch {
    return null;
  }
}

/**
 * Oynatma adresini izleyiciye vermeden önce jetonla imzalar.
 * IVS yapılandırılmamışsa adres olduğu gibi döner — bu durumda erişim
 * denetimi tamamen sunucu tarafındadır (satın alma kaydı kontrol edilir).
 */
export function authorizedPlaybackUrl(
  playbackUrl: string,
  channelArn: string | null,
  viewerId: string,
): string {
  if (!channelArn) return playbackUrl;
  const token = signPlaybackToken({ channelArn, viewerId });
  if (!token) return playbackUrl;
  const sep = playbackUrl.includes("?") ? "&" : "?";
  return `${playbackUrl}${sep}token=${token}`;
}

import "server-only";
import { createHash, createHmac } from "node:crypto";

/**
 * Minimal AWS Signature V4 imzalayıcı.
 *
 * Rekognition (§11.3 video ön filtre) ve IVS (§4.4 canlı yayın) tek bir JSON
 * uç noktasına POST atar; bunun için tam AWS SDK'sını (≈15 MB) bundle'a almak
 * yerine imzalama burada yapılır. Kimlik bilgisi yoksa çağıran modül
 * `awsConfigured` üzerinden fallback'e düşer.
 */

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const SESSION_TOKEN = process.env.AWS_SESSION_TOKEN;

/** §5.4 — tüm sunucular AB'de. Varsayılan Frankfurt. */
export const AWS_REGION = process.env.AWS_REGION ?? "eu-central-1";

export const awsConfigured = Boolean(ACCESS_KEY && SECRET_KEY);

function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function signingKey(dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmac(`AWS4${SECRET_KEY}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

export interface AwsRequestInput {
  service: string;
  /** Örn. "RekognitionService.DetectModerationLabels" */
  target?: string;
  body: unknown;
  region?: string;
  /** Varsayılan `{service}.{region}.amazonaws.com` */
  host?: string;
  path?: string;
  contentType?: string;
}

export class AwsError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AwsError";
  }
}

export async function awsRequest<T>(input: AwsRequestInput): Promise<T> {
  if (!ACCESS_KEY || !SECRET_KEY) throw new AwsError("AWS kimlik bilgisi yok", 503);

  const region = input.region ?? AWS_REGION;
  const host = input.host ?? `${input.service}.${region}.amazonaws.com`;
  const path = input.path ?? "/";
  const payload = typeof input.body === "string" ? input.body : JSON.stringify(input.body);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const headers: Record<string, string> = {
    "content-type": input.contentType ?? "application/x-amz-json-1.1",
    host,
    "x-amz-date": amzDate,
  };
  if (input.target) headers["x-amz-target"] = input.target;
  if (SESSION_TOKEN) headers["x-amz-security-token"] = SESSION_TOKEN;

  const sortedKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedKeys.map((k) => `${k}:${headers[k]}\n`).join("");
  const signedHeaders = sortedKeys.join(";");
  const payloadHash = sha256Hex(payload);

  const canonicalRequest = [
    "POST",
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/${region}/${input.service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signature = hmac(signingKey(dateStamp, region, input.service), stringToSign).toString("hex");

  const res = await fetch(`https://${host}${path}`, {
    method: "POST",
    headers: {
      ...headers,
      authorization: `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: payload,
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) throw new AwsError(text.slice(0, 400) || `AWS ${res.status}`, res.status);
  return (text ? JSON.parse(text) : {}) as T;
}

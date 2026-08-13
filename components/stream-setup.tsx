"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Radio, Trash2, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Card, CardBody, Field, Input } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { panelCreatorCopy } from "@/lib/i18n/pages/panel-creator";

/**
 * §4.4 — Organizatörün yayın kanalı kurulumu.
 *
 * İki yol: Amazon IVS kanalı (platform açar, yayın anahtarını verir) veya
 * organizatörün kendi HLS/DASH adresi. PPV etkinliklerde IVS kanalı yetkili
 * modda açılır — jetonsuz oynatma sunucu tarafında reddedilir.
 */
export function StreamSetup({
  eventId,
  isPPV,
  channel,
}: {
  eventId: string;
  isPPV: boolean;
  channel: {
    provider: string;
    playbackUrl: string;
    streamKey: string | null;
    ingestEndpoint: string | null;
    status: string;
    authorized: boolean;
    viewerPeak: number;
  } | null;
}) {
  const t = panelCreatorCopy[useLocale()].stream;
  const router = useRouter();
  const [mode, setMode] = useState<"IVS" | "EXTERNAL">("IVS");
  const [externalUrl, setExternalUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/events/${eventId}/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, externalUrl }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      router.refresh();
      setBusy(false);
      return;
    }
    setError(json.error ?? t.createError);
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/events/${eventId}/stream`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  if (channel) {
    return (
      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={channel.status === "LIVE" ? "red" : "neutral"}>
              {channel.status === "LIVE" ? t.statusLive : channel.status === "ENDED" ? t.statusEnded : t.statusReady}
            </Badge>
            <Badge tone="neutral">{channel.provider}</Badge>
            {channel.authorized && <Badge tone="green">{t.authorizedPlayback}</Badge>}
            <span className="ml-auto text-xs text-muted">{t.viewerPeak} {channel.viewerPeak}</span>
          </div>

          {channel.provider === "IVS" ? (
            <>
              <Alert tone="amber" title={t.keyWarning.title}>
                {t.keyWarning.body}
              </Alert>

              <CopyRow
                label={t.serverRtmps}
                value={channel.ingestEndpoint ? `rtmps://${channel.ingestEndpoint}:443/app/` : "—"}
                onCopy={copy}
                copied={copied}
              />
              <CopyRow label={t.streamKey} value={channel.streamKey ?? "—"} secret onCopy={copy} copied={copied} />
            </>
          ) : (
            <CopyRow label={t.playbackUrl} value={channel.playbackUrl} onCopy={copy} copied={copied} />
          )}

          {isPPV && (
            <p className="text-xs text-muted">
              {t.ppvNote}
            </p>
          )}

          <Button variant="outline" size="sm" onClick={remove} disabled={busy} className="self-start">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <><Trash2 className="size-4" /> {t.closeChannel}</>}
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={mode === "IVS" ? "primary" : "outline"}
            onClick={() => setMode("IVS")}
          >
            <Radio className="size-4" /> {t.platformChannel}
          </Button>
          <Button
            size="sm"
            variant={mode === "EXTERNAL" ? "primary" : "outline"}
            onClick={() => setMode("EXTERNAL")}
          >
            <Tv className="size-4" /> {t.ownUrl}
          </Button>
        </div>

        {mode === "IVS" ? (
          <p className="text-sm text-muted">
            {t.ivsInfo}
            {isPPV && t.ivsPpvSuffix}
          </p>
        ) : (
          <Field label={t.externalField} hint={t.externalHint}>
            <Input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder={t.externalPlaceholder}
            />
          </Field>
        )}

        {error && <Alert tone="red">{error}</Alert>}

        <Button onClick={create} disabled={busy || (mode === "EXTERNAL" && !externalUrl)} className="self-start">
          {busy ? <Loader2 className="size-4 animate-spin" /> : t.openChannel}
        </Button>
      </CardBody>
    </Card>
  );
}

function CopyRow({
  label,
  value,
  secret,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  secret?: boolean;
  onCopy: (label: string, value: string) => void;
  copied: string | null;
}) {
  const t = panelCreatorCopy[useLocale()].stream;
  const [shown, setShown] = useState(!secret);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-[var(--surface-2)] px-3 py-2 font-mono text-xs">
          {shown ? value : "•".repeat(24)}
        </code>
        {secret && (
          <Button variant="ghost" size="sm" onClick={() => setShown((v) => !v)}>
            {shown ? t.hide : t.show}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onCopy(label, value)}>
          <Copy className="size-4" /> {copied === label ? t.copied : t.copy}
        </Button>
      </div>
    </div>
  );
}

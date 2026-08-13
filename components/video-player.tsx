"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { videoPoster } from "@/lib/image";
import { useDict } from "@/components/i18n/provider";

/**
 * Hafif video oynatıcı.
 * Poster gösterilir, gerçek video ancak kullanıcı oynat dediğinde
 * indirilir — sayfa açılışında bant genişliği harcanmaz (§5.6: video
 * oynatma başlangıcı < 3s).
 */
export function VideoPlayer({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string | null;
  className?: string;
}) {
  const t = useDict().ui;
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const cover = poster ?? videoPoster(src, 1080);

  useEffect(() => {
    if (active) ref.current?.play().catch(() => {});
  }, [active]);

  return (
    <div className={`relative aspect-video bg-black ${className ?? ""}`}>
      {active ? (
        <video
          ref={ref}
          src={src}
          poster={cover || undefined}
          controls
          playsInline
          preload="metadata"
          className="size-full"
        />
      ) : (
        <button
          onClick={() => setActive(true)}
          aria-label={t.playVideo}
          className="group relative size-full"
          style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/10">
            <span className="flex size-16 items-center justify-center rounded-full bg-blood-600/90 backdrop-blur transition-transform group-hover:scale-110">
              <Play className="ml-1 size-7 fill-white text-white" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

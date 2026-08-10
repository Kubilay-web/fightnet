import type { Metadata } from "next";
import { Mail, Building2, Handshake, ShieldAlert, Megaphone } from "lucide-react";
import { Card, CardBody } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "İletişim",
  description: "FIGHTNET ile iletişime geç — salon ortaklığı, sponsorluk, basın ve destek.",
};

const CHANNELS = [
  { icon: Building2, t: "Salonlar", b: "Kurucu Üyelik ve salon ortaklığı", mail: "gyms@fightnet.app" },
  { icon: Handshake, t: "Sponsorluk", b: "Marka işbirlikleri ve reklam", mail: "partners@fightnet.app" },
  { icon: Megaphone, t: "Basın", b: "Basın kiti ve röportaj talepleri", mail: "press@fightnet.app" },
  { icon: ShieldAlert, t: "Güvenlik & KVKK", b: "Veri talepleri ve güvenlik bildirimleri", mail: "privacy@fightnet.app" },
];

export default function ContactPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">İletişim</h1>
      <p>
        Sorunun ya da teklifin mi var? Aşağıdaki kanallardan bize ulaş — genelde 2 iş günü
        içinde yanıt veriyoruz.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map(({ icon: Icon, t, b, mail }) => (
          <Card key={t}>
            <CardBody className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold">{t}</h3>
                <p className="text-sm text-muted">{b}</p>
                <a href={`mailto:${mail}`} className="mt-1 inline-block truncate text-sm font-bold text-blood-500 hover:underline">
                  {mail}
                </a>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2>Bekleme listesine katıl</h2>
      <p>
        Beta erişimi almak veya salonunu kaydetmek istiyorsan formu doldur — davet
        sıradayken sana ulaşırız.
      </p>
      <Card>
        <CardBody>
          <WaitlistForm source="contact" />
        </CardBody>
      </Card>
    </>
  );
}

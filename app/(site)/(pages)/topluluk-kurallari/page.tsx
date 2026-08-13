import type { Metadata } from "next";
import { Card, CardBody, Alert } from "@/components/ui";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { communityRulesCopy } from "@/lib/i18n/pages/community-rules";

export async function generateMetadata(): Promise<Metadata> {
  const copy = communityRulesCopy[await getLocale()];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: await metadataAlternates("/topluluk-kurallari"),
  };
}

export default async function CommunityRulesPage() {
  const copy = communityRulesCopy[await getLocale()];

  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">{copy.title}</h1>
      <p>{copy.intro}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {copy.rules.map((r, i) => (
          <Card key={r.t}>
            <CardBody>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blood-600/10 font-display font-black text-blood-500">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold">{r.t}</h3>
                  <p className="mt-1 text-sm text-muted">{r.b}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2>{copy.moderation.heading}</h2>
      <ul>
        {copy.moderation.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{copy.sanctions.heading}</h2>
      <ul>
        {copy.sanctions.items.map((item) => (
          <li key={item.label}>
            <b>{item.label}</b> {item.text}
          </li>
        ))}
      </ul>

      <h2>{copy.appeal.heading}</h2>
      <p>{copy.appeal.body}</p>

      <Alert tone="blue" title={copy.notice.title}>
        {copy.notice.body}
      </Alert>
    </>
  );
}

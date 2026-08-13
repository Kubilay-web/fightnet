import type { Metadata } from "next";
import { Fragment } from "react";
import { ShieldAlert } from "lucide-react";
import { Alert, Card, CardBody } from "@/components/ui";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { sparringAgreementCopy } from "@/lib/i18n/pages/sparring-agreement";

export async function generateMetadata(): Promise<Metadata> {
  const copy = sparringAgreementCopy[await getLocale()];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: await metadataAlternates("/sparring-sozlesmesi"),
  };
}

type Section = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

function Sections({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section) => (
        <Fragment key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          {section.items ? (
            <ul>
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

export default async function SparringAgreementPage() {
  const copy = sparringAgreementCopy[await getLocale()];

  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">{copy.title}</h1>

      <Alert tone="red" title={copy.intro.title}>
        <span className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {copy.intro.body}
        </span>
      </Alert>

      <Sections sections={copy.sections} />

      <Card className="border-blood-500/40">
        <CardBody>
          <h3 className="font-bold">{copy.autoBan.heading}</h3>
          <p className="mt-1 text-sm text-muted">
            {copy.autoBan.before}
            <b className="text-[var(--fg)]">{copy.autoBan.strong}</b>
            {copy.autoBan.after}
          </p>
        </CardBody>
      </Card>

      <Sections sections={copy.finalSections} />

      <Alert tone="amber" title={copy.notice.title}>
        {copy.notice.body}
      </Alert>
    </>
  );
}

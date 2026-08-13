import type { Metadata } from "next";
import { Fragment } from "react";
import { Alert } from "@/components/ui";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { imprintCopy } from "@/lib/i18n/pages/imprint";

export async function generateMetadata(): Promise<Metadata> {
  const copy = imprintCopy[await getLocale()];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: await metadataAlternates("/kunye"),
  };
}

export default async function ImprintPage() {
  const copy = imprintCopy[await getLocale()];

  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">{copy.title}</h1>

      <Alert tone="amber" title={copy.notice.title}>
        {copy.notice.body}
      </Alert>

      {copy.sections.map((section) => (
        <Fragment key={section.heading}>
          <h2>{section.heading}</h2>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Fragment>
      ))}

      <h2>{copy.dispute.heading}</h2>
      <p>
        {copy.dispute.before}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener"
          className="underline"
        >
          {copy.dispute.linkLabel}
        </a>
        {copy.dispute.after}
      </p>

      <h2>{copy.liability.heading}</h2>
      <p>{copy.liability.body}</p>
    </>
  );
}

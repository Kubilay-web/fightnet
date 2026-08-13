import type { Metadata } from "next";
import { Fragment } from "react";
import { Link } from "@/components/i18n/link";
import { Alert } from "@/components/ui";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { termsCopy } from "@/lib/i18n/pages/terms";

export async function generateMetadata(): Promise<Metadata> {
  const copy = termsCopy[await getLocale()];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: await metadataAlternates("/sartlar"),
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const copy = termsCopy[locale];

  return (
    <>
      <h1 className="font-display text-3xl font-black sm:text-4xl">{copy.title}</h1>
      <p>
        {copy.lastUpdated} {new Date().toLocaleDateString(LOCALE_TAG[locale])}
      </p>

      <Alert tone="amber" title={copy.draft.title}>
        {copy.draft.body}
      </Alert>

      {copy.sections.map((section) => (
        <Fragment key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph, i) => (
            <p key={i}>
              {typeof paragraph === "string" ? (
                paragraph
              ) : (
                <>
                  {paragraph.before}
                  <Link href="/sparring-sozlesmesi" className="font-bold underline">
                    {paragraph.linkLabel}
                  </Link>
                  {paragraph.after}
                </>
              )}
            </p>
          ))}
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

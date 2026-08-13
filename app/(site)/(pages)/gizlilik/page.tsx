import type { Metadata } from "next";
import { Fragment } from "react";
import { Alert } from "@/components/ui";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { privacyCopy } from "@/lib/i18n/pages/privacy";

export async function generateMetadata(): Promise<Metadata> {
  const copy = privacyCopy[await getLocale()];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: await metadataAlternates("/gizlilik"),
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const copy = privacyCopy[locale];

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
                  <b>{paragraph.strong}</b>
                  {paragraph.after}
                </>
              )}
            </p>
          ))}
          {section.items ? (
            <ul>
              {section.items.map((item, i) => (
                <li key={i}>
                  {typeof item === "string" ? (
                    item
                  ) : (
                    <>
                      <b>{item.label}</b> {item.text}
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 pb-20 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mt-4 [&_h3]:font-bold [&_li]:text-sm [&_li]:text-[var(--fg-muted)] [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-[var(--fg-muted)] [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

import { requireUser } from "@/lib/auth";
import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}

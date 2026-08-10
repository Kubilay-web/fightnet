import { requireUser } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { PanelNav } from "@/components/panel-nav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        <PanelNav role={user.role} />
        <main id="main" className="min-w-0 flex-1 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}

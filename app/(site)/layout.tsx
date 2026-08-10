import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileTabbar } from "@/components/layout/mobile-tabbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileTabbar />
    </div>
  );
}

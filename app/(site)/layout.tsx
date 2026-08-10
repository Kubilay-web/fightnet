import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileTabbar } from "@/components/layout/mobile-tabbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    /* Alt sekme çubuğu (h-16) sabit konumlu — mobilde son içeriği ve
       footer'ı örtmemesi için kolona alt boşluk bırakılır. */
    <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileTabbar />
    </div>
  );
}

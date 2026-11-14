import { TopNotice } from "@/components/layout/TopNotice";
import { AgentBar } from "@/components/layout/AgentBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCta } from "@/components/layout/StickyCta";
import { ToastSuggestion } from "@/components/ui/ToastSuggestion";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNotice />
      <AgentBar />
      <Header />
      <main id="app">{children}</main>
      <Footer />
      <StickyCta />
      <ToastSuggestion />
    </>
  );
}

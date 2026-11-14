import type { Metadata } from "next";
import { Montserrat, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/config/site";
import { ContactProvider } from "@/components/contact/ContactProvider";
import { ContactModals } from "@/components/contact/ContactModals";
import { UnitDrawer } from "@/components/ui/UnitDrawer";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE_CONFIG.domain}`),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.brandDisplayName}`,
  },
  description: SITE_CONFIG.description,
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${beVietnamPro.variable}`}
    >
      <body>
        <ContactProvider>
          {children}
          <UnitDrawer />
          <ContactModals />
        </ContactProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/I18n";
import { loadDict } from "@/lib/dict";
import { getSession } from "@/lib/session";

const almarai = Almarai({ subsets: ["arabic"], weight: ["300", "400", "700", "800"], variable: "--font-almarai", display: "swap" });

export const metadata: Metadata = {
  title: "منصة التكافل · Takaful Platform",
  description: "Demo of the Takaful Insurance Company platform",
  robots: { index: false, follow: false },
  icons: { icon: "/brand/favicon.png" },
};
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang } = await getSession();
  const { dict } = await loadDict();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={almarai.variable}>
      <body>
        <I18nProvider lang={lang} dict={dict}>{children}</I18nProvider>
      </body>
    </html>
  );
}

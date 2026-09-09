import { Archivo, Archivo_Black } from "next/font/google";
import { SiteHeader, SiteFooter } from "./_components/site-chrome";
import "./marketing.css";

const body = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`mkt ${body.variable} ${display.variable} flex min-h-dvh flex-col`}
      style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

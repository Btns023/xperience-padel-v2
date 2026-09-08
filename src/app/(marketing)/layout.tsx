import { Anton } from "next/font/google";
import { SiteHeader, SiteFooter } from "./_components/site-chrome";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
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
      className={`${display.variable} flex min-h-dvh flex-col bg-[#0b0b0c] text-white`}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

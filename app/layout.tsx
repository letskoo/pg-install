import FixedCtaButton from "@/components/cta/FixedCtaButton";
import "../src/app/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-slate-900 overflow-x-hidden">
        <div className="min-h-screen pb-[120px]">{children}</div>
        <FixedCtaButton />
      </body>
    </html>
  );
}

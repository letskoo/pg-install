import FixedCtaButton from "@/components/cta/FixedCtaButton";
import LeadFlowProvider from "@/components/lead-flow/LeadFlowProvider";
import "../src/app/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-slate-900 overflow-x-hidden">
        <LeadFlowProvider>
          <div className="min-h-screen pb-[120px]">{children}</div>
          <FixedCtaButton />
        </LeadFlowProvider>
      </body>
    </html>
  );
}

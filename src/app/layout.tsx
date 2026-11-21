import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QuickAuthModal } from "@/components/QuickAuthModal";
import { PendingReviewBlockerModal } from "@/components/PendingReviewBlockerModal";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { SharePlatformWidget } from "@/components/SharePlatformWidget";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Combinado — Catálogo de Serviços Locais",
  description:
    "Encontre pedreiros, eletricistas, diaristas e profissionais locais avaliados pela comunidade e chame direto no WhatsApp.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Combinado",
  },
};

export const viewport: Viewport = {
  themeColor: "#00B048",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F6F8FC] text-[#121d27]">
        <AppProvider>
          <Header />
          <main className="flex-1 pb-20 md:pb-10">{children}</main>
          <Footer />
          <QuickAuthModal />
          <PendingReviewBlockerModal />
          <PwaInstallBanner />
          <SharePlatformWidget />
        </AppProvider>
      </body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EstoqueProvider } from "@/lib/EstoqueContext";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return null;
}

export async function generateMetadata() {
  const baseUrl = getBaseUrl();
  
  return {
    title: "MAV FitWear - Sistema de Controle de Estoque",
    description: "Sistema completo para gerenciamento de estoque, produtos e movimentações",
    ...(baseUrl && {
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: baseUrl,
      },
    }),
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <EstoqueProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </EstoqueProvider>
      </body>
    </html>
  );
}


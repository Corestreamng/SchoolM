import type React from "react";
import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/context/auth-context";
import { LanguageProvider } from "@/context/language-context";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoreSkool Staff Dashboard",
  description: "Staff management portal for CoreSkool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Analytics />
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

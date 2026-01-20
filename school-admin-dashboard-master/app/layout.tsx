import type React from "react";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { LanguageProvider } from "@/context/language-context";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoreSkool Admin",
  description: "School Management System Administration",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} antialiased`}>
        <QueryProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

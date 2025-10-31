import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCProvider } from "@/trpc/client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloudflare SaaS Stack",
  description: "A full stack SaaS starter kit for Cloudflare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <body className={inter.className}>
            <ImpersonationBanner />
            {children}
            <Toaster />
          </body>
        </ThemeProvider>
      </TRPCProvider>
    </html>
  );
}

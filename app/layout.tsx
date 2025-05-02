import "./globals.css"; // Pastikan ini diimpor di awal
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BTC, Gold & IDR Comparison",
  description: "Compare the performance of Bitcoin, Gold and Indonesian Rupiah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 bg-muted/40">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

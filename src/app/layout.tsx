import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liniswara Smart Steps — Platform Tryout & Materi Video TKA",
  description:
    "Website simulasi tryout online, materi video pembelajaran, dan aktivasi kode redeem buku Smart Steps TKA dari PT Lini Suara Nusantara (Liniswara).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

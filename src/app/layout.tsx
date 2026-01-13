import type { Metadata, Viewport } from "next";
import { Rubik, Heebo } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0F766E",
};

export const metadata: Metadata = {
  title: "STEM Explorers - חוקרי STEM",
  description: "מרחב למידה לבית ספר יסודי",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/logo-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/logo-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: "/icons/logo-192.png",
  },
  openGraph: {
    title: "STEM Explorers - חוקרי STEM",
    description: "מרחב למידה לבית ספר יסודי",
    images: ["/icons/logo-512.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${heebo.variable}`}>
      <body className="font-heebo bg-background text-foreground min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

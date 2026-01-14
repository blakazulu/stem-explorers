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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "STEM Explorers - חוקרי STEM",
  description: "מרחב למידה לבית ספר יסודי",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "STEM Explorers - חוקרי STEM",
    description: "מרחב למידה לבית ספר יסודי",
    siteName: "חוקרי STEM",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "חוקרי STEM לוגו",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "STEM Explorers - חוקרי STEM",
    description: "מרחב למידה לבית ספר יסודי",
    images: ["/web-app-manifest-512x512.png"],
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

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// প্রিমিয়াম ও এসইও ফ্রেন্ডলি মেটাডেটা
export const metadata: Metadata = {
  title: {
    template: "%s |  Ajaia Docs",
    default: "Ajaia Docs — Premium Collaborative Workspace",
  },
  description:
    "An elite, lightning-fast collaborative document editor built for high-performance teams.",
  keywords: [
    "Next.js",
    "Tiptap",
    "Supabase",
    "Collaborative Editor",
    "Aesthetic Docs",
  ],
  authors: [{ name: "Mahmudul Hasan Nirab" }],
  openGraph: {
    title: "Ajaia Docs — Premium Collaborative Workspace",
    description: "Experience the next-gen aesthetic document editor.",
    url: "https://ajaia-docs-gamma-two.vercel.app",
    siteName: "Ajaia Docs",
    locale: "en_US",
    type: "website",
  },
  // ব্রাউজার থিম কালার (মোবাইল বা ডার্ক/লাইট হেডার প্রিমিয়াম করার জন্য)
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased selection:bg-blue-600 selection:text-white`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}

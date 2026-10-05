import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/toast";
import { COMPANY_NAME } from "@/lib/supabase";

export const metadata: Metadata = {
  title: { default: "Ops Console", template: "%s · Ops Console" },
  description: "Nexordis operations console: dispatch, analytics, calls and conversations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar company={COMPANY_NAME} />
            <main className="min-w-0 flex-1 lg:pl-64">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

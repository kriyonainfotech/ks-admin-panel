import type { Metadata } from "next";
import { geistSans, geistMono, robotoSlab, nunito } from "@/lib/fonts";
import "./globals.css";
import { ReduxProvider } from "@/src/redux/Provider";
import { AuthProvider } from "@/src/context/AuthContext";
import { Toaster } from "sonner";
import { SessionExpiredModal } from "@/src/components/SessionExpiredModal";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin panel for ks-software",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${robotoSlab.variable} ${nunito.variable} antialiased`}
      >
        <ReduxProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReduxProvider>
        <Toaster position="top-right" richColors />
        <SessionExpiredModal />
      </body>
    </html>
  );
}

import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Suspense fallback={<div className="h-16 border-b" />}>
            <Navbar />
          </Suspense>
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
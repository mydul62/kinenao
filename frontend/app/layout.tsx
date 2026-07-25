import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import ScrollToTop from "@/components/ScrollToTop";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "KineNao | Luxury Beauty & Cosmetics Boutique",
  description: "Shop authentic skincare, makeup, lipsticks, and designer perfumes online with swift delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable)} suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground min-h-screen" suppressHydrationWarning>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

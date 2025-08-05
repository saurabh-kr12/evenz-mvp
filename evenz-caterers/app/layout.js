import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from '@/context/AuthContext';
import ClientLayout from '@/components/ClientLayout';
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. Create a simple loading component for the initial page load
function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  );
}

export const metadata = {
  title: "Evenz Caterers",
  description: "Professional catering services platform",
  icons: {
    icon: '/Evenz_app_logo.png', // /public is implied
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <AuthProvider>
          <Suspense fallback={<RootLoading />}>
            <ClientLayout>
              {children}
            </ClientLayout>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
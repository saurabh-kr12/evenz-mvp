import { AuthProvider } from '../context/AuthContext';
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';
import GoogleAnalytics from '../components/GoogleAnalytics';

export const metadata = {
  title: 'Evenz.in - Event Planning Made Easy',
  description: 'Find and book the best caterers for your events',
  icons: {
    icon: '/Evenz_app_logo.png', // /public is implied
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <AuthProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              {children}
            </main>
            <Footer />
            <Toaster position="top-center" />
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';

export const metadata = {
  title: 'Evenz - Event Planning Made Easy',
  description: 'Find and book the best vendors for your events',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}

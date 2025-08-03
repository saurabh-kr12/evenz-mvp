"use client"
import React from 'react';
import Link from 'next/link';
import {Instagram, Twitter, Linkedin, Facebook} from 'lucide-react';

const Footer = () => {
   const currentYear = new Date().getFullYear();
   return (
      <footer className="bg-gray-900 text-white">
         <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* --- About Section --- */}
               <div>
                  <h3 className="text-lg font-semibold mb-4">Evenz.in Vendor Portal</h3>
                  <p className="text-gray-400 text-sm">
                     The all-in-one platform to manage your catering business, connect with new clients in Patna, and grow your brand.
                  </p>
               </div>

               {/* --- CHANGED: Quick Links are now public-facing and useful to all visitors --- */}
               <div>
                  <h3 className="text-lg font-semibold mb-4">Resources</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                     <li><Link href="/how-it-works" className="hover:text-pink-500 transition-colors">How It Works</Link></li>
                     <li><Link href="/faq" className="hover:text-pink-500 transition-colors"> FAQs</Link></li>
                     <li><Link href="https://evenz.in" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">Client Website</Link></li>
                  </ul>
               </div>

               {/* --- Contact & Socials --- */}
               <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                     <li>Email: <a href="mailto:partners@evenz.in" className="hover:text-pink-500">partners@evenz.in</a></li>
                  </ul>
                  <div className="mt-6 flex space-x-2">
                     {[
                        { href: "https://instagram.com/evenz_in", Icon: Instagram },
                        { href: "https://x.com/Evenz_in", Icon: Twitter },
                        { href: "https://linkedin.com/company/evenz-india", Icon: Linkedin },
                        { href: "https://www.facebook.com/Evenz.inOfficial", Icon: Facebook }
                     ].map(({ href, Icon }) => (
                        <a
                           key={href}
                           href={href}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-10 h-10 text-gray-100 hover:text-pink-500 transition-colors"
                        >
                           <Icon className="w-5 h-5 text-gray-200 hover:text-gray-400" />
                        </a>
                     ))}
                  </div>
               </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
               <p className="text-sm text-gray-400">&copy; {currentYear} Evenz.in. All rights reserved.</p>
               <div className="mt-4 md:mt-0 flex space-x-6">
                  <Link href="/terms" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">Terms of Service</Link>
                  <Link href="/privacy" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">Privacy Policy</Link>
               </div>
            </div>
         </div>
      </footer>
   );
};

export default Footer;

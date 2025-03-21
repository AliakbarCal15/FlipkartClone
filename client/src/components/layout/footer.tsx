import React from 'react';
import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-flipTextDark text-white mt-8 pt-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 border-b border-gray-700">
          {/* About Section */}
          <div>
            <h3 className="text-gray-400 mb-3 uppercase text-xs font-medium">ABOUT</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:underline">Contact Us</Link></li>
              <li><Link href="#" className="hover:underline">About Us</Link></li>
              <li><Link href="#" className="hover:underline">Careers</Link></li>
              <li><Link href="#" className="hover:underline">Flipkart Stories</Link></li>
              <li><Link href="#" className="hover:underline">Press</Link></li>
              <li><Link href="#" className="hover:underline">Flipkart Wholesale</Link></li>
              <li><Link href="#" className="hover:underline">Corporate Information</Link></li>
            </ul>
          </div>
          
          {/* Help Section */}
          <div>
            <h3 className="text-gray-400 mb-3 uppercase text-xs font-medium">HELP</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:underline">Payments</Link></li>
              <li><Link href="#" className="hover:underline">Shipping</Link></li>
              <li><Link href="#" className="hover:underline">Cancellation & Returns</Link></li>
              <li><Link href="#" className="hover:underline">FAQ</Link></li>
              <li><Link href="#" className="hover:underline">Report Infringement</Link></li>
            </ul>
          </div>
          
          {/* Consumer Policy Section */}
          <div>
            <h3 className="text-gray-400 mb-3 uppercase text-xs font-medium">CONSUMER POLICY</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:underline">Return Policy</Link></li>
              <li><Link href="#" className="hover:underline">Terms Of Use</Link></li>
              <li><Link href="#" className="hover:underline">Security</Link></li>
              <li><Link href="#" className="hover:underline">Privacy</Link></li>
              <li><Link href="#" className="hover:underline">Sitemap</Link></li>
              <li><Link href="#" className="hover:underline">Grievance Redressal</Link></li>
            </ul>
          </div>
          
          {/* Social Section */}
          <div>
            <h3 className="text-gray-400 mb-3 uppercase text-xs font-medium">SOCIAL</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:underline">Facebook</Link></li>
              <li><Link href="#" className="hover:underline">Twitter</Link></li>
              <li><Link href="#" className="hover:underline">YouTube</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-b border-gray-700">
          {/* Mail Us Section */}
          <div>
            <h3 className="text-gray-400 mb-3 uppercase text-xs font-medium">MAIL US</h3>
            <p className="text-xs leading-5">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </p>
          </div>
          
          {/* Registered Office Section */}
          <div>
            <h3 className="text-gray-400 mb-3 uppercase text-xs font-medium">REGISTERED OFFICE</h3>
            <p className="text-xs leading-5">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India<br />
              CIN: U51109KA2012PTC066107<br />
              Telephone: 044-45614700
            </p>
          </div>
        </div>
        
        <div className="py-6 flex flex-wrap justify-between items-center">
          <div className="flex flex-wrap space-x-4 mb-4 md:mb-0">
            <Link href="#" className="text-sm flex items-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Become a Seller
            </Link>
            <Link href="#" className="text-sm flex items-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Advertise
            </Link>
            <Link href="#" className="text-sm flex items-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Gift Cards
            </Link>
            <Link href="#" className="text-sm flex items-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help Center
            </Link>
          </div>
          <div className="text-sm">© 2007-{new Date().getFullYear()} Flipkart.com</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

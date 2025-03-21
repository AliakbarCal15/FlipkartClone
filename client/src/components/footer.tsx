import { Link } from "wouter";
import {
  User,
  Store,
  TrendingUp,
  Gift,
  HelpCircle,
  Facebook,
  Twitter,
  Youtube
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#212121] text-white pt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-sm text-[#878787] font-medium uppercase mb-4">ABOUT</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-xs hover:underline">Contact Us</Link></li>
              <li><Link href="#" className="text-xs hover:underline">About Us</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Careers</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Flipkart Stories</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Press</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Flipkart Wholesale</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Corporate Information</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm text-[#878787] font-medium uppercase mb-4">HELP</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-xs hover:underline">Payments</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Shipping</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Cancellation & Returns</Link></li>
              <li><Link href="#" className="text-xs hover:underline">FAQ</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Report Infringement</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm text-[#878787] font-medium uppercase mb-4">POLICY</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-xs hover:underline">Return Policy</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Terms Of Use</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Security</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Privacy</Link></li>
              <li><Link href="#" className="text-xs hover:underline">Sitemap</Link></li>
              <li><Link href="#" className="text-xs hover:underline">EPR Compliance</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm text-[#878787] font-medium uppercase mb-4">SOCIAL</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-xs hover:underline flex items-center">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs hover:underline flex items-center">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs hover:underline flex items-center">
                  <Youtube className="w-4 h-4 mr-2" />
                  YouTube
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="py-4 border-t border-gray-700 grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-[#878787] font-medium mb-2">Mail Us:</h3>
            <p className="text-xs">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </p>
          </div>
          
          <div>
            <h3 className="text-sm text-[#878787] font-medium mb-2">Registered Office Address:</h3>
            <p className="text-xs">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India<br />
              CIN : U51109KA2012PTC066107<br />
              Telephone: 044-45614700
            </p>
          </div>
        </div>
        
        <div className="py-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-wrap items-center justify-center md:justify-start mb-4 md:mb-0">
            <Link href="#" className="flex items-center text-xs mr-6 mb-2 md:mb-0">
              <Store className="mr-2" size={16} />
              Become a Seller
            </Link>
            <Link href="#" className="flex items-center text-xs mr-6 mb-2 md:mb-0">
              <TrendingUp className="mr-2" size={16} />
              Advertise
            </Link>
            <Link href="#" className="flex items-center text-xs mr-6 mb-2 md:mb-0">
              <Gift className="mr-2" size={16} />
              Gift Cards
            </Link>
            <Link href="#" className="flex items-center text-xs mb-2 md:mb-0">
              <HelpCircle className="mr-2" size={16} />
              Help Center
            </Link>
          </div>
          
          <div className="text-xs">© 2007-2023 Flipkart.com</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl text-white">
                Roti <span className="text-amber-400">Lezat</span>
              </span>
            </div>
            <p className="text-stone-400 mb-4">
              Menyajikan roti berkualitas dengan bahan terbaik sejak 2010. 
              Setiap gigitan adalah pengalaman istimewa.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-stone-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Menu Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">Produk</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">Tentang Kami</Link>
              </li>
              <li>
                <Link to="/location" className="hover:text-amber-400 transition-colors">Lokasi</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">Kontak</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Kontak Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 mt-0.5" />
                <span>Jl. Roti No. 123, Jakarta Selatan, 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400" />
                <span>hello@rotilezat.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Jam Buka</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-white">Senin - Jumat</p>
                  <p className="text-stone-400">07:00 - 21:00</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-white">Sabtu - Minggu</p>
                  <p className="text-stone-400">08:00 - 22:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-stone-800 mt-10 pt-6 text-center">
          <p className="text-stone-500">
            © {new Date().getFullYear()} Roti Lezat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

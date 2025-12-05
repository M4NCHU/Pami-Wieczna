import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Strona Główna', path: '/' },
    { name: 'Sklep', path: '/shop' },
    { name: 'Przykładowy Profil', path: '/profile/demo' },
    { name: 'Stwórz Wspomnienie', path: '/create' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <Heart className="h-6 w-6 text-stone-600 fill-stone-600" />
              <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                Pamięć Wieczna
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'border-stone-800 text-stone-900'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-stone-400 hover:text-stone-500 hover:bg-stone-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200">
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-stone-50 border-stone-800 text-stone-900'
                      : 'border-transparent text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-serif font-bold mb-4">Pamięć Wieczna</h3>
              <p className="text-sm leading-relaxed">
                Tworzymy przestrzeń, w której wspomnienia o Twoich bliskich trwają wiecznie. 
                Nowoczesne tabliczki QR łączą tradycję z cyfrową pamięcią.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-serif font-bold mb-4">Kontakt</h3>
              <p className="text-sm">ul. Wspomnień 12</p>
              <p className="text-sm">00-001 Warszawa</p>
              <p className="text-sm mt-2">kontakt@pamiecwieczna.pl</p>
            </div>
            <div>
              <h3 className="text-white text-lg font-serif font-bold mb-4">Dla Klienta</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/shop" className="hover:text-white transition">Sklep</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">Pytania i odpowiedzi</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Polityka prywatności</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-stone-800 pt-8 text-center text-xs">
            &copy; 2024 Pamięć Wieczna. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
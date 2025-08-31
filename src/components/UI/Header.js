// Header.js

import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const HEADER_OFFSET = 100;

  const smoothScrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const sections = ['home', 'apartments', 'booking', 'contact'];
      const scrollY = window.scrollY;

      for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const offsetTop = section.offsetTop - HEADER_OFFSET;
          const offsetBottom = offsetTop + section.offsetHeight;
          if (scrollY >= offsetTop && scrollY < offsetBottom) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'apartments', label: 'Apartments' },
    { id: 'booking', label: 'Booking' },
    { id: 'contact', label: 'Contact' },
  ];

  const linkTo = (id) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <header className="bg-royal shadow sticky top-0 z-50 border-b-2 border-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {isHome ? (
            <a
              href="#home"
              className="text-2xl font text-white hover:text-gray-300 transition"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollToId('home');
                setMobileMenuOpen(false);
              }}
            >
              AppArtment
            </a>
          ) : (
            <Link
              to="/#home"
              className="text-2xl font text-white hover:text-gray-300 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              AppArtment
            </Link>
          )}

          <nav className="hidden md:flex space-x-8 lg:space-x-16 text-lg text-white items-center">
            {navLinks.map((link) =>
              isHome ? (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`relative hover:text-gray-300 transition ${
                    activeSection === link.id ? 'text-gray-300 active-link' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollToId(link.id);
                  }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.id}
                  to={linkTo(link.id)}
                  className="relative hover:text-gray-300 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}

            {isHome ? (
              <a
                href="#booking"
                className="bg-olive text-white px-4 py-2 rounded-xl hover:brightness-95 transition"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId('booking');
                }}
              >
                Book Now
              </a>
            ) : (
              <Link
                to="/#booking"
                className="bg-olive text-white px-4 py-2 rounded-xl hover:brightness-95 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            )}
          </nav>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white text-3xl"
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-royal text-white px-6 py-4 space-y-8 w-full absolute top-20 left-1/2 transform -translate-x-1/2 shadow-lg z-40 transition rounded-lg rounded-t-none">
          {navLinks.map((link) => (
            <div key={link.id} className="relative">
              {isHome && activeSection === link.id && (
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-0 h-0 border-y-8 border-l-8 border-y-transparent border-l-white" />
              )}

              {isHome ? (
                <a
                  href={`#${link.id}`}
                  className={`block text-lg pl-4 transition ${
                    activeSection === link.id ? 'text-gray-300 font-medium' : 'hover:text-gray-300'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollToId(link.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={linkTo(link.id)}
                  className="block text-lg pl-4 hover:text-gray-300 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}

          {isHome ? (
            <a
              href="#booking"
              className="inline-block bg-olive text-white px-4 py-2 rounded-xl hover:brightness-95 transition"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollToId('booking');
                setMobileMenuOpen(false);
              }}
            >
              Book Now
            </a>
          ) : (
            <Link
              to="/#booking"
              className="inline-block bg-olive text-white px-4 py-2 rounded-xl hover:brightness-95 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

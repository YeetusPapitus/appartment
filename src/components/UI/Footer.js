// Footer.js

import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const to = (id) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <footer className="bg-royal text-white py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          {isHome ? (
            <a href="#home" className="text-2xl mb-4 block hover:text-gray-300 transition">AppArtment</a>
          ) : (
            <Link to="/#home" className="text-2xl mb-4 block hover:text-gray-300 transition">AppArtment</Link>
          )}
          <p className="text-white">
            Providing comfortable and luxurious accommodation for travelers and long-term guests.
          </p>
        </div>

        <div>
          <h3 className="text-xl mb-4">Quick Links</h3>
          <ul className="space-y-2 text-white">
            <li>
              {isHome ? (
                <a href="#home" className="hover:text-gray-300 transition">Home</a>
              ) : (
                <Link to={to('home')} className="hover:text-gray-300 transition">Home</Link>
              )}
            </li>
            <li>
              {isHome ? (
                <a href="#apartments" className="hover:text-gray-300 transition">Apartments</a>
              ) : (
                <Link to={to('apartments')} className="hover:text-gray-300 transition">Apartments</Link>
              )}
            </li>
            <li>
              {isHome ? (
                <a href="#amenities" className="hover:text-gray-300 transition">Amenities</a>
              ) : (
                <Link to={to('amenities')} className="hover:text-gray-300 transition">Amenities</Link>
              )}
            </li>
            <li>
              {isHome ? (
                <a href="#contact" className="hover:text-gray-300 transition">Contact</a>
              ) : (
                <Link to={to('contact')} className="hover:text-gray-300 transition">Contact</Link>
              )}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl mb-4">Contact</h3>
          <ul className="space-y-2 text-white">
            <li>123 Apartment Street, City Name, Country</li>
            <li>
              <a href="mailto:info@appartment.com" className="hover:text-gray-300 transition">
                info@appartment.com
              </a>
            </li>
            <li>
              <a href="tel:+385012345678" className="hover:text-gray-300 transition">
                +385 01 234 5678
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

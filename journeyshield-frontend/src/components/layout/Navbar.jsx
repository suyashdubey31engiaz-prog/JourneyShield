import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    setUser(JSON.parse(sessionStorage.getItem('user')));
    setMobileOpen(false); // close mobile menu on route change
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
      isActive ? 'bg-gray-800 text-yellow-400' : 'hover:bg-gray-800/50 text-gray-200'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
      isActive ? 'bg-gray-800 text-yellow-400' : 'hover:bg-gray-800 text-gray-200'
    }`;

  return (
    <header className="bg-gray-900/95 backdrop-blur-md text-white sticky top-0 z-50 border-b border-gray-800">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Journey Shield Logo" className="w-9 h-9 object-contain" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 hidden sm:block">
            Journey Shield
          </h1>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-2">
          <NavLink to="/group-tours" className={linkClass}>Group Tours</NavLink>

          {user ? (
            <>
              <NavLink
                to={user.role === 'Guide' ? '/guide-dashboard' : '/dashboard'}
                className={linkClass}
              >
                Dashboard
              </NavLink>
              <NavLink to="/bookings" className={linkClass}>My Bookings</NavLink>
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <span className="text-xs text-gray-400 font-medium px-2 hidden lg:block">
                👤 {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink
                to="/register"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 px-4 py-3 space-y-1 bg-gray-900 animate-slideDown">
          <NavLink to="/group-tours" className={mobileLinkClass}>🗺️ Group Tours</NavLink>

          {user ? (
            <>
              <NavLink
                to={user.role === 'Guide' ? '/guide-dashboard' : '/dashboard'}
                className={mobileLinkClass}
              >
                📊 Dashboard
              </NavLink>
              <NavLink to="/bookings" className={mobileLinkClass}>📅 My Bookings</NavLink>
              <div className="border-t border-gray-800 pt-2 mt-2">
                <p className="text-xs text-gray-500 px-4 pb-2">Signed in as {user.name}</p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-semibold rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={mobileLinkClass}>Login</NavLink>
              <NavLink
                to="/register"
                className="block px-4 py-3 text-sm font-semibold rounded-lg bg-yellow-500 text-black text-center hover:bg-yellow-400 transition-colors"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
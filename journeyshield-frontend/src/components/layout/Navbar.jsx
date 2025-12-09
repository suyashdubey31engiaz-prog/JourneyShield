import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  // Check for user whenever the route changes
  React.useEffect(() => {
    setUser(JSON.parse(sessionStorage.getItem('user')));
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="bg-gray-900/90 backdrop-blur-md text-white sticky top-0 z-50 border-b border-gray-800">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
          Journey Shield
        </h1>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Common Links for all logged-in users */}
              <NavLink 
                to={user.role === 'Guide' ? "/guide-dashboard" : "/dashboard"} 
                className={({ isActive }) => `px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-gray-800 text-yellow-400' : 'hover:bg-gray-800/50'}`}
              >
                Dashboard
              </NavLink>

              <NavLink 
                to="/bookings" 
                className={({ isActive }) => `px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-gray-800 text-yellow-400' : 'hover:bg-gray-800/50'}`}
              >
                My Bookings
              </NavLink>

              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-gray-800/50 transition-colors">
                Login
              </NavLink>
              <NavLink to="/register" className="px-4 py-2 text-sm font-semibold rounded-md bg-yellow-500 text-black hover:bg-yellow-400 transition-colors">
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
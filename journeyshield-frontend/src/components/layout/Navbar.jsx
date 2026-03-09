import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.svg';
import chatService from '../../services/chatService';

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [user, setUser]       = useState(null);
  const [unread, setUnread]   = useState(0);

  React.useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem('user'));
    setUser(u);
    if (u?.token) {
      chatService.getUnreadCount()
        .then(({ data }) => setUnread(data.count || 0))
        .catch(() => {});
    }
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const initials = (name = '') =>
    name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const navLink = ({ isActive }) =>
    `px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
      isActive ? 'bg-gray-800 text-yellow-400' : 'hover:bg-gray-800/50'
    }`;

  return (
    <header className="bg-gray-900/90 backdrop-blur-md text-white sticky top-0 z-50 border-b border-gray-800">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">

        <NavLink to="/" className="flex items-center gap-3">
          <img src={logo} alt="Journey Shield Logo" className="w-9 h-9 object-contain" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
            Journey Shield
          </h1>
        </NavLink>

        <div className="flex items-center gap-2">
          <NavLink to="/group-tours" className={navLink}>Group Tours</NavLink>

          {user ? (
            <>
              <NavLink to={user.role === 'Guide' ? '/guide-dashboard' : '/dashboard'} className={navLink}>
                Dashboard
              </NavLink>

              <NavLink to="/bookings" className={navLink}>My Bookings</NavLink>

              {/* Chat with unread badge */}
              <NavLink to="/chat"
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-gray-800 text-yellow-400' : 'hover:bg-gray-800/50'}`
                }>
                💬 Chat
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-[10px] font-extrabold rounded-full flex items-center justify-center shadow">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </NavLink>

              {/* Avatar / profile */}
              <NavLink to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all ${isActive ? 'bg-gray-800 ring-2 ring-yellow-500/50' : 'hover:bg-gray-800/60'}`
                }>
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600 shrink-0">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-amber-800 flex items-center justify-center text-xs font-extrabold text-white">
                        {initials(user.name)}
                      </div>
                  }
                </div>
                <span className="text-sm font-semibold hidden sm:block max-w-[80px] truncate text-gray-200">
                  {user.name?.split(' ')[0]}
                </span>
              </NavLink>

              <button onClick={handleLogout}
                className="px-3 py-2 text-sm font-semibold rounded-md bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"    className={navLink}>Login</NavLink>
              <NavLink to="/register"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-yellow-500 text-black hover:bg-yellow-400 transition-colors">
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
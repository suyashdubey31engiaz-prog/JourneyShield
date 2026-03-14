import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/common/Toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const [role,         setRole]         = useState('Traveler');
  const [identifier,   setIdentifier]   = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [wakingUp,     setWakingUp]     = useState(false);
  const navigate = useNavigate();

  // Ping server on mount to wake Render from sleep
  useEffect(() => {
    axios.get(`${API_BASE}/`, { timeout: 60000 }).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    setWakingUp(false);
    const wakeTimer = setTimeout(() => setWakingUp(true), 4000);
    try {
      const { data } = await axios.post(`${API_BASE}/api/users/login`, {
        identifier, password, selectedRole: role,
      });
      clearTimeout(wakeTimer);
      setWakingUp(false);
      sessionStorage.setItem('user', JSON.stringify(data));
      setToast({ message: `Welcome back, ${data.name}! 🎉`, type: 'success' });
      setTimeout(() => {
        if (data.role === 'Guide') navigate('/guide-dashboard');
        else navigate('/dashboard');
      }, 1500);
    } catch (err) {
      clearTimeout(wakeTimer);
      setWakingUp(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-gray-800/80 backdrop-blur p-8 rounded-2xl border border-gray-700 shadow-2xl">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white">Welcome back</h2>
            <p className="text-gray-400 text-sm mt-2">Sign in to continue your journey</p>
          </div>

          <div className="flex bg-gray-900 rounded-xl p-1 mb-7">
            {['Traveler', 'Guide'].map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  role === r ? 'bg-yellow-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}>
                {r === 'Traveler' ? '🧳 ' : '🗺️ '}{r}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-500/40 text-red-400 p-3 rounded-lg mb-5 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email or Username</label>
              <input type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 outline-none transition-all pr-12" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" tabIndex={-1}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
              ) : `Login as ${role}`}
            </button>
          </form>

          <p className="text-gray-400 text-center text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
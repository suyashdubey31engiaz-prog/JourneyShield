import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('Traveler');
  const [identifier, setIdentifier] = useState(''); // Handles both username and email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', { 
        identifier, 
        password 
      });
      
      // Save user to session storage
      sessionStorage.setItem('user', JSON.stringify(data));
      
      // Redirect to correct dashboard based on DB role
      if (data.role === 'Guide') {
        navigate('/guide-dashboard');
      } else {
        navigate('/dashboard'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-yellow-500 text-center mb-6">Login</h2>
        
        {/* Role Toggle */}
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            type="button"
            onClick={() => setRole('Traveler')}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${role === 'Traveler' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          >
            User
          </button>
          <button 
            type="button"
            onClick={() => setRole('Guide')}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${role === 'Guide' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          >
            Guide
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-400 p-3 rounded text-center mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email or Username</label>
            <input 
              type="text" 
              required 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" 
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-md transition-colors mt-2">
            {loading ? 'Logging in...' : `Login`}
          </button>
        </form>
        
        <p className="text-gray-400 text-center text-sm mt-4">
          Don't have an account? <Link to="/registration" className="text-yellow-500 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
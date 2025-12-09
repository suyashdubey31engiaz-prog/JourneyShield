
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({ loginIdentifier: '', password: '' });
  const [role, setRole] = useState('Traveler');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(formData);
      
      if (response.data.role === role) {
        sessionStorage.setItem('user', JSON.stringify(response.data));
        
        // This is the smart redirect logic
        if (role === 'Guide') {
          navigate('/guide-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(`You are not registered as a ${role}. Please select the correct role.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-2 text-yellow-400">Login</h2>
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-900/50 p-1 rounded-lg">
            <button onClick={() => setRole('Traveler')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${role === 'Traveler' ? 'bg-gray-700' : 'text-gray-400 hover:bg-gray-700/50'}`}>User</button>
            <button onClick={() => setRole('Guide')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${role === 'Guide' ? 'bg-gray-700' : 'text-gray-400 hover:bg-gray-700/50'}`}>Guide</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center bg-red-500/30 text-red-400 p-2 rounded-md text-sm">{error}</p>}
          <div>
            <label className="text-sm text-gray-400">Email or Username</label>
            <input name="loginIdentifier" type="text" required value={formData.loginIdentifier} onChange={handleChange} className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Password</label>
            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gray-700 text-white font-semibold py-2 rounded-md hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-50">
            {loading ? 'Logging in...' : `Login as ${role}`}
          </button>
        </form>
         <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-yellow-400 hover:text-yellow-300">
              Sign Up
            </Link>
          </p>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Registration = () => {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
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
      await authService.register({ ...formData, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-2 text-yellow-400">Register</h2>
        <div className="flex justify-center mb-4">
          <div className="flex bg-gray-900/50 p-1 rounded-lg">
            <button onClick={() => setRole('Traveler')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${role === 'Traveler' ? 'bg-gray-700' : 'text-gray-400'}`}>User</button>
            <button onClick={() => setRole('Guide')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${role === 'Guide' ? 'bg-gray-700' : 'text-gray-400'}`}>Guide</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-center bg-red-500/30 text-red-400 p-2 rounded-md text-sm">{error}</p>}
          <div>
            <label className="text-xs text-gray-400">Full Name</label>
            <input name="name" type="text" required onChange={handleChange} className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Username</label>
            <input name="username" type="text" required onChange={handleChange} className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input name="email" type="email" required onChange={handleChange} className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Password</label>
            <input name="password" type="password" required onChange={handleChange} className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full pt-2 pb-2 bg-gray-700 text-white font-semibold py-2 rounded-md hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-50">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
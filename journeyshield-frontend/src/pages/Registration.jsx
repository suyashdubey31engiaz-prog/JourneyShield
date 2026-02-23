import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Registration = () => {
  const [role, setRole] = useState('Traveler'); 
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/users/register', { ...formData, role });
      sessionStorage.setItem('user', JSON.stringify(data));
      
      // Redirect logic
      if (data.role === 'Guide' || data.role === 'Both') {
        navigate('/guide-dashboard'); // Drop dual users here initially
      } else {
        navigate('/dashboard'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-yellow-500 text-center mb-6">Register</h2>
        
        {/* NEW: 3 Role Toggle Buttons */}
        <div className="flex justify-center space-x-2 mb-6">
          <button type="button" onClick={() => setRole('Traveler')} className={`px-4 py-2 rounded-md font-bold transition-colors text-sm ${role === 'Traveler' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Traveler</button>
          <button type="button" onClick={() => setRole('Guide')} className={`px-4 py-2 rounded-md font-bold transition-colors text-sm ${role === 'Guide' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Guide</button>
          <button type="button" onClick={() => setRole('Both')} className={`px-4 py-2 rounded-md font-bold transition-colors text-sm ${role === 'Both' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Both</button>
        </div>

        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded text-center mb-4 text-sm font-semibold">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div><label className="block text-sm text-gray-400 mb-1">Full Name</label><input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" /></div>
          <div><label className="block text-sm text-gray-400 mb-1">Username</label><input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" /></div>
          <div><label className="block text-sm text-gray-400 mb-1">Email</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" /></div>
          <div><label className="block text-sm text-gray-400 mb-1">Password</label><input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" /></div>
          <button type="submit" disabled={loading} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-md transition-colors mt-2">{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p className="text-gray-400 text-center text-sm mt-4">Already have an account? <Link to="/login" className="text-yellow-500 hover:underline">Login</Link></p>
      </div>
    </div>
  );
};

export default Registration;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Registration = () => {
  // UI State
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data State
  const [role, setRole] = useState('Traveler'); 
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- STEP 1: SEND OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/users/send-otp', { 
        email: formData.email, 
        username: formData.username 
      });
      setStep(2); // Move to OTP screen!
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Check your email address.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY AND REGISTER ---
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/users/verify-register', { 
        ...formData, 
        role,
        otp 
      });
      
      sessionStorage.setItem('user', JSON.stringify(data));
      
      if (data.role === 'Guide' || data.role === 'Both') navigate('/guide-dashboard');
      else navigate('/dashboard'); 
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-yellow-500 text-center mb-6">
          {step === 1 ? 'Register' : 'Enter OTP'}
        </h2>
        
        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded text-center mb-4 text-sm font-semibold">{error}</div>}

        {/* --- STEP 1 UI: THE MAIN FORM --- */}
        {step === 1 && (
          <>
            <div className="flex justify-center space-x-2 mb-6">
              <button type="button" onClick={() => setRole('Traveler')} className={`px-4 py-2 rounded-md font-bold transition-colors text-sm ${role === 'Traveler' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Traveler</button>
              <button type="button" onClick={() => setRole('Guide')} className={`px-4 py-2 rounded-md font-bold transition-colors text-sm ${role === 'Guide' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Guide</button>
              <button type="button" onClick={() => setRole('Both')} className={`px-4 py-2 rounded-md font-bold transition-colors text-sm ${role === 'Both' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Both</button>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1">Full Name</label><input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Username</label><input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Genuine Email</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Password</label><input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-yellow-500" /></div>
              
              <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-md transition-colors mt-2">
                {loading ? 'Sending Code...' : 'Send Verification OTP'}
              </button>
            </form>
            <p className="text-gray-400 text-center text-sm mt-4">Already have an account? <Link to="/login" className="text-yellow-500 hover:underline">Login</Link></p>
          </>
        )}

        {/* --- STEP 2 UI: THE OTP INPUT --- */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4 animate-fadeIn">
            <p className="text-gray-400 text-sm text-center mb-4">
              We sent a 6-digit code to <span className="text-white font-bold">{formData.email}</span>
            </p>
            <div>
              <input type="text" maxLength="6" placeholder="Enter 6-digit OTP" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-4 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-yellow-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-md transition-colors mt-2">
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-md transition-colors mt-2 text-sm">
              &larr; Go Back
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Registration;
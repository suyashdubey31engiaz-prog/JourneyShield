import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Registration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('Traveler');
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/users/send-otp`, {
        email: formData.email,
        username: formData.username,
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/users/verify-register`, {
        ...formData,
        role,
        otp,
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

  const roles = [
    { value: 'Traveler', icon: '🧳', label: 'Traveler' },
    { value: 'Guide',    icon: '🗺️', label: 'Guide' },
    { value: 'Both',     icon: '⭐', label: 'Both' },
  ];

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="w-full max-w-md animate-fadeIn">

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 gap-3">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${
                step >= s
                  ? 'bg-yellow-500 border-yellow-500 text-black'
                  : 'border-gray-600 text-gray-500'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && (
                <div className={`h-px w-12 transition-all ${step > s ? 'bg-yellow-500' : 'bg-gray-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-gray-800/80 backdrop-blur p-8 rounded-2xl border border-gray-700 shadow-2xl">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {step === 1
                ? 'Join Journey Shield and travel safely'
                : `We sent a 6-digit code to ${formData.email}`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-500/40 text-red-400 p-3 rounded-lg mb-5 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              {/* Role Selection */}
              <div className="flex bg-gray-900 rounded-xl p-1 mb-6">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      role === r.value
                        ? 'bg-yellow-500 text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="johndoe_travels"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        tabIndex={-1}
                      >
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending Code...
                    </>
                  ) : (
                    '📧 Send Verification OTP'
                  )}
                </button>
              </form>

              <p className="text-gray-400 text-center text-sm mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5 animate-fadeIn">
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 text-center">
                <p className="text-4xl mb-3">📬</p>
                <p className="text-sm text-gray-300">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-yellow-400 font-bold">{formData.email}</span>
                </p>
              </div>

              <input
                type="text"
                maxLength="6"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0  0  0  0  0  0"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-5 text-center text-3xl font-bold tracking-[0.6em] text-white focus:border-yellow-500 outline-none transition-all"
              />

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  '✅ Verify & Create Account'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                ← Go Back & Edit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import guidesService from '../services/guidesService';

const EditProfile = () => {
  const [formData, setFormData] = useState({ location: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current data to pre-fill the form
    guidesService.getMyProfile()
      .then(res => {
        setFormData({
          location: res.data.location,
          bio: res.data.bio
        });
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await guidesService.updateProfile(formData);
      alert('Profile updated successfully!');
      navigate('/guide-dashboard');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center text-white mt-20">Loading profile...</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Edit Guide Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Location / City</label>
            <input 
              type="text" 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500"
              placeholder="e.g. Mumbai, India"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Bio / Experience</label>
            <textarea 
              rows="5"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500"
              placeholder="Tell travelers about your expertise..."
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/guide-dashboard')}
              className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
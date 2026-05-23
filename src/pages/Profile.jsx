import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { getStreak, getAdvancedAnalytics } from '../api/recommendationsAPI';
import { User, Mail, Target, Flame, Star, Award, Settings, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, login } = useContext(AuthContext); // Assuming login updates user context
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile: {
      target_exam: '',
    }
  });
  
  const [streak, setStreak] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchAIStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('users/profile/');
      setProfileData({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || '',
        profile: {
          target_exam: res.data.profile?.target_exam || '',
        }
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchAIStats = async () => {
    try {
      const [streakRes, analyticsRes] = await Promise.all([
        getStreak(), getAdvancedAnalytics()
      ]);
      setStreak(streakRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Error fetching AI stats:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'target_exam') {
      setProfileData(prev => ({ ...prev, profile: { ...prev.profile, target_exam: value } }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await api.patch('users/profile/', profileData);
      // Update local storage and context if necessary
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Re-trigger auth context if login can act as a setter, or just let it be.
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-navy-blue to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-4xl font-black text-white">
              {(profileData.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900">{profileData.first_name || user?.username} {profileData.last_name}</h1>
            <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
              <Mail className="w-4 h-4" /> {profileData.email || 'No email provided'}
            </p>
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              isEditing ? 'bg-india-saffron text-white hover:bg-orange-500 shadow-md shadow-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isEditing ? (
              <>{isSaving ? 'Saving...' : <><CheckCircle className="w-5 h-5" /> Save Changes</>}</>
            ) : (
              <><Settings className="w-5 h-5" /> Edit Profile</>
            )}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-navy-blue" /> Personal Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" name="first_name"
                    disabled={!isEditing}
                    value={profileData.first_name} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-blue outline-none disabled:opacity-70 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" name="last_name"
                    disabled={!isEditing}
                    value={profileData.last_name} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-blue outline-none disabled:opacity-70 transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" name="email"
                    disabled={!isEditing}
                    value={profileData.email} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-blue outline-none disabled:opacity-70 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-india-saffron" /> AI Recommendation Settings
              </h2>
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6">
                <p className="text-sm text-orange-800 font-medium">
                  The AI uses your Target Exam to filter community resources and generate personalized study roadmaps.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Exam (e.g., UPSC, JEE, TNPSC)</label>
                <input 
                  type="text" name="target_exam"
                  disabled={!isEditing}
                  placeholder="Enter your target exam"
                  value={profileData.profile.target_exam} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-india-saffron outline-none disabled:opacity-70 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Gamification Stats Sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-gray-900 px-2">Learning Stats</h2>
            
            {/* Level Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <Award className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-indigo-200" />
                  <span className="text-sm font-bold uppercase tracking-wider text-indigo-100">Current Level</span>
                </div>
                <div className="text-5xl font-black mb-2">Lv.{streak?.level || 1}</div>
                <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-xs font-medium text-indigo-100">{streak?.total_xp || 0} Total XP Earned</p>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-200 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <Flame className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-orange-200" />
                  <span className="text-sm font-bold uppercase tracking-wider text-orange-100">Learning Streak</span>
                </div>
                <div className="text-5xl font-black mb-1">{streak?.current_streak || 0}</div>
                <p className="text-sm font-medium text-orange-100 mb-4">days in a row</p>
                <div className="bg-black/10 rounded-xl p-3 flex justify-between items-center backdrop-blur-sm">
                  <span className="text-sm font-bold">Longest Streak</span>
                  <span className="font-black">{streak?.longest_streak || 0}</span>
                </div>
              </div>
            </div>

            {/* Mastery Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-900">Strong Topics</span>
                </div>
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg">Top 3</span>
              </div>
              <div className="space-y-3">
                {analytics?.strong_topics && analytics.strong_topics.length > 0 ? (
                  analytics.strong_topics.slice(0, 3).map((topic, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600 truncate pr-2">{topic.topic}</span>
                      <span className="text-sm font-black text-green-500">{topic.accuracy}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Take more quizzes to see your strong topics.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

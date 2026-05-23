import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, MapPin, Target, Bookmark, ExternalLink, Trash2, BarChart, TrendingUp, AlertTriangle, CheckCircle, Activity, BookOpen, BrainCircuit } from 'lucide-react';
import api from '../api/axiosConfig';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [historyRes, analyticsRes] = await Promise.all([
            api.get('practice-quiz/history/'),
            api.get('practice-quiz/analytics/').catch(() => ({ data: null }))
          ]);
          setHistory(historyRes.data);
          setAnalytics(analyticsRes.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleDeleteHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz history?")) return;
    try {
      await api.delete(`practice-quiz/history/${id}/`);
      setHistory(prev => prev.filter(item => item.id !== id));
      
      // Refresh analytics
      const analyticsRes = await api.get('practice-quiz/analytics/').catch(() => ({ data: null }));
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to delete quiz history.");
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen pt-24 text-center bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  const { profile } = user;
  const bookmarks = profile?.bookmarks_detail || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto py-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Track your performance and AI-driven insights.</p>
          </div>
          <Link to="/practice-quiz" className="hidden sm:flex items-center px-6 py-3 bg-navy-blue text-white rounded-xl font-bold shadow-md hover:-translate-y-1 transition-all">
            <BrainCircuit className="w-5 h-5 mr-2" /> Start AI Assessment
          </Link>
        </div>
        
        {/* Top Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 p-10 bg-blue-50 rounded-bl-full opacity-50"></div>
              <div className="bg-blue-100 p-4 rounded-2xl mr-4 text-navy-blue">
                <Target size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Quizzes</p>
                <h3 className="text-3xl font-black text-gray-900">{analytics.total_quizzes}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 p-10 bg-green-50 rounded-bl-full opacity-50"></div>
              <div className="bg-green-100 p-4 rounded-2xl mr-4 text-green-600">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Accuracy</p>
                <h3 className="text-3xl font-black text-gray-900">{analytics.overall_accuracy}%</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 p-10 bg-orange-50 rounded-bl-full opacity-50"></div>
              <div className="bg-orange-100 p-4 rounded-2xl mr-4 text-orange-600">
                <AlertTriangle size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Weak Topics</p>
                <h3 className="text-3xl font-black text-gray-900">{analytics.weak_topics?.length || 0}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 p-10 bg-purple-50 rounded-bl-full opacity-50"></div>
              <div className="bg-purple-100 p-4 rounded-2xl mr-4 text-purple-600">
                <CheckCircle size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Strong Topics</p>
                <h3 className="text-3xl font-black text-gray-900">{analytics.strong_topics?.length || 0}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Weak Areas & Profile */}
          <div className="md:col-span-1 space-y-8">
            
            {/* Weak Areas Panel */}
            {analytics && analytics.weak_topics?.length > 0 && (
              <div className="bg-gradient-to-b from-red-50 to-white rounded-3xl p-6 shadow-sm border border-red-100">
                <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" /> Needs Improvement
                </h3>
                <p className="text-sm text-gray-600 mb-4 font-medium">Focus your revision on these topics:</p>
                <div className="space-y-3">
                  {analytics.weak_topics.map((topic, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-red-100 flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-sm truncate pr-2">{topic}</span>
                      <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-1 rounded-md">
                        {Math.round(analytics.topic_performance[topic])}%
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={() => window.location.href='/practice-quiz'} className="w-full mt-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md">
                  Generate Improvement Quiz
                </button>
              </div>
            )}

            {/* Profile Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 w-full h-20 bg-navy-blue left-0 right-0 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center mt-8">
                <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg mb-4 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-tr from-blue-100 to-blue-50 text-navy-blue rounded-full flex items-center justify-center text-3xl font-black uppercase">
                     {user.first_name?.[0] || user.username?.[0]}
                  </div>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">{user.first_name} {user.last_name}</h2>
                <p className="text-gray-500 font-medium mb-6">@{user.username}</p>
                
                <div className="w-full space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-navy-blue mr-3" />
                    <span className="font-bold">State:</span> <span className="ml-auto font-medium">{profile?.state || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <BookOpen className="w-4 h-4 text-navy-blue mr-3" />
                    <span className="font-bold">Target Exam:</span> <span className="ml-auto font-medium">{profile?.target_exam || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Topic Performance Bar Chart (CSS-based) */}
            {analytics && Object.keys(analytics.topic_performance).length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart className="w-5 h-5 text-navy-blue mr-2" /> Topic Mastery
                </h3>
                
                <div className="space-y-5">
                  {Object.entries(analytics.topic_performance).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([topic, score]) => (
                    <div key={topic}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-gray-700">{topic}</span>
                        <span className="text-sm font-bold text-gray-900">{Math.round(score)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-orange-400' : 'bg-red-500'}`} 
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment History */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Assessments</h3>
              </div>

              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.slice(0, 5).map((item) => {
                    const accuracy = ((item.score / item.total_questions) * 100).toFixed(0);
                    return (
                      <div key={item.id} className="group border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-md transition-all bg-white relative">
                        <button 
                          onClick={() => handleDeleteHistory(item.id)}
                          className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                          title="Delete History"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center pr-12">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 font-black text-lg ${accuracy >= 75 ? 'bg-green-100 text-green-600' : accuracy >= 50 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                            {accuracy}%
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-gray-900 mb-1 truncate text-lg">{item.title}</h4>
                            <div className="flex items-center text-sm font-medium text-gray-500 gap-4">
                              <span>Score: {item.score}/{item.total_questions}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <BrainCircuit className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-4">No assessments taken yet.</p>
                  <Link to="/practice-quiz" className="inline-block px-6 py-2 bg-navy-blue text-white rounded-lg font-bold">
                    Start Your First Assessment
                  </Link>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

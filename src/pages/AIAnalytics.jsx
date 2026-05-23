import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  BarChart3, TrendingUp, AlertTriangle, CheckCircle, Brain,
  Target, Flame, Award, Activity, Zap, ArrowLeft, BookOpen,
  Clock, RefreshCw, Star, Calendar, ChevronRight
} from 'lucide-react';
import { getAdvancedAnalytics, getRevisionQueue, getStreak } from '../api/recommendationsAPI';
import api from '../api/axiosConfig';

const AIAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [revision, setRevision] = useState(null);
  const [streak, setStreak] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, rRes, sRes, hRes] = await Promise.allSettled([
          getAdvancedAnalytics(), getRevisionQueue(), getStreak(),
          api.get('practice-quiz/history/')
        ]);
        if (aRes.status === 'fulfilled') setAnalytics(aRes.value.data);
        if (rRes.status === 'fulfilled') setRevision(rRes.value.data);
        if (sRes.status === 'fulfilled') setStreak(sRes.value.data);
        if (hRes.status === 'fulfilled') setHistory(hRes.value.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-india-saffron animate-spin" />
          </div>
          <p className="text-gray-500 font-semibold">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  const progression = analytics?.progression || {};
  const topicChart = analytics?.topic_chart || [];
  const weakTopics = analytics?.weak_topics || [];
  const strongTopics = analytics?.strong_topics || [];
  const improvingTopics = analytics?.improving_topics || [];
  const suggestions = analytics?.suggestions || [];
  const heatmap = analytics?.activity_heatmap || {};
  const revisionStats = analytics?.revision_stats || {};
  const dailyTaskStats = analytics?.daily_tasks || {};

  // Generate last 30 days for heatmap
  const last30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    last30.push({ date: key, count: heatmap[key] || 0, day: d.toLocaleDateString('en', { weekday: 'short' }) });
  }
  const maxActivity = Math.max(...last30.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400 rounded-full blur-3xl -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center gap-4">
            <Link to="/ai-feed" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-emerald-300" /> AI Analytics
              </h1>
              <p className="text-emerald-200 font-medium mt-1">Deep insights into your learning journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Avg Accuracy', value: `${progression.average_accuracy || 0}%`, icon: <Target className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-600', ring: 'ring-blue-100' },
            { label: 'Topics Tracked', value: progression.total_topics || 0, icon: <BookOpen className="w-5 h-5" />, color: 'bg-emerald-500/10 text-emerald-600', ring: 'ring-emerald-100' },
            { label: 'Expert Topics', value: progression.topics_at_expert || 0, icon: <Award className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-600', ring: 'ring-purple-100' },
            { label: 'Improving', value: progression.topics_improving || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-amber-500/10 text-amber-600', ring: 'ring-amber-100' },
          ].map((stat, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm ring-1 ${stat.ring}`}>
              <div className={`p-2 rounded-xl ${stat.color} inline-block mb-3`}>{stat.icon}</div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Streak + Daily Tasks Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {streak && (
            <div className="bg-gradient-to-br from-orange-500 via-india-saffron to-amber-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10"><Flame className="w-28 h-28" /></div>
              <div className="relative z-10 flex items-center gap-4">
                <div>
                  <div className="text-4xl font-black">{streak.current_streak}</div>
                  <div className="text-sm opacity-90 font-semibold">Day Streak 🔥</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-lg font-bold">{streak.total_xp} XP</div>
                  <div className="text-sm opacity-80">Level {streak.level}</div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-gray-900 text-sm">Today's Tasks</span>
            </div>
            <div className="text-3xl font-black text-gray-900">{dailyTaskStats.completed || 0}/{dailyTaskStats.total || 0}</div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${dailyTaskStats.percentage || 0}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-cyan-500" />
              <span className="font-bold text-gray-900 text-sm">Revision Queue</span>
            </div>
            <div className="text-3xl font-black text-gray-900">{revisionStats.due_today || 0}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">{revisionStats.upcoming_week || 0} due this week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topic Mastery Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-navy-blue" /> Topic Mastery
            </h3>
            {topicChart.length > 0 ? (
              <div className="space-y-4">
                {topicChart.map((topic, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        {topic.topic}
                        {topic.is_weak && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">WEAK</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-medium">{topic.attempts} attempts</span>
                        <span className={`text-sm font-black ${topic.accuracy >= 75 ? 'text-green-600' : topic.accuracy >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {topic.accuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full transition-all duration-1000 ${topic.accuracy >= 75 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : topic.accuracy >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}
                        style={{ width: `${Math.max(topic.accuracy, 3)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Take some quizzes to see your topic mastery!</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Weak Topics */}
            {weakTopics.length > 0 && (
              <div className="bg-gradient-to-b from-red-50 to-white rounded-2xl border border-red-100 p-5">
                <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4" /> Needs Improvement
                </h3>
                <div className="space-y-2">
                  {weakTopics.map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-red-50">
                      <span className="text-sm font-semibold text-gray-800 truncate pr-2">{t.topic}</span>
                      <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-0.5 rounded">{t.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strong Topics */}
            {strongTopics.length > 0 && (
              <div className="bg-gradient-to-b from-green-50 to-white rounded-2xl border border-green-100 p-5">
                <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" /> Strong Areas
                </h3>
                <div className="space-y-2">
                  {strongTopics.map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-green-50">
                      <span className="text-sm font-semibold text-gray-800 truncate pr-2">{t.topic}</span>
                      <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-0.5 rounded">{t.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-amber-500" /> AI Suggestions
                </h3>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <div key={i} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs font-semibold text-amber-800">{s.suggestion}</p>
                      <span className={`text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded ${s.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {s.priority?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" /> Activity Heatmap — Last 30 Days
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {last30.map((d, i) => (
              <div key={i} className="group relative">
                <div className={`w-8 h-8 rounded-lg transition-colors ${d.count === 0 ? 'bg-gray-100' : d.count / maxActivity < 0.33 ? 'bg-green-200' : d.count / maxActivity < 0.66 ? 'bg-green-400' : 'bg-green-600'}`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {d.date}: {d.count} activities
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Less</span>
            <div className="w-4 h-4 rounded bg-gray-100" />
            <div className="w-4 h-4 rounded bg-green-200" />
            <div className="w-4 h-4 rounded bg-green-400" />
            <div className="w-4 h-4 rounded bg-green-600" />
            <span>More</span>
          </div>
        </div>

        {/* Recent Quiz History */}
        {history.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Assessments</h3>
            <div className="space-y-3">
              {history.slice(0, 5).map(item => {
                const acc = Math.round((item.score / item.total_questions) * 100);
                return (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${acc >= 75 ? 'bg-green-100 text-green-600' : acc >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                      {acc}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">Score: {item.score}/{item.total_questions} • {new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalytics;

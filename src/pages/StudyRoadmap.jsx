import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Calendar, ChevronDown, ChevronRight, CheckCircle, Clock,
  BookOpen, Target, Brain, FileText, Flame, Award, Play,
  Plus, ArrowLeft, BarChart3, RefreshCw, Sparkles, Zap
} from 'lucide-react';
import {
  getStudyPlans, getStudyPlan, createStudyPlan, completeStudyDay
} from '../api/recommendationsAPI';

const TASK_ICONS = {
  reading: <BookOpen className="w-4 h-4" />,
  quiz: <Target className="w-4 h-4" />,
  mock_test: <BarChart3 className="w-4 h-4" />,
  revision: <RefreshCw className="w-4 h-4" />,
  flashcard: <Brain className="w-4 h-4" />,
  note_taking: <FileText className="w-4 h-4" />,
};

const StudyRoadmap = () => {
  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [form, setForm] = useState({
    target_exam: '', exam_date: '', study_hours_per_day: 2, weak_subjects: '',
    patterns: '', topics_to_cover: '', marks_allotted: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await getStudyPlans();
      setPlans(res.data.plans || []);
      // Auto-load active plan
      const active = (res.data.plans || []).find(p => p.is_active);
      if (active) {
        const detail = await getStudyPlan(active.id);
        setActivePlan(detail.data);
        // Auto-expand today or next incomplete day
        const today = new Date().toISOString().split('T')[0];
        const todayDay = detail.data.days?.find(d => d.date === today);
        const nextDay = detail.data.days?.find(d => !d.is_completed);
        setExpandedDay(todayDay?.day_number || nextDay?.day_number || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      let parsedMarks = {};
      if (form.marks_allotted) {
        form.marks_allotted.split(',').forEach(item => {
          const parts = item.split(':');
          if (parts.length === 2) {
            parsedMarks[parts[0].trim()] = parts[1].trim();
          }
        });
      }

      const data = {
        target_exam: form.target_exam,
        exam_date: form.exam_date,
        study_hours_per_day: parseFloat(form.study_hours_per_day),
        weak_subjects: form.weak_subjects ? form.weak_subjects.split(',').map(s => s.trim()) : [],
        patterns: form.patterns,
        topics_to_cover: form.topics_to_cover ? form.topics_to_cover.split(',').map(s => s.trim()) : [],
        marks_allotted: parsedMarks
      };
      const res = await createStudyPlan(data);
      setActivePlan(res.data);
      setShowCreate(false);
      setExpandedDay(1);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Failed to generate study plan.');
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteDay = async (dayNumber) => {
    if (!activePlan) return;
    try {
      await completeStudyDay(activePlan.id, dayNumber);
      const res = await getStudyPlan(activePlan.id);
      setActivePlan(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadPlan = async (planId) => {
    setLoading(true);
    try {
      const res = await getStudyPlan(planId);
      setActivePlan(res.data);
      const nextDay = res.data.days?.find(d => !d.is_completed);
      setExpandedDay(nextDay?.day_number || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-india-saffron animate-spin" />
          </div>
          <p className="text-gray-500 font-semibold">Loading study plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-400 rounded-full blur-3xl -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/ai-feed" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                  <Calendar className="w-7 h-7 text-purple-300" /> AI Study Roadmap
                </h1>
                <p className="text-purple-200 font-medium mt-1">Personalized day-by-day study plan</p>
              </div>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-india-saffron hover:bg-orange-500 text-white rounded-xl px-5 py-2.5 font-bold text-sm transition-colors shadow-lg">
              <Plus className="w-4 h-4" /> New Plan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Plan Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Generate AI Study Plan
                </h2>
                <p className="text-indigo-200 text-sm mt-1">Our AI will create a personalized roadmap</p>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Target Exam</label>
                  <input type="text" required placeholder="e.g., UPSC, SSC, TNPSC, Banking"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.target_exam} onChange={e => setForm(p => ({ ...p, target_exam: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Exam Date</label>
                  <input type="date" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.exam_date} onChange={e => setForm(p => ({ ...p, exam_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Study Hours Per Day</label>
                  <input type="number" min="0.5" max="12" step="0.5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.study_hours_per_day} onChange={e => setForm(p => ({ ...p, study_hours_per_day: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Weak Subjects (comma-separated)</label>
                  <input type="text" placeholder="e.g., History, Aptitude, Polity"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.weak_subjects} onChange={e => setForm(p => ({ ...p, weak_subjects: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Exam Pattern / Type</label>
                  <input type="text" placeholder="e.g., Objective, Descriptive, Interview"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.patterns} onChange={e => setForm(p => ({ ...p, patterns: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Topics to Cover (comma-separated)</label>
                  <input type="text" placeholder="e.g., Ancient History, Profit & Loss"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.topics_to_cover} onChange={e => setForm(p => ({ ...p, topics_to_cover: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Marks Allotted (comma-separated pairs)</label>
                  <input type="text" placeholder="e.g., Math:50, Science:30, English:20"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.marks_allotted} onChange={e => setForm(p => ({ ...p, marks_allotted: e.target.value }))} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={creating}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                    {creating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Plan</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plan Selector */}
        {plans.length > 1 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {plans.map(p => (
              <button key={p.id} onClick={() => handleLoadPlan(p.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activePlan?.id === p.id ? 'bg-navy-blue text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
                {p.target_exam} • {Math.round(p.progress_percentage)}%
              </button>
            ))}
          </div>
        )}

        {activePlan ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">{activePlan.title}</h3>
                {/* Circular Progress */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                    <circle cx="60" cy="60" r="52" stroke="url(#progressGrad)" strokeWidth="10" fill="none"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - (activePlan.progress_percentage || 0) / 100)}`}
                      strokeLinecap="round" className="transition-all duration-1000" />
                    <defs>
                      <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF9933" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900">{Math.round(activePlan.progress_percentage)}%</span>
                    <span className="text-xs text-gray-500 font-semibold">Complete</span>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Target Exam</span><span className="font-bold text-gray-900">{activePlan.target_exam}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Exam Date</span><span className="font-bold text-gray-900">{activePlan.exam_date}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Total Days</span><span className="font-bold text-gray-900">{activePlan.total_days}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Completed</span><span className="font-bold text-green-600">{activePlan.completed_days}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Study Hours</span><span className="font-bold text-gray-900">{activePlan.study_hours_per_day}h/day</span></div>
                </div>
              </div>

              {activePlan.weak_subjects?.length > 0 && (
                <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
                  <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-1"><Zap className="w-4 h-4" /> Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {activePlan.weak_subjects.map((s, i) => (
                      <span key={i} className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Day-wise Schedule */}
            <div className="lg:col-span-3">
              <div className="space-y-2">
                {(activePlan.days || []).map((day) => {
                  const isExpanded = expandedDay === day.day_number;
                  const isToday = day.date === new Date().toISOString().split('T')[0];
                  const isPast = new Date(day.date) < new Date(new Date().toDateString());

                  return (
                    <div key={day.day_number}
                      className={`bg-white rounded-xl border transition-all ${isToday ? 'border-india-saffron shadow-md ring-2 ring-india-saffron/20' : day.is_completed ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                      <button onClick={() => setExpandedDay(isExpanded ? null : day.day_number)}
                        className="w-full flex items-center gap-3 p-4 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black
                          ${day.is_completed ? 'bg-green-500 text-white' : isToday ? 'bg-india-saffron text-white' : day.is_mock_test_day ? 'bg-purple-100 text-purple-700' : day.is_revision_day ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
                          {day.is_completed ? <CheckCircle className="w-5 h-5" /> : `D${day.day_number}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm truncate ${day.is_completed ? 'text-gray-400' : 'text-gray-900'}`}>{day.title}</h4>
                            {isToday && <span className="text-[10px] font-bold bg-india-saffron text-white px-2 py-0.5 rounded-full">TODAY</span>}
                          </div>
                          <p className="text-xs text-gray-400 font-medium">{day.date} • {day.study_hours}h</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-50">
                          <div className="space-y-2 mt-3">
                            {(day.tasks || []).map((task, ti) => (
                              <div key={ti} className={`flex items-center gap-3 p-3 rounded-lg ${task.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <div className={`p-1.5 rounded-lg ${task.completed ? 'bg-green-100 text-green-600' : 'bg-white text-gray-500 border border-gray-200'}`}>
                                  {TASK_ICONS[task.type] || <BookOpen className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</p>
                                  <p className="text-xs text-gray-400">{task.duration_minutes} min • {task.topic}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {!day.is_completed && (
                            <button onClick={() => handleCompleteDay(day.day_number)}
                              className="w-full mt-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Mark Day Complete (+20 XP)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* No Plan - Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No Study Plan Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">Let our AI create a personalized day-by-day roadmap based on your target exam and available time.</p>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5" /> Generate My Study Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyRoadmap;

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Target, Brain, Flame,
  CheckCircle, Zap, ArrowRight, XCircle, Clock, BarChart3,
  Calendar, BookOpen, BookText, Trophy, Medal
} from 'lucide-react';
import {
  getDailyTasks, completeTask, getStreak, getAdvancedAnalytics,
  getDailyRevision, submitDailyRevision, getLeaderboard
} from '../api/recommendationsAPI';

/* ─── Daily Tasks Widget ─── */
const DailyTasksWidget = ({ tasks, stats, onComplete }) => {
  if (!tasks?.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-navy-blue to-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Today's Tasks</h3>
              <p className="text-sm text-blue-200 font-medium">{stats?.completed || 0}/{stats?.total || 0} completed</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{stats?.percentage || 0}%</div>
            <div className="text-xs text-blue-200 font-medium">+{stats?.xp_earned || 0} XP</div>
          </div>
        </div>
        <div className="mt-3 w-full bg-white/20 rounded-full h-2">
          <div className="bg-india-saffron h-2 rounded-full transition-all duration-500" style={{ width: `${stats?.percentage || 0}%` }} />
        </div>
      </div>
      <div className="p-4 space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${task.is_completed ? 'bg-green-50 border border-green-100' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}`}>
            <button onClick={() => !task.is_completed && onComplete(task.id)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${task.is_completed ? 'bg-green-500 text-white' : 'border-2 border-gray-300 hover:border-india-saffron'}`}>
              {task.is_completed && <CheckCircle className="w-4 h-4" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${task.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</p>
              <p className="text-xs text-gray-400 truncate">{task.description}</p>
            </div>
            <span className="text-xs font-bold text-india-saffron bg-orange-50 px-2 py-1 rounded-lg flex-shrink-0">+{task.xp_reward} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Streak Card ─── */
const StreakCard = ({ streak }) => {
  if (!streak) return null;
  return (
    <div className="bg-gradient-to-br from-orange-500 via-india-saffron to-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-200 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10">
        <Flame className="w-32 h-32" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-6 h-6" />
          <span className="text-sm font-bold uppercase tracking-wider opacity-90">Learning Streak</span>
        </div>
        <div className="text-5xl font-black mb-1">{streak.current_streak}</div>
        <p className="text-sm opacity-80 font-medium mb-4">
          {streak.current_streak === 1 ? 'day' : 'days'} in a row!
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 rounded-xl p-2 text-center backdrop-blur-sm">
            <div className="text-lg font-black">{streak.longest_streak}</div>
            <div className="text-[10px] font-semibold opacity-80 uppercase">Best</div>
          </div>
          <div className="bg-white/15 rounded-xl p-2 text-center backdrop-blur-sm">
            <div className="text-lg font-black">{streak.total_xp}</div>
            <div className="text-[10px] font-semibold opacity-80 uppercase">XP</div>
          </div>
          <div className="bg-white/15 rounded-xl p-2 text-center backdrop-blur-sm">
            <div className="text-lg font-black">Lv.{streak.level}</div>
            <div className="text-[10px] font-semibold opacity-80 uppercase">Level</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════ MAIN PAGE ═══════════ */
const PersonalizedFeed = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Form state
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Daily Revision State
  const [revisionData, setRevisionData] = useState(null);
  const [quizStep, setQuizStep] = useState('intro'); // intro, active, result
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  const fetchAll = async () => {
    try {
      const [tasksRes, streakRes, analyticsRes, revRes, leadRes] = await Promise.allSettled([
        getDailyTasks(), getStreak(), getAdvancedAnalytics(), getDailyRevision(), getLeaderboard()
      ]);
      
      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value.data.tasks || []);
        setTaskStats(tasksRes.value.data.stats || null);
      }
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (revRes.status === 'fulfilled') setRevisionData(revRes.value.data);
      if (leadRes.status === 'fulfilled') setLeaderboard(leadRes.value.data.leaderboard || []);
      
    } catch (err) {
      console.error('Feed load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    let timer;
    if (quizStep === 'active' && timeRemaining > 0) {
      timer = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (quizStep === 'active' && timeRemaining === 0) {
      finishRevisionQuiz();
    }
    return () => clearInterval(timer);
  }, [quizStep, timeRemaining]);

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      const res = await getDailyTasks();
      setTasks(res.data.tasks || []);
      setTaskStats(res.data.stats || null);
      const sRes = await getStreak();
      setStreak(sRes.data);
    } catch (err) { console.error(err); }
  };

  const startRevisionQuiz = () => {
    if (revisionData?.questions?.length > 0) {
      setTimeRemaining(revisionData.recommended_timer || 300);
      setQuizStep('active');
    }
  };

  const handleAnswerChange = (val) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: val }));
  };

  const finishRevisionQuiz = async () => {
    const resultsPayload = revisionData.questions.map((q, idx) => {
      const userAns = answers[idx];
      let correct = false;
      if (q.type === 'mcq') {
        correct = parseInt(userAns) === parseInt(q.correctAnswer);
      } else if (userAns && q.correctAnswer) {
        correct = String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      }
      
      return {
        id: q.id,
        user_answer: q.type === 'mcq' ? (q.options[userAns] || userAns) : userAns,
        is_correct: correct
      };
    });

    try {
      const res = await submitDailyRevision(resultsPayload);
      setSubmissionResult(res.data);
      // Update streak and tasks if necessary
      fetchAll();
    } catch (e) {
      console.error('Failed to submit revision', e);
    }
    setQuizStep('result');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-india-saffron animate-spin" />
          </div>
          <p className="text-gray-500 font-semibold">Loading your personalized feed...</p>
        </div>
      </div>
    );
  }

  const questions = revisionData?.questions || [];
  const stats = revisionData?.stats || {};

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-navy-blue via-blue-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-india-saffron rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                Welcome back, <span className="text-india-saffron">{user?.first_name || user?.username}</span> 👋
              </h1>
              <p className="text-blue-200 font-medium">
                {analytics?.summary || 'Your AI-powered learning journey continues.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {streak && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Flame className="w-5 h-5 text-india-saffron" />
                  <span className="text-white font-bold">{streak.current_streak} day streak</span>
                </div>
              )}
              <Link to="/study-roadmap" className="flex items-center gap-2 bg-india-saffron hover:bg-orange-500 text-white rounded-xl px-4 py-2 font-bold text-sm transition-colors shadow-lg shadow-orange-600/20">
                <Calendar className="w-4 h-4" /> Study Plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2">
            
            {quizStep === 'intro' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5">
                  <Brain className="w-64 h-64 text-navy-blue" />
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto bg-blue-50 text-navy-blue rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <BookText className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Daily Revision Quiz</h2>
                  <p className="text-gray-500 max-w-lg mx-auto mb-8 font-medium">
                    We've collected all the questions you answered incorrectly today. 
                    Revising them now will help solidify your understanding and turn weaknesses into strengths.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <div className="bg-gray-50 rounded-xl px-6 py-4 border border-gray-100">
                      <div className="text-3xl font-black text-gray-800 mb-1">{stats.total_wrong_today || 0}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mistakes Today</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl px-6 py-4 border border-orange-100">
                      <div className="text-3xl font-black text-orange-600 mb-1">{questions.length}</div>
                      <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">Pending Revision</div>
                    </div>
                  </div>

                  {questions.length > 0 ? (
                    <button onClick={startRevisionQuiz} className="px-8 py-4 bg-navy-blue hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg shadow-navy-blue/20 transition-all hover:scale-105 flex items-center mx-auto">
                      <Brain className="w-5 h-5 mr-2" /> Start Revision Session
                    </button>
                  ) : (
                    <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-2xl max-w-md mx-auto flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 mb-3 text-green-500" />
                      <h3 className="text-xl font-bold mb-2">You're All Caught Up!</h3>
                      <p className="text-sm font-medium opacity-80">You have no pending revisions for today. Keep up the great work!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {quizStep === 'active' && questions[currentIdx] && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Revision Progress</span>
                    <div className="mt-2 flex gap-1">
                      {questions.map((_, i) => (
                        <div key={i} className={`h-1.5 w-6 rounded-full ${i < currentIdx ? 'bg-green-500' : i === currentIdx ? 'bg-navy-blue' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className={`flex items-center px-4 py-2 rounded-lg font-mono font-bold ${timeRemaining < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-navy-blue'}`}>
                    <Clock className="w-4 h-4 mr-2" /> {formatTime(timeRemaining)}
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-md">
                      Original mistake: {questions[currentIdx].original_wrong_answer || 'Not answered'}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                    {questions[currentIdx].question}
                  </h2>

                  <div className="space-y-4">
                    {questions[currentIdx].type === 'mcq' && questions[currentIdx].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswerChange(i)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center ${
                          answers[currentIdx] === i 
                            ? 'border-navy-blue bg-blue-50/30 shadow-md' 
                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 font-bold text-sm ${answers[currentIdx] === i ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className={`text-lg font-medium ${answers[currentIdx] === i ? 'text-navy-blue' : 'text-gray-700'}`}>{opt}</span>
                      </button>
                    ))}

                    {(questions[currentIdx].type === 'short_answer' || questions[currentIdx].type === 'fill_blanks') && (
                      <textarea
                        value={answers[currentIdx] || ''}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-5 border-2 border-gray-200 rounded-xl text-lg focus:border-navy-blue outline-none transition-colors min-h-[120px] font-medium"
                      />
                    )}
                  </div>

                  <div className="mt-10 flex justify-between">
                    <button 
                      onClick={() => setCurrentIdx(p => Math.max(0, p-1))} 
                      disabled={currentIdx === 0}
                      className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={() => {
                        if (currentIdx < questions.length - 1) setCurrentIdx(p => p+1);
                        else finishRevisionQuiz();
                      }}
                      className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md flex items-center ${
                        answers[currentIdx] !== undefined ? 'bg-navy-blue hover:bg-blue-800' : 'bg-gray-300'
                      }`}
                    >
                      {currentIdx === questions.length - 1 ? 'Submit Revision' : 'Next Question'}
                      {currentIdx !== questions.length - 1 && <ArrowRight className="ml-2 w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {quizStep === 'result' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                <div className="w-20 h-20 mx-auto bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Revision Complete!</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                  You successfully revised {submissionResult?.total_revised || 0} questions.
                  You got <span className="font-bold text-green-600">{submissionResult?.correct || 0}</span> correct.
                </p>
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold mb-8 border border-orange-100">
                  <Zap className="w-4 h-4" /> +{submissionResult?.xp_earned || 0} XP Earned
                </div>
                <div className="flex justify-center">
                  <button onClick={() => { setQuizStep('intro'); fetchAll(); }} className="px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                    Back to Feed
                  </button>
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StreakCard streak={streak} />
            
            {/* Top 10 Leaderboard */}
            {leaderboard && leaderboard.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-amber-100 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Top 10 Students</h3>
                    <p className="text-xs text-gray-500 font-medium">Weekly XP Leaderboard</p>
                  </div>
                </div>
                <div className="p-3">
                  {leaderboard.map((student, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl mb-1 ${student.is_current_user ? 'bg-amber-50 border border-amber-100' : 'hover:bg-gray-50'}`}>
                      <div className="font-bold text-sm text-gray-400 w-4 text-center">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : student.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${student.is_current_user ? 'text-amber-700' : 'text-gray-800'}`}>
                          {student.display_name} {student.is_current_user && '(You)'}
                        </p>
                        <p className="text-xs text-gray-400">Level {student.level}</p>
                      </div>
                      <div className="text-xs font-black text-amber-600 bg-white px-2 py-1 rounded-lg border border-amber-100 shadow-sm">
                        {student.weekly_xp} XP
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DailyTasksWidget tasks={tasks} stats={taskStats} onComplete={handleCompleteTask} />

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/practice-quiz', label: 'AI Practice Quiz', icon: <Brain className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50' },
                  { to: '/dashboard', label: 'Analytics Dashboard', icon: <BarChart3 className="w-4 h-4" />, color: 'text-green-600 bg-green-50' },
                  { to: '/study-roadmap', label: 'Study Roadmap', icon: <Calendar className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50' },
                  { to: '/resources', label: 'Study Resources', icon: <BookOpen className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50' },
                ].map((link) => (
                  <Link key={link.to} to={link.to} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className={`p-2 rounded-lg ${link.color}`}>{link.icon}</div>
                    <span className="text-sm font-semibold text-gray-700">{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedFeed;

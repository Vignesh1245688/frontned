import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen, ShieldCheck, Target, Zap, ChevronRight, Sparkles,
  Brain, Calendar, BarChart3, Flame, TrendingUp, RefreshCw
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  const features = [
    {
      title: 'AI Personalized Feed',
      description: 'Netflix-style recommendations curated by AI based on your learning patterns and weak areas.',
      icon: <Sparkles className="w-8 h-8 text-india-saffron" />,
    },
    {
      title: 'Smart Study Roadmap',
      description: 'AI generates day-by-day study plans tailored to your target exam and available time.',
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
    },
    {
      title: 'Adaptive Learning',
      description: 'Difficulty auto-adjusts as you improve. Easy → Medium → Hard progression.',
      icon: <Brain className="w-8 h-8 text-blue-600" />,
    },
    {
      title: 'Weak Topic Detection',
      description: 'AI detects your weak areas and generates targeted practice to fill knowledge gaps.',
      icon: <Target className="w-8 h-8 text-red-500" />,
    },
    {
      title: 'Spaced Repetition',
      description: 'Scientifically optimized review scheduling to maximize long-term retention.',
      icon: <RefreshCw className="w-8 h-8 text-cyan-600" />,
    },
    {
      title: 'AI Analytics Dashboard',
      description: 'Deep insights with topic mastery charts, heatmaps, and improvement tracking.',
      icon: <BarChart3 className="w-8 h-8 text-emerald-600" />,
    },
    {
      title: 'Daily AI Tasks',
      description: 'Personalized daily study tasks with XP rewards and streak tracking.',
      icon: <Flame className="w-8 h-8 text-orange-500" />,
    },
    {
      title: 'Gamification & Streaks',
      description: 'Earn XP, level up, and maintain streaks to stay motivated on your journey.',
      icon: <Zap className="w-8 h-8 text-amber-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-light-bg pt-16">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-navy-blue/5 via-light-bg to-india-saffron/5 -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-india-saffron/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-india-saffron/10 to-orange-100 px-4 py-2 rounded-full mb-6 border border-india-saffron/20">
            <Sparkles className="w-4 h-4 text-india-saffron" />
            <span className="text-sm font-bold text-india-saffron">AI-Powered Adaptive Learning Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-navy-blue tracking-tight leading-tight mb-6">
            Your Exam Success,{' '}
            <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-india-saffron to-orange-500">Powered by AI</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
            ExamEdge uses AI to create personalized study plans, detect weak topics,
            adapt difficulty, and recommend exactly what you need — like Netflix for exam prep.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {user ? (
              <Link to="/ai-feed" className="px-8 py-3.5 bg-gradient-to-r from-india-saffron to-orange-500 text-white rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-india-saffron/30 flex items-center">
                <Sparkles className="mr-2 w-5 h-5" /> Open AI Feed <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            ) : (
              <Link to="/register" className="px-8 py-3.5 bg-gradient-to-r from-navy-blue to-blue-700 text-white rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-navy-blue/30 flex items-center">
                Join Now <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            )}
            <Link to="/exams" className="px-8 py-3 bg-white text-navy-blue border border-gray-200 rounded-full font-semibold hover:border-gray-300 transition-all shadow-sm">
              Explore Exams
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full mb-4">
              <Brain className="w-4 h-4 text-navy-blue" />
              <span className="text-xs font-bold text-navy-blue uppercase tracking-wider">AI-Powered Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-blue mb-4">
              Learn Smarter, Not Harder —{' '}
              <br className="hidden md:block"/>
              With <span className="text-india-saffron">Intelligent AI</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our recommendation engine analyzes your performance and adapts in real-time,
              just like Duolingo + Netflix combined for exam preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className="mb-5 p-3 bg-gray-50 rounded-xl inline-block group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-light-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-blue mb-4">
              How ExamEdge <span className="text-india-green">AI Works</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-start space-y-12 md:space-y-0 md:space-x-12 relative">
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gray-200 -z-10" />

            {[
              { step: 1, title: 'Take Quizzes', desc: 'Upload PDFs and take AI-generated quizzes on any topic.', color: 'bg-navy-blue' },
              { step: 2, title: 'AI Analyzes', desc: 'Our engine detects weak areas, tracks mastery, and adapts difficulty.', color: 'bg-india-saffron' },
              { step: 3, title: 'Get Personalized', desc: 'Receive tailored recommendations, study plans, and daily tasks.', color: 'bg-india-green' },
            ].map((item) => (
              <div key={item.step} className="flex-1 text-center relative z-10">
                <div className={`w-16 h-16 mx-auto ${item.color} text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-md`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {user && (
        <section className="py-16 bg-gradient-to-r from-navy-blue via-blue-800 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-india-saffron rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-black text-white mb-4">Ready to supercharge your prep?</h2>
            <p className="text-blue-200 mb-8 text-lg">Access your personalized AI feed, study plans, and analytics now.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/ai-feed" className="px-8 py-3.5 bg-india-saffron text-white rounded-full font-bold hover:bg-orange-500 transition-colors shadow-lg flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" /> AI Feed
              </Link>
              <Link to="/study-roadmap" className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" /> Study Roadmap
              </Link>
              <Link to="/ai-analytics" className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" /> Analytics
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

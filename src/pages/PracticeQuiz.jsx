import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { 
  UploadCloud, CheckCircle, XCircle, AlertCircle, 
  Settings, Clock, BookOpen, BrainCircuit, BarChart, 
  Save, Layout, Zap, ArrowRight, RefreshCw, FileText
} from 'lucide-react';

const PracticeQuiz = () => {
  const navigate = useNavigate();
  // Steps: setup -> analyzing -> config -> generating -> active -> result
  const [step, setStep] = useState('setup');
  const [file, setFile] = useState(null);
  
  // Analysis data
  const [extractedText, setExtractedText] = useState('');
  const [detectedTopics, setDetectedTopics] = useState([]);
  const [detectedKeywords, setDetectedKeywords] = useState([]);
  
  // Configuration
  const [mode, setMode] = useState('Standard');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState(['mcq']);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  
  // Quiz active data
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { idx: answer }
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  
  // UI states
  const [error, setError] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  
  useEffect(() => {
    let timer;
    if (step === 'active' && timeRemaining > 0) {
      timer = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (step === 'active' && timeRemaining === 0) {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [step, timeRemaining]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const startAnalysis = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    setStep('analyzing');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('practice-quiz/analyze/', formData);
      setDetectedTopics(res.data.topics || []);
      setDetectedKeywords(res.data.keywords || []);
      setExtractedText(res.data.text || '');
      setSelectedTopics(res.data.topics || []);
      setStep('config');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze PDF. Please try again.');
      setStep('setup');
    }
  };

  const generateQuiz = async () => {
    setStep('generating');
    setError('');
    try {
      const res = await api.post('practice-quiz/generate/', {
        text: extractedText,
        difficulty,
        num_questions: numQuestions,
        question_types: questionTypes,
        topics: selectedTopics,
        mode
      });
      
      if (res.data?.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setTimeRemaining(res.data.recommended_timer || 300);
        setStep('active');
        setStartTime(Date.now());
      } else {
        throw new Error('No questions generated');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.');
      setStep('config');
    }
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const toggleType = (type) => {
    setQuestionTypes(prev => {
      if (prev.includes(type) && prev.length === 1) return prev; // Keep at least one
      return prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
    });
  };

  const handleSaveTemplate = async () => {
    if (!saveTemplateName) return;
    try {
      await api.post('practice-quiz/templates/', {
        name: saveTemplateName,
        config: { mode, difficulty, numQuestions, questionTypes }
      });
      alert('Template saved successfully!');
      setSaveTemplateName('');
    } catch (err) {
      alert('Failed to save template');
    }
  };

  const handleAnswerChange = (val) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: val }));
  };

  const finishQuiz = async () => {
    let score = 0;
    const topicsAcc = {};
    const wrongQuestions = [];
    
    questions.forEach((q, idx) => {
      const userAns = answers[idx];
      let correct = false;
      if (q.type === 'mcq') {
        correct = parseInt(userAns) === q.correctAnswer;
      } else if (q.type === 'true_false' || q.type === 'short_answer' || q.type === 'fill_blanks') {
        // Simple case-insensitive matching for non-MCQ for prototype
        if (userAns && q.correctAnswer) {
          correct = String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        }
      }
      if (correct) score += 1;
      
      // Collect wrong answers for Daily Revision
      if (!correct) {
        wrongQuestions.push({
          question: q.question,
          type: q.type,
          options: q.options || [],
          correctAnswer: q.type === 'mcq' ? q.options[q.correctAnswer] : q.correctAnswer,
          userAnswer: q.type === 'mcq' ? (q.options[userAns] || 'Not answered') : (userAns || 'Not answered'),
          explanation: q.explanation || '',
          reference: q.reference || '',
          topic: q.topic || '',
          difficulty: q.difficulty || 'medium',
        });
      }
      
      if (q.topic) {
        if (!topicsAcc[q.topic]) topicsAcc[q.topic] = { total: 0, correct: 0 };
        topicsAcc[q.topic].total += 1;
        if (correct) topicsAcc[q.topic].correct += 1;
      }
    });
    
    setQuizScore(score);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const finalTopicsAccuracy = {};
    Object.keys(topicsAcc).forEach(t => {
      finalTopicsAccuracy[t] = (topicsAcc[t].correct / topicsAcc[t].total) * 100;
    });

    try {
      await api.post('practice-quiz/save-result/', {
        title: `Adaptive Quiz: ${file?.name?.substring(0, 20)}`,
        file_name: file?.name || 'document',
        score,
        total_questions: questions.length,
        time_taken_seconds: timeTaken,
        topics_accuracy: finalTopicsAccuracy,
        wrong_questions: wrongQuestions,
      });
    } catch (e) {
      console.error('Failed to save result', e);
    }
    
    setStep('result');
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);
    try {
      const res = await api.post('practice-quiz/flashcards/', {
        text: extractedText,
        title: `Flashcards: ${file?.name?.substring(0, 20)}`
      });
      setFlashcards(res.data.flashcards);
    } catch (err) {
      alert('Failed to generate flashcards');
    }
    setGeneratingFlashcards(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ---------------- RENDERS ---------------- //

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 font-sans">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-400 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-32 bg-purple-400 rounded-full blur-3xl opacity-20 -ml-16 -mb-16 pointer-events-none"></div>
            
            <div className="relative z-10 text-center mb-10">
              <div className="inline-flex items-center justify-center p-4 bg-navy-blue text-white rounded-2xl mb-4 shadow-lg shadow-navy-blue/30">
                <BrainCircuit size={36} />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Adaptive AI Examination</h1>
              <p className="mt-3 text-lg text-gray-600 font-medium">Upload a document to automatically generate a highly intelligent, context-aware assessment.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 rounded-2xl flex items-center shadow-sm">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-navy-blue/30 rounded-3xl p-12 flex flex-col items-center justify-center bg-blue-50/30 hover:bg-blue-50/50 transition-all cursor-pointer relative group">
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="bg-white p-5 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300 mb-5">
                <UploadCloud className="w-10 h-10 text-navy-blue" />
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">{file ? file.name : 'Drag & Drop PDF Here'}</p>
              <p className="text-gray-500 font-medium">Click to browse • Up to 15MB</p>
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={startAnalysis}
                disabled={!file}
                className={`flex items-center px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all duration-300 ${
                  file ? 'bg-gradient-to-r from-navy-blue to-blue-600 hover:scale-105 hover:shadow-navy-blue/30' : 'bg-gray-300 cursor-not-allowed opacity-70'
                }`}
              >
                Analyze Document <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing' || step === 'generating') {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-xl border border-white flex flex-col items-center text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-purple-50 opacity-50"></div>
          <div className="relative z-10">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-navy-blue border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-navy-blue">
                {step === 'analyzing' ? <FileText size={32} /> : <BrainCircuit size={32} />}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {step === 'analyzing' ? 'Analyzing Smart Topics...' : 'Generating Adaptive Quiz...'}
            </h2>
            <p className="text-gray-600 font-medium">
              {step === 'analyzing' 
                ? 'Our AI is extracting key concepts and identifying important areas from your document.' 
                : 'Formulating questions, validating difficulty, and generating detailed explanations.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'config') {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-12 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            
            <div className="bg-navy-blue px-8 py-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">Configure Assessment</h2>
                <p className="text-blue-100 text-sm font-medium">Customize AI generation parameters based on detected document context.</p>
              </div>
              <Settings className="w-8 h-8 opacity-50" />
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center font-medium">
                  <AlertCircle className="w-5 h-5 mr-2" /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column: Topics & Types */}
                <div className="space-y-8">
                  
                  {/* Topic Detection */}
                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3 text-navy-blue"><Zap size={20} /></div>
                      <h3 className="text-lg font-bold text-gray-800">Smart Topic Detection</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 font-medium">AI extracted these topics. Select which ones to focus on:</p>
                    <div className="flex flex-wrap gap-2">
                      {detectedTopics.map((topic, i) => (
                        <button
                          key={i}
                          onClick={() => toggleTopic(topic)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            selectedTopics.includes(topic)
                              ? 'bg-navy-blue text-white shadow-md shadow-navy-blue/20'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-navy-blue hover:text-navy-blue'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Types */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Layout className="w-5 h-5 mr-2 text-navy-blue" /> Question Types
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'mcq', label: 'Multiple Choice' },
                        { id: 'true_false', label: 'True / False' },
                        { id: 'short_answer', label: 'Short Answer' },
                        { id: 'fill_blanks', label: 'Fill in Blanks' }
                      ].map(type => (
                        <div
                          key={type.id}
                          onClick={() => toggleType(type.id)}
                          className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition-all ${
                            questionTypes.includes(type.id)
                              ? 'border-navy-blue bg-blue-50/30'
                              : 'border-gray-100 hover:border-gray-200 bg-white'
                          }`}
                        >
                          <span className={`font-bold ${questionTypes.includes(type.id) ? 'text-navy-blue' : 'text-gray-600'}`}>
                            {type.label}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            questionTypes.includes(type.id) ? 'border-navy-blue bg-navy-blue' : 'border-gray-300'
                          }`}>
                            {questionTypes.includes(type.id) && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column: Settings & Templates */}
                <div className="space-y-8">
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Generation Mode</label>
                      <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl p-3.5 bg-white focus:border-navy-blue outline-none font-medium text-gray-800 shadow-sm transition-all">
                        <option value="Standard">Standard Assessment</option>
                        <option value="Previous Year Pattern">Previous Year / Exam Pattern</option>
                        <option value="Important Topics Only">Important Topics Only</option>
                      </select>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl p-3.5 bg-white focus:border-navy-blue outline-none font-medium text-gray-800 shadow-sm">
                          <option value="Easy">Beginner (Easy)</option>
                          <option value="Medium">Intermediate (Medium)</option>
                          <option value="Hard">Advanced (Hard)</option>
                        </select>
                      </div>
                      <div className="w-1/3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Questions</label>
                        <input type="number" min="1" max="50" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl p-3.5 bg-white focus:border-navy-blue outline-none font-medium text-gray-800 shadow-sm text-center" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                      <Save className="w-4 h-4 mr-2" /> Save Configuration as Template
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g., Midterm Pattern" 
                        value={saveTemplateName}
                        onChange={(e) => setSaveTemplateName(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-navy-blue"
                      />
                      <button onClick={handleSaveTemplate} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                        Save
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-8 py-6 flex justify-between items-center">
              <button onClick={() => setStep('setup')} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-800 transition-colors">
                Back
              </button>
              <button onClick={generateQuiz} className="px-10 py-3.5 bg-navy-blue text-white rounded-xl font-bold shadow-lg shadow-navy-blue/20 hover:scale-105 transition-all flex items-center">
                <BrainCircuit className="w-5 h-5 mr-2" /> Generate Examination
              </button>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  if (step === 'active') {
    const question = questions[currentQuestionIdx];
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4 pb-12 font-sans">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center border border-gray-100">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                <span className="text-navy-blue bg-blue-50 px-2 py-0.5 rounded-md text-xs border border-blue-100">{question.topic || 'General'}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-blue-500 to-navy-blue h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}></div>
              </div>
            </div>
            
            <div className={`flex items-center px-5 py-2.5 rounded-xl font-mono font-bold text-xl ${timeRemaining < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-navy-blue'}`}>
              <Clock className="w-5 h-5 mr-2" />
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-md mb-6">
              {question.type.replace('_', ' ')}
            </div>
            
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 leading-tight">
              {question.question}
            </h2>

            <div className="space-y-4">
              {question.type === 'mcq' && question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerChange(i)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center ${
                    answers[currentQuestionIdx] === i 
                      ? 'border-navy-blue bg-blue-50/50 shadow-md transform scale-[1.01]' 
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 font-bold text-sm ${answers[currentQuestionIdx] === i ? 'bg-navy-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={`text-lg font-medium ${answers[currentQuestionIdx] === i ? 'text-navy-blue' : 'text-gray-700'}`}>{opt}</span>
                </button>
              ))}

              {question.type === 'true_false' && ['True', 'False'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerChange(opt)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center ${
                    answers[currentQuestionIdx] === opt 
                      ? 'border-navy-blue bg-blue-50/50 shadow-md' 
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-lg font-bold ${answers[currentQuestionIdx] === opt ? 'text-navy-blue' : 'text-gray-700'}`}>{opt}</span>
                </button>
              ))}

              {(question.type === 'short_answer' || question.type === 'fill_blanks') && (
                <textarea
                  value={answers[currentQuestionIdx] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-5 border-2 border-gray-200 rounded-2xl text-lg focus:border-navy-blue outline-none transition-colors min-h-[120px] font-medium"
                ></textarea>
              )}
            </div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
              <button 
                onClick={() => setCurrentQuestionIdx(p => Math.max(0, p-1))} 
                disabled={currentQuestionIdx === 0}
                className="px-6 py-3 font-bold text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={() => {
                  if (currentQuestionIdx < questions.length - 1) setCurrentQuestionIdx(p => p+1);
                  else finishQuiz();
                }}
                className={`px-10 py-3.5 rounded-xl font-bold text-white transition-all shadow-md flex items-center ${
                  answers[currentQuestionIdx] !== undefined 
                    ? 'bg-navy-blue hover:bg-blue-800 hover:-translate-y-1' 
                    : 'bg-gray-300'
                }`}
              >
                {currentQuestionIdx === questions.length - 1 ? 'Submit Examination' : 'Next Question'}
                {currentQuestionIdx !== questions.length - 1 && <ArrowRight className="ml-2 w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const accuracy = ((quizScore / questions.length) * 100).toFixed(0);
    
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4 pb-20 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-500 via-navy-blue to-purple-500"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={`${accuracy >= 70 ? 'text-green-500' : accuracy >= 40 ? 'text-orange-500' : 'text-red-500'}`} strokeDasharray={`${accuracy}, 100`} strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-gray-900">{accuracy}%</span>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Accuracy</span>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Examination Complete</h1>
                <p className="text-lg text-gray-600 mb-6 font-medium">You scored <span className="text-navy-blue font-bold">{quizScore} out of {questions.length}</span> questions correctly.</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-navy-blue text-white rounded-xl font-bold shadow-md hover:-translate-y-1 transition-transform flex items-center">
                    <BarChart className="w-5 h-5 mr-2" /> View Analytics Dashboard
                  </button>
                  <button onClick={handleGenerateFlashcards} disabled={generatingFlashcards} className="px-6 py-3 bg-white border-2 border-navy-blue text-navy-blue rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center disabled:opacity-50">
                    {generatingFlashcards ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <BookOpen className="w-5 h-5 mr-2" />}
                    Generate Smart Flashcards
                  </button>
                </div>
              </div>
            </div>
          </div>

          {flashcards.length > 0 && (
            <div className="bg-gradient-to-br from-navy-blue to-blue-800 rounded-3xl p-8 shadow-xl text-white">
              <h3 className="text-2xl font-bold mb-6 flex items-center"><Zap className="mr-2 text-yellow-400" /> AI Generated Revision Flashcards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flashcards.map((fc, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors group cursor-pointer perspective">
                    <div className="font-bold text-blue-200 text-sm mb-2 uppercase tracking-wide">Card {i+1}</div>
                    <p className="font-medium text-lg leading-snug">{fc.front}</p>
                    <div className="mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-yellow-300 font-bold uppercase tracking-wider mb-1 block">Answer</span>
                      <p className="font-medium">{fc.back}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 px-2">Detailed AI Explanations</h3>
            {questions.map((q, idx) => {
              const uans = answers[idx];
              let isCorrect = false;
              if (q.type === 'mcq') isCorrect = parseInt(uans) === q.correctAnswer;
              else if (uans && q.correctAnswer) isCorrect = String(uans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

              return (
                <div key={idx} className={`bg-white rounded-3xl p-8 shadow-md border-2 ${isCorrect ? 'border-green-100' : 'border-red-100'} relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-2 h-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  
                  <div className="flex items-start pl-4">
                    <div className="mr-5 mt-1">
                      {isCorrect ? <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div> : <div className="bg-red-100 p-2 rounded-full"><XCircle className="w-6 h-6 text-red-600" /></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <p className="font-extrabold text-gray-900 text-xl leading-relaxed">{q.question}</p>
                        <span className="ml-4 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap">{q.topic || 'General'}</span>
                      </div>
                      
                      <div className="mb-6 bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Answer</p>
                            <p className={`font-medium text-lg ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                              {q.type === 'mcq' ? (q.options[uans] || 'Not answered') : (uans || 'Not answered')}
                            </p>
                          </div>
                          {!isCorrect && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Correct Answer</p>
                              <p className="font-bold text-lg text-green-700">
                                {q.type === 'mcq' ? q.options[q.correctAnswer] : q.correctAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-blue-50/80 rounded-2xl p-6 text-navy-blue border border-blue-100 relative">
                        <div className="absolute -top-3 left-6 bg-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center border border-blue-200">
                          <BrainCircuit className="w-3 h-3 mr-1" /> AI Explanation
                        </div>
                        <p className="font-medium mt-2 leading-relaxed">{q.explanation || 'No explanation provided.'}</p>
                        
                        {q.reference && (
                          <div className="mt-4 pt-4 border-t border-blue-200/50">
                            <p className="text-xs font-bold text-blue-800/60 uppercase tracking-widest mb-2">Document Reference</p>
                            <p className="text-sm font-medium italic text-blue-900 border-l-4 border-blue-300 pl-3 py-1 bg-white/40 rounded-r-md block">
                              "{q.reference}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PracticeQuiz;

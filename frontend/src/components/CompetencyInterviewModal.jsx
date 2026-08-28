import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, ChevronRight, Check, X, Trophy, Target, 
  Zap, TrendingUp, AlertTriangle, Star, RotateCcw, ArrowRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CompetencyInterviewModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('select'); // select | interviewing | result
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions] = useState(6);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [competencyResult, setCompetencyResult] = useState(null);
  const [progress, setProgress] = useState({ correct: 0, total: 0, difficulty: 'Medium' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('skillsphere_token');

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/competency-interview/skills`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (err) {
      setError('Failed to load skills');
    }
  }, []);

  useEffect(() => {
    if (isOpen && step === 'select') {
      fetchSkills();
    }
  }, [isOpen, step, fetchSkills]);

  const startInterview = async () => {
    if (!selectedSkill) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/competency-interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ skill: selectedSkill, difficulty: 'Medium' }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setQuestionIndex(1);
      setProgress({ correct: 0, total: 0, difficulty: data.difficulty });
      setHistory([]);
      setStep('interviewing');
    } catch (err) {
      setError('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answerIdx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIdx);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/competency-interview/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          question_index: questionIndex,
          answer: answerIdx,
          skill: selectedSkill,
          difficulty: progress.difficulty,
        }),
      });
      const data = await res.json();
      setEvaluation(data.evaluation);

      // Add to history
      setHistory(prev => [...prev, {
        question: currentQuestion.text,
        options: currentQuestion.options,
        selectedAnswer: answerIdx,
        correctAnswer: data.evaluation?.correct_answer,
        isCorrect: data.evaluation?.is_correct,
        explanation: data.evaluation?.explanation,
        topic: currentQuestion.topic,
        difficulty: progress.difficulty,
      }]);

      if (data.completed) {
        setCompetencyResult(data.competency);
        setTimeout(() => setStep('result'), 1500);
      } else {
        setProgress({
          correct: data.progress?.correct_so_far || 0,
          total: data.progress?.current || questionIndex,
          difficulty: data.progress?.difficulty || progress.difficulty,
        });
        // Auto-advance after 1.5s
        setTimeout(() => {
          setCurrentQuestion(data.next_question);
          setQuestionIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setEvaluation(null);
        }, 1500);
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('select');
    setSelectedSkill('');
    setSessionId(null);
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setEvaluation(null);
    setCompetencyResult(null);
    setProgress({ correct: 0, total: 0, difficulty: 'Medium' });
    setHistory([]);
    setError(null);
  };

  if (!isOpen) return null;

  const difficultyColor = {
    Easy: 'text-green-600 bg-green-50 border-green-200',
    Medium: 'text-amber-600 bg-amber-50 border-amber-200',
    Hard: 'text-red-600 bg-red-50 border-red-200',
    Expert: 'text-purple-600 bg-purple-50 border-purple-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI Competency Interview</h2>
                <p className="text-emerald-100 text-sm">
                  {step === 'select' && 'Adaptive assessment that probes your real skills'}
                  {step === 'interviewing' && `Question ${Math.min(questionIndex, totalQuestions)} of ${totalQuestions}`}
                  {step === 'result' && 'Assessment Complete'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>
          {step === 'interviewing' && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-emerald-100 mb-1">
                <span>Progress</span>
                <span>{Math.min(questionIndex, totalQuestions)}/{totalQuestions}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(Math.min(questionIndex, totalQuestions) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Skill Selection */}
          {step === 'select' && (
            <div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Select a skill to assess</h3>
                <p className="text-gray-500 text-sm">
                  AI will ask adaptive questions, adjusting difficulty based on your answers. 
                  After 6 questions, you'll receive a competency score.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.name)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedSkill === skill.name
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{skill.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{skill.category}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={startInterview}
                disabled={!selectedSkill || loading}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Start Interview <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Interview in Progress */}
          {step === 'interviewing' && currentQuestion && (
            <div>
              {/* Difficulty badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${difficultyColor[progress.difficulty] || difficultyColor.Medium}`}>
                  {progress.difficulty}
                </span>
                <span className="text-xs text-gray-500">{currentQuestion.topic}</span>
                {progress.correct > 0 && (
                  <span className="text-xs text-emerald-600 ml-auto">
                    ✓ {progress.correct} correct
                  </span>
                )}
              </div>

              {/* Question */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <p className="text-gray-800 font-medium text-lg leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const showResult = evaluation !== null;
                  const isCorrect = idx === evaluation?.correct_answer;
                  
                  let borderColor = 'border-gray-200 hover:border-emerald-300';
                  let bgColor = 'bg-white hover:bg-emerald-50';
                  
                  if (showResult) {
                    if (isCorrect) {
                      borderColor = 'border-green-500';
                      bgColor = 'bg-green-50';
                    } else if (isSelected && !isCorrect) {
                      borderColor = 'border-red-500';
                      bgColor = 'bg-red-50';
                    } else {
                      borderColor = 'border-gray-200';
                      bgColor = 'bg-gray-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => submitAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${borderColor} ${bgColor} ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        showResult && isCorrect ? 'bg-green-500 text-white' :
                        showResult && isSelected ? 'bg-red-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {showResult && isCorrect ? <Check size={16} /> :
                         showResult && isSelected ? <X size={16} /> :
                         String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-gray-700 text-sm">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Evaluation feedback */}
              {evaluation && (
                <div className={`p-4 rounded-xl border-2 ${
                  evaluation.is_correct 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {evaluation.is_correct ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={18} className="text-orange-600" />
                    )}
                    <span className={`font-semibold ${evaluation.is_correct ? 'text-green-700' : 'text-orange-700'}`}>
                      {evaluation.is_correct ? 'Correct!' : 'Not quite right'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{evaluation.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {step === 'result' && competencyResult && (
            <div>
              {/* Score display */}
              <div className="text-center mb-6">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold ${
                  competencyResult.score >= 80 ? 'bg-green-100 text-green-700' :
                  competencyResult.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  competencyResult.score >= 40 ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {competencyResult.score}%
                </div>
                <h3 className="text-xl font-bold text-gray-800">{selectedSkill} Competency</h3>
                <p className={`text-sm font-medium mt-1 ${
                  competencyResult.level === 'advanced' ? 'text-green-600' :
                  competencyResult.level === 'proficient' ? 'text-yellow-600' :
                  competencyResult.level === 'developing' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {competencyResult.label}
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{competencyResult.correct_count}/{competencyResult.questions_answered}</div>
                  <div className="text-xs text-blue-600">Correct</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-700">{competencyResult.difficulty_reached}</div>
                  <div className="text-xs text-purple-600">Peak Level</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-700">{competencyResult.accuracy}%</div>
                  <div className="text-xs text-emerald-600">Accuracy</div>
                </div>
              </div>

              {/* Topic breakdown */}
              {competencyResult.topic_breakdown && Object.keys(competencyResult.topic_breakdown).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Topic Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(competencyResult.topic_breakdown).map(([topic, data]) => (
                      <div key={topic} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-40 truncate">{topic}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${data.accuracy >= 80 ? 'bg-green-500' : data.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${data.accuracy}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">{data.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strong / Weak topics */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {competencyResult.strong_topics.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={16} className="text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Strong Areas</span>
                    </div>
                    {competencyResult.strong_topics.map((t, i) => (
                      <div key={i} className="text-xs text-green-600 mt-1">✓ {t}</div>
                    ))}
                  </div>
                )}
                {competencyResult.weak_topics.length > 0 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={16} className="text-orange-600" />
                      <span className="text-sm font-semibold text-orange-700">Areas to Improve</span>
                    </div>
                    {competencyResult.weak_topics.map((t, i) => (
                      <div key={i} className="text-xs text-orange-600 mt-1">→ {t}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended next steps */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Recommended Next Steps</span>
                </div>
                <ul className="text-sm text-emerald-600 space-y-1">
                  {competencyResult.score < 40 && (
                    <li>• Start the "30-Day Learning Path" for {selectedSkill} fundamentals</li>
                  )}
                  {competencyResult.score >= 40 && competencyResult.score < 70 && (
                    <li>• Take a practice quiz to reinforce weak topics</li>
                  )}
                  {competencyResult.score >= 70 && (
                    <li>• Challenge yourself with a Hard-level quiz or advanced project</li>
                  )}
                  <li>• Upload your {selectedSkill} notes for a personalized quiz</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetencyInterviewModal;

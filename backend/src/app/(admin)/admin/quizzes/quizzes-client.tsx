'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Sparkles,
  BookOpen,
  Edit,
} from 'lucide-react';

interface Question {
  id: number;
  questionNumber: number;
  questionText: string;
  options: string;
  correctOption: number;
  explanation?: string | null;
  marks: number;
  negativeMarks: number;
  subject?: string | null;
  topic?: string | null;
}

interface TestSeriesRef {
  id: number;
  title: string;
}

interface Quiz {
  id: number;
  title: string;
  subject?: string | null;
  durationMinutes: number;
  totalMarks: number;
  negativeMarks: number;
  passingMarks: number;
  isFree: boolean;
  isLocked: boolean;
  maxAttempts: number;
  testSeriesId?: number | null;
  testSeries?: TestSeriesRef | null;
  questions: Question[];
  _count?: {
    questions: number;
    attempts: number;
  };
}

interface QuizzesClientProps {
  initialQuizzes: Quiz[];
  testSeriesList: TestSeriesRef[];
}

export function QuizzesClient({ initialQuizzes, testSeriesList }: QuizzesClientProps) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [activeTab, setActiveTab] = useState<'all' | 'series' | 'standalone' | 'free'>('all');
  const [search, setSearch] = useState('');
  const [expandedQuizId, setExpandedQuizId] = useState<number | null>(null);

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [activeQuizForQuestion, setActiveQuizForQuestion] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Question Form Fields
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState(0);
  const [qMarks, setQMarks] = useState('4.0');
  const [qNegMarks, setQNegMarks] = useState('1.0');
  const [qSubject, setQSubject] = useState('');
  const [qTopic, setQTopic] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // New Quiz Modal State
  const [isNewQuizModalOpen, setIsNewQuizModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Biology');
  const [newDuration, setNewDuration] = useState('60');
  const [newTotalMarks, setNewTotalMarks] = useState('40.0');
  const [newNegMarks, setNewNegMarks] = useState('1.0');
  const [newPassingMarks, setNewPassingMarks] = useState('16.0');
  const [newIsFree, setNewIsFree] = useState(false);
  const [newSeriesId, setNewSeriesId] = useState('');
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Filter quizzes by tab and search
  const filteredQuizzes = quizzes.filter((quiz) => {
    let tabMatch = true;
    if (activeTab === 'series') tabMatch = quiz.testSeriesId !== null;
    else if (activeTab === 'standalone') tabMatch = quiz.testSeriesId === null;
    else if (activeTab === 'free') tabMatch = quiz.isFree === true;

    const searchMatch =
      quiz.title.toLowerCase().includes(search.toLowerCase()) ||
      (quiz.subject && quiz.subject.toLowerCase().includes(search.toLowerCase())) ||
      (quiz.testSeries && quiz.testSeries.title.toLowerCase().includes(search.toLowerCase()));

    return tabMatch && searchMatch;
  });

  // Aggregated Stats
  const totalQuizzes = quizzes.length;
  const seriesCount = quizzes.filter((q) => q.testSeriesId !== null).length;
  const standaloneCount = quizzes.filter((q) => q.testSeriesId === null).length;
  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);

  // Open Question Modal for Add or Edit
  const openQuestionModal = (quiz: Quiz, questionToEdit?: Question) => {
    setActiveQuizForQuestion(quiz);
    if (questionToEdit) {
      setEditingQuestion(questionToEdit);
      setQText(questionToEdit.questionText);
      try {
        const opts = JSON.parse(questionToEdit.options);
        setOptA(opts[0] || '');
        setOptB(opts[1] || '');
        setOptC(opts[2] || '');
        setOptD(opts[3] || '');
      } catch {
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
      }
      setCorrectOpt(questionToEdit.correctOption ?? 0);
      setQMarks(questionToEdit.marks.toString());
      setQNegMarks(questionToEdit.negativeMarks.toString());
      setQSubject(questionToEdit.subject || quiz.subject || '');
      setQTopic(questionToEdit.topic || '');
      setQExplanation(questionToEdit.explanation || '');
    } else {
      setEditingQuestion(null);
      setQText('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectOpt(0);
      setQMarks('4.0');
      setQNegMarks('1.0');
      setQSubject(quiz.subject || '');
      setQTopic('');
      setQExplanation('');
    }
    setIsQuestionModalOpen(true);
  };

  // Save Question Handler
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizForQuestion) return;

    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert('Question statement and all 4 options are required.');
      return;
    }

    try {
      setIsSavingQuestion(true);
      const payload = {
        id: editingQuestion?.id,
        quizId: activeQuizForQuestion.id,
        questionText: qText.trim(),
        options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
        correctOption: correctOpt,
        marks: parseFloat(qMarks) || 4.0,
        negativeMarks: parseFloat(qNegMarks) || 1.0,
        subject: qSubject.trim() || undefined,
        topic: qTopic.trim() || undefined,
        explanation: qExplanation.trim() || undefined,
      };

      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to save question');
      }

      // Refresh local quiz state with saved question
      const savedQ = data.data;
      setQuizzes((prev) =>
        prev.map((q) => {
          if (q.id !== activeQuizForQuestion.id) return q;
          const exists = q.questions.some((item) => item.id === savedQ.id);
          const updatedList = exists
            ? q.questions.map((item) => (item.id === savedQ.id ? savedQ : item))
            : [...q.questions, savedQ];
          return {
            ...q,
            questions: updatedList,
          };
        })
      );

      setIsQuestionModalOpen(false);
      setExpandedQuizId(activeQuizForQuestion.id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error saving question');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // Delete Question Handler
  const handleDeleteQuestion = async (quizId: number, questionId: number) => {
    if (!confirm('Are you sure you want to delete this question from the bank?')) return;

    try {
      const res = await fetch(`/api/admin/questions?id=${questionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setQuizzes((prev) =>
          prev.map((q) => {
            if (q.id !== quizId) return q;
            return {
              ...q,
              questions: q.questions.filter((item) => item.id !== questionId),
            };
          })
        );
        router.refresh();
      } else {
        alert(data.message || 'Failed to delete question');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting question');
    }
  };

  // Create Quiz Handler
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Quiz title is required.');
      return;
    }

    try {
      setIsCreatingQuiz(true);
      const payload = {
        title: newTitle.trim(),
        subject: newSubject.trim() || undefined,
        durationMinutes: parseInt(newDuration, 10) || 60,
        totalMarks: parseFloat(newTotalMarks) || 40.0,
        negativeMarks: parseFloat(newNegMarks) || 1.0,
        passingMarks: parseFloat(newPassingMarks) || 16.0,
        isFree: newIsFree,
        testSeriesId: newSeriesId ? parseInt(newSeriesId, 10) : null,
      };

      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to create quiz');
      }

      setQuizzes((prev) => [data.data, ...prev]);
      setIsNewQuizModalOpen(false);
      setNewTitle('');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error creating quiz');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-xs font-semibold text-[#e0a028] mb-2">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>NTA-Standard CBT Assessment Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Quizzes & CBT Builder
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Build computer-based test papers with +4/-1 negative marking, 4 options, and explanations.
          </p>
        </div>

        <button
          onClick={() => setIsNewQuizModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#f3c25b] hover:from-[#d09020] hover:to-[#e0a028] text-[#061432] font-bold text-sm shadow-lg shadow-[#e0a028]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Quiz</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">All Quizzes</p>
          <p className="text-2xl font-bold text-white mt-1">{totalQuizzes}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Series Attached</p>
          <p className="text-2xl font-bold text-[#e0a028] mt-1">{seriesCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Standalone CBTs</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{standaloneCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Total Questions Bank</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalQuestions}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* 4 Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#061432]/80 border border-white/10 overflow-x-auto">
          {[
            { id: 'all', label: 'All Quizzes' },
            { id: 'series', label: 'In a Series' },
            { id: 'standalone', label: 'Standalone' },
            { id: 'free', label: 'Free Quizzes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#e0a028] text-[#061432] shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1 sm:flex-none">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quizzes or subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#061432]/80 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#09214b]/30 p-12 text-center">
          <FileQuestion className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-white">No quizzes match this filter</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try switching tabs or creating a new CBT quiz.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => {
            const isExpanded = expandedQuizId === quiz.id;
            const qCount = quiz.questions?.length || 0;

            return (
              <div
                key={quiz.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/50 to-[#061432]/80 backdrop-blur-md overflow-hidden transition-all hover:border-white/20 shadow-lg"
              >
                {/* Quiz Header Item */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {quiz.subject && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-[#e0a028] text-[11px] font-bold">
                          {quiz.subject}
                        </span>
                      )}
                      {quiz.testSeries ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-semibold flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {quiz.testSeries.title}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-500/15 border border-slate-500/30 text-slate-400 text-[10px] font-semibold">
                          Standalone
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          quiz.isFree
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {quiz.isFree ? 'FREE EXAM' : 'PREMIUM'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {quiz.title}
                    </h3>

                    {/* Rule indicators */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Duration: <strong className="text-white">{quiz.durationMinutes} mins</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#e0a028]" />
                        Total: <strong className="text-white">{quiz.totalMarks} Marks</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono">
                        Rule: <span className="text-emerald-400 font-bold">+4</span> /{' '}
                        <span className="text-rose-400 font-bold">-{quiz.negativeMarks}</span>
                      </span>
                      <span className="text-slate-400">
                        Passing: <strong className="text-white">{quiz.passingMarks} Marks</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions & Question Count */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-slate-400 block">Question Bank</span>
                      <span className="text-base font-extrabold text-[#e0a028]">
                        {qCount} Questions
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openQuestionModal(quiz)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e0a028] hover:bg-[#d09020] text-[#061432] font-bold text-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add Question</span>
                      </button>

                      <button
                        onClick={() =>
                          setExpandedQuizId(isExpanded ? null : quiz.id)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide' : 'Review Bank'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Questions Bank Accordion */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-[#061432]/95 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileQuestion className="w-4 h-4 text-[#e0a028]" />
                        <span>
                          Questions in this Quiz ({quiz.questions?.length || 0})
                        </span>
                      </h4>
                      <button
                        onClick={() => openQuestionModal(quiz)}
                        className="text-xs text-[#e0a028] hover:underline font-semibold"
                      >
                        + Add new question (+4 / -1)
                      </button>
                    </div>

                    {qCount === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No questions in this quiz bank yet. Click &quot;Add Question&quot; to insert one.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {quiz.questions.map((q, idx) => {
                          let optionsList: string[] = [];
                          try {
                            optionsList = JSON.parse(q.options);
                          } catch {
                            optionsList = [q.options];
                          }

                          return (
                            <div
                              key={q.id}
                              className="rounded-xl border border-white/5 bg-[#09214b]/30 p-4 space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-md bg-[#e0a028]/15 text-[#e0a028] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    Q{idx + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {q.questionText}
                                    </p>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                                      {q.subject && <span>Subject: {q.subject}</span>}
                                      {q.topic && <span>Topic: {q.topic}</span>}
                                      <span className="text-emerald-400 font-semibold font-mono">
                                        +{q.marks} / -{q.negativeMarks} Marks
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => openQuestionModal(quiz, q)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#e0a028] hover:bg-white/5 transition-colors"
                                    title="Edit Question"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(quiz.id, q.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* 4 Options Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                                {optionsList.map((opt, oIdx) => {
                                  const isCorrect = oIdx === q.correctOption;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2 border ${
                                        isCorrect
                                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold'
                                          : 'bg-black/20 border-white/5 text-slate-300'
                                      }`}
                                    >
                                      <span
                                        className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                                          isCorrect
                                            ? 'bg-emerald-500 text-[#061432]'
                                            : 'bg-white/10 text-slate-400'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className="truncate">{opt}</span>
                                      {isCorrect && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation */}
                              {q.explanation && (
                                <div className="ml-8 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                                  <span className="font-bold text-[#e0a028] mr-1">
                                    Explanation:
                                  </span>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CBT Question Editor Modal */}
      {isQuestionModalOpen && activeQuizForQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#09214b] border border-white/15 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsQuestionModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-[11px] font-bold text-[#e0a028] mb-1">
                <span>{editingQuestion ? 'Edit Question' : 'Add Question'}</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {activeQuizForQuestion.title}
              </h3>
              <p className="text-xs text-slate-400">
                Configure question statement, 4 choices, NTA marking rule, and solution explanation.
              </p>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Question Statement */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Question Statement *
                </label>
                <textarea
                  rows={3}
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="e.g. Which organelle is known as the powerhouse of the cell?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  4 Options & Correct Answer Key *
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Select the radio button next to the correct answer.
                </p>

                {[
                  { key: 'A', value: optA, setter: setOptA, idx: 0 },
                  { key: 'B', value: optB, setter: setOptB, idx: 1 },
                  { key: 'C', value: optC, setter: setOptC, idx: 2 },
                  { key: 'D', value: optD, setter: setOptD, idx: 3 },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 p-2 rounded-xl border ${
                      correctOpt === item.idx
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-[#061432] border-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOpt === item.idx}
                      onChange={() => setCorrectOpt(item.idx)}
                      className="w-4 h-4 text-emerald-400 focus:ring-emerald-400"
                    />
                    <span className="w-5 text-xs font-bold text-white shrink-0">
                      {item.key}.
                    </span>
                    <input
                      type="text"
                      required
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      placeholder={`Option ${item.key} text`}
                      className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
                    />
                  </div>
                ))}
              </div>

              {/* Marking & Subject */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Positive Marks
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={qMarks}
                    onChange={(e) => setQMarks(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={qNegMarks}
                    onChange={(e) => setQNegMarks(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={qSubject}
                    onChange={(e) => setQSubject(e.target.value)}
                    placeholder="e.g. Biology"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    placeholder="e.g. Cytology"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              {/* Detailed Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Detailed Explanation / Solution
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explain why the chosen option is correct for the student review report..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="px-6 py-2 rounded-xl bg-[#e0a028] hover:bg-[#d09020] text-[#061432] font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
                >
                  {isSavingQuestion ? 'Saving...' : 'Save Question to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Quiz Modal */}
      {isNewQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#09214b] border border-white/15 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsNewQuizModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-[11px] font-bold text-[#e0a028] mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Create Assessment</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                New CBT Quiz Paper
              </h3>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. All India NEET Mock Test 03"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Full Syllabus"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="60"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={newTotalMarks}
                    onChange={(e) => setNewTotalMarks(e.target.value)}
                    placeholder="40"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Negative Mark
                  </label>
                  <input
                    type="number"
                    value={newNegMarks}
                    onChange={(e) => setNewNegMarks(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    value={newPassingMarks}
                    onChange={(e) => setNewPassingMarks(e.target.value)}
                    placeholder="16"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Attach to Test Series Package
                </label>
                <select
                  value={newSeriesId}
                  onChange={(e) => setNewSeriesId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#061432] border border-white/10 text-white text-xs focus:outline-none focus:border-[#e0a028]"
                >
                  <option value="">None (Standalone Quiz)</option>
                  {testSeriesList.map((ts) => (
                    <option key={ts.id} value={ts.id.toString()}>
                      {ts.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFreeQuiz"
                  checked={newIsFree}
                  onChange={(e) => setNewIsFree(e.target.checked)}
                  className="w-4 h-4 rounded text-[#e0a028] focus:ring-[#e0a028] bg-[#061432] border-white/20"
                />
                <label htmlFor="isFreeQuiz" className="text-xs text-emerald-400 font-semibold cursor-pointer">
                  Mark as 100% Free Demo Quiz for all mobile users
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewQuizModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingQuiz}
                  className="px-6 py-2 rounded-xl bg-[#e0a028] hover:bg-[#d09020] text-[#061432] font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
                >
                  {isCreatingQuiz ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

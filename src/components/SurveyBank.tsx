import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Question } from '../types/game';
import { DEFAULT_QUESTIONS } from '../data/defaultSurveys';
import { parseSurveyCSV, SAMPLE_SURVEY_CSV } from '../utils/csvParser';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Search,
  Check,
  FolderOpen,
  Trash2,
  AlertCircle,
  FileText,
  Sparkles,
  RefreshCw,
  Shuffle
} from 'lucide-react';

const STORAGE_KEY = 'ff_survey_bank_questions_v2';

export function SurveyBank() {
  const { loadQuestion, currentQuestion } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize questions from localStorage or default set
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.error('Error loading stored survey bank:', err);
      }
    }
    return DEFAULT_QUESTIONS;
  });

  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Save to localStorage whenever questions change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (err) {
      console.error('Failed to save questions to localStorage:', err);
    }
  }, [questions]);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        processCSVText(text, file.name);
      }
    };
    reader.onerror = () => {
      setFeedback({ type: 'error', message: 'Failed to read file from disk.' });
    };
    reader.readAsText(file);
  };

  const processCSVText = (rawText: string, sourceName?: string) => {
    const result = parseSurveyCSV(rawText);
    if (!result.success || result.questions.length === 0) {
      setFeedback({
        type: 'error',
        message: result.errors[0] || 'Unable to parse CSV. Please check column format.',
      });
      return;
    }

    // Merge new questions into current bank (avoid duplicates by text)
    const existingTexts = new Set(questions.map((q) => q.text.toLowerCase().trim()));
    const newItems = result.questions.filter((q) => !existingTexts.has(q.text.toLowerCase().trim()));
    const updated = [...newItems, ...questions];

    setQuestions(updated);
    setFeedback({
      type: 'success',
      message: `Loaded ${result.totalQuestions} question(s) with ${result.totalAnswers} answers from ${sourceName || 'CSV'}!`,
    });

    // Auto-load the first question if no question currently active
    if (!currentQuestion && result.questions.length > 0) {
      loadQuestion({
        ...result.questions[0],
        answers: result.questions[0].answers.map((a) => ({ ...a, revealed: false })),
      });
    }

    // Reset paste modal
    setShowPasteModal(false);
    setPasteText('');

    setTimeout(() => setFeedback(null), 6000);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_SURVEY_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'family_feud_survey_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectQuestion = (q: Question) => {
    const fresh: Question = {
      ...q,
      answers: q.answers.map((a) => ({ ...a, revealed: false })),
    };
    loadQuestion(fresh);
    setFeedback({
      type: 'success',
      message: `Active on Stage: "${q.text}" (${q.answers.length} answers)`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((item) => item.id !== qId));
    setFeedback({ type: 'success', message: 'Question removed from Survey Bank.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRandomizeQuestion = () => {
    if (questions.length === 0) return;
    const candidates =
      questions.length > 1 && currentQuestion
        ? questions.filter((q) => q.text !== currentQuestion.text)
        : questions;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[randomIndex];
    handleSelectQuestion(chosen);
    setFeedback({
      type: 'success',
      message: `🎲 Shuffled & Loaded random question: "${chosen.text}" onto Stage!`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset Survey Bank back to original default questions?')) {
      setQuestions(DEFAULT_QUESTIONS);
      localStorage.removeItem(STORAGE_KEY);
      setFeedback({ type: 'success', message: 'Survey Bank restored to original defaults.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filtered = questions.filter(
    (q) =>
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.surveyId.toLowerCase().includes(search.toLowerCase()) ||
      q.answers.some((a) => a.text.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <section className="bg-[#171b29] border border-[#252a38] rounded-xl p-5 shadow-lg space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#252a38]">
        <div className="flex items-center space-x-2.5">
          <FolderOpen className="w-5 h-5 text-[#ffb800]" />
          <div>
            <h2 className="font-bebas text-xl md:text-2xl text-[#ffdca1] tracking-wider leading-none">
              SURVEY BANK & CSV REPOSITORY
            </h2>
            <div className="text-[11px] font-mono-score text-[#9e8f78] mt-0.5">
              FEED CSV WITH HEADERS: <span className="text-[#00e3fd] font-bold">Question ID,Question,Rank,Answer,Points</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shuffle / Randomize Button */}
          <button
            onClick={handleRandomizeQuestion}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#252a38] hover:bg-[#343948] text-[#ffdca1] text-xs font-bold border border-[#ffb800]/50 shadow-md transition-all active:scale-95 hover:border-[#ffb800]"
            title="Pick and load a random survey question onto Stage"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#ffb800]" />
            <span>🎲 Randomize / Shuffle to Stage</span>
          </button>

          <button
            onClick={handleDownloadSample}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold border border-[#514532] transition-colors"
            title="Download CSV sample file"
          >
            <Download className="w-3.5 h-3.5 text-[#ffb800]" />
            <span className="hidden sm:inline">CSV Template</span>
          </button>

          <button
            onClick={() => setShowPasteModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold border border-[#514532] transition-colors"
            title="Paste CSV text directly"
          >
            <FileText className="w-3.5 h-3.5 text-[#00e3fd]" />
            <span>Paste CSV</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#ffb800] hover:bg-[#ffc633] text-black text-xs font-bold uppercase transition-colors shadow-md"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Alert / Feedback message */}
      {feedback && (
        <div
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-[#00e3fd]/15 border border-[#00e3fd]/40 text-[#bdf4ff]'
              : 'bg-[#93000a]/20 border border-[#ef4444]/60 text-[#ffb4ab]'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-[#00e3fd]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#ef4444]" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Drag & Drop File Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileUpload(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${
          isDragging
            ? 'border-[#ffb800] bg-[#ffb800]/10 scale-[1.01]'
            : 'border-[#303443] hover:border-[#ffb800]/60 bg-[#0e1320]/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-1">
          <FileSpreadsheet className="w-6 h-6 text-[#ffb800]" />
          <div className="text-xs font-semibold text-[#dee2f5]">
            Drag & Drop your <span className="text-[#ffdca1] font-bold">.CSV file</span> here or click to browse
          </div>
          <div className="text-[10px] font-mono-score text-[#9e8f78]">
            CSV format: <span className="text-[#00e3fd]">Question ID, Question, Rank, Answer, Points</span> (Supports up to 8 answers per question)
          </div>
        </div>
      </div>

      {/* Search and Counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9e8f78]" />
          <input
            type="text"
            placeholder="Search survey questions or answers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0e1320] border border-[#303443] rounded-lg pl-9 pr-4 py-2 text-xs text-[#dee2f5] focus:outline-none focus:border-[#ffb800]"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono-score text-[#9e8f78]">
          <span>
            BANK CONTAINS: <strong className="text-[#ffdca1]">{questions.length} QUESTIONS</strong>
          </span>
          <button
            onClick={handleResetToDefaults}
            className="text-[11px] text-[#9e8f78] hover:text-[#dee2f5] underline flex items-center space-x-1"
            title="Restore original sample questions"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restore Defaults</span>
          </button>
        </div>
      </div>

      {/* Surveys List */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-[#0e1320] rounded-xl border border-[#252a38] text-[#9e8f78]">
            <p className="text-sm font-semibold">No survey questions match your search.</p>
            <p className="text-xs mt-1">Upload a CSV or reset to defaults above.</p>
          </div>
        ) : (
          filtered.map((q) => {
            const isCurrentlyActive = currentQuestion?.text === q.text;
            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrentlyActive
                    ? 'bg-[#1b1f2d] border-[#00e3fd] shadow-[0_0_15px_rgba(0,227,253,0.15)]'
                    : 'bg-[#0e1320] border-[#252a38] hover:border-[#ffb800]/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
                    <span className="text-[11px] font-mono-score font-bold bg-[#171b29] text-[#ffdca1] px-2 py-0.5 rounded border border-[#303443]">
                      {q.surveyId}
                    </span>
                    <h3 className="font-bebas text-lg md:text-xl text-[#ffffff] tracking-wide">
                      {q.text}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSelectQuestion(q)}
                      disabled={isCurrentlyActive}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                        isCurrentlyActive
                          ? 'bg-[#00e3fd]/20 text-[#00e3fd] border border-[#00e3fd]/40 cursor-default'
                          : 'bg-[#ffb800] hover:bg-[#ffc633] text-black shadow-md active:scale-95'
                      }`}
                    >
                      {isCurrentlyActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ACTIVE ON STAGE</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-black" />
                          <span>⚡ LOAD ONTO STAGE</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-[#171b29] hover:bg-[#93000a]/40 text-[#9e8f78] hover:text-[#ffdad6] border border-[#303443] hover:border-[#ef4444]/60 transition-colors"
                      title="Delete this question from Survey Bank"
                    >
                      <Trash2 className="w-4 h-4 text-[#ef4444]" />
                    </button>
                  </div>
                </div>

                {/* Answers preview grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-[#252a38] text-xs font-mono-score">
                  {q.answers.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between bg-[#171b29] px-2.5 py-1 rounded border border-[#303443]/80"
                    >
                      <span className="text-[#dee2f5] truncate font-bebas text-sm">
                        {a.rank}. {a.text}
                      </span>
                      <span className="text-[#ffb800] font-bold ml-1.5 text-xs">{a.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paste CSV Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171b29] border border-[#ffb800]/60 rounded-2xl w-full max-w-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#252a38] pb-3">
              <div>
                <h3 className="font-bebas text-xl text-[#ffdca1] tracking-wider">
                  PASTE RAW CSV DATA
                </h3>
                <div className="text-xs text-[#9e8f78]">
                  Expected columns: Question ID, Question, Rank, Answer, Points
                </div>
              </div>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-[#9e8f78] hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={10}
              placeholder={`Question ID,Question,Rank,Answer,Points\n1,NAME A COMMON PET,1,DOG,45\n1,NAME A COMMON PET,2,CAT,35\n1,NAME A COMMON PET,3,FISH,12`}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full bg-[#0e1320] border border-[#303443] rounded-lg p-3 font-mono-score text-xs text-[#dee2f5] focus:outline-none focus:border-[#ffb800]"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={() => setPasteText(SAMPLE_SURVEY_CSV)}
                className="text-xs text-[#00e3fd] hover:underline"
              >
                Fill with Sample CSV
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#252a38] hover:bg-[#343948] text-xs font-semibold text-[#dee2f5]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => processCSVText(pasteText, 'Pasted Text')}
                  disabled={!pasteText.trim()}
                  className="px-4 py-2 rounded-lg bg-[#ffb800] hover:bg-[#ffc633] text-black text-xs font-bold uppercase disabled:opacity-50"
                >
                  Parse & Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

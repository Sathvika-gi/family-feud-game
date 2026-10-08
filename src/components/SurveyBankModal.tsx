import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { DEFAULT_QUESTIONS } from '../data/defaultSurveys';
import { Question } from '../types/game';
import { X, Search, Check, Plus, FolderOpen } from 'lucide-react';

interface SurveyBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurveyBankModal({ isOpen, onClose }: SurveyBankModalProps) {
  const { loadQuestion, currentQuestion } = useGame();
  const [search, setSearch] = useState('');
  const [customQuestions, setCustomQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');

  if (!isOpen) return null;

  const filtered = customQuestions.filter((q) =>
    q.text.toLowerCase().includes(search.toLowerCase()) ||
    q.answers.some((a) => a.text.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelectQuestion = (q: Question) => {
    // Clone fresh question with all answers hidden initially
    const cloned: Question = {
      ...q,
      answers: q.answers.map((a) => ({ ...a, revealed: false })),
    };
    loadQuestion(cloned);
    onClose();
  };

  const handleCreateCustom = () => {
    if (!newQuestionText.trim()) return;
    const newQ: Question = {
      id: `custom-${Date.now()}`,
      surveyId: `#${Math.floor(100 + Math.random() * 900)}`,
      text: newQuestionText.trim().toUpperCase(),
      totalRespondents: 100,
      answers: [
        { id: `c-1-${Date.now()}`, rank: 1, text: 'TOP ANSWER', points: 40, revealed: false },
        { id: `c-2-${Date.now()}`, rank: 2, text: 'SECOND ANSWER', points: 25, revealed: false },
        { id: `c-3-${Date.now()}`, rank: 3, text: 'THIRD ANSWER', points: 15, revealed: false },
        { id: `c-4-${Date.now()}`, rank: 4, text: 'FOURTH ANSWER', points: 10, revealed: false },
        { id: `c-5-${Date.now()}`, rank: 5, text: 'FIFTH ANSWER', points: 5, revealed: false },
        { id: `c-6-${Date.now()}`, rank: 6, text: 'SIXTH ANSWER', points: 3, revealed: false },
        { id: `c-7-${Date.now()}`, rank: 7, text: 'SEVENTH ANSWER', points: 1, revealed: false },
        { id: `c-8-${Date.now()}`, rank: 8, text: 'EIGHTH ANSWER', points: 1, revealed: false },
      ],
    };
    setCustomQuestions([newQ, ...customQuestions]);
    loadQuestion(newQ);
    setNewQuestionText('');
    setIsCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171b29] border border-[#ffb800]/50 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-[#252a38] flex items-center justify-between bg-[#0e1320]">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-[#ffb800]" />
            <h2 className="font-bebas text-2xl text-[#ffdca1] tracking-wider">
              SURVEY BANK REPOSITORY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9e8f78] hover:text-white hover:bg-[#252a38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-[#252a38] flex flex-wrap items-center justify-between gap-3 bg-[#171b29]">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#9e8f78]" />
            <input
              type="text"
              placeholder="Search survey questions or answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0e1320] border border-[#303443] rounded-lg pl-9 pr-4 py-2 text-xs text-[#dee2f5] focus:outline-none focus:border-[#ffb800]"
            />
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#252a38] hover:bg-[#343948] text-[#ffdca1] text-xs font-semibold border border-[#514532]"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Cancel Custom' : 'Create Custom Question'}</span>
          </button>
        </div>

        {/* Custom Question Creator Drawer */}
        {isCreating && (
          <div className="p-4 bg-[#0e1320] border-b border-[#303443] space-y-3">
            <label className="text-xs uppercase font-bold text-[#ffdca1] block">
              NEW SURVEY PROMPT
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. NAME SOMETHING PEOPLE ALWAYS LOSE IN THE HOUSE..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="flex-1 bg-[#171b29] border border-[#ffb800]/50 rounded-lg px-3 py-2 text-xs font-bebas text-white focus:outline-none"
              />
              <button
                onClick={handleCreateCustom}
                className="px-4 py-2 rounded-lg bg-[#ffb800] hover:bg-[#ffc633] text-black text-xs font-bold uppercase"
              >
                SAVE & LOAD
              </button>
            </div>
          </div>
        )}

        {/* Surveys List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filtered.map((q) => {
            const isCurrentlyActive = currentQuestion?.text === q.text;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentlyActive
                    ? 'bg-[#1b1f2d] border-[#00e3fd] shadow-[0_0_15px_rgba(0,227,253,0.15)]'
                    : 'bg-[#1b1f2d]/50 border-[#252a38] hover:border-[#ffb800]/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono-score font-bold text-[#9e8f78]">
                      {q.surveyId}
                    </span>
                    <h3 className="font-bebas text-xl text-[#ffdca1] tracking-wide">
                      {q.text}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleSelectQuestion(q)}
                    disabled={isCurrentlyActive}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                      isCurrentlyActive
                        ? 'bg-[#00e3fd]/20 text-[#00e3fd] cursor-default'
                        : 'bg-[#ffb800] hover:bg-[#ffc633] text-black shadow'
                    }`}
                  >
                    {isCurrentlyActive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>ACTIVE ON STAGE</span>
                      </>
                    ) : (
                      <span>LOAD INTO ROUND</span>
                    )}
                  </button>
                </div>

                {/* Answers preview grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#252a38]/80 text-xs font-mono-score">
                  {q.answers.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between bg-[#0e1320] px-2 py-1 rounded border border-[#303443]"
                    >
                      <span className="text-[#dee2f5] truncate font-bebas text-sm">
                        {a.rank}. {a.text}
                      </span>
                      <span className="text-[#ffb800] font-bold ml-1">{a.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

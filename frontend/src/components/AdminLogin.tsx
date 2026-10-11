import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, Tv, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStage: () => void;
}

export function AdminLogin({ onLoginSuccess, onBackToStage }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const envPasswordRaw = import.meta.env.VITE_ADMIN_PASSWORD;
  const allowedPasswords = (envPasswordRaw || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const trimmed = password.trim();

    if (allowedPasswords.length === 0) {
      setError('VITE_ADMIN_PASSWORD is not set in the environment (.env file).');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      return;
    }

    // Strictly match any configured password in the list
    if (allowedPasswords.includes(trimmed)) {
      try {
        sessionStorage.setItem('ff_admin_auth', 'true');
      } catch {
        // ignore storage errors
      }
      onLoginSuccess();
    } else {
      setError('Invalid Access Key. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleKeyPadClick = (digit: string) => {
    setError(null);
    if (digit === 'CLEAR') {
      setPassword('');
    } else {
      setPassword((prev) => prev + digit);
    }
  };

  return (
    <div className="min-h-screen bg-[#090e1b] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ffb800]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00e3fd]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Back to Stage */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 z-10">
        <button
          onClick={onBackToStage}
          className="flex items-center space-x-2 text-xs font-mono-score text-[#9e8f78] hover:text-[#ffdca1] transition-colors px-3 py-1.5 rounded-lg bg-[#171b29]/80 border border-[#252a38] hover:border-[#ffb800]/40 backdrop-blur-sm shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO STAGE</span>
        </button>

        <span className="text-[10px] font-mono-score uppercase tracking-widest text-[#00e3fd] bg-[#00e3fd]/10 px-2.5 py-1 rounded border border-[#00e3fd]/30">
          SECURE GATEWAY
        </span>
      </div>

      {/* Login Card */}
      <div
        className={`w-full max-w-md bg-[#171b29]/90 border border-[#252a38] rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 transition-transform ${isShaking ? 'animate-shake' : ''
          }`}
      >
        {/* Glow Accent Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0e1320] border-2 border-[#ffb800]/60 p-2 flex items-center justify-center shadow-[0_0_25px_rgba(255,184,0,0.3)] relative">
            <Lock className="w-8 h-8 text-[#ffb800]" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00e3fd] border-2 border-[#171b29] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-[10px] font-mono-score font-bold uppercase tracking-wider text-[#00e3fd] bg-[#00e3fd]/15 px-2 py-0.5 rounded border border-[#00e3fd]/30">
                CAMPUS LIFE
              </span>
              <span className="text-[10px] font-mono-score font-bold uppercase tracking-wider text-[#ffdca1] bg-[#ffb800]/20 px-2 py-0.5 rounded border border-[#ffb800]/30">
                POTPOURRI
              </span>
            </div>
            <h1 className="font-bebas text-3xl tracking-wider text-[#ffdca1] leading-tight">
              HOST CONTROL CONSOLE
            </h1>
            <p className="text-xs font-mono-score text-[#9e8f78] uppercase tracking-wide">
              AUTHORIZED OPERATOR CREDENTIAL REQUIRED
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[#93000a]/30 border border-[#ef4444]/60 text-[#ffdad6] text-xs flex items-center space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-score text-[#ffdca1] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#ffb800]" />
                <span>OPERATOR ACCESS KEY / PIN</span>
              </span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setError(null);
                  setPassword(e.target.value);
                }}
                placeholder="Enter Admin Access Key / PIN"
                autoFocus
                className="w-full bg-[#0e1320] border border-[#252a38] focus:border-[#ffb800] focus:ring-1 focus:ring-[#ffb800] rounded-xl px-4 py-3 text-base text-[#dee2f5] placeholder-[#514532] tracking-wider font-mono-score outline-none transition-all pr-12 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9e8f78] hover:text-[#ffdca1] transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick PIN Pad for touchscreens & live game setups */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPadClick(digit)}
                className="py-2.5 rounded-lg bg-[#0e1320] hover:bg-[#252a38] active:bg-[#ffb800]/20 border border-[#252a38] hover:border-[#ffb800]/40 text-[#dee2f5] hover:text-[#ffdca1] font-mono-score font-bold text-base transition-all shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeyPadClick('CLEAR')}
              className="py-2.5 rounded-lg bg-[#0e1320] hover:bg-[#93000a]/30 border border-[#252a38] hover:border-[#ef4444]/50 text-[#ef4444] font-mono-score font-bold text-xs uppercase transition-all"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleKeyPadClick('0')}
              className="py-2.5 rounded-lg bg-[#0e1320] hover:bg-[#252a38] active:bg-[#ffb800]/20 border border-[#252a38] hover:border-[#ffb800]/40 text-[#dee2f5] hover:text-[#ffdca1] font-mono-score font-bold text-base transition-all shadow-sm"
            >
              0
            </button>
            <button
              type="submit"
              className="py-2.5 rounded-lg bg-[#ffb800] hover:bg-[#ffc633] active:scale-95 text-black font-mono-score font-bold text-xs uppercase transition-all shadow-[0_0_15px_rgba(255,184,0,0.3)] flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OK</span>
            </button>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ffb800] via-[#ffdca1] to-[#ffb800] hover:from-[#ffc633] hover:to-[#ffdca1] text-black font-bebas text-xl tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,184,0,0.3)] flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-black" />
            <span>UNLOCK CONTROL ROOM</span>
          </button>
        </form>


      </div>
    </div>
  );
}

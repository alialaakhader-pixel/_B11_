import React, { useState, useEffect, useRef } from 'react';
import { GENERAL_TRIVIA, TriviaQuestion } from '../data/playersData';
import { sound } from '../services/soundEffects';
import { CountdownTimer } from './CountdownTimer';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface TriviaShowProps {
  onBackToHome: () => void;
  onOpenShare: (score?: number) => void;
}

export const TriviaShow: React.FC<TriviaShowProps> = ({ onBackToHome, onOpenShare }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQ: TriviaQuestion = GENERAL_TRIVIA[currentIdx] || GENERAL_TRIVIA[0];

  useEffect(() => {
    setTimeLeft(20);
    setSelectedOption(null);
    setIsAnswered(false);
    sound.playWhistle(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsAnswered(true);
          sound.playWrong();
          return 0;
        }
        const nextTime = prev - 1;
        sound.playAcceleratingTick(nextTime, 20);
        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx]);

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correctAnswer;
    if (isCorrect) {
      const points = 100 + timeLeft * 2;
      setScore((s) => s + points);
      sound.playCorrect();
      setTimeout(() => sound.playStadiumRoar(), 200);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      sound.playWrong();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIdx + 1 < GENERAL_TRIVIA.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      sound.playFanfare();
      confetti({ particleCount: 120, spread: 90 });
    }
  };

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between mb-4 bg-black/60 border border-white/10 px-4 py-2.5 rounded-2xl">
        <button
          onClick={onBackToHome}
          className="text-xs sm:text-sm text-gray-300 hover:text-lime-400 font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>القائمة</span>
        </button>

        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-black text-cyan-300">
            فوازير وأسئلة كرة القدم الكبرى
          </h2>
          <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
            {currentIdx + 1} / {GENERAL_TRIVIA.length}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-neutral-900 border border-amber-400/30 px-3 py-1 rounded-xl">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
            {score}
          </span>
        </div>
      </div>

      {!isCompleted ? (
        <div className="w-full max-w-xl flex flex-col items-center">
          {/* Category & Difficulty Tag */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-lime-300 border border-lime-500/30">
              {currentQ.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950/80 text-red-300 border border-red-500/30">
              مستوى: {currentQ.difficulty}
            </span>
          </div>

          {/* Question Card */}
          <div className="w-full bg-gradient-to-br from-neutral-900 to-neutral-950 border-2 border-cyan-500/30 rounded-3xl p-6 mb-4 shadow-[0_0_35px_rgba(6,182,212,0.15)] text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-lime-400 to-amber-400" />
            <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed mb-4">
              {currentQ.question}
            </h3>

            {/* Interactive Countdown Timer */}
            <div className="flex justify-center mt-3 pt-3 border-t border-white/10">
              <CountdownTimer timeLeft={timeLeft} totalTime={20} size="md" showLabel={true} />
            </div>
          </div>

          {/* Options Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correctAnswer;

              let btnClass =
                'bg-neutral-900/90 border-neutral-700/80 text-white hover:border-cyan-400 hover:bg-neutral-800';

              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950 border-emerald-400 text-emerald-200';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-red-950 border-red-500 text-red-200';
                } else {
                  btnClass = 'opacity-40 bg-neutral-950 border-neutral-800 text-gray-400';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border-2 font-bold text-sm text-center flex items-center justify-between transition cursor-pointer active:scale-95 shadow-md ${btnClass}`}
                >
                  <span className="flex-1 text-right">{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Next */}
          {isAnswered && (
            <div className="w-full p-4 rounded-2xl bg-black/70 border border-white/10 flex flex-col items-center text-center animate-slideUp">
              <p className="text-xs text-lime-300 mb-3 font-semibold">
                💡 {currentQ.explanation}
              </p>
              <button
                onClick={handleNext}
                className="py-3 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-lg"
              >
                <span>{currentIdx + 1 < GENERAL_TRIVIA.length ? 'السؤال التالي ⚡' : 'عرض النتيجة 🏆'}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-900 border-2 border-cyan-400/50 shadow-2xl flex flex-col items-center text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mb-3" />
          <h3 className="text-2xl font-black text-white mb-2">انتهت الفوازير!</h3>
          <p className="text-sm text-cyan-300 mb-4">لقد حققت: {score} نقطة في التحدي الكروي</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                setCurrentIdx(0);
                setScore(0);
                setIsCompleted(false);
              }}
              className="flex-1 py-3 rounded-xl bg-lime-400 text-black font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الفوازير</span>
            </button>
            <button
              onClick={() => onOpenShare(score)}
              className="flex-1 py-3 rounded-xl bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>مشاركة النتيجة</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

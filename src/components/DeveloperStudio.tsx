import React, { useState } from 'react';
import { FootballPlayer, TriviaQuestion } from '../data/playersData';
import {
  getAllPlayers,
  getAllTrivia,
  saveCustomPlayer,
  deleteCustomPlayer,
  saveCustomTrivia,
  deleteCustomTrivia,
} from '../services/storage';
import { isOwner, OWNER_EMAIL, getCurrentUser } from '../services/authService';
import { sound } from '../services/soundEffects';
import {
  Code,
  Plus,
  Eye,
  HelpCircle,
  Trash2,
  Check,
  ArrowRight,
  Sparkles,
  Sliders,
  Image,
  RefreshCw,
  Download,
  Upload,
  Lock,
  Mail,
  Crown,
} from 'lucide-react';

interface DeveloperStudioProps {
  onBackToHome: () => void;
  onDataChanged: () => void;
  onOpenGmailAuth?: () => void;
}

export const DeveloperStudio: React.FC<DeveloperStudioProps> = ({
  onBackToHome,
  onDataChanged,
  onOpenGmailAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'add_player' | 'add_trivia' | 'manage'>('add_player');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentUser = getCurrentUser();
  const userIsOwner = isOwner();

  // If not owner, display security lock screen
  if (!userIsOwner) {
    return (
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-8 flex flex-col items-center text-center animate-fadeIn">
        <div className="w-full bg-neutral-900 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-4 mx-auto shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            <Lock className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black text-amber-300 mb-2">
            وضع المالك محمي ومقفل 🔒
          </h3>

          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            عذراً! صلاحيات إضافة صور اللاعبين والأسئلة مخصصة حصرياً لمالك اللعبة المعتمد.
          </p>

          <div className="p-3 bg-black/60 border border-amber-400/40 rounded-2xl mb-5 text-xs font-bold text-amber-300 flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>حساب المالك المعتمد فقط 👑</span>
          </div>

          {currentUser ? (
            <p className="text-xs text-gray-400 mb-5">
              أنت مسجل حالياً بالاسم: <span className="text-white font-bold">{currentUser.name}</span> (ليس حساب المالك).
            </p>
          ) : (
            <p className="text-xs text-gray-400 mb-5">
              إذا كنت أنت المالك، يرجى تسجيل الدخول عبر بريد الجيميل الخاص بك لتأكيد الهوية.
            </p>
          )}

          <div className="flex flex-col gap-2.5 w-full">
            {onOpenGmailAuth && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenGmailAuth();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-lime-400 hover:opacity-95 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-md active:scale-95"
              >
                <Mail className="w-4 h-4" />
                <span>تسجيل الدخول بحساب المالك 👑</span>
              </button>
            )}

            <button
              onClick={onBackToHome}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs font-bold transition cursor-pointer"
            >
              العودة للقائمة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  // New Player Form State
  const [playerName, setPlayerName] = useState('');
  const [playerEngName, setPlayerEngName] = useState('');
  const [playerNickname, setPlayerNickname] = useState('');
  const [playerNationality, setPlayerNationality] = useState('');
  const [playerFlag, setPlayerFlag] = useState('⚽');
  const [playerClub, setPlayerClub] = useState('');
  const [playerHistoricClubs, setPlayerHistoricClubs] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');
  const [playerTrophies, setPlayerTrophies] = useState('');
  const [playerHint, setPlayerHint] = useState('');
  const [playerDistinctEyes, setPlayerDistinctEyes] = useState('');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
  );
  const [eyeX, setEyeX] = useState(50);
  const [eyeY, setEyeY] = useState(33);
  const [eyeZoom, setEyeZoom] = useState(3.4);
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');

  // New Question Form State
  const [qText, setQText] = useState('');
  const [qCategory, setQCategory] = useState<'كأس العالم' | 'دوري الأبطال' | 'أرقام قياسية' | 'أساطير' | 'انتقالات وتاريخ'>('كأس العالم');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');
  const [qCorrect, setQCorrect] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'سهل' | 'متوسط' | 'صعب' | 'ناري'>('متوسط');

  const flashMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setEyeX(x);
    setEyeY(y);
    sound.playClick();
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !playerPhotoUrl) return;

    const newPlayer: FootballPlayer = {
      id: 'custom-' + Date.now(),
      name: playerName.trim(),
      englishName: playerEngName.trim() || playerName.trim(),
      nickname: playerNickname.trim() || 'النجم الكروي',
      nationality: playerNationality.trim() || 'عالمي',
      flag: playerFlag || '⚽',
      currentClub: playerClub.trim() || 'نادٍ عالمي',
      historicClubs: playerHistoricClubs ? playerHistoricClubs.split(',').map((c) => c.trim()) : [],
      position: playerPosition.trim() || 'لاعب مميز',
      shirtNumber: 10,
      trophies: playerTrophies.trim() || 'بطولات كروية كبرى',
      triviaHint: playerHint.trim() || 'لاعب أسطوري في سماء كرة القدم',
      distinctEyeFeature: playerDistinctEyes.trim() || 'نظرة ثاقبة مميزة',
      photoUrl: playerPhotoUrl.trim(),
      eyeFocus: {
        xPercent: eyeX,
        yPercent: eyeY,
        zoom: eyeZoom,
      },
      options: [
        playerName.trim(),
        opt2.trim() || 'كريستيانو رونالدو',
        opt3.trim() || 'ليونيل ميسي',
        opt4.trim() || 'محمد صلاح',
      ].sort(() => Math.random() - 0.5),
    };

    saveCustomPlayer(newPlayer);
    sound.playCorrect();
    flashMessage(`تمت إضافة اللاعب "${playerName}" بنجاح إلى فقرة العيون! 🎯`);
    onDataChanged();

    // Reset fields
    setPlayerName('');
    setPlayerEngName('');
    setPlayerNickname('');
    setOpt2('');
    setOpt3('');
    setOpt4('');
  };

  const handleSaveTrivia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !qOpt1) return;

    const newQuestion: TriviaQuestion = {
      id: 'custom-q-' + Date.now(),
      question: qText.trim(),
      category: qCategory,
      options: [qOpt1.trim(), qOpt2.trim(), qOpt3.trim(), qOpt4.trim()].filter(Boolean),
      correctAnswer: (qCorrect || qOpt1).trim(),
      explanation: qExplanation.trim() || 'معلومة كروية صحيحة.',
      difficulty: qDifficulty,
    };

    saveCustomTrivia(newQuestion);
    sound.playCorrect();
    flashMessage('تمت إضافة السؤال بنجاح إلى الفوازير! ⚽');
    onDataChanged();

    setQText('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQOpt4('');
    setQExplanation('');
  };

  const allCurrentPlayers = getAllPlayers();
  const allCurrentTrivia = getAllTrivia();

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center animate-fadeIn">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-black/70 border border-lime-400/30 px-4 py-2.5 rounded-2xl shadow-xl">
        <button
          onClick={onBackToHome}
          className="text-xs sm:text-sm text-gray-300 hover:text-lime-400 font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>القائمة الرئيسية</span>
        </button>

        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-lime-400" />
          <h2 className="text-sm sm:text-base font-black text-lime-400">
            وضع التطوير والاستوديو (لوحة المالك)
          </h2>
        </div>

        <span className="text-xs bg-lime-950 text-lime-300 font-mono px-2 py-0.5 rounded border border-lime-500/30">
          OWNER MODE
        </span>
      </div>

      {/* Success / Alert Banner */}
      {statusMessage && (
        <div className="w-full max-w-2xl mb-4 p-3 bg-emerald-950/90 border border-emerald-400 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-slideUp">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Studio Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-neutral-900/90 rounded-2xl border border-white/10">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('add_player');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'add_player'
              ? 'bg-lime-400 text-black shadow-md'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>إضافة وجه لاعب وعيون جديدة</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('add_trivia');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'add_trivia'
              ? 'bg-cyan-400 text-black shadow-md'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>إضافة فوازير وأسئلة</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('manage');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'manage'
              ? 'bg-amber-400 text-black shadow-md'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>إدارة اللاعبين والأسئلة ({allCurrentPlayers.length})</span>
        </button>
      </div>

      {/* Tab 1: Add Player */}
      {activeTab === 'add_player' && (
        <form
          onSubmit={handleSavePlayer}
          className="w-full max-w-2xl bg-neutral-900/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <h3 className="text-sm font-black text-white">بيانات اللاعب والصورة الحقيقية</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                اسم اللاعب (بالعربية) *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: لوكا مودريتش"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setOpt1(e.target.value);
                }}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                اللقب الشهير
              </label>
              <input
                type="text"
                placeholder="مثال: الموسيقار / الصاروخ"
                value={playerNickname}
                onChange={(e) => setPlayerNickname(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الدولة والمنتخب</label>
              <input
                type="text"
                placeholder="مثال: البرازيل أو مصر"
                value={playerNationality}
                onChange={(e) => setPlayerNationality(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">علم الدولة (إيموجي)</label>
              <input
                type="text"
                placeholder="مثال: 🇧🇷 أو 🇪🇬 أو 🇵🇹"
                value={playerFlag}
                onChange={(e) => setPlayerFlag(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">النادي الحالي</label>
              <input
                type="text"
                placeholder="مثال: ريال مدريد"
                value={playerClub}
                onChange={(e) => setPlayerClub(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">أندية سابقة بارزة</label>
              <input
                type="text"
                placeholder="مفصولة بفواصل: يوفنتوس، مانشستر"
                value={playerHistoricClubs}
                onChange={(e) => setPlayerHistoricClubs(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-400 outline-none"
              />
            </div>
          </div>

          {/* Photo URL & Live Eye Cropper Tool */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-xs font-bold text-gray-300 mb-1">
              رابط صورة اللاعب الحقيقية (URL) *
            </label>
            <input
              type="url"
              required
              value={playerPhotoUrl}
              onChange={(e) => setPlayerPhotoUrl(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-lime-300 font-mono focus:border-lime-400 outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              💡 اضغط على الصورة أدناه لتحديد نقطة ارتكاز العينين بالضبط (Crosshair)!
            </p>
          </div>

          {/* Interactive Image Crosshair Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <span className="text-[11px] font-bold text-gray-400 block mb-1">
                حدد مركز العينين بالضغط على الصورة:
              </span>
              <div
                onClick={handleImageClick}
                className="relative h-44 rounded-2xl overflow-hidden border-2 border-dashed border-lime-400/50 cursor-crosshair group"
              >
                <img
                  src={playerPhotoUrl}
                  alt="معاينة"
                  className="w-full h-full object-cover pointer-events-none"
                />
                {/* Target Reticle at eyeX, eyeY */}
                <div
                  className="absolute w-6 h-6 border-2 border-lime-400 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_10px_#cbfb63]"
                  style={{ left: `${eyeX}%`, top: `${eyeY}%` }}
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Live Eye Crop Preview */}
            <div>
              <span className="text-[11px] font-bold text-lime-400 block mb-1">
                معاينة فقرة العيون كما ستظهر للاعبين:
              </span>
              <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-lime-400 bg-black flex items-center justify-center">
                <img
                  src={playerPhotoUrl}
                  alt="معاينة العيون"
                  className="w-full h-full object-cover pointer-events-none"
                  style={{
                    transform: `scale(${eyeZoom}) translateY(${(50 - eyeY) * 2}%)`,
                    transformOrigin: `${eyeX}% ${eyeY}%`,
                  }}
                />
                <span className="absolute bottom-1 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-lime-400 font-mono">
                  X: {eyeX}% | Y: {eyeY}% | Zoom: {eyeZoom}x
                </span>
              </div>
            </div>
          </div>

          {/* Eye Zoom Slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-300 font-bold mb-1">
              <span>نسبة تكبير العينين (Zoom):</span>
              <span className="text-lime-400 font-mono">{eyeZoom}x</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="5.0"
              step="0.1"
              value={eyeZoom}
              onChange={(e) => setEyeZoom(parseFloat(e.target.value))}
              className="w-full accent-lime-400"
            />
          </div>

          {/* 3 Distractor Options */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              خيارات إجابة مضللة (3 لاعبين آخرين):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="منافس 1"
                value={opt2}
                onChange={(e) => setOpt2(e.target.value)}
                className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-400"
              />
              <input
                type="text"
                placeholder="منافس 2"
                value={opt3}
                onChange={(e) => setOpt3(e.target.value)}
                className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-400"
              />
              <input
                type="text"
                placeholder="منافس 3"
                value={opt4}
                onChange={(e) => setOpt4(e.target.value)}
                className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>حفظ ونشر اللاعب في اللعبة فوراً ⚡</span>
          </button>
        </form>
      )}

      {/* Tab 2: Add Trivia */}
      {activeTab === 'add_trivia' && (
        <form
          onSubmit={handleSaveTrivia}
          className="w-full max-w-2xl bg-neutral-900/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black text-white">إضافة سؤال فوازير كروي جديد</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">نص السؤال *</label>
            <textarea
              required
              rows={2}
              placeholder="مثال: من هو اللاعب الذي سجل أسرع هدف في تاريخ كأس العالم؟"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">القسم</label>
              <select
                value={qCategory}
                onChange={(e) => setQCategory(e.target.value as any)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
              >
                <option value="كأس العالم">كأس العالم</option>
                <option value="دوري الأبطال">دوري الأبطال</option>
                <option value="أرقام قياسية">أرقام قياسية</option>
                <option value="أساطير">أساطير</option>
                <option value="انتقالات وتاريخ">انتقالات وتاريخ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">المستوى</label>
              <select
                value={qDifficulty}
                onChange={(e) => setQDifficulty(e.target.value as any)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
              >
                <option value="سهل">سهل</option>
                <option value="متوسط">متوسط</option>
                <option value="صعب">صعب</option>
                <option value="ناري">ناري 🔥</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300">
              خيارات الإجابة (ضع الإجابة الصحيحة في الخيار 1):
            </label>
            <input
              type="text"
              required
              placeholder="الخيار 1 (الإجابة الصحيحة)"
              value={qOpt1}
              onChange={(e) => {
                setQOpt1(e.target.value);
                setQCorrect(e.target.value);
              }}
              className="w-full bg-black/60 border border-emerald-400/50 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:border-emerald-400 outline-none"
            />
            <input
              type="text"
              required
              placeholder="الخيار 2 (خاطئ)"
              value={qOpt2}
              onChange={(e) => setQOpt2(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <input
              type="text"
              placeholder="الخيار 3 (خاطئ)"
              value={qOpt3}
              onChange={(e) => setQOpt3(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <input
              type="text"
              placeholder="الخيار 4 (خاطئ)"
              value={qOpt4}
              onChange={(e) => setQOpt4(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              شرح المعلومة التوثيقية بعد الإجابة:
            </label>
            <input
              type="text"
              placeholder="مثال: هاكان شوكور سجل في ثانية 10.89 بمونديال 2002."
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ونشر السؤال في الفوازير ⚡</span>
          </button>
        </form>
      )}

      {/* Tab 3: Manage Content */}
      {activeTab === 'manage' && (
        <div className="w-full max-w-2xl bg-neutral-900/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
          <h3 className="text-sm font-black text-white mb-3">قائمة اللاعبين الحالية في اللعبة:</h3>
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {allCurrentPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-lime-400/40">
                    <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {player.flag} {player.name}
                    </span>
                    <span className="text-[10px] text-gray-400">{player.currentClub}</span>
                  </div>
                </div>

                {player.id.startsWith('custom-') && (
                  <button
                    onClick={() => {
                      deleteCustomPlayer(player.id);
                      onDataChanged();
                      sound.playClick();
                    }}
                    className="p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 transition cursor-pointer"
                    title="حذف اللاعب المضاف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { StadiumLights } from './components/StadiumLights';
import { EyesChallenge } from './components/EyesChallenge';
import { TwoPlayerBattle } from './components/TwoPlayerBattle';
import { TriviaShow } from './components/TriviaShow';
import { Leaderboard } from './components/Leaderboard';
import { DeveloperStudio } from './components/DeveloperStudio';
import { OnlineArena } from './components/OnlineArena';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ShareModal } from './components/ShareModal';
import { GmailAuthModal } from './components/GmailAuthModal';
import { getCurrentUser, isOwner, UserAccount, OWNER_EMAIL } from './services/authService';
import { EffectsControlBar } from './components/EffectsControlBar';
import { PLAYERS_LIST } from './data/playersData';
import { getAllPlayers } from './services/storage';
import { sound } from './services/soundEffects';
import {
  Eye,
  Trophy,
  Zap,
  HelpCircle,
  Share2,
  Sparkles,
  Flame,
  Users,
  Play,
  Globe,
  Code,
  Crown,
  Mail,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'eyes' | 'battle' | 'trivia' | 'leaderboard' | 'developer' | 'online'
  >('home');
  const [soundMuted, setSoundMuted] = useState(sound.getMuted());
  const [lightingMode, setLightingMode] = useState<'normal' | 'dramatic' | 'celebration'>('normal');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareScore, setShareScore] = useState<number | undefined>(undefined);
  const [shareTitle, setShareTitle] = useState<string | undefined>(undefined);
  const [initialPlayerId, setInitialPlayerId] = useState<string | undefined>(undefined);
  const [initialRoomCode, setInitialRoomCode] = useState<string | undefined>(undefined);
  const [pendingLeaderboardScore, setPendingLeaderboardScore] = useState<{
    score: number;
    mode: 'eyes' | 'trivia';
  } | undefined>(undefined);
  const [rosterKey, setRosterKey] = useState(0);

  // User Account & Owner Verification
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const [requiredOwnerNotice, setRequiredOwnerNotice] = useState(false);

  // Read URL query parameters on initial mount for direct link sharing!
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      const playerParam = params.get('player');
      const roomParam = params.get('room');

      if (roomParam) {
        setInitialRoomCode(roomParam);
        setActiveTab('online');
      } else if (playerParam) {
        setInitialPlayerId(playerParam);
        setActiveTab('eyes');
      } else if (modeParam === 'eyes') {
        setActiveTab('eyes');
      } else if (modeParam === 'battle') {
        setActiveTab('battle');
      } else if (modeParam === 'trivia') {
        setActiveTab('trivia');
      } else if (modeParam === 'leaderboard') {
        setActiveTab('leaderboard');
      } else if (modeParam === 'online') {
        setActiveTab('online');
      }
    } catch {
      // URL params fallback
    }
  }, []);

  const handleToggleSound = () => {
    const isMuted = sound.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) {
      sound.playClick();
    }
  };

  const handleOpenShare = (score?: number, title?: string) => {
    sound.playClick();
    setShareScore(score);
    setShareTitle(title);
    setShareModalOpen(true);
  };

  const startMode = (
    mode: 'eyes' | 'battle' | 'trivia' | 'leaderboard' | 'developer' | 'online',
    playerId?: string
  ) => {
    sound.playWhistle(true);
    if (playerId) setInitialPlayerId(playerId);
    setActiveTab(mode);
  };

  const activePlayers = getAllPlayers();

  return (
    <div className="relative min-h-screen bg-[#050907] text-white flex flex-col justify-between selection:bg-lime-400 selection:text-black overflow-x-hidden font-['Cairo',sans-serif]">
      {/* Stadium Arena Lighting Layer */}
      <StadiumLights intensity={lightingMode} activeLightBeam={true} />

      {/* Top Navigation & Controls */}
      <header className="relative z-20 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              sound.playClick();
              setActiveTab('home');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lime-500 to-emerald-400 p-0.5 shadow-[0_0_15px_rgba(203,251,99,0.4)] group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#07130c] rounded-[10px] flex items-center justify-center text-lime-400 font-black text-sm">
                B11
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white group-hover:text-lime-400 transition">
                  فوازير كورة B11
                </span>
                <span className="text-[10px] bg-red-600/90 text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  مباشر
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                تحدي ملامح وعيون الأساطير الحقيقية
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Online Arena Button */}
            <button
              onClick={() => startMode('online')}
              className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                activeTab === 'online'
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'bg-neutral-900 border-cyan-500/40 text-cyan-300 hover:bg-neutral-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>أونلاين 1 ضد 1</span>
            </button>

            {/* Leaderboard Button */}
            <button
              onClick={() => startMode('leaderboard')}
              className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-neutral-900 border-amber-400/40 text-amber-300 hover:bg-neutral-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">لوحة الصدارة</span>
              <span className="sm:hidden">الصدارة</span>
            </button>

            {/* Developer Mode Button (Restricted to alialaakhader@gmail.com) */}
            <button
              onClick={() => {
                if (!currentUser?.isOwner) {
                  sound.playWrong();
                  setRequiredOwnerNotice(true);
                  setGmailModalOpen(true);
                } else {
                  startMode('developer');
                }
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 ${
                currentUser?.isOwner
                  ? 'bg-amber-400 text-black border-amber-300 font-black shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                  : 'bg-neutral-900 border-white/10 text-gray-400 hover:text-white'
              }`}
              title={
                currentUser?.isOwner
                  ? 'وضع المالك مفتوح لك كمالك معتمد 👑'
                  : 'وضع المالك خاص وحصري لمالك اللعبة المعتمد 🔒'
              }
            >
              <Code className={`w-3.5 h-3.5 ${currentUser?.isOwner ? 'text-black' : 'text-amber-400'}`} />
              <span className="hidden md:inline">
                وضع المالك {currentUser?.isOwner ? '👑' : '🔒'}
              </span>
            </button>

            {/* Gmail Account Sync & Owner Login Button */}
            <button
              onClick={() => {
                sound.playClick();
                setRequiredOwnerNotice(false);
                setGmailModalOpen(true);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                currentUser?.isOwner
                  ? 'bg-neutral-900 border-amber-400 text-amber-300 shadow-md'
                  : currentUser
                  ? 'bg-neutral-900 border-lime-400/50 text-lime-300'
                  : 'bg-neutral-900 border-red-500/40 text-red-300 hover:border-red-400'
              }`}
              title={currentUser ? `حساب الجيميل: ${currentUser.email}` : 'إضافة بريد Gmail لحفظ النتائج'}
            >
              <Mail className="w-3.5 h-3.5" />
              {currentUser?.isOwner ? (
                <span className="hidden sm:inline font-black text-amber-300">المالك: علي 👑</span>
              ) : currentUser ? (
                <span className="hidden sm:inline truncate max-w-[100px]">{currentUser.name}</span>
              ) : (
                <span className="hidden sm:inline">إضافة Gmail 📧</span>
              )}
            </button>

            {/* PWA Download / Install App (Under Maintenance / Coming Soon) */}
            <PWAInstallButton variant="nav" />

            {/* Share Web Link */}
            <button
              onClick={() => handleOpenShare()}
              className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_20px_rgba(203,251,99,0.35)] transition cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مشاركة الرابط ⚡</span>
            </button>
          </div>
        </div>

        {/* Audio & Lighting Controls */}
        <EffectsControlBar
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
          lightingMode={lightingMode}
          onChangeLighting={setLightingMode}
        />
      </header>

      {/* Main Content View Router */}
      <main className="relative z-10 flex-1 flex flex-col justify-center py-4">
        {/* 1. HOME SCREEN */}
        {activeTab === 'home' && (
          <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center animate-fadeIn">
            {/* Studio Hero Banner */}
            <div className="text-center mt-2 mb-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-950/80 border border-lime-400/40 text-lime-300 text-xs font-bold mb-3 shadow-[0_0_15px_rgba(203,251,99,0.25)]">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>برنامج كروي متكامل مع اللعب الأونلاين ولوحة الصدارة ووضع المالك</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-white to-cyan-300 tracking-tight leading-tight mb-3">
                برنامج فوازير كورة B11
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                هل تمتلك نظرة كروية ثاقبة؟ خمن أسماء أساطير كرة القدم من خلال{' '}
                <span className="text-lime-400 font-bold underline decoration-lime-400 underline-offset-4">
                  ملامح وعيون وجوههم الحقيقية
                </span>
                ، وتحدَّ أصدقاءك في مواجهات أونلاين حية وتصدر قائمة الشرف!
              </p>
            </div>

            {/* Game Modes Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Card 1: The Main Real Eyes Challenge */}
              <div
                onClick={() => startMode('eyes')}
                className="relative group p-5 rounded-3xl bg-gradient-to-b from-neutral-900/90 via-emerald-950/40 to-neutral-900/90 border-2 border-lime-400/60 hover:border-lime-300 shadow-[0_0_35px_rgba(203,251,99,0.2)] hover:shadow-[0_0_50px_rgba(203,251,99,0.35)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-lime-400 to-emerald-400 text-black text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl shadow-md">
                  الأساسية 👁️
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-lime-400 mb-3 shadow-[0_0_20px_rgba(203,251,99,0.3)] group-hover:scale-110 transition">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-lime-300 transition mb-1.5">
                    تحدي عيون اللاعبين
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    تكبير دقيق لعيون النجوم مع كشاف فحص ضوئي تفاعلي و3 مستويات كشف متدرجة!
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-black text-lime-400">
                  <span>ابدأ التحدي</span>
                  <Play className="w-3.5 h-3.5 fill-current group-hover:translate-x-[-3px] transition" />
                </div>
              </div>

              {/* Card 2: Real-time Online 1v1 Battle */}
              <div
                onClick={() => startMode('online')}
                className="relative group p-5 rounded-3xl bg-gradient-to-b from-neutral-900/90 via-cyan-950/40 to-neutral-900/90 border-2 border-cyan-400/60 hover:border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.2)] hover:shadow-[0_0_50px_rgba(6,182,212,0.35)] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-400 to-sky-400 text-black text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl shadow-md">
                  سيرفر حي ⚡
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition">
                    <Globe className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition mb-1.5">
                    أونلاين: ضد شخص حقيقي
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    العب مباشرة ضد أشخاص حقيقيين عبر السيرفر أو أنشئ غرفة خاصة برابط لصديقك!
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-black text-cyan-400">
                  <span>دخول السيرفر</span>
                  <Play className="w-3.5 h-3.5 fill-current group-hover:translate-x-[-3px] transition" />
                </div>
              </div>

              {/* Card 3: 1v1 Same Device Buzzer */}
              <div
                onClick={() => startMode('battle')}
                className="relative group p-5 rounded-3xl bg-gradient-to-b from-neutral-900/90 via-amber-950/30 to-neutral-900/90 border border-amber-400/40 hover:border-amber-400 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition mb-1.5">
                    بازر لاعبين (جهاز واحد)
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    تنافس وجه لوجه مع صديقك على نفس الشاشة ببازر أحمر وأزرق سريع!
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-black text-amber-400">
                  <span>بدء المواجهة</span>
                  <Play className="w-3.5 h-3.5 fill-current group-hover:translate-x-[-3px] transition" />
                </div>
              </div>

              {/* Card 4: Trivia Show */}
              <div
                onClick={() => startMode('trivia')}
                className="relative group p-5 rounded-3xl bg-gradient-to-b from-neutral-900/90 via-purple-950/30 to-neutral-900/90 border border-purple-400/40 hover:border-purple-400 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition mb-1.5">
                    فوازير كروية كبرى
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    أسئلة منوعة من كأس العالم ودوري الأبطال والأرقام القياسية لحصد أعلى النقاط.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-black text-purple-400">
                  <span>خوض الاختبار</span>
                  <Play className="w-3.5 h-3.5 fill-current group-hover:translate-x-[-3px] transition" />
                </div>
              </div>
            </div>

            {/* Quick Leaderboard & Owner Bar */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {/* Leaderboard CTA */}
              <div
                onClick={() => startMode('leaderboard')}
                className="p-4 bg-gradient-to-r from-amber-950/50 via-neutral-900 to-amber-950/50 border border-amber-400/40 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-400 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-amber-300">
                      لوحة الصدارة وأعلى النقاط
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      شاهد قائمة أبطال اللعبة وسجل نتيجتك محلياً
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400">عرض 🏆</span>
              </div>

              {/* Developer Studio CTA */}
              <div
                onClick={() => {
                  if (!currentUser?.isOwner) {
                    sound.playWrong();
                    setRequiredOwnerNotice(true);
                    setGmailModalOpen(true);
                  } else {
                    startMode('developer');
                  }
                }}
                className={`p-4 bg-gradient-to-r from-lime-950/50 via-neutral-900 to-lime-950/50 border rounded-2xl flex items-center justify-between cursor-pointer transition ${
                  currentUser?.isOwner
                    ? 'border-amber-400 hover:border-amber-300 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
                    : 'border-white/10 hover:border-amber-400/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      currentUser?.isOwner
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-neutral-800 text-gray-400'
                    }`}
                  >
                    {currentUser?.isOwner ? <Crown className="w-5 h-5 text-amber-400" /> : <Code className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs sm:text-sm font-black text-lime-300">
                        وضع التطوير والاستوديو (المالك)
                      </h5>
                      {currentUser?.isOwner ? (
                        <span className="text-[10px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded-full">
                          مفعل 👑
                        </span>
                      ) : (
                        <span className="text-[10px] bg-neutral-800 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded-full">
                          مقفل 🔒
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {currentUser?.isOwner
                        ? 'أهلاً بك يا علي! يمكنك إضافة وتعديل صور اللاعبين والأسئلة'
                        : 'مخصص حصرياً لمالك اللعبة المعتمد 👑'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-lime-400">
                  {currentUser?.isOwner ? 'دخول ⚙️' : 'طلب إذن 🔒'}
                </span>
              </div>
            </div>

            {/* PWA App Download Banner */}
            <div className="w-full mb-8">
              <PWAInstallButton variant="banner" />
            </div>

            {/* Featured Players Showcase Carousel Strip */}
            <div className="w-full bg-neutral-900/70 border border-white/10 rounded-3xl p-5 mb-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                  <h4 className="text-sm font-black text-white">
                    نجوم التحدي بوجوههم وعيونهم الحقيقية:
                  </h4>
                </div>
                <span className="text-xs text-lime-400 font-bold">
                  {activePlayers.length} لاعب جاهزون للتحدي
                </span>
              </div>

              {/* Player thumbnails horizontal strip */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {activePlayers.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => startMode('eyes', p.id)}
                    className="group/player flex flex-col items-center cursor-pointer p-1.5 rounded-xl hover:bg-neutral-800 transition"
                    title={`العب تحدي ${p.name}`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-lime-400/50 group-hover/player:border-lime-400 group-hover/player:scale-105 transition shadow-md relative">
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-0 right-0 text-[10px] bg-black/80 px-1 rounded-full">
                        {p.flag}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 mt-1.5 text-center truncate w-full group-hover/player:text-lime-300">
                      {p.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. EYES CHALLENGE */}
        {activeTab === 'eyes' && (
          <EyesChallenge
            key={`eyes-${rosterKey}`}
            onBackToHome={() => setActiveTab('home')}
            onOpenShare={(score, title) => {
              if (score) setPendingLeaderboardScore({ score, mode: 'eyes' });
              handleOpenShare(score, title);
            }}
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
            initialPlayerId={initialPlayerId}
          />
        )}

        {/* 3. TWO-PLAYER LOCAL BATTLE */}
        {activeTab === 'battle' && (
          <TwoPlayerBattle
            onBackToHome={() => setActiveTab('home')}
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
          />
        )}

        {/* 4. ONLINE REAL-TIME ARENA */}
        {activeTab === 'online' && (
          <OnlineArena
            onBackToHome={() => setActiveTab('home')}
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
            initialRoomCode={initialRoomCode}
          />
        )}

        {/* 5. TRIVIA SHOW */}
        {activeTab === 'trivia' && (
          <TriviaShow
            onBackToHome={() => setActiveTab('home')}
            onOpenShare={(score) => {
              if (score) setPendingLeaderboardScore({ score, mode: 'trivia' });
              handleOpenShare(score);
            }}
          />
        )}

        {/* 6. LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <Leaderboard
            onBackToHome={() => setActiveTab('home')}
            pendingScore={pendingLeaderboardScore}
            onScoreSaved={() => setPendingLeaderboardScore(undefined)}
          />
        )}

        {/* 7. DEVELOPER STUDIO (Restricted to alialaakhader@gmail.com) */}
        {activeTab === 'developer' && (
          <DeveloperStudio
            onBackToHome={() => setActiveTab('home')}
            onDataChanged={() => setRosterKey((k) => k + 1)}
            onOpenGmailAuth={() => {
              setRequiredOwnerNotice(true);
              setGmailModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-black/60 backdrop-blur-md py-3 text-center text-xs text-gray-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400" />
            <span className="font-semibold text-gray-300">برنامج فوازير كورة B11 الرسمي</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <button
              onClick={() => startMode('leaderboard')}
              className="hover:text-amber-300 transition cursor-pointer"
            >
              🏆 لوحة الصدارة
            </button>
            <span>•</span>
            <button
              onClick={() => startMode('online')}
              className="hover:text-cyan-300 transition cursor-pointer"
            >
              🌐 سيرفر الأونلاين
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (!currentUser?.isOwner) {
                  sound.playWrong();
                  setRequiredOwnerNotice(true);
                  setGmailModalOpen(true);
                } else {
                  startMode('developer');
                }
              }}
              className="hover:text-lime-300 transition cursor-pointer"
            >
              {currentUser?.isOwner ? '👑 استوديو المالك (مفعل)' : '🔒 وضع المالك'}
            </button>
          </div>
        </div>
      </footer>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        score={shareScore}
        playerTitle={shareTitle}
        defaultMode={activeTab === 'home' ? 'eyes' : activeTab}
      />

      {/* Gmail Account Modal Dialog */}
      <GmailAuthModal
        isOpen={gmailModalOpen}
        onClose={() => setGmailModalOpen(false)}
        onUserChanged={(u) => setCurrentUser(u)}
        requiredOwnerNotice={requiredOwnerNotice}
      />
    </div>
  );
}

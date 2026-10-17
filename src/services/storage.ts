// Local Storage Persistence Manager for Leaderboard and Custom Owner Data
import { PLAYERS_LIST, GENERAL_TRIVIA, FootballPlayer, TriviaQuestion } from '../data/playersData';
import { safeStorage } from './safeStorage';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  mode: 'eyes' | 'trivia' | 'total';
  date: string;
  rankBadge: string;
  avatar: string;
}

const LEADERBOARD_KEY = 'b11_football_leaderboard';
const CUSTOM_PLAYERS_KEY = 'b11_custom_players';
const CUSTOM_TRIVIA_KEY = 'b11_custom_trivia';

// Seed initial Hall of Fame records
const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    name: 'الكابتن طارق - عين الصقر',
    score: 1480,
    mode: 'eyes',
    date: 'اليوم',
    rankBadge: '🥇 المركز الأول',
    avatar: '🦅',
  },
  {
    id: 'lb-2',
    name: 'أحمد التكتيكي',
    score: 1320,
    mode: 'eyes',
    date: 'أمس',
    rankBadge: '🥈 المركز الثاني',
    avatar: '⚡',
  },
  {
    id: 'lb-3',
    name: 'عمر فوت B11',
    score: 1190,
    mode: 'eyes',
    date: 'منذ يومين',
    rankBadge: '🥉 المركز الثالث',
    avatar: '⚽',
  },
  {
    id: 'lb-4',
    name: 'ياسين الملكي',
    score: 1040,
    mode: 'eyes',
    date: 'منذ أسبوع',
    rankBadge: '⭐ محلل محترف',
    avatar: '👑',
  },
  {
    id: 'lb-5',
    name: 'موسوعة التشامبيونز',
    score: 1250,
    mode: 'trivia',
    date: 'اليوم',
    rankBadge: '🥇 ملك الفوازير',
    avatar: '🏆',
  },
  {
    id: 'lb-6',
    name: 'زياد الكروي',
    score: 960,
    mode: 'trivia',
    date: 'أمس',
    rankBadge: '🥈 وصيف الفوازير',
    avatar: '🧠',
  },
];

// 1. Leaderboard Operations
export function getLeaderboard(mode?: 'eyes' | 'trivia' | 'total'): LeaderboardEntry[] {
  try {
    const raw = safeStorage.getItem(LEADERBOARD_KEY);
    let list: LeaderboardEntry[] = raw ? JSON.parse(raw) : INITIAL_LEADERBOARD;
    if (mode && mode !== 'total') {
      list = list.filter((item) => item.mode === mode);
    }
    return list.sort((a, b) => b.score - a.score);
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry[] {
  try {
    const current = getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: 'lb-' + Date.now(),
      date: new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
    };
    const updated = [newEntry, ...current].sort((a, b) => b.score - a.score).slice(0, 50);
    safeStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function resetLeaderboard(): LeaderboardEntry[] {
  try {
    safeStorage.setItem(LEADERBOARD_KEY, JSON.stringify(INITIAL_LEADERBOARD));
  } catch {
    // Graceful
  }
  return INITIAL_LEADERBOARD;
}

// 2. Custom Players (Developer / Owner Mode)
export function getAllPlayers(): FootballPlayer[] {
  try {
    const raw = safeStorage.getItem(CUSTOM_PLAYERS_KEY);
    const custom: FootballPlayer[] = raw ? JSON.parse(raw) : [];
    return [...custom, ...PLAYERS_LIST];
  } catch {
    return PLAYERS_LIST;
  }
}

export function saveCustomPlayer(player: FootballPlayer): FootballPlayer[] {
  try {
    const raw = safeStorage.getItem(CUSTOM_PLAYERS_KEY);
    const custom: FootballPlayer[] = raw ? JSON.parse(raw) : [];
    const updated = [player, ...custom.filter((p) => p.id !== player.id)];
    safeStorage.setItem(CUSTOM_PLAYERS_KEY, JSON.stringify(updated));
    return getAllPlayers();
  } catch {
    return PLAYERS_LIST;
  }
}

export function deleteCustomPlayer(playerId: string): FootballPlayer[] {
  try {
    const raw = safeStorage.getItem(CUSTOM_PLAYERS_KEY);
    const custom: FootballPlayer[] = raw ? JSON.parse(raw) : [];
    const updated = custom.filter((p) => p.id !== playerId);
    safeStorage.setItem(CUSTOM_PLAYERS_KEY, JSON.stringify(updated));
    return getAllPlayers();
  } catch {
    return PLAYERS_LIST;
  }
}

// 3. Custom Trivia Questions (Developer / Owner Mode)
export function getAllTrivia(): TriviaQuestion[] {
  try {
    const raw = safeStorage.getItem(CUSTOM_TRIVIA_KEY);
    const custom: TriviaQuestion[] = raw ? JSON.parse(raw) : [];
    return [...custom, ...GENERAL_TRIVIA];
  } catch {
    return GENERAL_TRIVIA;
  }
}

export function saveCustomTrivia(question: TriviaQuestion): TriviaQuestion[] {
  try {
    const raw = safeStorage.getItem(CUSTOM_TRIVIA_KEY);
    const custom: TriviaQuestion[] = raw ? JSON.parse(raw) : [];
    const updated = [question, ...custom.filter((q) => q.id !== question.id)];
    safeStorage.setItem(CUSTOM_TRIVIA_KEY, JSON.stringify(updated));
    return getAllTrivia();
  } catch {
    return GENERAL_TRIVIA;
  }
}

export function deleteCustomTrivia(questionId: string): TriviaQuestion[] {
  try {
    const raw = safeStorage.getItem(CUSTOM_TRIVIA_KEY);
    const custom: TriviaQuestion[] = raw ? JSON.parse(raw) : [];
    const updated = custom.filter((q) => q.id !== questionId);
    safeStorage.setItem(CUSTOM_TRIVIA_KEY, JSON.stringify(updated));
    return getAllTrivia();
  } catch {
    return GENERAL_TRIVIA;
  }
}

import { GameId, GameInfo } from "../types";

export const GAMES_CATALOG: Record<GameId, GameInfo> = {
  button: {
    id: "button",
    name: "Button That Does Nothing",
    shortName: "Button",
    icon: "🔴",
    tagline: "A huge, tempting button where literally nothing happens.",
    description: "The whole point is that nothing happens. But the messages get increasingly ridiculous, and multiple unpredictable endings await.",
    themeColor: "from-rose-500 to-red-600",
  },
  chair: {
    id: "chair",
    name: "Catch the Chair",
    shortName: "Chair",
    icon: "🪑",
    tagline: "A comfortable chair that refuses to let you sit.",
    description: "Move toward it and WHOOSH! It dodges, teleports, mutates, or decides you are completely unworthy.",
    themeColor: "from-amber-500 to-orange-600",
  },
  mouse: {
    id: "mouse",
    name: "Don't Move Your Mouse",
    shortName: "Mouse",
    icon: "🖱️",
    tagline: "Do not move your cursor. Simple instruction, evil game.",
    description: "Keep cursor in the circle. The game then blatantly cheats with drifts, shrinks, teleports, fake finishes, and screen takeovers.",
    themeColor: "from-emerald-500 to-teal-600",
  },
  checkbox: {
    id: "checkbox",
    name: "The Impossible Checkbox",
    shortName: "Checkbox",
    icon: "☑️",
    tagline: "Prove you're human. The website makes it impossible.",
    description: "A checkbox that dodges you, questions your existential dread, multiplies into philosophical tests, or simply goes on strike.",
    themeColor: "from-indigo-500 to-blue-600",
  },
  car: {
    id: "car",
    name: "Useless Driving Simulator",
    shortName: "Car",
    icon: "🚗",
    tagline: "Accelerator, brake, steering—zero actual control.",
    description: "Retro road simulator with backwards acceleration, rocket brakes, inverted steering, and hilarious unpredictable physics crashes.",
    themeColor: "from-violet-500 to-purple-600",
  },
};

export const ALL_GAME_IDS: GameId[] = ["button", "chair", "mouse", "checkbox", "car"];

// Memory for anti-repeat selection
const STORAGE_KEY = "whatif_played_games_history";

export function getRecentlyPlayedGames(): GameId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordPlayedGame(gameId: GameId) {
  try {
    const history = getRecentlyPlayedGames();
    const updated = [gameId, ...history.filter(g => g !== gameId)].slice(0, 4);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function pickIndependentRandomGame(): { gameId: GameId; rollNumber: number } {
  const history = getRecentlyPlayedGames();
  // Filter out the most recently played game if possible so the user gets variety
  const candidates = ALL_GAME_IDS.filter(g => history.length === 0 || g !== history[0]);
  const pool = candidates.length > 0 ? candidates : ALL_GAME_IDS;
  
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const rollNumber = ALL_GAME_IDS.indexOf(chosen) + 1; // 1 to 5
  return { gameId: chosen, rollNumber };
}

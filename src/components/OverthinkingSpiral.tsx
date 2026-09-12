import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles, Dices, AlertCircle, RefreshCw } from "lucide-react";
import { GameId, OverthinkingRound } from "../types";
import { GAMES_CATALOG, pickIndependentRandomGame } from "../data/games";
import {
  playWhatIfMotif,
  playClickSound,
  playButtonPress,
  playSuspenseTick,
} from "../utils/audio";
import { generateClientContextualThoughts } from "../utils/contextualThoughts";

interface Props {
  onGameAwarded: (gameId: GameId, chosenThought: string) => void;
}

const PRESET_SITUATIONS = [
  "my friend hasn't replied for 5 hours...",
  "why did they look at me like that?",
  "they replied with just 'k' instead of 'ok'",
  "do you have 5 minutes for a quick chat tomorrow morning?",
  "I enthusiastically waved at someone who wasn't waving at me",
];

interface FinalActionOption {
  id: string;
  label: string;
  gameId: GameId | "random_investigate";
  comedicJoke: string;
  badgeColor: string;
  rotation: string;
}

const FINAL_ACTION_OPTIONS: FinalActionOption[] = [
  {
    id: "nothing",
    label: "I'll do absolutely nothing",
    gameId: "button",
    comedicJoke: "You chose to do absolutely nothing. Here is a button that does exactly that.",
    badgeColor: "bg-rose-300 hover:bg-rose-400 border-rose-950",
    rotation: "-rotate-1",
  },
  {
    id: "escape",
    label: "I need to escape",
    gameId: "chair",
    comedicJoke: "You tried to sit down and escape. Unfortunately, the chair is trying to escape you.",
    badgeColor: "bg-amber-300 hover:bg-amber-400 border-amber-950",
    rotation: "rotate-1",
  },
  {
    id: "control",
    label: "I must take control",
    gameId: "car",
    comedicJoke: "You decided to take the wheel. Unfortunately, you have zero control.",
    badgeColor: "bg-purple-300 hover:bg-purple-400 border-purple-950",
    rotation: "-rotate-2",
  },
  {
    id: "answers",
    label: "I need answers",
    gameId: "random_investigate",
    comedicJoke: "You demanded answers. First, you must complete this completely unnecessary task.",
    badgeColor: "bg-emerald-300 hover:bg-emerald-400 border-emerald-950",
    rotation: "rotate-2",
  },
];

// Playful round metadata
const STAGES = [
  {
    id: 1,
    title: "Reasonable",
    label: "THOUGHT",
    meter: "20%",
    annotation: "Probably fine. A normal person would stop here.",
    cardColors: [
      "bg-amber-100 border-amber-900",
      "bg-rose-100 border-rose-900",
      "bg-emerald-100 border-emerald-900",
      "bg-sky-100 border-sky-900",
      "bg-purple-100 border-purple-900",
    ],
  },
  {
    id: 2,
    title: "Slightly Suspicious",
    label: "MAYBE",
    meter: "45%",
    annotation: "Wait a minute... Did you notice that micro-detail?",
    cardColors: [
      "bg-yellow-200 border-yellow-950",
      "bg-teal-200 border-teal-950",
      "bg-orange-200 border-orange-950",
      "bg-indigo-200 border-indigo-950",
      "bg-pink-200 border-pink-950",
    ],
  },
  {
    id: 3,
    title: "Clearly Overthinking",
    label: "BUT WHAT IF",
    meter: "70%",
    annotation: "HERE WE GO. The internal group chat has assembled.",
    cardColors: [
      "bg-purple-200 border-purple-950",
      "bg-amber-200 border-amber-950",
      "bg-cyan-200 border-cyan-950",
      "bg-rose-200 border-rose-950",
      "bg-lime-200 border-lime-950",
    ],
  },
  {
    id: 4,
    title: "Ridiculous Possibilities",
    label: "WAIT",
    meter: "92%",
    annotation: "Completely unhinged. Passport renewal recommended.",
    cardColors: [
      "bg-fuchsia-300 border-fuchsia-950",
      "bg-lime-300 border-lime-950",
      "bg-orange-300 border-orange-950",
      "bg-sky-300 border-sky-950",
      "bg-amber-300 border-amber-950",
    ],
  },
  {
    id: 5,
    title: "Absurdity Maximum",
    label: "OH NO",
    meter: "WHY",
    annotation: "MAXIMUM CHAOS. Logic has been permanently dismissed.",
    cardColors: [
      "bg-rose-400 border-rose-950 text-neutral-900",
      "bg-amber-400 border-amber-950 text-neutral-900",
      "bg-emerald-400 border-emerald-950 text-neutral-900",
      "bg-violet-400 border-violet-950 text-neutral-900",
      "bg-pink-400 border-pink-950 text-neutral-900",
    ],
  },
];

export const OverthinkingSpiral: React.FC<Props> = ({ onGameAwarded }) => {
  const [situation, setSituation] = useState("");
  const [currentRoundNumber, setCurrentRoundNumber] = useState(0); // 0 = Landing, 1-5 = Rounds, 6 = Climax
  const [roundsHistory, setRoundsHistory] = useState<OverthinkingRound[]>([]);
  const [currentRoundData, setCurrentRoundData] = useState<OverthinkingRound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Consulting your inner catastrophist...");

  // Reveal roulette suspense state
  const [rouletteState, setRouletteState] = useState<{
    active: boolean;
    chosenActionLabel: string;
    comedicJoke: string;
    targetGame: GameId;
    revealedGame: GameId | null;
  } | null>(null);

  const fetchRoundThoughts = async (roundNum: number, currentSituation: string, history: OverthinkingRound[]) => {
    // If we finished 5 rounds, we reach the climax!
    if (roundNum > 5) {
      // Signature "uh-oh, something has gone wrong" transition sound!
      playWhatIfMotif("spiral_to_game");
      setCurrentRoundNumber(6);
      return;
    }

    setIsLoading(true);
    const loadingMessages = [
      "Consulting your inner catastrophist...",
      "Inventing 5 brand new problems...",
      "Examining punctuation and micro-expressions...",
      "Simulating irreversible societal humiliation...",
      "Escalating panic to the next logical tier...",
    ];
    setLoadingText(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);

    try {
      const res = await fetch("/api/overthink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: currentSituation,
          round: roundNum,
          previousThoughts: history.map(h => h.selectedThought || ""),
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch overthinking step");
      const data = await res.json();

      const stage = STAGES[roundNum - 1];
      const previousThoughtsList = history.map(h => h.selectedThought || "");
      const contextualFallback = generateClientContextualThoughts(currentSituation, roundNum, previousThoughtsList);

      setCurrentRoundData({
        round: roundNum,
        name: stage.title,
        subtitle: stage.annotation,
        thoughts: (data.thoughts && data.thoughts.length >= 4) ? data.thoughts.slice(0, 5) : contextualFallback,
      });
      setCurrentRoundNumber(roundNum);

      // Play the round-specific motif transition sound
      const roundVariant = `spiral_round_${roundNum}` as any;
      playWhatIfMotif(roundVariant);
    } catch (err) {
      console.warn("Using fallback local overthinker:", err);
      const stage = STAGES[roundNum - 1];
      const previousThoughtsList = history.map(h => h.selectedThought || "");
      const contextualThoughts = generateClientContextualThoughts(currentSituation, roundNum, previousThoughtsList);

      setCurrentRoundData({
        round: roundNum,
        name: stage.title,
        subtitle: stage.annotation,
        thoughts: contextualThoughts,
      });
      setCurrentRoundNumber(roundNum);

      const roundVariant = `spiral_round_${roundNum}` as any;
      playWhatIfMotif(roundVariant);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSpiral = (situationText: string) => {
    const text = situationText.trim();
    if (!text) return;
    // Signature machine waking up / activation sound!
    playWhatIfMotif("wake");
    setSituation(text);
    setRoundsHistory([]);
    fetchRoundThoughts(1, text, []);
  };

  const handleSelectThought = (thought: string) => {
    // Restored the classic, crisp clicking sound for possibilities
    playClickSound();
    if (!currentRoundData) return;

    const updatedRound: OverthinkingRound = {
      ...currentRoundData,
      selectedThought: thought,
    };
    const newHistory = [...roundsHistory, updatedRound];
    setRoundsHistory(newHistory);

    const nextRound = currentRoundNumber + 1;
    fetchRoundThoughts(nextRound, situation, newHistory);
  };

  // Final Action button click -> launches the comedic payoff
  const handleFinalActionClick = (action: FinalActionOption) => {
    playButtonPress("primary");

    let targetGame: GameId;
    if (action.gameId === "random_investigate") {
      targetGame = Math.random() < 0.5 ? "mouse" : "checkbox";
    } else {
      targetGame = action.gameId;
    }

    setRouletteState({
      active: true,
      chosenActionLabel: action.label,
      comedicJoke: action.comedicJoke,
      targetGame,
      revealedGame: null,
    });

    // Rapid suspense ticks that accelerate before final reveal
    let count = 0;
    const tickInterval = setInterval(() => {
      playSuspenseTick();
      count++;
      if (count >= 7) {
        clearInterval(tickInterval);
      }
    }, 170);

    setTimeout(() => {
      clearInterval(tickInterval);
      // Triumphant/eccentric reveal fanfare
      playWhatIfMotif("launch_game");
      setRouletteState(prev => (prev ? { ...prev, revealedGame: targetGame } : null));
    }, 1400);
  };

  const handleEnterAwardedGame = () => {
    playWhatIfMotif("launch_game");
    if (rouletteState?.revealedGame) {
      onGameAwarded(rouletteState.revealedGame, rouletteState.chosenActionLabel);
    }
  };

  // Last chosen thought
  const previousFixation =
    roundsHistory.length > 0
      ? roundsHistory[roundsHistory.length - 1].selectedThought
      : situation;

  // Individual card tilt for organic hand-crafted look
  const cardTilts = [
    "-rotate-1 hover:rotate-0",
    "rotate-1 hover:rotate-0",
    "-rotate-2 hover:rotate-0",
    "rotate-2 hover:rotate-0",
    "rotate-0 hover:rotate-1",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center py-2 sm:py-4 select-none">
      <AnimatePresence mode="wait">
        {/* ========================================================= */}
        {/* 1. PLAYFUL, WEIRD, COLORFUL LANDING PAGE                 */}
        {/* ========================================================= */}
        {currentRoundNumber === 0 && (
          <motion.div
            key="screen-landing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full flex flex-col items-center text-center relative"
          >
            {/* Top Doodle Stickers & Scribbles */}
            <div className="w-full flex items-center justify-between px-2 mb-2 pointer-events-none">
              <span className="inline-block px-3 py-1 rounded-full bg-yellow-300 border-2 border-neutral-900 text-neutral-900 font-bold font-mono text-[11px] shadow-brutal-sm rotate-[-4deg] animate-wiggle-subtle">
                ✦ THE OVERTHINKING SIMULATOR
              </span>
              <span className="hidden sm:inline-block font-doodle text-base font-bold text-neutral-600 rotate-[6deg]">
                "probably nothing" ⤵
              </span>
            </div>

            {/* Giant Expressive Title */}
            <div className="relative mb-6">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-neutral-900 font-display uppercase leading-none drop-shadow-[4px_4px_0px_#FDE047]">
                WHAT IF...?
              </h1>
              <div className="absolute -top-3 -right-5 sm:-right-8 bg-rose-400 text-neutral-950 font-black font-mono text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-md border-2 border-neutral-900 shadow-brutal-sm rotate-[12deg]">
                IRRATIONAL!
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-purple-700 font-display">
                  What's on your mind?
                </span>
                <span className="font-doodle text-neutral-500 text-base">
                  (this is unnecessary)
                </span>
              </div>
            </div>

            {/* Large Colorful Chunky Input Area */}
            <div className="w-full relative mb-6">
              {/* Floating Doodle Arrow (left) */}
              <div className="hidden md:block absolute -left-16 top-10 pointer-events-none text-left">
                <span className="font-doodle text-xl font-bold text-rose-600 rotate-[-12deg] block">
                  type here ➔
                </span>
                <span className="text-xs text-neutral-400 font-mono block -mt-1">
                  be dramatic
                </span>
              </div>

              {/* Floating Doodle Note (right) */}
              <div className="hidden md:block absolute -right-20 top-24 pointer-events-none text-right">
                <span className="font-doodle text-lg font-bold text-emerald-700 rotate-[8deg] block">
                  ⤴ you know you're<br />going to click it
                </span>
              </div>

              {/* Main Input Box */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleStartSpiral(situation);
                }}
                className="w-full bg-amber-100 border-4 border-neutral-900 rounded-3xl p-5 sm:p-7 shadow-brutal-xl flex flex-col gap-4 text-left relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-neutral-800 bg-yellow-300 px-2 py-0.5 rounded border-2 border-neutral-900 shadow-brutal-sm inline-block">
                    INPUT MINOR INCIDENT:
                  </span>
                  <span className="font-doodle text-sm font-bold text-neutral-600">
                    *will be escalated to level 10
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  placeholder="my friend hasn't replied for 5 hours..."
                  className="w-full p-4 rounded-2xl bg-white border-3 border-neutral-900 text-neutral-900 placeholder:text-neutral-400 font-bold text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all resize-none shadow-brutal-sm"
                />

                {/* Big Chunky Playful Button */}
                <button
                  type="submit"
                  disabled={!situation.trim() || isLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-black text-lg sm:text-xl tracking-wider font-display border-3 border-neutral-900 shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-sm transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  <span>LET'S OVERTHINK</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </form>
            </div>

            {/* Presets: Relatable Dilemmas */}
            <div className="w-full text-left bg-white/70 border-3 border-neutral-900 rounded-2xl p-4 sm:p-5 shadow-brutal">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-300 border-2 border-neutral-900 flex items-center justify-center font-bold text-xs">
                    ✦
                  </span>
                  <span className="font-mono text-xs font-black uppercase text-neutral-800 tracking-wide">
                    OR PICK A RELATABLE DILEMMA
                  </span>
                </div>
                <span className="font-doodle text-xs text-neutral-500 hidden sm:inline">
                  "but let's investigate"
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {PRESET_SITUATIONS.map((preset, idx) => {
                  const colors = [
                    "hover:bg-rose-100 hover:border-rose-900",
                    "hover:bg-amber-100 hover:border-amber-900",
                    "hover:bg-emerald-100 hover:border-emerald-900",
                    "hover:bg-sky-100 hover:border-sky-900",
                    "hover:bg-purple-100 hover:border-purple-900",
                  ];
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSituation(preset);
                        handleStartSpiral(preset);
                      }}
                      className={`w-full text-left p-3 rounded-xl bg-white border-2 border-neutral-800 ${colors[idx % colors.length]} font-bold text-xs sm:text-sm text-neutral-800 transition-all flex items-center justify-between group cursor-pointer shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px]`}
                    >
                      <span className="truncate pr-2 italic">"{preset}"</span>
                      <span className="font-mono text-[11px] font-black text-neutral-500 group-hover:text-purple-700 shrink-0">
                        OVERTHINK ➔
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 2. THE OVERTHINKING MACHINE (5 Colorful Thought Cards)    */}
        {/* ========================================================= */}
        {currentRoundNumber >= 1 && currentRoundNumber <= 5 && currentRoundData && (
          <motion.div
            key={`round-${currentRoundNumber}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col text-left"
          >
            {/* Playful Progress Header */}
            <div className="w-full bg-white border-3 border-neutral-900 rounded-2xl p-4 shadow-brutal mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Playful indicator: THOUGHT → MAYBE → BUT WHAT IF → WAIT → OH NO */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {STAGES.map((s, idx) => {
                  const isCurrent = s.id === currentRoundNumber;
                  const isPast = s.id < currentRoundNumber;
                  return (
                    <React.Fragment key={s.id}>
                      <span
                        className={`px-2.5 py-1 rounded-lg border-2 border-neutral-900 font-mono font-black text-[10px] sm:text-xs transition-all ${
                          isCurrent
                            ? "bg-purple-400 text-neutral-950 shadow-brutal-sm scale-105 rotate-[-2deg]"
                            : isPast
                            ? "bg-emerald-200 text-neutral-900"
                            : "bg-neutral-100 text-neutral-400 border-neutral-400"
                        }`}
                      >
                        {s.label}
                      </span>
                      {idx < STAGES.length - 1 && (
                        <span className="text-neutral-400 font-bold text-xs">→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* OVERTHINKING LEVEL: 37% → 64% → 89% → WHY */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] font-bold text-neutral-600 uppercase">
                  PARANOIA LEVEL:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-300 border-2 border-neutral-900 text-neutral-900 font-mono font-black text-xs shadow-brutal-sm animate-pulse">
                  {STAGES[currentRoundNumber - 1].meter}
                </span>
              </div>
            </div>

            {/* Stage Intro Banner */}
            <div className="w-full bg-yellow-200 border-3 border-neutral-900 rounded-2xl p-4 shadow-brutal mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-black uppercase text-neutral-800 tracking-wider">
                  ROUND {currentRoundNumber}/5: {STAGES[currentRoundNumber - 1].title}
                </span>
                <div className="font-doodle text-base font-bold text-neutral-700">
                  {STAGES[currentRoundNumber - 1].annotation}
                </div>
              </div>

              <div className="font-mono text-[11px] px-2 py-1 rounded bg-white border-2 border-neutral-900 text-neutral-900 shadow-brutal-sm shrink-0">
                Pick 1 Thought ⤵
              </div>
            </div>

            {/* "Okay... Let's think about this." */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-black font-display uppercase tracking-wide text-neutral-700">
                  Okay... Let's think about this.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border-3 border-neutral-900 shadow-brutal-sm flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-purple-300 border-2 border-neutral-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  🧠
                </span>
                <div>
                  <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase block">
                    CURRENT FIXATION:
                  </span>
                  <span className="text-base font-bold text-neutral-900 italic">
                    "{previousFixation}"
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Possible Interpretations (Large Clickable Colorful Thought Cards) */}
            {isLoading ? (
              <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white border-3 border-neutral-900 rounded-2xl shadow-brutal mb-4">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="font-display font-black text-lg text-neutral-900">
                  {loadingText}
                </span>
                <span className="font-doodle text-neutral-500 text-sm mt-1">
                  your brain is working overtime
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-5">
                {currentRoundData.thoughts.map((thought, idx) => {
                  const stageColors = STAGES[currentRoundNumber - 1].cardColors;
                  const cardBg = stageColors[idx % stageColors.length];
                  const tilt = cardTilts[idx % cardTilts.length];

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleSelectThought(thought)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl ${cardBg} border-3 shadow-brutal hover:shadow-brutal-lg transition-all cursor-pointer flex items-start gap-3.5 group ${tilt}`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-white border-2 border-neutral-900 text-neutral-950 font-black font-mono text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-brutal-sm group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-base sm:text-lg font-extrabold text-neutral-900 leading-snug">
                          {thought}
                        </span>
                        <span className="font-doodle text-xs text-neutral-600 mt-1">
                          click to fixate on this ➔
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Cognitive Path Footer Trail */}
            <div className="w-full bg-white/80 border-2 border-neutral-900 rounded-xl p-3 shadow-brutal-sm text-xs font-mono">
              <span className="text-neutral-500 font-bold block mb-1">
                ✦ COGNITIVE TRAIL SO FAR:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-neutral-700">
                <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-medium">
                  "{situation.slice(0, 22)}..."
                </span>
                {roundsHistory.map((h, i) => (
                  <React.Fragment key={i}>
                    <span className="text-neutral-400 font-bold">➔</span>
                    <span className="px-2 py-0.5 rounded bg-yellow-200 border border-neutral-900 font-bold text-neutral-900">
                      R{i + 1}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 3. FINAL STATE: THE NATURAL COMEDIC PAYOFF               */}
        {/* ========================================================= */}
        {currentRoundNumber === 6 && !rouletteState && (
          <motion.div
            key="screen-final"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full bg-white border-4 border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-brutal-xl flex flex-col text-center"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-rose-300 border-2 border-neutral-900 text-neutral-950 font-mono font-black text-xs shadow-brutal-sm uppercase mx-auto mb-3 rotate-[-2deg]">
              ✦ MAXIMUM COGNITIVE OVERLOAD REACHED
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-display tracking-tight mb-2">
              "Okay."
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 font-display mb-3">
              "You've thought about this enough."
            </h3>

            <p className="text-base sm:text-lg font-bold text-rose-600 font-doodle max-w-md mx-auto mb-4">
              "Unfortunately, we have created more questions."
            </p>

            {/* Believed Thought Card */}
            <div className="p-4 rounded-2xl bg-amber-100 border-3 border-neutral-900 shadow-brutal text-neutral-900 text-sm sm:text-base font-bold italic mb-6 max-w-lg mx-auto">
              "{previousFixation}"
            </div>

            <span className="font-mono text-xs font-black uppercase tracking-wider text-neutral-600 mb-3 text-left">
              SO... WHAT NOW?
            </span>

            {/* 4 Final Large Interactive Buttons */}
            <div className="flex flex-col gap-3 mb-4">
              {FINAL_ACTION_OPTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleFinalActionClick(action)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl ${action.badgeColor} border-3 shadow-brutal hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-sm transition-all cursor-pointer flex items-center justify-between group ${action.rotation}`}
                >
                  <span className="text-sm sm:text-base font-black font-display text-neutral-950">
                    [ {action.label} ]
                  </span>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border-2 border-neutral-900 text-neutral-900 shadow-brutal-sm group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0">
                    Act →
                  </span>
                </button>
              ))}
            </div>

            <span className="font-doodle text-sm text-neutral-500">
              each choice leads to a completely unnecessary experiment
            </span>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 4. SUSPENSE ROULETTE REVEAL MODAL                         */}
        {/* ========================================================= */}
        {rouletteState && (
          <motion.div
            key="screen-roulette"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full bg-amber-200 border-4 border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-brutal-xl flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border-3 border-neutral-900 flex items-center justify-center text-neutral-950 text-3xl mb-4 shadow-brutal rotate-[-6deg]">
              🎲
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 font-display tracking-tight mb-2">
              Interesting choice.
            </h2>

            <p className="text-xs font-mono font-bold text-neutral-700 italic mb-2">
              "{rouletteState.chosenActionLabel}"
            </p>

            <p className="text-sm sm:text-base font-doodle font-bold text-neutral-800 mb-5 max-w-md">
              {rouletteState.comedicJoke}
            </p>

            <span className="font-mono text-xs font-black uppercase tracking-wider text-neutral-900 bg-white px-3 py-1 rounded-full border-2 border-neutral-900 shadow-brutal-sm mb-4">
              UNFORTUNATELY, YOU'VE EARNED YOURSELF:
            </span>

            {!rouletteState.revealedGame ? (
              <div className="w-full max-w-sm py-10 rounded-2xl bg-white border-3 border-neutral-900 shadow-brutal flex flex-col items-center justify-center">
                <div className="flex items-center gap-4 text-4xl animate-bounce mb-3">
                  <span>🔴</span>
                  <span>🪑</span>
                  <span>🚗</span>
                  <span>🖱️</span>
                  <span>☑️</span>
                </div>
                <span className="font-mono text-xs font-bold text-neutral-600">
                  Calibrating consequence experiment...
                </span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm p-6 rounded-3xl bg-white border-4 border-neutral-900 shadow-brutal-lg flex flex-col items-center mb-4"
              >
                <span className="text-7xl mb-3 drop-shadow">
                  {GAMES_CATALOG[rouletteState.revealedGame].icon}
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 font-display tracking-tight mb-1 uppercase">
                  {GAMES_CATALOG[rouletteState.revealedGame].name}
                </h3>

                <p className="text-xs text-neutral-600 font-mono font-bold mt-1">
                  {GAMES_CATALOG[rouletteState.revealedGame].tagline}
                </p>

                <button
                  onClick={handleEnterAwardedGame}
                  className="w-full mt-6 py-4 px-6 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-black text-base font-display border-3 border-neutral-900 shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Enter Experiment Now</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

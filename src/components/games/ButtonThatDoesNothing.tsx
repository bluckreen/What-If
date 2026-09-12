import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, ArrowLeft, Trophy, Flame, Moon, Sparkles, AlertCircle } from "lucide-react";
import {
  playUselessButtonClick,
  playUselessButtonEnding,
  playAbsurdVictory,
  playButtonPress,
} from "../../utils/audio";
import { triggerConfetti } from "../../utils/confetti";
import { GameEnding } from "../../types";

interface Props {
  onBack: () => void;
  onExploreOtherGames: () => void;
}

export const ButtonThatDoesNothing: React.FC<Props> = ({ onBack, onExploreOtherGames }) => {
  const [clickCount, setClickCount] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("Click the button to do something.");
  const [isPressing, setIsPressing] = useState(false);
  const [ending, setEnding] = useState<GameEnding | null>(null);
  const [clickSpeed, setClickSpeed] = useState(0); // clicks per second

  // Secret target threshold chosen when the game starts
  const secretThresholdRef = useRef(Math.floor(Math.random() * 55) + 15); // e.g. 15 to 70
  // Secretly assign a target ending mode for this run:
  // 'disappear' | 'you_win' | 'wasted_clicks' | 'defiance'
  const secretModeRef = useRef<"disappear" | "you_win" | "wasted_clicks" | "defiance">(
    (["disappear", "you_win", "wasted_clicks", "defiance"] as const)[Math.floor(Math.random() * 4)]
  );

  const startTimeRef = useRef<number>(Date.now());
  const recentClicksRef = useRef<number[]>([]);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speed calculation & Idle detector
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      recentClicksRef.current = recentClicksRef.current.filter(t => now - t < 1000);
      setClickSpeed(recentClicksRef.current.length);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Check for idle ending (user stopped clicking for 10 seconds after having clicked at least 3 times)
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (clickCount >= 3 && !ending) {
      idleTimerRef.current = setTimeout(() => {
        if (!ending) {
          triggerIdleEnding();
        }
      }, 9500);
    }
  };

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const triggerIdleEnding = () => {
    playUselessButtonEnding();
    setEnding({
      id: "idle_sleep",
      title: "The Button Fell Asleep",
      badge: "💤 Abandonment Ending",
      quote: "Inactivity detected. The button felt unappreciated and went to sleep.",
      flavorText: "You stared at the screen for 10 seconds without committing. The button concluded your mutual relationship lacks momentum.",
      stats: {
        "Total Clicks": clickCount,
        "Time Wasted": `${Math.round((Date.now() - startTimeRef.current) / 1000)}s`,
        "Patience": "0%",
      },
    });
  };

  const getEscalatingMessage = (count: number): string => {
    if (count === 1) return "Nothing happened.";
    if (count === 2) return "Still nothing.";
    if (count === 3) return "Why are you doing this?";
    if (count === 4) return "Seriously, it does nothing.";
    if (count === 7) return "You're expecting a secret prize, aren't you?";
    if (count === 10) return "Click 10: Still nothing.";
    if (count === 15) return "Your index finger is gaining zero XP.";
    if (count === 20) return "You could be learning a language or calling your grandmother.";
    if (count === 30) return "Physics check: Yes, your mouse works. The button does not.";
    if (count === 40) return "The servers are actively doing zero math right now.";
    if (count === 50) return "Click 50: You could be doing something productive.";
    if (count === 65) return "Did you hear that? No? That's because nothing happened.";
    if (count === 80) return "We admire your stubborn devotion to emptiness.";
    if (count >= 100) return "Click 100+: Why did you think something would happen?";
    return `Click ${count}: Still nothing.`;
  };

  const handleClick = () => {
    if (ending) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);
    // Special sound: tiny mechanical disappointment, distinct from all other buttons!
    playUselessButtonClick(newCount);

    const now = Date.now();
    recentClicksRef.current.push(now);
    resetIdleTimer();

    // 1. BEHAVIORAL TRIGGER: Rapid Frenzy Clicks (> 7 clicks/sec with at least 12 clicks total)
    if (recentClicksRef.current.length >= 8 && newCount >= 10) {
      playUselessButtonEnding();
      setEnding({
        id: "speed_melt",
        title: "CRITICAL: Button Overheated",
        badge: "🔥 Speed Frenzy Ending",
        quote: "The button melted to protect itself from your frantic desperation.",
        flavorText: "Clicking at supersonic speed did not unlock an alternate dimension. It just caused hypothetical thermal friction.",
        stats: {
          "Max Speed": `${recentClicksRef.current.length} clicks/sec`,
          "Total Clicks": newCount,
          "Button Temperature": "942°C",
        },
      });
      return;
    }

    // 2. RANDOM THRESHOLD ENDINGS (Unpredictable threshold 15 - 70)
    if (newCount >= secretThresholdRef.current) {
      const mode = secretModeRef.current;

      if (mode === "disappear") {
        playUselessButtonEnding();
        setEnding({
          id: "disappeared",
          title: "ENOUGH.",
          badge: "💨 Evaporation Ending",
          quote: `At click ${newCount}, the button said ENOUGH and disintegrated into thin air.`,
          flavorText: "It couldn't take the poking anymore. The button packed its bags and left the DOM.",
          stats: {
            "Final Click": newCount,
            "Remaining Patience": "0.00%",
            "Time Wasted": `${Math.round((Date.now() - startTimeRef.current) / 1000)}s`,
          },
        });
        return;
      }

      if (mode === "you_win") {
        playAbsurdVictory();
        triggerConfetti();
        setEnding({
          id: "won_nothing",
          title: "YOU WIN!",
          badge: "🎉 Victorious Emptiness Ending",
          quote: `Congratulations! At click ${newCount}, you have achieved absolutely nothing!`,
          flavorText: "The confetti is real. The accomplishment is entirely imaginary. You have conquered the void.",
          stats: {
            "Winning Click": newCount,
            "Prize Awarded": "None",
            "Satisfaction Rating": "10/10",
          },
        });
        return;
      }

      if (mode === "wasted_clicks") {
        playUselessButtonEnding();
        setEnding({
          id: "wasted",
          title: "Audit Complete",
          badge: "📉 Financial Regret Ending",
          quote: `Congratulations. You wasted exactly ${newCount} clicks of your mortal lifespan.`,
          flavorText: "Those calories could have powered a thoughtful nod or an exhale.",
          stats: {
            "Wasted Clicks": newCount,
            "Calorie Burn": "0.003 kcal",
            "Existential Weight": "Heavy",
          },
        });
        return;
      }

      // mode === 'defiance'
      if (newCount >= secretThresholdRef.current + 12) {
        playUselessButtonEnding();
        setEnding({
          id: "defiance",
          title: "The Silent Standoff",
          badge: "🗿 Stoic Defiance Ending",
          quote: "You broke the threshold, and the universe refused to blink.",
          flavorText: "You expected a milestone badge. Instead you get this mildly judgmental dialog box.",
          stats: {
            "Clicks Achieved": newCount,
            "Enlightenment": "0.0%",
            "Time Spent": `${Math.round((Date.now() - startTimeRef.current) / 1000)}s`,
          },
        });
        return;
      }
    }

    setCurrentMessage(getEscalatingMessage(newCount));
  };

  const handleReset = () => {
    playButtonPress("secondary");
    setClickCount(0);
    setEnding(null);
    setCurrentMessage("Click the button to do something.");
    secretThresholdRef.current = Math.floor(Math.random() * 55) + 15;
    secretModeRef.current = (["disappear", "you_win", "wasted_clicks", "defiance"] as const)[
      Math.floor(Math.random() * 4)
    ];
    startTimeRef.current = Date.now();
    recentClicksRef.current = [];
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center py-4 px-3 select-none">
      {/* Top Controls */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-neutral-900 shadow-brutal-sm text-xs sm:text-sm font-bold text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Spiral
        </button>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-white border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-bold">
            Clicks: <strong className="text-rose-600 font-black">{clickCount}</strong>
          </span>
          {clickSpeed > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-300 border-2 border-neutral-900 shadow-brutal-sm text-neutral-950 font-black animate-pulse">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              {clickSpeed} cps
            </span>
          )}
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="w-full min-h-[440px] bg-[#FFFDF8] rounded-3xl border-4 border-neutral-900 shadow-brutal-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!ending ? (
            <motion.div
              key="active-button-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center w-full"
            >
              <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-200 border-2 border-neutral-900 text-neutral-950 font-mono text-xs font-black tracking-wide uppercase shadow-brutal-sm rotate-[-2deg]">
                Experiment 1: Button That Does Nothing
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-4 tracking-tight font-display">
                An Extremely Tempting Button
              </h2>

              {/* The Big Tempting Button */}
              <div className="relative my-4">
                <motion.button
                  id="useless-big-button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onMouseDown={() => setIsPressing(true)}
                  onMouseUp={() => setIsPressing(false)}
                  onClick={handleClick}
                  className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-black text-3xl sm:text-4xl tracking-wider shadow-[0_8px_0px_#9F1239,0_12px_0px_#000] active:translate-y-2 active:shadow-[0_0px_0px_#9F1239,0_4px_0px_#000] border-4 border-neutral-900 flex flex-col items-center justify-center cursor-pointer select-none transition-all font-display"
                >
                  <span className="drop-shadow-[0_2px_0px_#000]">CLICK ME</span>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-rose-200 mt-1 uppercase bg-rose-900/40 px-2 py-0.5 rounded-full border border-rose-300/40">
                    Guaranteed Void
                  </span>
                </motion.button>
              </div>

              {/* Escalating Status Message */}
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-[48px] flex items-center justify-center max-w-md mt-4 p-3 rounded-2xl bg-amber-100 border-2 border-neutral-900 shadow-brutal-sm"
              >
                <p className="text-base sm:text-lg font-bold text-neutral-900 font-mono tracking-wide">
                  "{currentMessage}"
                </p>
              </motion.div>

              <p className="text-xs font-doodle font-bold text-neutral-500 mt-5 max-w-xs">
                *tip: there is zero point in clicking fast, or clicking slow, or clicking at all.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="ending-card"
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center max-w-lg p-2"
            >
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider bg-yellow-300 text-neutral-950 border-2 border-neutral-900 shadow-brutal-sm mb-3 rotate-[-2deg]">
                {ending.badge}
              </span>

              <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 mb-2 tracking-tight font-display">
                {ending.title}
              </h3>

              <blockquote className="text-lg italic text-neutral-900 font-serif my-3 px-4 py-2 border-l-4 border-neutral-900 bg-rose-100 rounded-r-xl shadow-brutal-sm">
                "{ending.quote}"
              </blockquote>

              <p className="text-sm font-medium text-neutral-700 mb-5 leading-relaxed">
                {ending.flavorText}
              </p>

              {/* Stats Box */}
              {ending.stats && (
                <div className="w-full grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-amber-100 border-2 border-neutral-900 shadow-brutal-sm mb-6 font-mono text-xs">
                  {Object.entries(ending.stats).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-neutral-500 uppercase text-[10px] font-bold">{k}</span>
                      <span className="text-neutral-950 font-black text-sm mt-0.5">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-black font-display border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={onExploreOtherGames}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-black font-display border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  New Spiral
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

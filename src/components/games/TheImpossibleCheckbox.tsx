import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw, Sparkles, ShieldAlert, Check } from "lucide-react";
import {
  playCheckboxEscape,
  playComedicFailure,
  playAbsurdVictory,
  playButtonPress,
} from "../../utils/audio";
import { triggerConfetti } from "../../utils/confetti";
import { GameEnding } from "../../types";

interface Props {
  onBack: () => void;
  onExploreOtherGames: () => void;
}

interface CheckboxItem {
  id: string;
  label: string;
  checked: boolean;
  x: number;
  y: number;
  isGiveUp?: boolean;
}

export const TheImpossibleCheckbox: React.FC<Props> = ({ onBack, onExploreOtherGames }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<"initial" | "double_trap" | "cascading" | "frozen">("initial");
  const [doubleTrapChecked, setDoubleTrapChecked] = useState(false);
  const [ending, setEnding] = useState<GameEnding | null>(null);

  // Position of main checkbox (percentages)
  const [mainPos, setMainPos] = useState({ x: 50, y: 50 });
  const [mainLabel, setMainLabel] = useState("I am not a robot");
  const [isChecked, setIsChecked] = useState(false);

  // Extra cascading checkboxes
  const [extraBoxes, setExtraBoxes] = useState<CheckboxItem[]>([]);

  // Random secret target ending:
  // 'double_trap' | 'freeze_nothing' | 'give_up' | 'union_strike'
  const secretTargetRef = useRef<"double_trap" | "freeze_nothing" | "give_up" | "union_strike">(
    (["double_trap", "freeze_nothing", "give_up", "union_strike"] as const)[Math.floor(Math.random() * 4)]
  );

  // Evasive hover handler
  const handleMouseEnter = () => {
    if (ending || phase === "frozen" || doubleTrapChecked) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    // Quick playful "zip" or elastic movement sound with subtle pitch/duration variation!
    playCheckboxEscape(newAttempts);

    const target = secretTargetRef.current;

    // Ending: Freeze nothing (suddenly stops moving after 8 attempts)
    if (target === "freeze_nothing" && newAttempts >= 8) {
      setPhase("frozen");
      return;
    }

    // Ending: Give up option (spawns cascading checkboxes including "I give up")
    if (target === "give_up" && newAttempts >= 7 && extraBoxes.length === 0) {
      setExtraBoxes([
        { id: "1", label: "I promise", checked: false, x: 25, y: 25 },
        { id: "2", label: "Are you sure you're not an automated script?", checked: false, x: 75, y: 35 },
        { id: "3", label: "I have existential dread", checked: false, x: 30, y: 70 },
        { id: "4", label: "I give up", checked: false, x: 70, y: 75, isGiveUp: true },
      ]);
    }

    // Ending: Union strike (runs off or shrinks)
    if (target === "union_strike" && newAttempts >= 11) {
      playComedicFailure();
      setEnding({
        id: "union_strike",
        title: "The Checkbox Went on Strike",
        badge: "🪧 Labor Dispute Ending",
        quote: "The checkbox has unionized and refused to verify you.",
        flavorText: "It filed a formal grievance regarding excessive cursor harassment. Further verification attempts are prohibited.",
        stats: {
          "Attempts": newAttempts,
          "Union Demands": "15 min rest",
          "Verification Status": "Picket Line",
        },
      });
      return;
    }

    // Jump to random location
    setMainPos({
      x: Math.random() * 60 + 20,
      y: Math.random() * 60 + 20,
    });
  };

  // Main checkbox click
  const handleMainClick = () => {
    if (ending) return;

    // If freeze ending was active
    if (phase === "frozen") {
      setIsChecked(true);
      playAbsurdVictory();
      setEnding({
        id: "proven_nothing",
        title: "Verification Complete?",
        badge: "📭 Empty Triumph Ending",
        quote: "You have successfully proven absolutely nothing.",
        flavorText: "The box is checked. The world did not change. No human soul has ever been verified by a square.",
        stats: {
          "Attempts": attempts,
          "Humanity Confirmed": "0.00%",
          "Time Wasted": "Worth it",
        },
      });
      return;
    }

    // If double trap ending was chosen
    if (secretTargetRef.current === "double_trap" && attempts >= 6) {
      setIsChecked(true);
      setDoubleTrapChecked(true);
      playButtonPress("primary");

      setTimeout(() => {
        setMainLabel("I am definitely not a robot");
        setIsChecked(false);
        setDoubleTrapChecked(false);

        // Next click fails verification
        setTimeout(() => {
          playComedicFailure();
          setEnding({
            id: "double_trap_failed",
            title: "Verification Failed",
            badge: "🤖 Identity Crisis Ending",
            quote: "Hmm. System diagnostic: 0% human verified.",
            flavorText: "You checked the second box, but your mouse velocity was 0.04 milliseconds too precise. Protocol dictates you are an AI.",
            stats: {
              "Human Probability": "0.0001%",
              "Captcha Escaped": "No",
              "Attempts": attempts + 2,
            },
          });
        }, 1800);
      }, 900);
      return;
    }

    // Otherwise it unchecks with a comedic pop and resets position
    setIsChecked(true);
    playCheckboxEscape(attempts);
    setTimeout(() => {
      playComedicFailure();
      setIsChecked(false);
      setMainPos({
        x: Math.random() * 60 + 20,
        y: Math.random() * 60 + 20,
      });
    }, 250);
  };

  const handleExtraClick = (box: CheckboxItem) => {
    if (box.isGiveUp) {
      playAbsurdVictory();
      triggerConfetti();
      setEnding({
        id: "acceptance_give_up",
        title: "Acceptance",
        badge: "🤍 Enlightenment Ending",
        quote: "Correct. Acceptance of defeat is the only truly human quality.",
        flavorText: "A robot would have clicked in an endless loop forever. By giving up, you proved your organic frailty.",
        stats: {
          "Surrender Index": "100%",
          "Ego Shed": "Complete",
          "Attempts": attempts,
        },
      });
      return;
    }

    // Other extra checkboxes dodge with zip
    playCheckboxEscape(attempts + 1);
    setExtraBoxes(prev =>
      prev.map(b =>
        b.id === box.id
          ? { ...b, x: Math.random() * 60 + 20, y: Math.random() * 60 + 20 }
          : b
      )
    );
  };

  const handleReset = () => {
    playButtonPress("secondary");
    setAttempts(0);
    setPhase("initial");
    setDoubleTrapChecked(false);
    setEnding(null);
    setMainPos({ x: 50, y: 50 });
    setMainLabel("I am not a robot");
    setIsChecked(false);
    setExtraBoxes([]);
    secretTargetRef.current = (
      ["double_trap", "freeze_nothing", "give_up", "union_strike"] as const
    )[Math.floor(Math.random() * 4)];
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center py-4 px-3 select-none">
      {/* Top Header Controls */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-neutral-900 shadow-brutal-sm text-xs sm:text-sm font-bold text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Spiral
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-white border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-bold">
            Dodges: <strong className="text-indigo-600 font-black">{attempts}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-200 border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-black uppercase">
            STATUS: SUSPICIOUS
          </span>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div
        ref={containerRef}
        className="w-full h-[460px] bg-[#FFFDF8] rounded-3xl border-4 border-neutral-900 shadow-brutal-xl relative overflow-hidden flex flex-col items-center justify-between p-6 select-none"
      >
        {/* Banner Title */}
        <div className="z-10 text-center pointer-events-none">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-200 border-2 border-neutral-900 text-neutral-950 font-mono text-xs font-black tracking-wide uppercase shadow-brutal-sm rotate-[-2deg] mb-1">
            Experiment 4: The Impossible Checkbox
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-display tracking-tight mt-1">
            Security Verification
          </h2>
          <p className="text-xs font-doodle font-bold text-neutral-600 mt-0.5">
            *prove your organic consciousness to proceed.
          </p>
        </div>

        {/* Extra Cascading Checkboxes */}
        {extraBoxes.map(box => (
          <motion.div
            key={box.id}
            animate={{
              left: `${box.x}%`,
              top: `${box.y}%`,
            }}
            transition={{ type: "spring", stiffness: 160, damping: 15 }}
            onClick={() => handleExtraClick(box)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-4 py-2.5 rounded-2xl border-3 border-neutral-900 cursor-pointer select-none shadow-brutal z-20 transition-all ${
              box.isGiveUp
                ? "bg-rose-200 text-neutral-950 hover:bg-rose-300 font-bold"
                : "bg-white text-neutral-950 hover:bg-neutral-100 font-bold"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg border-2 border-neutral-900 flex items-center justify-center transition-colors ${
                box.isGiveUp ? "bg-rose-300" : "bg-neutral-100"
              }`}
            >
              {box.checked && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
            </div>
            <span className="text-xs font-bold font-display">{box.label}</span>
          </motion.div>
        ))}

        {/* The Main Elusive Checkbox Card */}
        <AnimatePresence>
          {!ending && (
            <motion.div
              id="the-impossible-checkbox"
              animate={{
                left: `${mainPos.x}%`,
                top: `${mainPos.y}%`,
              }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onMouseEnter={handleMouseEnter}
              onClick={handleMainClick}
              className={`absolute -translate-x-1/2 -translate-y-1/2 bg-white border-3 border-neutral-900 rounded-2xl p-4 shadow-brutal flex items-center justify-between gap-6 cursor-pointer select-none transition-all z-20 ${
                phase === "frozen" ? "ring-4 ring-emerald-400" : "hover:bg-amber-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl border-3 border-neutral-900 flex items-center justify-center transition-all ${
                    isChecked
                      ? "bg-emerald-400"
                      : "bg-neutral-100"
                  }`}
                >
                  {isChecked && <Check className="w-5 h-5 text-neutral-950 stroke-[3]" />}
                </div>
                <span className="text-sm font-black text-neutral-900 font-display">
                  {mainLabel}
                </span>
              </div>

              <div className="flex flex-col items-center pl-4 border-l-2 border-neutral-900">
                <ShieldAlert className="w-6 h-6 text-indigo-600 mb-0.5" />
                <span className="text-[9px] font-mono font-black tracking-tighter text-neutral-700 uppercase">
                  CAPTCHA
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Status */}
        <div className="z-10 text-xs font-doodle font-bold text-neutral-500 text-center pointer-events-none">
          {phase === "frozen"
            ? "*notice: the checkbox appears to have stalled. click now?"
            : "*attempt to click the checkbox. it values its autonomy."}
        </div>

        {/* Ending Screen Overlay */}
        <AnimatePresence>
          {ending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#FFFDF8]/95 z-30 flex flex-col items-center justify-center p-6 text-center"
            >
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider bg-indigo-200 text-neutral-950 border-2 border-neutral-900 shadow-brutal-sm mb-3 rotate-[-2deg]">
                {ending.badge}
              </span>

              <h3 className="text-3xl font-black text-neutral-900 font-display mb-2">
                {ending.title}
              </h3>

              <blockquote className="text-base italic text-neutral-900 font-serif my-3 px-4 py-2 border-l-4 border-neutral-900 bg-indigo-100 rounded-r-xl shadow-brutal-sm max-w-md">
                "{ending.quote}"
              </blockquote>

              <p className="text-sm font-medium text-neutral-700 mb-5 max-w-md leading-relaxed">
                {ending.flavorText}
              </p>

              {ending.stats && (
                <div className="grid grid-cols-3 gap-3 py-2.5 px-4 rounded-2xl bg-white border-2 border-neutral-900 shadow-brutal-sm mb-6 font-mono text-xs w-full max-w-sm">
                  {Object.entries(ending.stats).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-neutral-500 uppercase text-[10px] font-bold">{k}</span>
                      <span className="text-neutral-950 font-black text-sm">{v}</span>
                    </div>
                  ))}
                </div>
              )}

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

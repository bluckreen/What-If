import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import {
  playChairDodge,
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

interface DecoyChair {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const CatchTheChair: React.FC<Props> = ({ onBack, onExploreOtherGames }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chairPos, setChairPos] = useState({ x: 50, y: 50 }); // percentage
  const [chairScale, setChairScale] = useState(1);
  const [chaseAttempts, setChaseAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState("CLICK THE CHAIR");
  const [decoys, setDecoys] = useState<DecoyChair[]>([]);
  const [isFollowingCursor, setIsFollowingCursor] = useState(false);
  const [isGiant, setIsGiant] = useState(false);
  const [hasLeftScreen, setHasLeftScreen] = useState(false);
  const [chairSaidSit, setChairSaidSit] = useState(false);
  const [ending, setEnding] = useState<GameEnding | null>(null);

  const startTimeRef = useRef(Date.now());
  const endingTargetRef = useRef<
    "catchable" | "disappear_1px" | "giant" | "mitosis" | "sit_now" | "stalker" | "leave_screen" | "unworthy"
  >(
    (["catchable", "disappear_1px", "giant", "mitosis", "sit_now", "stalker", "leave_screen", "unworthy"] as const)[
      Math.floor(Math.random() * 8)
    ]
  );

  // 30-second fatigue check (if unworthy ending is assigned or if chasing takes too long)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ending) {
        playComedicFailure();
        setEnding({
          id: "unworthy",
          title: "You Are Unworthy",
          badge: "🛋️ Fatigue Ending",
          quote: "The chair has decided you are not worthy to sit.",
          flavorText: "After 30 seconds of desperate cardio, the chair looked upon you with profound furniture apathy.",
          stats: {
            "Chase Duration": "30.0s",
            "Attempts": chaseAttempts,
            "Caloric Burn": "0.04 kcal",
          },
        });
      }
    }, 28000);

    return () => clearTimeout(timer);
  }, [ending, chaseAttempts]);

  // Handle cursor proximity and dodge
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ending || chairSaidSit || hasLeftScreen) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
    const cursorY = ((e.clientY - rect.top) / rect.height) * 100;

    const dx = cursorX - chairPos.x;
    const dy = cursorY - chairPos.y;
    const dist = Math.hypot(dx, dy);

    // If following cursor mode is active (Stalker ending)
    if (isFollowingCursor) {
      setChairPos({
        x: chairPos.x + dx * 0.08,
        y: chairPos.y + dy * 0.08,
      });
      return;
    }

    // Proximity threshold for dodge: 18% of container
    if (dist < 18) {
      const newAttempts = chaseAttempts + 1;
      setChaseAttempts(newAttempts);
      // Evasive "NOPE!" sound that becomes increasingly ridiculous
      playChairDodge(newAttempts);

      // Check for secret target endings:
      const target = endingTargetRef.current;

      // Ending: Leave the screen
      if (target === "leave_screen" && newAttempts >= 6) {
        setHasLeftScreen(true);
        playChairDodge(newAttempts + 2);
        setTimeout(() => {
          playComedicFailure();
          setEnding({
            id: "left_screen",
            title: "The Chair Resigned",
            badge: "🚪 Stage Left Ending",
            quote: "The chair has packed its cushions and left the simulation.",
            flavorText: "It slipped through the CSS overflow boundary. There is nowhere left to sit in this universe.",
            stats: {
              "Attempts": newAttempts,
              "Exit Velocity": "Mach 2",
              "Furniture Status": "Missing",
            },
          });
        }, 1200);
        return;
      }

      // Ending: 1-pixel disappearance
      if (target === "disappear_1px" && newAttempts >= 7) {
        playComedicFailure();
        setEnding({
          id: "evaporated",
          title: "1-Pixel Evaporation",
          badge: "👻 Quantum Vanish Ending",
          quote: "Chair vanished into the 4th dimension when you were 1 pixel away.",
          flavorText: "Your cursor was so close you could almost smell the mahogany. Then: pure void.",
          stats: {
            "Proximity": "1px",
            "Attempts": newAttempts,
            "Heartbreak": "100%",
          },
        });
        return;
      }

      // Ending: Chair becomes enormous
      if (target === "giant" && newAttempts >= 6) {
        setIsGiant(true);
        setTimeout(() => {
          playComedicFailure();
          setEnding({
            id: "mega_chair",
            title: "MEGA CHAIR",
            badge: "⛰️ Monumental Ending",
            quote: "The chair grew to monumental scale. You cannot sit on a monument.",
            flavorText: "It eclipsed your monitor. You are not a guest; you are an insect before the Throne.",
            stats: {
              "Chair Scale": "950%",
              "Room Covered": "99.8%",
              "Sit Feasibility": "0%",
            },
          });
        }, 1400);
        return;
      }

      // Ending: Mitosis (duplicates into 6 chairs)
      if (target === "mitosis" && newAttempts >= 5 && decoys.length === 0) {
        const newDecoys: DecoyChair[] = [];
        for (let i = 0; i < 6; i++) {
          newDecoys.push({
            id: i,
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
          });
        }
        setDecoys(newDecoys);
        setStatusMessage("MITOSIS! Good luck picking the real one.");
        return;
      }

      // Ending: Reverse Stalker (chair follows cursor)
      if (target === "stalker" && newAttempts >= 8 && !isFollowingCursor) {
        setIsFollowingCursor(true);
        setStatusMessage("RUN. THE CHAIR IS HUNGRY.");
        setTimeout(() => {
          playComedicFailure();
          setEnding({
            id: "stalker",
            title: "Predatory Furniture",
            badge: "👁️ Reverse Stalker Ending",
            quote: "In Soviet simulation, chair catches you.",
            flavorText: "It reversed the hunter-prey dynamic. The chair is now sitting in your psychological headspace.",
            stats: {
              "Fear Rating": "High",
              "Attempts": newAttempts,
              "Safety": "Compromised",
            },
          });
        }, 3200);
        return;
      }

      // Ending: Chair stops moving and says sit
      if (target === "sit_now" && newAttempts >= 7) {
        setChairSaidSit(true);
        setStatusMessage("Okay, fine. You look exhausted. You can sit now.");
        return;
      }

      // Standard progressive dodging:
      // Jump to opposite quadrant from cursor with erratic velocity
      let targetX = Math.random() * 70 + 15;
      let targetY = Math.random() * 70 + 15;

      // Push away from cursor
      if (Math.abs(targetX - cursorX) < 25) {
        targetX = cursorX > 50 ? 15 + Math.random() * 20 : 65 + Math.random() * 20;
      }
      if (Math.abs(targetY - cursorY) < 25) {
        targetY = cursorY > 50 ? 15 + Math.random() * 20 : 65 + Math.random() * 20;
      }

      setChairPos({ x: targetX, y: targetY });

      // Progressive shrink as it flees
      if (newAttempts > 3) {
        setChairScale(Math.max(0.65, 1 - newAttempts * 0.05));
      }

      if (newAttempts === 1) setStatusMessage("WHOOSH! Too slow.");
      else if (newAttempts === 3) setStatusMessage("It moved farther!");
      else if (newAttempts === 5) setStatusMessage("It's shrinking and teleporting!");
      else if (newAttempts > 8) setStatusMessage("You really thought I was going to let you sit? 😂");
    }
  };

  // Clicking the chair directly (or when it lets you sit)
  const handleChairClick = () => {
    if (chairSaidSit) {
      playAbsurdVictory();
      triggerConfetti();
      setEnding({
        id: "peaceful_sit",
        title: "Permission Granted",
        badge: "🪑 Mercy Ending",
        quote: "The chair took pity on you. You may finally rest.",
        flavorText: "It wasn't that you caught it. It just couldn't bear to watch you flail around any longer.",
        stats: {
          "Attempts": chaseAttempts,
          "Comfort Level": "Lukewarm",
          "Dignity Retained": "12%",
        },
      });
      return;
    }

    if (endingTargetRef.current === "catchable" && chaseAttempts >= 4) {
      playAbsurdVictory();
      triggerConfetti();
      setEnding({
        id: "miracle_catch",
        title: "Physics Defied!",
        badge: "✨ Miracle Catch Ending",
        quote: "Wait... you actually touched it?! The physics engine is weeping.",
        flavorText: "Against all mathematical odds, your click registered. You sit upon the throne of improbable reflexes.",
        stats: {
          "Reaction Speed": "Godlike",
          "Attempts": chaseAttempts,
          "Odds": "1 in 10,000",
        },
      });
      return;
    }

    // If clicked prematurely, it dodges anyway with comedic whoosh
    playChairDodge(chaseAttempts + 1);
    setChairPos({ x: Math.random() * 70 + 15, y: Math.random() * 70 + 15 });
  };

  const handleReset = () => {
    playButtonPress("secondary");
    setChairPos({ x: 50, y: 50 });
    setChairScale(1);
    setChaseAttempts(0);
    setDecoys([]);
    setIsFollowingCursor(false);
    setIsGiant(false);
    setHasLeftScreen(false);
    setChairSaidSit(false);
    setStatusMessage("CLICK THE CHAIR");
    setEnding(null);
    endingTargetRef.current = (
      ["catchable", "disappear_1px", "giant", "mitosis", "sit_now", "stalker", "leave_screen", "unworthy"] as const
    )[Math.floor(Math.random() * 8)];
    startTimeRef.current = Date.now();
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
            Dodges: <strong className="text-amber-600 font-black">{chaseAttempts}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-yellow-300 border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-black">
            🪑 Target: The Chair
          </span>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="w-full h-[460px] bg-[#FFFDF8] rounded-3xl border-4 border-neutral-900 shadow-brutal-xl relative overflow-hidden flex flex-col items-center justify-between p-6 select-none"
      >
        {/* Banner Title */}
        <div className="z-10 text-center pointer-events-none">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-300 border-2 border-neutral-900 text-neutral-950 font-mono text-xs font-black tracking-wide uppercase shadow-brutal-sm rotate-[-2deg] mb-1">
            Experiment 2: Catch the Chair
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-display tracking-tight mt-1">
            {statusMessage}
          </h2>
        </div>

        {/* Decoy Chairs (Mitosis mode) */}
        {decoys.map((decoy) => (
          <motion.div
            key={decoy.id}
            initial={{ scale: 0 }}
            animate={{
              x: `${decoy.x}%`,
              y: `${decoy.y}%`,
              scale: 0.8,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            onClick={() => {
              playComedicFailure();
              setStatusMessage("DECOY! That was a cardboard hologram.");
            }}
            className="absolute text-5xl cursor-pointer hover:opacity-80 transition-opacity"
            style={{ left: `${decoy.x}%`, top: `${decoy.y}%` }}
          >
            🪑
          </motion.div>
        ))}

        {/* The Main Elusive Chair */}
        <AnimatePresence>
          {!ending && !hasLeftScreen && (
            <motion.div
              id="the-elusive-chair"
              animate={{
                left: `${chairPos.x}%`,
                top: `${chairPos.y}%`,
                scale: isGiant ? 6 : chairScale,
                rotate: isFollowingCursor ? [0, -10, 10, 0] : 0,
              }}
              transition={
                isFollowingCursor
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 350, damping: 25 }
              }
              onClick={handleChairClick}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none transition-transform z-20 ${
                chairSaidSit ? "animate-bounce" : ""
              }`}
            >
              <div className="relative group">
                <span className="text-6xl md:text-7xl filter drop-shadow-[4px_4px_0px_#1E1B18]">
                  🪑
                </span>
                {chairSaidSit && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-400 border-2 border-neutral-900 text-neutral-950 font-black font-display text-xs px-3 py-1 rounded-full shadow-brutal-sm">
                    SIT HERE
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Hint */}
        <div className="z-10 text-xs font-doodle font-bold text-neutral-500 text-center pointer-events-none">
          *try moving your cursor near it. the chair possesses keen emotional intuition.
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
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider bg-yellow-300 text-neutral-950 border-2 border-neutral-900 shadow-brutal-sm mb-3 rotate-[-2deg]">
                {ending.badge}
              </span>

              <h3 className="text-3xl font-black text-neutral-900 font-display mb-2">
                {ending.title}
              </h3>

              <blockquote className="text-base italic text-neutral-900 font-serif my-3 px-4 py-2 border-l-4 border-neutral-900 bg-amber-100 rounded-r-xl shadow-brutal-sm max-w-md">
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
                  Chase Again
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

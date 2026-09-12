import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw, Sparkles, Crosshair } from "lucide-react";
import {
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

export const DontMoveYourMouse: React.FC<Props> = ({ onBack, onExploreOtherGames }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"waiting_start" | "active" | "fake_win" | "ended">("waiting_start");
  const [timeSurvived, setTimeSurvived] = useState(0);
  const [circlePos, setCirclePos] = useState({ x: 50, y: 50 }); // percentage
  const [circleRadius, setCircleRadius] = useState(70); // px
  const [isCircleVisible, setIsCircleVisible] = useState(true);
  const [isFullCover, setIsFullCover] = useState(false);
  const [narrativeWarning, setNarrativeWarning] = useState("Place your cursor inside the circle to begin.");
  const [ending, setEnding] = useState<GameEnding | null>(null);

  const endingTargetRef = useRef<"normal" | "fake_ending" | "survivor_30s" | "screen_takeover">(
    (["normal", "fake_ending", "survivor_30s", "screen_takeover"] as const)[Math.floor(Math.random() * 4)]
  );

  const startTimeRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const insideRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const fakeWinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Survival Timer & Active Cheating Script
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (gameState === "active") {
      timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setTimeSurvived(elapsed);

        const targetEnding = endingTargetRef.current;

        // Cheating Phase 1 (0-3s): Tiny circle & drifting
        if (elapsed > 2 && elapsed <= 6) {
          setCircleRadius(55);
          setCirclePos(prev => ({
            x: 50 + Math.sin(elapsed * 1.5) * 12,
            y: 50 + Math.cos(elapsed * 1.5) * 8,
          }));
          setNarrativeWarning("Hold still... The circle is slightly drifting on purpose.");
        }

        // Cheating Phase 2 (6-11s): Circle shrinks further & jumps
        if (elapsed > 6 && elapsed <= 12) {
          setCircleRadius(40);
          setCirclePos(prev => ({
            x: 50 + Math.sin(elapsed * 2.2) * 22,
            y: 50 + Math.cos(elapsed * 2.8) * 18,
          }));
          setNarrativeWarning("DO NOT FLINCH. Circle radius reducing.");
        }

        // Cheating Phase 3 (12-16s): Sudden flicker / disappearance or Ending branch!
        if (elapsed > 12 && elapsed < 15) {
          if (targetEnding === "fake_ending" && !fakeWinTimeoutRef.current) {
            // Fake Ending Routine!
            setGameState("fake_win");
            setIsCircleVisible(false);
            playAbsurdVictory();
            setNarrativeWarning("🎉 CONGRATULATIONS! You completed the experiment.");

            fakeWinTimeoutRef.current = setTimeout(() => {
              setIsCircleVisible(true);
              setCirclePos({ x: 25, y: 35 });
              setNarrativeWarning("Wait.");

              // User inevitably twitches or doesn't have cursor in the new spot!
              setTimeout(() => {
                playComedicFailure();
                setEnding({
                  id: "fake_win_failed",
                  title: "YOU FELL FOR IT",
                  badge: "🪤 Psychological Trap Ending",
                  quote: "Circle returned somewhere else and you relaxed for 0.1s.",
                  flavorText: "You dropped your guard when the game congratulated you. The oldest psychological trick in the book.",
                  stats: {
                    "Survived": "14.2s",
                    "Gullibility": "100%",
                    "Trust in UI": "Ruined",
                  },
                });
              }, 1200);
            }, 2500);
            return;
          }

          if (targetEnding === "screen_takeover") {
            setIsFullCover(true);
            setCircleRadius(1200);
            setNarrativeWarning("The circle expands infinitely. You cannot lose anymore.");
            setTimeout(() => {
              playAbsurdVictory();
              triggerConfetti();
              setEnding({
                id: "universe_consumed",
                title: "The Circle Consumed All",
                badge: "🌌 Cosmic Takeover Ending",
                quote: "Technically, you can't lose anymore. The circle covers the universe.",
                flavorText: "By expanding to infinite bounds, losing became mathematically impossible. A hollow victory.",
                stats: {
                  "Circle Radius": "999,999px",
                  "Rules Exploited": "1",
                  "Victory Legitimacy": "Dubious",
                },
              });
            }, 3000);
            return;
          }

          // Otherwise, flicker disappearance
          setIsCircleVisible(elapsed % 1 < 0.6);
        }

        // Cheating Phase 4 (16s+): Survival threshold reached!
        if (elapsed >= 22) {
          playAbsurdVictory();
          triggerConfetti();
          setEnding({
            id: "survivor_30s",
            title: "YOU WON. BUT WHY?",
            badge: "🏆 Absurd Discipline Ending",
            quote: "You won. But why didn't you move? 😂 What are you doing with your life?",
            flavorText: "You possessed the iron will of a Tibetan monk. You stared unblinkingly at a green circle for half a minute. Was it worth it?",
            stats: {
              "Survived": `${elapsed.toFixed(1)}s`,
              "Blinks": "0",
              "Life Choices Questioned": "12",
            },
          });
        }
      }, 100);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (fakeWinTimeoutRef.current) clearTimeout(fakeWinTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState]);

  // Mouse movement and boundary validation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ending || isFullCover) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const circleCenterX = (circlePos.x / 100) * rect.width;
    const circleCenterY = (circlePos.y / 100) * rect.height;

    const dist = Math.hypot(mouseX - circleCenterX, mouseY - circleCenterY);
    const isInside = dist <= circleRadius;

    // Start trigger when entering circle
    if (gameState === "waiting_start") {
      if (isInside) {
        insideRef.current = true;
        playButtonPress("primary");
        startTimeRef.current = Date.now();
        setGameState("active");
        setNarrativeWarning("DO NOT MOVE YOUR CURSOR. Keep it perfectly still.");
      }
      return;
    }

    // Active state failure detection
    if (gameState === "active") {
      if (!isInside) {
        // Leaving the circle is a loss
        playComedicFailure();
        setGameState("ended");
        setEnding({
          id: "normal_loss",
          title: "YOU FAILED",
          badge: "❌ Movement Violation Ending",
          quote: "You moved. Or the circle moved. Either way, you're guilty.",
          flavorText: "The rule was simple: do not move. But the circle had other plans.",
          stats: {
            "Survival Time": `${timeSurvived.toFixed(2)}s`,
            "Distance Slipped": `${Math.round(dist - circleRadius)}px`,
            "Tremor Level": "Fatal",
          },
        });
      }
    }
  };

  const handleReset = () => {
    playButtonPress("secondary");
    setGameState("waiting_start");
    setTimeSurvived(0);
    setCirclePos({ x: 50, y: 50 });
    setCircleRadius(70);
    setIsCircleVisible(true);
    setIsFullCover(false);
    setNarrativeWarning("Place your cursor inside the circle to begin.");
    setEnding(null);
    endingTargetRef.current = (["normal", "fake_ending", "survivor_30s", "screen_takeover"] as const)[
      Math.floor(Math.random() * 4)
    ];
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

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-white border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-bold">
            Time: <strong className="text-emerald-600 font-black">{timeSurvived.toFixed(1)}s</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-300 border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-black uppercase">
            {gameState}
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
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-300 border-2 border-neutral-900 text-neutral-950 font-mono text-xs font-black tracking-wide uppercase shadow-brutal-sm rotate-[-2deg] mb-1">
            Experiment 3: Don't Move Your Mouse
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-display tracking-tight mt-1">
            DO NOT MOVE YOUR CURSOR.
          </h2>
          <p className="text-xs font-mono font-bold text-neutral-700 mt-1 max-w-sm">
            {narrativeWarning}
          </p>
        </div>

        {/* The Safe Circle */}
        <AnimatePresence>
          {isCircleVisible && !ending && (
            <motion.div
              id="dont-move-circle"
              animate={{
                left: `${circlePos.x}%`,
                top: `${circlePos.y}%`,
                width: isFullCover ? "200%" : `${circleRadius * 2}px`,
                height: isFullCover ? "200%" : `${circleRadius * 2}px`,
              }}
              transition={
                isFullCover
                  ? { duration: 1.2, ease: "easeOut" }
                  : { type: "spring", stiffness: 120, damping: 18 }
              }
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-neutral-900 bg-emerald-300/80 shadow-brutal flex items-center justify-center pointer-events-none ${
                gameState === "waiting_start" ? "animate-pulse" : ""
              }`}
            >
              {gameState === "waiting_start" && (
                <div className="flex flex-col items-center text-center text-neutral-950">
                  <Crosshair className="w-7 h-7 animate-spin mb-1 text-neutral-950" />
                  <span className="text-[11px] font-mono tracking-wider font-black uppercase">
                    HOVER HERE
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Hint */}
        <div className="z-10 text-xs font-doodle font-bold text-neutral-500 text-center pointer-events-none">
          {gameState === "waiting_start"
            ? "*hover over the green target circle to activate."
            : "*keep cursor steady. do not twitch."}
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
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider bg-emerald-300 text-neutral-950 border-2 border-neutral-900 shadow-brutal-sm mb-3 rotate-[-2deg]">
                {ending.badge}
              </span>

              <h3 className="text-3xl font-black text-neutral-900 font-display mb-2">
                {ending.title}
              </h3>

              <blockquote className="text-base italic text-neutral-900 font-serif my-3 px-4 py-2 border-l-4 border-neutral-900 bg-emerald-100 rounded-r-xl shadow-brutal-sm max-w-md">
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

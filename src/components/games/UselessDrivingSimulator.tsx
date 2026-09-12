import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw, Sparkles, Gauge, Wind, AlertTriangle } from "lucide-react";
import {
  playCarAccelerator,
  playCarBrake,
  playCarSteer,
  playComedicFailure,
  playAbsurdVictory,
  playButtonPress,
} from "../../utils/audio";
import { GameEnding } from "../../types";
import { CarRearView } from "./CarRearView";

interface Props {
  onBack: () => void;
  onExploreOtherGames: () => void;
}

interface RoadProp {
  id: number;
  side: "left" | "right";
  progress: number; // 0.0 at horizon to 1.0 past bottom
  type: "tree" | "cactus" | "lamp" | "sign";
  signText?: string;
}

const FUNNY_SIGNS = [
  "SPEED LIMIT: YES",
  "OVERTHINKING AHEAD",
  "NEXT EXIT: VOID",
  "CAUTION: CHAIRS",
  "NO U-TURNS IN LIFE",
  "GAS: $99.99/GAL",
  "ROAD ENDS (MAYBE)",
  "DUCK CROSSING 🦆",
  "SLOW DOWN & REGRET",
];

export const UselessDrivingSimulator: React.FC<Props> = ({ onBack, onExploreOtherGames }) => {
  // Start in active cruising motion so the road is immediately running!
  const [speed, setSpeed] = useState(38); // MPH
  const [carX, setCarX] = useState(50); // percentage across road (0 to 100)
  const [carAngle, setCarAngle] = useState(0); // degrees
  const [carScale, setCarScale] = useState(1);
  const [gear, setGear] = useState("D");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [ending, setEnding] = useState<GameEnding | null>(null);
  const [driveTime, setDriveTime] = useState(0);
  const [distanceMiles, setDistanceMiles] = useState(0.12);
  const [autonomousActive, setAutonomousActive] = useState(false);
  const [collidedObject, setCollidedObject] = useState<string | null>(null);
  const [steerTilt, setSteerTilt] = useState(0);
  const [isBraking, setIsBraking] = useState(false);

  // Secret target ending
  const secretTargetRef = useRef<
    "ending_a_reverse" | "ending_b_autonomous" | "ending_c_instant_brake" | "ending_d_offscreen" | "ending_e_absurd_crash"
  >(
    ([
      "ending_a_reverse",
      "ending_b_autonomous",
      "ending_c_instant_brake",
      "ending_d_offscreen",
      "ending_e_absurd_crash",
    ] as const)[Math.floor(Math.random() * 5)]
  );

  const startTimeRef = useRef(Date.now());
  const controlPressesRef = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Road animation state
  const [roadOffset, setRoadOffset] = useState(0);
  const [suspensionBob, setSuspensionBob] = useState(0);

  // Dynamic Roadside Scenery zooming past
  const [propsList, setPropsList] = useState<RoadProp[]>([
    { id: 1, side: "left", progress: 0.15, type: "tree" },
    { id: 2, side: "right", progress: 0.35, type: "sign", signText: "SPEED LIMIT: YES" },
    { id: 3, side: "left", progress: 0.6, type: "lamp" },
    { id: 4, side: "right", progress: 0.82, type: "cactus" },
    { id: 5, side: "left", progress: 0.95, type: "sign", signText: "OVERTHINKING AHEAD" },
  ]);

  // Main animation frame loop for running road and scenery
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.08, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const curSpeed = speedRef.current;

      if (!ending) {
        // Continuous road movement proportional to current speed
        const speedFactor = curSpeed / 30;
        setRoadOffset(prev => (prev + speedFactor * dt * 2.8) % 1.0);

        // Distance & time counter
        setDistanceMiles(prev => prev + Math.max(0, curSpeed * dt) / 3600);
        setDriveTime((Date.now() - startTimeRef.current) / 1000);

        // Engine suspension rumble (higher speed = faster small vibration)
        if (Math.abs(curSpeed) > 1) {
          const rumbleFreq = Math.max(8, Math.min(24, Math.abs(curSpeed) * 0.25));
          setSuspensionBob(Math.sin(currentTime * 0.001 * rumbleFreq * Math.PI * 2) * 2.2);
        } else {
          setSuspensionBob(0);
        }

        // Advance roadside props down the screen towards the camera!
        setPropsList(prevProps =>
          prevProps.map(prop => {
            const nextProgress = prop.progress + speedFactor * dt * 0.65;
            if (nextProgress > 1.05) {
              // Wrap back to horizon with random side and prop
              const sides: ("left" | "right")[] = ["left", "right"];
              const randomSide = sides[Math.floor(Math.random() * sides.length)];
              const types: ("tree" | "cactus" | "lamp" | "sign")[] = ["tree", "cactus", "lamp", "sign"];
              const randomType = types[Math.floor(Math.random() * types.length)];
              const randomSign = FUNNY_SIGNS[Math.floor(Math.random() * FUNNY_SIGNS.length)];

              return {
                ...prop,
                side: randomSide,
                progress: 0.01 + Math.random() * 0.08,
                type: randomType,
                signText: randomSign,
              };
            }
            return {
              ...prop,
              progress: nextProgress,
            };
          })
        );
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [ending]);

  // Ending A check: Drives smoothly for 5.5s, then launches backward into stratosphere!
  useEffect(() => {
    if (secretTargetRef.current === "ending_a_reverse" && driveTime >= 6.0 && !ending) {
      playCarBrake();
      setSpeed(-148);
      setGear("R!?");
      setCarScale(0.3);
      setTimeout(() => {
        playComedicFailure();
        setEnding({
          id: "stratosphere_reverse",
          title: "Supersonic Reverse",
          badge: "🚀 Space Program Ending",
          quote: "The car drove normally for 6 seconds... then reversed into the stratosphere.",
          flavorText: "You thought you had figured out the handling. The transmission had other plans for your earthly coordinates.",
          stats: {
            "Reverse Speed": "-148 MPH",
            "Altitude": "34,200 ft",
            "Control Level": "0.0%",
          },
        });
      }, 1600);
    }

    // Ending B check: Autonomous takeover after 6 user inputs
    if (secretTargetRef.current === "ending_b_autonomous" && controlPressesRef.current >= 6 && !ending && !autonomousActive) {
      setAutonomousActive(true);
      playAbsurdVictory();
      setSpeed(58);
      setGear("AUTO");
      setTimeout(() => {
        setEnding({
          id: "autonomous_discovery",
          title: "Autonomous Takeover",
          badge: "🤖 Self-Driving Ending",
          quote: "You have discovered autonomous driving. The car doesn't care about your input.",
          flavorText: "It put on digital sunglasses and started playing synthwave. Your steering wheel was unplugged the whole time.",
          stats: {
            "AI Confidence": "100%",
            "Driver Utility": "Ornamental",
            "Speed": "Cruising",
          },
        });
      }, 2200);
    }
  }, [driveTime, ending, autonomousActive]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (ending) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        handleAccelerator();
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S" || e.key === " ") {
        e.preventDefault();
        handleBrake();
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleSteerLeft();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleSteerRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // 1. Accelerator Handler
  const handleAccelerator = () => {
    if (ending || autonomousActive) return;
    controlPressesRef.current++;
    playCarAccelerator();
    setActiveAction("ACCELERATING!!");

    const target = secretTargetRef.current;

    // Trigger Ending E (Absurd Crash into giant rubber duck)
    if (target === "ending_e_absurd_crash" && controlPressesRef.current >= 4) {
      setCollidedObject("🦆 A Giant Rubber Duck");
      setSpeed(112);
      playCarBrake();
      setTimeout(() => {
        playComedicFailure();
        setEnding({
          id: "absurd_crash",
          title: "Existential Collision",
          badge: "💥 Crash Report Ending",
          quote: "Crash Report: You collided with a giant floating duck. You were not even driving.",
          flavorText: "Insurance adjusters are currently refusing to acknowledge the physical existence of your vehicle.",
          stats: {
            "Impact Speed": "112 MPH",
            "Obstacle": "Giant Duck",
            "Driver Fault": "100%",
          },
        });
      }, 1300);
      return;
    }

    // Contradictory playful responses
    const randomChaos = Math.random();
    if (randomChaos < 0.28) {
      // Reverses suddenly!
      setSpeed(-38);
      setGear("R");
      playCarBrake();
    } else if (randomChaos < 0.55) {
      // Rocket speed
      setSpeed(118);
      setGear("NITRO");
    } else if (randomChaos < 0.8) {
      // Donut 360 spin
      setSpeed(72);
      setCarAngle(prev => prev + 360);
      playCarSteer();
    } else {
      // Snail crawl
      setSpeed(0.5);
      setGear("CRAWL");
    }
  };

  // 2. Brake Handler
  const handleBrake = () => {
    if (ending || autonomousActive) return;
    controlPressesRef.current++;
    playCarBrake();
    setActiveAction("BRAKING?!");
    setIsBraking(true);
    setTimeout(() => setIsBraking(false), 600);

    const target = secretTargetRef.current;

    // Ending C: The Instant Brake (Brake stops the car, that's the whole joke)
    if (target === "ending_c_instant_brake" && controlPressesRef.current >= 2) {
      setSpeed(0);
      setGear("P");
      setIsBraking(true);
      setTimeout(() => {
        playAbsurdVictory();
        setEnding({
          id: "instant_brake",
          title: "That Was The Entire Game",
          badge: "🛑 Anti-Climactic Ending",
          quote: "The car stopped. Congratulations. That was the entire game.",
          flavorText: "You pressed brake, and the vehicle came to a complete halt. You waited for fireworks. None arrived.",
          stats: {
            "Final Velocity": "0.00 MPH",
            "Thrills Received": "0/10",
            "Time Wasted": "Minimal",
          },
        });
      }, 1100);
      return;
    }

    // Otherwise: Brake launches forward into hyper-drive!
    playCarAccelerator();
    setSpeed(142);
    setGear("HYPER");
  };

  // 3. Steering Left Handler
  const handleSteerLeft = () => {
    if (ending || autonomousActive) return;
    controlPressesRef.current++;
    playCarSteer();
    setActiveAction("STEERING LEFT");
    setSteerTilt(-14);
    setTimeout(() => setSteerTilt(0), 400);

    const target = secretTargetRef.current;

    // Ending D: Off-screen departure
    if (target === "ending_d_offscreen" && controlPressesRef.current >= 4) {
      setCarX(-35);
      setCarAngle(-25);
      playCarBrake();
      setTimeout(() => {
        playComedicFailure();
        setEnding({
          id: "offscreen_departure",
          title: "Left The Simulation",
          badge: "🗺️ Out of Bounds Ending",
          quote: "Your car has veered off-screen and left the simulation.",
          flavorText: "It drove beyond the border of the webpage. It is currently roaming your operating system desktop.",
          stats: {
            "X Position": "-35%",
            "Road Adherence": "Negative",
            "Lost Car Value": "$4,200",
          },
        });
      }, 1200);
      return;
    }

    // Contradictory physics: steering left swerves right!
    setCarX(prev => Math.min(82, prev + 24));
    setCarAngle(12);
    setTimeout(() => setCarAngle(0), 380);
  };

  // 4. Steering Right Handler
  const handleSteerRight = () => {
    if (ending || autonomousActive) return;
    controlPressesRef.current++;
    playCarSteer();
    setActiveAction("STEERING RIGHT");
    setSteerTilt(14);
    setTimeout(() => setSteerTilt(0), 400);

    // Contradictory physics: steering right swerves left!
    setCarAngle(-12);
    setTimeout(() => setCarAngle(0), 380);
    setCarX(prev => Math.max(18, prev - 22));
  };

  const handleReset = () => {
    playButtonPress("secondary");
    setSpeed(38);
    setCarX(50);
    setCarAngle(0);
    setCarScale(1);
    setSteerTilt(0);
    setIsBraking(false);
    setGear("D");
    setActiveAction(null);
    setEnding(null);
    setAutonomousActive(false);
    setCollidedObject(null);
    setDistanceMiles(0.12);
    controlPressesRef.current = 0;
    startTimeRef.current = Date.now();
    secretTargetRef.current = (
      [
        "ending_a_reverse",
        "ending_b_autonomous",
        "ending_c_instant_brake",
        "ending_d_offscreen",
        "ending_e_absurd_crash",
      ] as const
    )[Math.floor(Math.random() * 5)];
  };

  // Calculate 8 perspective dashed lines moving down the center of the road
  const centerDashes = Array.from({ length: 8 }, (_, i) => {
    // Offset each dash evenly, wrapped between 0 and 1
    const p = (i / 8 + roadOffset) % 1.0;
    // Perspective exponential scaling: dashes spread out and grow larger as they near bottom
    const yPercent = Math.pow(p, 1.8) * 100;
    const heightPx = Math.max(4, p * 38);
    const widthPx = Math.max(2, p * 8);
    const opacity = Math.min(1, p * 1.5);
    return { id: i, yPercent, heightPx, widthPx, opacity };
  });

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center py-4 px-3 select-none">
      {/* Top Header Controls & Cockpit Telemetry */}
      <div className="w-full flex items-center justify-between mb-3 gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-neutral-900 shadow-brutal-sm text-xs sm:text-sm font-bold text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Spiral
        </button>

        {/* Live Gauges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-bold">
            <Gauge className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 font-black text-sm">{Math.round(speed)}</span>
            <span className="text-[10px] text-neutral-500 font-bold">MPH</span>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-yellow-300 border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-black">
            GEAR: {gear}
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-100 border-2 border-neutral-900 shadow-brutal-sm text-neutral-800 font-bold text-[11px]">
            <span>{distanceMiles.toFixed(2)} mi</span>
          </div>
        </div>
      </div>

      {/* Main Driving Stage: Perspective Highway in Active Motion */}
      <div className="w-full h-[350px] bg-gradient-to-b from-amber-100 via-sky-200 to-amber-50 rounded-3xl border-4 border-neutral-900 shadow-brutal-xl relative overflow-hidden flex flex-col items-center justify-between">
        {/* Horizon Sky & Distant Mountains */}
        <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-sky-300 to-amber-200 border-b-2 border-neutral-800/40 pointer-events-none overflow-hidden">
          {/* Distant Sun */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-yellow-300 border-2 border-amber-400 opacity-90 shadow-lg" />

          {/* Distant Mountains Silhouettes */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end opacity-40 px-2">
            <span className="text-4xl translate-y-2">🏔️</span>
            <span className="text-3xl translate-y-1">⛰️</span>
            <span className="text-5xl translate-y-3">🏔️</span>
            <span className="text-3xl translate-y-1">⛰️</span>
            <span className="text-4xl translate-y-2">🏔️</span>
          </div>

          {/* Floating comic clouds */}
          <div className="absolute top-3 left-6 text-xl opacity-75">☁️</div>
          <div className="absolute top-6 right-10 text-2xl opacity-75">☁️</div>
        </div>

        {/* Roadside Greenery / Desert Ground */}
        <div className="absolute top-[28%] bottom-0 left-0 right-0 bg-[#3a7d44] pointer-events-none overflow-hidden" />

        {/* The 3D Running Highway Surface */}
        <div className="absolute top-[28%] bottom-0 left-0 right-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Highway Trapazoid with Perspective */}
          <div
            className="w-full h-full relative flex items-center justify-center"
            style={{
              perspective: "260px",
              perspectiveOrigin: "50% 10%",
            }}
          >
            {/* Asphalt Highway Canvas */}
            <div
              className="w-80 h-full bg-[#202124] relative shadow-2xl overflow-hidden"
              style={{
                transform: "rotateX(48deg)",
                transformOrigin: "bottom center",
                width: "90%",
                maxWidth: "380px",
              }}
            >
              {/* Alternating Moving Road Surface Texture Bands (Arcade Style!) */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, #000 0px, #000 24px, #444 24px, #444 48px)",
                  backgroundPositionY: `${roadOffset * 96}px`,
                }}
              />

              {/* Left Curbs / Rumble Strips (Alternating Red and White) */}
              <div
                className="absolute top-0 bottom-0 left-0 w-3.5 sm:w-4"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, #ef4444 0px, #ef4444 20px, #ffffff 20px, #ffffff 40px)",
                  backgroundPositionY: `${roadOffset * 80}px`,
                }}
              />

              {/* Right Curbs / Rumble Strips (Alternating Red and White) */}
              <div
                className="absolute top-0 bottom-0 right-0 w-3.5 sm:w-4"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, #ef4444 0px, #ef4444 20px, #ffffff 20px, #ffffff 40px)",
                  backgroundPositionY: `${roadOffset * 80}px`,
                }}
              />

              {/* Center Dashed Lane Markings Racing Downward in Perspective */}
              {centerDashes.map(dash => (
                <div
                  key={dash.id}
                  className="absolute left-1/2 -translate-x-1/2 bg-yellow-400 rounded-sm shadow-sm"
                  style={{
                    top: `${dash.yPercent}%`,
                    width: `${dash.widthPx}px`,
                    height: `${dash.heightPx}px`,
                    opacity: dash.opacity,
                  }}
                />
              ))}

              {/* Speed Wind Streaks on Highway when driving fast */}
              {Math.abs(speed) > 40 && (
                <>
                  <div
                    className="absolute top-0 bottom-0 left-8 w-1 bg-white/20 animate-pulse"
                    style={{
                      backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 30px, white 30px, white 60px)",
                      backgroundPositionY: `${roadOffset * 180}px`,
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 right-8 w-1 bg-white/20 animate-pulse"
                    style={{
                      backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 30px, white 30px, white 60px)",
                      backgroundPositionY: `${roadOffset * 180}px`,
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Zooming Roadside Scenery (Trees, Signs, Streetlamps zooming towards camera!) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {propsList.map(prop => {
            // Perspective math:
            // progress 0.0 is near horizon center, progress 1.0 is wide at bottom
            const p = prop.progress;
            // y position from horizon (28%) to bottom (100%)
            const topPercent = 28 + Math.pow(p, 1.6) * 72;
            // x position spreads out outward from center
            const xSpread = Math.pow(p, 1.4) * 44; // percent from center
            const leftPercent = prop.side === "left" ? 50 - xSpread : 50 + xSpread;
            // Scale grows as it nears camera
            const scale = Math.max(0.25, Math.pow(p, 1.5) * 1.5);
            const opacity = Math.min(1, p * 2.2);

            return (
              <div
                key={prop.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity flex flex-col items-center"
                style={{
                  top: `${topPercent}%`,
                  left: `${leftPercent}%`,
                  transform: `scale(${scale})`,
                  opacity,
                }}
              >
                {prop.type === "tree" && (
                  <span className="text-3xl filter drop-shadow-[2px_2px_0px_#1E1B18]">🌲</span>
                )}
                {prop.type === "cactus" && (
                  <span className="text-3xl filter drop-shadow-[2px_2px_0px_#1E1B18]">🌵</span>
                )}
                {prop.type === "lamp" && (
                  <span className="text-2xl filter drop-shadow-[2px_2px_0px_#1E1B18]">💡</span>
                )}
                {prop.type === "sign" && (
                  <div className="bg-yellow-300 border-2 border-neutral-900 rounded-md px-1.5 py-0.5 shadow-brutal-sm text-[9px] font-black font-mono text-neutral-950 whitespace-nowrap rotate-[-2deg]">
                    {prop.signText}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* High Speed Wind Streak Overlays */}
        {Math.abs(speed) > 55 && (
          <div className="absolute inset-0 pointer-events-none z-15 flex justify-between px-4 overflow-hidden">
            <div className="w-12 h-full flex flex-col justify-around opacity-40">
              <div className="w-full h-1 bg-white/70 rounded-full animate-ping" />
              <div className="w-3/4 h-1 bg-white/70 rounded-full animate-pulse" />
              <div className="w-5/6 h-1 bg-white/70 rounded-full animate-ping" />
            </div>
            <div className="w-12 h-full flex flex-col justify-around opacity-40">
              <div className="w-3/4 h-1 bg-white/70 rounded-full animate-pulse" />
              <div className="w-full h-1 bg-white/70 rounded-full animate-ping" />
              <div className="w-4/5 h-1 bg-white/70 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Top Floating Simulation Badge */}
        <div className="z-20 text-center pointer-events-none pt-3">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-200 border-2 border-neutral-900 text-neutral-950 font-mono text-xs font-black tracking-wide uppercase shadow-brutal-sm rotate-[-2deg] mb-1">
            Experiment 5: Useless Driving Simulator
          </span>
          {activeAction && (
            <div className="text-xs font-mono text-rose-600 animate-pulse font-black mt-0.5 bg-rose-100 px-2 py-0.5 rounded-lg border-2 border-neutral-900 shadow-brutal-sm block">
              {activeAction}
            </div>
          )}
        </div>

        {/* Approaching Hazard: Giant Rubber Duck for Ending E */}
        {collidedObject && (
          <div className="z-25 text-6xl animate-bounce absolute top-28 left-1/2 -translate-x-1/2 filter drop-shadow-[4px_4px_0px_#000]">
            🦆
          </div>
        )}

        {/* The Forward-Facing Car Moving & Bouncing on the Highway */}
        <AnimatePresence>
          {!ending && (
            <motion.div
              id="useless-simulator-car"
              animate={{
                left: `${carX}%`,
                rotate: carAngle + steerTilt,
                scale: carScale,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 18,
              }}
              className="absolute bottom-5 -translate-x-1/2 cursor-pointer z-20"
            >
              <div className="relative group flex flex-col items-center">
                {/* Forward-Facing Car (Rear-View Perspective) */}
                <CarRearView
                  speed={speed}
                  gear={gear}
                  isBraking={isBraking}
                  steerTilt={steerTilt}
                  suspensionBob={suspensionBob}
                />

                {/* Speed Booster Visual Feedback */}
                {speed > 95 && (
                  <div className="absolute -top-3 -right-3 text-xs font-mono font-black text-rose-600 bg-yellow-300 px-2 py-0.5 rounded-full border-2 border-neutral-900 shadow-brutal-sm animate-bounce flex items-center gap-1 z-30">
                    <Wind className="w-3 h-3 text-rose-600 animate-spin" />
                    <span>NITRO!!</span>
                  </div>
                )}

                {/* Reverse Indicator */}
                {speed < 0 && (
                  <div className="absolute -top-3 -left-3 text-[10px] font-mono font-black bg-rose-500 text-white px-2 py-0.5 rounded-md border-2 border-neutral-900 shadow-brutal-sm animate-pulse z-30">
                    REVERSE ⚠️
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Hint */}
        <div className="z-20 pb-3 text-xs font-doodle font-bold text-neutral-700 text-center pointer-events-none bg-white/85 px-3.5 py-1 rounded-full border border-neutral-900 shadow-brutal-sm mb-1">
          {autonomousActive
            ? "🤖 autonomous driving engaged. driver is ornamental."
            : "*road is live. use WASD / Arrow keys or pedals below."}
        </div>

        {/* Ending Screen Modal Overlay */}
        <AnimatePresence>
          {ending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#FFFDF8]/95 z-30 flex flex-col items-center justify-center p-6 text-center"
            >
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider bg-purple-200 text-neutral-950 border-2 border-neutral-900 shadow-brutal-sm mb-2 rotate-[-2deg]">
                {ending.badge}
              </span>

              <h3 className="text-3xl font-black text-neutral-900 font-display mb-1">
                {ending.title}
              </h3>

              <blockquote className="text-base italic text-neutral-900 font-serif my-2 px-4 py-1.5 border-l-4 border-neutral-900 bg-purple-100 rounded-r-xl shadow-brutal-sm max-w-md">
                "{ending.quote}"
              </blockquote>

              <p className="text-xs font-medium text-neutral-700 mb-4 max-w-md leading-relaxed">
                {ending.flavorText}
              </p>

              {ending.stats && (
                <div className="grid grid-cols-3 gap-2 py-2 px-4 rounded-2xl bg-white border-2 border-neutral-900 shadow-brutal-sm mb-4 font-mono text-xs w-full max-w-sm">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-black font-display border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Drive Again
                </button>
                <button
                  onClick={onExploreOtherGames}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-black font-display border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  New Spiral
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Retro Steering & Control Cockpit */}
      <div className="w-full mt-3.5 bg-white border-3 border-neutral-900 rounded-3xl p-4 shadow-brutal flex flex-col items-center">
        {/* Steering Bar */}
        <div className="w-full flex items-center justify-center gap-3 mb-3.5">
          <button
            onClick={handleSteerLeft}
            className="flex-1 max-w-[150px] py-2.5 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-display font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
          >
            ↖ STEER LEFT
          </button>

          <div
            className="w-11 h-11 rounded-full border-2 border-neutral-900 bg-yellow-300 shadow-brutal-sm flex items-center justify-center text-lg transition-transform"
            style={{ transform: `rotate(${steerTilt * 2}deg)` }}
          >
            🛞
          </div>

          <button
            onClick={handleSteerRight}
            className="flex-1 max-w-[150px] py-2.5 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-neutral-900 shadow-brutal-sm text-neutral-900 font-display font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
          >
            STEER RIGHT ↗
          </button>
        </div>

        {/* Brake & Accelerator Pedals */}
        <div className="w-full flex items-center justify-center gap-3.5">
          <button
            onClick={handleBrake}
            className="flex-1 max-w-[170px] py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black font-display text-xs tracking-wider border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm cursor-pointer transition-all flex flex-col items-center"
          >
            <span className="text-sm">[ BRAKE ]</span>
            <span className="text-[10px] text-rose-100 font-bold font-mono">Space / Down (S)</span>
          </button>

          <button
            onClick={handleAccelerator}
            className="flex-1 max-w-[170px] py-3.5 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-neutral-950 font-black font-display text-xs tracking-wider border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm cursor-pointer transition-all flex flex-col items-center"
          >
            <span className="text-sm">[ ACCELERATE ]</span>
            <span className="text-[10px] text-neutral-800 font-bold font-mono">Up (W)</span>
          </button>
        </div>
      </div>
    </div>
  );
};


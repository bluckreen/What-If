import React from "react";
import { motion } from "motion/react";

interface CarRearViewProps {
  speed: number;
  gear: string;
  isBraking?: boolean;
  steerTilt: number;
  suspensionBob: number;
}

export const CarRearView: React.FC<CarRearViewProps> = ({
  speed,
  gear,
  isBraking = false,
  steerTilt,
  suspensionBob,
}) => {
  const isHighSpeed = speed > 90;
  const isReverse = gear.includes("R") || speed < 0;
  const showBrakeLights = isBraking || speed === 0 || gear === "P";

  return (
    <div
      className="relative select-none pointer-events-none"
      style={{
        transform: `translateY(${suspensionBob}px) rotate(${steerTilt * 0.8}deg)`,
        transition: "transform 0.08s ease-out",
      }}
    >
      {/* Ground Contact Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/40 rounded-full blur-xs" />

      {/* Main Forward-Facing Car (Rear-View Perspective) */}
      <svg
        width="132"
        height="96"
        viewBox="0 0 132 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0px_5px_0px_#18181b]"
      >
        {/* Left and Right Rear Wide Tires */}
        {/* Left Tire */}
        <g id="left-tire">
          <rect
            x="10"
            y="48"
            width="20"
            height="42"
            rx="5"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2.5"
          />
          {/* Tire treads */}
          <line x1="10" y1="58" x2="30" y2="58" stroke="#27272a" strokeWidth="2" />
          <line x1="10" y1="68" x2="30" y2="68" stroke="#27272a" strokeWidth="2" />
          <line x1="10" y1="78" x2="30" y2="78" stroke="#27272a" strokeWidth="2" />
        </g>

        {/* Right Tire */}
        <g id="right-tire">
          <rect
            x="102"
            y="48"
            width="20"
            height="42"
            rx="5"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="2.5"
          />
          {/* Tire treads */}
          <line x1="102" y1="58" x2="122" y2="58" stroke="#27272a" strokeWidth="2" />
          <line x1="102" y1="68" x2="122" y2="68" stroke="#27272a" strokeWidth="2" />
          <line x1="102" y1="78" x2="122" y2="78" stroke="#27272a" strokeWidth="2" />
        </g>

        {/* Rear Axle / Diffuser */}
        <rect
          x="26"
          y="72"
          width="80"
          height="14"
          rx="3"
          fill="#27272a"
          stroke="#18181b"
          strokeWidth="2.5"
        />

        {/* Dual Exhaust Pipes */}
        <g id="exhausts">
          {/* Left Exhaust */}
          <circle cx="34" cy="80" r="4.5" fill="#52525b" stroke="#18181b" strokeWidth="2" />
          <circle cx="34" cy="80" r="2.5" fill="#18181b" />

          {/* Right Exhaust */}
          <circle cx="98" cy="80" r="4.5" fill="#52525b" stroke="#18181b" strokeWidth="2" />
          <circle cx="98" cy="80" r="2.5" fill="#18181b" />
        </g>

        {/* Main Body Shell (Red Retro Sports Car) */}
        {/* Lower Main Bumper */}
        <path
          d="M 16 56 C 16 48, 22 44, 30 44 L 102 44 C 110 44, 116 48, 116 56 L 116 75 C 116 79, 112 82, 106 82 L 26 82 C 20 82, 16 79, 16 75 Z"
          fill="#ef4444"
          stroke="#18181b"
          strokeWidth="3"
        />

        {/* Bumper highlight reflection bar */}
        <path
          d="M 28 50 L 104 50"
          stroke="#fca5a5"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Cabin / Roof & Pillars */}
        <path
          d="M 28 44 L 38 18 C 40 14, 44 12, 50 12 L 82 12 C 88 12, 92 14, 94 18 L 104 44 Z"
          fill="#dc2626"
          stroke="#18181b"
          strokeWidth="3"
        />

        {/* Rear Windshield Glass */}
        <path
          d="M 34 42 L 42 20 C 43 17, 46 16, 50 16 L 82 16 C 86 16, 89 17, 90 20 L 98 42 Z"
          fill="#0f172a"
          stroke="#18181b"
          strokeWidth="2.5"
        />

        {/* Windshield Reflection Streak */}
        <path
          d="M 44 22 L 40 40"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 50 20 L 46 40"
          stroke="#93c5fd"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Driver Head Visible Inside Cabin */}
        <circle cx="58" cy="29" r="6.5" fill="#fde047" stroke="#18181b" strokeWidth="2" />
        {/* Driver cap or hair */}
        <path d="M 51 27 C 52 23, 64 23, 65 27 Z" fill="#3b82f6" />
        {/* Headrest left and right */}
        <rect x="52" y="32" width="12" height="9" rx="3" fill="#334155" />
        <rect x="70" y="32" width="12" height="9" rx="3" fill="#334155" opacity="0.6" />

        {/* Rear Spoiler / Wing */}
        <g id="rear-spoiler">
          {/* Spoiler mounts */}
          <rect x="36" y="38" width="5" height="7" fill="#18181b" />
          <rect x="91" y="38" width="5" height="7" fill="#18181b" />
          {/* Spoiler Blade */}
          <rect
            x="24"
            y="34"
            width="84"
            height="6"
            rx="3"
            fill="#b91c1c"
            stroke="#18181b"
            strokeWidth="2.5"
          />
        </g>

        {/* Left Taillight Cluster */}
        <g id="left-taillight">
          <rect
            x="20"
            y="52"
            width="22"
            height="14"
            rx="3"
            fill={showBrakeLights ? "#ff0000" : "#991b1b"}
            stroke="#18181b"
            strokeWidth="2"
          />
          {/* Inner brake core */}
          <rect
            x="22"
            y="54"
            width="12"
            height="10"
            rx="2"
            fill={showBrakeLights ? "#fff1f2" : "#dc2626"}
          />
          {/* Turn signal section */}
          <rect
            x="36"
            y="54"
            width="5"
            height="10"
            rx="1"
            fill={steerTilt < -2 ? "#fbbf24" : "#b45309"}
          />
          {/* Reverse lamp (if in reverse) */}
          {isReverse && (
            <rect x="23" y="55" width="8" height="8" rx="1" fill="#ffffff" />
          )}
        </g>

        {/* Right Taillight Cluster */}
        <g id="right-taillight">
          <rect
            x="90"
            y="52"
            width="22"
            height="14"
            rx="3"
            fill={showBrakeLights ? "#ff0000" : "#991b1b"}
            stroke="#18181b"
            strokeWidth="2"
          />
          {/* Turn signal section */}
          <rect
            x="91"
            y="54"
            width="5"
            height="10"
            rx="1"
            fill={steerTilt > 2 ? "#fbbf24" : "#b45309"}
          />
          {/* Inner brake core */}
          <rect
            x="98"
            y="54"
            width="12"
            height="10"
            rx="2"
            fill={showBrakeLights ? "#fff1f2" : "#dc2626"}
          />
          {/* Reverse lamp (if in reverse) */}
          {isReverse && (
            <rect x="101" y="55" width="8" height="8" rx="1" fill="#ffffff" />
          )}
        </g>

        {/* High Center Brake Light */}
        <rect
          x="58"
          y="18"
          width="16"
          height="3"
          rx="1.5"
          fill={showBrakeLights ? "#ff2222" : "#7f1d1d"}
        />

        {/* Vanity License Plate */}
        <g id="license-plate">
          <rect
            x="48"
            y="55"
            width="36"
            height="17"
            rx="2"
            fill="#facc15"
            stroke="#18181b"
            strokeWidth="2"
          />
          <text
            x="66"
            y="67"
            textAnchor="middle"
            fill="#18181b"
            fontSize="7.5"
            fontFamily="monospace"
            fontWeight="900"
            letterSpacing="0.5"
          >
            {isReverse ? "REV-404" : "NO-CLUE"}
          </text>
        </g>
      </svg>

      {/* Brake Light Radiant Neon Glows */}
      {showBrakeLights && (
        <>
          <div className="absolute top-11 left-4 w-9 h-9 rounded-full bg-red-500/50 blur-sm pointer-events-none animate-pulse" />
          <div className="absolute top-11 right-4 w-9 h-9 rounded-full bg-red-500/50 blur-sm pointer-events-none animate-pulse" />
        </>
      )}

      {/* Reverse Lamp Radiant Glows */}
      {isReverse && (
        <>
          <div className="absolute top-12 left-5 w-6 h-6 rounded-full bg-white/70 blur-xs pointer-events-none" />
          <div className="absolute top-12 right-5 w-6 h-6 rounded-full bg-white/70 blur-xs pointer-events-none" />
        </>
      )}

      {/* Exhaust Fire / Smoke Effects */}
      {/* High-speed Nitro Fireballs */}
      {isHighSpeed && (
        <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-7 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.4, 0.9, 1.3], y: [0, 4, 1, 5] }}
            transition={{ repeat: Infinity, duration: 0.12 }}
            className="text-lg filter drop-shadow-[0_0_8px_#f97316]"
          >
            🔥
          </motion.div>
          <motion.div
            animate={{ scale: [1.2, 0.9, 1.5, 1], y: [1, 5, 2, 4] }}
            transition={{ repeat: Infinity, duration: 0.14 }}
            className="text-lg filter drop-shadow-[0_0_8px_#f97316]"
          >
            🔥
          </motion.div>
        </div>
      )}

      {/* Normal Driving Exhaust Puffs */}
      {!isHighSpeed && Math.abs(speed) > 10 && (
        <div className="absolute -bottom-2 left-6 pointer-events-none opacity-50">
          <motion.span
            animate={{ opacity: [0.7, 0], scale: [0.7, 1.4], x: [-2, -8], y: [0, 6] }}
            transition={{ repeat: Infinity, duration: 0.35, ease: "easeOut" }}
            className="text-xs inline-block"
          >
            💨
          </motion.span>
        </div>
      )}
    </div>
  );
};

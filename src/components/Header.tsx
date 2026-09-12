import React, { useState } from "react";
import { Volume2, VolumeX, Sparkles, LayoutGrid, RotateCcw } from "lucide-react";
import { toggleSound, isSoundEnabled, playButtonPress } from "../utils/audio";
import { GameId } from "../types";

interface Props {
  activeGame: GameId | null;
  onOpenGameSelector: () => void;
  onNewSpiral: () => void;
}

export const Header: React.FC<Props> = ({ activeGame, onOpenGameSelector, onNewSpiral }) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  const handleOpenVault = () => {
    playButtonPress("secondary");
    onOpenGameSelector();
  };

  const handleReset = () => {
    playButtonPress("secondary");
    onNewSpiral();
  };

  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
      {/* Brand Title with Playful Sticker Vibe */}
      <div
        onClick={handleReset}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-400 border-3 border-neutral-900 shadow-brutal flex items-center justify-center font-black text-xl text-neutral-900 group-hover:rotate-6 transition-transform">
          ?
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl sm:text-2xl text-neutral-900 tracking-tight font-display group-hover:text-purple-600 transition-colors">
              WHAT IF...?
            </span>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-200 border-2 border-neutral-900 text-neutral-900 rotate-[-3deg]">
              OVERTHINK V3
            </span>
          </div>
          <span className="text-[11px] text-neutral-600 font-medium font-doodle text-sm -mt-1">
            the catastrophizer machine ✦
          </span>
        </div>
      </div>

      {/* Right Controls with Chunky Colorful Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Game Vault button */}
        <button
          onClick={handleOpenVault}
          title="Direct sandbox to the 5 useless experiments"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-purple-200 hover:bg-purple-300 border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm text-xs font-bold text-neutral-900 transition-all cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-purple-800" />
          <span className="hidden sm:inline">5 Useless Games</span>
          <span className="sm:hidden">Vault</span>
        </button>

        {/* Reset Spiral button */}
        <button
          onClick={handleReset}
          title="Start fresh with a new thought"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-200 hover:bg-emerald-300 border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm text-xs font-bold text-neutral-900 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-800" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Audio Mute toggle */}
        <button
          onClick={handleToggleSound}
          title={soundOn ? "Mute sounds" : "Unmute sounds"}
          className="p-2 sm:p-2.5 rounded-xl bg-yellow-200 hover:bg-yellow-300 border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm text-neutral-900 transition-all cursor-pointer"
        >
          {soundOn ? (
            <Volume2 className="w-4 h-4 text-neutral-900" />
          ) : (
            <VolumeX className="w-4 h-4 text-neutral-500" />
          )}
        </button>
      </div>
    </header>
  );
};

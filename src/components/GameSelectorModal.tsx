import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Dices } from "lucide-react";
import { GameId } from "../types";
import { GAMES_CATALOG, ALL_GAME_IDS, pickIndependentRandomGame } from "../data/games";
import { playButtonPress, playWhatIfMotif } from "../utils/audio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: GameId) => void;
}

export const GameSelectorModal: React.FC<Props> = ({ isOpen, onClose, onSelectGame }) => {
  if (!isOpen) return null;

  const handlePickRandom = () => {
    playWhatIfMotif("launch_game");
    const { gameId } = pickIndependentRandomGame();
    onSelectGame(gameId);
    onClose();
  };

  const cardColors = [
    "bg-rose-100 hover:bg-rose-200 border-rose-950",
    "bg-amber-100 hover:bg-amber-200 border-amber-950",
    "bg-emerald-100 hover:bg-emerald-200 border-emerald-950",
    "bg-sky-100 hover:bg-sky-200 border-sky-950",
    "bg-purple-100 hover:bg-purple-200 border-purple-950",
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          className="w-full max-w-xl bg-[#FFFDF8] border-4 border-neutral-900 rounded-3xl p-6 sm:p-7 shadow-brutal-xl relative flex flex-col max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-neutral-900/20 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎮</span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 font-display tracking-tight">
                  The 5 Useless Experiments
                </h3>
                <p className="text-xs font-doodle text-neutral-600 text-sm">
                  direct sandbox • multiple unpredictable endings ✦
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playButtonPress("secondary");
                onClose();
              }}
              className="p-1.5 rounded-xl border-2 border-neutral-900 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 shadow-brutal-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Random Roll Button */}
          <button
            onClick={handlePickRandom}
            className="w-full mb-4 py-3 px-4 rounded-2xl bg-yellow-300 hover:bg-yellow-400 border-3 border-neutral-900 shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-sm text-neutral-950 font-black text-xs sm:text-sm font-display tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Dices className="w-4 h-4" />
            <span>Roll a Random Useless Game</span>
          </button>

          {/* Game Cards List */}
          <div className="flex flex-col gap-2.5">
            {ALL_GAME_IDS.map((id, idx) => {
              const g = GAMES_CATALOG[id];
              return (
                <button
                  key={id}
                  onClick={() => {
                    playWhatIfMotif("launch_game");
                    onSelectGame(id);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl ${cardColors[idx % cardColors.length]} border-3 border-neutral-900 shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-between group cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
                      {g.icon}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-white border border-neutral-900 text-neutral-900">
                          #{idx + 1}
                        </span>
                        <span className="text-sm sm:text-base font-black text-neutral-950 font-display">
                          {g.name}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-neutral-700 font-sans mt-0.5">
                        {g.tagline}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black font-mono px-2 py-1 rounded-lg bg-white border-2 border-neutral-900 text-neutral-900 shadow-brutal-sm group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                    Play ➔
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs font-doodle text-neutral-500 text-center mt-4">
            In standard flow, these are awarded as the ultimate consequence of overthinking!
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

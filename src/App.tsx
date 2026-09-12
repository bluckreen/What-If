import React, { useState } from "react";
import { GameId } from "./types";
import { Header } from "./components/Header";
import { OverthinkingSpiral } from "./components/OverthinkingSpiral";
import { ButtonThatDoesNothing } from "./components/games/ButtonThatDoesNothing";
import { CatchTheChair } from "./components/games/CatchTheChair";
import { DontMoveYourMouse } from "./components/games/DontMoveYourMouse";
import { TheImpossibleCheckbox } from "./components/games/TheImpossibleCheckbox";
import { UselessDrivingSimulator } from "./components/games/UselessDrivingSimulator";
import { GameSelectorModal } from "./components/GameSelectorModal";
import { recordPlayedGame } from "./data/games";

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [activeThoughtPrompt, setActiveThoughtPrompt] = useState<string | null>(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [spiralKey, setSpiralKey] = useState(1);

  const handleGameAwarded = (gameId: GameId, chosenThought: string) => {
    recordPlayedGame(gameId);
    setActiveThoughtPrompt(chosenThought);
    setActiveGame(gameId);
  };

  const handleDirectSelectGame = (gameId: GameId) => {
    recordPlayedGame(gameId);
    setActiveThoughtPrompt("Direct Sandbox Launch");
    setActiveGame(gameId);
  };

  const handleNewSpiral = () => {
    setActiveGame(null);
    setActiveThoughtPrompt(null);
    setSpiralKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-cream-dots text-neutral-900 flex flex-col justify-between selection:bg-yellow-300 selection:text-neutral-950 font-sans antialiased overflow-x-hidden">
      {/* Top Header */}
      <Header
        activeGame={activeGame}
        onOpenGameSelector={() => setIsVaultOpen(true)}
        onNewSpiral={handleNewSpiral}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 md:p-6 w-full max-w-3xl mx-auto">
        {activeGame === null && (
          <OverthinkingSpiral key={spiralKey} onGameAwarded={handleGameAwarded} />
        )}

        {activeGame === "button" && (
          <ButtonThatDoesNothing
            onBack={() => setActiveGame(null)}
            onExploreOtherGames={handleNewSpiral}
          />
        )}

        {activeGame === "chair" && (
          <CatchTheChair
            onBack={() => setActiveGame(null)}
            onExploreOtherGames={handleNewSpiral}
          />
        )}

        {activeGame === "mouse" && (
          <DontMoveYourMouse
            onBack={() => setActiveGame(null)}
            onExploreOtherGames={handleNewSpiral}
          />
        )}

        {activeGame === "checkbox" && (
          <TheImpossibleCheckbox
            onBack={() => setActiveGame(null)}
            onExploreOtherGames={handleNewSpiral}
          />
        )}

        {activeGame === "car" && (
          <UselessDrivingSimulator
            onBack={() => setActiveGame(null)}
            onExploreOtherGames={handleNewSpiral}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-3xl mx-auto px-4 py-4 text-center text-neutral-700 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-sm text-neutral-900">
            WHAT IF...?
          </span>
          <span className="font-doodle text-sm text-neutral-500">
            an overthinking art experiment
          </span>
        </div>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white border border-neutral-900 text-neutral-800 shadow-brutal-sm">
          5 Useless Experiments • Made to be overthought
        </span>
      </footer>

      {/* Direct Game Vault Modal */}
      <GameSelectorModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onSelectGame={handleDirectSelectGame}
      />
    </div>
  );
}

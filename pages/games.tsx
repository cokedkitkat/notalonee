// pages/games.tsx
import { useState } from "react";
import Layout from "../components/Layout";
import TicTacToe from "../components/games/TicTacToe";

type GameId = "tictactoe" | "chess";
type Difficulty = "easy" | "medium" | "hard";

const GAMES: { id: GameId; name: string; emoji: string; available: boolean }[] = [
  { id: "tictactoe", name: "Tic Tac Toe", emoji: "❌⭕", available: true },
  { id: "chess", name: "Chess", emoji: "♟️", available: false }, // coming next
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  function reset() {
    setSelectedGame(null);
    setDifficulty(null);
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-8">
        {/* Step 1: pick a game */}
        {!selectedGame && (
          <>
            <h1 className="text-2xl font-bold mb-6">Games</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => game.available && setSelectedGame(game.id)}
                  disabled={!game.available}
                  className={`p-6 rounded-xl border border-gray-800 flex flex-col items-center gap-2 ${
                    game.available
                      ? "bg-gray-900 hover:bg-gray-800 cursor-pointer"
                      : "bg-gray-950 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span className="text-3xl">{game.emoji}</span>
                  <span className="font-medium">{game.name}</span>
                  {!game.available && (
                    <span className="text-xs text-gray-500">Coming soon</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: pick a difficulty */}
        {selectedGame && !difficulty && (
          <div className="flex flex-col items-center gap-6">
            <button onClick={reset} className="self-start text-sm text-gray-400 hover:text-white">
              ← Back to games
            </button>
            <h2 className="text-xl font-semibold">Choose your difficulty</h2>
            <div className="flex gap-4">
              {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className="px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg capitalize hover:bg-gray-800"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: play */}
        {selectedGame === "tictactoe" && difficulty && (
          <TicTacToe difficulty={difficulty} onBack={reset} />
        )}
      </div>
    </Layout>
  );
}
// components/games/TicTacToe.tsx
import { useEffect, useState } from "react";

type Cell = "X" | "O" | null;
type Difficulty = "easy" | "medium" | "hard";

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

function getWinner(board: Cell[]): Cell | "draw" | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) return "draw";
  return null;
}

// Minimax: returns the best score for the AI ("O")
function minimax(board: Cell[], isAiTurn: boolean, depth = 0): number {
  const result = getWinner(board);
  if (result === "O") return 10 - depth;
  if (result === "X") return depth - 10;
  if (result === "draw") return 0;

  const scores: number[] = [];
  board.forEach((cell, i) => {
    if (cell === null) {
      const next = [...board];
      next[i] = isAiTurn ? "O" : "X";
      scores.push(minimax(next, !isAiTurn, depth + 1));
    }
  });

  return isAiTurn ? Math.max(...scores) : Math.min(...scores);
}

function getBestMove(board: Cell[]): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  board.forEach((cell, i) => {
    if (cell === null) {
      const next = [...board];
      next[i] = "O";
      const score = minimax(next, false, 1);
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  });
  return bestMove;
}

function getRandomMove(board: Cell[]): number {
  const open = board.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
  return open[Math.floor(Math.random() * open.length)];
}

// Easy = always random. Medium = 50/50 random vs best. Hard = always best (unbeatable).
function getAiMove(board: Cell[], difficulty: Difficulty): number {
  if (difficulty === "easy") return getRandomMove(board);
  if (difficulty === "medium") {
    return Math.random() < 0.5 ? getRandomMove(board) : getBestMove(board);
  }
  return getBestMove(board);
}

export default function TicTacToe({
  difficulty,
  onBack,
}: {
  difficulty: Difficulty;
  onBack: () => void;
}) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [status, setStatus] = useState<string>("Your move — you're X");

  const winner = getWinner(board);

  useEffect(() => {
    if (winner === "X") setStatus("🎉 You win!");
    else if (winner === "O") setStatus("The AI wins this one. Try again?");
    else if (winner === "draw") setStatus("It's a draw!");
    else setStatus(isPlayerTurn ? "Your move — you're X" : "AI is thinking...");
  }, [winner, isPlayerTurn]);

  // AI's turn
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const move = getAiMove(board, difficulty);
        if (move !== -1) {
          const next = [...board];
          next[move] = "O";
          setBoard(next);
          setIsPlayerTurn(true);
        }
      }, 500); // small delay so it feels like it's "thinking"
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, winner, difficulty]);

  function handleClick(i: number) {
    if (board[i] || winner || !isPlayerTurn) return;
    const next = [...board];
    next[i] = "X";
    setBoard(next);
    setIsPlayerTurn(false);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
  }

  return (
    <div className="flex flex-col items-center gap-6 text-white">
      <button onClick={onBack} className="self-start text-sm text-gray-400 hover:text-white">
        ← Back to games
      </button>

      <h2 className="text-xl font-semibold">
        Tic Tac Toe <span className="text-gray-400 text-sm">({difficulty})</span>
      </h2>

      <p className="text-gray-300">{status}</p>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="w-20 h-20 bg-gray-900 border border-gray-700 rounded-lg text-3xl font-bold flex items-center justify-center hover:bg-gray-800 disabled:cursor-not-allowed"
            disabled={!!cell || !!winner || !isPlayerTurn}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Play again
        </button>
      )}
    </div>
  );
}
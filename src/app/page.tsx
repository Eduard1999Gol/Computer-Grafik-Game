"use client"; // ensure our game runs in the frontend

import { EndlessRunnerGame } from '@/game/game';
import { CardButton } from '@/ui/card-button';
import { Panel } from "@/ui/panel";
import { Label } from "@/ui/label";
import React from "react";
import { RestartGameDialog } from '@/components/restart-game-dialog';

export default () => {
  const game = React.useRef<EndlessRunnerGame | null>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(false);
  const [highScore, setHighScore] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      if (!canvas.current) return;
      
      // Initialize game
      canvas.current.width = canvas.current.clientWidth;
      canvas.current.height = canvas.current.clientHeight;
      
      try {
        game.current = new EndlessRunnerGame(canvas.current);
        
        // Set up game callbacks
        game.current.onScoreUpdate((newScore) => {
          setScore(newScore);
        });
        
        game.current.onGameOver((finalScore) => {
          setGameOver(true);
          if (finalScore > highScore) {
            setHighScore(finalScore);
          }
        });
        
        //game.current.start();
        //console.log("Game started successfully");
        
        // Handle resize
        const handleResize = () => {
          if (canvas.current && game.current) {
            canvas.current.width = canvas.current.clientWidth;
            canvas.current.height = canvas.current.clientHeight;
            game.current.resize();
          }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    })();
  }, []);

  const handleRestartGame = () => {
    if (game.current) {
      setGameOver(false);
      game.current.start();
    }
  };

  return (
    <div className="relative h-screen w-screen">
      <canvas className="absolute inset-0 h-full w-full" ref={canvas} />
  
      <div className="absolute top-0 left-0 w-full p-4">
        <div className="flex w-full flex-col items-center">
          <span className="text-white text-lg font-bold">Endless Runner Game</span>
  
          <div className="flex justify-between w-full max-w-md items-center mb-4">
            <div className="text-white">
              <span className="font-bold">Score:</span> {score}
            </div>
            {highScore > 0 && (
              <div className="text-white">
                <span className="font-bold">High Score:</span> {highScore}
              </div>
            )}
          </div>

          {score <= 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center  bg-black/70 h-screen">
              <div className="text-white text-4xl font-bold mb-4">Endless Runner Game</div>
              <div className="italic text-white mb-4">Use arrow keys to move and jump</div>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded"
                onClick={handleRestartGame}
              >
                Start Game
              </button>
            </div>
          )}
  
          {score > 0 && gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 h-screen">
              <div className="text-red-400 text-4xl font-bold mb-4">Game Over!</div>
              <button
                className="bg-red-600 text-white px-6 py-2 rounded"
                onClick={handleRestartGame}
              >
                Play Again
              </button>
            </div>
          )}
  
          {score > 0 && !gameOver && (
            <div className="text-sm text-white/70 mt-2">
              <p>⬅️ ➡️ Arrow keys to move side to side</p>
              <p>⬆️ or Space to jump</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

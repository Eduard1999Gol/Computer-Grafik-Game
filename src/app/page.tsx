"use client"; // ensure our game runs in the frontend

import { EndlessRunnerGame } from '@/game/game';
import { CardButton } from '@/ui/card-button';
import { Panel } from "@/ui/panel";
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
        
        game.current.start();
        console.log("Game started successfully");
        
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
    <>
      <canvas className="h-full w-full" ref={canvas} />
      
      <Panel reduceTopPadding>
        <div className="flex w-full flex-col">
          <span className="text-white text-lg font-bold">3D Runner Game</span>
          <span className="italic text-white mb-2">Use arrow keys to move and jump</span>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-white">
              <span className="font-bold">Score:</span> {score}
            </div>
            {highScore > 0 && (
              <div className="text-white">
                <span className="font-bold">High Score:</span> {highScore}
              </div>
            )}
          </div>
          
          {gameOver && (
            <div className="mt-2">
              <div className="text-red-400 font-bold mb-4">Game Over!</div>
              <CardButton
                className="bg-jgu-red text-white p-2 rounded"
                onClick={handleRestartGame}
              >
                Play Again
              </CardButton>
            </div>
          )}
          
          {!gameOver && (
            <div className="text-sm text-white/70 mt-2">
              <p>⬅️ ➡️ Arrow keys to move side to side</p>
              <p>⬆️ or Space to jump</p>
            </div>
          )}
        </div>
      </Panel>
    </>
  );
};

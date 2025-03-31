"use client"; // ensure our game runs in the frontend

import { EndlessRunnerGame } from '@/game/game';
import { CardButton } from '@/ui/card-button';
import { Panel } from "@/ui/panel";
import React from "react";

export default () => {
  const game = React.useRef<EndlessRunnerGame | null>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      if (!canvas.current) return;
      
      // Initialize game
      canvas.current.width = canvas.current.clientWidth;
      canvas.current.height = canvas.current.clientHeight;
      
      try {
        game.current = new EndlessRunnerGame(canvas.current);
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
          <span className="text-white text-lg">3D Runner Game</span>
          <span className="italic text-white">Use arrow keys to move and jump</span>
          
          {gameOver && (
            <CardButton
              className="mt-4 bg-jgu-red text-white p-2 rounded"
              onClick={handleRestartGame}
            >
              Play Again
            </CardButton>
          )}
        </div>
      </Panel>
    </>
  );
};

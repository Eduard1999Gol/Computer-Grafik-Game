"use client"; // ensure our game runs in the frontend

import { EndlessRunnerGame } from '@/game/game';
import React from "react";
import { RestartGameDialog } from '@/components/restart-game-dialog';
import { StartGameDialog } from '@/components/start-game-dialog';
import { DifficultyButton } from '@/components/difficulty-button';

export default () => {
  const game = React.useRef<EndlessRunnerGame | null>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(false);
  const [gameStarted, setGameStarted] = React.useState(false);
  const [highScore, setHighScore] = React.useState(0);
  const [hardDifficulty, setHardDifficulty] = React.useState(false);

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

  const handleStartGame = () => {
    if (game.current) {
      setGameStarted(true);
      game.current.start();
    }
    else console.error("Failed loading game");
  }

  const handleRestartGame = () => {
    if (game.current) {
      setGameOver(false);
      game.current.start();
    }
    else console.error("Failed loading game");
  };

  const changeDifficulty = () => {
    if (game.current) {
      game.current.setHardDifficulty(!hardDifficulty);
      setHardDifficulty(!hardDifficulty);
    }
    else console.error("Failed loading game");
  }

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
            <div className="text-white">
              <span className="font-bold">High Score:</span> {highScore}
            </div>
          </div>

          {!gameStarted && (<StartGameDialog onStart={handleStartGame} changeDifficulty={changeDifficulty}/>)}
          
          {gameStarted && gameOver && (<RestartGameDialog onRestart={handleRestartGame} changeDifficulty={changeDifficulty}/>)}
  
          {gameStarted && !gameOver && (
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

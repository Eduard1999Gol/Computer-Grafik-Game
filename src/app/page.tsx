"use client"; // ensure our game runs in the frontend

import { EndlessRunnerGame } from '@/game/game';
import React from "react";
import { RestartGameDialog } from '@/components/restart-game-dialog';
import GamePanel from '@/components/game-panel';
import { WelcomeDialog } from '@/components/welcome-dialog';

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

  const handleStartGame = (hardMode: boolean = false) => {
    if (game.current) {
      setGameStarted(true);
      setHardDifficulty(hardMode);
      game.current.setHardDifficulty(hardMode);
      game.current.start();
    }
    else console.error("Failed loading game");
  };

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
  };

  const getCurrentDifficulty = () => {
    // Return the React state value instead of accessing the game object
    // This ensures we always have a valid boolean even if the game isn't loaded
    return hardDifficulty;
  };

  return (
    <div className="relative h-screen w-screen">
      <canvas className="absolute inset-0 h-full w-full" ref={canvas} />
  
      <div className="absolute top-0 w-full">
        {gameStarted && <GamePanel score={score} highScore={highScore}/>}
        
        <div className="flex w-full flex-col items-center mt-4">
          {!gameStarted && (<WelcomeDialog onStart={handleStartGame} changeDifficulty={changeDifficulty} hardDifficulty={getCurrentDifficulty} />)}
          
          {gameStarted && gameOver && (<RestartGameDialog onRestart={handleRestartGame} changeDifficulty={changeDifficulty} hardDifficulty={getCurrentDifficulty}/>)}
        </div>
      </div>
    </div>
  );
  
};

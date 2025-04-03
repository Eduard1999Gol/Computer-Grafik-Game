"use client"; // ensure our game runs in the frontend

import { EndlessRunnerGame } from '@/game/game';
import React from "react";
import { RestartGameDialog } from '@/components/restart-game-dialog';
import GamePanel from '@/components/game-panel';
import { WelcomeDialog } from '@/components/welcome-dialog';

// Custom hook to handle game logic
const useEndlessRunnerGame = () => {
  const game = React.useRef<EndlessRunnerGame | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(false);
  const [gameStarted, setGameStarted] = React.useState(false);
  const [highScore, setHighScore] = React.useState(0);
  const [hardDifficulty, setHardDifficulty] = React.useState(false);

  React.useEffect(() => {
    const initializeGame = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Initialize game
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      
      try {
        game.current = new EndlessRunnerGame(canvas);
        
        // Set up game callbacks
        game.current.onScoreUpdate(setScore);
        
        game.current.onGameOver((finalScore) => {
          setGameOver(true);
          setHighScore(prev => Math.max(prev, finalScore));
        });
      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    };

    initializeGame();

    // Handle resize
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && game.current) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        game.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startGame = (hardMode: boolean = false) => {
    if (!game.current) {
      console.error("Failed loading game");
      return;
    }
    
    setGameStarted(true);
    setHardDifficulty(hardMode);
    game.current.setHardDifficulty(hardMode);
    game.current.start();
  };

  const restartGame = () => {
    if (!game.current) {
      console.error("Failed loading game");
      return;
    }
    
    setGameOver(false);
    game.current.start();
  };

  const toggleDifficulty = () => {
    if (!game.current) {
      console.error("Failed loading game");
      return;
    }
    
    const newDifficulty = !hardDifficulty;
    setHardDifficulty(newDifficulty);
    game.current.setHardDifficulty(newDifficulty);
  };

  return {
    canvasRef,
    score,
    gameOver,
    gameStarted,
    highScore,
    hardDifficulty,
    startGame,
    restartGame,
    toggleDifficulty
  };
};

export default function EndlessRunnerPage() {
  const {
    canvasRef,
    score,
    gameOver,
    gameStarted,
    highScore,
    hardDifficulty,
    startGame,
    restartGame,
    toggleDifficulty
  } = useEndlessRunnerGame();

  return (
    <div className="relative h-screen w-screen">
      <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />
  
      <div className="absolute top-0 w-full">
        {gameStarted && <GamePanel score={score} highScore={highScore}/>}
        
        <div className="flex w-full flex-col items-center mt-4">
          {!gameStarted && (
            <WelcomeDialog 
              onStart={startGame} 
              changeDifficulty={toggleDifficulty} 
              hardDifficulty={hardDifficulty} 
            />
          )}
          
          {gameStarted && gameOver && (
            <RestartGameDialog 
              onRestart={restartGame} 
              changeDifficulty={toggleDifficulty} 
              hardDifficulty={hardDifficulty}
            />
          )}
        </div>
      </div>
    </div>
  );
}

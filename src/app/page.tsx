"use client"; // ensure our game runs in the frontend

import { EndlessRunnerGame } from '@/game/game';
import React from "react";
import { RestartGameDialog } from '@/components/restart-game-dialog';
import GamePanel from '@/components/game-panel';
import { WelcomeDialog } from '@/components/welcome-dialog';
import { PauseDialog } from '@/components/pause-dialog';

// Custom hook to handle game logic
const useEndlessRunnerGame = () => {
  const game = React.useRef<EndlessRunnerGame | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(false);
  const [gameStarted, setGameStarted] = React.useState(false);
  const [gamePaused, setGamePaused] = React.useState(false);
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
        
        game.current.onPause((isPaused) => {
          setGamePaused(isPaused);
        });
      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    };

    initializeGame();
  }, []);

  const startGame = (hardMode: boolean = false) => {
    if (!game.current) {
      console.error("Failed loading game");
      return;
    }
    
    setGameStarted(true);
    setGamePaused(false);
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
    setGamePaused(false);
    game.current.start();
  };

  const continueGame = () => {
    if (!game.current) {
      console.error("Failed loading game");
      return;
    }
    
    game.current.togglePause();
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
    gamePaused,
    highScore,
    hardDifficulty,
    startGame,
    restartGame,
    continueGame,
    toggleDifficulty
  };
};

export default function EndlessRunnerPage() {
  const {
    canvasRef,
    score,
    gameOver,
    gameStarted,
    gamePaused,
    highScore,
    hardDifficulty,
    startGame,
    restartGame,
    continueGame,
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
          
          {gameStarted && !gameOver && gamePaused && (
            <PauseDialog onContinue={continueGame} isPaused={gamePaused} />
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

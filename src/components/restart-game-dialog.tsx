"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface RestartGameDialogProps {
  onRestart: () => void,
  changeDifficulty: () => void,
  hardDifficulty: () => boolean
}


export function RestartGameDialog({ onRestart, changeDifficulty, hardDifficulty }: RestartGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [hardMode, setHardMode] = useState(hardDifficulty());

  useEffect(() => {
    // Update hardMode state when external hardDifficulty changes
    setHardMode(hardDifficulty());
  }, [hardDifficulty]);

  const handleRestart = () => {
    // If the difficulty mode changed, toggle it
    if (hardMode !== hardDifficulty()) {
      changeDifficulty();
    }
    onRestart();
    setOpen(false);
  }

  const handleDifficultyChange = (checked: boolean) => {
    setHardMode(checked);
  }

  return (
    <Dialog open={true}>
      <DialogContent className="bg-gray-700/90 border-2 border-gray-400 rounded-xl shadow-lg max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-200 tracking-wider mb-1 text-center">Game Over</DialogTitle>
          <div className="h-0.5 bg-gray-400 rounded-full mb-3"></div>
          <DialogDescription className="text-gray-300 text-center text-lg">Restart Game?</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="difficulty-mode-restart" className="text-base text-gray-200">
              Hard Mode
            </Label>
            <Switch 
              id="difficulty-mode-restart" 
              checked={hardMode} 
              onCheckedChange={handleDifficultyChange} 
            />
          </div>
          <div className="text-sm text-gray-300">
            {hardMode
              ? "Hard mode enabled: Prepare for a challenging experience!"
              : "Normal mode: Enjoy a balanced experience."}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center mt-4">
          <Button 
            variant="outline" 
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors" 
            onClick={handleRestart}
          >
            Restart Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


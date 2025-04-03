"use client"

import { useState } from "react"
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
import { DifficultyButton } from "./difficulty-button"

interface RestartGameDialogProps {
  onRestart: () => void,
  changeDifficulty: () => void,
  hardDifficulty: () => boolean
}


export function RestartGameDialog({ onRestart, changeDifficulty, hardDifficulty }: RestartGameDialogProps) {
  const [open, setOpen] = useState(false);

  const handleRestart = () => {
    onRestart();
    setOpen(false);
  }

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader> {/* Initial Game Over dialog */}
          <DialogTitle>Game Over</DialogTitle>
          <DialogDescription>Restart Game?</DialogDescription>
        </DialogHeader>
        <DialogFooter> {/* Restart confirmation dialog */}
          <DifficultyButton changeDifficulty={changeDifficulty} hardDifficulty={hardDifficulty}></DifficultyButton>
          <Button variant="outline" className="bg-red-600 text-white" onClick={handleRestart}>Restart Game</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
  );
}


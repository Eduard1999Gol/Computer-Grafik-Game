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

interface StartGameDialogProps {
  onStart: () => void;
  changeDifficulty: () => void;
}

export function StartGameDialog({ onStart, changeDifficulty }: StartGameDialogProps) {
  const [open, setOpen] = useState(true);

  const handleStart = () => {
    onStart()
    setOpen(false)
  }

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Endless Runner Game</DialogTitle>
          <DialogDescription>Use arrow keys to move and jump</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DifficultyButton changeDifficulty={changeDifficulty}></DifficultyButton>
          <Button className="bg-blue-600 text-white" onClick={handleStart}>
            Start Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
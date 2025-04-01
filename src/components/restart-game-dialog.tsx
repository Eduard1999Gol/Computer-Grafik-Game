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

interface RestartGameDialogProps {
  onRestart: () => void
}

export function RestartGameDialog({ onRestart }: RestartGameDialogProps) {
  const [open, setOpen] = useState(false)

  const handleRestart = () => {
    onRestart()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Restart Game</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Restart Game</DialogTitle>
          <DialogDescription>
            Are you sure you want to restart the game? All current progress will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-0">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            No, Continue Playing
          </Button>
          <Button type="button" onClick={handleRestart}>
            Yes, Restart Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


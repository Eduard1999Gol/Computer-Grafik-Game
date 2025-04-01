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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-red-600 text-white">Restart Game</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Restart Game</DialogTitle>
                <DialogDescription>
                  Are you sure you want to restart the game? All current progress will be lost.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-0">
                <Button type="button" className="bg-blue-600 text-white" variant="secondary" onClick={() => setOpen(false)}>
                  No, Continue Playing
                </Button>
                <Button type="button" className="bg-red-600 text-white" onClick={handleRestart}>
                  Yes, Restart Game
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
  );
}


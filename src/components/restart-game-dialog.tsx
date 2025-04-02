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
          <Button variant="outline" className="bg-red-600 text-white" onClick={handleRestart}>Restart Game</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
  );
}


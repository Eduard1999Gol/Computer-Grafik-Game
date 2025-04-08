"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PauseDialogProps {
  onContinue: () => void;
  isPaused: boolean;
}

export function PauseDialog({ onContinue, isPaused }: PauseDialogProps) {
  return (
    <Dialog open={isPaused} onOpenChange={(open) => {
      if (!open) onContinue();
    }}>
      <DialogContent className="bg-gray-700/90 border-2 border-gray-400 rounded-xl shadow-lg max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-200 tracking-wider mb-1 text-center">Game Paused</DialogTitle>
          <div className="h-0.5 bg-gray-400 rounded-full mb-3"></div>
          <DialogDescription className="text-gray-300 text-center text-lg">Press ESC or click the button below to continue.</DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center mt-4">
          <Button 
            variant="outline" 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors" 
            onClick={onContinue}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

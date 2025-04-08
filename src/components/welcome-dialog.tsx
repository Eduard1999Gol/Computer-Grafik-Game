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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowUp, ArrowLeft, ArrowRight, ArrowDown } from "lucide-react"

interface WelcomeDialogProps {
  onStart: (hardMode: boolean) => void, // Update the type to accept hardMode parameter
  changeDifficulty: () => void,
  hardDifficulty: boolean
}

export function WelcomeDialog({ onStart, changeDifficulty, hardDifficulty }: WelcomeDialogProps) {

  const handleStart = () => {
    // Pass the current hardDifficulty value to onStart
    onStart(hardDifficulty);
  }

  return (
    <Dialog open={true}>
      <DialogContent className="bg-gray-700/90 border-2 border-gray-400 rounded-xl shadow-lg max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-200 tracking-wider mb-1 text-center">ENDLESS RUNNER</DialogTitle>
          <div className="h-0.5 bg-gray-400 rounded-full mb-3"></div>
          <DialogDescription className="text-gray-300 text-center text-lg">Welcome to the game!</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div className="bg-slate-800/90 p-3 text-center rounded-lg border border-gray-600 mb-2">
            <p className="text-gray-300 text-xs mb-2">CONTROLS</p>
            <div className="flex justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-slate-700 p-2 rounded-md mb-1 border border-slate-500">
                  <ArrowUp className="text-white h-4 w-4" />
                </div>
                <span className="text-[10px] text-gray-200">JUMP</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-slate-700 p-2 rounded-md mb-1 border border-slate-500">
                  <ArrowDown className="text-white h-4 w-4" />
                </div>
                <span className="text-[10px] text-gray-200">CANCEL JUMP</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-slate-700 p-2 rounded-md mb-1 border border-slate-500">
                  <ArrowLeft className="text-white h-4 w-4" />
                </div>
                <span className="text-[10px] text-gray-200">LEFT</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-slate-700 p-2 rounded-md mb-1 border border-slate-500">
                  <ArrowRight className="text-white h-4 w-4" />
                </div>
                <span className="text-[10px] text-gray-200">RIGHT</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="difficulty-mode-welcome" className="text-base text-gray-200">
              Hard Mode
            </Label>
            <Switch 
              id="difficulty-mode-welcome" 
              checked={hardDifficulty} 
              onCheckedChange={changeDifficulty} 
            />
          </div>
          <div className="text-sm text-gray-300">
            {hardDifficulty
              ? "Hard mode enabled: Prepare for a challenging experience!"
              : "Normal mode: Enjoy a balanced experience."}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center mt-4">
          <Button 
            variant="outline" 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors" 
            onClick={handleStart}
          >
            Start Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

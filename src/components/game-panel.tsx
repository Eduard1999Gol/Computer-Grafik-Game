"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowLeft, ArrowRight, ArrowDown } from "lucide-react"

interface GamePanelProps {
  score: number
  highScore: number
  lives: number
}


export default function GamePanel( { score, highScore, lives }: GamePanelProps) {

  return (
      <Card className="w-full max-w-md bg-gray-700/90 border-2 border-gray-400 rounded-xl shadow-lg scale-70">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold text-gray-200 tracking-wider mb-1">ENDLESS RUNNER</h1>
          <div className="h-0.5 bg-gray-400 rounded-full mb-3"></div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/90 p-3 rounded-lg border border-gray-600">
              <p className="text-gray-300 text-xs mb-1">SCORE</p>
              <p className="text-white text-xl font-mono font-bold">{score.toString().padStart(5)}</p>
            </div>
            <div className="bg-slate-800/90 p-3 rounded-lg border border-gray-600">
              <p className="text-gray-300 text-xs mb-1">HIGH SCORE</p>
              <p className="text-white text-xl font-mono font-bold">{highScore.toString().padStart(5, "0")}</p>
            </div>
            <div className="bg-slate-800/90 p-3 rounded-lg border border-gray-600">
              <p className="text-gray-300 text-xs mb-1">LIVES</p>
              <p className="text-white text-xl font-mono font-bold">{lives.toString().padStart(5)}</p>
            </div>
          </div>

          <div className="bg-slate-800/90 p-3 rounded-lg border border-gray-600">
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
        </div>
      </Card>
  )
}


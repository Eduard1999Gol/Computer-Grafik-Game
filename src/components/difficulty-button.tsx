import { useState } from "react";
import { Button } from '@/components/ui/button';


interface DifficultyButtonProps {
    changeDifficulty: () => void
    hardDifficulty: () => boolean
}

export function DifficultyButton({ changeDifficulty, hardDifficulty }: DifficultyButtonProps) {
    const [isHard, setIsHard] = useState(hardDifficulty());
    const [className, setClassName] = useState(hardDifficulty() ? "text-white bg-red-600 w-20" : "text-white bg-green-600 w-20");

    const switchDifficulty = () => {
        changeDifficulty();
        const newClassName = hardDifficulty() ? "text-white bg-red-600 w-20" : "text-white bg-green-600 w-20";
        setClassName(newClassName);
    }

    return (
        <div className="flex items-center space-x-2">
          <span>Change Difficulty:</span> {
          <Button onClick={switchDifficulty} className={className}>
            {hardDifficulty() ? "Hard" : "Normal"} 
          </Button>}
        </div>
      );
}

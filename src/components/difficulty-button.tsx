import { useState } from "react";
import { Button } from '@/components/ui/button';


interface DifficultyButtonProps {
    changeDifficulty: () => void
}

export function DifficultyButton({ changeDifficulty }: DifficultyButtonProps) {
    const [isHard, setIsHard] = useState(false);
    const [className, setClassName] = useState("text-white bg-green-600");

    const switchDifficulty = () => {
        setIsHard(!isHard);
        const newClassName = (className == "text-white bg-green-600") ? "text-white bg-red-600" : "text-white bg-green-600";
        setClassName(newClassName)
        changeDifficulty();
    }

    return (
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold">Change Difficulty:</span> {
          <Button onClick={switchDifficulty} className={className}>
            {isHard ? "Hard" : "Normal"} 
          </Button>}
        </div>
      );
}

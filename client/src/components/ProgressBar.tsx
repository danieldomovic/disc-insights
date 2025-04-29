import { motion } from "framer-motion";

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
}

export default function ProgressBar({ 
  currentQuestion, 
  totalQuestions, 
  progress 
}: ProgressBarProps) {
  return (
    <div className="mb-4 md:mb-6 px-2 md:px-0">
      <div className="flex justify-between text-xs sm:text-sm font-medium mb-1 md:mb-2">
        <span>Question {currentQuestion + 1} of {totalQuestions}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-[#1C77C3]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

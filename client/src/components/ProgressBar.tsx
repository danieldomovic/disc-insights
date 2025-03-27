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
    <div className="mb-4 sm:mb-6">
      <div className="flex justify-between items-center text-xs sm:text-sm font-medium mb-2">
        <span>Question {currentQuestion + 1} of {totalQuestions}</span>
        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{progress}%</span>
      </div>
      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "@/hooks/use-quiz";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuestionCardProps {
  question: QuizQuestion;
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  onNext: () => void;
  isLastQuestion: boolean;
  isSubmitting: boolean;
}

export default function QuestionCard({ 
  question, 
  selectedOptionIndex, 
  onSelectOption, 
  onNext, 
  isLastQuestion,
  isSubmitting
}: QuestionCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-8">
        <h3 className="text-xl font-semibold mb-6">{question.text}</h3>
        
        <div className="space-y-4">
          {question.options.map((option, index) => (
            <motion.div 
              key={index}
              className={cn(
                "option-item cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors",
                selectedOptionIndex === index && "bg-gray-200 hover:bg-gray-200"
              )}
              onClick={() => onSelectOption(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="question" 
                  className="hidden" 
                  checked={selectedOptionIndex === index}
                  onChange={() => onSelectOption(index)}
                />
                <div 
                  className={cn(
                    "w-5 h-5 border-2 border-gray-400 rounded-full mr-3 flex-shrink-0",
                    selectedOptionIndex === index && "border-[#1C77C3] bg-[#1C77C3]"
                  )}
                ></div>
                <span className="option-text">{option.text}</span>
              </label>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={onNext}
            disabled={selectedOptionIndex === null || isSubmitting}
            className={cn(
              "w-full md:w-auto px-6 py-3 transition-colors",
              (selectedOptionIndex === null || isSubmitting) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Processing..." : isLastQuestion ? "Submit Answers" : "Next Question"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

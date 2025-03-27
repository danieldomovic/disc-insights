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
    <Card className="w-full shadow-md overflow-hidden">
      <CardContent className="p-5 sm:p-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">{question.text}</h3>
        
        <div className="space-y-3 sm:space-y-4">
          {question.options.map((option, index) => (
            <motion.div 
              key={index}
              className={cn(
                "option-item cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg p-3 sm:p-4 transition-colors",
                selectedOptionIndex === index && `bg-opacity-20 hover:bg-opacity-30 bg-${option.color} hover:bg-${option.color} border-l-4 border-${option.color}`
              )}
              onClick={() => onSelectOption(index)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
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
                    "w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-400 rounded-full mr-2 sm:mr-3 flex-shrink-0",
                    selectedOptionIndex === index && `border-${option.color} bg-${option.color}`
                  )}
                  style={selectedOptionIndex === index ? { borderColor: option.color === 'fiery-red' ? '#E23D28' : 
                                               option.color === 'sunshine-yellow' ? '#F2CF1D' : 
                                               option.color === 'earth-green' ? '#42A640' : 
                                               '#1C77C3',
                                 backgroundColor: option.color === 'fiery-red' ? '#E23D28' : 
                                               option.color === 'sunshine-yellow' ? '#F2CF1D' : 
                                               option.color === 'earth-green' ? '#42A640' : 
                                               '#1C77C3' } : {}}
                ></div>
                <span className="option-text text-sm sm:text-base">{option.text}</span>
              </label>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end">
          <Button 
            onClick={onNext}
            disabled={selectedOptionIndex === null || isSubmitting}
            className={cn(
              "w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg shadow-sm transition-all",
              (selectedOptionIndex === null || isSubmitting) ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:scale-105 transform transition-transform"
            )}
          >
            {isSubmitting ? "Processing..." : isLastQuestion ? "Submit Answers" : "Next Question"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

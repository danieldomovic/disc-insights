import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizQuestion, ValidationError } from "@/hooks/use-quiz";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface QuestionCardProps {
  question: QuizQuestion;
  selectedOptions: Record<number, number>;
  getSelectedOptionForTrait: (optionIdx: number) => number | undefined;
  onSelectOption: (index: number) => void;
  onNext: () => void;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  validationErrors: ValidationError;
}

export default function QuestionCard({ 
  question, 
  selectedOptions,
  getSelectedOptionForTrait,
  onSelectOption, 
  onNext, 
  isLastQuestion,
  isSubmitting,
  validationErrors
}: QuestionCardProps) {
  // Rating options
  const ratingOptions = ['L', '1', '2', '3', '4', '5', 'M'];
  
  // Check if there are any validation errors
  const hasErrors = !(
    validationErrors.hasL && 
    validationErrors.hasM && 
    validationErrors.hasTwoMiddleValues && 
    validationErrors.allOptionsSelected
  );
  
  // Generate error messages
  const errorMessages = [];
  if (!validationErrors.hasL) errorMessages.push("L value not selected");
  if (!validationErrors.hasM) errorMessages.push("M value not selected");
  if (!validationErrors.hasTwoMiddleValues) errorMessages.push("You must select two different values in between L and M");
  if (!validationErrors.allOptionsSelected) errorMessages.push("Some questions are not answered");
  
  return (
    <Card className="w-full">
      <CardContent className="p-8">
        <p className="text-lg mb-6 text-gray-700">
          Please select one M (Most like me), one L (Least like me), and two different values in between.
        </p>
        
        <div className="space-y-0">
          {question.options.map((option, index) => {
            const colorMap: Record<string, string> = {
              'fiery-red': '#E23D28',
              'sunshine-yellow': '#F2CF1D',
              'earth-green': '#42A640',
              'cool-blue': '#1C77C3'
            };
            const bgColor = colorMap[option.color] || '#1C77C3';
            const selectedOption = getSelectedOptionForTrait(index);
            
            return (
              <div key={index} className="flex items-center mb-2">
                <div 
                  className="w-full md:w-2/5 p-4 text-white font-medium rounded-l-md"
                  style={{ backgroundColor: bgColor }}
                >
                  {option.text}
                </div>
                
                <div className="flex flex-grow justify-between bg-gray-50 rounded-r-md">
                  {ratingOptions.map((rating, rIdx) => {
                    // Calculate the actual value index for this option and rating
                    // This creates a unique value for each radio button
                    const valueIndex = index * ratingOptions.length + rIdx;
                    const isSelected = selectedOption === valueIndex;
                    
                    return (
                      <div 
                        key={rIdx} 
                        className="flex justify-center items-center px-4 py-2 cursor-pointer"
                        onClick={() => onSelectOption(valueIndex)}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center",
                            isSelected && "border-indigo-600"
                          )}
                        >
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
                          )}
                        </div>
                        <span className="ml-2 text-gray-700 font-medium">{rating}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Error messages */}
        {hasErrors && Object.keys(selectedOptions).length > 0 && (
          <div className="mt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="mt-2 list-disc list-inside">
                  {errorMessages.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="mt-8">
          <Button 
            onClick={onNext}
            disabled={isSubmitting}
            className={cn(
              "w-full md:w-auto px-6 py-3 transition-colors bg-indigo-600 hover:bg-indigo-700",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Processing..." : isLastQuestion ? "Submit Answers" : "Next Question"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
  
  // Get all used ratings to generate precise error messages
  const usedRatings = Object.entries(selectedOptions).map(([_, optionIndex]) => {
    const ratingIdx = optionIndex % ratingOptions.length;
    return ratingOptions[ratingIdx];
  });
  
  // Get count of selected options
  const selectedOptionsCount = Object.keys(selectedOptions).length;
  
  // Check if ratings include L and M
  const hasL = usedRatings.includes('L');
  const hasM = usedRatings.includes('M');
  
  // Count numeric (1-5) ratings
  const numericRatings = usedRatings.filter(
    rating => ['1', '2', '3', '4', '5'].includes(rating)
  );
  
  // Count occurrences of each rating
  const ratingCounts: Record<string, number> = {};
  usedRatings.forEach(rating => {
    ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
  });
  
  // Check for duplicates
  const duplicatedRatings = Object.entries(ratingCounts)
    .filter(([_, count]) => count > 1)
    .map(([rating, _]) => rating);
  
  // Calculate if there are any validation errors based on current selections
  // This uses our real-time calculations instead of the passed-in validationErrors - ignore the ValidationError prop
  const isValid = hasL && hasM && numericRatings.length === 2 && selectedOptionsCount === question.options.length && duplicatedRatings.length === 0;
  const hasErrors = !isValid;
  
  // Generate error messages based on current state (not from validation state)
  const errorMessages = [];
  if (selectedOptionsCount < question.options.length) {
    errorMessages.push("Some questions are not answered");
  }
  if (!hasL) errorMessages.push("L value not selected");
  if (!hasM) errorMessages.push("M value not selected");
  if (numericRatings.length !== 2) errorMessages.push("You must select two different numeric values (1-5) for the remaining traits");
  if (duplicatedRatings.length > 0) {
    errorMessages.push(`You have selected "${duplicatedRatings.join(', ')}" value more than once`);
  }
  
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
              <div key={index} className="flex flex-col mb-8">
                <div 
                  className="p-4 text-white font-medium rounded-t-md"
                  style={{ backgroundColor: bgColor }}
                >
                  {option.text}
                </div>
                
                <div className="flex justify-between bg-gray-50 rounded-b-md py-4">
                  {ratingOptions.map((rating, rIdx) => {
                    // Calculate the actual value index for this option and rating
                    // This creates a unique value for each radio button
                    const valueIndex = index * ratingOptions.length + rIdx;
                    const isSelected = selectedOption === valueIndex;
                    
                    return (
                      <div 
                        key={rIdx} 
                        className="flex-1 flex justify-center items-center py-2 cursor-pointer"
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

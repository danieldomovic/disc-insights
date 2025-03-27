import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export type QuizQuestion = {
  id: number;
  text: string;
  options: {
    text: string;
    color: "fiery-red" | "sunshine-yellow" | "earth-green" | "cool-blue";
  }[];
};

export type QuizAnswer = {
  questionId: number;
  selectedColor: string;
  rating: string; // L, 1, 2, 3, 4, 5, or M
};

export type ValidationError = {
  hasL: boolean;
  hasM: boolean;
  hasTwoMiddleValues: boolean;
  allOptionsSelected: boolean;
};

export function useQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError>({
    hasL: false,
    hasM: false,
    hasTwoMiddleValues: false,
    allOptionsSelected: false
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Rating options
  const ratingOptions = ['L', '1', '2', '3', '4', '5', 'M'];
  
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/quiz/questions"],
  });
  
  const submitMutation = useMutation({
    mutationFn: async (answers: QuizAnswer[]) => {
      const response = await apiRequest("POST", "/api/quiz/submit", { answers });
      return response.json();
    },
    onSuccess: (data) => {
      setLocation(`/results/${data.id}`);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error submitting quiz",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  });
  
  const currentQuestion = questions?.[currentQuestionIndex];
  const totalQuestions = questions?.length || 0;
  const progress = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
  
  // Validate the current selections
  const validateSelections = (): boolean => {
    if (!currentQuestion) return false;
    
    // Log selected options for debugging
    console.log("Selected options:", selectedOptions);
    
    // Get all the ratings that have been selected
    const usedRatings = Object.entries(selectedOptions).map(([_, optionIndex]) => {
      const ratingIdx = optionIndex % ratingOptions.length;
      return ratingOptions[ratingIdx];
    });
    console.log("Used ratings:", usedRatings);
    
    // Check if all 4 options have been selected (one rating for each row)
    const selectedOptionsCount = Object.keys(selectedOptions).length;
    const allOptionsSelected = selectedOptionsCount === currentQuestion.options.length;
    
    // Check for exactly one L value and one M value
    const hasL = usedRatings.includes('L');
    const hasM = usedRatings.includes('M');
    
    // Count how many numeric (1-5) ratings are used
    const numericRatings = usedRatings.filter(
      rating => ['1', '2', '3', '4', '5'].includes(rating)
    );
    
    // Count occurrences of each rating
    const ratingCounts: Record<string, number> = {};
    usedRatings.forEach(rating => {
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });
    
    // Check if any rating is used more than once
    const hasNoDuplicatedRatings = Object.values(ratingCounts).every(count => count === 1);
    
    // Check if we have exactly 2 numeric ratings (1-5)
    const hasTwoMiddleValues = numericRatings.length === 2;
    
    console.log("Validation result:", {
      hasL,
      hasM,
      hasTwoMiddleValues,
      allOptionsSelected,
      hasNoDuplicatedRatings
    });
    
    // Update validation state
    setValidationErrors({
      hasL,
      hasM,
      hasTwoMiddleValues,
      allOptionsSelected
    });
    
    // Return whether all validations pass
    return hasL && hasM && hasTwoMiddleValues && allOptionsSelected && hasNoDuplicatedRatings;
  };
  
  const selectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    
    // Calculate which option and rating this corresponds to
    const optionIdx = Math.floor(optionIndex / ratingOptions.length);
    const ratingIdx = optionIndex % ratingOptions.length;
    const rating = ratingOptions[ratingIdx];
    
    // Check if this rating is already used somewhere else
    const ratingLocation = Object.entries(selectedOptions).find(([idx, optIndex]) => {
      // Skip the current option we're updating
      if (parseInt(idx) === optionIdx) return false;
      
      const rIdx = optIndex % ratingOptions.length;
      return ratingOptions[rIdx] === rating;
    });
    
    // If this rating is used elsewhere, remove it from there
    if (ratingLocation) {
      const [rowIdx] = ratingLocation;
      const newSelectedOptions = { ...selectedOptions };
      delete newSelectedOptions[rowIdx]; // Remove the rating from its previous location
      newSelectedOptions[optionIdx] = optionIndex; // Add it to the new location
      setSelectedOptions(newSelectedOptions);
      
      // Show a toast notifying the user about what happened
      let message = '';
      if (rating === 'L') {
        message = 'Least like me';
      } else if (rating === 'M') {
        message = 'Most like me';
      } else {
        message = `rating ${rating}`;
      }
      
      toast({
        title: `Moved "${rating}" to a new row`,
        description: `You've moved the ${message} selection to a different trait.`
      });
      
      // Validate and return
      setTimeout(() => validateSelections(), 0);
      return;
    }
    
    // Update selected options
    const newSelectedOptions = { ...selectedOptions };
    newSelectedOptions[optionIdx] = optionIndex;
    
    setSelectedOptions(newSelectedOptions);
    
    // Validate after selection
    setTimeout(() => {
      validateSelections();
    }, 0);
  };
  
  const getSelectedOptionForTrait = (optionIdx: number): number | undefined => {
    return selectedOptions[optionIdx];
  };
  
  const goToNextQuestion = () => {
    if (!currentQuestion) return;
    
    // Run validation
    const validationPassed = validateSelections();
    
    // If validation failed, show errors
    if (!validationPassed) {
      // Get all used ratings again (validation function already did this but we need it for error messages)
      const usedRatings = Object.entries(selectedOptions).map(([_, optionIndex]) => {
        const ratingIdx = optionIndex % ratingOptions.length;
        return ratingOptions[ratingIdx];
      });
      
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
      
      // Build error messages
      const errors = [];
      const selectedOptionsCount = Object.keys(selectedOptions).length;
      if (selectedOptionsCount < currentQuestion.options.length) {
        errors.push("Some questions are not answered");
      }
      if (!hasL) errors.push("L value not selected");
      if (!hasM) errors.push("M value not selected");
      if (numericRatings.length !== 2) errors.push("You must select two different numeric values (1-5) for the remaining traits");
      if (duplicatedRatings.length > 0) {
        errors.push(`You have selected "${duplicatedRatings.join(', ')}" value more than once`);
      }
      
      toast({
        variant: "destructive",
        title: "Cannot proceed",
        description: errors.join(", ")
      });
      return;
    }
    
    // Save answers for this question
    const newAnswers = currentQuestion.options.map((option, idx) => {
      const optionIndex = selectedOptions[idx];
      const ratingIdx = optionIndex % ratingOptions.length;
      const rating = ratingOptions[ratingIdx];
      
      return {
        questionId: currentQuestion.id,
        selectedColor: option.color,
        rating: rating
      };
    });
    
    setAnswers([...answers, ...newAnswers]);
    setSelectedOptions({});
    setValidationErrors({
      hasL: false,
      hasM: false,
      hasTwoMiddleValues: false,
      allOptionsSelected: false
    });
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit the quiz
      submitMutation.mutate([...answers, ...newAnswers]);
    }
  };
  
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOptions({});
    setValidationErrors({
      hasL: false,
      hasM: false,
      hasTwoMiddleValues: false,
      allOptionsSelected: false
    });
    setLocation("/");
  };
  
  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    progress,
    selectedOptions,
    getSelectedOptionForTrait,
    selectOption,
    goToNextQuestion,
    restartQuiz,
    isLoadingQuestions,
    isSubmitting: submitMutation.isPending,
    validationErrors
  };
}

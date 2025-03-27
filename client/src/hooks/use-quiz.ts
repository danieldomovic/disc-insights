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
  const [selectedRatings, setSelectedRatings] = useState<Record<string, boolean>>({});
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
    
    // Check if all 4 options have been selected
    const selectedOptionsCount = Object.keys(selectedOptions).length;
    const allOptionsSelected = selectedOptionsCount === currentQuestion.options.length;
    
    // Check for L value
    const hasL = selectedRatings['L'] || false;
    
    // Check for M value
    const hasM = selectedRatings['M'] || false;
    
    // Calculate number of middle values (1-5)
    const middleValueCount = Object.keys(selectedRatings).filter(
      rating => rating !== 'L' && rating !== 'M'
    ).length;
    
    const hasTwoMiddleValues = middleValueCount >= 2;
    
    // Update validation state
    setValidationErrors({
      hasL,
      hasM,
      hasTwoMiddleValues,
      allOptionsSelected
    });
    
    // Return whether all validations pass
    return hasL && hasM && hasTwoMiddleValues && allOptionsSelected;
  };
  
  const selectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    
    // Calculate which option and rating this corresponds to
    const optionIdx = Math.floor(optionIndex / ratingOptions.length);
    const ratingIdx = optionIndex % ratingOptions.length;
    const rating = ratingOptions[ratingIdx];
    
    // Ensure we're not selecting the same rating twice
    if (selectedRatings[rating] && !selectedOptions[optionIdx]) {
      toast({
        variant: "destructive",
        title: `You've already selected "${rating}"`,
        description: "Please choose a different rating for this trait."
      });
      return;
    }
    
    // Update the selected ratings
    const newSelectedRatings = { ...selectedRatings };
    
    // If there was a previous selection for this option, remove that rating
    if (selectedOptions[optionIdx] !== undefined) {
      const prevRatingIdx = selectedOptions[optionIdx] % ratingOptions.length;
      const prevRating = ratingOptions[prevRatingIdx];
      delete newSelectedRatings[prevRating];
    }
    
    // Add the new rating
    newSelectedRatings[rating] = true;
    
    // Update selected options
    const newSelectedOptions = { ...selectedOptions };
    newSelectedOptions[optionIdx] = optionIndex;
    
    setSelectedRatings(newSelectedRatings);
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
    
    // Validate all selections before proceeding
    if (!validateSelections()) {
      // Display error toast with specifics
      const errors = [];
      if (!validationErrors.hasL) errors.push("L value not selected");
      if (!validationErrors.hasM) errors.push("M value not selected");
      if (!validationErrors.hasTwoMiddleValues) errors.push("You must select two different values in between L and M");
      if (!validationErrors.allOptionsSelected) errors.push("Some questions are not answered");
      
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
    setSelectedRatings({});
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
    setSelectedRatings({});
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

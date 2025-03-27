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

export function useQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selectedRatings, setSelectedRatings] = useState<Record<string, boolean>>({});
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
  
  const selectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    
    // Calculate which option and rating this corresponds to
    const optionIdx = Math.floor(optionIndex / ratingOptions.length);
    const ratingIdx = optionIndex % ratingOptions.length;
    const rating = ratingOptions[ratingIdx];
    
    // Ensure we're not selecting the same rating twice
    if (selectedRatings[rating] && selectedOptionIndex !== optionIndex) {
      toast({
        variant: "default",
        title: `You've already selected "${rating}"`,
        description: "Please choose a different rating for this trait."
      });
      return;
    }
    
    // Update the selected ratings
    const newSelectedRatings = { ...selectedRatings };
    
    // If there was a previous selection, remove that rating
    if (selectedOptionIndex !== null) {
      const prevRatingIdx = selectedOptionIndex % ratingOptions.length;
      const prevRating = ratingOptions[prevRatingIdx];
      delete newSelectedRatings[prevRating];
    }
    
    // Add the new rating
    newSelectedRatings[rating] = true;
    
    setSelectedRatings(newSelectedRatings);
    setSelectedOptionIndex(optionIndex);
  };
  
  const goToNextQuestion = () => {
    if (selectedOptionIndex === null || !currentQuestion) return;
    
    // Extract the option index and rating from the selectedOptionIndex
    const optionIdx = Math.floor(selectedOptionIndex / ratingOptions.length);
    const ratingIdx = selectedOptionIndex % ratingOptions.length;
    const rating = ratingOptions[ratingIdx];
    
    // Save the answer
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedColor: currentQuestion.options[optionIdx].color,
      rating: rating
    };
    
    setAnswers([...answers, newAnswer]);
    setSelectedOptionIndex(null);
    setSelectedRatings({});
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit the quiz
      submitMutation.mutate([...answers, newAnswer]);
    }
  };
  
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOptionIndex(null);
    setSelectedRatings({});
    setLocation("/");
  };
  
  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    progress,
    selectedOptionIndex,
    selectOption,
    goToNextQuestion,
    restartQuiz,
    isLoadingQuestions,
    isSubmitting: submitMutation.isPending
  };
}

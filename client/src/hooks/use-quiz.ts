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
};

export function useQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
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
    setSelectedOptionIndex(optionIndex);
  };
  
  const goToNextQuestion = () => {
    if (selectedOptionIndex === null || !currentQuestion) return;
    
    // Save the answer
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedColor: currentQuestion.options[selectedOptionIndex].color
    };
    
    setAnswers([...answers, newAnswer]);
    setSelectedOptionIndex(null);
    
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

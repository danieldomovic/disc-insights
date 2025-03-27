import { useEffect } from "react";
import { useQuiz } from "@/hooks/use-quiz";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Quiz() {
  const { 
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    progress,
    selectedOptionIndex,
    selectOption,
    goToNextQuestion,
    isLoadingQuestions,
    isSubmitting
  } = useQuiz();
  
  const { toast } = useToast();
  
  useEffect(() => {
    // When the component mounts, add a script tag for Chart.js to the document
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);
  
  if (isLoadingQuestions) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-6 w-3/4 mb-6" />
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
            
            <Skeleton className="h-10 w-32 mt-8" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentQuestion) {
    toast({
      variant: "destructive",
      title: "Error loading quiz questions",
      description: "Unable to load quiz questions. Please try again later."
    });
    return null;
  }
  
  return (
    <motion.section 
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ProgressBar 
        currentQuestion={currentQuestionIndex}
        totalQuestions={totalQuestions}
        progress={progress}
      />
      
      <QuestionCard 
        question={currentQuestion}
        selectedOptionIndex={selectedOptionIndex}
        onSelectOption={selectOption}
        onNext={goToNextQuestion}
        isLastQuestion={currentQuestionIndex === totalQuestions - 1}
        isSubmitting={isSubmitting}
      />
    </motion.section>
  );
}

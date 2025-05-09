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
    selectedOptions,
    getSelectedOptionForTrait,
    selectOption,
    goToNextQuestion,
    isLoadingQuestions,
    isSubmitting,
    validationErrors,
    isConsciousPhase
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
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-0">
        <div className="mb-4 md:mb-6">
          <Skeleton className="h-3 md:h-4 w-32 md:w-40 mb-1 md:mb-2" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        <Card>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <Skeleton className="h-5 md:h-6 w-3/4 mb-4 md:mb-6" />
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 md:h-16 w-full rounded-lg" />
              ))}
            </div>
            
            <Skeleton className="h-9 md:h-10 w-full md:w-32 mt-6 md:mt-8" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If there are no questions, return null
  if (!currentQuestion) {
    return null;
  }
  
  return (
    <motion.section 
      className="max-w-3xl mx-auto px-3 sm:px-4 md:px-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-gray-800">
            {isConsciousPhase ? "Conscious Profile Assessment" : "Unconscious Profile Assessment"}
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConsciousPhase 
              ? "bg-blue-100 text-blue-800" 
              : "bg-purple-100 text-purple-800"
          }`}>
            {isConsciousPhase 
              ? "How others see you" 
              : "Your instinctive self"}
          </div>
        </div>
        <ProgressBar 
          currentQuestion={currentQuestionIndex}
          totalQuestions={totalQuestions}
          progress={progress}
        />
      </div>
      
      <QuestionCard 
        question={currentQuestion}
        selectedOptions={selectedOptions}
        getSelectedOptionForTrait={getSelectedOptionForTrait}
        onSelectOption={selectOption}
        onNext={goToNextQuestion}
        isLastQuestion={currentQuestionIndex === totalQuestions - 1}
        isSubmitting={isSubmitting}
        validationErrors={validationErrors}
        isConsciousPhase={isConsciousPhase}
      />
    </motion.section>
  );
}

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ColorChart from "@/components/ColorChart";
import { ColorProfileDetail } from "@/components/ColorProfile";
import { colorProfiles, personalityProfiles, ColorType, PersonalityType } from "@/lib/colorProfiles";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface QuizResultData {
  id: number;
  scores: Record<ColorType, number>;
  dominantColor: ColorType;
  secondaryColor: ColorType;
  personalityType: PersonalityType;
}

export default function Results() {
  const [match, params] = useRoute<{ resultId?: string }>("/results/:resultId?");
  const [chartJsLoaded, setChartJsLoaded] = useState(false);
  
  // Check if user is logged in
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/profile"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
  
  // Mock result data for when no resultId is provided
  const mockResult: QuizResultData = {
    id: 0,
    scores: {
      "fiery-red": 35,
      "sunshine-yellow": 15,
      "earth-green": 20,
      "cool-blue": 30
    },
    dominantColor: "fiery-red",
    secondaryColor: "cool-blue",
    personalityType: "Reformer"
  };
  
  // If we have a resultId, fetch the result
  const { data: fetchedResult, isLoading } = useQuery<QuizResultData>({
    queryKey: [params?.resultId ? `/api/quiz/results/${params.resultId}` : null],
    enabled: !!params?.resultId,
  });
  
  // Use fetched result if available, otherwise use mock result
  const result = fetchedResult || mockResult;
  
  // Get personality profile based on the result
  const profile = personalityProfiles[result.personalityType];
  
  useEffect(() => {
    // Add Chart.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = () => setChartJsLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      // Clean up the script when the component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Card>
          <CardContent className="p-5 sm:p-8">
            <Skeleton className="h-6 sm:h-8 w-40 sm:w-60 mb-4 sm:mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div>
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-40 mb-3 sm:mb-4" />
                <Skeleton className="h-48 sm:h-64 w-full rounded-lg mb-4 sm:mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-5 sm:h-6 w-full" />
                  ))}
                </div>
              </div>
              
              <div>
                <Skeleton className="h-5 sm:h-6 w-40 sm:w-52 mb-3 sm:mb-4" />
                <Skeleton className="h-32 sm:h-40 w-full mb-4 sm:mb-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <motion.section 
      className="max-w-4xl mx-auto px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg overflow-hidden">
        <CardContent className="p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Your Insights Discovery Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center md:text-left">Your Color Energy Preferences</h3>
              {chartJsLoaded && <ColorChart scores={result.scores} />}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#E23D28] mr-2"></div>
                  <span className="text-xs sm:text-sm">Fiery Red: <span className="font-semibold">{result.scores["fiery-red"]}%</span></span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#F2CF1D] mr-2"></div>
                  <span className="text-xs sm:text-sm">Sunshine Yellow: <span className="font-semibold">{result.scores["sunshine-yellow"]}%</span></span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#42A640] mr-2"></div>
                  <span className="text-xs sm:text-sm">Earth Green: <span className="font-semibold">{result.scores["earth-green"]}%</span></span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#1C77C3] mr-2"></div>
                  <span className="text-xs sm:text-sm">Cool Blue: <span className="font-semibold">{result.scores["cool-blue"]}%</span></span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center md:text-left mt-4 md:mt-0">
                Your Dominant Type: <span style={{ color: colorProfiles[profile.color].bgColor }}>{profile.name}</span>
              </h3>
              <div className="mb-4 sm:mb-6">
                <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                  {profile.description}
                </p>
                
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">On a Good Day:</h4>
                    <p className="text-xs sm:text-sm">{profile.onGoodDay.join(", ")}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">On a Bad Day:</h4>
                    <p className="text-xs sm:text-sm">{profile.onBadDay.join(", ")}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Likes:</h4>
                    <p className="text-xs sm:text-sm">{profile.likes.join(", ")}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Goals:</h4>
                    <p className="text-xs sm:text-sm">{profile.goals.join(", ")}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Fears:</h4>
                    <p className="text-xs sm:text-sm">{profile.fears.join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center md:text-left">Working with Your Strengths</h3>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 text-sm sm:text-base">
              <p>{profile.strengths}</p>
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center md:text-left">Development Opportunities</h3>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-sm sm:text-base">
              <p>{profile.development}</p>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8">
            {!user && (
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold mb-2 text-center">Save Your Results</h3>
                <p className="text-sm text-center mb-4">
                  Create a free account to save your results and access them anytime. You can also take the test again later to track changes in your profile.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/auth">
                    <Button variant="default" className="px-4 py-2 text-sm rounded-lg shadow-md">
                      Sign Up / Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              {user && (
                <Link href="/profile">
                  <Button variant="outline" className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transform transition-transform hover:scale-105">
                    View All Results
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transform transition-transform hover:scale-105">
                  Retake Assessment
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center">Explore All Color Energies</h2>
        <ColorProfileDetail color="fiery-red" />
        <ColorProfileDetail color="sunshine-yellow" />
        <ColorProfileDetail color="earth-green" />
        <ColorProfileDetail color="cool-blue" />
      </div>
    </motion.section>
  );
}

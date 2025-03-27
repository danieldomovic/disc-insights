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
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-8 w-60 mb-6" />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-64 w-full rounded-lg mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </div>
              
              <div>
                <Skeleton className="h-6 w-52 mb-4" />
                <Skeleton className="h-40 w-full mb-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <motion.section 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Insights Discovery Profile</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Color Energy Preferences</h3>
              {chartJsLoaded && <ColorChart scores={result.scores} />}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#E23D28] mr-2"></div>
                  <span className="text-sm">Fiery Red: <span className="font-semibold">{result.scores["fiery-red"]}%</span></span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#F2CF1D] mr-2"></div>
                  <span className="text-sm">Sunshine Yellow: <span className="font-semibold">{result.scores["sunshine-yellow"]}%</span></span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#42A640] mr-2"></div>
                  <span className="text-sm">Earth Green: <span className="font-semibold">{result.scores["earth-green"]}%</span></span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#1C77C3] mr-2"></div>
                  <span className="text-sm">Cool Blue: <span className="font-semibold">{result.scores["cool-blue"]}%</span></span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Your Dominant Type: <span style={{ color: colorProfiles[profile.color].bgColor }}>{profile.name}</span>
              </h3>
              <div className="mb-6">
                <p className="mb-4">
                  {profile.description}
                </p>
                
                <h4 className="font-semibold mt-4 mb-2">On a Good Day:</h4>
                <p>{profile.onGoodDay.join(", ")}</p>
                
                <h4 className="font-semibold mt-4 mb-2">On a Bad Day:</h4>
                <p>{profile.onBadDay.join(", ")}</p>
                
                <h4 className="font-semibold mt-4 mb-2">Likes:</h4>
                <p>{profile.likes.join(", ")}</p>
                
                <h4 className="font-semibold mt-4 mb-2">Goals:</h4>
                <p>{profile.goals.join(", ")}</p>
                
                <h4 className="font-semibold mt-4 mb-2">Fears:</h4>
                <p>{profile.fears.join(", ")}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Working with Your Strengths</h3>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p>{profile.strengths}</p>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Development Opportunities</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p>{profile.development}</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link href="/">
              <Button className="px-6 py-3">
                Retake Assessment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 space-y-8">
        <h2 className="text-2xl font-bold">Explore All Color Energies</h2>
        <ColorProfileDetail color="fiery-red" />
        <ColorProfileDetail color="sunshine-yellow" />
        <ColorProfileDetail color="earth-green" />
        <ColorProfileDetail color="cool-blue" />
      </div>
    </motion.section>
  );
}

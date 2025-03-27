import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ColorChart from "@/components/ColorChart";
import { ColorProfile, ColorProfileDetail } from "@/components/ColorProfile";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ColorType, PersonalityType } from "@/lib/colorProfiles";

interface QuizResultData {
  id: number;
  scores: Record<ColorType, number>;
  dominantColor: ColorType;
  secondaryColor: ColorType;
  personalityType: PersonalityType;
  createdAt: string;
}

export default function Profile() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);

  // Fetch user profile
  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery<{username: string}>({
    queryKey: ["/api/profile"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch user quiz results
  const { 
    data: quizResults = [], 
    isLoading: isLoadingResults,
    error: resultsError,
  } = useQuery<QuizResultData[]>({
    queryKey: ["/api/profile/results"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user, // Only fetch results if user is logged in
  });

  // On component mount, select the most recent result if available
  useEffect(() => {
    if (quizResults.length > 0 && !selectedResultId) {
      // Sort by date and get the most recent one
      const sortedResults = [...quizResults].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSelectedResultId(sortedResults[0].id);
    }
  }, [quizResults, selectedResultId]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      toast({
        title: "Logged out successfully",
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        variant: "destructive",
      });
    }
  };

  // Handle authentication errors
  useEffect(() => {
    if (userError) {
      toast({
        title: "Authentication required",
        description: "Please log in to access your profile",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [userError, toast, setLocation]);

  // If no user data is available yet, show loading state
  if (isLoadingUser) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle>Loading Profile...</CardTitle>
            <CardDescription>Please wait while we load your profile data</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get the currently selected result
  const selectedResult = quizResults.find(result => result.id === selectedResultId);

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Profile sidebar */}
        <Card className="w-full md:w-64 lg:w-72">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>{user?.username}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button variant="outline" onClick={() => setLocation("/")}>Home</Button>
            <Button variant="outline" onClick={() => setLocation("/quiz")}>Take New Quiz</Button>
            <Separator className="my-2" />
            <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
          </CardContent>
        </Card>

        {/* Main content area */}
        <div className="flex-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Results</CardTitle>
              <CardDescription>
                {quizResults.length > 0 
                  ? "View your personality test results" 
                  : "You haven't taken any tests yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResults ? (
                <p>Loading your results...</p>
              ) : quizResults.length > 0 ? (
                <div className="space-y-6">
                  {/* Result selection */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Test History</h3>
                    <div className="flex flex-wrap gap-2">
                      {quizResults.map((result) => (
                        <Button 
                          key={result.id}
                          variant={selectedResultId === result.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedResultId(result.id)}
                        >
                          {new Date(result.createdAt).toLocaleDateString()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Selected result display */}
                  {selectedResult && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Your Color Scores</h3>
                        <div className="h-[250px]">
                          <ColorChart scores={selectedResult.scores} />
                        </div>
                      </div>
                      
                      <Tabs defaultValue="summary">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="summary">Color Summary</TabsTrigger>
                          <TabsTrigger value="details">Personality Details</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="summary" className="space-y-4 mt-4">
                          <h3 className="text-lg font-medium">Your Color Profile</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ColorProfile color={selectedResult.dominantColor} />
                            <ColorProfile color={selectedResult.secondaryColor} />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="details" className="space-y-4 mt-4">
                          <h3 className="text-lg font-medium">
                            Your Personality Type: {selectedResult.personalityType}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Based on your dominant colors: {selectedResult.dominantColor} and {selectedResult.secondaryColor}
                          </p>
                          <ColorProfileDetail color={selectedResult.dominantColor} />
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4">You haven't taken any tests yet.</p>
                  <Button onClick={() => setLocation("/quiz")}>Take Your First Test</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
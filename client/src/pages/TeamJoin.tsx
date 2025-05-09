import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeamJoin() {
  const { user } = useAuth();
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  
  useEffect(() => {
    if (!user || !token) return;

    const joinTeam = async () => {
      try {
        const response = await apiRequest("POST", `/api/teams/join`, { token });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to join team");
        }
        
        const data = await response.json();
        setTeamName(data.teamName);
        setStatus("success");
        
        // Refresh teams data
        queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
        
        toast({
          title: "Success!",
          description: `You have successfully joined team ${data.teamName}.`,
        });
      } catch (error) {
        console.error("Error joining team:", error);
        setStatus("error");
        setErrorMessage((error as Error).message || "Failed to join team. The invite may be invalid or expired.");
        
        toast({
          title: "Failed to join team",
          description: (error as Error).message || "Failed to join team. The invite may be invalid or expired.",
          variant: "destructive",
        });
      }
    };
    
    joinTeam();
  }, [user, token, toast]);

  // Redirect if not logged in
  if (!user) {
    // Store the join URL to redirect back after login
    sessionStorage.setItem("redirectAfterAuth", window.location.pathname);
    return <Redirect to="/auth" />;
  }
  
  // Handle missing token
  if (!token) {
    return <Redirect to="/teams" />;
  }
  
  return (
    <div className="container max-w-lg mx-auto py-20 px-4">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Team Invitation</CardTitle>
          <CardDescription>
            Joining a team will give you access to team analytics and collaboration features
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Processing your invitation...</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-green-50 p-3 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Successfully Joined Team!</h3>
              <p className="text-muted-foreground mb-6">
                You are now a member of <span className="font-medium text-foreground">{teamName}</span>
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-red-50 p-3 rounded-full mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Failed to Join Team</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {errorMessage}
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6">
          <Button
            onClick={() => navigate("/teams")}
            className="mt-2"
          >
            <Users className="h-4 w-4 mr-2" />
            Go to Teams
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
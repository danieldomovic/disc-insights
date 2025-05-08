import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { Redirect, useLocation, useParams } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ChevronLeft, Users, Check, AlertTriangle } from "lucide-react";

export default function TeamJoin() {
  const { user } = useAuth();
  const params = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { token } = params;
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Add as team member mutation
  const joinTeamMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", `/api/teams/join/${token}`);
      return await res.json();
    },
    onSuccess: () => {
      setJoinSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success!",
        description: "You've successfully joined the team.",
      });
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Failed to join team");
      toast({
        title: "Failed to join team",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Auto-join when the page loads
  useEffect(() => {
    if (user && token && !joining && !joinSuccess && !errorMessage) {
      setJoining(true);
      joinTeamMutation.mutate();
    }
  }, [user, token, joining, joinSuccess, errorMessage]);
  
  // Redirect if not logged in
  if (!user) {
    return <Redirect to={`/auth?redirect=/teams/join/${token}`} />;
  }
  
  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 flex items-center gap-2"
        onClick={() => navigate("/teams")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Teams
      </Button>
      
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            Join a team with this invite link
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          {joinTeamMutation.isPending || joining ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Joining team...</p>
            </div>
          ) : joinSuccess ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="p-4 rounded-full bg-green-50">
                <Check className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Successfully Joined Team</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                You are now a member of the team and can view team information.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="p-4 rounded-full bg-red-50">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold">Failed to Join Team</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {errorMessage}
              </p>
              <p className="text-sm text-muted-foreground">
                This invite link may be invalid or expired.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="p-4 rounded-full bg-primary/10">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Join Team</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                You're about to join a team using an invite link.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {joinSuccess ? (
            <Button onClick={() => navigate("/teams")}>
              View Teams
            </Button>
          ) : errorMessage ? (
            <Button variant="outline" onClick={() => navigate("/teams")}>
              Return to Teams
            </Button>
          ) : !joinTeamMutation.isPending && !joining ? (
            <>
              <Button variant="outline" onClick={() => navigate("/teams")}>
                Cancel
              </Button>
              <Button onClick={() => joinTeamMutation.mutate()}>
                Join Team
              </Button>
            </>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
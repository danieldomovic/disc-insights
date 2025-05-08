import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Users, User, UserPlus, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

interface TeamMember {
  id: number;
  userId: number;
  isLeader: boolean;
  user?: {
    fullName: string;
    email: string;
    username: string;
  };
}

interface Team {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  members: TeamMember[];
}

export default function TeamDetails() {
  const { user } = useAuth();
  const [match, params] = useRoute<{ teamId?: string }>("/teams/:teamId");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [activeTab, setActiveTab] = useState("members");
  
  // Fetch team details
  const { data: team, isLoading, error } = useQuery<Team>({
    queryKey: [`/api/teams/${params?.teamId}`],
    enabled: !!params?.teamId,
  });
  
  // Check if user is team leader
  const isTeamLeader = team?.members?.some(
    member => member.userId === user?.id && member.isLeader
  );
  
  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", `/api/teams/${params?.teamId}/members`, { userEmail: email });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${params?.teamId}`] });
      setMemberEmail("");
      setIsAddMemberOpen(false);
      toast({
        title: "Team member added",
        description: "The user has been successfully added to the team.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add team member",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddMember = () => {
    if (memberEmail.trim()) {
      addMemberMutation.mutate(memberEmail);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="mb-6 h-8 w-24">
          <Skeleton className="h-8 w-full" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !team) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Team</h2>
          <p className="text-muted-foreground mb-6">Unable to load team details.</p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Format date
  const createdAt = new Date(team.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/dashboard">
        <Button 
          variant="ghost" 
          className="mb-6 pl-0 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <CardDescription className="mt-1">
                Created on {createdAt}
              </CardDescription>
            </div>
            {isTeamLeader && (
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Member</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Enter the email address of the user you want to add to the team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        placeholder="colleague@example.com"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddMemberOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddMember}
                      disabled={!memberEmail.trim() || addMemberMutation.isPending}
                    >
                      {addMemberMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Member"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {team.description && (
            <div className="mb-6">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Description</h3>
              <p>{team.description}</p>
              <Separator className="my-6" />
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members">
              <div className="space-y-4">
                <h3 className="font-medium">Team Members ({team.members.length})</h3>
                
                {team.members.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">No members yet</h3>
                    <p className="text-muted-foreground mb-6">Start adding team members to collaborate.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.user?.fullName || `User ${member.userId}`}</p>
                            <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                          </div>
                        </div>
                        {member.isLeader && (
                          <div className="flex items-center gap-1 text-sm text-primary bg-primary/10 px-2 py-1 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Team Leader</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="space-y-4">
                <h3 className="font-medium">Team Analytics</h3>
                
                <div className="text-center py-12 border rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">Team analytics will be available when more members complete the assessment.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
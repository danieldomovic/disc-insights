import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useLocation, useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  ChevronLeft, 
  Settings, 
  BarChart2, 
  CircleUserRound,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface TeamDetails {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  isLeader: boolean;
  members: TeamMember[];
}

interface TeamMember {
  id: number;
  userId: number;
  isLeader: boolean;
  username?: string;
  fullName?: string;
  email?: string;
}

export default function TeamView() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const teamId = parseInt(params.id, 10);
  
  // Fetch team details
  const {
    data: team,
    isLoading,
    isError,
    error
  } = useQuery<TeamDetails>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!user && !isNaN(teamId),
  });

  // Helper to display a user identifier
  const getUserIdentifier = (userId: number) => {
    return userId.toString().charAt(0).toUpperCase();
  };

  // Redirect if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Show error message if loading failed
  if (isError) {
    return (
      <div className="container max-w-5xl mx-auto py-10 px-4">
        <Button 
          variant="ghost" 
          className="mb-8 pl-0 flex items-center gap-2"
          onClick={() => navigate("/teams")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Teams
        </Button>
        
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-red-50">
                <Users className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold">Error Loading Team</h2>
              <p className="text-muted-foreground max-w-md">
                {(error as Error)?.message || "Failed to load team details. You may not have access to this team."}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/teams")}
              >
                Return to Teams
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 flex items-center gap-2"
        onClick={() => navigate("/teams")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Teams
      </Button>
      
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      ) : team ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{team.name}</h1>
                {team.isLeader && (
                  <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                    Team Leader
                  </Badge>
                )}
              </div>
              {team.description && (
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  {team.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Created on {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {team.isLeader && (
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Team Settings
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="members" className="space-y-6">
            <TabsList>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Team Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="members">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      View and manage {team.name}'s members
                    </CardDescription>
                  </div>
                  {team.isLeader && (
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {team.members && team.members.length > 0 ? (
                      <div className="space-y-4">
                        {team.members.map((member) => (
                          <div 
                            key={member.id} 
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary">
                                  {getUserIdentifier(member.userId)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  {member.username || `Member ${member.userId}`}
                                  {member.isLeader && (
                                    <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                      Leader
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  User ID: {member.userId}
                                </p>
                              </div>
                            </div>
                            {team.isLeader && !member.isLeader && (
                              <Button variant="ghost" size="sm">
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <CircleUserRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium text-lg mb-2">No team members yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {team.isLeader 
                            ? "Add members to your team to collaborate and analyze personality dynamics together."
                            : "There are no members in this team yet."}
                        </p>
                        {team.isLeader && (
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add First Member
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Team Analytics</CardTitle>
                  <CardDescription>
                    Analyze team personality dynamics and color distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10">
                    <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Analytics Coming Soon</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Team analytics will be available once team members have completed their assessments.
                    </p>
                    <Link href="/quiz">
                      <Button variant="outline">
                        Take an Assessment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
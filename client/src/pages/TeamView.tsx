import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect, useLocation, useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Settings, 
  BarChart2, 
  CircleUserRound,
  Loader2,
  Copy,
  Link as LinkIcon,
  CheckCircle
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const [inviteLink, setInviteLink] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showInviteDialog, setShowInviteDialog] = useState<boolean>(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState<boolean>(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);
  const [newMemberEmail, setNewMemberEmail] = useState<string>("");
  const [newMemberUsername, setNewMemberUsername] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [teamDescription, setTeamDescription] = useState<string>("");
  const [addMemberStatus, setAddMemberStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  // Fetch team details
  const {
    data: team,
    isLoading,
    isError,
    error
  } = useQuery<TeamDetails>({
    queryKey: [`/api/teams/${teamId}`],
    enabled: !!user && !isNaN(teamId)
  });
  
  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/teams/${teamId}/members/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove team member");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Team member removed",
        description: "Member has been removed from the team successfully."
      });
      
      // Refresh team data
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}`] });
    },
    onError: (error: any) => {
      console.error("Error removing team member:", error);
      toast({
        title: "Failed to remove team member",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Generate invite link mutation
  const generateInviteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/teams/${teamId}/invite`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      // Create an invite link using the invite token
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/teams/join/${data.inviteToken}`;
      setInviteLink(link);
      setShowInviteDialog(true);
      toast({
        title: "Invite link generated!",
        description: "Share this link with your team members to join.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate invite link",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Add member manually mutation
  const addMemberMutation = useMutation({
    mutationFn: async (data: { email?: string; username?: string }) => {
      setAddMemberStatus("loading");
      const response = await apiRequest("POST", `/api/teams/${teamId}/members`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add team member");
      }
      return await response.json();
    },
    onSuccess: () => {
      setAddMemberStatus("success");
      setNewMemberEmail("");
      setNewMemberUsername("");
      
      // Close dialog and show success message
      setTimeout(() => {
        setShowAddMemberDialog(false);
        setAddMemberStatus("idle");
        
        toast({
          title: "Team member added",
          description: "The user has been successfully added to your team.",
        });
        
        // Refresh team data
        queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}`] });
      }, 1500);
    },
    onError: (error: Error) => {
      setAddMemberStatus("error");
      toast({
        title: "Failed to add team member",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle copy to clipboard
  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(() => {
          toast({
            title: "Failed to copy",
            description: "Please copy the link manually",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = inviteLink;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Please copy the link manually",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

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
        <Breadcrumbs 
          items={[
            { href: "/teams", label: "Teams" },
            { label: "Error" }
          ]}
        />
        
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

  // Force add a button to add team members for debugging
  const forceAddMemberButton = () => {
    console.log("Opening Add Member dialog");
    setShowAddMemberDialog(true);
  };
  
  // Initialize team settings when dialog opens
  useEffect(() => {
    if (team && showSettingsDialog) {
      setTeamName(team.name);
      setTeamDescription(team.description || "");
    }
  }, [team, showSettingsDialog]);
  
  // Team delete mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest("DELETE", `/api/teams/${teamId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete team");
        }
        return await response.json();
      } catch (error) {
        console.error("Delete team error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Team deleted",
        description: "Team has been deleted successfully.",
      });
      
      // Redirect to teams list
      navigate("/teams");
      
      // Refresh teams list
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: (error: any) => {
      console.error("Error in delete mutation:", error);
      toast({
        title: "Failed to delete team",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Team settings update mutation
  const updateTeamMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      try {
        const response = await apiRequest("PATCH", `/api/teams/${teamId}`, data);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update team settings");
        }
        return await response.json();
      } catch (error) {
        console.error("Update team error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setShowSettingsDialog(false);
      toast({
        title: "Team updated",
        description: "Team settings have been updated successfully.",
      });
      
      // Refresh team data
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${teamId}`] });
    },
    onError: (error: any) => {
      console.error("Error in update mutation:", error);
      toast({
        title: "Failed to update team",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Breadcrumbs 
        items={[
          { href: "/teams", label: "Teams" },
          { label: team?.name || "Team Details" }
        ]}
      />
      
      {/* Top controls removed per request */}
      
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
              <div className="flex gap-2">
{/* Remove the Add Member Manually button as requested */}
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowSettingsDialog(true)}
                >
                  <Settings className="h-4 w-4" />
                  Team Settings
                </Button>
              </div>
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => generateInviteMutation.mutate()}
                        disabled={generateInviteMutation.isPending}
                      >
                        <LinkIcon className="h-4 w-4" />
                        {generateInviteMutation.isPending ? "Generating..." : "Create Invite Link"}
                      </Button>
                      <Button 
                        className="flex items-center gap-2"
                        onClick={() => setShowAddMemberDialog(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Member Manually
                      </Button>
                    </div>
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
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove ${member.username || `Member ${member.userId}`} from the team?`)) {
                                    removeMemberMutation.mutate(member.userId);
                                  }
                                }}
                                disabled={removeMemberMutation.isPending}
                              >
                                {removeMemberMutation.isPending && removeMemberMutation.variables === member.userId 
                                  ? "Removing..." 
                                  : "Remove"}
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
                          <Button
                            onClick={() => generateInviteMutation.mutate()}
                            disabled={generateInviteMutation.isPending}
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            {generateInviteMutation.isPending ? "Generating..." : "Create Invite Link"}
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
      
      {/* Invite Link Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Team Invite Link</DialogTitle>
            <DialogDescription>
              Share this link with your team members to join the team.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="invite-link" className="sr-only">Invite Link</Label>
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="font-mono text-sm"
              />
            </div>
            <Button 
              type="button" 
              size="icon" 
              variant="outline"
              className="px-3"
              onClick={copyToClipboard}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start mt-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setShowInviteDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Team Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={(open) => {
        setShowSettingsDialog(open);
        if (!open) {
          // Reset state when dialog closes without saving
          if (team) {
            setTeamName(team.name);
            setTeamDescription(team.description || "");
          }
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Team Settings</DialogTitle>
            <DialogDescription>
              Update your team information and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={updateTeamMutation.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team-description">Description (Optional)</Label>
              <Input
                id="team-description"
                placeholder="Enter team description"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                disabled={updateTeamMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Briefly describe the purpose of this team
              </p>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-3">Danger Zone</h4>
              <div className="border border-red-200 rounded-md p-4 bg-red-50">
                <h5 className="text-sm font-medium text-red-800 mb-1">Delete Team</h5>
                <p className="text-xs text-red-700 mb-3">
                  Once you delete a team, there is no going back. All members will be removed.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this team? All members will be removed and this action cannot be undone.")) {
                      deleteTeamMutation.mutate();
                    }
                  }}
                  disabled={deleteTeamMutation.isPending}
                >
                  {deleteTeamMutation.isPending ? "Deleting..." : "Delete Team"}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowSettingsDialog(false)}
              disabled={updateTeamMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={() => updateTeamMutation.mutate({ 
                name: teamName,
                description: teamDescription
              })}
              disabled={updateTeamMutation.isPending || !teamName.trim()}
            >
              {updateTeamMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={(open) => {
        setShowAddMemberDialog(open);
        if (!open) {
          // Reset state when dialog closes
          setNewMemberEmail("");
          setNewMemberUsername("");
          setAddMemberStatus("idle");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a user to your team by email or username.
            </DialogDescription>
          </DialogHeader>
          
          {addMemberStatus === "error" && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-2 mt-2">
              <div className="text-red-500 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Failed to add team member</p>
                <p className="text-xs text-red-700 mt-1">The user may not exist or is already a member of this team.</p>
              </div>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                placeholder="user@example.com"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                disabled={addMemberStatus === "loading" || addMemberStatus === "success"}
              />
            </div>
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="member-username">Username</Label>
              </div>
              <Input
                id="member-username"
                placeholder="Enter username"
                value={newMemberUsername}
                onChange={(e) => setNewMemberUsername(e.target.value)}
                disabled={addMemberStatus === "loading" || addMemberStatus === "success"}
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-700 mt-2">
              <p>You need to provide either an email address or a username to add a member. The user must already have an account on the platform.</p>
            </div>
          </div>
          <DialogFooter className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowAddMemberDialog(false);
                setNewMemberEmail("");
                setNewMemberUsername("");
                setAddMemberStatus("idle");
              }}
              disabled={addMemberStatus === "loading" || addMemberStatus === "success"}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newMemberEmail || newMemberUsername) {
                  addMemberMutation.mutate({
                    email: newMemberEmail || undefined,
                    username: newMemberUsername || undefined
                  });
                } else {
                  toast({
                    title: "Missing information",
                    description: "Please provide either an email or a username.",
                    variant: "destructive"
                  });
                }
              }}
              disabled={addMemberStatus === "loading" || addMemberStatus === "success" || (!newMemberEmail && !newMemberUsername)}
              className="relative"
            >
              {addMemberStatus === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Member...
                </>
              ) : addMemberStatus === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Member Added!
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
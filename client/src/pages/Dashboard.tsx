import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  BarChart2, 
  Users, 
  PlusCircle, 
  Activity, 
  LayoutDashboard,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  MoreVertical
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatReportTitle } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // For comparison deletion
  const [comparisonToDelete, setComparisonToDelete] = useState<number | null>(null);
  const [isComparisonDeleteDialogOpen, setIsComparisonDeleteDialogOpen] = useState<boolean>(false);
  const [comparisonDeleteStatus, setComparisonDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Get tab from URL search params
  const getTabFromURL = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      return tab === 'profile' || tab === 'reports' || tab === 'teams' || tab === 'comparisons' 
        ? tab 
        : 'overview';
    }
    return 'overview';
  };
  
  interface Result {
    id: number;
    createdAt: string;
    title?: string;
    dominantColor: string;
    secondaryColor: string;
    personalityType: string;
    scores: {
      'fiery-red': number;
      'sunshine-yellow': number;
      'earth-green': number;
      'cool-blue': number;
    };
  }
  
  interface Team {
    id: number;
    name: string;
    description?: string;
    isLeader: boolean;
    memberCount: number;
  }
  
  interface Comparison {
    id: number;
    title: string;
    createdAt: string;
    reportAId: number;
    reportBId: number;
  }

  const { data: userResults, isLoading: isLoadingResults } = useQuery<Result[]>({
    queryKey: ["/api/user/results"],
    enabled: !!user
  });
  
  const { data: userTeams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: !!user
  });
  
  const { data: userComparisons, isLoading: isLoadingComparisons } = useQuery<Comparison[]>({
    queryKey: ["/api/comparisons"],
    enabled: !!user
  });
  
  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      setDeleteStatus('loading');
      const response = await apiRequest("DELETE", `/api/user/results/${reportId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete report");
      }
      return true;
    },
    onSuccess: () => {
      setDeleteStatus('success');
      
      // Close dialog and show success message after a short delay
      setTimeout(() => {
        setIsDeleteDialogOpen(false);
        setReportToDelete(null);
        setDeleteStatus('idle');
        
        // Refresh reports data
        queryClient.invalidateQueries({ queryKey: ["/api/user/results"] });
        queryClient.invalidateQueries({ queryKey: ["/api/comparisons"] }); // Also refresh comparisons as they might reference this report
        
        toast({
          title: "Report deleted",
          description: "The report has been successfully deleted.",
        });
      }, 1000);
    },
    onError: (error: Error) => {
      setDeleteStatus('error');
      toast({
        title: "Failed to delete report",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Function to handle delete confirmation
  const handleDeleteReport = () => {
    if (reportToDelete) {
      deleteReportMutation.mutate(reportToDelete);
    }
  };
  
  // Function to open delete dialog
  const openDeleteDialog = (reportId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  };
  
  // Delete comparison mutation
  const deleteComparisonMutation = useMutation({
    mutationFn: async (comparisonId: number) => {
      setComparisonDeleteStatus('loading');
      const response = await apiRequest("DELETE", `/api/comparisons/${comparisonId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete comparison");
      }
      return true;
    },
    onSuccess: () => {
      setComparisonDeleteStatus('success');
      
      toast({
        title: "Comparison deleted",
        description: "The comparison has been successfully deleted",
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/comparisons"] });
      
      // Reset state after a timeout
      setTimeout(() => {
        setIsComparisonDeleteDialogOpen(false);
        setComparisonToDelete(null);
        setComparisonDeleteStatus('idle');
      }, 1000);
    },
    onError: (error: Error) => {
      setComparisonDeleteStatus('error');
      toast({
        title: "Failed to delete comparison",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Function to handle comparison delete confirmation
  const handleDeleteComparison = () => {
    if (comparisonToDelete) {
      deleteComparisonMutation.mutate(comparisonToDelete);
    }
  };
  
  // Function to open comparison delete dialog
  const openComparisonDeleteDialog = (comparisonId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setComparisonToDelete(comparisonId);
    setIsComparisonDeleteDialogOpen(true);
  };
  
  // Helper function to get color hex value from color name
  const getColorHex = (colorName: string): string => {
    switch (colorName) {
      case 'fiery-red':
        return '#E8384F';
      case 'sunshine-yellow':
        return '#FDAF17';
      case 'earth-green':
        return '#48A43F';
      case 'cool-blue':
        return '#3E97C9';
      default:
        return '#888888';
    }
  };
  
  // Note: We're using the formatReportTitle function imported from lib/formatters
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 md:px-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.fullName}</h1>
        <p className="text-muted-foreground">
          Manage your color profiles, view team insights, and compare results.
        </p>
      </header>
      
      <Tabs 
        defaultValue={getTabFromURL()} 
        className="space-y-6"
        onValueChange={(value) => {
          // Update URL when tab changes
          const url = new URL(window.location.href);
          url.searchParams.set('tab', value);
          window.history.pushState({}, '', url);
        }}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>My Reports</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>My Teams</span>
          </TabsTrigger>
          <TabsTrigger value="comparisons" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Comparisons</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingResults ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    userResults?.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed profile assessments
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/quiz">
                  <Button size="sm" variant="outline" className="w-full">
                    <PlusCircle className="h-3.5 w-3.5 mr-2" />
                    Take a New Assessment
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingTeams ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    userTeams?.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Teams you're a member of
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/teams/create")}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-2" />
                  Create a New Team
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Comparisons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingComparisons ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    userComparisons?.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Created profile comparisons
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/comparisons/create">
                  <Button size="sm" variant="outline" className="w-full">
                    <PlusCircle className="h-3.5 w-3.5 mr-2" />
                    Create a Comparison
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your latest color profile assessment results</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResults ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : userResults && userResults.length > 0 ? (
                <div className="space-y-4">
                  {userResults.slice(0, 5).map((result: any) => (
                    <div key={result.id} className="relative">
                      <Link href={`/results/${result.id}`}>
                        <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium">{formatReportTitle(result)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {result.personalityType} - Dominant: {result.dominantColor.replace(/-/g, ' ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-2 mr-2">
                              <div className="w-4 h-8 rounded-sm" style={{ background: getColorHex(result.dominantColor) }}></div>
                              <div className="w-4 h-8 rounded-sm" style={{ background: getColorHex(result.secondaryColor) }}></div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 cursor-pointer"
                                  onClick={(e) => openDeleteDialog(result.id, e)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No reports yet</h3>
                  <p className="text-muted-foreground mb-6">Take your first assessment to see your results here.</p>
                  <Link href="/quiz">
                    <Button>
                      Start Your First Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
            {userResults && userResults.length > 0 && (
              <CardFooter>
                <Link href="/reports">
                  <Button variant="outline">View All Reports</Button>
                </Link>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>My Reports</CardTitle>
              <CardDescription>All your color profile assessment results</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResults ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : userResults && userResults.length > 0 ? (
                <div className="space-y-4">
                  {userResults.map((result: any) => (
                    <div key={result.id} className="relative">
                      <Link href={`/results/${result.id}`}>
                        <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium">{formatReportTitle(result)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {result.personalityType} - Dominant: {result.dominantColor.replace(/-/g, ' ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-2 mr-2">
                              <div className="w-4 h-8 rounded-sm" style={{ background: getColorHex(result.dominantColor) }}></div>
                              <div className="w-4 h-8 rounded-sm" style={{ background: getColorHex(result.secondaryColor) }}></div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 cursor-pointer"
                                  onClick={(e) => openDeleteDialog(result.id, e)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No reports yet</h3>
                  <p className="text-muted-foreground mb-6">Take your first assessment to see your results here.</p>
                  <Link href="/quiz">
                    <Button>
                      Start Your First Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>My Teams</CardTitle>
              <CardDescription>Teams you're a member of or leader of</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTeams ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : userTeams && userTeams.length > 0 ? (
                <div className="space-y-4">
                  {userTeams.map((team: any) => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                      <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {team.isLeader ? 'Team Leader' : 'Team Member'}
                          </p>
                        </div>
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No teams yet</h3>
                  <p className="text-muted-foreground mb-6">Create a team to collaborate and analyze group dynamics.</p>
                  <Button onClick={() => navigate("/teams/create")}>
                    Create a Team
                  </Button>
                </div>
              )}
            </CardContent>
            {userTeams && userTeams.length > 0 && (
              <CardFooter>
                <Button variant="outline" onClick={() => navigate("/teams/create")}>
                  Create a New Team
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="comparisons">
          <Card>
            <CardHeader>
              <CardTitle>My Comparisons</CardTitle>
              <CardDescription>Compare profile results to gain deeper insights</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingComparisons ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : userComparisons && userComparisons.length > 0 ? (
                <div className="space-y-4">
                  {userComparisons.map((comparison: any) => (
                    <div key={comparison.id} className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                      <Link href={`/comparisons/${comparison.id}`} className="flex-1 flex items-center">
                        <div className="flex-1">
                          <h4 className="font-medium">{comparison.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Created on {new Date(comparison.createdAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <BarChart2 className="h-5 w-5 text-muted-foreground mr-2" />
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={(e) => openComparisonDeleteDialog(comparison.id, e as any)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No comparisons yet</h3>
                  <p className="text-muted-foreground mb-6">Compare your results to understand personality dynamics.</p>
                  <Button onClick={() => navigate("/comparisons/create")}>
                    Create a Comparison
                  </Button>
                </div>
              )}
            </CardContent>
            {userComparisons && userComparisons.length > 0 && (
              <CardFooter>
                <Button variant="outline" onClick={() => navigate("/comparisons/create")}>Create a New Comparison</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Report Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {deleteStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 mb-4 p-3 rounded bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">Failed to delete the report. Please try again.</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setReportToDelete(null);
                setDeleteStatus('idle');
              }}
              disabled={deleteStatus === 'loading'}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReport}
              disabled={deleteStatus === 'loading' || deleteStatus === 'success'}
              className="relative"
            >
              {deleteStatus === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : deleteStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Deleted
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Comparison Confirmation Dialog */}
      <Dialog open={isComparisonDeleteDialogOpen} onOpenChange={setIsComparisonDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Comparison</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comparison? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {comparisonDeleteStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 mb-4 p-3 rounded bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">Failed to delete the comparison. Please try again.</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsComparisonDeleteDialogOpen(false);
                setComparisonToDelete(null);
                setComparisonDeleteStatus('idle');
              }}
              disabled={comparisonDeleteStatus === 'loading'}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteComparison}
              disabled={comparisonDeleteStatus === 'loading' || comparisonDeleteStatus === 'success'}
              className="relative"
            >
              {comparisonDeleteStatus === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : comparisonDeleteStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Deleted
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Comparison
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getColorHex(colorName: string) {
  switch (colorName) {
    case 'fiery-red':
      return '#E23D28';
    case 'sunshine-yellow':
      return '#F2CF1D';
    case 'earth-green':
      return '#42A640';
    case 'cool-blue':
      return '#1C77C3';
    default:
      return '#CCCCCC';
  }
}
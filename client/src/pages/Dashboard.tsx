import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
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
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 md:px-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.fullName}</h1>
        <p className="text-muted-foreground">
          Manage your color profiles, view team insights, and compare results.
        </p>
      </header>
      
      <Tabs defaultValue="overview" className="space-y-6">
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
                <Link href="/comparisons">
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
                    <Link key={result.id} href={`/results/${result.id}`}>
                      <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{result.title || `Assessment on ${new Date(result.createdAt).toLocaleDateString()}`}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.personalityType} - Dominant: {result.dominantColor.replace(/-/g, ' ')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-4 h-8 rounded-sm" style={{ background: getColorHex(result.dominantColor) }}></div>
                          <div className="w-4 h-8 rounded-sm" style={{ background: getColorHex(result.secondaryColor) }}></div>
                        </div>
                      </div>
                    </Link>
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
                    <Link key={result.id} href={`/results/${result.id}`}>
                      <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{result.title || `Assessment on ${new Date(result.createdAt).toLocaleDateString()}`}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.personalityType} - Dominant: {result.dominantColor.replace(/-/g, ' ')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-4 h-8 rounded-sm" style={{ background: getColorHex(result.dominantColor) }}></div>
                          <div className="w-4 h-8 rounded-sm" style={{ background: getColorHex(result.secondaryColor) }}></div>
                        </div>
                      </div>
                    </Link>
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
                    <Link key={comparison.id} href={`/comparisons/${comparison.id}`}>
                      <div className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{comparison.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Created on {new Date(comparison.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <BarChart2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No comparisons yet</h3>
                  <p className="text-muted-foreground mb-6">Compare your results to understand personality dynamics.</p>
                  <Button>
                    Create a Comparison
                  </Button>
                </div>
              )}
            </CardContent>
            {userComparisons && userComparisons.length > 0 && (
              <CardFooter>
                <Button variant="outline">Create a New Comparison</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
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
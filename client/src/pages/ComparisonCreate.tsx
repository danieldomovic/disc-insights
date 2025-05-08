import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect, useLocation } from "wouter";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ChevronLeft, 
  BarChart2, 
  FileSymlink,
  Loader2 
} from "lucide-react";

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

export default function ComparisonCreate() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [reportAId, setReportAId] = useState<string>("");
  const [reportBId, setReportBId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  
  // Fetch user's results
  const {
    data: userResults,
    isLoading: isLoadingResults,
  } = useQuery<Result[]>({
    queryKey: ["/api/user/results"],
    enabled: !!user,
  });
  
  // Create comparison mutation
  const createComparisonMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/comparisons", {
        reportAId: parseInt(reportAId),
        reportBId: parseInt(reportBId),
        title: title || "Comparison"
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Comparison created",
        description: "Your comparison has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/comparisons"] });
      navigate(`/comparisons/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create comparison",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportAId || !reportBId) {
      toast({
        title: "Please select two reports",
        description: "You need to select two different reports to compare.",
        variant: "destructive"
      });
      return;
    }
    
    if (reportAId === reportBId) {
      toast({
        title: "Cannot compare the same report",
        description: "Please select two different reports to compare.",
        variant: "destructive"
      });
      return;
    }
    
    createComparisonMutation.mutate();
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format report title for display
  const getReportLabel = (result: Result) => {
    return `${result.title || `Report from ${formatDate(result.createdAt)}`} (${result.personalityType})`;
  };
  
  // Redirect if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 flex items-center gap-2"
        onClick={() => navigate("/dashboard?tab=comparisons")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Comparisons
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Create Comparison
          </CardTitle>
          <CardDescription>
            Compare two of your personality profiles to gain deeper insights into your personality dynamics
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {isLoadingResults ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userResults && userResults.length >= 2 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="report-a">First Report</Label>
                  <Select value={reportAId} onValueChange={setReportAId}>
                    <SelectTrigger id="report-a" className="w-full">
                      <SelectValue placeholder="Select the first report" />
                    </SelectTrigger>
                    <SelectContent>
                      {userResults.map((result) => (
                        <SelectItem key={`a-${result.id}`} value={result.id.toString()}>
                          {getReportLabel(result)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-center">
                  <FileSymlink className="h-8 w-8 text-muted-foreground rotate-90" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report-b">Second Report</Label>
                  <Select value={reportBId} onValueChange={setReportBId}>
                    <SelectTrigger id="report-b" className="w-full">
                      <SelectValue placeholder="Select the second report" />
                    </SelectTrigger>
                    <SelectContent>
                      {userResults.map((result) => (
                        <SelectItem key={`b-${result.id}`} value={result.id.toString()}>
                          {getReportLabel(result)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comparison-title">Comparison Title (Optional)</Label>
                  <Input
                    id="comparison-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for this comparison"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <BarChart2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Not Enough Reports</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  You need at least two personality assessment reports to create a comparison.
                </p>
                <Button variant="outline" onClick={() => navigate("/quiz")}>
                  Take an Assessment
                </Button>
              </div>
            )}
          </CardContent>
          {userResults && userResults.length >= 2 && (
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={!reportAId || !reportBId || createComparisonMutation.isPending}
              >
                {createComparisonMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Comparison...
                  </>
                ) : (
                  "Create Comparison"
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
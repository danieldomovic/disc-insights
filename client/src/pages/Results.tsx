import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ColorChart from "@/components/ColorChart";
import PersonaChart from "@/components/PersonaChart";
import { ColorProfileDetail } from "@/components/ColorProfile";
import PreferenceFlowGraph from "@/components/PreferenceFlowGraph";
import { colorProfiles, personalityProfiles, ColorType, PersonalityType } from "@/lib/colorProfiles";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { DownloadIcon, PrinterIcon, Trash2, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatReportTitle } from "@/lib/formatters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

interface QuizResultData {
  id: number;
  // Conscious profile
  scores: Record<ColorType, number>;
  dominantColor: ColorType;
  secondaryColor: ColorType;
  personalityType: PersonalityType;
  // Unconscious profile (optional)
  unconsciousScores?: Record<ColorType, number>;
  dominantUnconsciousColor?: ColorType;
  secondaryUnconsciousColor?: ColorType;
  unconsciousPersonalityType?: PersonalityType;
  createdAt?: string;
}

export default function Results() {
  const [match, params] = useRoute<{ resultId?: string }>("/results/:resultId?");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [chartJsLoaded, setChartJsLoaded] = useState(false);
  
  // Calculate raw scores - converting percentages to 0-6 scale for Insights Discovery format
  const calculateRawScores = (percentages: Record<ColorType, number>) => {
    const rawScores: Record<ColorType, number> = {} as Record<ColorType, number>;
    for (const [color, percentage] of Object.entries(percentages) as [ColorType, number][]) {
      // Convert percentage (0-100) to the 0-6 scale
      rawScores[color] = (percentage / 100) * 6;
    }
    return rawScores;
  };
  const reportRef = useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async () => {
      if (!params?.resultId) return;
      
      const response = await apiRequest("DELETE", `/api/user/results/${params.resultId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete report");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Report deleted",
        description: "Your report has been permanently deleted",
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/user/results"] });
      
      // Navigate back to dashboard
      navigate("/dashboard?tab=reports");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete report",
        description: error.message,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
    }
  });
  
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
    personalityType: "Reformer",
    unconsciousScores: {
      "fiery-red": 20,
      "sunshine-yellow": 15,
      "earth-green": 25,
      "cool-blue": 40
    },
    dominantUnconsciousColor: "cool-blue",
    secondaryUnconsciousColor: "earth-green",
    unconsciousPersonalityType: "Observer",
    createdAt: new Date().toISOString()
  };
  
  // Fetch result from API if resultId is provided
  const { data: apiResult, isLoading, error } = useQuery({
    queryKey: ["/api/quiz/results", params?.resultId],
    queryFn: params?.resultId ? undefined : () => mockResult,
    enabled: !!params?.resultId
  });
  
  // Use either the API result or the mock result
  const result = apiResult || mockResult;
  
  // Get the personality profile based on the result
  const profile = personalityProfiles[result.personalityType];
  
  // Ensure createdAt is always defined for the formatter
  const reportData = {
    id: result.id,
    createdAt: result.createdAt || new Date().toISOString()
  };
  
  // Use the shared formatter to create standardized report title
  const reportTitle = formatReportTitle(reportData);
  
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

  // Function to generate and download a professionally designed PDF
  const generatePDF = async () => {
    if (isPdfGenerating) return;
    setIsPdfGenerating(true);

    try {
      // Create a new jsPDF instance with A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add basic content
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      
      // Title and header
      pdf.setFontSize(18);
      pdf.text("Insights Discovery Profile", pdfWidth/2, 20, { align: 'center' });
      
      // Add profile type
      pdf.setFontSize(16);
      pdf.text(`Your Type: ${profile.name}`, pdfWidth/2, 40, { align: 'center' });
      
      // Add color energies
      pdf.setFontSize(14);
      pdf.text(`Dominant Colors: ${colorProfiles[result.dominantColor].name} + ${colorProfiles[result.secondaryColor].name}`, 
               pdfWidth/2, 50, { align: 'center' });
      
      // Description
      pdf.setFontSize(12);
      pdf.text(profile.description, margin, 70, { 
        maxWidth: pdfWidth - (margin * 2)
      });
      
      // Generate and download the PDF
      const pdfOutput = pdf.output('datauristring');
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfOutput;
      downloadLink.download = `${profile.name}_Profile_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadLink.click();
      
      toast({
        title: "PDF Generated",
        description: "Your profile report has been downloaded"
      });
      
      setIsPdfGenerating(false);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF report",
        variant: "destructive"
      });
      setIsPdfGenerating(false);
    }
  };

  // Handler for the download button
  const handleDownload = () => {
    generatePDF();
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto pt-8 pb-16">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-5xl mx-auto pt-16 pb-16 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Results</h2>
        <p className="text-lg text-muted-foreground mb-8">
          {error instanceof Error ? error.message : "Failed to load quiz results"}
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <section className="container max-w-5xl mx-auto pt-8 pb-16">
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link to="/">Home</Link>
        </Breadcrumbs.Item>
        {user && (
          <Breadcrumbs.Item>
            <Link to="/dashboard">Dashboard</Link>
          </Breadcrumbs.Item>
        )}
        <Breadcrumbs.Item isCurrentPage>Results</Breadcrumbs.Item>
      </Breadcrumbs>
      
      <div ref={reportRef}>
        <Card className="mt-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/30 to-primary/10 py-8 px-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {profile.name} Personality Type
              </h1>
              <p className="text-xl mt-2">
                {colorProfiles[result.dominantColor].name} + {colorProfiles[result.secondaryColor].name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg">{reportTitle}</p>
              <p className="opacity-80 mt-1">Generated from your quiz responses</p>
            </div>
          </div>
          
          <CardContent className="p-8">
            {/* Center charts section - full width */}
            <h3 className="text-2xl font-semibold mb-6 text-center">Your Color Energy Profile</h3>
            
            {/* All charts in the center */}
            {chartJsLoaded && (
              <>
                {result.unconsciousScores ? (
                  <div className="w-full flex flex-col items-center mb-12">
                    {/* Charts section - centered */}
                    <div className="flex flex-col md:flex-row justify-center gap-8 py-6 overflow-x-auto w-full">
                      {/* Conscious Persona */}
                      <div className="flex flex-col items-center min-w-[240px]">
                        <h3 className="text-base font-bold text-center mb-2">
                          Persona (Conscious)
                        </h3>
                        <PersonaChart 
                          scores={result.scores} 
                          height={240}
                          width={240}
                        />
                      </div>
                      
                      {/* Preference Flow */}
                      <div className="flex flex-col items-center min-w-[240px]">
                        <h3 className="text-base font-bold text-center mb-2">
                          Preference Flow
                        </h3>
                        <PreferenceFlowGraph 
                          consciousScores={result.scores} 
                          unconsciousScores={result.unconsciousScores}
                          height={240}
                          width={240}
                        />
                      </div>
                      
                      {/* Less Conscious Persona */}
                      <div className="flex flex-col items-center min-w-[240px]">
                        <h3 className="text-base font-bold text-center mb-2">
                          Persona (Less Conscious)
                        </h3>
                        <PersonaChart 
                          scores={result.unconsciousScores} 
                          height={240}
                          width={240}
                          isDashed
                        />
                      </div>
                    </div>
                    
                    {/* Explanation box below charts */}
                    <div className="bg-muted/50 p-4 rounded-lg max-w-3xl mt-4">
                      <p className="text-muted-foreground text-sm">
                        Your conscious profile (how you choose to adapt) is calculated as the arithmetic mean of each color's 25 scores divided by 6 to 
                        determine the percentage. Your unconscious (less conscious) profile is calculated using the formula: less_conscious[color] = 6 - conscious[opposite_color]. 
                        <br /><br />
                        On the 0-6 scale, "Most like me" (M) ratings are scored as 6 and "Least like me" (L) ratings are scored as 0, with numeric 
                        values (1-5) scored accordingly. The differences between profiles reveal where your conscious adaptations differ from your 
                        natural instinctive preferences.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <ColorChart 
                      scores={result.scores} 
                      height={300}
                      width={300}
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Profile summary - full width content */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-6">{profile.name} Profile Overview</h3>
              <div className="prose prose-lg max-w-none">
                <p>{profile.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Strengths */}
              <div>
                <h3 className="text-xl font-semibold mb-4 border-l-4 border-primary pl-4">Key Strengths</h3>
                <div className="prose">
                  <p>{profile.strengths}</p>
                </div>
              </div>
              
              {/* Development areas */}
              <div>
                <h3 className="text-xl font-semibold mb-4 border-l-4 border-primary pl-4">Development Areas</h3>
                <div className="prose">
                  <p>{profile.development}</p>
                </div>
              </div>
            </div>
            
            {/* Behavior patterns - three columns on desktop */}
            <div className="mt-12">
              <h3 className="text-2xl font-semibold mb-6">Behavior Patterns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* On good days */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-lg font-medium mb-4">On Your Best Days</h4>
                    <ul className="space-y-2">
                      {profile.onGoodDay.map((trait, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Likes */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-lg font-medium mb-4">Work You Excel At</h4>
                    <ul className="space-y-2">
                      {profile.likes.map((like, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{like}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* On bad days */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-lg font-medium mb-4">On Challenging Days</h4>
                    <ul className="space-y-2">
                      {profile.onBadDay.map((trait, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Dominant color profile detail - full width */}
            <div className="mt-12">
              <h3 className="text-2xl font-semibold mb-6">Your Dominant Color Energy</h3>
              <ColorProfileDetail colorType={result.dominantColor} />
            </div>
            
            {/* Secondary color profile - full width */}
            <div className="mt-12">
              <h3 className="text-2xl font-semibold mb-6">Your Secondary Color Energy</h3>
              <ColorProfileDetail colorType={result.secondaryColor} />
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mt-12 justify-center">
              <Button
                className="gap-2"
                onClick={handleDownload}
                disabled={isPdfGenerating}
              >
                {isPdfGenerating ? (
                  <>Generating</>
                ) : (
                  <>
                    <DownloadIcon className="h-4 w-4" />
                    Download PDF Report
                  </>
                )}
              </Button>
              
              {user && params?.resultId && (
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                      Delete Report
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this report?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your quiz result and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteReportMutation.mutate()}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deleteReportMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

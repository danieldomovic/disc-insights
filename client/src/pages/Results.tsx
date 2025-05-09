import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ColorChart from "@/components/ColorChart";
import { ColorProfileDetail } from "@/components/ColorProfile";
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
  scores: Record<ColorType, number>;
  dominantColor: ColorType;
  secondaryColor: ColorType;
  personalityType: PersonalityType;
  createdAt?: string;
}

export default function Results() {
  const [match, params] = useRoute<{ resultId?: string }>("/results/:resultId?");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [chartJsLoaded, setChartJsLoaded] = useState(false);
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
    createdAt: new Date().toISOString()
  };
  
  // If we have a resultId, fetch the result
  const { data: fetchedResult, isLoading } = useQuery<QuizResultData>({
    queryKey: [params?.resultId ? `/api/quiz/results/${params.resultId}` : null],
    enabled: !!params?.resultId,
  });
  
  // Use fetched result if available, otherwise use mock result
  const result = fetchedResult || mockResult;
  
  // Get personality profile based on the result
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
    if (!reportRef.current) return;
    
    setIsPdfGenerating(true);
    
    try {
      // A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // mm
      const contentWidth = pdfWidth - (margin * 2);
      
      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, fontStyle: string = 'normal') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        
        return lines.length * (fontSize * 0.352778); // Approximate height of text block
      };
      
      // Helper to create page header
      const addHeader = (pageTitle: string, pageNumber?: number) => {
        // Add gradient header
        pdf.setFillColor(65, 105, 225); // Royal blue
        pdf.rect(0, 0, pdfWidth, 25, 'F');
        
        pdf.setFillColor(25, 25, 112); // Midnight blue
        pdf.rect(pdfWidth/2, 0, pdfWidth/2, 25, 'F');
        
        // Add title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text("Insights Discovery Profile", margin, 13);
        
        // Add page subtitle
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(pageTitle, margin, 20);
        
        // Add report title on right
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        const titleText = reportTitle;
        pdf.text(titleText, pdfWidth - margin - pdf.getTextWidth(titleText), 13);
        
        // Add page number if provided
        if (pageNumber) {
          pdf.text(`Page ${pageNumber}`, pdfWidth - margin - pdf.getTextWidth(`Page ${pageNumber}`), 20);
        }
        
        // Bottom border
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, 30, pdfWidth - margin, 30);
      };
      
      // Function to add section title with styling
      const addSectionTitle = (title: string, yPosition: number) => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition - 6, contentWidth, 8, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 2, yPosition);
        
        return yPosition + 10;
      };
      
      // Add content to the PDF
      let yPosition = 40;
      
      // Section 1: Overview and Introduction
      yPosition = addSectionTitle("Overview", yPosition);
      yPosition += addWrappedText(
        `Your Insights Discovery profile reveals that your dominant energy is ${colorProfiles[result.dominantColor].name} with ${colorProfiles[result.secondaryColor].name} as your secondary energy. This makes you a ${profile.name} type.`,
        margin, yPosition, contentWidth, 10
      ) + 5;
      
      yPosition += addWrappedText(
        `${profile.description} This report provides insights into your unique personality preferences, strengths, and potential areas for development.`,
        margin, yPosition, contentWidth, 10
      ) + 10;
      
      // Section 2: Color Energies Summary
      yPosition = addSectionTitle("Your Color Energy Preferences", yPosition);
      
      // Add a brief description of each color energy the person possesses
      Object.entries(result.scores).sort((a, b) => b[1] - a[1]).forEach(([color, score]) => {
        const colorKey = color as ColorType;
        if (score > 0) {
          yPosition += 5;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${colorProfiles[colorKey].name}: ${score}%`, margin, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          yPosition += addWrappedText(
            colorProfiles[colorKey].description,
            margin, yPosition, contentWidth, 9
          ) + 3;
        }
      });
      
      yPosition += 10;
      
      // Section 3: Personal Strengths
      yPosition = addSectionTitle("Your Key Strengths", yPosition);
      yPosition += addWrappedText(
        profile.strengths,
        margin, yPosition, contentWidth, 10
      ) + 10;
      
      // Start a new page for the rest of the content
      pdf.addPage();
      addHeader("Insights Discovery Profile", 2);
      yPosition = 40;
      
      // Section 4: Communication Style
      yPosition = addSectionTitle("Communication Style", yPosition);
      
      // Add communication preferences based on dominant color
      const dominantColorProfile = colorProfiles[result.dominantColor];
      
      yPosition += addWrappedText(
        `As someone with a preference for ${dominantColorProfile.name} energy, you tend to communicate in a way that is ${dominantColorProfile.appears.toLowerCase()}. You value being ${dominantColorProfile.likesYouToBe.toLowerCase()} in interactions.`,
        margin, yPosition, contentWidth, 10
      ) + 5;
      
      yPosition += addWrappedText(
        `When communicating with you, others should be aware that you may become irritated by ${dominantColorProfile.canBeIrritatedBy.toLowerCase()}. Under pressure, you may ${dominantColorProfile.underPressureMay.toLowerCase()}.`,
        margin, yPosition, contentWidth, 10
      ) + 10;
      
      // Section 5: Work Style & Contributions
      yPosition = addSectionTitle("Work Style & Contributions to Teams", yPosition);
      
      // Add work style based on personality type
      yPosition += addWrappedText(
        `On your best days, you bring these positive qualities to your work: ${profile.onGoodDay.join(", ")}.`,
        margin, yPosition, contentWidth, 10
      ) + 5;
      
      yPosition += addWrappedText(
        `You particularly enjoy and excel at work that involves ${profile.likes.join(" and ")}.`,
        margin, yPosition, contentWidth, 10
      ) + 5;
      
      yPosition += addWrappedText(
        `Your goals often center around ${profile.goals.join(" and ")}.`,
        margin, yPosition, contentWidth, 10
      ) + 10;
      
      // Section 6: Potential Challenges
      yPosition = addSectionTitle("Potential Challenges", yPosition);
      
      yPosition += addWrappedText(
        `When under stress or pressure, you may exhibit these less effective behaviors: ${profile.onBadDay.join(", ")}.`,
        margin, yPosition, contentWidth, 10
      ) + 5;
      
      yPosition += addWrappedText(
        `You may find it challenging to work with people who don't appreciate your approach or who demonstrate opposite preferences to yours.`,
        margin, yPosition, contentWidth, 10
      ) + 5;
      
      yPosition += addWrappedText(
        `In difficult situations, be aware that you may fear ${profile.fears.join(" and ")}.`,
        margin, yPosition, contentWidth, 10
      ) + 10;
      
      // Section 7: Development Suggestions
      yPosition = addSectionTitle("Development Suggestions", yPosition);
      
      yPosition += addWrappedText(
        profile.development,
        margin, yPosition, contentWidth, 10
      ) + 10;
      
      // Section 8: Action Plan
      yPosition = addSectionTitle("Personal Action Plan", yPosition);
      
      // Add blank action plan template
      yPosition += 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Areas I want to develop:", margin, yPosition);
      yPosition += 5;
      
      // Create 3 blank lines for notes
      for (let i = 0; i < 3; i++) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition + (i * 8), pdfWidth - margin, yPosition + (i * 8));
      }
      
      yPosition += 30;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Specific actions I will take:", margin, yPosition);
      yPosition += 5;
      
      // Create 3 blank lines for notes
      for (let i = 0; i < 3; i++) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition + (i * 8), pdfWidth - margin, yPosition + (i * 8));
      }
      
      // Add footer
      yPosition = pdfHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`This report was generated based on your responses to the Insights Discovery questionnaire.`, margin, yPosition);
      pdf.text(`© ${new Date().getFullYear()} Insights Discovery Color Profile Assessment Tool`, margin, yPosition + 5);
      
      // Get final PDF filename
      const filename = `Insights_Discovery_${reportTitle.replace(/[#:,\s]/g, '_')}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Error",
        description: "There was a problem creating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Breadcrumbs 
          items={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/reports", label: "Reports" },
            { label: "Profile Results" }
          ]}
          className="mb-6"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Insights Discovery Profile</h1>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-10">
              <Skeleton className="h-8 w-3/4" />
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <motion.section
      className="container max-w-4xl mx-auto py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Breadcrumbs 
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/reports", label: "Reports" },
          { label: "Profile Results" }
        ]}
        className="mb-6"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Insights Discovery Profile</h1>
        <div className="flex gap-3">
          <Button 
            onClick={generatePDF} 
            disabled={isPdfGenerating}
            className="flex items-center gap-2"
          >
            {isPdfGenerating ? "Generating..." : (
              <>
                <DownloadIcon size={18} />
                Download PDF
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <PrinterIcon size={18} />
            Print
          </Button>
          
          {/* Only show delete button for authenticated users with a real report */}
          {user && params?.resultId && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Delete this report?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    personality profile report and all associated data.
                    {/* Add warning about comparisons */}
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                      <p className="font-medium">Note:</p> 
                      <p>If this report is used in any comparisons, you'll need to delete those comparisons first.</p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      deleteReportMutation.mutate();
                    }}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={deleteReportMutation.isPending}
                  >
                    {deleteReportMutation.isPending ? "Deleting..." : "Delete Report"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      <div ref={reportRef} className="space-y-8">
        {/* Report Header */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <div className="flex justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Insights Discovery</h2>
                <p className="text-xl opacity-90">Personal Profile Report</p>
              </div>
              <div className="text-right">
                <p className="text-lg">{reportTitle}</p>
                <p className="opacity-80 mt-1">Generated from your quiz responses</p>
              </div>
            </div>
          </div>
          
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="color-chart-section">
                <h3 className="text-xl font-semibold mb-4">Your Color Energy Preferences</h3>
                {chartJsLoaded && <ColorChart scores={result.scores} />}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#E23D28] mr-2"></div>
                    <span className="text-sm">Fiery Red: <span className="font-semibold">{result.scores["fiery-red"]}%</span></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#F2CF1D] mr-2"></div>
                    <span className="text-sm">Sunshine Yellow: <span className="font-semibold">{result.scores["sunshine-yellow"]}%</span></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#42A640] mr-2"></div>
                    <span className="text-sm">Earth Green: <span className="font-semibold">{result.scores["earth-green"]}%</span></span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#1C77C3] mr-2"></div>
                    <span className="text-sm">Cool Blue: <span className="font-semibold">{result.scores["cool-blue"]}%</span></span>
                  </div>
                </div>
              </div>
              
              <div className="personality-type-section">
                <h3 className="text-xl font-semibold mb-4">
                  Your Dominant Type: <span style={{ color: colorProfiles[profile.color].bgColor }}>{profile.name}</span>
                </h3>
                <div className="mb-6">
                  <p className="mb-4 text-gray-700">
                    {profile.description}
                  </p>
                </div>
                
                <div 
                  className="p-4 rounded-md mt-4"
                  style={{ 
                    backgroundColor: `${colorProfiles[profile.color]?.bgColor || '#f0f0f0'}15`, 
                    borderLeft: `4px solid ${colorProfiles[profile.color]?.bgColor || '#000000'}` 
                  }}
                >
                  <p className="font-semibold mb-2">Primary Color Energies:</p>
                  <p className="text-gray-700">
                    {profile.dominantColors?.map((color, index) => {
                      const colorProfile = colorProfiles[color as ColorType];
                      return (
                        <span key={color}>
                          <span style={{ color: colorProfile?.bgColor || '#000000' }}>
                            {colorProfile?.name || color}
                          </span>
                          {index < (profile.dominantColors?.length || 0) - 1 && " and "}
                        </span>
                      );
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Overview Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Overview</h3>
            <p className="text-gray-700 mb-4">
              Your Insights Discovery profile reveals that your dominant energy is {colorProfiles[result.dominantColor].name} with {colorProfiles[result.secondaryColor].name} as your secondary energy. This makes you a {profile.name} type.
            </p>
            <p className="text-gray-700">
              {profile.description} This report provides insights into your unique personality preferences, strengths, and potential areas for development.
            </p>
          </CardContent>
        </Card>
        
        {/* Key Strengths Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Your Key Strengths</h3>
            <p className="text-gray-700">
              {profile.strengths}
            </p>
          </CardContent>
        </Card>
        
        {/* Communication Style Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Communication Style</h3>
            <p className="text-gray-700 mb-4">
              As someone with a preference for {colorProfiles[result.dominantColor].name} energy, you tend to communicate in a way that is {colorProfiles[result.dominantColor].appears.toLowerCase()}. You value being {colorProfiles[result.dominantColor].likesYouToBe.toLowerCase()} in interactions.
            </p>
            <p className="text-gray-700">
              When communicating with you, others should be aware that you may become irritated by {colorProfiles[result.dominantColor].canBeIrritatedBy.toLowerCase()}. Under pressure, you may {colorProfiles[result.dominantColor].underPressureMay.toLowerCase()}.
            </p>
          </CardContent>
        </Card>
        
        {/* Work Style & Contributions Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Work Style & Contributions to Teams</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <h4 className="font-semibold">At Your Best</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                  {profile.onGoodDay.map((trait, index) => (
                    <li key={index}>{trait}</li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">You Enjoy</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                  {profile.likes.map((like, index) => (
                    <li key={index}>{like}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <p className="text-gray-700">
              Your goals often center around {profile.goals.join(" and ")}.
            </p>
          </CardContent>
        </Card>
        
        {/* Potential Challenges Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Potential Challenges</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Potential Blind Spots</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                  {profile.onBadDay.map((trait, index) => (
                    <li key={index}>{trait}</li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Common Fears</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                  {profile.fears.map((fear, index) => (
                    <li key={index}>{fear}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <p className="text-gray-700">
              You may find it challenging to work with people who don't appreciate your approach or who demonstrate opposite preferences to yours.
            </p>
          </CardContent>
        </Card>
        
        {/* Development Suggestions Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Development Suggestions</h3>
            <p className="text-gray-700">
              {profile.development}
            </p>
          </CardContent>
        </Card>
        
        {/* Color Analysis */}
        <Tabs defaultValue="dominant" className="mt-8">
          <TabsList className="mb-4">
            <TabsTrigger value="dominant">{colorProfiles[result.dominantColor].name} Energy (Primary)</TabsTrigger>
            <TabsTrigger value="secondary">{colorProfiles[result.secondaryColor].name} Energy (Secondary)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dominant">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: colorProfiles[result.dominantColor].bgColor }}>
                  Your {colorProfiles[result.dominantColor].name} Energy
                </h3>
                <div className="space-y-4">
                  <ColorProfileDetail color={result.dominantColor} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="secondary">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: colorProfiles[result.secondaryColor].bgColor }}>
                  Your {colorProfiles[result.secondaryColor].name} Energy
                </h3>
                <div className="space-y-4">
                  <ColorProfileDetail color={result.secondaryColor} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Personal Action Plan */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Personal Action Plan</h3>
            <p className="text-gray-700 mb-4">
              Based on your profile, consider these areas for development:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-4 border rounded-md">
                <h4 className="font-semibold mb-2">Enhance Your Secondary Colors</h4>
                <p className="text-gray-700 mb-4">
                  Focus on developing your less dominant color energies to create a more balanced approach:
                </p>
                {Object.entries(result.scores)
                  .sort((a, b) => a[1] - b[1])
                  .slice(0, 2)
                  .map(([color, score]) => {
                    const colorKey = color as ColorType;
                    return (
                      <div key={color} className="mb-3">
                        <div className="flex items-center mb-1">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colorProfiles[colorKey].bgColor }}></div>
                          <span className="font-medium">{colorProfiles[colorKey].name}</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-5">
                          Try to incorporate more {colorProfiles[colorKey].name.toLowerCase()} behaviors like being {colorProfiles[colorKey].description.toLowerCase().split(',')[0]}.
                        </p>
                      </div>
                    );
                  })
                }
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-semibold mb-2">Adapt Your Communication</h4>
                <p className="text-gray-700 mb-4">
                  When working with others who have different preferences:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>With Fiery Red colleagues: Be direct, focus on results, and avoid unnecessary details.</li>
                  <li>With Sunshine Yellow colleagues: Be enthusiastic, focus on the big picture, and allow time for socializing.</li>
                  <li>With Earth Green colleagues: Be patient, focus on relationships, and show genuine care.</li>
                  <li>With Cool Blue colleagues: Be precise, focus on accuracy, and provide detailed information.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}
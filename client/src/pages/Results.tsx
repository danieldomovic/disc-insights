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
  
  // Format date to "Month Day, Year" format
  const formattedDate = result.createdAt 
    ? new Date(result.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
  // Create formatted report title in "Report #ID - Month Day, Year" format
  const reportTitle = `Report #${result.id} - ${formattedDate}`;
  
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
        
        {/* Color Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">At Your Best</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
              {profile.onGoodDay.map((trait, index) => (
                <li key={index}>{trait}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Potential Blind Spots</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
              {profile.onBadDay.map((trait, index) => (
                <li key={index}>{trait}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Dominant Color Analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Your {colorProfiles[result.dominantColor].name} Energy</h3>
            <div className="space-y-4">
              <ColorProfileDetail color={result.dominantColor} />
            </div>
          </CardContent>
        </Card>
        
        {/* Secondary Color Analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Your {colorProfiles[result.secondaryColor].name} Energy</h3>
            <div className="space-y-4">
              <ColorProfileDetail color={result.secondaryColor} />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}
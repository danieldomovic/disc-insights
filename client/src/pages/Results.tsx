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
    if (isPdfGenerating) return;
    setIsPdfGenerating(true);

    try {
      // Create a new jsPDF instance with A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Page dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 20; // Wider margins for better readability
      const contentWidth = pdfWidth - (margin * 2);
      
      // Utility function to convert hex to RGB
      const hexToRgb = (hex: string) => {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
      };
      
      // Modern color palette based on user's dominant color
      const primaryColor = hexToRgb(colorProfiles[result.dominantColor].bgColor);
      const primaryLight = {
        r: Math.min(255, primaryColor.r + 90),
        g: Math.min(255, primaryColor.g + 90),
        b: Math.min(255, primaryColor.b + 90)
      };
      
      const colors = {
        primary: primaryColor,
        secondary: hexToRgb(colorProfiles[result.secondaryColor].bgColor),
        darkText: {r: 33, g: 37, b: 41},
        mediumText: {r: 73, g: 80, b: 87},
        lightText: {r: 108, g: 117, b: 125},
        bgLight: {r: 248, g: 249, b: 250},
        bgMedium: {r: 233, g: 236, b: 239},
        success: {r: 40, g: 167, b: 69},
        warning: {r: 255, g: 193, b: 7},
        blue: {r: 72, g: 133, b: 237},
        lightBlue: {r: 240, g: 245, b: 255}
      };

      // Helper function to add text with word wrapping and modern styling
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, 
                              color = colors.mediumText, fontStyle: string = 'normal') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color.r, color.g, color.b);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        
        return lines.length * (fontSize * 0.352778); // Approximate height of text block
      };
      
      // Helper to create a modern page header with logo effect
      const addHeader = (pageTitle: string, pageNumber: number) => {
        // Add colored banner header
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.rect(0, 0, pdfWidth, 18, 'F');
        
        // Add title with a logo effect
        pdf.setFillColor(255, 255, 255);
        pdf.circle(margin - 2, 9, 5, 'F');
        
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.circle(margin - 2, 9, 3, 'F');
        
        // Title text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text("Insights Discovery Profile", margin + 6, 9.5);
        
        // Add subtle page number indicator at the bottom of the page
        pdf.setTextColor(colors.lightText.r, colors.lightText.g, colors.lightText.b);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${pageNumber}`, pdfWidth - margin - 10, pdfHeight - 8);
        
        // Add date at the bottom of the page
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, pdfHeight - 8);
      };
      
      // Function to add a modern section title with accent bar
      const addSectionTitle = (title: string, yPosition: number) => {
        // Accent bar
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.rect(margin, yPosition, 5, 12, 'F');
        
        // Title text
        pdf.setTextColor(colors.darkText.r, colors.darkText.g, colors.darkText.b);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 8, yPosition + 9);
        
        return yPosition + 18; // Return next Y position
      };
      
      // Function to add a modern card with colored header
      const addCard = (title: string, content: string, yPosition: number, height: number, 
                       headerColor = primaryColor, bgColor = colors.bgLight) => {
        // Card background with shadow effect
        pdf.setDrawColor(220, 220, 220);
        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
        pdf.roundedRect(margin, yPosition, contentWidth, height, 3, 3, 'FD');
        
        // Card header
        pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b);
        pdf.roundedRect(margin, yPosition, contentWidth, 10, 3, 3, 'F');
        
        // Title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 6, yPosition + 6.5);
        
        // Content
        const contentY = yPosition + 15;
        const contentLines = pdf.splitTextToSize(content, contentWidth - 12);
        pdf.setTextColor(colors.mediumText.r, colors.mediumText.g, colors.mediumText.b);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(contentLines, margin + 6, contentY);
        
        return yPosition + height + 6; // Return next Y position with spacing
      };
      
      // Add content to the PDF
      // First page - Cover page with profile summary
      addHeader("Insights Discovery Profile", 1);
      let yPosition = 30;
      
      // Create a profile header card with user's type
      pdf.setDrawColor(colors.bgMedium.r, colors.bgMedium.g, colors.bgMedium.b);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, yPosition, contentWidth, 40, 4, 4, 'FD');
      
      // User's type and personalized title
      pdf.setTextColor(colors.darkText.r, colors.darkText.g, colors.darkText.b);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${profile.name} Type`, margin + 10, yPosition + 18);
      
      // Subtitle with color energies
      pdf.setTextColor(colors.mediumText.r, colors.mediumText.g, colors.mediumText.b);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${colorProfiles[result.dominantColor].name} + ${colorProfiles[result.secondaryColor].name}`, 
                margin + 10, yPosition + 30);
              
      // Report title 
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(colors.lightText.r, colors.lightText.g, colors.lightText.b);
      pdf.text(reportTitle, margin + 10, yPosition + 38);
      
      yPosition += 50;
      
      // Color bars visualization - modern and easier to read than pie charts
      yPosition = addSectionTitle("Your Color Energy Distribution", yPosition);
      
      // Modern horizontal bar chart
      const barHeight = 16;
      const barSpacing = 8;
      const maxBarWidth = contentWidth - 60;
      
      // Get colors sorted by score
      const colorBars = Object.entries(result.scores)
        .sort((a, b) => b[1] - a[1])
        .map(([colorName, score]) => ({ 
          color: colorName as ColorType, 
          score 
        }));
      
      // Draw background container
      pdf.setFillColor(colors.bgLight.r, colors.bgLight.g, colors.bgLight.b);
      pdf.roundedRect(margin, yPosition, contentWidth, 
                      colorBars.length * (barHeight + barSpacing) + 10, 3, 3, 'F');
      
      // Draw bars
      colorBars.forEach((item, index) => {
        const barY = yPosition + 10 + (index * (barHeight + barSpacing));
        const barWidth = (item.score / 100) * maxBarWidth;
        const rgb = hexToRgb(colorProfiles[item.color].bgColor);
        
        // Label
        pdf.setTextColor(colors.darkText.r, colors.darkText.g, colors.darkText.b);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(colorProfiles[item.color].name, margin + 5, barY + 4);
        
        // Background bar
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(margin + 55, barY - 5, maxBarWidth, barHeight, 3, 3, 'F');
        
        // Colored score bar
        pdf.setFillColor(rgb.r, rgb.g, rgb.b);
        if (barWidth > 0) {
          pdf.roundedRect(margin + 55, barY - 5, barWidth, barHeight, 3, 3, 'F');
        }
        
        // Score label
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        
        // If bar is wide enough, put text inside with white color
        if (barWidth > 25) {
          pdf.setTextColor(255, 255, 255);
          pdf.text(`${item.score}%`, margin + 60, barY + 4);
        } else {
          // Otherwise put it after the bar
          pdf.setTextColor(colors.darkText.r, colors.darkText.g, colors.darkText.b);
          pdf.text(`${item.score}%`, margin + 55 + barWidth + 5, barY + 4);
        }
      });
      
      yPosition += (colorBars.length * (barHeight + barSpacing)) + 20;
      
      // Overview card with profile summary
      yPosition = addSectionTitle("Profile Overview", yPosition);
      
      // Add profile description in a modern card
      yPosition = addCard(
        "About Your Personality Type",
        profile.description,
        yPosition,
        60, // Approximate height
        colors.primary
      );
      
      // Key strengths card
      yPosition = addCard(
        "Key Strengths",
        profile.strengths,
        yPosition,
        60, // Approximate height
        colors.success
      );
      
      // Add a new page
      pdf.addPage();
      addHeader("Insights Discovery Profile", 2);
      yPosition = 30;
      
      // Behavior patterns with modern cards
      yPosition = addSectionTitle("Behavior Patterns", yPosition);
      
      // Create a combined content card
      const behaviorContent = `On Your Best Days:\n• ${profile.onGoodDay.join('\n• ')}\n\nOn Your Challenging Days:\n• ${profile.onBadDay.join('\n• ')}`;
      
      // Use a single card for consistency
      yPosition = addCard(
        "Your Behavior Patterns",
        behaviorContent,
        yPosition,
        90,
        colors.primary
      );
      
      yPosition += 10;
      
      // Communication style section
      yPosition = addSectionTitle("Communication Style", yPosition);
      
      // Add communication card with content
      const communicationContent = 
        `As someone with a preference for ${colorProfiles[result.dominantColor].name} energy, you tend to communicate in a way that is ${colorProfiles[result.dominantColor].appears.toLowerCase()}. You value being ${colorProfiles[result.dominantColor].likesYouToBe.toLowerCase()} in interactions.\n\nWhen communicating with you, others should be aware that you may become irritated by ${colorProfiles[result.dominantColor].canBeIrritatedBy.toLowerCase()}. Under pressure, you may ${colorProfiles[result.dominantColor].underPressureMay.toLowerCase()}.`;
      
      yPosition = addCard(
        "Your Communication Preferences",
        communicationContent,
        yPosition,
        60,
        colors.blue
      );
      
      // Work preferences section
      yPosition = addSectionTitle("Work Style & Preferences", yPosition);
      
      // Combined work preferences content
      const workContent = 
        `Your work style is characterized by these positive qualities: ${profile.onGoodDay.join(", ")}.\n\nYou particularly enjoy and excel at work that involves ${profile.likes.join(" and ")}.\n\nYour professional goals often center around ${profile.goals.join(" and ")}.`;
      
      yPosition = addCard(
        "Your Work Preferences",
        workContent,
        yPosition,
        70,
        colors.primary
      );
      
      // Add a new page
      pdf.addPage();
      addHeader("Insights Discovery Profile", 3);
      yPosition = 30;
      
      // Learning Style section
      yPosition = addSectionTitle("Learning Style Preferences", yPosition);
      yPosition = addCard(
        "How You Learn Best",
        colorProfiles[result.dominantColor].learningStyle,
        yPosition,
        55,
        colors.blue
      );
      
      // Communication Guidelines section
      yPosition = addSectionTitle("Communication Guidelines", yPosition);
      
      // Create content for communication guidelines
      const commGuideContent = `Others communicate most effectively with you when they:\n\n${colorProfiles[result.dominantColor].communicationGuidelines.map(g => `• ${g}`).join('\n')}`;
      
      // Use the card function for consistency
      yPosition = addCard(
        "Effective Communication With You",
        commGuideContent,
        yPosition,
        75,
        colors.blue
      );
      
      // Career Alignment section
      yPosition = addSectionTitle("Career Alignment", yPosition);
      
      // Career content text
      const careerText = `Your ${colorProfiles[result.dominantColor].name} energy tends to align well with these career paths: ${colorProfiles[result.dominantColor].careerAlignment.join(", ")}.\n\nThese roles often leverage your natural strengths and preferences, though your unique combination of color energies may make you well-suited for a variety of positions.`;
      
      // Use the card function for consistency
      yPosition = addCard(
        `Career Paths for ${colorProfiles[result.dominantColor].name} Energy`,
        careerText,
        yPosition,
        70,
        colors.primary
      );
      
      // Add a new page
      pdf.addPage();
      addHeader("Insights Discovery Profile", 4);
      yPosition = 30;
      
      // Stress Response section
      yPosition = addSectionTitle("Stress Response Patterns", yPosition);
      
      // Stress response card
      yPosition = addCard(
        "Under Stress, You May",
        colorProfiles[result.dominantColor].stressResponse,
        yPosition,
        60,
        colors.warning
      );
      
      // Add stress management advice card
      pdf.setDrawColor(colors.bgMedium.r, colors.bgMedium.g, colors.bgMedium.b);
      pdf.setFillColor(255, 250, 230); // Very light yellow
      pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'FD');
      
      // Advice icon
      pdf.setFillColor(colors.warning.r, colors.warning.g, colors.warning.b);
      pdf.circle(margin + 10, yPosition + 10, 4, 'F');
      
      // Light bulb icon representation
      pdf.setFillColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(margin + 10, yPosition + 8, margin + 10, yPosition + 12);
      
      // Title
      pdf.setTextColor(colors.darkText.r, colors.darkText.g, colors.darkText.b);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Managing Your Stress", margin + 20, yPosition + 11);
      
      // Advice content
      const stressAdvice = "Recognize these patterns when they emerge and create space for self-awareness and regulation. Remember that different color energies require different stress management approaches.";
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.mediumText.r, colors.mediumText.g, colors.mediumText.b);
      const splitStressAdvice = pdf.splitTextToSize(stressAdvice, contentWidth - 16);
      pdf.text(splitStressAdvice, margin + 8, yPosition + 22);
      
      yPosition += 45;
      
      // Decision-Making section with modern split cards
      yPosition = addSectionTitle("Decision-Making Tendencies", yPosition);
      
      // Main content card
      yPosition = addCard(
        "How You Make Decisions",
        colorProfiles[result.dominantColor].decisionMaking,
        yPosition,
        45,
        colors.primary
      );
      
      // Get decision-making strengths and weaknesses based on color
      let strengths: string[] = [];
      let weaknesses: string[] = [];
      
      if (colorProfiles[result.dominantColor].name === "Fiery Red") {
        strengths = ["Quick and efficient", "Action-oriented"];
        weaknesses = ["Being too impulsive", "Disregarding input from others"];
      } else if (colorProfiles[result.dominantColor].name === "Sunshine Yellow") {
        strengths = ["Creative and inclusive", "Enthusiastic"];
        weaknesses = ["Overlooking details", "Changing course too often"];
      } else if (colorProfiles[result.dominantColor].name === "Earth Green") {
        strengths = ["Considerate and harmonious", "Values relationships"];
        weaknesses = ["Avoiding difficult decisions", "Difficulty saying no"];
      } else {
        strengths = ["Thorough and logical", "Detail-oriented"];
        weaknesses = ["Analysis paralysis", "Being overly critical"];
      }
      
      // Combined decision-making strengths and cautions
      const decisionContent = 
        `Strengths:\n• ${strengths.join('\n• ')}\n\nPotential Challenges:\n• ${weaknesses.join('\n• ')}`;
      
      // Use a single card for decision-making strengths and cautions
      yPosition = addCard(
        "Decision-Making Profile",
        decisionContent,
        yPosition,
        70,
        colors.primary
      );
      
      yPosition += 10;
      
      // Team Roles section
      yPosition = addSectionTitle("Team Role Recommendations", yPosition);
      
      // Team roles card with modern tag display
      pdf.setDrawColor(colors.bgMedium.r, colors.bgMedium.g, colors.bgMedium.b);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, yPosition, contentWidth, 65, 3, 3, 'FD');
      
      // Card heading
      pdf.setTextColor(colors.darkText.r, colors.darkText.g, colors.darkText.b);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Your Natural Team Roles", margin + 6, yPosition + 10);
      
      // Explanation text
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.mediumText.r, colors.mediumText.g, colors.mediumText.b);
      pdf.text("Based on your color energy preferences, you naturally excel in these roles:", margin + 6, yPosition + 20);
      
      // Role tags in primary color
      const roles = colorProfiles[result.dominantColor].teamRoles;
      const roleWidth = contentWidth / 2 - 12;
      
      roles.forEach((role, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const roleX = margin + 6 + (col * (roleWidth + 10));
        const roleY = yPosition + 30 + (row * 12);
        
        // Tag with primary color
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.roundedRect(roleX, roleY, roleWidth, 8, 2, 2, 'F');
        
        // Role text in white
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        
        // Center text in tag
        const roleTextWidth = pdf.getTextWidth(role);
        const textX = roleX + (roleWidth / 2) - (roleTextWidth / 2);
        pdf.text(role, textX, roleY + 5.5);
      });
      
      // Add note at bottom
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(colors.lightText.r, colors.lightText.g, colors.lightText.b);
      pdf.text("Understanding these natural tendencies helps you position yourself effectively in teams.", 
              margin + 6, yPosition + 60);
      
      // Development Suggestions section
      yPosition = addSectionTitle("Development Suggestions", yPosition + 70);
      yPosition = addCard(
        "Growth Opportunities",
        profile.development,
        yPosition,
        75,
        colors.primary
      );
              
      // Add a new page for action plan
      pdf.addPage();
      addHeader("Insights Discovery Profile", 5);
      yPosition = 30;
      
      // Section 14: Action Plan
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
        
        {/* Learning Style */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Learning Style Preferences</h3>
            <p className="text-gray-700">
              {colorProfiles[result.dominantColor].learningStyle}
            </p>
          </CardContent>
        </Card>
        
        {/* Communication Guidelines */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Communication Guidelines</h3>
            <p className="text-gray-700 mb-4">
              When communicating with you, others are most effective when they:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              {colorProfiles[result.dominantColor].communicationGuidelines.map((guideline, index) => (
                <li key={index}>{guideline}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Career Alignment */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Career Alignment</h3>
            <p className="text-gray-700 mb-4">
              Your {colorProfiles[result.dominantColor].name} energy tends to align well with these career paths:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {colorProfiles[result.dominantColor].careerAlignment.map((career, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: `${colorProfiles[result.dominantColor].bgColor}20`,
                    color: colorProfiles[result.dominantColor].bgColor,
                    border: `1px solid ${colorProfiles[result.dominantColor].bgColor}40`
                  }}
                >
                  {career}
                </span>
              ))}
            </div>
            <p className="text-gray-700 mt-4">
              These roles often leverage your natural strengths and preferences, though your unique combination of color energies may make you well-suited for a variety of positions.
            </p>
          </CardContent>
        </Card>
        
        {/* Stress Response Patterns */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Stress Response Patterns</h3>
            <p className="text-gray-700">
              {colorProfiles[result.dominantColor].stressResponse}
            </p>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h4 className="font-semibold text-amber-800 mb-2">Managing Your Stress</h4>
              <p className="text-amber-800">
                Recognize these patterns when they emerge and create space for self-awareness and regulation. Remember that different color energies require different stress management approaches.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Decision-Making Tendencies */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Decision-Making Tendencies</h3>
            <p className="text-gray-700 mb-4">
              {colorProfiles[result.dominantColor].decisionMaking}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-md">
                <h4 className="font-semibold mb-2">Strengths</h4>
                <ul className="list-disc list-inside text-gray-700">
                  <li>{colorProfiles[result.dominantColor].name === "Fiery Red" ? "Quick and efficient" : 
                      colorProfiles[result.dominantColor].name === "Sunshine Yellow" ? "Creative and inclusive" :
                      colorProfiles[result.dominantColor].name === "Earth Green" ? "Considerate and harmonious" :
                      "Thorough and logical"}</li>
                  <li>{colorProfiles[result.dominantColor].name === "Fiery Red" ? "Action-oriented" : 
                      colorProfiles[result.dominantColor].name === "Sunshine Yellow" ? "Enthusiastic" :
                      colorProfiles[result.dominantColor].name === "Earth Green" ? "Values relationships" :
                      "Detail-oriented"}</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-50 rounded-md">
                <h4 className="font-semibold mb-2">Watch out for</h4>
                <ul className="list-disc list-inside text-gray-700">
                  <li>{colorProfiles[result.dominantColor].name === "Fiery Red" ? "Being too impulsive" : 
                      colorProfiles[result.dominantColor].name === "Sunshine Yellow" ? "Overlooking details" :
                      colorProfiles[result.dominantColor].name === "Earth Green" ? "Avoiding difficult decisions" :
                      "Analysis paralysis"}</li>
                  <li>{colorProfiles[result.dominantColor].name === "Fiery Red" ? "Disregarding input from others" : 
                      colorProfiles[result.dominantColor].name === "Sunshine Yellow" ? "Changing course too often" :
                      colorProfiles[result.dominantColor].name === "Earth Green" ? "Difficulty saying no" :
                      "Being overly critical"}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Team Role Recommendations */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Team Role Recommendations</h3>
            <p className="text-gray-700 mb-4">
              Based on your color energy preferences, you naturally excel in these team roles:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {colorProfiles[result.dominantColor].teamRoles.map((role, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${colorProfiles[result.dominantColor].bgColor}`,
                    color: colorProfiles[result.dominantColor].textColor
                  }}
                >
                  {role}
                </span>
              ))}
            </div>
            <p className="text-gray-700 mt-4">
              Understanding these natural tendencies can help you position yourself effectively within teams and recognize when to adapt your approach to fill other roles when needed.
            </p>
          </CardContent>
        </Card>
        
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
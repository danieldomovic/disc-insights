import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ColorChart from "@/components/ColorChart";
import { ColorProfileDetail } from "@/components/ColorProfile";
import InsightsTypeWheel from "@/components/InsightsTypeWheel";
import ColorDynamicsChart from "@/components/ColorDynamicsChart";
import { colorProfiles, personalityProfiles, ColorType, PersonalityType } from "@/lib/colorProfiles";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { DownloadIcon, PrinterIcon } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [chartJsLoaded, setChartJsLoaded] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
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
  
  // Format date
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
        
        // Add date on right
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        const dateText = formattedDate;
        pdf.text(dateText, pdfWidth - margin - pdf.getTextWidth(dateText), 13);
        
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
      
      // ===== TITLE PAGE =====
      pdf.setFillColor(25, 25, 112); // Midnight blue
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // Add profile basics
      let yPos = 70;
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text("INSIGHTS DISCOVERY", pdfWidth/2, yPos, { align: 'center' });
      yPos += 15;
      
      pdf.setFontSize(18);
      pdf.text("Personal Profile", pdfWidth/2, yPos, { align: 'center' });
      yPos += 40;
      
      // Add personality type
      pdf.setFontSize(22);
      pdf.text(`${result.personalityType} Type`, pdfWidth/2, yPos, { align: 'center' });
      yPos += 20;
      
      // Add color distribution
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      
      // Color energies
      const colorCircleSize = 15;
      const colorTextOffset = 20;
      const colorsYPos = yPos + 20;
      const colorsXStart = pdfWidth/2 - 60;
      
      // Fiery Red
      pdf.setFillColor(221, 51, 51);
      pdf.circle(colorsXStart, colorsYPos, colorCircleSize/2, 'F');
      pdf.text(`Fiery Red: ${result.scores["fiery-red"]}%`, colorsXStart + colorTextOffset, colorsYPos + 5);
      
      // Sunshine Yellow
      pdf.setFillColor(240, 180, 0);
      pdf.circle(colorsXStart, colorsYPos + 30, colorCircleSize/2, 'F');
      pdf.text(`Sunshine Yellow: ${result.scores["sunshine-yellow"]}%`, colorsXStart + colorTextOffset, colorsYPos + 35);
      
      // Earth Green
      pdf.setFillColor(0, 150, 57);
      pdf.circle(colorsXStart, colorsYPos + 60, colorCircleSize/2, 'F');
      pdf.text(`Earth Green: ${result.scores["earth-green"]}%`, colorsXStart + colorTextOffset, colorsYPos + 65);
      
      // Cool Blue
      pdf.setFillColor(0, 114, 187);
      pdf.circle(colorsXStart, colorsYPos + 90, colorCircleSize/2, 'F');
      pdf.text(`Cool Blue: ${result.scores["cool-blue"]}%`, colorsXStart + colorTextOffset, colorsYPos + 95);
      
      yPos = colorsYPos + 120;
      
      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated on ${formattedDate}`, pdfWidth/2, yPos, { align: 'center' });
      
      // ===== CONTENTS PAGE =====
      pdf.addPage();
      addHeader("Contents", 1);
      
      yPos = 50;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("CONTENTS", pdfWidth/2, yPos, { align: 'center' });
      yPos += 20;
      
      const addContentItem = (title: string, page: number) => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(title, margin, yPos);
        
        // Add dots
        const titleWidth = pdf.getTextWidth(title);
        const pageNumWidth = pdf.getTextWidth(page.toString());
        const dotsWidth = contentWidth - titleWidth - pageNumWidth - 4;
        const dotCount = Math.floor(dotsWidth / pdf.getTextWidth('.'));
        let dots = '';
        for (let i = 0; i < dotCount; i++) {
          dots += '.';
        }
        
        pdf.text(dots, margin + titleWidth + 2, yPos);
        pdf.text(page.toString(), pdfWidth - margin - pageNumWidth, yPos);
        
        return yPos + 8;
      };
      
      // Section pages
      yPos = addContentItem("Introduction and Overview", 3);
      yPos = addContentItem("Personal Style", 5);
      yPos = addContentItem("Interacting with Others", 7);
      yPos = addContentItem("Decision Making", 9);
      yPos = addContentItem("Key Strengths & Weaknesses", 11);
      yPos = addContentItem("Value to the Team", 13);
      yPos = addContentItem("Communication Style", 15);
      yPos = addContentItem("Possible Blind Spots", 17);
      yPos = addContentItem("Opposite Type", 19);
      yPos = addContentItem("Suggestions for Development", 21);
      yPos = addContentItem("The Insights Discovery 72 Type Wheel", 23);
      yPos = addContentItem("Color Dynamics", 25);
      
      // ===== INTRODUCTION AND OVERVIEW =====
      pdf.addPage();
      addHeader("Introduction and Overview", 3);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("INTRODUCTION AND OVERVIEW", margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const introText = "This Insights Discovery profile is based on your responses to the Insights Discovery Evaluator. It provides a framework for self-understanding and development. Understanding your personality profile can help you greatly in areas such as improving communication, decision-making, and managing relationships.";
      
      yPos += addWrappedText(introText, margin, yPos, contentWidth, 11) + 10;
      
      // Get color profile chart as image
      const colorChart = document.querySelector('.color-chart-section canvas') as HTMLCanvasElement;
      if (colorChart) {
        const chartImg = colorChart.toDataURL('image/png');
        pdf.addImage(chartImg, 'PNG', margin, yPos, contentWidth * 0.6, contentWidth * 0.6 * (colorChart.height / colorChart.width));
        yPos += contentWidth * 0.6 * (colorChart.height / colorChart.width) + 10;
      } else {
        yPos += 70; // Skip space if chart not available
      }
      
      // Personality type summary
      yPos = addSectionTitle("Your Personality Type", yPos);
      
      const typeSummary = `Your profile identifies you as a ${result.personalityType} type, with dominant ${colorProfiles[result.dominantColor].name} energy and supporting ${colorProfiles[result.secondaryColor as ColorType].name} energy.`;
      yPos += addWrappedText(typeSummary, margin, yPos, contentWidth, 11) + 5;
      
      // Add personality description
      yPos += addWrappedText(profile.description, margin, yPos, contentWidth, 11) + 10;
      
      // ===== PERSONAL STYLE =====
      pdf.addPage();
      addHeader("Personal Style", 5);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("PERSONAL STYLE", margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      yPos = addSectionTitle("Core Characteristics", yPos);
      
      let personalStyleText = `As a ${result.personalityType} with ${colorProfiles[result.dominantColor].name} as your dominant energy, you tend to be ${profile.onGoodDay.join(", ")}. Your approach to work and life is characterized by a focus on ${colorProfiles[result.dominantColor].primaryFocus}.`;
      
      yPos += addWrappedText(personalStyleText, margin, yPos, contentWidth, 11) + 10;
      
      // On a good day
      yPos = addSectionTitle("On a Good Day", yPos);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      profile.onGoodDay.forEach(trait => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(trait, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // Under pressure
      yPos = addSectionTitle("Under Pressure", yPos);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      profile.onBadDay.forEach(trait => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(trait, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      
      // ===== INTERACTING WITH OTHERS =====
      pdf.addPage();
      addHeader("Interacting with Others", 7);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("INTERACTING WITH OTHERS", margin, yPos);
      yPos += 10;
      
      // Interaction style
      yPos = addSectionTitle("Your Interaction Style", yPos);
      
      let interactionText = `Your ${colorProfiles[result.dominantColor].name} energy influences how you interact with others. You typically appear ${colorProfiles[result.dominantColor].appears} to others. You want to be seen as ${colorProfiles[result.dominantColor].wantsToBe}.`;
      
      yPos += addWrappedText(interactionText, margin, yPos, contentWidth, 11) + 10;
      
      // What you value in others
      yPos = addSectionTitle("What You Value in Others", yPos);
      
      let valueText = `You appreciate when others are ${colorProfiles[result.dominantColor].likesYouToBe}. This reflects your preference for interaction styles that complement your own approach.`;
      
      yPos += addWrappedText(valueText, margin, yPos, contentWidth, 11) + 10;
      
      // How others may perceive you
      yPos = addSectionTitle("How Others May Perceive You", yPos);
      
      let perceptionText = `Others likely see you as ${profile.onGoodDay.slice(0, 3).join(", ")}. Under pressure, they might experience you as ${profile.onBadDay.slice(0, 2).join(" and ")}.`;
      
      yPos += addWrappedText(perceptionText, margin, yPos, contentWidth, 11) + 10;
      
      // ===== DECISION MAKING =====
      pdf.addPage();
      addHeader("Decision Making", 9);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("DECISION MAKING", margin, yPos);
      yPos += 10;
      
      // Decision making approach
      yPos = addSectionTitle("Your Approach to Decisions", yPos);
      
      let decisionText = `Your decisions are typically ${colorProfiles[result.dominantColor].decisionsAre}. With your ${result.personalityType} preferences, you tend to consider ${profile.dominantColors.map(color => colorProfiles[color as ColorType].primaryFocus.toLowerCase()).join(" and ")} when making important choices.`;
      
      yPos += addWrappedText(decisionText, margin, yPos, contentWidth, 11) + 10;
      
      // Motivating factors
      yPos = addSectionTitle("What Motivates Your Decisions", yPos);
      
      let motivationText = "Your decision-making is motivated by:";
      yPos += addWrappedText(motivationText, margin, yPos, contentWidth, 11) + 5;
      
      profile.goals.forEach(goal => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(goal, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // ===== KEY STRENGTHS & WEAKNESSES =====
      pdf.addPage();
      addHeader("Key Strengths & Weaknesses", 11);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("KEY STRENGTHS & WEAKNESSES", margin, yPos);
      yPos += 10;
      
      // Key strengths section
      yPos = addSectionTitle("Key Strengths", yPos);
      
      yPos += addWrappedText(profile.strengths, margin, yPos, contentWidth, 11) + 10;
      
      profile.onGoodDay.forEach(trait => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(trait, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // Potential weaknesses
      yPos = addSectionTitle("Potential Weaknesses", yPos);
      
      yPos += addWrappedText("When overusing your strengths or under pressure, you may:", margin, yPos, contentWidth, 11) + 10;
      
      profile.onBadDay.forEach(trait => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(trait, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // ===== VALUE TO THE TEAM =====
      pdf.addPage();
      addHeader("Value to the Team", 13);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("VALUE TO THE TEAM", margin, yPos);
      yPos += 10;
      
      // Team contribution
      yPos = addSectionTitle("Your Contribution to Teams", yPos);
      
      let teamText = `As a ${result.personalityType}, you bring valuable ${colorProfiles[result.dominantColor].name} energy to your team. Your natural strengths help the team in multiple ways:`;
      
      yPos += addWrappedText(teamText, margin, yPos, contentWidth, 11) + 10;
      
      // List team contributions based on profile
      const teamContributions = [
        `You help the team focus on ${colorProfiles[result.dominantColor].primaryFocus.toLowerCase()}`,
        `You bring ${profile.onGoodDay.slice(0, 3).join(", ")} to team interactions`,
        `You help the team overcome challenges through your natural approach`,
        `You contribute a valuable ${result.personalityType} perspective`
      ];
      
      teamContributions.forEach(contribution => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(contribution, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // Team environment
      yPos = addSectionTitle("Ideal Team Environment", yPos);
      
      let environmentText = "You perform best in team environments that provide:";
      yPos += addWrappedText(environmentText, margin, yPos, contentWidth, 11) + 5;
      
      // Environment factors based on color
      const environmentFactors = [
        `Opportunities to utilize your ${colorProfiles[result.dominantColor].name} energy`,
        `Recognition of your ${profile.onGoodDay[0]} approach`,
        `Clear alignment with your preferences and goals`,
        `Space to contribute in your natural style`
      ];
      
      environmentFactors.forEach(factor => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(factor, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      
      // ===== COMMUNICATION STYLE =====
      pdf.addPage();
      addHeader("Communication Style", 15);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("COMMUNICATION STYLE", margin, yPos);
      yPos += 10;
      
      // Communication approach
      yPos = addSectionTitle("Your Communication Approach", yPos);
      
      let commText = `Your communication style is influenced by your ${colorProfiles[result.dominantColor].name} energy. You typically communicate in a way that is ${colorProfiles[result.dominantColor].decisionsAre.toLowerCase()}.`;
      
      yPos += addWrappedText(commText, margin, yPos, contentWidth, 11) + 10;
      
      // Effective communication
      yPos = addSectionTitle("Communicating Effectively With You", yPos);
      
      let effectiveText = "To communicate effectively with you, others should:";
      yPos += addWrappedText(effectiveText, margin, yPos, contentWidth, 11) + 5;
      
      // Communication tips based on color
      const communicationTips = [
        `Be ${colorProfiles[result.dominantColor].likesYouToBe.toLowerCase()}`,
        `Focus on aspects related to ${colorProfiles[result.dominantColor].primaryFocus.toLowerCase()}`,
        `Avoid being ${colorProfiles[result.dominantColor].canBeIrritatedBy.toLowerCase()}`,
        `Recognize and respect your ${result.personalityType} preferences`
      ];
      
      communicationTips.forEach(tip => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(tip, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // Barriers to communication
      yPos = addSectionTitle("Potential Communication Barriers", yPos);
      
      let barriersText = "You may find it difficult to communicate with people who are:";
      yPos += addWrappedText(barriersText, margin, yPos, contentWidth, 11) + 5;
      
      // Communication barriers based on profile
      profile.fears.slice(0, 4).forEach(fear => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(fear, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      
      // ===== POSSIBLE BLIND SPOTS =====
      pdf.addPage();
      addHeader("Possible Blind Spots", 17);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("POSSIBLE BLIND SPOTS", margin, yPos);
      yPos += 10;
      
      // Blind spots introduction
      let blindspotsText = "Everyone has potential blind spots - areas where we may not see the full picture due to our personality preferences. Awareness of these can lead to personal growth.";
      
      yPos += addWrappedText(blindspotsText, margin, yPos, contentWidth, 11) + 10;
      
      // Potential blind spots
      yPos = addSectionTitle("Your Potential Blind Spots", yPos);
      
      profile.fears.forEach(fear => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(fear, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // Under pressure behaviors
      yPos = addSectionTitle("Under Pressure You May", yPos);
      
      profile.onBadDay.forEach(trait => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(trait, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // ===== OPPOSITE TYPE =====
      pdf.addPage();
      addHeader("Opposite Type", 19);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("OPPOSITE TYPE", margin, yPos);
      yPos += 10;
      
      // Determine opposite color
      const oppositeColors: Record<ColorType, ColorType> = {
        'fiery-red': 'earth-green',
        'earth-green': 'fiery-red',
        'sunshine-yellow': 'cool-blue',
        'cool-blue': 'sunshine-yellow'
      };
      
      const oppositeColor = oppositeColors[result.dominantColor];
      
      // Opposite type description
      yPos = addSectionTitle("Understanding Your Opposite", yPos);
      
      let oppositeText = `Your opposite type would prioritize ${colorProfiles[oppositeColor].name} energy, which focuses on ${colorProfiles[oppositeColor].primaryFocus.toLowerCase()}. This is quite different from your preference for ${colorProfiles[result.dominantColor].primaryFocus.toLowerCase()}.`;
      
      yPos += addWrappedText(oppositeText, margin, yPos, contentWidth, 11) + 10;
      
      // Potential challenges
      yPos = addSectionTitle("Potential Challenges with Opposite Types", yPos);
      
      let challengesText = `You may find it challenging to work with those who are ${colorProfiles[oppositeColor].appears.toLowerCase()} as this is very different from your natural style. They may irritate you by being ${colorProfiles[result.dominantColor].canBeIrritatedBy.toLowerCase()}.`;
      
      yPos += addWrappedText(challengesText, margin, yPos, contentWidth, 11) + 10;
      
      // Growth opportunities
      yPos = addSectionTitle("Growth Opportunities", yPos);
      
      let growthText = "Interacting with your opposite type offers growth opportunities:";
      yPos += addWrappedText(growthText, margin, yPos, contentWidth, 11) + 5;
      
      // Growth points
      const growthPoints = [
        `You can learn to appreciate different perspectives and approaches`,
        `You may develop more balance by incorporating some of their strengths`,
        `Understanding opposite preferences can improve your adaptability`,
        `Working effectively with opposites can enhance your leadership capabilities`
      ];
      
      growthPoints.forEach(point => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(point, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      
      // ===== SUGGESTIONS FOR DEVELOPMENT =====
      pdf.addPage();
      addHeader("Suggestions for Development", 21);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("SUGGESTIONS FOR DEVELOPMENT", margin, yPos);
      yPos += 10;
      
      // Development introduction
      yPos = addSectionTitle("Development Opportunities", yPos);
      
      yPos += addWrappedText(profile.development, margin, yPos, contentWidth, 11) + 10;
      
      // Specific development suggestions
      yPos = addSectionTitle("Specific Development Areas", yPos);
      
      let devTitle = "Based on your profile, consider developing these areas:";
      yPos += addWrappedText(devTitle, margin, yPos, contentWidth, 11) + 5;
      
      // Create development suggestions based on weak areas in color profile
      const devSuggestions = [
        `Balance your ${colorProfiles[result.dominantColor].name} energy by developing some ${oppositeColors[result.dominantColor]} qualities`,
        `Be aware of your tendency to ${profile.onBadDay[0].toLowerCase()} under pressure`,
        `Practice approaches that address your potential blind spots`,
        `Develop strategies to work more effectively with opposite types`
      ];
      
      devSuggestions.forEach(suggestion => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(suggestion, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      yPos += 5;
      
      // Action planning
      yPos = addSectionTitle("Action Planning", yPos);
      
      let actionText = "Consider these steps to continue your development:";
      yPos += addWrappedText(actionText, margin, yPos, contentWidth, 11) + 5;
      
      // Action steps
      const actionSteps = [
        "Reflect on this profile and identify key growth areas",
        "Seek feedback from trusted colleagues or mentors",
        "Create specific, measurable development goals",
        "Practice new behaviors in low-risk situations first",
        "Review your progress regularly"
      ];
      
      actionSteps.forEach((step, index) => {
        pdf.ellipse(margin + 2, yPos - 2, 1, 1, 'F');
        yPos += addWrappedText(`${index + 1}. ${step}`, margin + 5, yPos, contentWidth - 5, 11) + 6;
      });
      
      // ===== THE INSIGHTS DISCOVERY 72 TYPE WHEEL =====
      pdf.addPage();
      addHeader("The Insights Discovery 72 Type Wheel", 23);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("THE INSIGHTS DISCOVERY 72 TYPE WHEEL", margin, yPos);
      yPos += 10;
      
      // Wheel explanation
      let wheelText = "The Insights Discovery 72 Type Wheel shows your position among all personality types based on the four color energies. Your position indicates your unique blend of preferences and style.";
      
      yPos += addWrappedText(wheelText, margin, yPos, contentWidth, 11) + 10;
      
      // Get type wheel as image
      const typeWheel = document.querySelector('.type-wheel-section canvas') as HTMLCanvasElement;
      if (typeWheel) {
        const wheelImg = typeWheel.toDataURL('image/png');
        const wheelWidth = contentWidth;
        const wheelHeight = wheelWidth * (typeWheel.height / typeWheel.width);
        pdf.addImage(wheelImg, 'PNG', margin, yPos, wheelWidth, wheelHeight);
        yPos += wheelHeight + 10;
      } else {
        yPos += 100; // Skip space if chart not available
      }
      
      // Add explanation of wheel
      yPos = addSectionTitle("Understanding Your Position", yPos);
      
      let positionText = `Your position on the wheel as a ${result.personalityType} with dominant ${colorProfiles[result.dominantColor].name} energy shows your natural preferences. This helps explain your approach to situations and relationships.`;
      
      yPos += addWrappedText(positionText, margin, yPos, contentWidth, 11) + 10;
      
      // ===== COLOR DYNAMICS =====
      pdf.addPage();
      addHeader("Color Dynamics", 25);
      
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("COLOR DYNAMICS", margin, yPos);
      yPos += 10;
      
      // Dynamics explanation
      let dynamicsText = "The Color Dynamics chart shows the relationship between your conscious and less conscious preferences. It illustrates the flow between your preferences and how they might manifest in different situations.";
      
      yPos += addWrappedText(dynamicsText, margin, yPos, contentWidth, 11) + 10;
      
      // Get color dynamics chart as image
      const dynamicsChart = document.querySelector('.color-dynamics-section canvas') as HTMLCanvasElement;
      if (dynamicsChart) {
        const dynamicsImg = dynamicsChart.toDataURL('image/png');
        const dynamicsWidth = contentWidth;
        const dynamicsHeight = dynamicsWidth * (dynamicsChart.height / dynamicsChart.width);
        pdf.addImage(dynamicsImg, 'PNG', margin, yPos, dynamicsWidth, dynamicsHeight);
        yPos += dynamicsHeight + 10;
      } else {
        yPos += 100; // Skip space if chart not available
      }
      
      // Add explanation of dynamics
      yPos = addSectionTitle("Your Preference Flow", yPos);
      
      let flowText = `Your preference flow demonstrates how your ${colorProfiles[result.dominantColor].name} energy interacts with your less conscious preferences. This reflects your adaptable nature and potential for growth.`;
      
      yPos += addWrappedText(flowText, margin, yPos, contentWidth, 11) + 15;
      
      // Closing
      let closingText = "Thank you for completing the Insights Discovery assessment. This profile is designed to deepen your understanding of yourself and provide a foundation for ongoing personal and professional development.";
      
      yPos += addWrappedText(closingText, margin, yPos, contentWidth, 11) + 10;
      
      // Footer on all pages
      const addFooter = (pageNum: number) => {
        pdf.setPage(pageNum);
        const footerY = pdfHeight - 10;
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text("© Insights Discovery Color Profile Assessment", margin, footerY);
        pdf.text(`Page ${pageNum}`, pdfWidth - margin - pdf.getTextWidth(`Page ${pageNum}`), footerY);
      };
      
      // Add footers to all pages except title page
      for (let i = 2; i <= pdf.getNumberOfPages(); i++) {
        addFooter(i);
      }
      
      // Save the PDF
      pdf.save(`Insights_Discovery_Profile_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsPdfGenerating(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-8 w-60 mb-6" />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-64 w-full rounded-lg mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </div>
              
              <div>
                <Skeleton className="h-6 w-52 mb-4" />
                <Skeleton className="h-40 w-full mb-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <motion.section 
      className="max-w-5xl mx-auto pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
                <p className="text-lg">{formattedDate}</p>
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
        
        {/* Detailed Tabs */}
        <Card>
          <CardContent className="p-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="strengths">Strengths & Weaknesses</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="management">Management</TabsTrigger>
                <TabsTrigger value="development">Development</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Personal Style</h3>
                  <p className="text-gray-700">
                    {profile.name}s like you tend to be {profile.onGoodDay?.join(", ")}. Your combination of 
                    {profile.dominantColors?.map((color, index) => {
                      const colorProfile = colorProfiles[color as ColorType];
                      return (
                        <span key={color}>
                          {" "}
                          <span style={{ color: colorProfile?.bgColor || '#000000' }}>
                            {colorProfile?.name || color}
                          </span>
                          {index < (profile.dominantColors?.length || 0) - 1 && " and "}
                        </span>
                      );
                    })} 
                    energies means you focus primarily on {
                      profile.dominantColors && profile.dominantColors.length > 0 
                      ? colorProfiles[profile.dominantColors[0] as ColorType]?.primaryFocus?.toLowerCase() || 'effectiveness'
                      : 'effectiveness'
                    }.
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Characteristics:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {profile.onGoodDay.map((trait, index) => (
                        <li key={index}>{trait}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Potential Blind Spots:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {profile.onBadDay.map((trait, index) => (
                        <li key={index}>{trait}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="strengths" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Key Strengths</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {profile.onGoodDay.map((strength, index) => (
                        <li key={index} className="mb-1">
                          <span className="font-medium">{strength}</span>: 
                          {index === 0 && ` You approach challenges with confidence and clarity.`}
                          {index === 1 && ` You bring positive energy and thoughtfulness to your interactions.`}
                          {index === 2 && ` You consider both practical outcomes and how to achieve them efficiently.`}
                        </li>
                      ))}
                      <li className="mb-1">
                        <span className="font-medium">Focus on {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.primaryFocus || 'goals'
                          : 'goals'
                        }</span>: 
                        Your natural tendency to prioritize this helps you stay effective in your approach.
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Possible Challenges</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {profile.onBadDay.map((weakness, index) => (
                        <li key={index} className="mb-1">
                          <span className="font-medium">{weakness}</span>:
                          {index === 0 && ` May create tension when you don't consider others' perspectives.`}
                          {index === 1 && ` Can lead to misunderstandings when emotions aren't regulated.`}
                          {index === 2 && ` Might prevent you from getting the best from different personality types.`}
                        </li>
                      ))}
                      <li className="mb-1">
                        <span className="font-medium">Potential overuse of strengths</span>: 
                        Your strengths can become limitations when overused or applied in the wrong context.
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg mt-4">
                  <h3 className="text-xl font-semibold mb-3">Value to the Team</h3>
                  <p className="text-gray-700">
                    Your strengths make you particularly valuable in roles that require {profile.likes.join(", ")}. 
                    Teams benefit from your {profile.onGoodDay.join(", ")} approach, especially when facing challenges 
                    that align with your natural preferences and goals.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="communication" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Effective Communication</h3>
                  <p className="text-gray-700 mb-4">
                    Understanding your communication preferences can help you connect more effectively with others 
                    and recognize potential barriers.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-5 rounded-lg">
                      <h4 className="font-semibold mb-2">Communication Strengths:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>You communicate in a {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.decisionsAre?.toLowerCase() || 'direct'
                          : 'direct'
                        } way</li>
                        <li>You emphasize {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.primaryFocus?.toLowerCase() || 'goals'
                          : 'goals'
                        } in your messaging</li>
                        <li>You prefer people to be {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.likesYouToBe?.toLowerCase() || 'straightforward'
                          : 'straightforward'
                        } when communicating with you</li>
                        <li>Your natural style helps you connect with similar personality types</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg">
                      <h4 className="font-semibold mb-2">Communication Barriers:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>You may get irritated by {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.canBeIrritatedBy?.toLowerCase() || 'excessive detail'
                          : 'excessive detail'
                        }</li>
                        <li>Under pressure, you might {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.underPressureMay?.toLowerCase() || 'become overly directive'
                          : 'become overly directive'
                        }</li>
                        <li>You may overlook the needs of those with different communication preferences</li>
                        <li>Your focus on {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.primaryFocus?.toLowerCase() || 'goals'
                          : 'goals'
                        } might not resonate with everyone</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Adapting Your Communication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(226, 61, 40, 0.1)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: '#E23D28' }}>With Fiery Red</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Be brief and to the point</li>
                        <li>• Focus on results and outcomes</li>
                        <li>• Don't waste time on small talk</li>
                        <li>• Be prepared to move quickly</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(242, 207, 29, 0.1)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: '#F2CF1D' }}>With Sunshine Yellow</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Be engaging and enthusiastic</li>
                        <li>• Allow time for relationship building</li>
                        <li>• Focus on the big picture</li>
                        <li>• Show appreciation for their ideas</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(66, 166, 64, 0.1)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: '#42A640' }}>With Earth Green</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Be patient and considerate</li>
                        <li>• Allow time for processing</li>
                        <li>• Acknowledge feelings and concerns</li>
                        <li>• Build trust through consistency</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(28, 119, 195, 0.1)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: '#1C77C3' }}>With Cool Blue</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Be detailed and precise</li>
                        <li>• Provide evidence and analysis</li>
                        <li>• Stay focused on facts</li>
                        <li>• Be prepared with thorough information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="management" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Management Style</h3>
                  <p className="text-gray-700 mb-4">
                    Your management approach is influenced by your color energy preferences. Understanding 
                    this can help you leverage your strengths and address potential blind spots.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-lg">
                      <h4 className="font-semibold mb-2">Your Management Strengths:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>You create environments that value {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.primaryFocus?.toLowerCase() || 'goals'
                          : 'goals'
                        }</li>
                        <li>Your decisions tend to be {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.decisionsAre?.toLowerCase() || 'direct'
                          : 'direct'
                        }</li>
                        <li>You naturally motivate those who respond to your energy type</li>
                        <li>You provide clear direction aligned with your preferences</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg">
                      <h4 className="font-semibold mb-2">Development Areas:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>You may need to adapt for team members with different preferences</li>
                        <li>Your approach might not engage all personality types equally</li>
                        <li>You might overlook the importance of balancing different needs</li>
                        <li>Consider how your style impacts team dynamics and inclusion</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Being Managed</h3>
                  <p className="text-gray-700 mb-4">
                    Understanding how you prefer to be managed can help you communicate your needs 
                    more effectively to your leaders.
                  </p>
                  
                  <div className="p-5 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">You respond best to managers who:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Provide clear direction and expectations</li>
                      <li>Recognize and value your natural strengths</li>
                      <li>Are {
                          profile.dominantColors && profile.dominantColors.length > 0 
                          ? colorProfiles[profile.dominantColors[0] as ColorType]?.likesYouToBe?.toLowerCase() || 'straightforward'
                          : 'straightforward'
                        } in their communication</li>
                      <li>Create an environment that aligns with your preferences</li>
                      <li>Balance challenge with appropriate support</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="development" className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Growth Opportunities</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700">
                      {profile.development}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Personal Development Plan</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Focus Areas:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Balancing your natural preferences with different approaches</li>
                        <li>Developing awareness of your impact on others</li>
                        <li>Recognizing when your strengths may become limitations</li>
                        <li>Adapting your style for different situations and people</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Action Steps:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Seek feedback from those with different preferences</li>
                        <li>Practice adapting your communication approach</li>
                        <li>Identify situations where your non-preferred styles would be beneficial</li>
                        <li>Regularly reflect on your interactions and their effectiveness</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Leveraging Your Strengths</h3>
                  <div className="p-6 rounded-lg" style={{ 
                    backgroundColor: `${colorProfiles[profile.color]?.bgColor || '#f0f0f0'}15`, 
                    borderLeft: `4px solid ${colorProfiles[profile.color]?.bgColor || '#000000'}` 
                  }}>
                    <p className="text-gray-700">
                      {profile.strengths}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Specialized Visualizations */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">Specialized Visualizations</h2>
            
            <div className="space-y-12">
              <div className="type-wheel-section">
                <h3 className="text-xl font-semibold mb-4">The Insights Discovery® 72 Type Wheel</h3>
                <p className="text-gray-700 mb-6">
                  This visualization shows your position on the Insights Discovery® 72 Type Wheel, based on your color preferences. 
                  Your position indicates your unique personality type and preferred styles of thinking, working, and interacting.
                </p>
                <InsightsTypeWheel 
                  personalityType={result.personalityType}
                  dominantColor={result.dominantColor}
                  secondaryColor={result.secondaryColor}
                  scores={result.scores}
                />
              </div>
              
              <div className="color-dynamics-section">
                <h3 className="text-xl font-semibold mb-4">The Insights Discovery® Colour Dynamics</h3>
                <p className="text-gray-700 mb-6">
                  This chart shows your preference levels for each color energy and illustrates the flow between 
                  your conscious and less conscious preferences. Understanding this dynamic can help you recognize 
                  patterns in your behaviors and interactions.
                </p>
                <ColorDynamicsChart scores={result.scores} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Color Profiles Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Understanding Color Energies</h2>
          <p className="text-gray-700">
            Each color energy represents different preferences, strengths, and characteristics. 
            Understanding all four energies can help you work more effectively with different types 
            of people and adapt your approach to different situations.
          </p>
          
          <div className="space-y-6">
            <ColorProfileDetail color="fiery-red" />
            <ColorProfileDetail color="sunshine-yellow" />
            <ColorProfileDetail color="earth-green" />
            <ColorProfileDetail color="cool-blue" />
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Link href="/">
          <Button variant="outline" className="px-6 py-3">
            Retake Assessment
          </Button>
        </Link>
      </div>
    </motion.section>
  );
}

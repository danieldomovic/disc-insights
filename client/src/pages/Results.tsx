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

  // Function to generate and download PDF
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setIsPdfGenerating(true);
    
    try {
      const reportElement = reportRef.current;
      const canvas = await html2canvas(reportElement, {
        scale: 1.5, // Higher resolution
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // First page
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
      
      // Additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight;
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
              <div>
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
              
              <div>
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
              <div>
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
              
              <div>
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

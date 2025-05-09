import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useLocation, useParams, Link } from "wouter";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { formatReportTitle } from "@/lib/formatters";
import {
  ChevronLeft,
  Loader2,
  FileBarChart,
  AlertTriangle,
  ArrowLeftRight,
  Download
} from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface ColorScore {
  "fiery-red": number;
  "sunshine-yellow": number;
  "earth-green": number;
  "cool-blue": number;
}

interface Report {
  id: number;
  title?: string;
  createdAt: string;
  scores: ColorScore;
  dominantColor: string;
  secondaryColor: string;
  personalityType: string;
}

interface Comparison {
  id: number;
  title: string;
  createdAt: string;
  reportA: Report;
  reportB: Report;
}

export default function ComparisonView() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const comparisonId = parseInt(params.id, 10);
  
  // Fetch comparison data
  const {
    data: comparison,
    isLoading,
    isError,
    error
  } = useQuery<Comparison>({
    queryKey: [`/api/comparisons/${comparisonId}`],
    enabled: !!user && !isNaN(comparisonId),
  });
  
  // Get color name for display
  const getColorName = (color: string) => {
    return color.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Get color HEX code
  const getColorHex = (color: string) => {
    switch (color) {
      case 'fiery-red':
        return '#E63946';
      case 'sunshine-yellow':
        return '#FFD166';
      case 'earth-green':
        return '#06D6A0';
      case 'cool-blue':
        return '#118AB2';
      default:
        return '#999999';
    }
  };
  
  // Prepare data for radar chart
  const prepareRadarData = () => {
    if (!comparison) return [];
    
    return [
      { subject: 'Fiery Red', A: comparison.reportA.scores["fiery-red"], B: comparison.reportB.scores["fiery-red"], fullMark: 100 },
      { subject: 'Sunshine Yellow', A: comparison.reportA.scores["sunshine-yellow"], B: comparison.reportB.scores["sunshine-yellow"], fullMark: 100 },
      { subject: 'Earth Green', A: comparison.reportA.scores["earth-green"], B: comparison.reportB.scores["earth-green"], fullMark: 100 },
      { subject: 'Cool Blue', A: comparison.reportA.scores["cool-blue"], B: comparison.reportB.scores["cool-blue"], fullMark: 100 },
    ];
  };
  
  // Prepare data for bar chart
  const prepareBarData = () => {
    if (!comparison) return [];
    
    return [
      { name: 'Fiery Red', ReportA: comparison.reportA.scores["fiery-red"], ReportB: comparison.reportB.scores["fiery-red"] },
      { name: 'Sunshine Yellow', ReportA: comparison.reportA.scores["sunshine-yellow"], ReportB: comparison.reportB.scores["sunshine-yellow"] },
      { name: 'Earth Green', ReportA: comparison.reportA.scores["earth-green"], ReportB: comparison.reportB.scores["earth-green"] },
      { name: 'Cool Blue', ReportA: comparison.reportA.scores["cool-blue"], ReportB: comparison.reportB.scores["cool-blue"] },
    ];
  };
  
  // Redirect if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Breadcrumbs 
          items={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/comparisons", label: "Comparisons" },
            { label: "Comparison Details" }
          ]}
          className="mb-6"
        />
        
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  // Error state
  if (isError || !comparison) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Breadcrumbs 
          items={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/comparisons", label: "Comparisons" },
            { label: "Comparison Details" }
          ]}
          className="mb-6"
        />
        
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-red-50">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold">Error Loading Comparison</h2>
              <p className="text-muted-foreground max-w-md">
                {(error as Error)?.message || "Failed to load comparison data."}
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/dashboard?tab=comparisons")}
              >
                Return to Comparisons
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <Breadcrumbs 
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard?tab=comparisons", label: "Comparisons" },
          { label: comparison.title || "Comparison Details" }
        ]}
        className="mb-6"
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{comparison.title}</h1>
          <p className="text-muted-foreground mt-2">
            Created on {new Date(comparison.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Report A: {comparison.reportA.title || formatReportTitle(comparison.reportA)}</CardTitle>
            <CardDescription>
              {comparison.reportA.personalityType} Type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dominant Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-6 rounded-sm" style={{ background: getColorHex(comparison.reportA.dominantColor) }}></div>
                    <p className="font-medium">{getColorName(comparison.reportA.dominantColor)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Secondary Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-6 rounded-sm" style={{ background: getColorHex(comparison.reportA.secondaryColor) }}></div>
                    <p className="font-medium">{getColorName(comparison.reportA.secondaryColor)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Color Distribution</p>
                <div className="grid grid-cols-4 gap-1 h-8">
                  <div 
                    className="rounded-l-md"
                    style={{ 
                      background: getColorHex('fiery-red'),
                      width: `${comparison.reportA.scores["fiery-red"]}%`
                    }}
                  ></div>
                  <div 
                    style={{ 
                      background: getColorHex('sunshine-yellow'),
                      width: `${comparison.reportA.scores["sunshine-yellow"]}%`
                    }}
                  ></div>
                  <div 
                    style={{ 
                      background: getColorHex('earth-green'),
                      width: `${comparison.reportA.scores["earth-green"]}%`
                    }}
                  ></div>
                  <div 
                    className="rounded-r-md"
                    style={{ 
                      background: getColorHex('cool-blue'),
                      width: `${comparison.reportA.scores["cool-blue"]}%`
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  <div className="text-xs text-center">{comparison.reportA.scores["fiery-red"]}%</div>
                  <div className="text-xs text-center">{comparison.reportA.scores["sunshine-yellow"]}%</div>
                  <div className="text-xs text-center">{comparison.reportA.scores["earth-green"]}%</div>
                  <div className="text-xs text-center">{comparison.reportA.scores["cool-blue"]}%</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/results/${comparison.reportA.id}`)}>
              View Full Report
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Report B: {comparison.reportB.title || formatReportTitle(comparison.reportB)}</CardTitle>
            <CardDescription>
              {comparison.reportB.personalityType} Type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dominant Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-6 rounded-sm" style={{ background: getColorHex(comparison.reportB.dominantColor) }}></div>
                    <p className="font-medium">{getColorName(comparison.reportB.dominantColor)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Secondary Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-6 rounded-sm" style={{ background: getColorHex(comparison.reportB.secondaryColor) }}></div>
                    <p className="font-medium">{getColorName(comparison.reportB.secondaryColor)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Color Distribution</p>
                <div className="grid grid-cols-4 gap-1 h-8">
                  <div 
                    className="rounded-l-md"
                    style={{ 
                      background: getColorHex('fiery-red'),
                      width: `${comparison.reportB.scores["fiery-red"]}%`
                    }}
                  ></div>
                  <div 
                    style={{ 
                      background: getColorHex('sunshine-yellow'),
                      width: `${comparison.reportB.scores["sunshine-yellow"]}%`
                    }}
                  ></div>
                  <div 
                    style={{ 
                      background: getColorHex('earth-green'),
                      width: `${comparison.reportB.scores["earth-green"]}%`
                    }}
                  ></div>
                  <div 
                    className="rounded-r-md"
                    style={{ 
                      background: getColorHex('cool-blue'),
                      width: `${comparison.reportB.scores["cool-blue"]}%`
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  <div className="text-xs text-center">{comparison.reportB.scores["fiery-red"]}%</div>
                  <div className="text-xs text-center">{comparison.reportB.scores["sunshine-yellow"]}%</div>
                  <div className="text-xs text-center">{comparison.reportB.scores["earth-green"]}%</div>
                  <div className="text-xs text-center">{comparison.reportB.scores["cool-blue"]}%</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/results/${comparison.reportB.id}`)}>
              View Full Report
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Comparison Visualization
          </CardTitle>
          <CardDescription>
            Visual representation of the differences between the two personality profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="radar" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="radar">Radar Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="radar" className="space-y-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={150} data={prepareRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name={`Report A: ${comparison.reportA.title || formatReportTitle(comparison.reportA)}`}
                      dataKey="A"
                      stroke="#FF5A5F"
                      fill="#FF5A5F"
                      fillOpacity={0.5}
                    />
                    <Radar
                      name={`Report B: ${comparison.reportB.title || formatReportTitle(comparison.reportB)}`}
                      dataKey="B"
                      stroke="#5B86E5"
                      fill="#5B86E5"
                      fillOpacity={0.5}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="bar" className="space-y-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareBarData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      name={`Report A: ${comparison.reportA.title || formatReportTitle(comparison.reportA)}`}
                      dataKey="ReportA" 
                      fill="#FF5A5F" 
                    />
                    <Bar 
                      name={`Report B: ${comparison.reportB.title || formatReportTitle(comparison.reportB)}`}
                      dataKey="ReportB" 
                      fill="#5B86E5" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
          <CardDescription>
            Insights into the personality dynamics between these profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Key Differences</h3>
              <p className="text-muted-foreground">
                The primary difference between these profiles is in 
                {Math.abs(comparison.reportA.scores["fiery-red"] - comparison.reportB.scores["fiery-red"]) > 
                Math.abs(comparison.reportA.scores["sunshine-yellow"] - comparison.reportB.scores["sunshine-yellow"]) && 
                Math.abs(comparison.reportA.scores["fiery-red"] - comparison.reportB.scores["fiery-red"]) > 
                Math.abs(comparison.reportA.scores["earth-green"] - comparison.reportB.scores["earth-green"]) && 
                Math.abs(comparison.reportA.scores["fiery-red"] - comparison.reportB.scores["fiery-red"]) > 
                Math.abs(comparison.reportA.scores["cool-blue"] - comparison.reportB.scores["cool-blue"]) ? (
                  <span className="font-medium"> Fiery Red (assertiveness and directness)</span>
                ) : Math.abs(comparison.reportA.scores["sunshine-yellow"] - comparison.reportB.scores["sunshine-yellow"]) > 
                Math.abs(comparison.reportA.scores["earth-green"] - comparison.reportB.scores["earth-green"]) && 
                Math.abs(comparison.reportA.scores["sunshine-yellow"] - comparison.reportB.scores["sunshine-yellow"]) > 
                Math.abs(comparison.reportA.scores["cool-blue"] - comparison.reportB.scores["cool-blue"]) ? (
                  <span className="font-medium"> Sunshine Yellow (sociability and enthusiasm)</span>
                ) : Math.abs(comparison.reportA.scores["earth-green"] - comparison.reportB.scores["earth-green"]) > 
                Math.abs(comparison.reportA.scores["cool-blue"] - comparison.reportB.scores["cool-blue"]) ? (
                  <span className="font-medium"> Earth Green (supportiveness and patience)</span>
                ) : (
                  <span className="font-medium"> Cool Blue (analytical thinking and precision)</span>
                )}, indicating different approaches to communication and problem-solving.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Complementary Traits</h3>
              <p className="text-muted-foreground">
                These profiles {comparison.reportA.dominantColor === comparison.reportB.dominantColor ? 
                  "share similar dominant traits, which can create strong alignment in approach and values" : 
                  "have different dominant colors, which can create a complementary dynamic that balances strengths and weaknesses"}.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Working Together</h3>
              <p className="text-muted-foreground">
                When collaborating, focus on leveraging the {comparison.reportA.dominantColor === "fiery-red" || 
                comparison.reportB.dominantColor === "fiery-red" ? "decisiveness and action-orientation" : 
                comparison.reportA.dominantColor === "sunshine-yellow" || 
                comparison.reportB.dominantColor === "sunshine-yellow" ? "enthusiasm and creativity" : 
                comparison.reportA.dominantColor === "earth-green" || 
                comparison.reportB.dominantColor === "earth-green" ? "supportiveness and relationship-building" : 
                "analytical thinking and attention to detail"} present in these profiles.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Create Another Comparison
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
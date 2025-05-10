import { useEffect, useRef } from "react";
import { ColorType } from "@/lib/colorProfiles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColorChartProps {
  scores: Record<ColorType, number>;
  unconsciousScores?: Record<ColorType, number>;
  showBothProfiles?: boolean;
}

export default function ColorChart({ scores, unconsciousScores, showBothProfiles = false }: ColorChartProps) {
  const consciousChartRef = useRef<HTMLCanvasElement>(null);
  const unconsciousChartRef = useRef<HTMLCanvasElement>(null);
  
  // Helper function to create a chart
  const createChart = (canvas: HTMLCanvasElement, data: Record<ColorType, number>, title: string, isDashed = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Use the Chart.js global object
    const Chart = (window as any).Chart;
    
    if (!Chart) {
      console.error("Chart.js not loaded");
      return;
    }
    
    // Destroy any existing chart
    const chartInstance = Chart.getChart(canvas);
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    // Create new chart
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Fiery Red', 'Sunshine Yellow', 'Earth Green', 'Cool Blue'],
        datasets: [{
          data: [
            data["fiery-red"],
            data["sunshine-yellow"],
            data["earth-green"],
            data["cool-blue"]
          ],
          backgroundColor: ['#E23D28', '#F2CF1D', '#42A640', '#1C77C3'],
          borderWidth: isDashed ? 2 : 0,
          borderDash: isDashed ? [5, 5] : undefined,
          borderColor: isDashed ? '#666666' : undefined
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: true,
            text: title,
            padding: {
              top: 10,
              bottom: 10
            },
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  };
  
  // Create conscious persona chart
  useEffect(() => {
    if (!consciousChartRef.current) return;
    createChart(consciousChartRef.current, scores, 'Conscious Persona');
  }, [scores]);
  
  // Create unconscious persona chart if data is provided
  useEffect(() => {
    if (!unconsciousChartRef.current || !unconsciousScores) return;
    createChart(unconsciousChartRef.current, unconsciousScores, 'Unconscious Persona', true);
  }, [unconsciousScores]);
  
  // If we don't want to show both profiles or don't have unconscious data, just show the conscious chart
  if (!showBothProfiles || !unconsciousScores) {
    return (
      <div className="aspect-square w-full max-w-xs mx-auto mb-6">
        <canvas ref={consciousChartRef}></canvas>
      </div>
    );
  }
  
  // Show both profiles as tabs
  return (
    <Tabs defaultValue="conscious" className="w-full">
      <TabsList className="mb-4 grid grid-cols-2">
        <TabsTrigger value="conscious">Conscious Profile</TabsTrigger>
        <TabsTrigger value="unconscious">Unconscious Profile</TabsTrigger>
      </TabsList>
      
      <TabsContent value="conscious">
        <div className="aspect-square w-full max-w-xs mx-auto mb-2">
          <canvas ref={consciousChartRef}></canvas>
        </div>
        <p className="text-sm text-center text-gray-600 mb-4">
          How you consciously adapt to your environment and present yourself to others
        </p>
      </TabsContent>
      
      <TabsContent value="unconscious">
        <div className="aspect-square w-full max-w-xs mx-auto mb-2">
          <canvas ref={unconsciousChartRef}></canvas>
        </div>
        <p className="text-sm text-center text-gray-600 mb-4">
          Your instinctive self - how you behave when not adapting to external circumstances
        </p>
      </TabsContent>
    </Tabs>
  );
}

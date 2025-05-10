import { useEffect, useRef } from "react";
import { ColorType } from "@/lib/colorProfiles";

interface ColorChartProps {
  scores: Record<ColorType, number>;
  title?: string;
  isDashed?: boolean;
}

export default function ColorChart({ 
  scores, 
  title = "Color Energy Distribution", 
  isDashed = false 
}: ColorChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  
  // Create chart on mount or when scores change
  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Use the Chart.js global object
    const Chart = (window as any).Chart;
    
    if (!Chart) {
      console.error("Chart.js not loaded");
      return;
    }
    
    // Destroy any existing chart
    const chartInstance = Chart.getChart(chartRef.current);
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
            scores["fiery-red"],
            scores["sunshine-yellow"],
            scores["earth-green"],
            scores["cool-blue"]
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
            display: title ? true : false,
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
    
    // Cleanup function to destroy chart on unmount
    return () => {
      const chartInstance = Chart.getChart(chartRef.current);
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [scores, title, isDashed]);
  
  return (
    <div className="aspect-square w-full max-w-xs mx-auto">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

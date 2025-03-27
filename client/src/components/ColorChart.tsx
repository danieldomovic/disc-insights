import { useEffect, useRef } from "react";
import { ColorType } from "@/lib/colorProfiles";

interface ColorChartProps {
  scores: Record<ColorType, number>;
}

export default function ColorChart({ scores }: ColorChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  
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
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
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
  }, [scores]);
  
  return (
    <div className="aspect-square w-full max-w-xs mx-auto mb-6">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

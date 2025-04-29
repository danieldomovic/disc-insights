import { useEffect, useRef } from "react";
import { ColorType } from "@/lib/colorProfiles";

interface ColorDynamicsChartProps {
  scores: Record<ColorType, number>;
}

export default function ColorDynamicsChart({ scores }: ColorDynamicsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('The Insights Discovery® Colour Dynamics', canvas.width / 2, 30);
    
    // Define constants
    const colorMap = {
      'fiery-red': '#E23D28',
      'sunshine-yellow': '#F2CF1D',
      'earth-green': '#42A640',
      'cool-blue': '#1C77C3'
    };
    
    const colorNames = {
      'fiery-red': 'Fiery Red',
      'sunshine-yellow': 'Sunshine Yellow',
      'earth-green': 'Earth Green',
      'cool-blue': 'Cool Blue'
    };
    
    // Calculate positions and sizes
    const padding = 60;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = 200;
    const chartY = 80;
    const barSpacing = 20;
    const barWidth = (chartWidth - (barSpacing * 3)) / 4;
    
    // Draw the horizontal grid lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
      const y = chartY + chartHeight - (i * chartHeight / 10);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      // Draw grid line labels (0-100%)
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${i * 10}%`, padding - 5, y + 3);
    }
    
    // Calculate percentile positions based on actual scores
    const normalizedScores: Record<ColorType, number> = {
      'fiery-red': Math.min(100, Math.max(0, scores['fiery-red'])),
      'sunshine-yellow': Math.min(100, Math.max(0, scores['sunshine-yellow'])),
      'earth-green': Math.min(100, Math.max(0, scores['earth-green'])),
      'cool-blue': Math.min(100, Math.max(0, scores['cool-blue']))
    };
    
    // Draw bars for each color
    let barX = padding;
    const colorKeys = Object.keys(colorMap) as ColorType[];
    
    colorKeys.forEach((color, index) => {
      const barHeight = (normalizedScores[color] / 100) * chartHeight;
      const barY = chartY + chartHeight - barHeight;
      
      // Draw the bar
      ctx.fillStyle = colorMap[color];
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Add stroke to the bar
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // Draw the color label
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(colorNames[color], barX + barWidth / 2, chartY + chartHeight + 20);
      
      // Draw the percentage
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.fillText(`${Math.round(normalizedScores[color])}%`, barX + barWidth / 2, barY - 10);
      
      // Move to the next bar position
      barX += barWidth + barSpacing;
    });
    
    // Draw the conscious/unconscious preference sections
    const sectionY = chartY + chartHeight + 50;
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Preference Flow', canvas.width / 2, sectionY);
    
    const flowY = sectionY + 30;
    const arrowLength = 80;
    
    // Sort colors by score to determine flow
    const sortedColors = [...colorKeys].sort((a, b) => normalizedScores[b] - normalizedScores[a]);
    const dominantColor = sortedColors[0];
    const leastColor = sortedColors[3];
    
    // Draw the arrows
    drawFlowArrow(ctx, canvas.width / 2 - arrowLength, flowY, canvas.width / 2, flowY, colorMap[dominantColor]);
    drawFlowArrow(ctx, canvas.width / 2, flowY, canvas.width / 2 + arrowLength, flowY, colorMap[leastColor]);
    
    // Add labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    ctx.fillText('Conscious', canvas.width / 2 - arrowLength, flowY - 20);
    ctx.fillText(`(${colorNames[dominantColor]})`, canvas.width / 2 - arrowLength, flowY - 5);
    
    ctx.fillText('Less Conscious', canvas.width / 2 + arrowLength, flowY - 20);
    ctx.fillText(`(${colorNames[leastColor]})`, canvas.width / 2 + arrowLength, flowY - 5);
    
    // Add a note about the dynamics
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('The bars show the relative preference for each color energy', canvas.width / 2, canvas.height - 30);
    ctx.fillText('© Insights Discovery', canvas.width / 2, canvas.height - 10);
    
  }, [scores]);
  
  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
}

// Helper function to draw arrows
function drawFlowArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string
) {
  const headLength = 10;
  const headAngle = Math.PI / 6;
  
  // Calculate the angle of the line
  const angle = Math.atan2(toY - fromY, toX - fromX);
  
  // Draw the line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, fromY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Draw the arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - headAngle),
    toY - headLength * Math.sin(angle - headAngle)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + headAngle),
    toY - headLength * Math.sin(angle + headAngle)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
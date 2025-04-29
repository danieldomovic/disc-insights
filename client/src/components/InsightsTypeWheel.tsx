import { useEffect, useRef } from "react";
import { colorProfiles, ColorType, PersonalityType } from "@/lib/colorProfiles";

interface InsightsTypeWheelProps {
  personalityType: PersonalityType;
  dominantColor: ColorType;
  secondaryColor: ColorType;
  scores: Record<ColorType, number>;
}

export default function InsightsTypeWheel({
  personalityType,
  dominantColor,
  secondaryColor,
  scores
}: InsightsTypeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 500;
    canvas.height = 500;
    
    // Define constants
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('The Insights Discovery® 72 Type Wheel', centerX, 30);
    
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw the four quadrants
    const colorMap = {
      'fiery-red': '#E23D28',
      'sunshine-yellow': '#F2CF1D',
      'earth-green': '#42A640',
      'cool-blue': '#1C77C3'
    };
    
    // Draw the four quadrants
    drawQuadrant(ctx, centerX, centerY, radius, 0, Math.PI/2, colorMap['cool-blue'], 0.2);
    drawQuadrant(ctx, centerX, centerY, radius, Math.PI/2, Math.PI, colorMap['earth-green'], 0.2);
    drawQuadrant(ctx, centerX, centerY, radius, Math.PI, 3*Math.PI/2, colorMap['sunshine-yellow'], 0.2);
    drawQuadrant(ctx, centerX, centerY, radius, 3*Math.PI/2, 2*Math.PI, colorMap['fiery-red'], 0.2);
    
    // Draw inner circle segments (18 segments per quadrant)
    const segmentAngle = (Math.PI/2) / 18;
    
    // Cool Blue quadrant
    for (let i = 0; i < 18; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      drawSegment(ctx, centerX, centerY, radius * 0.8, startAngle, endAngle, colorMap['cool-blue'], 0.3 + (i * 0.03));
    }
    
    // Earth Green quadrant
    for (let i = 0; i < 18; i++) {
      const startAngle = Math.PI/2 + i * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      drawSegment(ctx, centerX, centerY, radius * 0.8, startAngle, endAngle, colorMap['earth-green'], 0.3 + (i * 0.03));
    }
    
    // Sunshine Yellow quadrant
    for (let i = 0; i < 18; i++) {
      const startAngle = Math.PI + i * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      drawSegment(ctx, centerX, centerY, radius * 0.8, startAngle, endAngle, colorMap['sunshine-yellow'], 0.3 + (i * 0.03));
    }
    
    // Fiery Red quadrant
    for (let i = 0; i < 18; i++) {
      const startAngle = 3*Math.PI/2 + i * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      drawSegment(ctx, centerX, centerY, radius * 0.8, startAngle, endAngle, colorMap['fiery-red'], 0.3 + (i * 0.03));
    }
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw quadrant labels
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = colorMap['cool-blue'];
    ctx.textAlign = 'center';
    ctx.fillText('OBSERVER', centerX, centerY - radius * 0.65);
    
    ctx.fillStyle = colorMap['earth-green'];
    ctx.fillText('SUPPORTER', centerX - radius * 0.65, centerY);
    
    ctx.fillStyle = colorMap['sunshine-yellow'];
    ctx.fillText('INSPIRER', centerX, centerY + radius * 0.65);
    
    ctx.fillStyle = colorMap['fiery-red'];
    ctx.fillText('DIRECTOR', centerX + radius * 0.65, centerY);
    
    // Draw personality type indicator
    // Calculate position based on personality type and scores
    let angle = 0;
    let distance = radius * 0.5;
    
    // Determine angle based on personality type
    switch (personalityType) {
      case 'Reformer':
        angle = (dominantColor === 'fiery-red') ? 7 * Math.PI/4 : Math.PI/4;
        break;
      case 'Director':
        angle = 7 * Math.PI/4;
        break;
      case 'Motivator':
        angle = 5 * Math.PI/3;
        break;
      case 'Inspirer':
        angle = 3 * Math.PI/2;
        break;
      case 'Helper':
        angle = 4 * Math.PI/3;
        break;
      case 'Supporter':
        angle = Math.PI;
        break;
      case 'Coordinator':
        angle = 2 * Math.PI/3;
        break;
      case 'Observer':
        angle = Math.PI/4;
        break;
    }
    
    // Adjust distance based on secondary color influence
    if (secondaryColor !== dominantColor) {
      distance = radius * 0.6;
    }
    
    // Calculate position
    const posX = centerX + distance * Math.cos(angle);
    const posY = centerY + distance * Math.sin(angle);
    
    // Draw indicator
    ctx.beginPath();
    ctx.arc(posX, posY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = colorMap[dominantColor];
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw label for position
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', posX, posY - 15);
    
    // Draw personality type
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(`Your Type: ${personalityType}`, centerX, centerY);
    
    // Draw legend
    const legendY = canvas.height - 40;
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('The position shows your preferences based on your assessment responses', centerX, legendY);
    ctx.fillText('© Insights Discovery', centerX, legendY + 20);
    
  }, [personalityType, dominantColor, secondaryColor, scores]);
  
  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
}

// Helper functions
function drawQuadrant(
  ctx: CanvasRenderingContext2D, 
  centerX: number, 
  centerY: number, 
  radius: number, 
  startAngle: number, 
  endAngle: number, 
  color: string, 
  opacity: number
) {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSegment(
  ctx: CanvasRenderingContext2D, 
  centerX: number, 
  centerY: number, 
  radius: number, 
  startAngle: number, 
  endAngle: number, 
  color: string, 
  opacity: number
) {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
import { useEffect, useRef } from "react";
import { ColorType, PersonalityType } from "@/lib/colorProfiles";

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
    
    // Set canvas size for high resolution
    canvas.width = 800;
    canvas.height = 800;
    
    // Define constants
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the title
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('The Insights Discovery® 72 Type Wheel', centerX, 40);
    
    // Draw the entire wheel
    drawWheel(ctx, centerX, centerY, maxRadius, personalityType, scores);
    
    // Draw copyright
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('© Insights Discovery', centerX, canvas.height - 20);
    
  }, [personalityType, dominantColor, secondaryColor, scores]);
  
  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
}

// Main function to draw the entire wheel
function drawWheel(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  personalityType: PersonalityType,
  scores: Record<ColorType, number>
) {
  // Define constants based on specifications
  const RIM_COLORS = {
    'REFORMER': '#AF6BAA',
    'DIRECTOR': '#E15736',
    'MOTIVATOR': '#F28E2B',
    'INSPIRER': '#F1C84C',
    'HELPER': '#D5D95D',
    'SUPPORTER': '#7EB758',
    'COORDINATOR': '#1B8673',
    'OBSERVER': '#4576A8'
  };
  
  const DISC_COLORS = {
    'BLUE': '#2B70B6',   // Top-left (Cool Blue)
    'RED': '#E13A3E',    // Top-right (Fiery Red)
    'GREEN': '#9BB53C',  // Bottom-left (Earth Green)
    'YELLOW': '#F4D35E'  // Bottom-right (Sunshine Yellow)
  };
  
  const GRAY_COLOR = '#ECECEC';
  const WHITE_COLOR = '#FFFFFF';
  
  const RADII_RATIOS = [1.0, 0.8, 0.6, 0.4, 0.2]; // 4 rings + center
  const radii = RADII_RATIOS.map(ratio => radius * ratio);
  
  // Cell numbers in concentric rings (4x8 grid)
  const CELL_NUMBERS = [
    [1, 2, 3, 4, 5, 6, 7, 8],            // Outermost ring
    [101, 102, 103, 104, 105, 108, 109, 112],  // Second ring
    [121, 122, 123, 124, 125, 128, 129, 132],  // Third ring
    [141, 142, 143, 144, 145, 148, 149, 152]   // Innermost ring
  ];
  
  // Mini pie slices data for the two indicators
  const PIE1_POSITION = {
    angle: Math.PI/8, // 22.5 degrees
    distance: 0.55 * radius,
    slices: [0.35, 0.25, 0.25, 0.15]
  };
  
  const PIE2_POSITION = {
    angle: 3*Math.PI/8, // 67.5 degrees
    distance: 0.85 * radius,
    slices: [0.45, 0.30, 0.15, 0.10]
  };
  
  // Draw the 3 gray/white alternating bands
  drawConcentrisBands(ctx, centerX, centerY, radii);
  
  // Draw the outer colored rim with labels
  drawColoredRim(ctx, centerX, centerY, radii[0], RIM_COLORS);
  
  // Draw radial guides (solid axes and dashed bisectors)
  drawRadialGuides(ctx, centerX, centerY, radii[0]);
  
  // Draw cell numbers
  drawCellNumbers(ctx, centerX, centerY, radii, CELL_NUMBERS);
  
  // Draw central DISC wheel
  drawDISCWheel(ctx, centerX, centerY, radii[4], DISC_COLORS);
  
  // Draw the two mini pie charts (indicators)
  const pie1X = centerX + PIE1_POSITION.distance * Math.cos(PIE1_POSITION.angle);
  const pie1Y = centerY + PIE1_POSITION.distance * Math.sin(PIE1_POSITION.angle);
  drawMiniPieChart(ctx, pie1X, pie1Y, 15, PIE1_POSITION.slices, DISC_COLORS);
  
  const pie2X = centerX + PIE2_POSITION.distance * Math.cos(PIE2_POSITION.angle);
  const pie2Y = centerY + PIE2_POSITION.distance * Math.sin(PIE2_POSITION.angle);
  drawMiniPieChart(ctx, pie2X, pie2Y, 15, PIE2_POSITION.slices, DISC_COLORS);
  
  // Draw label for active type (Your position)
  drawPositionLabel(ctx, personalityType, centerX, centerY, radii[0], RIM_COLORS);
}

// Draw concentric bands with alternating gray/white fill
function drawConcentrisBands(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radii: number[]
) {
  // Draw each concentric band (4 rings total)
  for (let i = 0; i < radii.length - 1; i++) {
    // Alternate fill colors
    const fillColor = i % 2 === 0 ? '#ECECEC' : '#FFFFFF';
    
    // Draw the band
    ctx.beginPath();
    ctx.arc(centerX, centerY, radii[i], 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, radii[i+1], 0, 2 * Math.PI, true);
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    // Draw the circle at each radius
    ctx.beginPath();
    ctx.arc(centerX, centerY, radii[i], 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = i === 0 ? 2 : 1;  // Thicker line for outermost circle
    ctx.stroke();
  }
  
  // Draw innermost circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radii[radii.length-1], 0, 2 * Math.PI);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Draw the colored outer rim with type labels
function drawColoredRim(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  outerRadius: number,
  rimColors: Record<string, string>
) {
  const innerRadius = outerRadius * 0.9; // 10% width for rim
  const typeLabels = Object.keys(rimColors);
  const segmentAngle = (2 * Math.PI) / typeLabels.length;
  
  // Draw each segment
  typeLabels.forEach((label, index) => {
    const startAngle = -Math.PI/2 + (index * segmentAngle);
    const endAngle = startAngle + segmentAngle;
    const midAngle = startAngle + (segmentAngle / 2);
    
    // Draw rim segment
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = rimColors[label];
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add label
    const labelRadius = (outerRadius + innerRadius) / 2;
    const x = centerX + labelRadius * Math.cos(midAngle);
    const y = centerY + labelRadius * Math.sin(midAngle);
    
    // Rotate and position text along the arc
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(midAngle + Math.PI/2);
    
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);
    
    ctx.restore();
  });
}

// Draw horizontal, vertical, and diagonal guides
function drawRadialGuides(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) {
  // Draw main axes (solid)
  ctx.beginPath();
  // Horizontal
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  // Vertical
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY + radius);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // Draw bisector guides (dashed) - 22.5° increments
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI / 4) + (Math.PI / 8);
    const startX = centerX + radius * Math.cos(angle);
    const startY = centerY + radius * Math.sin(angle);
    const endX = centerX + radius * Math.cos(angle + Math.PI);
    const endY = centerY + radius * Math.sin(angle + Math.PI);
    
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
  }
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash pattern
}

// Draw cell numbers in each segment
function drawCellNumbers(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radii: number[],
  cellNumbers: number[][]
) {
  const numSections = 8;
  const segmentAngle = (2 * Math.PI) / numSections;
  
  ctx.font = '10px Arial';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // For each ring
  for (let ring = 0; ring < cellNumbers.length; ring++) {
    const innerRadius = radii[ring + 1];
    const outerRadius = radii[ring];
    const midRadius = (innerRadius + outerRadius) / 2;
    
    // For each segment
    for (let segment = 0; segment < numSections; segment++) {
      const number = cellNumbers[ring][segment];
      const angle = -Math.PI/2 + (segment * segmentAngle) + (segmentAngle / 2);
      
      const x = centerX + midRadius * Math.cos(angle);
      const y = centerY + midRadius * Math.sin(angle);
      
      ctx.fillText(number.toString(), x, y);
    }
  }
}

// Draw central DISC color wheel
function drawDISCWheel(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  discColors: Record<string, string>
) {
  const colors = Object.values(discColors);
  
  // Draw the four quadrants
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, -Math.PI/2, 0);
  ctx.lineTo(centerX, centerY);
  ctx.closePath();
  ctx.fillStyle = colors[1]; // RED - top right
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, 0, Math.PI/2);
  ctx.lineTo(centerX, centerY);
  ctx.closePath();
  ctx.fillStyle = colors[3]; // YELLOW - bottom right
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, Math.PI/2, Math.PI);
  ctx.lineTo(centerX, centerY);
  ctx.closePath();
  ctx.fillStyle = colors[2]; // GREEN - bottom left
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, Math.PI, 3*Math.PI/2);
  ctx.lineTo(centerX, centerY);
  ctx.closePath();
  ctx.fillStyle = colors[0]; // BLUE - top left
  ctx.fill();
  
  // Draw outline
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Draw mini pie chart (position indicators)
function drawMiniPieChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  slices: number[],
  colors: Record<string, string>
) {
  const colorValues = Object.values(colors);
  let startAngle = 0;
  
  // Draw white background
  ctx.beginPath();
  ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.5;
  ctx.stroke();
  
  // Draw each slice
  slices.forEach((slice, i) => {
    const endAngle = startAngle + (slice * 2 * Math.PI);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colorValues[i];
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    startAngle = endAngle;
  });
  
  // Draw outline
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // "YOU" label
  ctx.font = 'bold 9px Arial';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', x, y - radius - 8);
}

// Draw position label for the personality type
function drawPositionLabel(
  ctx: CanvasRenderingContext2D,
  personalityType: PersonalityType,
  centerX: number,
  centerY: number,
  radius: number,
  rimColors: Record<string, string>
) {
  // Find the segment for this personality type
  const angleMap: Record<PersonalityType, number> = {
    'Reformer': -Math.PI/2,            // Top (0 degrees)
    'Director': -Math.PI/4,            // Top-right (45 degrees)
    'Motivator': 0,                    // Right (90 degrees)
    'Inspirer': Math.PI/4,             // Bottom-right (135 degrees)
    'Helper': Math.PI/2,               // Bottom (180 degrees)
    'Supporter': 3*Math.PI/4,          // Bottom-left (225 degrees)
    'Coordinator': Math.PI,            // Left (270 degrees)
    'Observer': -3*Math.PI/4           // Top-left (315 degrees)
  };
  
  // Position a small marker at the edge of the wheel in the appropriate segment
  const angle = angleMap[personalityType];
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.05, angle - 0.05, angle + 0.05);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.stroke();
}
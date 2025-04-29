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
    drawDiscWheel(ctx, centerX, centerY, maxRadius, personalityType, scores);
    
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

// Constants for the wheel
const RADII_RATIOS = [1.0, 0.75, 0.5, 0.25]; // Normalized radii for the rings
const CENTER_RADIUS_RATIO = 0.15; // Radius of central DISC wheel as ratio of max radius
const RIM_COLORS = {
  'REFORMER': '#AF6BAA',    // Purple
  'DIRECTOR': '#E15736',    // Red
  'MOTIVATOR': '#F28E2B',   // Orange
  'INSPIRER': '#F1C84C',    // Yellow
  'HELPER': '#D5D95D',      // Light green
  'SUPPORTER': '#7EB758',   // Green
  'COORDINATOR': '#1B8673', // Teal
  'OBSERVER': '#4576A8'     // Blue
};

// DISC colors for central wheel and mini pie charts
const DISC_COLORS = {
  'BLUE': '#2B70B6',   // Top-left (Cool Blue)
  'RED': '#E13A3E',    // Top-right (Fiery Red)
  'GREEN': '#9BB53C',  // Bottom-left (Earth Green)
  'YELLOW': '#F4D35E'  // Bottom-right (Sunshine Yellow)
};

// Cell numbers in concentric rings (4x8 grid)
const CELL_NUMBERS = [
  [1, 2, 3, 4, 5, 6, 7, 8],                    // Outermost ring
  [101, 102, 103, 104, 105, 108, 109, 112],    // Second ring
  [121, 122, 123, 124, 125, 128, 129, 132],    // Third ring
  [141, 142, 143, 144, 145, 148, 149, 152]     // Innermost ring
];

// Mini pie positions and slices
const PIE1 = {
  position: {
    angleDeg: 22.5,  // Angle in degrees from top
    radiusRatio: 0.55 // Distance as ratio of max radius
  },
  slices: [0.35, 0.25, 0.25, 0.15]  // BLUE, RED, GREEN, YELLOW proportions
};

const PIE2 = {
  position: {
    angleDeg: 67.5,  // Angle in degrees from top
    radiusRatio: 0.85 // Distance as ratio of max radius
  },
  slices: [0.45, 0.30, 0.15, 0.10]  // BLUE, RED, GREEN, YELLOW proportions
};

// Main function to draw the DISC wheel
function drawDiscWheel(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  personalityType: PersonalityType,
  scores: Record<ColorType, number>
) {
  // Calculate actual radii from ratios
  const radii = RADII_RATIOS.map(ratio => radius * ratio);
  const centerRadius = radius * CENTER_RADIUS_RATIO;
  
  // Draw alternating gray/white bands
  drawConcentrisBands(ctx, centerX, centerY, radii);
  
  // Draw the outer colored rim with type labels
  drawColoredRim(ctx, centerX, centerY, radius);
  
  // Draw radial guides (solid axes and dashed bisectors)
  drawRadialGuides(ctx, centerX, centerY, radius);
  
  // Draw cell numbers in each segment
  drawCellNumbers(ctx, centerX, centerY, radii);
  
  // Draw central DISC wheel
  drawCentralDisc(ctx, centerX, centerY, centerRadius);
  
  // Draw mini pie charts (position indicators)
  drawMiniPie(ctx, centerX, centerY, radius, PIE1.position, PIE1.slices);
  drawMiniPie(ctx, centerX, centerY, radius, PIE2.position, PIE2.slices);
  
  // Draw indicator for the user's personality type position
  drawPersonalityIndicator(ctx, centerX, centerY, radius, personalityType);
}

// Draw concentric bands with alternating gray/white fill
function drawConcentrisBands(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radii: number[]
) {
  const GRAY_COLOR = '#ECECEC'; // Light gray color
  const WHITE_COLOR = '#FFFFFF';
  
  // Draw each concentric band (between consecutive radii)
  for (let i = 0; i < radii.length - 1; i++) {
    // Alternate fill colors
    const fillColor = i % 2 === 0 ? GRAY_COLOR : WHITE_COLOR;
    
    // Draw band (annular ring)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radii[i], 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, radii[i+1], 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    // Draw circle outline at this radius
    ctx.beginPath();
    ctx.arc(centerX, centerY, radii[i], 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = i === 0 ? 2 : 1; // Thicker line for outermost circle
    ctx.stroke();
  }
  
  // Draw innermost circle outline
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
  radius: number
) {
  const rimWidth = radius * 0.1; // Width of rim (10% of max radius)
  const innerRadius = radius - rimWidth;
  const typeLabels = Object.keys(RIM_COLORS);
  const segmentAngle = (2 * Math.PI) / typeLabels.length; // 45° in radians
  
  // Draw each colored segment and its label
  typeLabels.forEach((label, index) => {
    // Calculate angles (clockwise from top)
    const startAngle = -Math.PI/2 + (index * segmentAngle);
    const endAngle = startAngle + segmentAngle;
    const midAngle = startAngle + (segmentAngle / 2);
    
    // Draw colored rim segment
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = RIM_COLORS[label];
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; // White borders between segments
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Position and rotate text for the curved label
    const labelRadius = (radius + innerRadius) / 2;
    const x = centerX + labelRadius * Math.cos(midAngle);
    const y = centerY + labelRadius * Math.sin(midAngle);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(midAngle + Math.PI/2); // Rotate text to follow the arc
    
    // Draw the label
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);
    
    ctx.restore();
  });
}

// Draw radial guide lines (axes and bisectors)
function drawRadialGuides(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) {
  // Draw main axes (solid lines at 0°, 90°, 180°, 270°)
  ctx.beginPath();
  // Horizontal axis
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  // Vertical axis
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY + radius);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw bisector guides (dashed lines at 22.5° increments)
  ctx.setLineDash([5, 3]); // Dashed line pattern
  ctx.beginPath();
  
  // Draw bisector lines (at 22.5°, 67.5°, 112.5°, 157.5°, etc.)
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI / 4) + (Math.PI / 8); // 22.5°, 112.5°, 202.5°, 292.5°
    
    // Calculate end points
    const startX = centerX + radius * Math.cos(angle);
    const startY = centerY + radius * Math.sin(angle);
    const endX = centerX + radius * Math.cos(angle + Math.PI); // opposite point
    const endY = centerY + radius * Math.sin(angle + Math.PI);
    
    // Draw the dashed line
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
  }
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]); // Reset to solid line
}

// Draw cell numbers in each segment
function drawCellNumbers(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radii: number[]
) {
  const numSections = 8; // 8 equal segments
  const segmentAngle = (2 * Math.PI) / numSections; // 45° in radians
  
  ctx.font = '10px Arial';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // For each ring
  for (let ring = 0; ring < CELL_NUMBERS.length; ring++) {
    const innerRadius = radii[ring + 1];
    const outerRadius = radii[ring];
    const midRadius = (innerRadius + outerRadius) / 2;
    
    // For each segment
    for (let segment = 0; segment < numSections; segment++) {
      const number = CELL_NUMBERS[ring][segment];
      // Calculate angle (clockwise from top)
      const angle = -Math.PI/2 + (segment * segmentAngle) + (segmentAngle / 2);
      
      // Calculate position
      const x = centerX + midRadius * Math.cos(angle);
      const y = centerY + midRadius * Math.sin(angle);
      
      // Draw the number
      ctx.fillText(number.toString(), x, y);
    }
  }
}

// Draw central DISC quartered circle
function drawCentralDisc(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) {
  const colors = Object.values(DISC_COLORS);
  
  // Draw each quadrant
  // Top-left (BLUE)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, Math.PI, 3*Math.PI/2);
  ctx.closePath();
  ctx.fillStyle = colors[0]; // BLUE
  ctx.fill();
  
  // Top-right (RED)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, -Math.PI/2, 0);
  ctx.closePath();
  ctx.fillStyle = colors[1]; // RED
  ctx.fill();
  
  // Bottom-left (GREEN)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, Math.PI/2, Math.PI);
  ctx.closePath();
  ctx.fillStyle = colors[2]; // GREEN
  ctx.fill();
  
  // Bottom-right (YELLOW)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, 0, Math.PI/2);
  ctx.closePath();
  ctx.fillStyle = colors[3]; // YELLOW
  ctx.fill();
  
  // Draw outline
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Draw mini pie chart
function drawMiniPie(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  maxRadius: number,
  position: { angleDeg: number, radiusRatio: number },
  slices: number[]
) {
  // Convert angle from degrees to radians (clockwise from top)
  const angleRad = (position.angleDeg - 90) * Math.PI / 180;
  
  // Calculate position in cartesian coordinates
  const distance = position.radiusRatio * maxRadius;
  const x = centerX + distance * Math.cos(angleRad);
  const y = centerY + distance * Math.sin(angleRad);
  
  const pieRadius = maxRadius * 0.06; // Size of mini pie chart
  
  // Draw white background circle with slight padding
  ctx.beginPath();
  ctx.arc(x, y, pieRadius + 2, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.5;
  ctx.stroke();
  
  // Draw the slices
  const colors = Object.values(DISC_COLORS);
  let startAngle = Math.PI; // Start from top (180° in radians)
  
  slices.forEach((slice, i) => {
    const endAngle = startAngle + (slice * 2 * Math.PI);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, pieRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    startAngle = endAngle;
  });
  
  // Add "YOU" label above pie
  ctx.font = 'bold 9px Arial';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', x, y - pieRadius - 8);
}

// Draw indicator for personality type position
function drawPersonalityIndicator(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  personalityType: PersonalityType
) {
  // Map personality types to angles (in radians, clockwise from top)
  const typeAngles: Record<PersonalityType, number> = {
    'Reformer': -Math.PI/2,           // Top (0°)
    'Director': -Math.PI/4,           // Top-right (45°)
    'Motivator': 0,                   // Right (90°)
    'Inspirer': Math.PI/4,            // Bottom-right (135°)
    'Helper': Math.PI/2,              // Bottom (180°)
    'Supporter': 3*Math.PI/4,         // Bottom-left (225°)
    'Coordinator': Math.PI,           // Left (270°)
    'Observer': -3*Math.PI/4          // Top-left (315°)
  };
  
  const angle = typeAngles[personalityType];
  
  // Draw a subtle indicator on the rim at the appropriate position
  // (we've chosen to show the position with the mini pie charts instead of a rim marker)
}
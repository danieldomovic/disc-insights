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
    canvas.width = 600;
    canvas.height = 600;
    
    // Define constants
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the title
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#0D3B66';
    ctx.textAlign = 'center';
    ctx.fillText('The Insights Discovery® 72 Type Wheel', centerX, 30);
    
    // Define color constants
    const colorMap = {
      'cool-blue': '#1C77C3',
      'earth-green': '#42A640',
      'sunshine-yellow': '#F2CF1D',
      'fiery-red': '#E23D28'
    };
    
    // Define personality zones and positions
    const personalityPositions = getPersonalityPositions(
      personalityType,
      dominantColor,
      secondaryColor,
      scores
    );
    
    // Draw outer rings and segments
    drawWheelStructure(ctx, centerX, centerY, radius, colorMap);
    
    // Draw personality position indicator
    drawPersonalityIndicator(
      ctx,
      centerX,
      centerY,
      radius,
      personalityPositions.angle,
      personalityPositions.distance,
      colorMap[dominantColor as keyof typeof colorMap],
      personalityType
    );
    
    // Draw legend and copyright
    drawLegend(ctx, centerX, canvas.height);
    
  }, [personalityType, dominantColor, secondaryColor, scores]);
  
  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
}

// Calculate angle and distance based on personality type and colors
function getPersonalityPositions(
  personalityType: PersonalityType,
  dominantColor: ColorType,
  secondaryColor: ColorType,
  scores: Record<ColorType, number>
) {
  // Calculate score intensity for positioning
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const normalizedScores: Record<ColorType, number> = {
    'fiery-red': (scores['fiery-red'] / totalScore) * 100,
    'sunshine-yellow': (scores['sunshine-yellow'] / totalScore) * 100,
    'earth-green': (scores['earth-green'] / totalScore) * 100,
    'cool-blue': (scores['cool-blue'] / totalScore) * 100
  };
  
  // Define base angles for each personality type (in radians)
  // Note: 0 = right (east), PI/2 = down (south), PI = left (west), 3PI/2 = up (north)
  const personalityAngles: Record<PersonalityType, number> = {
    'Reformer': 5 * Math.PI / 4, // Between Director and Observer
    'Director': 7 * Math.PI / 4, // Top-right (northeast)
    'Motivator': 5 * Math.PI / 3, // Right-bottom (southeast)
    'Inspirer': 3 * Math.PI / 2, // Bottom (south)
    'Helper': 4 * Math.PI / 3, // Bottom-left (southwest)
    'Supporter': Math.PI, // Left (west)
    'Coordinator': 2 * Math.PI / 3, // Top-left (northwest)
    'Observer': Math.PI / 4, // Top (north)
  };
  
  // Get base angle for personality type
  let angle = personalityAngles[personalityType];
  
  // Adjust angle based on color scores
  // This creates subtle variations in positioning within the same personality type
  // depending on the exact color preference profile
  if (dominantColor === 'fiery-red') {
    if (secondaryColor === 'sunshine-yellow') {
      angle += (normalizedScores['sunshine-yellow'] / 200) * (Math.PI / 8);
    } else if (secondaryColor === 'cool-blue') {
      angle -= (normalizedScores['cool-blue'] / 200) * (Math.PI / 8);
    }
  } else if (dominantColor === 'sunshine-yellow') {
    if (secondaryColor === 'fiery-red') {
      angle += (normalizedScores['fiery-red'] / 200) * (Math.PI / 8);
    } else if (secondaryColor === 'earth-green') {
      angle -= (normalizedScores['earth-green'] / 200) * (Math.PI / 8);
    }
  } else if (dominantColor === 'earth-green') {
    if (secondaryColor === 'sunshine-yellow') {
      angle += (normalizedScores['sunshine-yellow'] / 200) * (Math.PI / 8);
    } else if (secondaryColor === 'cool-blue') {
      angle -= (normalizedScores['cool-blue'] / 200) * (Math.PI / 8);
    }
  } else if (dominantColor === 'cool-blue') {
    if (secondaryColor === 'earth-green') {
      angle += (normalizedScores['earth-green'] / 200) * (Math.PI / 8);
    } else if (secondaryColor === 'fiery-red') {
      angle -= (normalizedScores['fiery-red'] / 200) * (Math.PI / 8);
    }
  }
  
  // Calculate distance from center (0.4 to 0.75 of radius)
  // Distance is based on the strength of the dominant color relative to others
  const maxScore = Math.max(...Object.values(normalizedScores));
  const scoreRatio = normalizedScores[dominantColor] / maxScore;
  
  // Calculate distance - stronger dominance = farther from center
  let distance = 0.4 + (scoreRatio * 0.35);
  
  // Adjust for secondary color influence
  if (secondaryColor !== dominantColor) {
    const secondaryRatio = normalizedScores[secondaryColor] / normalizedScores[dominantColor];
    
    // If secondary color is strong, pull toward center slightly
    if (secondaryRatio > 0.7) {
      distance -= 0.05;
    }
  }
  
  return { angle, distance };
}

// Draw the complete wheel structure including all rings and segments
function drawWheelStructure(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  colorMap: Record<string, string>
) {
  // Draw outer circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Define wheel rings
  const outerRingWidth = radius * 0.2;
  const middleRingWidth = radius * 0.3;
  const innerRadius = radius - outerRingWidth - middleRingWidth;
  
  // Draw each quadrant with different intensities in rings
  const quadrants = [
    { color: 'cool-blue', startAngle: -Math.PI/2, endAngle: 0 },
    { color: 'fiery-red', startAngle: 0, endAngle: Math.PI/2 },
    { color: 'sunshine-yellow', startAngle: Math.PI/2, endAngle: Math.PI },
    { color: 'earth-green', startAngle: Math.PI, endAngle: 3*Math.PI/2 }
  ];
  
  // Draw all quadrants in layers
  // Outer ring - 18 segments per quadrant
  quadrants.forEach(quadrant => {
    const segmentAngle = (quadrant.endAngle - quadrant.startAngle) / 18;
    const colorHex = colorMap[quadrant.color];
    
    // Outer ring segments (graduated color)
    for (let i = 0; i < 18; i++) {
      const startAngle = quadrant.startAngle + (i * segmentAngle);
      const endAngle = startAngle + segmentAngle;
      const opacity = 0.4 + (i * 0.03); // Graduated opacity
      
      // Draw outer ring segment
      drawRingSegment(
        ctx, 
        centerX, 
        centerY, 
        radius - outerRingWidth, 
        radius, 
        startAngle, 
        endAngle, 
        colorHex, 
        opacity
      );
    }
    
    // Middle ring (lighter)
    drawRingSegment(
      ctx,
      centerX,
      centerY,
      innerRadius,
      radius - outerRingWidth,
      quadrant.startAngle,
      quadrant.endAngle,
      colorHex,
      0.3
    );
    
    // Inner quadrant (lightest)
    drawRingSegment(
      ctx,
      centerX,
      centerY,
      0,
      innerRadius,
      quadrant.startAngle,
      quadrant.endAngle,
      colorHex,
      0.1
    );
  });
  
  // Draw inner circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw middle circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - outerRingWidth, 0, 2 * Math.PI);
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw diagonal lines
  ctx.beginPath();
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY + radius);
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw quadrant labels
  drawQuadrantLabels(ctx, centerX, centerY, radius, colorMap);
  
  // Draw type labels around the wheel
  drawTypeLabels(ctx, centerX, centerY, radius, colorMap);
}

// Draw quadrant labels (Observer, Director, etc.)
function drawQuadrantLabels(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  colorMap: Record<string, string>
) {
  const labelDistance = radius * 0.6;
  
  // Top - REFORMER/OBSERVER - Blue
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = colorMap['cool-blue'];
  ctx.textAlign = 'center';
  ctx.fillText('OBSERVER', centerX, centerY - labelDistance);
  
  // Right - DIRECTOR - Red
  ctx.fillStyle = colorMap['fiery-red'];
  ctx.textAlign = 'left';
  ctx.fillText('DIRECTOR', centerX + labelDistance * 0.7, centerY);
  
  // Bottom - INSPIRER - Yellow
  ctx.fillStyle = colorMap['sunshine-yellow'];
  ctx.textAlign = 'center';
  ctx.fillText('INSPIRER', centerX, centerY + labelDistance);
  
  // Left - SUPPORTER - Green
  ctx.fillStyle = colorMap['earth-green'];
  ctx.textAlign = 'right';
  ctx.fillText('SUPPORTER', centerX - labelDistance * 0.7, centerY);
}

// Draw personality type labels around the wheel
function drawTypeLabels(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  colorMap: Record<string, string>
) {
  const typePositions = [
    { type: 'Coordinator', angle: -Math.PI/4, color: 'cool-blue' },
    { type: 'Observer', angle: -Math.PI/2, color: 'cool-blue' },
    { type: 'Reformer', angle: -3*Math.PI/4, color: 'cool-blue' },
    { type: 'Director', angle: 0, color: 'fiery-red' },
    { type: 'Motivator', angle: Math.PI/4, color: 'fiery-red' },
    { type: 'Inspirer', angle: Math.PI/2, color: 'sunshine-yellow' },
    { type: 'Helper', angle: 3*Math.PI/4, color: 'sunshine-yellow' },
    { type: 'Supporter', angle: Math.PI, color: 'earth-green' }
  ];
  
  ctx.font = '11px Arial';
  
  typePositions.forEach(pos => {
    const x = centerX + (radius + 20) * Math.cos(pos.angle);
    const y = centerY + (radius + 20) * Math.sin(pos.angle);
    
    // Set text alignment based on position
    if (pos.angle === 0) {
      ctx.textAlign = 'left';
    } else if (pos.angle === Math.PI) {
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'center';
    }
    
    // Adjust vertical alignment
    let yOffset = 0;
    if (pos.angle === -Math.PI/2) yOffset = -5;
    if (pos.angle === Math.PI/2) yOffset = 12;
    
    ctx.fillStyle = colorMap[pos.color];
    ctx.fillText(pos.type, x, y + yOffset);
  });
}

// Draw a position indicator for the person's type
function drawPersonalityIndicator(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  distanceFactor: number,
  color: string,
  personalityType: string
) {
  // Calculate position
  const distance = radius * distanceFactor;
  const x = centerX + distance * Math.cos(angle);
  const y = centerY + distance * Math.sin(angle);
  
  // Draw highlight circle
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fill();
  
  // Draw indicator
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw "YOU" label
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', x, y - 20);
  
  // Draw personality type in center
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText(`Your Type: ${personalityType}`, centerX, centerY);
}

// Draw legend and copyright info
function drawLegend(ctx: CanvasRenderingContext2D, centerX: number, canvasHeight: number) {
  const legendY = canvasHeight - 40;
  
  ctx.font = '12px Arial';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'center';
  ctx.fillText('Your position on the wheel is determined by your color preferences', centerX, legendY);
  ctx.fillText('© Insights Discovery', centerX, legendY + 20);
}

// Draw a segment of a ring
function drawRingSegment(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  opacity: number
) {
  ctx.beginPath();
  // Draw outer arc
  ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
  // Draw inner arc in counter-clockwise direction
  if (innerRadius > 0) {
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
  } else {
    ctx.lineTo(centerX, centerY);
  }
  ctx.closePath();
  
  // Fill and stroke
  ctx.fillStyle = hexToRgba(color, opacity);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, opacity + 0.1);
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

// Convert hex color to rgba
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
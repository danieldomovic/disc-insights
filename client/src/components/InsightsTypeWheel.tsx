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
    
    // Set canvas size - increase width to prevent labels from being cut off
    canvas.width = 800;
    canvas.height = 800;
    
    // Define constants
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60; // More margin for outer labels
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the title
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#0D3B66';
    ctx.textAlign = 'center';
    ctx.fillText('The Insights Discovery® 72 Type Wheel', centerX, 50);
    
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
  // In the Insights Discovery wheel:
  // 0 = right (east), PI/2 = down (south), PI = left (west), -PI/2 (or 3PI/2) = up (north)
  const personalityAngles: Record<PersonalityType, number> = {
    'Reformer': -7 * Math.PI / 8, // Updated: Between Observer and Director (top quadrant, slightly toward right)
    'Director': 0, // Right (east) - Red dominant
    'Motivator': Math.PI / 4, // Between Director and Inspirer (bottom-right quadrant)
    'Inspirer': Math.PI / 2, // Bottom (south) - Yellow dominant
    'Helper': 3 * Math.PI / 4, // Between Inspirer and Supporter (bottom-left quadrant)
    'Supporter': Math.PI, // Left (west) - Green dominant
    'Coordinator': -5 * Math.PI / 8, // Between Supporter and Observer (top-left quadrant)
    'Observer': -Math.PI / 2, // Top (north) - Blue dominant
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
  
  // For Reformer type, ensure it's properly positioned in the top-right 
  // quadrant between Observer and Director
  if (personalityType === 'Reformer') {
    angle = -7 * Math.PI / 8; // Fixed position to match reference image
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
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Define wheel rings - match the reference image
  const outerRingWidth = radius * 0.1; // Outer ring is thinner in reference image
  const middleRingWidth = radius * 0.2; 
  const innerRingWidth = radius * 0.2;
  const innerRadius = radius - outerRingWidth - middleRingWidth - innerRingWidth;
  
  // Draw each quadrant with different intensities in rings
  // Standard Insights Discovery wheel arrangement:
  // Cool Blue (top), Fiery Red (right), 
  // Sunshine Yellow (bottom), Earth Green (left)
  const quadrants = [
    { color: 'cool-blue', startAngle: -Math.PI/2, endAngle: 0 },          // Top-right
    { color: 'fiery-red', startAngle: 0, endAngle: Math.PI/2 },           // Bottom-right
    { color: 'sunshine-yellow', startAngle: Math.PI/2, endAngle: Math.PI },    // Bottom-left
    { color: 'earth-green', startAngle: Math.PI, endAngle: 3*Math.PI/2 }   // Top-left
  ];
  
  // Draw the outer personality type bands
  drawTypeColorBands(ctx, centerX, centerY, radius, colorMap);
  
  // Draw quadrants as rings
  quadrants.forEach(quadrant => {
    const colorHex = colorMap[quadrant.color];
    
    // Draw middle ring (lighter gray color)
    drawRingSegment(
      ctx,
      centerX,
      centerY,
      radius - outerRingWidth,
      radius - outerRingWidth - middleRingWidth,
      quadrant.startAngle,
      quadrant.endAngle,
      '#EEEEEE', // Light gray for middle ring
      1.0
    );
    
    // Draw inner ring (lighter gray alternating with white)
    const segmentCount = 9; // Number of segments per quadrant
    const segmentAngle = (quadrant.endAngle - quadrant.startAngle) / segmentCount;
    
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = quadrant.startAngle + (i * segmentAngle);
      const endAngle = startAngle + segmentAngle;
      
      // Alternating gray and white
      const fillColor = i % 2 === 0 ? '#EEEEEE' : '#FFFFFF';
      
      drawRingSegment(
        ctx,
        centerX,
        centerY,
        innerRadius,
        radius - outerRingWidth - middleRingWidth,
        startAngle,
        endAngle,
        fillColor,
        1.0
      );
    }
  });
  
  // Draw inner circles for center
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw color wheel in center
  const centerRadius = innerRadius * 0.3;
  drawCenterColorWheel(ctx, centerX, centerY, centerRadius, colorMap);
  
  // Draw middle circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - outerRingWidth, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw third circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - outerRingWidth - middleRingWidth, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw segment numbers in the inner ring
  drawSegmentNumbers(ctx, centerX, centerY, innerRadius, radius - outerRingWidth - middleRingWidth);
  
  // Draw horizontal and vertical lines (thicker)
  ctx.beginPath();
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY + radius);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]); // Dashed line
  ctx.stroke();
  ctx.setLineDash([]); // Reset to solid line
  
  // Draw diagonal lines
  ctx.beginPath();
  // Top-left to bottom-right
  ctx.moveTo(centerX - (radius * 0.7), centerY - (radius * 0.7));
  ctx.lineTo(centerX + (radius * 0.7), centerY + (radius * 0.7));
  // Top-right to bottom-left
  ctx.moveTo(centerX + (radius * 0.7), centerY - (radius * 0.7));
  ctx.lineTo(centerX - (radius * 0.7), centerY + (radius * 0.7));
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]); // Dashed line
  ctx.stroke();
  ctx.setLineDash([]); // Reset to solid line
}

// Draw the outer colored bands with personality type labels
function drawTypeColorBands(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  colorMap: Record<string, string>
) {
  const outerRingWidth = radius * 0.1;
  
  // Define the personality types and their corresponding colors
  const typeSegments = [
    { type: 'REFORMER', startAngle: -Math.PI, endAngle: -0.75 * Math.PI, color: '#B53E90' }, // Reformer (top)
    { type: 'DIRECTOR', startAngle: -0.75 * Math.PI, endAngle: -0.25 * Math.PI, color: '#D04E31' }, // Director (right)
    { type: 'MOTIVATOR', startAngle: -0.25 * Math.PI, endAngle: 0.25 * Math.PI, color: '#E77C30' }, // Motivator (right-bottom)
    { type: 'INSPIRER', startAngle: 0.25 * Math.PI, endAngle: 0.75 * Math.PI, color: '#F5D033' }, // Inspirer (bottom)
    { type: 'HELPER', startAngle: 0.75 * Math.PI, endAngle: 1.25 * Math.PI, color: '#D6E04D' }, // Helper (bottom-left)
    { type: 'SUPPORTER', startAngle: 1.25 * Math.PI, endAngle: 1.75 * Math.PI, color: '#7E9C3B' }, // Supporter (left)
    { type: 'COORDINATOR', startAngle: 1.75 * Math.PI, endAngle: 2.25 * Math.PI, color: '#29857D' }, // Coordinator (left-top)
    { type: 'OBSERVER', startAngle: 2.25 * Math.PI, endAngle: 2.75 * Math.PI, color: '#2E7CB9' }, // Observer (top)
  ];
  
  // Draw each segment and its label
  typeSegments.forEach(segment => {
    // Draw the colored band
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, segment.startAngle, segment.endAngle);
    ctx.arc(centerX, centerY, radius - outerRingWidth, segment.endAngle, segment.startAngle, true);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Calculate position for the label
    const midAngle = (segment.startAngle + segment.endAngle) / 2;
    const labelRadius = radius - (outerRingWidth / 2);
    const x = centerX + labelRadius * Math.cos(midAngle);
    const y = centerY + labelRadius * Math.sin(midAngle);
    
    // Adjust text rotation to follow the curve
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(midAngle + Math.PI/2); // Rotate text to align with band
    
    // Draw the label
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(segment.type, 0, 0);
    
    ctx.restore();
  });
}

// Draw number segments in the inner ring
function drawSegmentNumbers(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number
) {
  // Define total segments and angle per segment
  const totalSegments = 72;
  const segmentAngle = (2 * Math.PI) / totalSegments;
  
  // Define all numbers to show based on the reference image
  // Mapping angle in degrees to label text for precise positioning
  const angleToLabelMap: Record<number, string> = {
    // Top quadrant
    0: "1", 15: "2", 30: "3", 45: "4", 60: "5", 75: "6", 90: "7",
    105: "8", 120: "9", 135: "10", 150: "11", 165: "12", 180: "13",
    195: "14", 210: "15", 225: "16",
    
    // Inner numbers - second ring
    5: "21", 20: "22", 35: "23", 50: "24", 65: "25", 80: "26", 
    95: "27", 110: "28", 125: "29", 140: "30", 155: "31", 170: "32", 
    185: "33", 200: "34", 215: "35", 230: "36",
    
    // Inner numbers - third ring
    10: "41", 25: "42", 40: "44", 55: "45", 70: "46", 85: "47", 
    100: "48", 115: "49", 130: "50", 145: "51", 160: "52", 175: "53", 
    190: "54", 205: "55", 220: "56",
    
    // Three-digit numbers for gray segments
    7: "101", 22: "121", 37: "141", 52: "101", 67: "104", 82: "105", 
    97: "108", 112: "109", 127: "112", 142: "113", 157: "116", 
    172: "121", 187: "124", 202: "125", 217: "128", 232: "129", 
    247: "132", 262: "133", 277: "136", 292: "141", 307: "144", 
    322: "145", 337: "148", 352: "149", 7: "152", 22: "153", 37: "156"
  };
  
  // Set text properties
  ctx.font = '9px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Calculate middle radius for all labels
  const middleRadius = (innerRadius + outerRadius) / 2;
  
  // Draw each number at the specified angle
  Object.entries(angleToLabelMap).forEach(([angleDeg, label]) => {
    const angleRad = (parseInt(angleDeg) * Math.PI / 180) - Math.PI/2; // Convert to radians, adjust to start from top
    
    // Calculate position
    const x = centerX + middleRadius * Math.cos(angleRad);
    const y = centerY + middleRadius * Math.sin(angleRad);
    
    // Draw the number
    ctx.fillText(label, x, y);
  });
}

// Draw center color wheel
function drawCenterColorWheel(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  colorMap: Record<string, string>
) {
  // Draw the four color quadrants
  const quadrants = [
    { color: 'cool-blue', startAngle: -Math.PI/2, endAngle: 0 },
    { color: 'fiery-red', startAngle: 0, endAngle: Math.PI/2 },
    { color: 'sunshine-yellow', startAngle: Math.PI/2, endAngle: Math.PI },
    { color: 'earth-green', startAngle: Math.PI, endAngle: 3*Math.PI/2 }
  ];
  
  quadrants.forEach(quadrant => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, quadrant.startAngle, quadrant.endAngle);
    ctx.closePath();
    ctx.fillStyle = colorMap[quadrant.color];
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });
  
  // Add a black circle around the wheel
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Draw a position indicator for the person's type with small color wheel
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
  
  // Draw small color wheel indicator
  const miniWheelRadius = 10;
  
  // Draw four color quadrants in mini wheel
  const quadrants = [
    { color: 'cool-blue', startAngle: -Math.PI/2, endAngle: 0 },
    { color: 'fiery-red', startAngle: 0, endAngle: Math.PI/2 },
    { color: 'sunshine-yellow', startAngle: Math.PI/2, endAngle: Math.PI },
    { color: 'earth-green', startAngle: Math.PI, endAngle: 3*Math.PI/2 }
  ];
  
  quadrants.forEach(quadrant => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, miniWheelRadius, quadrant.startAngle, quadrant.endAngle);
    ctx.closePath();
    ctx.fillStyle = quadrant.color === 'fiery-red' ? '#E23D28' : 
                    quadrant.color === 'sunshine-yellow' ? '#F2CF1D' : 
                    quadrant.color === 'earth-green' ? '#42A640' : 
                    '#1C77C3';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });
  
  // Add a black circle around the wheel
  ctx.beginPath();
  ctx.arc(x, y, miniWheelRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw "YOU ARE HERE" label
  ctx.font = 'bold 10px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', x, y - 20);
  
  // No need to draw personality type in center as it's shown in the outer ring
}

// Draw legend and copyright info
function drawLegend(ctx: CanvasRenderingContext2D, centerX: number, canvasHeight: number) {
  const legendY = canvasHeight - 60; // Increased space from bottom
  
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
  ctx.fillStyle = color.startsWith('#') ? hexToRgba(color, opacity) : color;
  ctx.fill();
  
  // Only add stroke if specified
  if (color !== 'transparent') {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

// Convert hex color to rgba
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
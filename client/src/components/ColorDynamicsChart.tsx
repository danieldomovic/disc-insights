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
    canvas.width = 700;
    canvas.height = 550;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the title
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#0D3B66';
    ctx.textAlign = 'center';
    ctx.fillText('The Insights Discovery® Colour Dynamics', canvas.width / 2, 30);
    
    // Define constants
    const colorMap = {
      'cool-blue': '#1C77C3',
      'earth-green': '#42A640',
      'sunshine-yellow': '#F2CF1D',
      'fiery-red': '#E23D28'
    };
    
    const colorLabels = {
      'cool-blue': 'BLUE',
      'earth-green': 'GREEN',
      'sunshine-yellow': 'YELLOW',
      'fiery-red': 'RED'
    };
    
    // Calculate normalized scores for display
    const normalizedScores = normalizeScores(scores);
    
    // Calculate conscious and less conscious personas
    const personaData = calculatePersonaData(normalizedScores);
    
    // Section positions
    const sectionWidth = canvas.width / 3;
    const topMargin = 80;
    const chartHeight = 280;
    
    // Draw section titles
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    
    ctx.fillText('Persona (Conscious)', sectionWidth / 2, topMargin - 30);
    ctx.fillText('Preference Flow', sectionWidth * 1.5, topMargin - 30);
    ctx.fillText('Persona (Less Conscious)', sectionWidth * 2.5, topMargin - 30);
    
    // Draw the three charts
    drawPersonaChart(ctx, 0, topMargin, sectionWidth, chartHeight, personaData.conscious, colorMap, colorLabels, true);
    drawFlowChart(ctx, sectionWidth, topMargin, sectionWidth, chartHeight, personaData.preferenceFlow, colorMap, colorLabels);
    drawPersonaChart(ctx, sectionWidth * 2, topMargin, sectionWidth, chartHeight, personaData.lessConscious, colorMap, colorLabels, false);
    
    // Add footer
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('© Insights Discovery', canvas.width / 2, canvas.height - 20);
    
  }, [scores]);
  
  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
}

// Function to normalize scores for display
function normalizeScores(scores: Record<ColorType, number>) {
  // Ensure scores are between 0-100 and sum to 100
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const factor = total > 0 ? 100 / total : 1;
  
  return {
    'cool-blue': Math.round(scores['cool-blue'] * factor),
    'earth-green': Math.round(scores['earth-green'] * factor),
    'sunshine-yellow': Math.round(scores['sunshine-yellow'] * factor),
    'fiery-red': Math.round(scores['fiery-red'] * factor)
  };
}

// Function to calculate persona data
function calculatePersonaData(normalizedScores: Record<string, number>) {
  // Sort colors by score (descending)
  const sortedColors = Object.entries(normalizedScores)
    .sort(([, a], [, b]) => b - a)
    .map(([color]) => color);
  
  // Calculate 6-point scale values for conscious persona (higher = more preference)
  const consciousValues: Record<string, number> = {
    'cool-blue': calculatePointScale(normalizedScores['cool-blue'], 6),
    'earth-green': calculatePointScale(normalizedScores['earth-green'], 6),
    'sunshine-yellow': calculatePointScale(normalizedScores['sunshine-yellow'], 6),
    'fiery-red': calculatePointScale(normalizedScores['fiery-red'], 6)
  };
  
  // Calculate conscious percentages (relative to 6-point scale)
  const consciousPercentages: Record<string, number> = {
    'cool-blue': Math.round((consciousValues['cool-blue'] / 6) * 100),
    'earth-green': Math.round((consciousValues['earth-green'] / 6) * 100),
    'sunshine-yellow': Math.round((consciousValues['sunshine-yellow'] / 6) * 100),
    'fiery-red': Math.round((consciousValues['fiery-red'] / 6) * 100)
  };
  
  // Calculate less conscious persona (inverse relationship to conscious)
  // Higher conscious value = lower less conscious value
  const lessConsciousValues: Record<string, number> = {
    'cool-blue': calculateInversePointScale(consciousValues['cool-blue'], 6),
    'earth-green': calculateInversePointScale(consciousValues['earth-green'], 6),
    'sunshine-yellow': calculateInversePointScale(consciousValues['sunshine-yellow'], 6),
    'fiery-red': calculateInversePointScale(consciousValues['fiery-red'], 6)
  };
  
  // Calculate less conscious percentages
  const lessConsciousPercentages: Record<string, number> = {
    'cool-blue': Math.round((lessConsciousValues['cool-blue'] / 6) * 100),
    'earth-green': Math.round((lessConsciousValues['earth-green'] / 6) * 100),
    'sunshine-yellow': Math.round((lessConsciousValues['sunshine-yellow'] / 6) * 100),
    'fiery-red': Math.round((lessConsciousValues['fiery-red'] / 6) * 100)
  };
  
  // Calculate preference flow value (balance between most and least preferred colors)
  const preferenceFlowValue = Math.round(
    Math.abs(
      consciousValues[sortedColors[0]] - consciousValues[sortedColors[3]]
    ) / 6 * 100
  );
  
  return {
    conscious: {
      values: consciousValues,
      percentages: consciousPercentages,
      raw: normalizedScores
    },
    lessConscious: {
      values: lessConsciousValues,
      percentages: lessConsciousPercentages
    },
    preferenceFlow: {
      value: preferenceFlowValue,
      topColor: sortedColors[0],
      bottomColor: sortedColors[3]
    }
  };
}

// Convert percentage score to point scale (0-6)
function calculatePointScale(percentage: number, maxPoints: number): number {
  return Number(((percentage / 100) * maxPoints).toFixed(2));
}

// Calculate inverse relationship for less conscious values
function calculateInversePointScale(consciousValue: number, maxPoints: number): number {
  // The relationship is not strictly inverse but weighted to create a realistic pattern
  // Higher conscious scores lead to lower less conscious scores
  const factor = 0.7; // Adjustment factor
  return Number(((maxPoints - consciousValue) * factor).toFixed(2));
}

// Draw persona chart (conscious or less conscious)
function drawPersonaChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  data: { values: Record<string, number>, percentages: Record<string, number> },
  colorMap: Record<string, string>,
  colorLabels: Record<string, string>,
  isConscious: boolean
) {
  const padding = 30;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - 50;
  const barWidth = chartWidth / 4;
  
  // Draw chart background
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + padding, y, chartWidth, chartHeight);
  
  // Draw color labels
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  
  let labelX = x + padding + barWidth / 2;
  Object.keys(colorMap).forEach(color => {
    ctx.fillText(colorLabels[color], labelX, y - 5);
    labelX += barWidth;
  });
  
  // Draw grid lines and axis labels
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  
  // Draw horizontal grid lines (0, 3, 6)
  for (let i = 0; i <= 2; i++) {
    const gridY = y + chartHeight - (i * (chartHeight / 2));
    ctx.beginPath();
    ctx.moveTo(x + padding, gridY);
    ctx.lineTo(x + padding + chartWidth, gridY);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(i * 3 + '', x + padding - 5, gridY + 4);
  }
  
  // Draw vertical grid lines
  for (let i = 0; i <= 4; i++) {
    const gridX = x + padding + (i * barWidth);
    ctx.beginPath();
    ctx.moveTo(gridX, y);
    ctx.lineTo(gridX, y + chartHeight);
    ctx.stroke();
  }
  
  // Draw the bars
  let barX = x + padding;
  Object.entries(colorMap).forEach(([color, hexColor]) => {
    const value = data.values[color];
    const barHeight = (value / 6) * chartHeight;
    const barY = y + chartHeight - barHeight;
    
    // Draw bar
    ctx.fillStyle = hexColor;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw bar border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    barX += barWidth;
  });
  
  // Draw values below chart
  ctx.font = '12px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  
  barX = x + padding + barWidth / 2;
  const valuesY = y + chartHeight + 20;
  Object.entries(data.values).forEach(([color, value]) => {
    ctx.fillText(value.toString(), barX, valuesY);
    barX += barWidth;
  });
  
  // Draw percentages below values
  barX = x + padding + barWidth / 2;
  const percentagesY = valuesY + 20;
  Object.entries(data.percentages).forEach(([color, percentage]) => {
    ctx.fillText(`${percentage}%`, barX, percentagesY);
    barX += barWidth;
  });
}

// Draw preference flow chart
function drawFlowChart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  flowData: { value: number, topColor: string, bottomColor: string },
  colorMap: Record<string, string>,
  colorLabels: Record<string, string>
) {
  const padding = 30;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - 50;
  const centerX = x + padding + (chartWidth / 2);
  
  // Draw chart background
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + padding, y, chartWidth, chartHeight);
  
  // Draw vertical axis
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  
  // Draw horizontal grid lines and axis labels
  for (let i = 0; i <= 4; i++) {
    const gridY = y + (i * (chartHeight / 4));
    const value = 100 - (i * 50);
    
    ctx.beginPath();
    ctx.moveTo(x + padding, gridY);
    ctx.lineTo(x + padding + chartWidth, gridY);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(value + '', x + padding - 5, gridY + 4);
  }
  
  // Draw vertical grid lines for each color
  let gridX = x + padding;
  const barWidth = chartWidth / 4;
  Object.keys(colorLabels).forEach(color => {
    ctx.beginPath();
    ctx.moveTo(gridX, y);
    ctx.lineTo(gridX, y + chartHeight);
    ctx.stroke();
    
    // Draw color labels
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(colorLabels[color], gridX + barWidth/2, y - 5);
    
    gridX += barWidth;
  });
  
  // Draw right edge of grid
  ctx.beginPath();
  ctx.moveTo(x + padding + chartWidth, y);
  ctx.lineTo(x + padding + chartWidth, y + chartHeight);
  ctx.stroke();
  
  // Draw flow arrows for top color (pointing up)
  drawFlowArrow(
    ctx,
    centerX - 40,
    y + chartHeight / 2,
    centerX - 40,
    y + chartHeight / 2 - 40,
    colorMap[flowData.topColor]
  );
  
  // Draw flow arrows for bottom color (pointing down)
  drawFlowArrow(
    ctx,
    centerX + 40,
    y + chartHeight / 2,
    centerX + 40,
    y + chartHeight / 2 + 40,
    colorMap[flowData.bottomColor]
  );
  
  // Draw preference flow value
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText(`${flowData.value}%`, centerX, y + chartHeight + 30);
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
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
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
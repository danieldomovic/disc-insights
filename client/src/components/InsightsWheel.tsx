import { useEffect, useRef } from "react";
import { ColorType } from "@/lib/colorProfiles";

interface InsightsWheelProps {
  scores: Record<ColorType, number>;
  size?: number;
}

const InsightsWheel: React.FC<InsightsWheelProps> = ({ 
  scores, 
  size = 350 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Colors from the Insights Discovery model
    const colors = {
      "fiery-red": "#E23D28",
      "sunshine-yellow": "#F2CF1D",
      "earth-green": "#42A640",
      "cool-blue": "#1C77C3"
    };
    
    // Calculate center point and max radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    
    // Draw outer wheel (gray background)
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#f0f0f0";
    ctx.fill();
    
    // Draw segmented circles with increasing intensity
    const numCircles = 5; // Number of concentric circles
    const angleOffset = Math.PI / 4; // 45 degrees offset
    
    // Draw grid lines (8 sections, 4 quadrants)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI / 4) + angleOffset;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * maxRadius,
        centerY + Math.sin(angle) * maxRadius
      );
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw concentric circles
    for (let i = 1; i <= numCircles; i++) {
      const radius = (maxRadius / numCircles) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Add color quadrants (increasingly saturated as they go outward)
    // Each color gets a 90-degree segment
    const drawQuadrant = (
      color: string, 
      startAngle: number, 
      endAngle: number,
      intensity: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle);
      ctx.closePath();
      
      // Use rgba to control transparency based on intensity
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const alpha = 0.1 + (intensity * 0.7);
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    };
    
    // Draw all four quadrants with slight transparency
    drawQuadrant(colors["cool-blue"], -Math.PI/4, Math.PI/4, 0.2);
    drawQuadrant(colors["fiery-red"], Math.PI/4, 3*Math.PI/4, 0.2);
    drawQuadrant(colors["sunshine-yellow"], 3*Math.PI/4, 5*Math.PI/4, 0.2);
    drawQuadrant(colors["earth-green"], 5*Math.PI/4, 7*Math.PI/4, 0.2);
    
    // Add labels for each color
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#333";
    
    // Positioning for each label (slightly outside the wheel)
    const labelDistance = maxRadius * 1.15;
    ctx.fillText("Cool Blue", centerX, centerY - labelDistance);
    ctx.fillText("Fiery Red", centerX + labelDistance, centerY);
    ctx.fillText("Sunshine Yellow", centerX, centerY + labelDistance);
    ctx.fillText("Earth Green", centerX - labelDistance, centerY);
    
    // Calculate where to place the marker for each color energy
    // Normalize scores relative to a fixed scale (0-50, typical Insights range)
    // or adjust based on the maximum score
    const maxScore = Math.max(
      scores["fiery-red"],
      scores["sunshine-yellow"],
      scores["earth-green"],
      scores["cool-blue"]
    );
    
    const normalizedScores = {
      "fiery-red": Math.min(scores["fiery-red"] / 50, 1),
      "sunshine-yellow": Math.min(scores["sunshine-yellow"] / 50, 1),
      "earth-green": Math.min(scores["earth-green"] / 50, 1),
      "cool-blue": Math.min(scores["cool-blue"] / 50, 1)
    };
    
    // Map scores to positions on the wheel (higher score = closer to the outside)
    // Draw markers for each color energy
    const markerRadius = 8;
    
    // Cool Blue (top)
    const coolBlueY = centerY - (normalizedScores["cool-blue"] * maxRadius * 0.8);
    ctx.beginPath();
    ctx.arc(centerX, coolBlueY, markerRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors["cool-blue"];
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fiery Red (right)
    const fieryRedX = centerX + (normalizedScores["fiery-red"] * maxRadius * 0.8);
    ctx.beginPath();
    ctx.arc(fieryRedX, centerY, markerRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors["fiery-red"];
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Sunshine Yellow (bottom)
    const sunshineYellowY = centerY + (normalizedScores["sunshine-yellow"] * maxRadius * 0.8);
    ctx.beginPath();
    ctx.arc(centerX, sunshineYellowY, markerRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors["sunshine-yellow"];
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Earth Green (left)
    const earthGreenX = centerX - (normalizedScores["earth-green"] * maxRadius * 0.8);
    ctx.beginPath();
    ctx.arc(earthGreenX, centerY, markerRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors["earth-green"];
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Connect the markers to form a quadrilateral
    ctx.beginPath();
    ctx.moveTo(centerX, coolBlueY);
    ctx.lineTo(fieryRedX, centerY);
    ctx.lineTo(centerX, sunshineYellowY);
    ctx.lineTo(earthGreenX, centerY);
    ctx.closePath();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fill the quadrilateral with semi-transparent color
    ctx.fillStyle = "rgba(100, 100, 100, 0.1)";
    ctx.fill();
    
    // Add score indicators
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#333";
    
    // Cool Blue score
    ctx.textAlign = "center";
    ctx.fillText(`${scores["cool-blue"]}%`, centerX, coolBlueY - 20);
    
    // Fiery Red score
    ctx.textAlign = "left";
    ctx.fillText(`${scores["fiery-red"]}%`, fieryRedX + 15, centerY);
    
    // Sunshine Yellow score
    ctx.textAlign = "center";
    ctx.fillText(`${scores["sunshine-yellow"]}%`, centerX, sunshineYellowY + 20);
    
    // Earth Green score
    ctx.textAlign = "right";
    ctx.fillText(`${scores["earth-green"]}%`, earthGreenX - 15, centerY);
    
  }, [scores, size]);
  
  return (
    <div className="flex justify-center">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="max-w-full"
      />
    </div>
  );
};

export default InsightsWheel;
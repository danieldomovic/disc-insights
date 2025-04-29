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

    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define colors
    const rimColors = {
      'REFORMER': '#AF6BAA',
      'DIRECTOR': '#E15736', 
      'MOTIVATOR': '#F28E2B',
      'INSPIRER': '#F1C84C',
      'HELPER': '#D5D95D',
      'SUPPORTER': '#7EB758',
      'COORDINATOR': '#1B8673',
      'OBSERVER': '#4576A8'
    };

    const discColors = {
      'cool-blue': '#1C77C3',
      'earth-green': '#42A640',
      'sunshine-yellow': '#F2CF1D',
      'fiery-red': '#E23D28'
    };

    // Draw outer rim with labels
    const rimWidth = maxRadius * 0.15;
    const types = Object.keys(rimColors);
    const segmentAngle = (2 * Math.PI) / types.length;

    types.forEach((type, i) => {
      const startAngle = -Math.PI/2 + (i * segmentAngle);
      const endAngle = startAngle + segmentAngle;

      // Draw rim segment
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, maxRadius - rimWidth, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = rimColors[type];
      ctx.fill();

      // Add label
      ctx.save();
      const labelAngle = startAngle + segmentAngle/2;
      const labelRadius = maxRadius - rimWidth/2;
      const x = centerX + labelRadius * Math.cos(labelAngle);
      const y = centerY + labelRadius * Math.sin(labelAngle);

      ctx.translate(x, y);
      ctx.rotate(labelAngle + Math.PI/2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(type, 0, 0);
      ctx.restore();
    });

    // Draw concentric circles and segments
    const rings = 4;
    const ringGap = (maxRadius - rimWidth - maxRadius * 0.2) / rings;

    for (let i = 0; i <= rings; i++) {
      const radius = maxRadius - rimWidth - (i * ringGap);

      // Draw circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw segments
      for (let j = 0; j < 8; j++) {
        const angle = -Math.PI/2 + (j * segmentAngle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(angle),
          centerY + radius * Math.sin(angle)
        );
        ctx.stroke();
      }
    }

    // Draw dashed lines at 22.5° intervals
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < 8; i++) {
      const angle = -Math.PI/2 + (i * segmentAngle) + segmentAngle/2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + maxRadius * Math.cos(angle),
        centerY + maxRadius * Math.sin(angle)
      );
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw center DISC wheel
    const centerRadius = maxRadius * 0.2;
    const discSegments = ['cool-blue', 'fiery-red', 'earth-green', 'sunshine-yellow'];
    discSegments.forEach((color, i) => {
      const startAngle = -Math.PI/2 + (i * Math.PI/2);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, centerRadius, startAngle, startAngle + Math.PI/2);
      ctx.closePath();
      ctx.fillStyle = discColors[color];
      ctx.fill();
      ctx.stroke();
    });

    // Add position indicators with actual scores
    const indicator1 = { x: centerX + maxRadius * 0.4, y: centerY - maxRadius * 0.4 };
    const indicator2 = { x: centerX + maxRadius * 0.6, y: centerY - maxRadius * 0.2 };

    [indicator1, indicator2].forEach(pos => {
      // Draw white background circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.stroke();

      // Add mini DISC chart with actual scores
      const miniRadius = 12;
      let totalScore = 0;
      let totalLessConsciousScore = 0;
      
      discSegments.forEach(color => {
        totalScore += scores[color];
        // Calculate less conscious score as inverse of conscious score
        totalLessConsciousScore += (6 - scores[color]) * 0.7; // Using same factor as ColorDynamicsChart
      });

      let currentAngle = -Math.PI/2; // Start at top
      
      // For second indicator (less conscious), make it more transparent
      const isLessConscious = pos === indicator2;
      const opacity = isLessConscious ? 0.6 : 1;
      
      discSegments.forEach(color => {
        let score;
        if (isLessConscious) {
          // Calculate less conscious score
          score = (6 - scores[color]) * 0.7;
          score = score / totalLessConsciousScore;
        } else {
          score = scores[color] / totalScore;
        }
        
        const angle = score * (2 * Math.PI);
        
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.arc(pos.x, pos.y, miniRadius, currentAngle, currentAngle + angle);
        ctx.closePath();
        
        // Set fill style with opacity
        const color_rgb = discColors[color];
        const rgb_values = color_rgb.match(/\d+/g);
        ctx.fillStyle = `rgba(${rgb_values![0]}, ${rgb_values![1]}, ${rgb_values![2]}, ${opacity})`;
        ctx.fill();
        ctx.stroke();
        
        currentAngle += angle;
      });
    });

    // Draw the title
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('The Insights Discovery® 72 Type Wheel', centerX, 40);

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
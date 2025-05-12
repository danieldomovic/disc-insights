import React from 'react';
import { motion } from 'framer-motion';
import { ColorType } from "@/lib/colorProfiles";

interface PersonaChartProps {
  scores: Record<ColorType, number>;
  title?: string;
  isConscious?: boolean;
  rawScores?: Record<ColorType, number>; // For displaying the raw values
}

const PersonaChart: React.FC<PersonaChartProps> = ({
  scores,
  title,
  isConscious = true,
  rawScores
}) => {
  // Standard order for Insights Discovery (BLUE, GREEN, YELLOW, RED)
  const colorOrder: ColorType[] = ['cool-blue', 'earth-green', 'sunshine-yellow', 'fiery-red'];
  
  // Color mapping
  const colors = {
    'fiery-red': '#E23D28',
    'sunshine-yellow': '#F2CF1D',
    'earth-green': '#42A640',
    'cool-blue': '#1C77C3'
  };
  
  // Color labels
  const colorLabels = {
    'fiery-red': 'RED',
    'sunshine-yellow': 'YELLOW',
    'earth-green': 'GREEN',
    'cool-blue': 'BLUE'
  };
  
  // Calculate maximum value (for scale)
  const maxHeight = 6; // As shown in the reference image
  
  // Chart dimensions
  const chartWidth = 300;
  const chartHeight = 240;
  const columnWidth = chartWidth / 4;
  
  // Calculate bar heights as a proportion of the maximum
  const getBarHeight = (value: number) => {
    // Convert percentage to height on the 0-6 scale
    // For the example, 100% would be full height (6 units)
    return (value / 100) * chartHeight;
  };
  
  return (
    <div className="persona-chart mt-4 p-4 bg-white rounded-lg shadow-md flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-3 italic text-center">
        Persona
        <br />
        ({isConscious ? 'Conscious' : 'Less Conscious'})
      </h3>
      
      {/* Color labels row */}
      <div className="flex w-full justify-between mb-2 px-2">
        {colorOrder.map(color => (
          <div key={`label-${color}`} className="text-center font-medium">
            {colorLabels[color]}
          </div>
        ))}
      </div>
      
      {/* Main chart container */}
      <div className="relative" style={{ height: `${chartHeight}px`, width: `${chartWidth}px` }}>
        {/* Chart grid */}
        <div className="absolute inset-0 border-2 border-black">
          {/* Horizontal grid lines */}
          <div className="absolute w-full h-[1px] bg-black" style={{ top: '0%' }}>
            <span className="absolute -left-6 text-sm font-medium">6</span>
          </div>
          <div className="absolute w-full h-[1px] bg-black" style={{ top: '50%' }}>
            <span className="absolute -left-6 text-sm font-medium">3</span>
          </div>
          <div className="absolute w-full h-[1px] bg-black" style={{ bottom: '0%' }}>
            <span className="absolute -left-6 text-sm font-medium">0</span>
          </div>
          
          {/* Vertical grid lines */}
          {colorOrder.map((_, index) => (
            index > 0 && (
              <div 
                key={`grid-${index}`} 
                className="absolute h-full w-[1px] bg-black" 
                style={{ left: `${index * 25}%` }}
              ></div>
            )
          ))}
        </div>
        
        {/* Color bars */}
        {colorOrder.map((color, index) => {
          const value = scores[color];
          const barHeight = getBarHeight(value);
          
          return (
            <motion.div
              key={`bar-${color}`}
              initial={{ height: 0 }}
              animate={{ height: barHeight }}
              transition={{ duration: 0.7, delay: 0.15 * index }}
              className="absolute bottom-0"
              style={{
                backgroundColor: colors[color],
                width: columnWidth,
                left: `${index * 25}%`
              }}
            />
          );
        })}
      </div>
      
      {/* Values row */}
      <div className="flex w-full mt-0">
        {colorOrder.map((color, index) => {
          const percentage = scores[color];
          const raw = rawScores ? rawScores[color].toFixed(2) : '';
          
          return (
            <div 
              key={`value-${color}`} 
              className="text-center border-2 border-black py-1 text-sm"
              style={{ width: `${100/4}%` }}
            >
              {raw && <div className="font-bold">{raw}</div>}
              <div className="text-gray-700">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonaChart;
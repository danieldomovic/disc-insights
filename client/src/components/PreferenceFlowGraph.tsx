import React from 'react';
import { motion } from 'framer-motion';

interface ColorScore {
  'fiery-red': number;
  'sunshine-yellow': number;
  'earth-green': number;
  'cool-blue': number;
}

interface PreferenceFlowGraphProps {
  consciousScores: ColorScore;
  unconsciousScores: ColorScore;
}

const PreferenceFlowGraph: React.FC<PreferenceFlowGraphProps> = ({ 
  consciousScores, 
  unconsciousScores 
}) => {
  // Color configs with proper Insights Discovery colors
  const colors = {
    'fiery-red': '#E23D28',
    'sunshine-yellow': '#F2CF1D',
    'earth-green': '#42A640',
    'cool-blue': '#1C77C3'
  };
  
  // Colors for the graph headers
  const colorHeaders = {
    'cool-blue': 'BLUE',
    'earth-green': 'GREEN',
    'sunshine-yellow': 'YELLOW',
    'fiery-red': 'RED'
  };

  // Standard order for Insights Discovery (from left to right in chart)
  const standardOrder = ['cool-blue', 'earth-green', 'sunshine-yellow', 'fiery-red'];

  // Calculate total flow - the overall movement between conscious and unconscious profiles
  const calculateTotalFlow = () => {
    let totalFlow = 0;
    for (const color of Object.keys(consciousScores) as Array<keyof ColorScore>) {
      const diff = Math.abs(consciousScores[color] - unconsciousScores[color]);
      totalFlow += diff;
    }
    return (totalFlow / 2).toFixed(1); // Divide by 2 as per Insights Discovery methodology
  };

  // Calculate the midpoint line position (where 0 should be on the chart)
  const calculateMidpoint = () => {
    // For this visualization, midpoint is at 0 in a -100 to 100 scale
    // where -100 represents complete unconscious dominance
    // and 100 represents complete conscious dominance
    return 100; // Scale reference point (100% on the midpoint line)
  };

  const totalFlowValue = calculateTotalFlow();
  const chartHeight = 200; // Height of the chart in pixels 
  const chartWidth = 160; // Width of the chart in pixels
  const columnWidth = chartWidth / 4; // Width of each color column
  
  return (
    <div className="preference-flow-graph p-4 bg-white rounded-lg shadow-md flex flex-col items-center">
      {/* Color headers - showing above the chart */}
      <div className="flex mb-1 text-xs font-bold" style={{ width: `${chartWidth}px` }}>
        {standardOrder.map((color, index) => (
          <div 
            key={`header-${color}`} 
            className="flex-1 text-center"
          >
            {colorHeaders[color as keyof typeof colorHeaders]}
          </div>
        ))}
      </div>
      
      {/* Main chart container */}
      <div className="relative" style={{ height: `${chartHeight}px`, width: `${chartWidth}px` }}>
        {/* Chart grid */}
        <div className="absolute inset-0 border border-black">
          {/* Horizontal grid lines (0, 50, 100 marks) and 3 horizontal grid lines */}
          <div className="absolute w-full h-[1px] bg-black" style={{ top: '0%' }}></div>
          <div className="absolute w-full h-[1px] bg-gray-300" style={{ top: '25%' }}></div>
          <div className="absolute w-full h-[1px] bg-black" style={{ top: '50%' }}></div>
          <div className="absolute w-full h-[1px] bg-gray-300" style={{ top: '75%' }}></div>
          <div className="absolute w-full h-[1px] bg-black" style={{ top: '100%' }}></div>
          
          {/* Y-axis labels */}
          <div className="absolute -left-8 text-xs" style={{ top: '0%', transform: 'translateY(-50%)' }}>100</div>
          <div className="absolute -left-6 text-xs" style={{ top: '25%', transform: 'translateY(-50%)' }}>50</div>
          <div className="absolute -left-6 text-xs" style={{ top: '50%', transform: 'translateY(-50%)' }}>0</div>
          <div className="absolute -left-6 text-xs" style={{ top: '75%', transform: 'translateY(-50%)' }}>50</div>
          <div className="absolute -left-8 text-xs" style={{ top: '100%', transform: 'translateY(-50%)' }}>100</div>
          
          {/* Vertical grid lines (dividing the four color columns) */}
          {standardOrder.map((_, index) => (
            <div 
              key={`grid-${index}`} 
              className="absolute h-full w-[1px] bg-black" 
              style={{ left: `${(index+1) * 25}%` }}
            ></div>
          ))}
        </div>
        
        {/* Color columns */}
        {standardOrder.map((color, index) => {
          const key = color as keyof ColorScore;
          const conscValue = consciousScores[key];
          const uncValue = unconsciousScores[key];
          const diff = conscValue - uncValue;
          
          // For positive diff (conscious > unconscious), draw above the center line
          // For negative diff (unconscious > conscious), draw below the center line
          const isPositive = diff > 0;
          const absValue = Math.abs(diff);
          const barHeight = (absValue / 100) * (chartHeight / 2); // Half of chart height for each direction
          
          return (
            <motion.div
              key={`column-${color}`}
              initial={{ height: 0 }}
              animate={{ height: barHeight }}
              transition={{ duration: 0.7, delay: 0.2 * index }}
              className="absolute"
              style={{
                backgroundColor: colors[key],
                width: columnWidth,
                left: `${index * 25}%`,
                bottom: isPositive ? '50%' : `calc(50% - ${barHeight}px)`,
                top: isPositive ? `calc(50% - ${barHeight}px)` : 'auto',
              }}
            />
          );
        })}
      </div>
      
      {/* Total flow value */}
      <div className="mt-1 border border-black py-1 text-center" style={{ width: `${chartWidth}px` }}>
        <span className="text-sm">{totalFlowValue}%</span>
      </div>
    </div>
  );
};

export default PreferenceFlowGraph;
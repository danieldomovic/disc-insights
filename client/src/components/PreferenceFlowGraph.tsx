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
  // Color configs
  const colors = {
    'fiery-red': '#E63946',
    'sunshine-yellow': '#FFBE0B',
    'earth-green': '#57A773',
    'cool-blue': '#457B9D'
  };

  // Get the flow between conscious and unconscious
  const calculateFlow = () => {
    const flowData = [];
    
    // Create flow data for each color
    for (const color of Object.keys(consciousScores) as Array<keyof ColorScore>) {
      const consciousValue = consciousScores[color];
      const unconsciousValue = unconsciousScores[color];
      const difference = unconsciousValue - consciousValue;
      
      flowData.push({
        color,
        colorHex: colors[color],
        consciousValue,
        unconsciousValue,
        difference,
        direction: difference >= 0 ? 'increase' : 'decrease',
        absChange: Math.abs(difference)
      });
    }
    
    // Sort from highest change to lowest
    return flowData.sort((a, b) => b.absChange - a.absChange);
  };

  const flowData = calculateFlow();

  return (
    <div className="preference-flow-graph mt-6 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Preference Flow</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This graph shows how your preferences flow between your conscious and unconscious personas.
      </p>
      
      {flowData.map((item, index) => (
        <div key={item.color} className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="font-medium" style={{ color: item.colorHex }}>
              {item.color.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
            <span className="text-sm font-semibold">
              {item.difference > 0 ? '+' : ''}{item.difference}%
            </span>
          </div>
          
          <div className="relative h-8 w-full">
            {/* Base bar */}
            <div 
              className="absolute h-6 rounded-md transition-all duration-500 ease-out"
              style={{ 
                backgroundColor: `${item.colorHex}33`, // Light version of the color
                width: '100%'
              }}
            />
            
            {/* Conscious marker */}
            <motion.div 
              initial={{ x: 0 }}
              animate={{ x: `${item.consciousValue}%` }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="absolute h-8 flex items-center"
              style={{ 
                left: `0%`
              }}
            >
              <div className="h-8 w-2 bg-gray-700 rounded-sm" />
              <div className="ml-2 -mt-8 text-xs font-medium">
                Conscious {item.consciousValue}%
              </div>
            </motion.div>
            
            {/* Unconscious marker */}
            <motion.div 
              initial={{ x: 0 }}
              animate={{ x: `${item.unconsciousValue}%` }}
              transition={{ duration: 0.5, delay: 0.1 * index + 0.2 }}
              className="absolute h-8 flex items-center"
              style={{ 
                left: `0%`
              }}
            >
              <div className="h-8 w-2 bg-black rounded-sm" />
              <div className="ml-2 mt-8 text-xs font-medium">
                Unconscious {item.unconsciousValue}%
              </div>
            </motion.div>
            
            {/* Flow arrow */}
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: `${item.absChange}%`, 
                opacity: 1 
              }}
              transition={{ duration: 0.7, delay: 0.1 * index + 0.4 }}
              className="absolute h-2 top-[10px]"
              style={{ 
                backgroundColor: item.colorHex,
                left: item.direction === 'increase' 
                  ? `${item.consciousValue}%` 
                  : `${item.unconsciousValue}%`
              }}
            >
              <div 
                className="absolute -right-2 top-[-3px]"
                style={{ 
                  display: item.direction === 'increase' ? 'block' : 'none',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent', 
                  borderLeft: `8px solid ${item.colorHex}`
                }}
              />
              <div 
                className="absolute -left-2 top-[-3px]"
                style={{ 
                  display: item.direction === 'decrease' ? 'block' : 'none',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent', 
                  borderRight: `8px solid ${item.colorHex}`
                }}
              />
            </motion.div>
          </div>
        </div>
      ))}
      
      <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-200">
        <h4 className="text-sm font-semibold mb-2">What This Means</h4>
        <p className="text-sm text-muted-foreground">
          Your unconscious preferences reveal your instinctive behaviors under pressure, 
          while your conscious preferences show how you choose to present yourself. 
          The gaps between them can highlight areas of potential growth or stress.
        </p>
      </div>
    </div>
  );
};

export default PreferenceFlowGraph;
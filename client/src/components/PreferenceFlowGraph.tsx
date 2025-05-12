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

  // Color labels for better readability
  const colorLabels = {
    'fiery-red': 'Fiery Red',
    'sunshine-yellow': 'Sunshine Yellow',
    'earth-green': 'Earth Green',
    'cool-blue': 'Cool Blue'
  };

  // Standard order for Insights Discovery (clockwise from top-right)
  const standardOrder = ['fiery-red', 'sunshine-yellow', 'earth-green', 'cool-blue'];

  // Format the flow data for rendering
  const getFlowData = () => {
    return standardOrder.map(color => {
      const key = color as keyof ColorScore;
      const conscValue = consciousScores[key];
      const uncValue = unconsciousScores[key];
      const flowValue = uncValue - conscValue;
      
      return {
        color: key,
        label: colorLabels[key],
        colorHex: colors[key],
        conscious: conscValue,
        unconscious: uncValue,
        flow: flowValue,
        absFlow: Math.abs(flowValue)
      };
    });
  };

  const flowData = getFlowData();
  const maxValue = 100; // Max value for scale (percentages)
  const barHeight = 20;
  const barGap = 8;

  return (
    <div className="preference-flow-graph mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-3">Preference Flow</h3>
      <p className="text-sm text-muted-foreground mb-6">
        This graph shows the relationships between your conscious self (how you adapt) and your less conscious self (your instinctive behaviors).
      </p>
      
      <div className="flex justify-between mb-2 px-1">
        <div className="w-1/3 text-center font-medium text-sm">Conscious Self</div>
        <div className="w-1/3 text-center font-medium text-sm">Flow</div>
        <div className="w-1/3 text-center font-medium text-sm">Less Conscious Self</div>
      </div>
      
      <div className="border-t border-b border-gray-200 py-4">
        {flowData.map((item, index) => (
          <div key={item.color} className="mb-8">
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.colorHex }}></div>
              <span className="font-medium">{item.label}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Conscious bar (left) */}
              <div className="relative h-10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.conscious / maxValue) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="absolute top-0 h-8 rounded-sm flex items-center justify-end pr-1"
                  style={{ 
                    backgroundColor: item.colorHex,
                    right: 0
                  }}
                >
                  <span className="text-white text-xs font-bold drop-shadow-sm">
                    {item.conscious}%
                  </span>
                </motion.div>
              </div>
              
              {/* Flow indicator (middle) */}
              <div className="flex justify-center items-center h-10">
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 * index }}
                    className="flex flex-col items-center"
                  >
                    <span className="font-bold" style={{ color: item.colorHex }}>
                      {item.flow > 0 ? `+${item.flow}` : item.flow}%
                    </span>
                    <div className="flex items-center justify-center mt-1">
                      {item.flow !== 0 && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '40px' }}
                          transition={{ duration: 0.5, delay: 0.4 * index }}
                          className="h-[2px]"
                          style={{ backgroundColor: item.colorHex }}
                        >
                          <div 
                            className="absolute"
                            style={{ 
                              right: item.flow > 0 ? '-6px' : 'auto',
                              left: item.flow < 0 ? '-6px' : 'auto',
                              top: '-3px',
                              borderTop: '4px solid transparent',
                              borderBottom: '4px solid transparent',
                              borderLeft: item.flow > 0 ? `6px solid ${item.colorHex}` : 'none',
                              borderRight: item.flow < 0 ? `6px solid ${item.colorHex}` : 'none'
                            }}
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Unconscious bar (right) */}
              <div className="relative h-10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.unconscious / maxValue) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="absolute top-0 h-8 rounded-sm flex items-center pl-1"
                  style={{ backgroundColor: item.colorHex }}
                >
                  <span className="text-white text-xs font-bold drop-shadow-sm">
                    {item.unconscious}%
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-slate-50 rounded border border-slate-200">
        <h4 className="text-sm font-semibold mb-2">Understanding Preference Flow</h4>
        <p className="text-sm text-muted-foreground">
          The Preference Flow shows the relationship between your Conscious Self (how you adapt to your environment) 
          and your Less Conscious Self (your instinctive behaviors under pressure). The arrows indicate the 
          direction and magnitude of change between these two aspects of your personality.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Significant differences between your conscious and less conscious preferences may indicate 
          areas where you're adapting your natural style to meet external demands or expectations.
        </p>
      </div>
    </div>
  );
};

export default PreferenceFlowGraph;
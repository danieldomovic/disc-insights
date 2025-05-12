import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import PersonaChart from '@/components/PersonaChart';
import PreferenceFlowGraph from '@/components/PreferenceFlowGraph';
import { ColorType } from '@/lib/colorProfiles';

export default function TestScoring() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Test data with 0-6 scale ratings
  const testAnswers = [
    // Question 1 - BLUE (L=0), GREEN (M=6), YELLOW (2), RED (4)
    {
      questionId: 1,
      selectedColor: 'cool-blue',
      rating: 'L',
      isConsciousResponse: true
    },
    {
      questionId: 1,
      selectedColor: 'earth-green',
      rating: 'M',
      isConsciousResponse: true
    },
    {
      questionId: 1,
      selectedColor: 'sunshine-yellow',
      rating: '2',
      isConsciousResponse: true
    },
    {
      questionId: 1,
      selectedColor: 'fiery-red',
      rating: '4',
      isConsciousResponse: true
    },
    // Question 2 - BLUE (3), GREEN (5), YELLOW (L=0), RED (M=6)
    {
      questionId: 2,
      selectedColor: 'cool-blue',
      rating: '3',
      isConsciousResponse: true
    },
    {
      questionId: 2,
      selectedColor: 'earth-green',
      rating: '5',
      isConsciousResponse: true
    },
    {
      questionId: 2,
      selectedColor: 'sunshine-yellow',
      rating: 'L',
      isConsciousResponse: true
    },
    {
      questionId: 2,
      selectedColor: 'fiery-red',
      rating: 'M',
      isConsciousResponse: true
    },
    // Question 3 - BLUE (5), GREEN (L=0), YELLOW (M=6), RED (3)
    {
      questionId: 3,
      selectedColor: 'cool-blue',
      rating: '5',
      isConsciousResponse: true
    },
    {
      questionId: 3,
      selectedColor: 'earth-green',
      rating: 'L',
      isConsciousResponse: true
    },
    {
      questionId: 3,
      selectedColor: 'sunshine-yellow',
      rating: 'M',
      isConsciousResponse: true
    },
    {
      questionId: 3,
      selectedColor: 'fiery-red',
      rating: '3',
      isConsciousResponse: true
    }
  ];

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/quiz/submit', {
        answers: testAnswers
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        console.log('Test results:', data);
      } else {
        console.error('Failed to submit test data');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate raw scores - converting percentages to 0-6 scale for Insights Discovery format
  const calculateRawScores = (percentages: Record<ColorType, number>) => {
    const rawScores: Record<ColorType, number> = {} as Record<ColorType, number>;
    if (!percentages) return rawScores;
    
    for (const [color, percentage] of Object.entries(percentages) as [ColorType, number][]) {
      // Convert percentage (0-100) to the 0-6 scale
      rawScores[color] = (percentage / 100) * 6;
    }
    return rawScores;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">New Scoring System Test</h1>
      <p className="mb-4">
        This page tests the new 0-6 scale scoring system with sample quiz answers.
        The test will submit answers with different combinations of ratings (L=0, M=6, and numeric 1-5).
      </p>

      <Button 
        onClick={runTest}
        disabled={loading}
        className="mb-6"
      >
        {loading ? 'Running Test...' : 'Run Scoring Test'}
      </Button>

      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Test Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conscious Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonaChart 
                  scores={result.scores} 
                  isConscious={true}
                  rawScores={calculateRawScores(result.scores)}
                />
                
                <div className="mt-4">
                  <h3 className="font-bold">Raw Scores:</h3>
                  <ul>
                    <li>Cool Blue: {result.scores['cool-blue']}%</li>
                    <li>Earth Green: {result.scores['earth-green']}%</li>
                    <li>Sunshine Yellow: {result.scores['sunshine-yellow']}%</li>
                    <li>Fiery Red: {result.scores['fiery-red']}%</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            {result.unconsciousScores && (
              <Card>
                <CardHeader>
                  <CardTitle>Unconscious Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <PersonaChart 
                    scores={result.unconsciousScores} 
                    isConscious={false}
                    rawScores={calculateRawScores(result.unconsciousScores)}
                  />
                  
                  <div className="mt-4">
                    <h3 className="font-bold">Raw Scores:</h3>
                    <ul>
                      <li>Cool Blue: {result.unconsciousScores['cool-blue']}%</li>
                      <li>Earth Green: {result.unconsciousScores['earth-green']}%</li>
                      <li>Sunshine Yellow: {result.unconsciousScores['sunshine-yellow']}%</li>
                      <li>Fiery Red: {result.unconsciousScores['fiery-red']}%</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preference Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <PreferenceFlowGraph 
                consciousScores={result.scores} 
                unconsciousScores={result.unconsciousScores || result.scores}
              />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Raw Response Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface TestPlanGeneratorNodeData {
  isFeatureReady: boolean;
}

export default function TestPlanGeneratorNode({ data }: NodeProps<TestPlanGeneratorNodeData>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const featureRes = await fetch('http://localhost:8000/data/feature', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!featureRes.ok) {
        throw new Error('Failed to fetch Figma data from server');
      }

      const featureData = await featureRes.json();

      const response = await fetch('http://localhost:8000/generate-test-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            feature_list: featureData
          }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Test plan generated:', data);
      // TODO: Handle the generated test plan data
    } catch (err) {
      console.error('Error generating test plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate test plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded shadow w-96 space-y-3">
      <div className="text-lg font-semibold text-gray-800 mb-2">🤖 LLM Test Plan Generator</div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="ml-2">
            <div className="text-gray-500">Generates test plans using LLM</div>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !data.isFeatureReady}
          className={`mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Generating...' : 'Generate Test Plan'}
        </button>
        {!data.isFeatureReady && (
          <div className="mt-2 text-gray-500 text-sm">
            Waiting for feature representation...
          </div>
        )}
        {error && (
          <div className="mt-2 text-red-500 text-sm whitespace-pre-line">
            {error}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
} 
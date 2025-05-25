import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface TestPlanGeneratorNodeData {
  isFeatureReady: boolean;
  onTestPlanReady: (ready: boolean) => void;
}

interface TestItem {
  Types_of_Testing: string;
  Test_Approach: string;
  Acceptance_Criteria: string[];
}

interface TestCase {
  Objective: string;
  Scope: string;
  Test_Items: TestItem;
}

interface TestPlan {
  test_plan: TestCase[];
}

export default function TestPlanGeneratorNode({ data }: NodeProps<TestPlanGeneratorNodeData>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

      const planData = await response.json();
      setTestPlan(planData);
      setIsGenerated(true);
      data.onTestPlanReady(true);
    } catch (err) {
      console.error('Error generating test plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate test plan');
      data.onTestPlanReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch('http://localhost:8000/data/plan', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to download test plan');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-plan.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download test plan');
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
        {isGenerated && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1">
              <p className="text-sm text-green-600">
                ✓ Test plan generated successfully
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded flex items-center gap-1"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        )}
        {showPreview && testPlan && (
          <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2 select-text bg-gray-900 text-gray-100 rounded-lg p-4  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {testPlan.test_plan.map((testCase, index) => (
              <div key={index} className="border border-gray-700 rounded p-3 bg-gray-800">
                <h3 className="font-semibold text-blue-400">Objective {index + 1}</h3>
                <p className="text-sm mt-1 text-gray-200">{testCase.Objective}</p>
                
                <h4 className="font-medium text-gray-300 mt-2">Scope</h4>
                <p className="text-sm mt-1 text-gray-200">{testCase.Scope}</p>
                
                <h4 className="font-medium text-gray-300 mt-2">Test Items</h4>
                <div className="text-sm mt-1">
                  <p><span className="font-medium text-gray-300">Types of Testing:</span> <span className="text-gray-200">{testCase.Test_Items.Types_of_Testing}</span></p>
                  <p className="mt-1"><span className="font-medium text-gray-300">Test Approach:</span> <span className="text-gray-200">{testCase.Test_Items.Test_Approach}</span></p>
                  
                  <h5 className="font-medium text-gray-300 mt-2">Acceptance Criteria:</h5>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-gray-200">
                    {testCase.Test_Items.Acceptance_Criteria.map((criteria, idx) => (
                      <li key={idx} className="text-sm">{criteria}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
} 
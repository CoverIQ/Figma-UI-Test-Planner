import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface TestCaseGeneratorNodeData {
  isTestPlanReady: boolean;
}

interface BDDDescription {
  Scenario: string;
  Given: string;
  And: string;
  When: string;
  Then: string;
}

interface Objective {
  feature: string;
  bdd_style_descriptions: BDDDescription[];
}

interface TestCases {
  [key: string]: Objective;
}

export default function TestCaseGeneratorNode({ data }: NodeProps<TestCaseGeneratorNodeData>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [testCases, setTestCases] = useState<TestCases | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const planRes = await fetch('http://localhost:8000/data/plan', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!planRes.ok) {
        throw new Error('Failed to fetch test plan from server');
      }

      const planData = await planRes.json();

      const response = await fetch('http://localhost:8000/generate-test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_plan: planData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTestCases(data);
      setIsGenerated(true);
    } catch (err) {
      console.error('Error generating test cases:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate test cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch('http://localhost:8000/data/cases', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to download test cases');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-cases.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download test cases');
    }
  };

  return (
    <div className="p-4 bg-white border rounded shadow w-96 space-y-3">
      <div className="text-lg font-semibold text-gray-800 mb-2">📄 Gherkin Test Case Generator</div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="ml-2">
            <div className="text-gray-500">Generates Gherkin-style test cases</div>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !data.isTestPlanReady}
          className={`mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Generating...' : 'Generate Test Cases'}
        </button>
        {!data.isTestPlanReady && (
          <div className="mt-2 text-gray-500 text-sm">
            Waiting for test plan...
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
                ✓ Test cases generated successfully
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
        {showPreview && testCases && (
          <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2 select-text bg-gray-900 text-gray-100 rounded-lg p-4  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {Object.entries(testCases).map(([objectiveKey, objective]) => (
              <div key={objectiveKey} className="border border-gray-700 rounded p-3 bg-gray-800">
                <h3 className="font-bold text-orange-400">{objectiveKey}: </h3>
                <p className="mt-1 text-gray-300">{objective.feature}</p>
                
                <div className="mt-3 space-y-4">
                  {objective.bdd_style_descriptions.map((description, index) => (
                    <div key={index} className="border-t border-gray-700 pt-3">
                      <div className="border-t border-gray-700 pb-2"><span className="font-medium text-orange-400 mb-2">Scenario: </span><span className="text-gray-200">{description.Scenario}</span></div>
                      <div className="space-y-2">
                        <p><span className="font-medium text-green-400">Given:</span> <span className="text-gray-200">{description.Given}</span></p>
                        <p><span className="font-medium text-green-400">And:</span> <span className="text-gray-200">{description.And}</span></p>
                        <p><span className="font-medium text-blue-400">When:</span> <span className="text-gray-200">{description.When}</span></p>
                        <p><span className="font-medium text-purple-400">Then:</span> <span className="text-gray-200">{description.Then}</span></p>
                      </div>
                    </div>
                  ))}
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
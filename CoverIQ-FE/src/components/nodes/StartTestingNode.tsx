import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface StartTestingNodeData {
  isTestCasesReady: boolean;
}

export default function StartTestingNode({ data }: NodeProps<StartTestingNodeData>) {
  const [error, setError] = useState<string | null>(null);

  const handleDownloadFeature = async () => {
    setError(null); // Clear any existing error
    try {
      const response = await fetch('http://localhost:8000/data/cases/feature', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to download feature files');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-cases.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download feature files');
    }
  };

  return (
    <div className="p-4 bg-white border rounded shadow w-96 space-y-3">
      <div className="text-lg font-semibold text-gray-800 mb-2">🚀 Start Testing</div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="ml-2">
            <div className="text-gray-500">Download test cases and start testing</div>
          </div>
        </div>
        {!data.isTestCasesReady && (
          <div className="mt-2 text-gray-500 text-sm">
            Waiting for test cases...
          </div>
        )}
        {error && (
          <div className="mt-2 text-red-500 text-sm whitespace-pre-line">
            {error}
          </div>
        )}
        {data.isTestCasesReady && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1">
              <p className="text-sm text-green-600">
                ✓ Test cases are ready
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadFeature}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Feature File
              </button>
            </div>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
    </div>
  );
} 
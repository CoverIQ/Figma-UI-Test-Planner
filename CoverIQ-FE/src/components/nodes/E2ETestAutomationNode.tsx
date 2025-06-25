import React, { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import config from '../../config.json'

export default function E2ETestAutomationNode() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getGeminiKey = () => localStorage.getItem('GEMINI_API_KEY') || config.GEMINI_API_KEY;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setError(null);
      setSuccess(null);
      setIsGenerated(false);
    } else {
      setSelectedFiles([]);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select at least one .feature file to upload.');
      setSuccess(null);
      return;
    }
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file));
      const res = await fetch(`${config.BACKEND_URL}/upload-feature-file`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Failed to upload .feature file(s)');
      }
      const data = await res.json();
      setSuccess(data.message || 'Feature file(s) uploaded successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload .feature file(s)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Step 1: Fetch feature_text from backend
      const featureRes = await fetch(`${config.BACKEND_URL}/data/cucumber`);
      if (!featureRes.ok) {
        throw new Error('Failed to fetch uploaded feature file(s) from server');
      }
      const featureText = await featureRes.json();
      if (!featureText || Object.keys(featureText).length === 0) {
        throw new Error('No feature file(s) found on server. Please upload first.');
      }
      // Step 2: Send feature_text to generate-test-code
      const res = await fetch(`${config.BACKEND_URL}/generate-test-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feature_text: featureText,
          gemini_key: getGeminiKey(),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to generate E2E testing code');
      }
      // No need to set code, just mark as generated
      setIsGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate E2E testing code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      const res = await fetch(`${config.BACKEND_URL}/data/code/py`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/zip' },
      });
      if (!res.ok) {
        throw new Error('Failed to download code zip');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'e2e-test-code.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download code zip');
    }
  };

  return (
    <div className="p-4 bg-white border rounded shadow w-96 space-y-3">
      <div className="text-lg font-semibold text-gray-800 mb-2">🧪 E2E Test Automation</div>
      <div className="text-gray-500 mb-2">Automated Selenium webdriver code generation for Cucumber feature files.</div>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept=".feature"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFiles.length > 0 && (
          <ul className="text-xs text-gray-600 mb-1 list-disc list-inside">
            {selectedFiles.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        )}
        <button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload .feature File(s)'}
        </button>
        {success && <div className="text-green-600 text-sm whitespace-pre-line">{success}</div>}
        {error && <div className="text-red-500 text-sm whitespace-pre-line">{error}</div>}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedFiles.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate E2E Testing Code'}
        </button>
        {isGenerated && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleDownloadZip}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Code (ZIP)
            </button>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
} 
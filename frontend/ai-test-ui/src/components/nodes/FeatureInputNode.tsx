import { Handle, Position } from 'reactflow';
import { useState } from 'react';

interface FigmaData {
  file_key: string;
  figma_data: {
    name: string;
    lastModified: string;
    thumbnailUrl: string;
    document: Record<string, unknown>;
    components: Record<string, unknown>;
    schemaVersion: number;
    styles: Record<string, unknown>;
  };
}

interface FeatureInputNodeProps {
  data: {
    figmaUrl: string;
    featureDesc: string;
    onFigmaUrlChange: (url: string) => void;
    onFeatureDescChange: (desc: string) => void;
    onSubmit: () => void;
  };
}

export default function FeatureInputNode({ data }: FeatureInputNodeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState<FigmaData | null>(null);
  const [localFigmaUrl, setLocalFigmaUrl] = useState(data.figmaUrl);
  const [localFeatureDesc, setLocalFeatureDesc] = useState(data.featureDesc);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const validateFigmaUrl = (url: string): boolean => {
    const figmaUrlPattern = /^https:\/\/www\.figma\.com\/(file|design)\/[a-zA-Z0-9]+/;
    return figmaUrlPattern.test(url);
  };

  const handleFigmaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setLocalFigmaUrl(newUrl);
    data.onFigmaUrlChange(newUrl);
    setError(null);
  };

  const handleFeatureDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDesc = e.target.value;
    setLocalFeatureDesc(newDesc);
    data.onFeatureDescChange(newDesc);
  };

  const handleExtract = async () => {
    if (!localFigmaUrl.trim()) {
      setError('Please enter a Figma URL');
      return;
    }

    if (!validateFigmaUrl(localFigmaUrl)) {
      setError('Invalid Figma URL format. URL should be like: https://www.figma.com/file/... or https://www.figma.com/design/...');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/parse-figma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figma_url: localFigmaUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 403) {
          throw new Error('Access denied. Please check that:\n1. Your Figma access token is correct\n2. You have access to this Figma file\n3. The file is shared with you');
        }
        throw new Error(errorData.detail || 'Failed to extract Figma data');
      }

      const data = await res.json();
      setExtractedData(data);
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract Figma data. Please check your URL and API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!extractedData) return;

    const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `figma-data-${extractedData.file_key}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!extractedData) return;

    setIsGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch('http://localhost:8000/get-feature-representation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figma_data: extractedData,
          feature_description: localFeatureDesc
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to generate feature representation');
      }

      const result = await res.json();
      data.onSubmit();
    } catch (err) {
      console.error('Generation error:', err);
      setGenerationError(err instanceof Error ? err.message : 'Failed to generate feature representation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded shadow w-96 space-y-3">
      <div>
        <label className="text-sm font-medium block">🎨 Figma Frame URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            className={`mt-1 w-full p-2 border rounded text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 ${
              error ? 'border-red-500' : ''
            }`}
            placeholder="https://www.figma.com/file/..."
            value={localFigmaUrl}
            onChange={handleFigmaUrlChange}
          />
          <button
            onClick={handleExtract}
            disabled={isLoading}
            className="mt-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded disabled:opacity-50"
          >
            {isLoading ? 'Extracting...' : 'Extract'}
          </button>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500 whitespace-pre-line">{error}</p>
        )}
      </div>

      {extractedData && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-sm text-green-600">
              ✓ Data extracted successfully
            </p>
            <p className="text-xs text-gray-500">
              File: {extractedData.figma_data.name}
            </p>
          </div>
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
      )}

      <div>
        <label className="text-sm font-medium block">📝 Feature Description (Optional)</label>
        <textarea
          className="mt-1 w-full p-2 border rounded text-sm resize-none overflow-y-scroll h-32 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          placeholder="Enter feature description..."
          value={localFeatureDesc}
          onChange={handleFeatureDescChange}
        />
      </div>

      {generationError && (
        <p className="text-sm text-red-500 whitespace-pre-line">{generationError}</p>
      )}

      <button
        onClick={handleGenerate}
        disabled={!extractedData || isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating Feature Representation...' : extractedData ? 'Generate Feature Representation' : 'Extract Figma Data First'}
      </button>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

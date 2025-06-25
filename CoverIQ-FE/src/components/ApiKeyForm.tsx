import React, { useState } from 'react';

interface ApiKeyFormProps {
  onSave: (figmaToken: string, geminiKey: string) => void;
}

export default function ApiKeyForm({ onSave }: ApiKeyFormProps) {
  const [figmaToken, setFigmaToken] = useState(localStorage.getItem('FIGMA_ACCESS_TOKEN') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(figmaToken, geminiKey);
    setIsExpanded(false);
  };

  return (
    <div className='text-right'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-80 text-center"
      >
        {isExpanded ? 'Hide API Keys' : 'Configure API Keys'}
      </button>
      
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-2 p-4 bg-white rounded shadow-lg w-80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block text-gray-700">
                Figma Access Token
              </label>
              <input
                type="password"
                value={figmaToken}
                onChange={(e) => setFigmaToken(e.target.value)}
                className="mt-1 w-full p-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Enter Figma access token"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block text-gray-700">
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="mt-1 w-full p-2 border rounded text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Enter Gemini API key"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Save API Keys
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 
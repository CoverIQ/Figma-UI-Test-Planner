import { useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  type Edge,
  type Node,
  MarkerType,
} from 'reactflow';

import 'reactflow/dist/style.css';
import FeatureInputNode from './components/nodes/FeatureInputNode';
import ApiKeyForm from './components/ApiKeyForm';

const nodeTypes = {
  featureInput: FeatureInputNode,
};

const initialEdges: Edge[] = [
  { 
    id: 'e1-4', 
    source: '1', 
    target: '4',
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5',
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6',
    style: { strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
  },
];

const staticNodes: Node[] = [
  { id: '4', data: { label: '🤖 LLM Test Plan Generator' }, position: { x: 650, y: 100 }, draggable: false, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '5', data: { label: '📄 Markdown Test Plan Output' }, position: { x: 900, y: 100 }, draggable: false, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '6', data: { label: '🧪 Gherkin Test Case Generator' }, position: { x: 1150, y: 100 }, draggable: false, targetPosition: Position.Left, sourcePosition: Position.Right },
];

export default function App() {
  const [featureDesc, setFeatureDesc] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [parsedData, setParsedData] = useState(null);

  const handleApiKeySave = async (figmaToken: string, geminiKey: string) => {
    try {
      console.log('Sending API keys to backend...');
      const res = await fetch('http://localhost:8000/update-env', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          figma_token: figmaToken,
          gemini_key: geminiKey
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server response:', {
          status: res.status,
          statusText: res.statusText,
          error: errorText
        });
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('API keys saved successfully:', data);
      alert('API keys saved successfully!');
    } catch (error) {
      console.error('API error:', error);
      alert(`Failed to save API keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmit = async () => {
    if (!featureDesc.trim() || !figmaUrl.trim()) {
      console.warn('Missing input: Feature description and Figma URL are required.');
      return;
    }

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: featureDesc, figma_url: figmaUrl }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      console.log('Parsed data:', data);
      setParsedData(data);
    } catch (error) {
      console.error('API error:', error);
      alert('Failed to fetch test plan. Check your inputs or server.');
    }
  };

  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'featureInput',
      position: { x: 0, y: -42 },
      draggable: false,
      sourcePosition: Position.Top,
      data: {
        figmaUrl,
        featureDesc,
        onFigmaUrlChange: setFigmaUrl,
        onFeatureDescChange: setFeatureDesc,
        onSubmit: handleSubmit,
      },
    },
    ...staticNodes,
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-screen h-screen bg-slate-900">
      <ApiKeyForm onSave={handleApiKeySave} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnScroll
          panOnDrag={false}
          zoomOnDoubleClick
          zoomOnScroll={false}
          zoomOnPinch
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
  );
}

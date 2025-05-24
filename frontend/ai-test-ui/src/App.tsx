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
import TestPlanGeneratorNode from './components/nodes/TestPlanGeneratorNode';
import ApiKeyForm from './components/ApiKeyForm';

const nodeTypes = {
  featureInput: FeatureInputNode,
  testPlanGenerator: TestPlanGeneratorNode,
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
  { 
    id: '4', 
    type: 'testPlanGenerator',
    data: {},
    position: { x: 500, y: 100 }, 
    draggable: false, 
    targetPosition: Position.Left, 
    sourcePosition: Position.Right 
  },
  { id: '5', data: { label: '📄 Gherkin Test Case Generator' }, position: { x: 1000, y: 100 }, draggable: false, targetPosition: Position.Left, sourcePosition: Position.Right },
  { id: '6', data: { label: '🧪 Start Testing!' }, position: { x: 1400, y: 100 }, draggable: false, targetPosition: Position.Left, sourcePosition: Position.Right },
];

export default function App() {
  const [featureDesc, setFeatureDesc] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isFeatureReady, setIsFeatureReady] = useState(false);

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

  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'featureInput',
      position: { x: 0, y: 100 },
      draggable: false,
      sourcePosition: Position.Top,
      data: {
        figmaUrl,
        featureDesc,
        onFigmaUrlChange: setFigmaUrl,
        onFeatureDescChange: setFeatureDesc,
        onFeatureReady: setIsFeatureReady,
      },
    },
    ...staticNodes.map(node => {
      if (node.id === '4') {
        return {
          ...node,
          data: {
            ...node.data,
            isFeatureReady,
          },
        };
      }
      return node;
    }),
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(nodes => nodes.map(node => {
      if (node.id === '4') {
        return {
          ...node,
          data: {
            ...node.data,
            isFeatureReady,
          },
        };
      }
      return node;
    }));
  }, [isFeatureReady, setNodes]);

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

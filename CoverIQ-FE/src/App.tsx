import React, { useState, useEffect } from 'react';
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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import 'reactflow/dist/style.css';
import FeatureInputNode from './components/nodes/FeatureInputNode';
import TestPlanGeneratorNode from './components/nodes/TestPlanGeneratorNode';
import TestCaseGeneratorNode from './components/nodes/TestCaseGeneratorNode';
import StartTestingNode from './components/nodes/StartTestingNode';
import Layout from './components/Layout';

const nodeTypes = {
  featureInput: FeatureInputNode,
  testPlanGenerator: TestPlanGeneratorNode,
  testCaseGenerator: TestCaseGeneratorNode,
  startTesting: StartTestingNode,
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
    position: { x: 500, y: 0 }, 
    draggable: false, 
    targetPosition: Position.Left, 
    sourcePosition: Position.Right 
  },
  { 
    id: '5', 
    type: 'testCaseGenerator',
    data: {},
    position: { x: 1050, y: 0 }, 
    draggable: false, 
    targetPosition: Position.Left, 
    sourcePosition: Position.Right 
  },
  { 
    id: '6', 
    type: 'startTesting',
    data: { isTestCasesReady: false },
    position: { x: 1550, y: 0 }, 
    draggable: false, 
    targetPosition: Position.Left
  },
];

function Landing() {
  return (
    <Layout showLogoOnly>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold tracking-tight mb-6">
            <span className="text-blue-500">Cover</span>
            <span className="text-emerald-500">IQ</span>
          </h1>
          <p className="text-xl text-white mb-2">Automated Tools and Solutions that Cover Intelligent Quality Assurance </p>
        </div>
        <div className="flex space-x-6">
          <a
            href="/introduction"
            className="px-8 py-3 text-lg font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Learn More About CoverIQ
          </a>
          <a
            href="/products/Planner"
            className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try our Figma UI Test Planner
          </a>
        </div>
      </div>
    </Layout>
  );
}

function TestAssistant() {
  const [featureDesc, setFeatureDesc] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isFeatureReady, setIsFeatureReady] = useState(false);
  const [isTestPlanReady, setIsTestPlanReady] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

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
      position: { x: -50, y: 0 },
      draggable: false,
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
  const [, , onEdgesChange] = useEdgesState(initialEdges);

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

  useEffect(() => {
    setNodes(nodes => nodes.map(node => {
      if (node.id === '5') {
        return {
          ...node,
          data: {
            ...node.data,
            isTestPlanReady,
            onTestCasesGenerated: setIsGenerated,
          },
        };
      }
      return node;
    }));
  }, [isTestPlanReady, setNodes]);

  useEffect(() => {
    setNodes(nodes => nodes.map(node => {
      if (node.id === '1') {
        return {
          ...node,
          data: {
            ...node.data,
            onFeatureReady: setIsFeatureReady,
          },
        };
      }
      return node;
    }));
  }, [setNodes]);

  useEffect(() => {
    setNodes(nodes => nodes.map(node => {
      if (node.id === '4') {
        return {
          ...node,
          data: {
            ...node.data,
            onTestPlanReady: setIsTestPlanReady,
          },
        };
      }
      return node;
    }));
  }, [setNodes]);

  useEffect(() => {
    setNodes(nodes => nodes.map(node => {
      if (node.id === '6') {
        return {
          ...node,
          data: {
            ...node.data,
            isTestCasesReady: isGenerated,
          },
        };
      }
      return node;
    }));
  }, [isGenerated, setNodes]);

  return (
    <Layout showApiKeyForm onApiKeySave={handleApiKeySave}>
      <div className="w-screen h-screen relative">
        <ReactFlow
          nodes={nodes}
          edges={initialEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnScroll
          panOnDrag={false}
          zoomOnDoubleClick
          zoomOnScroll={false}
          zoomOnPinch
          proOptions={{ hideAttribution: true }}
          fitView={false}
          minZoom={0.1}
          maxZoom={4}
          defaultViewport={{ x: 300, y: 150, zoom: 1.4 }}
        >
          <MiniMap 
            style={{
              position: 'absolute',
              bottom: '6rem',
              right: '0rem',
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              borderRadius: '0.5rem',
            }}
            pannable={true}
          />
          <Controls 
            showInteractive={false}
            showZoom={false}
            showFitView={true}
            position='bottom-right'
            style={{
              position: 'absolute',
              bottom: '16rem',
              right: '0rem',
            }}
          />
          <Background />
        </ReactFlow>
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center space-x-3">
            <span className="text-7xl font-bold tracking-tight">
              <span className="text-gray-500 hover:text-blue-500">Cover</span>
              <span className="text-gray-500 hover:text-emerald-500">IQ </span>
              <span className="text-gray-500 hover:text-gray-300">Figma UI Test Planner</span>
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Introduction() {
  return (
    <Layout>
      <div className="min-h-screen pt-32 pb-20 px-8 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-blue-500">Welcome to CoverIQ</h1>
          <p className="text-lg mb-4 text-white italic">
            Looking for intelligent automated QA solutions? <strong>We've got you covered!</strong>
          </p>
          <p className="text-lg mb-4 text-white text-justify">
            CoverIQ delivers cutting-edge, AI-powered tools designed to streamline and strengthen your quality assurance processes. Our solutions help development teams reduce manual effort, catch regressions early, and maintain high-quality code with confidence and efficiency.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-blue-500">Our Products</h2>

          <div className="mb-8">
            <a href='/products/Planner' className="text-xl font-semibold mb-2 text-emerald-500 hover:text-emerald-300">Figma UI Test Planner</a>
            <p className="text-lg text-white text-justify">
              This system generates structured test plans and BDD-style test cases directly from Figma UI designs and optional feature descriptions. By integrating design metadata with AI-powered test reasoning, it brings automation and clarity to the UI QA process.
            </p>
          </div>

          <div className="mb-8">
            <a href='https://github.com/CoverIQ/CoverIQ-Test-Assistant/tree/Local-Unit-Test-Support-Demo' className="text-xl font-semibold mb-2 text-emerald-500 hover:text-emerald-300">Local Unit Test Support</a>
            <p className="text-lg text-white text-justify">
              An intelligent assistant that automates unit test regression maintenance. By analyzing code changes and mapping them to potential test failures, it empowers teams to pinpoint change-induced bugs and update tests with precision—enhanced by RAG.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4 text-blue-500">What's next?</h2>

          <p className="text-lg text-white text-justify">
            As we continue to grow, CoverIQ is committed to expanding our platform with more intelligent, developer-friendly QA solutions to support the full software testing lifecycle.
          </p>
        </div>
      </div>
    </Layout>
  );
}

function Team() {
  return (
    <Layout>
      <div className="min-h-screen pt-32 pb-20 px-8 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-blue-500">Meet the CoverIQ Core Team!</h1>
          <p className="text-lg mb-4 text-white italic">
          At CoverIQ, we're building the future of intelligent QA — one feature at a time.
          </p>
          <p className="text-lg text-white text-justify">
            Together, our team tools automated solutions that cover intelligent quality assurance for you — because better testing means better software.
          </p>
          <h2 className="text-2xl font-semibold mt-10 mb-4 text-emerald-500">Current Members:</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">James Tu, Co-Founder & Lead Engineer</h3>
            <p className="text-lg text-white text-justify">
              Graduated from National Cheng Kung University with a degree in Computer Science and Information Engineering. James leads core engineering and product design at CoverIQ.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">Claire Lin, Project Manager & UI/UX Designer</h3>
            <p className="text-lg text-white text-justify">
              Currently studying Media Design at Keio University. Claire leads project planning and documentation while also shaping the product's user experience through thoughtful UI/UX design.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">Hank Chen, Integration Developer</h3>
            <p className="text-lg text-white text-justify">
              MCS student at the University of Illinois Urbana-Champaign. Hank builds seamless system integrations and infrastructure support for our products.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">Yochi Yeh, Feature Developer</h3>
            <p className="text-lg text-white text-justify">
              Pursuing a Master's in Computer Science at National Yang Ming Chiao Tung University. Yochi works on implementing core features and refining the user experience.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">Wilson Liang, Feature Developer</h3>
            <p className="text-lg text-white text-justify">
              MSCS student at Columbia University. Wilson contributes to feature development and rapid product iteration.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2 text-blue-500">Liam Lin, Feature Developer</h3>
            <p className="text-lg text-white text-justify">
            Currently studying Mechanical Engineering at National Yang Ming Chiao Tung University. Liam provides technical support to CoverIQ product feature development.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/products/Planner" element={<TestAssistant />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </Router>
  );
}

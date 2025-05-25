# CoverIQ Test Planner Frontend

A React-based frontend application for the CoverIQ Test Planner, featuring an interactive flow diagram for test plan and test case generation.

## Features

- Interactive flow diagram with React Flow
- Feature input with Figma URL integration
- Test plan generation
- Test case generation with BDD format
- Feature file download
- API key management
- Responsive design with Tailwind CSS

## Tech Stack

- React 18
- TypeScript
- React Flow
- Tailwind CSS
- Vite

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/CoverIQ-Test-Assistant.git
cd CoverIQ-Test-Assistant/CoverIQ-FE
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── nodes/           # Flow diagram node components
│   ├── Layout.tsx       # Main layout component
│   └── ApiKeyForm.tsx   # API key management
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## Adding New Features

### Adding a New Node

1. Create a new component in `src/components/nodes/`:
```typescript
import React from 'react';
import { Handle, Position } from 'reactflow';

interface YourNodeData {
  // Define your node's data interface
}

const YourNode: React.FC<{ data: YourNodeData }> = ({ data }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <Handle type="target" position={Position.Left} />
      {/* Your node content */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default YourNode;
```

2. Register the node in `App.tsx`:
```typescript
import YourNode from './components/nodes/YourNode';

const nodeTypes = {
  // ... existing nodes
  yourNode: YourNode,
};
```

3. Add the node to the flow:
```typescript
const staticNodes: Node[] = [
  // ... existing nodes
  {
    id: 'your-node-id',
    type: 'yourNode',
    data: {},
    position: { x: 1000, y: 0 },
    draggable: false,
    targetPosition: Position.Left,
    sourcePosition: Position.Right
  },
];
```

### Adding New Pages

1. Create a new component in `src/components/` or `src/pages/`
2. Add the route in `App.tsx`:
```typescript
<Routes>
  <Route path="/your-path" element={<YourComponent />} />
</Routes>
```

### Styling Guidelines

- Use Tailwind CSS for styling
- Logo color scheme:
  - Primary: Blue (`blue-500`, `emerald-500`)
  - Secondary: Emerald (`emerald-600`, `blue-600`, `emerald-400`, `blue-400`)
  - Other text colors: Dark gray (`gray-400`, `gray-500`, `gray-300`, `white`)

## Development Guidelines

1. Follow coding best practices
2. Keep track of your modifications
3. Maintain consistent styling with Tailwind CSS
4. Test your code before submitting pull request
5. Add proper error handling
6. Follow pull request template while submitting pull request

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request with detailed description of your changes


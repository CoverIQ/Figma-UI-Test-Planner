# ![CoverIQ](Images/Header.png)
# Figma UI Test Planner

### An AI-Powered Solution that generates `Test Plans and Test Cases from Figma UI designs`. 
#### Provided by `CoverIQ`.

## Features
![Check out our:](Images/workflow.png)
- Interactive flow-based UI
- Real-time test plan generation from Figma designs
- Create BDD-style test cases
- Export test plans and test cases in Markdown format
- Export test cases in .feature file format
- Upload .feature files to generate E2E test automation code (Selenium Webdriver)

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn
- Figma Access Token
- Google Gemini API Key

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd CoverIQ-BE
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

The backend server will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd CoverIQ-FE
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

0. Open your browser and navigate to `http://localhost:5173`
1. Configure your Figma Access Token and Gemini API Key (top right corner)
2. Feature Input node:
   - Enter your feature description
   - Paste your Figma URL
   - Click "Generate Feature Representation"
3. Test Plan Generation Node:
   - Click "Generate Test Plan"
   - Generated Test Plan can be previewed
   - Supports JSON and Markdown format download
4. Test Case Generation Node: 
   - Click "Generate Test Cases"
   - Generated BDD-style test cases can be previewed
   - Supports JSON and Markdown format download
5. The Start Testing Node provides the generated test cases zipped in .feature file format
6. The E2E Test Automation node: 
   - Select .feature file(s)
   - Click "Upload .feature file(s)"
   - Click "Generate E2E Testing Code"
   - Download zipped Selenium Webdriver .py file(s)

## System Workflow
![Image unavailable.](Images/flowchart.png)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with detailed documentation on changes. 
6. Submit Pull Request and Assign/Notify a Reviewer

## License

This project is licensed under the MIT License - see the LICENSE file for details.
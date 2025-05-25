# CoverIQ Test Planner Backend

A FastAPI-based backend service for the CoverIQ Test Planner, providing APIs for test plan and test case generation.

## Features

- Test plan generation from feature descriptions
- Test case generation with BDD format
- Figma integration for UI design analysis
- Gemini AI integration for intelligent test generation
- Markdown and feature file export support

## Tech Stack

- Python 3.9+
- FastAPI
- Gemini AI
- Figma API
- Pydantic

## Getting Started

### Prerequisites

- Python 3.9 or higher
- pip

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/CoverIQ-Test-Assistant.git
cd CoverIQ-Test-Assistant/CoverIQ-BE
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys:
# FIGMA_ACCESS_TOKEN=your_figma_token_here
# GEMINI_API_KEY=your_gemini_api_key_here
```

5. Start the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Environment Setup

#### Update API Keys
```http
POST /update-env
Content-Type: application/json

{
    "figma_token": "your_figma_token",
    "gemini_key": "your_gemini_api_key"
}
```

Response:
```json
{
    "message": "API keys updated successfully"
}
```

### Figma Integration

#### Parse Figma URL
```http
POST /parse-figma
Content-Type: application/json

{
    "figma_url": "https://www.figma.com/file/your_file_key/your_file_name"
}
```

Response:
```json
{
    "file_key": "string",
    "file_name": "string",
    "nodes": [
        {
            "id": "string",
            "name": "string",
            "type": "string",
            "children": []
        }
    ]
}
```

### Feature Representation

#### Get Feature Representation
```http
POST /get-feature-representation
Content-Type: application/json

{
    "figma_data": {
        "file_key": "string",
        "file_name": "string",
        "nodes": []
    },
    "feature_description": "Optional feature description"
}
```

Response:
```json
{
    "features": [
        {
            "name": "string",
            "description": "string",
            "components": []
        }
    ]
}
```

### Test Plan Generation

#### Generate Test Plan
```http
POST /data/plan
Content-Type: application/json

{
    "feature_desc": "string"
}
```

Response:
```json
{
    "test_plan": {
        "objectives": [],
        "overview": "string",
        "scope": [],
        "test_items": [],
        "test_types": [],
        "test_approach": "string",
        "acceptance_criteria": []
    }
}
```

#### Download Test Plan (Markdown)
```http
GET /data/plan/markdown
```

Response: Markdown file with Content-Disposition header

### Test Case Generation

#### Generate Test Cases
```http
POST /data/cases
Content-Type: application/json

{
    "test_plan": {
        "objectives": [],
        "overview": "string",
        "scope": [],
        "test_items": [],
        "test_types": [],
        "test_approach": "string",
        "acceptance_criteria": []
    }
}
```

Response:
```json
{
    "test_cases": [
        {
            "feature": "string",
            "scenarios": [
                {
                    "name": "string",
                    "description": "string",
                    "given": [],
                    "when": [],
                    "then": []
                }
            ]
        }
    ]
}
```

#### Download Test Cases (Markdown)
```http
GET /data/cases/markdown
```

Response: Markdown file with Content-Disposition header

#### Download Test Cases (Feature File)
```http
GET /data/cases/feature
```

Response: .feature file with Content-Disposition header

### Data Retrieval

#### Get Figma Data
```http
GET /data/figma
```

Response:
```json
{
    "file_key": "string",
    "file_name": "string",
    "nodes": []
}
```

#### Get Feature List
```http
GET /data/feature
```

Response:
```json
{
    "features": [
        {
            "name": "string",
            "description": "string",
            "components": []
        }
    ]
}
```

#### Get Test Plan
```http
GET /data/plan
```

Response:
```json
{
    "test_plan": {
        "objectives": [],
        "overview": "string",
        "scope": [],
        "test_items": [],
        "test_types": [],
        "test_approach": "string",
        "acceptance_criteria": []
    }
}
```

#### Get Test Cases
```http
GET /data/cases
```

Response:
```json
{
    "test_cases": [
        {
            "feature": "string",
            "scenarios": [
                {
                    "name": "string",
                    "description": "string",
                    "given": [],
                    "when": [],
                    "then": []
                }
            ]
        }
    ]
}
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request (invalid input or data type)
- 404: Not Found (requested data file doesn't exist)
- 500: Internal Server Error

Error responses include a detail message:
```json
{
    "detail": "Error message here"
}
```

## Project Structure

```
CoverIQ-BE/
├── app/
│   ├── routes.py      # API endpoint definitions
│   └── services.py    # Business logic and AI integration
├── Feature2/          # Core functionality
├── data/             # Data storage
├── main.py           # FastAPI application
└── requirements.txt  # Dependencies
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Document/update your added/modified api endpoints in this readme
4. Submit a pull request

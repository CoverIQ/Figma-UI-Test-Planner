# CoverIQ Test Assistant Backend

This is the backend service for the CoverIQ Test Assistant, which provides APIs for parsing Figma designs, generating feature representations, and creating test plans and test cases.

## Setup

1. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with your API keys:
```
FIGMA_ACCESS_TOKEN=your_figma_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the server:
```bash
uvicorn app.main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

### Environment Variables

#### Update Environment Variables
```bash
curl -X POST http://localhost:8000/update-env \
  -H "Content-Type: application/json" \
  -d '{
    "figma_token": "your_figma_token",
    "gemini_key": "your_gemini_api_key"
  }'
```

### Figma Integration

#### Parse Figma URL
```bash
curl -X POST http://localhost:8000/parse-figma \
  -H "Content-Type: application/json" \
  -d '{
    "figma_url": "https://www.figma.com/file/your_file_key/your_file_name"
  }'
```

### Feature Representation

#### Get Feature Representation
```bash
curl -X POST http://localhost:8000/get-feature-representation \
  -H "Content-Type: application/json" \
  -d '{
    "figma_data": {
      // Figma data from parse-figma endpoint
    },
    "feature_description": "Optional feature description"
  }'
```

### Test Plan Generation

#### Generate Test Plan
```bash
curl -X POST http://localhost:8000/generate-test-plan \
  -H "Content-Type: application/json" \
  -d '{
    "feature_list": {
      // Feature list from get-feature-representation endpoint
    }
  }'
```

### Test Case Generation

#### Generate Test Cases
```bash
curl -X POST http://localhost:8000/generate-test-cases \
  -H "Content-Type: application/json" \
  -d '{
    "test_plan": {
      // Test plan from generate-test-plan endpoint
    }
  }'
```

### Data Retrieval

The backend automatically saves the results of each operation to JSON files in the `data` directory. You can retrieve this data using the following GET endpoints:

#### Get Figma Data
```bash
curl http://localhost:8000/data/figma
```

#### Get Feature List
```bash
curl http://localhost:8000/data/feature
```

#### Get Test Plan
```bash
curl http://localhost:8000/data/plan
```

#### Get Test Cases
```bash
curl http://localhost:8000/data/cases
```

## Data Storage

All data is automatically saved to JSON files in the `data` directory:
- `figma_data.json`: Raw Figma data
- `feature_list.json`: Feature representation
- `test_plan.json`: Generated test plan
- `test_cases.json`: Generated test cases

The data is saved after each successful operation and can be retrieved using the corresponding GET endpoints.

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request (invalid input or data type)
- 404: Not Found (requested data file doesn't exist)
- 500: Internal Server Error

Error responses include a detail message explaining the error:
```json
{
  "detail": "Error message here"
}
```

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── routes.py      # API endpoints
│   └── services.py    # Business logic
├── Feature2/          # Core functionality
├── main.py           # FastAPI application
└── requirements.txt  # Dependencies
``` 
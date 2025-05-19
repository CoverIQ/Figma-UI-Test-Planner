# AI-Guided Test Planning and Test Case Design from Figma
This system enables the automatic generation of high-level test plans and BDD-style test cases for new UI features based on design artifacts from Figma and optional feature descriptions. The goal is to streamline the QA process by integrating Figma design metadata with LLM-powered test reasoning.

##  Project Structure
├── main.py # Main orchestrator script  
├── figma_frame_parser.py # Fetches and parses Figma design JSON  
├── feature_representation.py # Extracts interactive UI features  
├── llm_test_plan_generator.py # Creates test plan via Gemini API  
├── bdd_style_test_case_generator.py # Converts test plan into BDD test cases  


## Module Descriptions

- figma_frame_parser.py
Extracts file_key from a Figma URL

Fetches the full design JSON via Figma API

- feature_representation.py
Traverses Figma node tree to retain only meaningful (non-decorative) components

Extracts size, position, interactions, and style data

- llm_test_plan_generator.py
Sends structured UI feature data to Gemini API

Receives a comprehensive test plan with:Objective,Scope,Test Items,Test Types,Acceptance Criteria

- bdd_style_test_case_generator.py
Converts each test plan item into Gherkin-style BDD test cases

Supports both positive and negative scenarios

- main.py
Integrates all steps: parse Figma URL → extract UI features → generate test plan → generate BDD test cases

Produces two JSON output files:

test_plan.json

test_case.json

example:
  
test_plan_example.txt

test_case_example.txt

##  How to Use

### 1.  Environment Setup

Create a `.env` file in the root directory with the following:
GEMINI_API_KEY=your_google_gemini_api_key
FIGMA_ACCESS_TOKEN=your_figma_access_token

Install dependencies:
pip install pydantic python-dotenv requests google-generativeai

### 2.  Run the Pipeline
python main.py "https://www.figma.com/file/XXXXX/your-design" --feature_path="feature.txt"

fig_url: Public Figma design/file URL
--feature_path: (Optional) A plain text file describing the feature to enhance semantic extraction







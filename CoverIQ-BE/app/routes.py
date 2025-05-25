from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Dict, Any, Optional
from .services import feature2_service, update_env_file
import io
import zipfile

router = APIRouter()

class FigmaURLRequest(BaseModel):
    figma_url: str

class FeatureDescriptionRequest(BaseModel):
    figma_data: Dict[str, Any]
    feature_description: Optional[str] = None

class TestPlanRequest(BaseModel):
    feature_list: Dict[str, Any]

class TestCasesRequest(BaseModel):
    test_plan: Dict[str, Any]

class EnvUpdateRequest(BaseModel):
    figma_token: str
    gemini_key: str

@router.post("/parse-figma")
async def parse_figma_url(request: FigmaURLRequest) -> Dict[str, Any]:
    try:
        return feature2_service.parse_figma_url_and_get_data(request.figma_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/get-feature-representation")
async def get_feature_representation(request: FeatureDescriptionRequest) -> Dict[str, Any]:
    try:
        return feature2_service.get_feature_representation(
            request.figma_data,
            request.feature_description
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-test-plan")
async def generate_test_plan(request: TestPlanRequest) -> Dict[str, Any]:
    try:
        return feature2_service.generate_test_plan_from_feature(request.feature_list)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-test-cases")
async def generate_test_cases(request: TestCasesRequest) -> Dict[str, Any]:
    try:
        return feature2_service.generate_test_cases_from_plan(request.test_plan)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/update-env")
async def update_env(request: EnvUpdateRequest) -> Dict[str, str]:
    try:
        figma_token, gemini_key = update_env_file(request.figma_token, request.gemini_key)
        return {
            "figma_token": str(figma_token),
            "gemini_key": str(gemini_key)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/data/{data_type}")
async def get_saved_data(data_type: str) -> Dict[str, Any]:
    """Get saved data by type (figma, feature, plan, cases)"""
    try:
        return feature2_service.get_saved_data(data_type)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/plan/markdown")
async def get_test_plan_markdown():
    try:
        test_plan = feature2_service.get_saved_data('plan')
        markdown = "# Test Plan\n\n"
        
        for index, test_case in enumerate(test_plan['test_plan'], 1):
            markdown += f"## Objective {index}\n\n"
            markdown += f"### Overview\n{test_case['Objective']}\n\n"
            markdown += f"### Scope\n{test_case['Scope']}\n\n"
            markdown += "### Test Items\n\n"
            markdown += f"#### Types of Testing\n{test_case['Test_Items']['Types_of_Testing']}\n\n"
            markdown += f"#### Test Approach\n{test_case['Test_Items']['Test_Approach']}\n\n"
            markdown += "#### Acceptance Criteria\n\n"
            for idx, criteria in enumerate(test_case['Test_Items']['Acceptance_Criteria'], 1):
                markdown += f"{idx}. {criteria}\n"
            markdown += "\n---\n\n"
        
        return Response(
            content=markdown,
            media_type="text/markdown",
            headers={
                "Content-Disposition": "attachment; filename=test-plan.md"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/data/cases/markdown")
async def get_test_cases_markdown():
    try:
        test_cases = feature2_service.get_saved_data('cases')
        markdown = "# Test Cases\n\n"
        
        for objective_key, objective in test_cases.items():
            markdown += f"## {objective_key}\n\n"
            markdown += f"### Feature\n{objective['feature']}\n\n"
            
            for idx, description in enumerate(objective['bdd_style_descriptions'], 1):
                markdown += f"### Scenario {idx}\n\n"
                markdown += f"**Scenario:** {description['Scenario']}\n\n"
                markdown += "```gherkin\n"
                markdown += f"Given {description['Given']}\n"
                markdown += f"And {description['And']}\n"
                markdown += f"When {description['When']}\n"
                markdown += f"Then {description['Then']}\n"
                markdown += "```\n\n"
                markdown += "---\n\n"
        
        return Response(
            content=markdown,
            media_type="text/markdown",
            headers={
                "Content-Disposition": "attachment; filename=test-cases.md"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/data/cases/feature")
async def get_test_cases_feature():
    try:
        test_cases = feature2_service.get_saved_data('cases')
        
        # Create a zip file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for objective_key, objective in test_cases.items():
                # Create feature file content
                feature_content = f"Feature: {objective_key}\n"
                feature_content += f"  {objective['feature']}\n\n"
                
                # Add scenarios
                for description in objective['bdd_style_descriptions']:
                    feature_content += f"  Scenario: {description['Scenario']}\n"
                    feature_content += f"    Given {description['Given']}\n"
                    feature_content += f"    And {description['And']}\n"
                    feature_content += f"    When {description['When']}\n"
                    feature_content += f"    Then {description['Then']}\n\n"
                
                # Add to zip file
                feature_filename = f"{objective_key.lower().replace(' ', '_')}.feature"
                zip_file.writestr(feature_filename, feature_content)
        
        # Prepare the response
        zip_buffer.seek(0)
        return Response(
            content=zip_buffer.getvalue(),
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=test-cases.zip"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

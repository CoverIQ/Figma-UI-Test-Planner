from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Dict, Any, Optional
from .services import feature2_service, update_env_file, document_generator
import os

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
        return feature2_service.parse_figma_url_and_get_data(request.figma_url, str(os.getenv("FIGMA_ACCESS_TOKEN")))
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
        return feature2_service.generate_test_plan_from_feature(request.feature_list, str(os.getenv("GEMINI_API_KEY")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-test-cases")
async def generate_test_cases(request: TestCasesRequest) -> Dict[str, Any]:
    try:
        return feature2_service.generate_test_cases_from_plan(request.test_plan, str(os.getenv("GEMINI_API_KEY")))
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
        markdown = document_generator.generate_test_plan_markdown(test_plan)
        
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
        markdown = document_generator.generate_test_cases_markdown(test_cases)
        
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
        zip_bytes = document_generator.generate_feature_files(test_cases)
        
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=test-cases.zip"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

import os
from typing import Dict, Any, List, Optional, Tuple
from dotenv import load_dotenv
from Feature2.figma_frame_parser import parse_figma_url, get_figma_file_data
from Feature2.feature_representation import filter_component
from Feature2.llm_test_plan_generator import generate_test_plan
from Feature2.bdd_style_test_case_generator import generate_test_case

class Feature2Service:
    def __init__(self):
        load_dotenv()
        self.figma_token = str(os.getenv("FIGMA_ACCESS_TOKEN"))
        self.gemini_api_key = str(os.getenv("GEMINI_API_KEY"))
        
        # In-memory storage
        self._storage = {
            'figma_data': None,
            'feature_list': None,
            'test_plan': None,
            'test_cases': None
        }
        
        if not self.figma_token or not self.gemini_api_key:
            raise ValueError("Missing required environment variables: FIGMA_ACCESS_TOKEN or GEMINI_API_KEY")

    def _save_to_memory(self, data: Dict[str, Any], key: str) -> None:
        """Save data to in-memory storage"""
        self._storage[key] = data

    def _read_from_memory(self, key: str) -> Dict[str, Any]:
        """Read data from in-memory storage"""
        if key not in self._storage:
            raise ValueError(f"Invalid data type: {key}")
        if self._storage[key] is None:
            raise FileNotFoundError(f"No data found for: {key}")
        return self._storage[key]

    def parse_figma_url_and_get_data(self, figma_url: str) -> Dict[str, Any]:
        """Parse Figma URL and get file data"""
        try:
            file_key = parse_figma_url(figma_url)
            figma_data = get_figma_file_data(file_key, self.figma_token)
            result = {
                "file_key": file_key,
                "figma_data": figma_data
            }
            self._save_to_memory(result, 'figma_data')
            return result
        except Exception as e:
            raise Exception(f"Error parsing Figma URL: {str(e)}")

    def get_feature_representation(self, figma_data: Dict[str, Any], feature_description: Optional[str] = None) -> Dict[str, Any]:
        """Get feature representation from Figma data"""
        try:
            result = filter_component(figma_data, feature_description)
            self._save_to_memory(result, 'feature_list')
            return result
        except Exception as e:
            raise Exception(f"Error getting feature representation: {str(e)}")

    def generate_test_plan_from_feature(self, feature_list: Dict[str, Any]) -> Dict[str, Any]:
        """Generate test plan from feature list"""
        try:
            result = generate_test_plan(feature_list, self.gemini_api_key)
            self._save_to_memory(result, 'test_plan')
            return result
        except Exception as e:
            raise Exception(f"Error generating test plan: {str(e)}")

    def generate_test_cases_from_plan(self, test_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate test cases from test plan"""
        try:
            result = generate_test_case(test_plan, self.gemini_api_key)
            self._save_to_memory(result, 'test_cases')
            return result
        except Exception as e:
            raise Exception(f"Error generating test cases: {str(e)}")

    def get_saved_data(self, data_type: str) -> Dict[str, Any]:
        """Get saved data by type"""
        type_mapping = {
            'figma': 'figma_data',
            'feature': 'feature_list',
            'plan': 'test_plan',
            'cases': 'test_cases'
        }
        
        if data_type not in type_mapping:
            raise ValueError(f"Invalid data type. Must be one of: {', '.join(type_mapping.keys())}")
            
        return self._read_from_memory(type_mapping[data_type])

def update_env_file(figma_token: str, gemini_key: str) -> Tuple[str, str]:
    """Update environment variables in memory"""
    os.environ["FIGMA_ACCESS_TOKEN"] = figma_token
    os.environ["GEMINI_API_KEY"] = gemini_key
    load_dotenv(override=True)
    return os.getenv("FIGMA_ACCESS_TOKEN"), os.getenv("GEMINI_API_KEY")

# Create a singleton instance
feature2_service = Feature2Service()

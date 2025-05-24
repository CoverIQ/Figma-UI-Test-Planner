import os
import json
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
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        
        # Create data directory if it doesn't exist
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        
        if not self.figma_token or not self.gemini_api_key:
            raise ValueError("Missing required environment variables: FIGMA_ACCESS_TOKEN or GEMINI_API_KEY")

    def _save_to_file(self, data: Dict[str, Any], filename: str) -> str:
        """Save data to a JSON file and return the file path"""
        filepath = os.path.join(self.data_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return filepath

    def _read_from_file(self, filename: str) -> Dict[str, Any]:
        """Read data from a JSON file"""
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filename}")
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)

    def parse_figma_url_and_get_data(self, figma_url: str) -> Dict[str, Any]:
        """Parse Figma URL and get file data"""
        try:
            file_key = parse_figma_url(figma_url)
            figma_data = get_figma_file_data(file_key, self.figma_token)
            result = {
                "file_key": file_key,
                "figma_data": figma_data
            }
            self._save_to_file(result, 'figma_data.json')
            return result
        except Exception as e:
            raise Exception(f"Error parsing Figma URL: {str(e)}")

    def get_feature_representation(self, figma_data: Dict[str, Any], feature_description: Optional[str] = None) -> Dict[str, Any]:
        """Get feature representation from Figma data"""
        try:
            result = filter_component(figma_data, feature_description)
            self._save_to_file(result, 'feature_list.json')
            return result
        except Exception as e:
            raise Exception(f"Error getting feature representation: {str(e)}")

    def generate_test_plan_from_feature(self, feature_list: Dict[str, Any]) -> Dict[str, Any]:
        """Generate test plan from feature list"""
        try:
            result = generate_test_plan(feature_list, self.gemini_api_key)
            self._save_to_file(result, 'test_plan.json')
            return result
        except Exception as e:
            raise Exception(f"Error generating test plan: {str(e)}")

    def generate_test_cases_from_plan(self, test_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate test cases from test plan"""
        try:
            result = generate_test_case(test_plan, self.gemini_api_key)
            self._save_to_file(result, 'test_cases.json')
            return result
        except Exception as e:
            raise Exception(f"Error generating test cases: {str(e)}")

    def get_saved_data(self, data_type: str) -> Dict[str, Any]:
        """Get saved data by type"""
        file_mapping = {
            'figma': 'figma_data.json',
            'feature': 'feature_list.json',
            'plan': 'test_plan.json',
            'cases': 'test_cases.json'
        }
        
        if data_type not in file_mapping:
            raise ValueError(f"Invalid data type. Must be one of: {', '.join(file_mapping.keys())}")
            
        return self._read_from_file(file_mapping[data_type])

def update_env_file(figma_token: str, gemini_key: str) -> Tuple[str, str]:
    """Update the .env file with new API keys"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    
    # Read existing .env file if it exists
    existing_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    existing_vars[key] = value
    
    # Update with new values
    existing_vars['FIGMA_ACCESS_TOKEN'] = figma_token
    existing_vars['GEMINI_API_KEY'] = gemini_key
    
    # Write back to .env file
    with open(env_path, 'w') as f:
        for key, value in existing_vars.items():
            f.write(f"{key}={value}\n")
    
    # Reload environment variables
    load_dotenv(override=True)
    return os.getenv("FIGMA_ACCESS_TOKEN"), os.getenv("GEMINI_API_KEY")

# Create a singleton instance
feature2_service = Feature2Service()

import unittest
from unittest.mock import patch, MagicMock
from ..llm_test_plan_generator import generate_test_plan, response_scheme

class TestLLMTestPlanGenerator(unittest.TestCase):
    @patch('google.genai.Client')
    def test_generate_test_plan_success(self, mock_client):
        """Test generate_test_plan with successful API response"""
        # Mock response
        mock_response = MagicMock()
        mock_response.text = '''{
            "test_plan": [
                {
                    "Objective": "Test Objective",
                    "Scope": "Test Scope",
                    "Test_Items": {
                        "Types_of_Testing": "Functional",
                        "Test_Approach": "Manual",
                        "Acceptance_Criteria": ["Criteria 1", "Criteria 2"]
                    }
                }
            ]
        }'''
        mock_client.return_value.models.generate_content.return_value = mock_response

        input_data = {"figma_data": {"document": {}}}
        result = generate_test_plan(input_data, "test_api_key")

        # Verify the result structure
        self.assertIn("test_plan", result)
        self.assertEqual(len(result["test_plan"]), 1)
        self.assertEqual(result["test_plan"][0]["Objective"], "Test Objective")
        self.assertEqual(result["test_plan"][0]["Scope"], "Test Scope")
        self.assertEqual(result["test_plan"][0]["Test_Items"]["Types_of_Testing"], "Functional")

    @patch('google.genai.Client')
    def test_generate_test_plan_api_error(self, mock_client):
        """Test generate_test_plan with API error"""
        mock_client.return_value.models.generate_content.side_effect = Exception("API Error")

        input_data = {"figma_data": {"document": {}}}
        with self.assertRaises(Exception):
            generate_test_plan(input_data, "test_api_key")

    def test_response_scheme_validation(self):
        """Test response_scheme model validation"""
        valid_data = {
            "test_plan": [
                {
                    "Objective": "Test Objective",
                    "Scope": "Test Scope",
                    "Test_Items": {
                        "Types_of_Testing": "Functional",
                        "Test_Approach": "Manual",
                        "Acceptance_Criteria": ["Criteria 1"]
                    }
                }
            ]
        }
        # This should not raise any validation errors
        response_scheme(**valid_data)

if __name__ == '__main__':
    unittest.main() 
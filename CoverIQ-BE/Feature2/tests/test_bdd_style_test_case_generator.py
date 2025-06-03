import unittest
from unittest.mock import patch, MagicMock
from ..bdd_style_test_case_generator import generate_test_case, response_scheme

class TestBDDStyleTestCaseGenerator(unittest.TestCase):
    @patch('google.genai.Client')
    def test_generate_test_case_success(self, mock_client):
        """Test generate_test_case with successful API response"""
        # Mock response
        mock_response = MagicMock()
        mock_response.text = '''{
            "feature": "Test Feature",
            "bdd_style_descriptions": [
                {
                    "Scenario": "Test Scenario",
                    "Given": "Given condition",
                    "And": "And condition",
                    "When": "When action",
                    "Then": "Then result"
                }
            ]
        }'''
        mock_client.return_value.models.generate_content.return_value = mock_response

        input_data = {
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
        result = generate_test_case(input_data, "test_api_key")

        # Verify the result structure
        self.assertIn("Feature 1", result)
        self.assertEqual(result["Feature 1"]["feature"], "Test Feature")
        self.assertEqual(len(result["Feature 1"]["bdd_style_descriptions"]), 1)
        self.assertEqual(result["Feature 1"]["bdd_style_descriptions"][0]["Scenario"], "Test Scenario")

    @patch('google.genai.Client')
    def test_generate_test_case_api_error(self, mock_client):
        """Test generate_test_case with API error"""
        mock_client.return_value.models.generate_content.side_effect = Exception("API Error")

        input_data = {
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
        with self.assertRaises(Exception):
            generate_test_case(input_data, "test_api_key")

    def test_response_scheme_validation(self):
        """Test response_scheme model validation"""
        valid_data = {
            "feature": "Test Feature",
            "bdd_style_descriptions": [
                {
                    "Scenario": "Test Scenario",
                    "Given": "Given condition",
                    "And": "And condition",
                    "When": "When action",
                    "Then": "Then result"
                }
            ]
        }
        # This should not raise any validation errors
        response_scheme(**valid_data)

if __name__ == '__main__':
    unittest.main() 
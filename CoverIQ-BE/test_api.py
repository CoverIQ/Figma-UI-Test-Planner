import requests
import json
import os
from typing import Dict, Any
import time

BASE_URL = "http://localhost:8000"

def test_update_env() -> Dict[str, str]:
    """Test updating environment variables"""
    print("\nTesting update-env endpoint...")
    url = f"{BASE_URL}/update-env"
    data = {
        "figma_token": "FIGMA_ACCESS_TOKEN",
        "gemini_key": "GEMINI_API_KEY"
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json()

def test_parse_figma() -> Dict[str, Any]:
    """Test parsing Figma URL"""
    print("\nTesting parse-figma endpoint...")
    url = f"{BASE_URL}/parse-figma"
    data = {
        "figma_url": "https://www.figma.com/file/your_file_key/your_file_name"  # Replace with actual Figma URL
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code

def test_get_feature_representation(figma_data: Dict[str, Any]) -> Dict[str, Any]:
    """Test getting feature representation"""
    print("\nTesting get-feature-representation endpoint...")
    url = f"{BASE_URL}/get-feature-representation"
    data = {
        "figma_data": figma_data,
        "feature_description": "Test feature description"
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code

def test_generate_test_plan(feature_list: Dict[str, Any]) -> Dict[str, Any]:
    """Test generating test plan"""
    print("\nTesting generate-test-plan endpoint...")
    url = f"{BASE_URL}/generate-test-plan"
    data = {
        "feature_list": feature_list
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code

def test_generate_test_cases(test_plan: Dict[str, Any]) -> Dict[str, Any]:
    """Test generating test cases"""
    print("\nTesting generate-test-cases endpoint...")
    url = f"{BASE_URL}/generate-test-cases"
    data = {
        "test_plan": test_plan
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code

def test_get_saved_data(data_type: str) -> Dict[str, Any]:
    """Test getting saved data"""
    print(f"\nTesting get-saved-data endpoint for {data_type}...")
    url = f"{BASE_URL}/data/{data_type}"
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    # print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code

def run_all_tests():
    """Run all API tests in sequence"""
    try:
        # Test environment variables update
        env_response = test_update_env()
        time.sleep(1)  # Small delay between requests

        # Test Figma URL parsing
        figma_response = test_parse_figma()
        time.sleep(1)

        # Test feature representation
        feature_response = test_get_feature_representation(figma_response)
        time.sleep(1)

        # Test test plan generation
        test_plan_response = test_generate_test_plan(feature_response)
        time.sleep(1)

        # Test test case generation
        test_cases_response = test_generate_test_cases(test_plan_response)
        time.sleep(1)

        # Test getting saved data
        print("\nTesting all saved data retrieval...")
        for data_type in ['figma', 'feature', 'plan', 'cases']:
            test_get_saved_data(data_type)
            time.sleep(1)

        print("\nAll tests completed!")

    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to the server. Make sure the server is running at", BASE_URL)
    except Exception as e:
        print(f"\nError during testing: {str(e)}")

if __name__ == "__main__":
    print("Starting API tests...")
    # run_all_tests() 
    env_response = test_update_env()
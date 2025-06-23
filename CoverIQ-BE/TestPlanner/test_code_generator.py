from google import genai
from typing import Dict, Any, List, Optional, Tuple

def generate_E2E_code(feature_text : Dict[str,Any] , api_key: str )->Dict[str,Any]:
    result = {}
    result_count = 1
    for objective_key, objective in feature_text.items():
        # print(result_count)
        client = genai.Client(api_key=api_key)
        prompt = f''' 
Help me generate automated E2E testing code (Please do not include markdown formatting or triple backticks. Only return plain Python code.) using Selenium WebDriver for the following Cucumber feature file.

Note: This code is generated based on UI design only (from Figma). Since we do not have actual element IDs, class names, or selectors yet, please use descriptive placeholder selectors (e.g., driver.find_element(By.XPATH, "PLACEHOLDER_FOR_BUTTON")). Do not assume any implementation-specific selectors. The placeholders should reflect the purpose or label of the UI component.Once the user replaces the placeholders, the program should be able to run successfully.

Cucumber feature file:
{objective}
'''

        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-04-17',
            contents=[
                prompt
            ]    
        )
        file_name = "test_code_for_case_"+str(result_count)+".py"
        result_count+=1
        result[file_name] = response.text
        # print(response.text)
    return result


def generate_feature_text(test_cases: Dict[str, Any]) -> Dict[str , Any]:
    """Generate feature file texts (no zip) and return as a list of strings"""
    feature_texts = {}
    feature_count = 1
    for objective_key, objective in test_cases.items():
        # 建立每個 feature 的文字內容
        for idx, description in enumerate(objective['bdd_style_descriptions'], 1):
            feature_content = f"Feature: {feature_count}. {objective['feature']}\n\n"
            feature_content += f"  Scenario: {idx}. {description['Scenario']}\n"
            feature_content += f"    Given {description['Given']}\n"
            feature_content += f"    And {description['And']}\n"
            feature_content += f"    When {description['When']}\n"
            feature_content += f"    Then {description['Then']}\n\n"
            name = 'text'+str(feature_count)
            feature_texts[name] = feature_content
            feature_count += 1
        

    return feature_texts

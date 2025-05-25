from pydantic import BaseModel
import json
from google import genai

#gemini output format
class response_scheme_base(BaseModel) :
    Scenario : str 
    Given : str
    And : str
    When : str
    Then : str

class response_scheme(BaseModel):
    feature : str
    bdd_style_descriptions : list[response_scheme_base]

#input test plan in json format and call gemini api to generate bdd style test case    
def generate_test_case(test_plan: dict,api_key:str) -> dict:
    output = {}
    case = 1
    for t in test_plan['test_plan'] :
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-04-17',  
            contents=f'''
            test plan :{t},
            Generate BDD-style positive and negative test scenarios necessary to ensure coverage of this test case in Gherkin syntax.
            ''',
            config={
                "response_mime_type": "application/json",     
                "response_schema": response_scheme             
            }
        )
        # print("Objective ", case, " complete.")
        output["Objective_" + str(case)] = json.loads(response.text)
        case += 1
    return output

if __name__ == "__main__":
    import argparse
    import os
    from dotenv import load_dotenv
    parser = argparse.ArgumentParser(description="get json file from path")
    parser.add_argument("json_path", help="json file path")
    args = parser.parse_args()
    with open(args.json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    result = generate_test_case(data,api_key)
    with open("test_case.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
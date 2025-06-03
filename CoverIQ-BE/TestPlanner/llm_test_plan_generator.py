from pydantic import BaseModel
import json
from google import genai

#gemini output format
class response_scheme_base1(BaseModel) :
    Types_of_Testing : str 
    Test_Approach : str
    Acceptance_Criteria : list[str]

class response_scheme2(BaseModel) :
    Objective : str 
    Scope : str
    Test_Items : response_scheme_base1

class response_scheme(BaseModel):
    test_plan : list[response_scheme2]

#input figma data in json format and call gemini api to generate test plan   
def generate_test_plan(figma_data: dict, api_key: str )->dict :
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model='gemini-2.5-flash-preview-04-17',  
        contents=f"""
        Given the following UI design, ignore decorative elements and generate a test plan including objective, scope, test items, test types, test approaches, and acceptance criteria. 
        please generate a test plan for each objective .
        UI design in json format :{figma_data}

        """,
        config={
            "response_mime_type": "application/json",     
            "response_schema": response_scheme             
        }
    )
    return  json.loads(response.text) 


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
    result = generate_test_plan(data,api_key)
    with open("test_plan.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
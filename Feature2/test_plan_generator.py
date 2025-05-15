from pydantic import BaseModel
import json
from google import genai

class response_scheme_base(BaseModel) :
    Scenario : str 
    Given : str
    And : str
    When : str
    Then : str

class response_scheme(BaseModel):
    feature : str
    bdd_style_descriptions : list[response_scheme_base]

def generate_test_plan(feature_diff_map: dict[str, list[dict]],api_key:str) -> list:
    output=[]
    for d in feature_diff_map :
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash-preview-04-17',  
            contents=f'''Feature: {d['feature']}
                        Diff:{d['related_chunk']}   
                        Please draft a BDD-style end-to-end test scenario to cover this functionality.(Gherkin Syntax)''',
            config={
                "response_mime_type": "application/json",     
                "response_schema": response_scheme             
            }
        )
        output.append(json.loads(response.text))
    return output

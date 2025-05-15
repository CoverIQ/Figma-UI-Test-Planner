from pydantic import BaseModel
import json
from google import genai


class response_scheme_base(BaseModel):
    feature: str
    related_chunk: list[str]

class response_scheme(BaseModel):
    result : list[response_scheme_base]


def map_diff_to_features(description_list: str, diff_content: str, api_key: str)->dict :
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model='gemini-2.5-flash-preview-04-17',  
        contents=f"""
你是專業的程式分析工具。請根據以下 git diff chunk 與功能敘述，回傳符合此 JSON 格式的對應關係。
找出每個功能對應的所有diff chunk 並放在回傳檔案中

=== 功能敘述 ===
{description_list}

=== git diff 內容 ===
{diff_content}
""",
        config={
            "response_mime_type": "application/json",     
            "response_schema": response_scheme             
        }
    )
    return  json.loads(response.text) 




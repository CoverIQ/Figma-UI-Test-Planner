from google import genai
import google.generativeai as googlegenai
from PIL import Image
import pyautogui
from pydantic import BaseModel
import json
from google.genai import types
import time
import pyautogui
from PIL import Image, ImageChops
import webbrowser
import re
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv 
import argparse
import os 

def parse_figma_url(url: str) -> dict:
    """
    Extract the project key and project name from a Figma URL (supports /file/ or /design/ links).
    
    Returns:
        dict with keys 'project_key' and 'project_name'
    """
    pattern = r"https://www\.figma\.com/(file|design)/([a-zA-Z0-9]+)/(.*?)(?:\?|$)"
    match = re.search(pattern, url)
    if not match:
        raise ValueError("Invalid Figma URL format.")

    project_key = match.group(2)
    project_name = match.group(3)

    return {
        "project_key": project_key,
        "project_name": project_name
    }

def get_figma_file_data(file_key: str, token: str) -> Dict[str, Any]:
    headers = {
     'X-Figma-Token': token
    }
    url = f"https://api.figma.com/v1/files/{file_key}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

# to filter decorative component in json file and keep all necessary information

def filter_component(figma_data: Dict[str, Any],feature_description: Optional[str] = None) -> List[Dict[str, Any]]:

    results = []
    #Traverse frame node tree to extract interactive components
    def traverse(node: Dict[str, Any],parent_id : Any = None):
        interactions = node.get("interactions", [])
        table = node.get("styleOverrideTable", [])
        children = node.get("children", [])
        #keep element if not decorative
        if (interactions or table or children) :  
            component = {
                "parent_id": parent_id,
                "id": node.get("id"),
                "name": node.get("name"),
                "type": node.get("type"),
                "position": {
                    "x": node.get("absoluteBoundingBox", {}).get("x"),
                    "y": node.get("absoluteBoundingBox", {}).get("y")
                },
                # "size": {
                #     "width": node.get("absoluteBoundingBox", {}).get("width"),
                #     "height": node.get("absoluteBoundingBox", {}).get("height")
                # },
                "interactions": node.get("interactions"),
                "styleOverrideTable": node.get("styleOverrideTable")
            }
            results.append(component)


        for child in children:
            traverse(child,node.get("id"))

    # start from "document"
    if "document" in figma_data:
        traverse(figma_data["document"])
    output = {
        "figma_data" : results ,
        "feature_description" : feature_description
    }
    
    return output


class id_scheme(BaseModel):
    node_id: str

def find_page_id(api_key: str, case: dict, fig_data: dict , frame_list : list):
    prompt = f'''
    You are given:
    - A BDD-style test case (describes the UI element or feature to test)
    - Figma structured data (the hierarchical design data)
    - A list of top-level frame node IDs (frame_list)

    Your task:
    ONLY select and return ONE node_id from the provided frame_list that represents the outermost frame containing the target element or area described in the test case.

    Constraints:
    - You MUST pick one from this list only: {frame_list}
    - Do NOT invent or generate any other node_id
    - Return ONLY the node_id as a JSON string, e.g., {{"node_id": "1-2345"}}
    - Do NOT include any explanation, comments, or extra text

    Inputs:
    - Test case: {case}
    - Figma structured data: {fig_data}

    Output format:

    "node_id": "<selected node_id from frame_list>" '''

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.5-flash-preview-04-17',
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": id_scheme
        }
    )
    return json.loads(response.text)

def generate_description(api_key: str, case: dict, image_path: str, figma_data: dict):
    googlegenai.configure(api_key=api_key)
    model = googlegenai.GenerativeModel('gemini-2.5-flash-preview-04-17')
    path = image_path
    image = Image.open(path)
    prompt = f'''{case}''' + f"Based on the above test case and figma structural data , can you determine which icon the mouse should move to? If not, please just answer 'No'. If yes, please describe the icon approximately by its position, color, text, or other features. figma structural data : {figma_data}"
    response = model.generate_content([prompt, image])
    return response.text

def capture_screen(path='screen.png'):
    """ Capture the screen and save it as a file """
    screenshot = pyautogui.screenshot()
    screenshot.save(path)
    return Image.open(path)

def images_are_equal(img):
    """ Compare two images for equality """
    diff = ImageChops.difference(img,pyautogui.screenshot())
    return not diff.getbbox()

class position_scheme(BaseModel):
    x: str
    y: str

class check_scheme(BaseModel):
    ans: str

def generate_position(api_key: str, description: str, image_path: str):
    prompt = "Based on the following description and the full computer screen screenshot (note: the entire image is included, including black borders), assuming the top is 0, bottom is 1, left is 0, right is 1, where is the button approximately located on the screen? Description: " + description
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.5-flash-preview-04-17',
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type='image/jpeg',
            ),
            prompt
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": position_scheme
        }
    )
    return json.loads(response.text)

# def check_button(api_key: str, case: dict, image_path: str) -> str:
#     prompt = f'''{case}''' + "Based on the above test case, can you determine if the icon to click is currently on the screen? Please answer Yes or No."
#     with open(image_path, 'rb') as f:
#         image_bytes = f.read()
#     client = genai.Client(api_key=api_key)
#     response = client.models.generate_content(
#         model='gemini-2.5-flash-preview-04-17',
#         contents=[
#             types.Part.from_bytes(
#                 data=image_bytes,
#                 mime_type='image/jpeg',
#             ),
#             prompt
#         ],
#         config={
#             "response_mime_type": "application/json",
#             "response_schema": check_scheme
#         }
#     )
#     return json.loads(response.text)

def find_and_click(position: dict):
    x = float(position['x'])
    y = float(position['y'])
    screen_width, screen_height = pyautogui.size()
    print('x:', x * screen_width)
    print('y:', y * screen_height)
    pyautogui.moveTo(x * screen_width, y * screen_height, duration=0.5)
    pyautogui.click()

def get_frame_list(figma_data : dict) :    
    output = []
    for page in figma_data["document"]["children"]:
        page_name = page["name"]
        # print(f"\nPage: {page_name}")
    
    # Loop through top-level elements in the page
        for node in page.get("children", []):
            if node["type"] == "FRAME":
                node_name = node["name"]
                raw_id = node["id"]
                node_id = raw_id.replace(":", "-")
                output.append(node_id)
                # print(f"  FRAME: {node_name} → node-id: {node_id}")
    return output

def agent_execute(api_key: str, project_key : str , project_name : str , case: dict, fig_data: dict,frame_list: list, image_path: str = 'screen.png', scroll_amount: int = -1500, wait_between_scrolls: int = 1.0):
    """
    Intelligent agent workflow:
    1. Find the target page node ID, build the URL, and visit the page
    2. Continuously capture screenshots to check if there's an element to click
    3. If not, scroll the page until found or reaching the end

    :param api_key: Gemini API key
    :param case: Test case dictionary
    :param fig_data: Figma structured data dictionary
    :param image_path: Screenshot save path
    :param scroll_amount: Scroll amount per action (negative for down, positive for up)
    :param wait_between_scrolls: Seconds to wait after each scroll
    """
    # Step 1: Find page node ID
    page_info = find_page_id(api_key, case, fig_data, frame_list)
    page_node_id = page_info["node_id"]
    if not page_node_id:
        print("Failed to retrieve page node ID.")
        return

    # Step 2: Build URL and visit
    target_url = f"https://www.figma.com/proto/{project_key}/{project_name}?node-id={page_node_id}"
    print(f"Navigating to URL: {target_url}")
    webbrowser.open(target_url)
    time.sleep(10)  # Wait for the page to load

    # Step 3: Screenshot check
    while True:
        previous_img = capture_screen(image_path)
        description = generate_description(api_key, case, image_path,fig_data)
        print(description)
        if 'No' not in description.strip()[:3]:
            print("Found clickable element, preparing to click...")
            position = generate_position(api_key, description, image_path)
            find_and_click(position)
            print("Click completed!")
            break

        # Step 4: Scroll page
        pyautogui.scroll(scroll_amount)
        print("Scrolling, checking if the screen has changed...")
        time.sleep(wait_between_scrolls)
        if images_are_equal(previous_img):
            print("Screen unchanged, reached end of scroll. Stopping task.")
            return
if __name__ == "__main__" :
    load_dotenv()
    api_key = os.getenv("GEMENI_KEY")  
    token = os.getenv("FIGMA_ACCESS_TOKEN")
    parser = argparse.ArgumentParser(description="get figma frame form figma url")
    parser.add_argument("fig_url", help="Figma desing/file URL")
    parser.add_argument("json_path", help="json file path")
    args = parser.parse_args()
    with open(args.json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    proj = parse_figma_url(args.fig_url)
    figma_data = get_figma_file_data(proj['project_key'],token)
    filtered_figma_data = filter_component(figma_data)
    frame_list = get_frame_list(figma_data)
    print(data['Feature 1']['bdd_style_descriptions'][4])
    agent_execute(api_key,proj['project_key'],proj['project_name'],data['Feature 1']['bdd_style_descriptions'][4],filtered_figma_data,frame_list)
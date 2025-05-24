import requests
import json
from typing import Dict, Any, List, Optional
import re

##input figma desing/file url to get file_key for using figma api
def parse_figma_url(url: str) -> str:
    """
    Extract the file key from a Figma URL (supports /file/ or /design/ links).
    """
    pattern = r"https://www\.figma\.com/(file|design)/([a-zA-Z0-9]+)"
    match = re.search(pattern, url)
    if not match:
        raise ValueError("Invalid Figma URL format.")
    return match.group(2)

##input file key and access token to retrieve a specific frame
def get_figma_file_data(file_key: str, token: str) -> Dict[str, Any]:
    headers = {
     'X-Figma-Token': token
    }
    url = f"https://api.figma.com/v1/files/{file_key}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    import argparse
    from dotenv import load_dotenv
    import os
    load_dotenv()
    token = os.getenv("FIGMA_ACCESS_TOKEN")
    parser = argparse.ArgumentParser(description="get figma frame form figma url")
    parser.add_argument("fig_url", help="Figma desing/file URL")
    args = parser.parse_args()
    file_key = parse_figma_url(args.fig_url)
    result = get_figma_file_data(file_key,token)
    with open("figma_url_parsing_result.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

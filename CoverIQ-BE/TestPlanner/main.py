# main.py
import os
import argparse
import json
from figma_frame_parser import parse_figma_url,get_figma_file_data
from feature_representation import filter_component
from llm_test_plan_generator import generate_test_plan
from bdd_style_test_case_generator import generate_test_case
from dotenv import load_dotenv 

# input figma url and feature description (optional) to get test plan and bdd style test case
def main():
    load_dotenv()  
    api_key = os.getenv("GEMINI_API_KEY")  
    token = os.getenv("FIGMA_ACCESS_TOKEN")
    parser = argparse.ArgumentParser(description="get figma frame form figma url")
    parser.add_argument("fig_url", help="Figma desing/file URL")
    parser.add_argument("--feature_path",  help="Optional feature description text file",default=None)
    args = parser.parse_args()
    file_key = parse_figma_url(args.fig_url)
    figma_file_data = get_figma_file_data(file_key,token)
    if args.feature_path :
        with open(args.feature_path, "r", encoding="utf-8") as f:
            feature_description = f.read()
        feature_list = filter_component(figma_file_data , feature_description)
    else :
        feature_list = filter_component(figma_file_data )
    test_plan = generate_test_plan(feature_list,api_key)
    with open("test_plan.json", "w", encoding="utf-8") as f:
        json.dump(test_plan, f, ensure_ascii=False, indent=2)
    test_case = generate_test_case(test_plan,api_key) 
    with open("test_case.json", "w", encoding="utf-8") as f:
        json.dump(test_case, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()

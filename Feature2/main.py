# main.py
import subprocess
import tempfile
import os
import sys
from pathlib import Path
import argparse
import shutil
import stat
import json
from get_diff import get_git_diff
from diff_mapper import map_diff_to_features
from test_plan_generator import generate_test_plan

def main():
    parser = argparse.ArgumentParser(description="Show git diff between two commits in a GitHub repo")
    parser.add_argument("repo_url", help="GitHub repository URL")
    parser.add_argument("--from", dest="from_commit", default="HEAD^", help="Base commit (default: HEAD^)")
    parser.add_argument("--to", dest="to_commit", default="HEAD", help="Target commit (default: HEAD)")
    parser.add_argument("--keep", action="store_true", help="Keep cloned repo after diff (default: delete)")
    parser.add_argument("--output", help="File path to save diff output (optional)")
    parser.add_argument("--description_file", dest="desc_path", required=True, help="Path to your feature description text file")
    parser.add_argument("--api_key", dest="api", required=True, help="Gemini API key")
    args = parser.parse_args()
    with open(args.desc_path, "r", encoding="utf-8") as f:
        description_text = f.read()
    diff_content=get_git_diff(args.repo_url, args.from_commit, args.to_commit, args.keep)
    feature_diff_map = map_diff_to_features(description_text, diff_content, args.api)
    test_plan = generate_test_plan(feature_diff_map["result"], args.api)
    with open("test_plan.json", "w", encoding="utf-8") as f:
        json.dump(test_plan, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()

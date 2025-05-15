import subprocess
import tempfile
import os
import sys
from pathlib import Path
import argparse
import shutil
import stat

def remove_readonly(func, path, _):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def run_command(cmd, cwd=None):
    result = subprocess.run(cmd, shell=True, text=True, capture_output=True, cwd=cwd,encoding="utf-8", errors="replace")
    if result.returncode != 0:
        print(f"Error running command: {cmd}")
        print(result.stderr)
        sys.exit(1)
    return result.stdout

def get_git_diff(repo_url, from_commit, to_commit, keep_repo):
    if keep_repo:
        temp_dir = Path("./cloned_repo")
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        os.makedirs(temp_dir, exist_ok=True)
    else:
        temp_dir = Path(tempfile.mkdtemp())

    repo_name = repo_url.rstrip('/').split('/')[-1].replace('.git', '')
    repo_path = temp_dir / repo_name

    print(f"Cloning {repo_url} into {repo_path}")
    run_command(f"git clone {repo_url}", cwd=temp_dir)

    print(f"Fetching diff: {from_commit} -> {to_commit}")
    diff_output = run_command(f"git diff {from_commit} {to_commit}", cwd=repo_path)

    # if output_path:
    #     with open(output_path, 'w', encoding='utf-8') as f:
    #         f.write(diff_output)
    #     print(f"Diff saved to {output_path}")
    # else:
    #     print(diff_output)

    if not keep_repo:
        shutil.rmtree(temp_dir, onerror=remove_readonly)
    return diff_output

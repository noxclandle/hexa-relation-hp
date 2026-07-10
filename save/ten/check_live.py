#!/usr/bin/env python3
import os
import json
import urllib.request
import re
import subprocess
from datetime import datetime

# チャンネル設定
CHANNEL_HANDLE = '@TENpon_ch'
TARGET_URL = f'https://www.youtube.com/{CHANNEL_HANDLE}/live'
JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'live_status.json')

def check_youtube_live():
    print(f"[{datetime.now()}] Checking live status for {CHANNEL_HANDLE}...")
    req = urllib.request.Request(
        TARGET_URL,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching YouTube page: {e}")
        return None, None
        
    is_live = ('"isLive":true' in html) or ('"isLiveContent":true' in html)
    video_id = None
    
    if is_live:
        # videoId を抽出
        match = re.search(r'"videoId":"([^"]+)"', html)
        if match:
            video_id = match.group(1)
            print(f"Live detected! Video ID: {video_id}")
        else:
            print("Live detected, but Video ID could not be extracted.")
    else:
        print("Not live.")
        
    return is_live, video_id

def main():
    is_live, video_id = check_youtube_live()
    if is_live is None:
        return # 取得失敗時は何もしない
        
    # 現在のステータスをロード
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, 'r', encoding='utf-8') as f:
                current_data = json.load(f)
        except Exception:
            current_data = {"isLive": False, "videoId": None}
    else:
        current_data = {"isLive": False, "videoId": None}
        
    # 変化があるかチェック
    state_changed = (current_data.get("isLive") != is_live) or (current_data.get("videoId") != video_id)
    
    if state_changed:
        print("Live status state changed! Updating JSON and pushing to repository...")
        new_data = {
            "isLive": is_live,
            "videoId": video_id,
            "lastChecked": datetime.now().isoformat()
        }
        
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=2, ensure_ascii=False)
            
        # Git コマンドでプッシュ (GitHub Actions上ではない場合のみ実行)
        if "GITHUB_ACTIONS" not in os.environ:
            try:
                # カレントディレクトリをプロジェクトルートにするために移動
                project_dir = os.path.dirname(os.path.abspath(__file__))
                os.chdir(project_dir)
                
                # git status を確認し、変更があればコミット
                subprocess.run(["git", "add", "live_status.json"], check=True)
                commit_msg = f"auto-update: ten live status changed (isLive={is_live}, videoId={video_id})"
                subprocess.run(["git", "commit", "-m", commit_msg], check=True)
                subprocess.run(["git", "push"], check=True)
                print("Successfully updated and pushed new status to remote repository.")
            except Exception as git_err:
                print(f"Git operations failed: {git_err}")
        else:
            print("Running on GitHub Actions. Skipping internal git operations.")
    else:
        print("No change in live status.")

if __name__ == '__main__':
    main()

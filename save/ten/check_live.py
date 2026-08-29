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
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            # GitHub Actions は海外IPのため、明示しないと英語表記のHTMLが返り登録者数を取り逃す
            'Accept-Language': 'ja,en;q=0.8',
            'Cookie': 'CONSENT=YES+cb; SOCS=CAI',
        }
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

    subscriber_count = extract_subscriber_count(html)
    if subscriber_count is not None:
        print(f"Subscriber count: {subscriber_count}")
    else:
        print("Subscriber count could not be extracted.")

    return is_live, video_id, subscriber_count


def extract_subscriber_count(html):
    """チャンネル登録者数を抽出する。

    /live は「配信中なら watch ページ」「配信していなければチャンネルページ」と
    別物のHTMLが返り、登録者数の埋まっている場所が違う。片方しか見ていないと
    取得できずに前回値を維持し続けてしまうため、両方のパターンを順に試す。
    """
    # 1) watch ページ (配信中): subscriberCountText の近傍にある
    for m in re.finditer(r'"subscriberCountText"', html):
        seg = html[m.start():m.start() + 300]
        hit = re.search(r'チャンネル登録者数\s*([\d,]+)人', seg)
        if hit:
            return int(hit.group(1).replace(',', ''))
        hit = re.search(r'([\d,.]+)([KMB]?)\s*subscribers', seg)
        if hit:
            return _parse_en_count(hit.group(1), hit.group(2))

    # 2) チャンネルページ (配信していないとき): メタ情報の content に入っている
    hit = re.search(r'"content":"\s*チャンネル登録者数\s*([\d,]+)人"', html)
    if hit:
        return int(hit.group(1).replace(',', ''))
    hit = re.search(r'"content":"\s*([\d,.]+)([KMB]?)\s*subscribers"', html)
    if hit:
        return _parse_en_count(hit.group(1), hit.group(2))

    return None


def _parse_en_count(num, unit):
    """英語表記 (例: 2.02K subscribers) を数値に変換する"""
    try:
        value = float(num.replace(',', ''))
    except ValueError:
        return None
    return int(value * {'': 1, 'K': 1000, 'M': 1000000, 'B': 1000000000}[unit])

def main():
    is_live, video_id, subscriber_count = check_youtube_live()
    if is_live is None:
        return # 取得失敗時は何もしない

    # 現在のステータスをロード
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, 'r', encoding='utf-8') as f:
                current_data = json.load(f)
        except Exception:
            current_data = {"isLive": False, "videoId": None, "subscriberCount": None}
    else:
        current_data = {"isLive": False, "videoId": None, "subscriberCount": None}

    # 登録者数が取得できなかった場合は前回の値を維持する
    if subscriber_count is None:
        subscriber_count = current_data.get("subscriberCount")

    # 変化があるかチェック
    state_changed = (
        (current_data.get("isLive") != is_live)
        or (current_data.get("videoId") != video_id)
        or (current_data.get("subscriberCount") != subscriber_count)
    )

    if state_changed:
        print("Live status state changed! Updating JSON and pushing to repository...")
        new_data = {
            "isLive": is_live,
            "videoId": video_id,
            "subscriberCount": subscriber_count,
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
                # GitHub Actions 側も同じファイルを更新するため、pull しないと push が
                # 拒否され続け、更新がサイトに反映されないまま溜まっていく
                subprocess.run(["git", "pull", "--rebase", "--autostash"], check=True)
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

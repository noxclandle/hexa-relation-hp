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
        return None, None, None
        
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

def load_current_status():
    if not os.path.exists(JSON_PATH):
        return {"isLive": False, "videoId": None, "subscriberCount": None}
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {"isLive": False, "videoId": None, "subscriberCount": None}


def git(*args, check=True):
    return subprocess.run(
        ["git", *args],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        check=check, capture_output=True, text=True,
    )


def is_local_git_run():
    """GitHub Actions 以外で、かつ git リポジトリ内で動いているか"""
    if "GITHUB_ACTIONS" in os.environ:
        return False
    return git("rev-parse", "--git-dir", check=False).returncode == 0


def sync_with_remote():
    """JSONを書き換える *前* に origin と同期しておく。

    書き換えたあとに pull すると、GitHub Actions 側の更新とぶつかって
    rebase が競合状態のまま止まり、リポジトリが壊れた状態で放置される。
    書き換え前なら競合するローカル変更が存在しないので安全に同期できる。
    """
    git_dir = git("rev-parse", "--git-dir").stdout.strip()
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), git_dir)
    # 前回の実行が途中で止まっていたら自己修復する
    for leftover in ("rebase-merge", "rebase-apply"):
        if os.path.exists(os.path.join(base, leftover)):
            print("Found an interrupted rebase. Aborting it before continuing.")
            git("rebase", "--abort", check=False)
            break

    result = git("pull", "--rebase", "--autostash", check=False)
    if result.returncode != 0:
        print(f"git pull failed, skipping this run: {result.stderr.strip()}")
        git("rebase", "--abort", check=False)
        return False
    return True


def commit_and_push(is_live, video_id):
    """更新をpushする。失敗したら自分のコミットだけ取り消して次回に委ねる。"""
    git("add", "live_status.json", check=False)
    commit_msg = f"auto-update: ten live status changed (isLive={is_live}, videoId={video_id})"
    committed = git("commit", "-m", commit_msg, check=False)
    if committed.returncode != 0:
        print(f"Nothing to commit, skipping push: {committed.stdout.strip()}")
        return

    if git("push", check=False).returncode == 0:
        print("Successfully updated and pushed new status to remote repository.")
        return

    # push が弾かれた場合、コミットを残すと次回以降ずっと分岐したままになる。
    # 自分が今作ったコミットだけを取り消し、他の作業には触れない。
    print("Push was rejected. Rolling back this commit; the next run will retry.")
    git("reset", "--mixed", "HEAD~1", check=False)
    git("checkout", "--", "live_status.json", check=False)


def main():
    is_live, video_id, subscriber_count = check_youtube_live()
    if is_live is None:
        return # 取得失敗時は何もしない

    local_git = is_local_git_run()
    if local_git and not sync_with_remote():
        return

    # 同期後の値と比較する (pull で他所の更新が入っている可能性がある)
    current_data = load_current_status()

    # 登録者数が取得できなかった場合は前回の値を維持する
    if subscriber_count is None:
        subscriber_count = current_data.get("subscriberCount")

    state_changed = (
        (current_data.get("isLive") != is_live)
        or (current_data.get("videoId") != video_id)
        or (current_data.get("subscriberCount") != subscriber_count)
    )

    if not state_changed:
        print("No change in live status.")
        return

    print("Live status state changed! Updating JSON...")
    new_data = {
        "isLive": is_live,
        "videoId": video_id,
        "subscriberCount": subscriber_count,
        "lastChecked": datetime.now().isoformat()
    }
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, indent=2, ensure_ascii=False)

    # GitHub Actions 上ではワークフロー側がコミット・pushを行う
    if local_git:
        commit_and_push(is_live, video_id)
    else:
        print("Running on GitHub Actions. Skipping internal git operations.")


if __name__ == '__main__':
    main()

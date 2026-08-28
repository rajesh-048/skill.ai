#!/usr/bin/env python3
"""
SkillSphere AI — Backend Keep-Alive Script
Pings the Render backend every 10 minutes to prevent cold starts.
Run locally: python keep-alive.py
Run in background: pythonw keep-alive.py (Windows) or nohup python keep-alive.py & (Linux/Mac)
"""

import os
import urllib.request
import json
import time
import sys
from datetime import datetime

BACKEND_URL = "https://skillsphere-backend-k1kw.onrender.com/api/health"
INTERVAL_MINUTES = 10
LOG_FILE = r"D:\sih\keep-alive.log"


def ping():
    """Ping the backend health endpoint and log the result."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        req = urllib.request.Request(BACKEND_URL, method="GET")
        start = time.time()
        resp = urllib.request.urlopen(req, timeout=30)
        elapsed = (time.time() - start) * 1000
        status = json.loads(resp.read().decode())
        msg = f"[{timestamp}] OK ({elapsed:.0f}ms) - {status.get('status', 'unknown')}"
    except Exception as e:
        msg = f"[{timestamp}] FAIL - {str(e)[:100]}"

    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")
        f.flush()


def main():
    print(f"SkillSphere Backend Keep-Alive started")
    print(f"   URL: {BACKEND_URL}")
    print(f"   Interval: {INTERVAL_MINUTES} minutes")
    print(f"   Log: {LOG_FILE}")
    print(f"   Press Ctrl+C to stop\n")

    while True:
        ping()
        time.sleep(INTERVAL_MINUTES * 60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nKeep-alive stopped.")
        sys.exit(0)

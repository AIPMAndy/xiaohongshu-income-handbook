#!/usr/bin/env python3
"""Verify deployed GitHub Pages bytes, not only the deployment workflow status."""
from __future__ import annotations
from hashlib import sha256
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import time

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aipmandy.github.io/xiaohongshu-income-handbook/"
PATHS = [
    "index.html",
    "source-audit.html",
    "assets/data.js",
    "assets/source-audit.js",
    "assets/source-audit.css",
    "robots.txt",
    "sitemap.xml",
    "pdf/xiaohongshu-income-handbook-guide.pdf",
]


def verify_one(path: str, attempts: int = 8) -> None:
    expected = sha256((ROOT / path).read_bytes()).hexdigest()
    url = BASE + path
    for attempt in range(attempts):
        try:
            req = Request(url + f"?deploy-check={expected[:12]}",
                          headers={"User-Agent": "Andy-site-live-verify/1.0", "Cache-Control": "no-cache"})
            with urlopen(req, timeout=22) as response:
                actual = sha256(response.read()).hexdigest()
                status = response.status
            if status == 200 and actual == expected:
                print(f"PASS HTTP {status} SHA256 {path} {actual}")
                return
            detail = f"HTTP {status}, expected {expected}, got {actual}"
        except (HTTPError, URLError, TimeoutError) as exc:
            detail = repr(exc)
        if attempt < attempts - 1:
            time.sleep(7)
    raise RuntimeError(f"Live mismatch for {url}: {detail}")


if __name__ == "__main__":
    for resource in PATHS:
        verify_one(resource)
    print(f"PASS: {len(PATHS)} deployed resources have exact source hashes.")

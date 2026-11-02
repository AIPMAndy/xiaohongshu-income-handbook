#!/usr/bin/env bash
set -euo pipefail
REPO="AIPMAndy/xiaohongshu-income-handbook"
cd "$(dirname "$0")/.."
command -v git >/dev/null || { echo 'Please install Git.'; exit 1; }
command -v gh >/dev/null || { echo 'Please install GitHub CLI: https://cli.github.com/'; exit 1; }
gh auth status >/dev/null || { echo 'Please run: gh auth login'; exit 1; }
python3 tests/check_project.py
if [[ ! -d .git ]]; then git init -b main; fi
git add .
if ! git diff --cached --quiet; then git commit -m 'Open-source Xiaohongshu income handbook (Apple-style V3)'; fi
if gh repo view "$REPO" >/dev/null 2>&1; then
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/${REPO}.git"
else
  gh repo create "$REPO" --public --description '小红书赚钱保姆级教程｜26章·78步骤·7条变现路径·30天实战·免费开源' --source . --remote origin
fi
git push -u origin HEAD:main
echo "Published: https://github.com/${REPO}"
echo 'To deploy the site: Settings → Pages → Source → GitHub Actions'

#!/bin/bash
# バックアップ一覧表示スクリプト

echo "=================================="
echo "📦 バックアップ一覧"
echo "=================================="
echo ""

# プロジェクト全体バックアップ
echo "【プロジェクト全体バックアップ】"
echo "-----------------------------------"
echo "バージョン: v1.0-stable"
echo "日時: 2025-12-13 22:28 JST"
echo "Gitコミット: 51a574c"
echo "URL: https://www.genspark.ai/api/files/s/U9VbiWXx"
echo "サイズ: 545 KB"
echo "内容: 全ソースコード + データベース + Git履歴"
echo ""

# データベースバックアップ一覧
echo "【データベースバックアップ】"
echo "-----------------------------------"
if [ -d "backups" ]; then
  found=0
  for file in backups/database_backup_*.sql backups/db_*.sql; do
    if [ -f "$file" ]; then
      found=1
      size=$(ls -lh "$file" | awk '{print $5}')
      date=$(stat -c %y "$file" | cut -d' ' -f1,2 | cut -d'.' -f1)
      echo "ファイル: $(basename $file)"
      echo "サイズ: $size"
      echo "日時: $date"
      echo ""
    fi
  done
  if [ $found -eq 0 ]; then
    echo "バックアップファイルが見つかりません"
    echo ""
  fi
else
  echo "バックアップディレクトリが見つかりません"
  echo ""
fi

# Gitタグ一覧
echo "【Gitタグ（復元ポイント）】"
echo "-----------------------------------"
git tag -l -n1 2>/dev/null || echo "Gitタグなし"
echo ""

# 最近のコミット
echo "【最近のコミット（最新5件）】"
echo "-----------------------------------"
git log --oneline -5 2>/dev/null || echo "Git履歴なし"
echo ""

echo "=================================="
echo "復元方法: cat BACKUP_INFO.md"
echo "=================================="

# 飲食店向けCMSプロトタイプ

高級和食店向けの多言語対応ホームページCMSシステムのプロトタイプ

## 🎯 プロジェクト概要

- **対象**: 高級業態の和食店（客単価1万円程度）
- **目的**: 管理画面から全コンテンツを更新可能なホームページシステム
- **将来展望**: 100店舗以上への販売を想定したマルチテナント化

## 🌐 公開URL

- **フロントエンド**: https://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai
- **管理画面**: https://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai/admin/login
  - **ユーザー名**: admin
  - **パスワード**: admin123

## ✅ 完成済み機能

### フロントエンド
- ✅ レスポンシブデザイン（PC・スマホ対応）
- ✅ メインイメージスライダー（画像・動画対応、最大3つ）
- ✅ こだわり情報セクション（1〜6個）
- ✅ ご挨拶セクション（写真・タイトル・挨拶文）
- ✅ メニュー画像スワイプギャラリー（最大50枚）
- ✅ 宴会コースセクション（表示/非表示切替可能）
- ✅ 新着情報（表示個数指定可能）
- ✅ 写真ギャラリー（画像拡大表示機能付き）
- ✅ 店舗情報・アクセス
- ✅ Googleマップ埋め込み
- ✅ よくある質問（FAQ）
- ✅ 予約ボタン（URL/電話番号指定可能）
- ✅ お問い合わせフォーム（Googleフォーム埋め込み）

### 管理画面
- ✅ ログイン認証機能
- ✅ ダッシュボード
- ✅ 店舗情報編集
  - 基本情報（店名、電話番号、住所、最寄り駅、駐車場、決済方法）
  - 予約設定（URL/電話番号）
  - お問い合わせフォーム設定
  - SEO設定（タイトル、説明文、キーワード）
  - アクセス解析設定（GA4、Clarity）

### SEO・Analytics
- ✅ メタタグ管理（title、description、keywords）
- ✅ Google Analytics 4 対応
- ✅ Microsoft Clarity 対応
- ✅ LLMO対策（構造化されたFAQ）

## 🚧 未実装機能

### 管理画面の追加編集機能（優先度：高）
- ⏳ メインイメージ管理（画像・動画アップロード）
- ⏳ こだわり情報管理（追加・編集・削除・並び替え）
- ⏳ ご挨拶編集
- ⏳ メニュー画像管理（アップロード・並び替え）
- ⏳ 宴会コース管理（追加・編集・削除）
- ⏳ 新着情報管理（追加・編集・削除）
- ⏳ ギャラリー管理（画像アップロード・編集）
- ⏳ FAQ管理（追加・編集・削除・並び替え）

### 画像アップロード機能（優先度：高）
- ⏳ R2ストレージへの画像アップロード
- ⏳ 画像プレビュー機能
- ⏳ 動画アップロード（最大100MB）
- ⏳ 画像の自動リサイズ・最適化

### 多言語化（優先度：中）
- ⏳ 日本語・英語・中国語・韓国語対応
- ⏳ 言語切り替え機能
- ⏳ 管理画面からの多言語コンテンツ編集

### マルチテナント化（将来対応）
- ⏳ 店舗ごとの独立したデータベース
- ⏳ 独自ドメイン対応
- ⏳ 店舗オーナー用アカウント管理

## 💾 データ構造

### データベース (Cloudflare D1)
- `admin_users` - 管理者認証
- `store_info` - 店舗基本情報
- `main_images` - メインイメージ（画像・動画）
- `commitment_items` - こだわり情報
- `greeting` - ご挨拶
- `menu_images` - メニュー画像
- `banquet_courses` - 宴会コース
- `news` - 新着情報
- `gallery` - 写真ギャラリー
- `faq` - よくある質問
- `site_settings` - サイト設定

### ストレージ (Cloudflare R2)
- 画像・動画ファイルの保存（予定）

## 🛠️ 技術スタック

### フロントエンド
- TailwindCSS - スタイリング
- Swiper.js - スライダー・ギャラリー
- Axios - API通信
- Font Awesome - アイコン
- Google Fonts (Noto Serif JP, Noto Sans JP)

### バックエンド
- Hono - 軽量Webフレームワーク
- TypeScript - 型安全な開発
- Cloudflare Pages - ホスティング
- Cloudflare Workers - エッジ実行環境
- Cloudflare D1 - SQLiteデータベース
- Cloudflare R2 - オブジェクトストレージ

## 📝 ローカル開発

### セットアップ
\`\`\`bash
# 依存関係のインストール
npm install

# データベースマイグレーション（ローカル）
npm run db:migrate:local

# シードデータ投入
npm run db:seed

# ビルド
npm run build

# 開発サーバー起動
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs webapp --nostream
\`\`\`

### データベース管理
\`\`\`bash
# ローカルDBリセット
npm run db:reset

# ローカルDBクエリ実行
npm run db:console:local

# 本番DBマイグレーション
npm run db:migrate:prod
\`\`\`

## 🚀 デプロイ

### Cloudflare Pages へのデプロイ
\`\`\`bash
# ビルド
npm run build

# デプロイ
npm run deploy:prod
\`\`\`

## 📋 次のステップ

### Phase 1: 管理画面完成（優先度：高）
1. 各コンテンツの編集画面実装
2. R2画像アップロード機能実装
3. 画像プレビュー・管理機能

### Phase 2: UX改善
1. ドラッグ&ドロップでの並び替え
2. リアルタイムプレビュー
3. 一括編集機能

### Phase 3: 多言語化
1. 言語切り替え機能
2. 多言語コンテンツ管理
3. 自動翻訳連携

### Phase 4: マルチテナント化
1. 店舗管理機能
2. 独自ドメイン対応
3. プラン・課金システム

## 🎨 テーマシステム（スキン変更）

### CSS構造
プロジェクトは3層のCSS構造になっています：

1. **base.css** - 基本構造・レイアウト（変更不要）
2. **theme-*.css** - デザイン要素（CSS変数で定義）
3. **style.css** - 追加カスタマイズ用

### テーマ作成方法

新しいテーマを作成する場合：

1. `public/static/theme-custom.css` を作成
2. CSS変数を定義（色、フォント、角丸など）
3. データベースの `site_settings` で `theme = 'custom'` に設定

### CSS変数一覧

```css
:root {
  /* カラー */
  --color-primary: #8B4513;
  --color-secondary: #D2691E;
  --color-accent: #F4A460;
  
  /* フォント */
  --font-main: 'Noto Sans JP', sans-serif;
  --font-heading: 'Noto Serif JP', serif;
  
  /* スペーシング */
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  /* ボーダー */
  --border-radius-md: 0.5rem;
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### AIエージェントでテーマ生成

1. デザイン画像をアップロード
2. カスタムエージェントがCSS変数を生成
3. `theme-custom.css` として保存
4. データベースで切り替え

### 既存テーマ

- **theme-default.css** - 高級和食（茶色系）
- **theme-modern.css** - モダン・洗練（ネイビー系）

### デザインのカスタマイズ

基本構造を変えずに、CSS変数のみでカスタマイズできます：

- カラーテーマ変更
- フォント変更
- 角丸・シャドウ調整
- スペーシング調整

## 📱 動作確認済み環境

- Chrome (最新版)
- Safari (最新版)
- Firefox (最新版)
- Edge (最新版)
- iOS Safari
- Android Chrome

## 📄 ライセンス

プロトタイプ版 - 商用利用前に適切なライセンスを設定すること

## 🔧 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

---

**最終更新日**: 2024-12-13

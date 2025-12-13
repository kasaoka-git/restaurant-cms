# テーマ作成ガイド

## 📋 概要

このシステムでは、CSS変数を使用した柔軟なテーマシステムを採用しています。
デザインを変更する際は、HTMLやJavaScriptを変更せずに、CSSファイルのみで完結します。

## 🎨 CSS構造

### 3層のCSS構造

```
public/static/
├── base.css           # 基本構造・レイアウト（変更不要）
├── theme-default.css  # デフォルトテーマ（高級和食）
├── theme-modern.css   # モダンテーマ（サンプル）
└── style.css          # 追加カスタマイズ用（通常は空）
```

### 各ファイルの役割

#### 1. base.css（変更禁止）
- グリッドレイアウト
- フレックスボックス構造
- レスポンシブブレークポイント
- 基本的なアニメーション構造
- Swiper構造

**このファイルは絶対に変更しないでください。**

#### 2. theme-*.css（テーマファイル）
- 色（CSS変数）
- フォント
- 影・グラデーション
- ボーダー・角丸
- アニメーション速度

**新しいテーマを作成する際はこのファイルをコピーして編集します。**

#### 3. style.css（オプション）
- テーマに依存しない追加スタイル
- 特殊なカスタマイズ

## 🚀 新しいテーマの作成方法

### Step 1: テーマファイルをコピー

```bash
cp public/static/theme-default.css public/static/theme-custom.css
```

### Step 2: CSS変数を編集

`theme-custom.css`を開いて、以下の変数を変更：

```css
:root {
  /* カラー変更例 */
  --color-primary: #FF6B6B;      /* 赤系に変更 */
  --color-secondary: #4ECDC4;    /* 青緑系に変更 */
  --color-accent: #FFE66D;       /* 黄色系に変更 */
  
  /* フォント変更例 */
  --font-main: 'Helvetica', sans-serif;
  --font-heading: 'Georgia', serif;
  
  /* 角丸変更例（フラットデザイン） */
  --border-radius-sm: 0px;
  --border-radius-md: 0px;
  --border-radius-lg: 0px;
}
```

### Step 3: データベースで切り替え

```sql
UPDATE site_settings 
SET setting_value = 'custom' 
WHERE setting_key = 'theme';
```

または、管理画面で切り替え（将来実装予定）。

## 📝 CSS変数リファレンス

### カラー系

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `--color-primary` | プライマリーカラー | #8B4513 |
| `--color-secondary` | セカンダリーカラー | #D2691E |
| `--color-accent` | アクセントカラー | #F4A460 |
| `--color-dark` | ダークカラー | #2C1810 |

### 背景色

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `--bg-primary` | メイン背景 | #FFFFFF |
| `--bg-secondary` | セカンダリー背景 | #F9FAFB |
| `--bg-dark` | フッター背景 | #2C1810 |

### テキストカラー

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `--text-primary` | メインテキスト | #1F2937 |
| `--text-secondary` | セカンダリーテキスト | #6B7280 |
| `--text-light` | 薄いテキスト | #9CA3AF |
| `--text-on-dark` | ダーク背景上のテキスト | #FFFFFF |

### フォント

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `--font-main` | メインフォント | 'Noto Sans JP' |
| `--font-heading` | 見出しフォント | 'Noto Serif JP' |
| `--font-weight-normal` | 通常の太さ | 400 |
| `--font-weight-medium` | 中間の太さ | 500 |
| `--font-weight-bold` | 太字 | 700 |

### スペーシング

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `--spacing-xs` | 極小 | 0.25rem |
| `--spacing-sm` | 小 | 0.5rem |
| `--spacing-md` | 中 | 1rem |
| `--spacing-lg` | 大 | 1.5rem |
| `--spacing-xl` | 極大 | 2rem |
| `--spacing-2xl` | 超大 | 3rem |

### ボーダー・角丸

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `--border-radius-sm` | 小さい角丸 | 0.375rem |
| `--border-radius-md` | 中くらいの角丸 | 0.5rem |
| `--border-radius-lg` | 大きい角丸 | 0.75rem |
| `--border-radius-full` | 完全な円 | 9999px |
| `--border-width` | ボーダー幅 | 1px |
| `--border-color` | ボーダー色 | #E5E7EB |

### シャドウ

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `--shadow-sm` | 小さい影 | 0 1px 2px... |
| `--shadow-md` | 中くらいの影 | 0 4px 6px... |
| `--shadow-lg` | 大きい影 | 0 10px 15px... |
| `--shadow-xl` | 超大きい影 | 0 20px 25px... |

### トランジション

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `--transition-fast` | 速い | 150ms |
| `--transition-normal` | 通常 | 300ms |
| `--transition-slow` | 遅い | 500ms |

## 🤖 AIエージェントでテーマ生成

### Gensparkカスタムエージェントを使用した生成フロー

1. **デザイン画像をアップロード**
   - 完成イメージのスクリーンショット
   - または、デザインモックアップ

2. **プロンプト例**
   ```
   この画像のデザインを基に、CSS変数を生成してください。
   
   以下のテンプレートに従ってください：
   - カラーパレット（primary, secondary, accent）
   - フォント（日本語対応）
   - ボーダー・角丸
   - シャドウ
   
   出力フォーマット: theme-custom.css
   ```

3. **生成されたCSSを確認**
   - エージェントがCSS変数を含むファイルを生成

4. **ファイルをアップロード**
   ```bash
   # public/static/ にアップロード
   public/static/theme-custom.css
   ```

5. **データベースで切り替え**
   ```sql
   UPDATE site_settings 
   SET setting_value = 'custom' 
   WHERE setting_key = 'theme';
   ```

6. **プレビュー確認**
   - フロントエンドでデザインを確認
   - 問題があれば微調整

## 🎯 デザインパターン例

### 和食（高級）- デフォルト
- **カラー**: 茶色系（#8B4513）
- **フォント**: Noto Serif JP
- **角丸**: 中程度（0.5rem）
- **雰囲気**: 落ち着いた・伝統的

### 和食（モダン）- カジュアル
- **カラー**: 明るい色（#FF6B6B）
- **フォント**: Noto Sans JP
- **角丸**: 大きめ（1rem）
- **雰囲気**: 明るい・親しみやすい

### 洋食（エレガント）
- **カラー**: 紺・金（#2C3E50, #F39C12）
- **フォント**: Georgia, Playfair Display
- **角丸**: 小さめ（0.25rem）
- **雰囲気**: 高級・洗練

### カフェ（ナチュラル）
- **カラー**: ベージュ・緑（#D4C5B9, #8FBC8F）
- **フォント**: Quicksand, Nunito
- **角丸**: 大きめ（1rem）
- **雰囲気**: ナチュラル・リラックス

## 🔍 トラブルシューティング

### テーマが適用されない
1. ファイル名を確認（theme-{name}.css）
2. データベースの設定を確認
3. ブラウザキャッシュをクリア

### 一部のスタイルが反映されない
1. CSS変数名のスペルミスを確認
2. `!important` の使用を確認
3. ブラウザの開発者ツールで確認

### フォントが表示されない
1. Google Fonts のインポートを確認
2. フォールバックフォントを指定

## 📚 参考リソース

- [CSS Variables (MDN)](https://developer.mozilla.org/ja/docs/Web/CSS/Using_CSS_custom_properties)
- [Google Fonts](https://fonts.google.com/)
- [Coolors (カラーパレット生成)](https://coolors.co/)
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)

## 💡 ベストプラクティス

1. **CSS変数のみを変更**
   - base.cssは絶対に変更しない
   - 構造とデザインを分離

2. **フォールバックを指定**
   ```css
   --font-main: 'Noto Sans JP', sans-serif;
   ```

3. **コントラストを確認**
   - テキストと背景のコントラスト比を確保
   - アクセシビリティを考慮

4. **テスト環境で確認**
   - 本番適用前に必ずテスト
   - 複数のブラウザで確認

5. **バージョン管理**
   - テーマファイルをGitで管理
   - 変更履歴を残す

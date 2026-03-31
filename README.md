# mdmake

WebページをMarkdownに変換するWindowsデスクトップアプリケーションです。LLMのコンテキスト作成に最適化されています。

## 機能

- **URL指定でWebページをMarkdown変換** — URLを入力するだけでWebページの本文を抽出し、Markdownに変換
- **LLMコンテキスト向け** — 文字数・推定トークン数をリアルタイム表示
- **柔軟なオプション** — 文字閾値の調整、メタデータ（タイトル・ソースURL）の含有/除外
- **出力方法** — クリップボードへコピー、または`.md`ファイルとして保存

## スクリーンショット

<!-- TODO: スクリーンショットを追加 -->

## インストール

[Releases](https://github.com/kongyo2/mdmake/releases)ページから最新のインストーラーをダウンロードしてください。

- **MSI** — Windowsインストーラー形式
- **NSIS** — exe形式のインストーラー

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | [Tauri 2](https://tauri.app/) |
| フロントエンド | React + TypeScript + Vite |
| バックエンド | Rust (reqwest によるHTTP取得) |
| Markdown変換 | [@mizchi/readability](https://github.com/nicedoc/readability) |

## アーキテクチャ

```
ユーザー → URL入力 → [React フロントエンド]
                          ↓ Tauri IPC (fetch_url)
                     [Rust バックエンド] → HTML取得
                          ↓
                     [フロントエンド] → @mizchi/readability → Markdown
                          ↓
                     表示 / コピー / 保存
```

## 開発

### 前提条件

- [Node.js](https://nodejs.org/) (v18以上)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri の前提条件](https://tauri.app/start/prerequisites/)

### コマンド

```bash
# 開発サーバー起動（ホットリロード対応）
npm run tauri dev

# フロントエンドビルド
npm run build

# アプリケーションビルド（MSI/NSISインストーラー生成）
npm run tauri build

# 型チェック
npm run lint
```

## ライセンス

MIT

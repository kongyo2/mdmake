import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { convertHtmlToMarkdown, estimateTokenCount } from "./lib/converter";
import "./App.css";

interface FetchResult {
  html: string;
  url: string;
  status: number;
}

function App() {
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [charThreshold, setCharThreshold] = useState(100);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [stats, setStats] = useState({ chars: 0, tokens: 0 });

  const handleFetch = useCallback(async () => {
    if (!url.trim()) {
      setError("URLを入力してください");
      return;
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    setLoading(true);
    setError(null);
    setMarkdown("");

    try {
      const result = await invoke<FetchResult>("fetch_url", { url: targetUrl });

      if (result.status >= 400) {
        throw new Error(`HTTP Error: ${result.status}`);
      }

      const converted = convertHtmlToMarkdown(result.html, result.url, {
        charThreshold,
        includeMetadata,
      });

      setMarkdown(converted.markdown);
      setStats({
        chars: converted.markdown.length,
        tokens: estimateTokenCount(converted.markdown),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "変換に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [url, charThreshold, includeMetadata]);

  const handleCopy = useCallback(async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, [markdown]);

  const handleSave = useCallback(async () => {
    if (!markdown) return;

    try {
      const filePath = await save({
        filters: [{ name: "Markdown", extensions: ["md"] }],
        defaultPath: "content.md",
      });

      if (filePath) {
        await writeTextFile(filePath, markdown);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  }, [markdown]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !loading) {
        handleFetch();
      }
    },
    [handleFetch, loading]
  );

  return (
    <div className="app">
      <header className="header">
        <h1>mdmake</h1>
        <span className="header-subtitle">Web to Markdown for LLM Context</span>
      </header>

      <div className="input-section">
        <input
          type="text"
          className="url-input"
          placeholder="URLを入力 (例: https://example.com/article)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="options-toggle"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? "オプション -" : "オプション +"}
        </button>
        <button
          className="fetch-btn"
          onClick={handleFetch}
          disabled={loading || !url.trim()}
        >
          {loading ? "変換中..." : "変換"}
        </button>
      </div>

      {showOptions && (
        <div className="options-panel">
          <div className="option-group">
            <label className="option-label">文字閾値:</label>
            <input
              type="number"
              className="option-input"
              value={charThreshold}
              onChange={(e) => setCharThreshold(Number(e.target.value))}
              min={0}
              max={1000}
            />
          </div>
          <div className="option-group">
            <input
              type="checkbox"
              className="option-checkbox"
              id="metadata"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
            />
            <label className="option-label" htmlFor="metadata">
              メタデータを含める
            </label>
          </div>
        </div>
      )}

      <main className="main-content">
        <div className="output-panel">
          <div className="panel-header">
            <span className="panel-title">Markdown出力</span>
            <div className="panel-actions">
              <button
                className="action-btn"
                onClick={handleCopy}
                disabled={!markdown}
              >
                コピー
              </button>
              <button
                className="action-btn primary"
                onClick={handleSave}
                disabled={!markdown}
              >
                保存
              </button>
            </div>
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner" />
              <span>ページを取得中...</span>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {!loading && <div className="markdown-output">{markdown}</div>}
        </div>
      </main>

      <footer className="status-bar">
        <div className="status-info">
          <div className="status-item">
            <span className="status-label">文字数:</span>
            <span className="status-value">{stats.chars.toLocaleString()}</span>
          </div>
          <div className="status-item">
            <span className="status-label">推定トークン:</span>
            <span className="status-value">
              ~{stats.tokens.toLocaleString()}
            </span>
          </div>
        </div>
        <div>@mizchi/readability</div>
      </footer>
    </div>
  );
}

export default App;

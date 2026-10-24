"use client";

import React, { useMemo } from "react";

export type CodeThemeId = "dracula" | "tokyo-night" | "one-dark" | "monokai";

export interface CodeTheme {
  id: CodeThemeId;
  name: string;
  bg: string;
  fg: string;
  lineNo: string;
  lineNoActive: string;
  border: string;
  tag: string;
  attr: string;
  string: string;
  keyword: string;
  number: string;
  comment: string;
  func: string;
  variable: string;
}

export const CODE_THEMES: Record<CodeThemeId, CodeTheme> = {
  dracula: {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    fg: "#f8f8f2",
    lineNo: "#6272a4",
    lineNoActive: "#f8f8f2",
    border: "#44475a",
    tag: "#ff79c6",
    attr: "#8be9fd",
    string: "#f1fa8c",
    keyword: "#ff79c6",
    number: "#bd93f9",
    comment: "#6272a4",
    func: "#50fa7b",
    variable: "#ffb86c",
  },
  "tokyo-night": {
    id: "tokyo-night",
    name: "Tokyo Night",
    bg: "#1a1b26",
    fg: "#c0caf5",
    lineNo: "#565f89",
    lineNoActive: "#c0caf5",
    border: "#292e42",
    tag: "#bb9af7",
    attr: "#7dcfff",
    string: "#9ece6a",
    keyword: "#bb9af7",
    number: "#ff9e64",
    comment: "#565f89",
    func: "#7aa2f7",
    variable: "#e0af68",
  },
  "one-dark": {
    id: "one-dark",
    name: "One Dark Pro",
    bg: "#282c34",
    fg: "#abb2bf",
    lineNo: "#5c6370",
    lineNoActive: "#dcdfe4",
    border: "#3e4451",
    tag: "#e06c75",
    attr: "#e5c07b",
    string: "#98c379",
    keyword: "#c678dd",
    number: "#d19a66",
    comment: "#5c6370",
    func: "#61afef",
    variable: "#e06c75",
  },
  monokai: {
    id: "monokai",
    name: "Monokai",
    bg: "#272822",
    fg: "#f8f8f2",
    lineNo: "#75715e",
    lineNoActive: "#f8f8f2",
    border: "#3e3d32",
    tag: "#f92672",
    attr: "#66d9ef",
    string: "#e6db74",
    keyword: "#f92672",
    number: "#ae81ff",
    comment: "#75715e",
    func: "#a6e22e",
    variable: "#fd971f",
  },
};

interface Token {
  type: "text" | "tag" | "attr" | "string" | "keyword" | "number" | "comment" | "func" | "variable";
  text: string;
}

function tokenizeLine(line: string): Token[] {
  // Regex matchers for tokens
  const patterns: { type: Token["type"]; regex: RegExp }[] = [
    { type: "comment", regex: /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)/ },
    { type: "string", regex: /^("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)/ },
    { type: "tag", regex: /^(<\/?[a-zA-Z0-9\-]+|\/?>)/ },
    {
      type: "keyword",
      regex: /^(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|new|this|async|await|typeof|void|null|undefined|true|false)\b/,
    },
    { type: "func", regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/ },
    { type: "attr", regex: /^([a-zA-Z\-:@]+)(?==)/ },
    { type: "number", regex: /^\b(\d+(\.\d+)?(px|rem|em|%|deg|vh|vw|s|ms)?)\b/ },
    { type: "variable", regex: /^(--[a-zA-Z0-9\-]+|\$[a-zA-Z0-9_$]+)/ },
    { type: "text", regex: /^[^\s"'`<>{}/=(),;.]+/ },
    { type: "text", regex: /^[\s=(),;.]+/ },
    { type: "text", regex: /^./ },
  ];

  const tokens: Token[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    let matched = false;
    for (const { type, regex } of patterns) {
      const match = remaining.match(regex);
      if (match && match[0]) {
        tokens.push({ type, text: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "text", text: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

interface SyntaxHighlighterProps {
  code: string;
  themeId?: CodeThemeId;
}

export default function SyntaxHighlighter({ code, themeId = "dracula" }: SyntaxHighlighterProps) {
  const theme = CODE_THEMES[themeId] || CODE_THEMES.dracula;

  const lines = useMemo(() => {
    return code.split("\n");
  }, [code]);

  const getColor = (type: Token["type"]) => {
    switch (type) {
      case "comment":
        return theme.comment;
      case "string":
        return theme.string;
      case "tag":
        return theme.tag;
      case "keyword":
        return theme.keyword;
      case "func":
        return theme.func;
      case "attr":
        return theme.attr;
      case "number":
        return theme.number;
      case "variable":
        return theme.variable;
      case "text":
      default:
        return theme.fg;
    }
  };

  return (
    <div
      style={{ backgroundColor: theme.bg, color: theme.fg }}
      className="font-mono text-xs w-full h-full overflow-auto select-text p-4 leading-relaxed tracking-wide transition-colors duration-200"
    >
      <table className="border-collapse w-full">
        <tbody>
          {lines.map((line, idx) => {
            const tokens = tokenizeLine(line);
            return (
              <tr key={idx} className="hover:bg-white/[0.03]">
                {/* Line number */}
                <td
                  style={{ color: theme.lineNo }}
                  className="pr-4 text-right select-none w-10 text-[11px] align-top opacity-60 font-mono"
                >
                  {idx + 1}
                </td>

                {/* Line tokens */}
                <td className="whitespace-pre align-top font-mono">
                  {tokens.map((token, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        color: getColor(token.type),
                        fontStyle: token.type === "comment" ? "italic" : "normal",
                      }}
                    >
                      {token.text}
                    </span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

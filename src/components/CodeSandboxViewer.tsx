"use client";

import { useState } from "react";
import { Play, Code2, Copy, Check, RotateCw, Monitor, Tablet, Smartphone, Maximize2, Palette } from "lucide-react";
import { useToast } from "./Toast";
import SyntaxHighlighter, { CodeThemeId, CODE_THEMES } from "./SyntaxHighlighter";

interface CodeSandboxViewerProps {
  codeSnippet: string;
  title: string;
}

export default function CodeSandboxViewer({ codeSnippet, title }: CodeSandboxViewerProps) {
  const [activeTab, setActiveTab] = useState<"sandbox" | "code">("sandbox");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [codeTheme, setCodeTheme] = useState<CodeThemeId>("dracula");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast({
      title: "Code Copied to Clipboard",
      message: "Ready to paste into your local editor or sandbox.",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const viewportWidths = {
    desktop: "w-full",
    tablet: "max-w-2xl mx-auto",
    mobile: "max-w-sm mx-auto",
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-[#0c0e17] overflow-hidden flex flex-col shadow-2xl transition-all ${
      isFullscreen ? "fixed inset-4 z-50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)]" : "relative"
    }`}>
      {/* Top Sandbox Bar */}
      <div className="px-4 py-3 border-b border-white/[0.08] bg-[#090b12] flex flex-wrap items-center justify-between gap-3">
        {/* Mode switcher tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "sandbox"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Interactive Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "code"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source Code</span>
          </button>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-2">
          {activeTab === "sandbox" && (
            <>
              {/* Viewport Toggles */}
              <div className="hidden sm:flex items-center p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400">
                <button
                  onClick={() => setViewport("desktop")}
                  className={`p-1.5 rounded hover:text-white transition-colors ${
                    viewport === "desktop" ? "bg-white/[0.08] text-violet-400 font-bold" : ""
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewport("tablet")}
                  className={`p-1.5 rounded hover:text-white transition-colors ${
                    viewport === "tablet" ? "bg-white/[0.08] text-violet-400 font-bold" : ""
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewport("mobile")}
                  className={`p-1.5 rounded hover:text-white transition-colors ${
                    viewport === "mobile" ? "bg-white/[0.08] text-violet-400 font-bold" : ""
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Refresh Sandbox */}
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
                title="Restart Sandbox"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {activeTab === "code" && (
            <div className="flex items-center gap-2">
              {/* Theme Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <Palette className="w-3.5 h-3.5 text-violet-400" />
                  <span>Theme: {CODE_THEMES[codeTheme].name}</span>
                </button>

                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#0f121d] border border-white/10 shadow-2xl py-1.5 z-50 animate-dropdown">
                    {(Object.keys(CODE_THEMES) as CodeThemeId[]).map((tId) => (
                      <button
                        key={tId}
                        onClick={() => {
                          setCodeTheme(tId);
                          setIsThemeMenuOpen(false);
                          toast({
                            title: `Theme Changed: ${CODE_THEMES[tId].name}`,
                            type: "info",
                          });
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-white/[0.06] transition-colors ${
                          codeTheme === tId ? "text-violet-400 font-semibold" : "text-slate-300"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: CODE_THEMES[tId].tag }}
                          />
                          {CODE_THEMES[tId].name}
                        </span>
                        {codeTheme === tId && <Check className="w-3 h-3 text-violet-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy Code */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Sandbox / Code Body */}
      <div className={`w-full overflow-hidden transition-all bg-[#08090e] ${
        isFullscreen ? "flex-1" : "h-[540px]"
      }`}>
        {activeTab === "sandbox" ? (
          <div className="w-full h-full flex items-center justify-center p-3 bg-dot-pattern">
            <div className={`w-full h-full rounded-xl overflow-hidden shadow-inner border border-white/[0.06] transition-all duration-300 ${viewportWidths[viewport]}`}>
              <iframe
                key={reloadKey}
                title={title}
                srcDoc={codeSnippet}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0 bg-[#090a10]"
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden">
            <SyntaxHighlighter code={codeSnippet} themeId={codeTheme} />
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="px-4 py-2 border-t border-white/[0.06] bg-[#090b12] flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {activeTab === "sandbox" ? "Sandboxed DOM Execution" : `Theme: ${CODE_THEMES[codeTheme].name}`}
        </span>
        <span>HTML5 • CSS3 • JavaScript</span>
      </div>
    </div>
  );
}

import { useState, useRef, useMemo, useCallback, useEffect, lazy, Suspense } from "react";
import ContentForm from "./components/ContentForm";
import OutputPreview from "./components/OutputPreview";
import Sidebar from "./components/Sidebar";
import Tooltip from "./components/Tooltip";
import ToastContainer from "./components/ToastContainer";
import { useFormValidation } from "./hooks/useFormValidation";
import { useContentHistory } from "./hooks/useContentHistory";
import { useToast } from "./hooks/useToast";
import { useAutoSave, loadDraft, clearDraft } from "./hooks/useAutoSave";
import { useCommandPalette } from "./hooks/useCommandPalette";
import { generateMockContent } from "./utils/mockGenerator";
import { generateContent } from "./services/api";
import { buildPrompt } from "./utils/buildPrompt";
import { downloadAsText, downloadAsMarkdown } from "./utils/downloadFile";
import { initialFormData } from "./types/form";
import type { ApiError } from "./services/types";
import type { FormData } from "./types/form";
import type { Template } from "./data/templates";
import type { CommandAction } from "./hooks/useCommandPalette";
import type { HistoryEntry } from "./hooks/useContentHistory";

// ─── Lazy-loaded modals ───────────────────────────────────────────────────────

const TemplatesModal = lazy(() => import("./components/TemplatesModal"));
const CommandPalette = lazy(() => import("./components/CommandPalette"));
const SurfGame = lazy(() => import("./components/SurfGame"));

// ─── Constants ────────────────────────────────────────────────────────────────

const THEME_KEY = "acs-theme";

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light") return false;
    if (saved === "dark") return true;
    return true; // default dark
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    root.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>(() => ({
    ...initialFormData,
    ...loadDraft(),
  }));

  // ── Generation state ──────────────────────────────────────────────────────
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [generationCount, setGenerationCount] = useState<number>(0);

  // ── Editable prompt ───────────────────────────────────────────────────────
  const [editedPrompt, setEditedPrompt] = useState(() => buildPrompt(initialFormData));

  // ── UI state ──────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [templatesOpen, setTemplatesOpen] = useState<boolean>(false);
  const [surfGameOpen, setSurfGameOpen] = useState<boolean>(false);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { errors, shakeButton, validate, clearError } = useFormValidation(formData);
  const { history, addEntry, clearHistory } = useContentHistory();
  const { toasts, addToast, removeToast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  useAutoSave(formData);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev: FormData) => {
        const next = { ...prev, [key]: value };
        setEditedPrompt(buildPrompt(next));
        return next;
      });
      if (key === "topic" || key === "targetAudience") {
        clearError(key);
      }
    },
    [clearError],
  );

  const handleGenerate = useCallback(async () => {
    if (!validate()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setStatusMessage("");

    let content = "";

    try {
      content = await generateContent({ ...formData, prompt: editedPrompt }, {
        signal: controller.signal,
        onRetry: (attempt, maxRetries) => {
          setStatusMessage(`Retrying… (${attempt}/${maxRetries})`);
        },
      });
    } catch (err) {
      if (controller.signal.aborted) return;

      const apiErr = err as ApiError;
      const msg = apiErr.message ?? "API unavailable — using mock generator.";
      setStatusMessage(msg);
      addToast(msg, "error");

      try {
        content = await generateMockContent(formData);
      } catch {
        content = "";
      }
    }

    if (controller.signal.aborted) return;

    setGeneratedContent(content);
    setGenerationCount((c: number) => c + 1);

    if (content.trim()) {
      addEntry(formData.contentType, formData.topic, content);
      addToast("Content generated successfully!", "success");
    }

    clearDraft();
    setIsLoading(false);
  }, [addEntry, addToast, formData, editedPrompt, validate]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setStatusMessage("");
    addToast("Generation cancelled.", "info");
  }, [addToast]);

  const handleCopy = useCallback(async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      addToast("Copied to clipboard!", "success");
    } catch {
      addToast("Failed to copy.", "error");
    }
  }, [generatedContent, addToast]);

  const handleSelectTemplate = useCallback(
    (template: Template) => {
      setFormData((prev: FormData) => ({
        ...prev,
        contentType: template.contentType,
        tone: template.tone,
        length: template.length,
        targetAudience: template.targetAudience,
        keywords: template.keywords,
        topic: template.topic,
      }));
      setTemplatesOpen(false);
      addToast(`Template "${template.name}" applied.`, "success");
    },
    [addToast],
  );

  const handleSelectHistory = useCallback(
    (entry: HistoryEntry) => {
      setGeneratedContent(entry.content);
      // Restore form fields from history if available
      setFormData((prev: FormData) => ({
        ...prev,
        contentType: entry.contentType ?? prev.contentType,
        topic: entry.topic ?? prev.topic,
      }));
      setSidebarOpen(false);
      addToast("Loaded from history.", "info");
    },
    [addToast],
  );

  const toggleTheme = useCallback(() => {
    setDarkMode((prev: boolean) => !prev);
  }, []);

  // ── Command palette actions ───────────────────────────────────────────────

  const commandActions: CommandAction[] = useMemo(
    () => [
      {
        id: "generate",
        name: "Generate Content",
        category: "Content",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
        shortcut: "⌘↵",
        execute: () => {
          handleGenerate();
        },
      },
      {
        id: "copy",
        name: "Copy Output",
        category: "Content",
        icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
        execute: () => {
          handleCopy();
        },
      },
      {
        id: "cancel",
        name: "Cancel Generation",
        category: "Content",
        icon: "M6 18L18 6M6 6l12 12",
        execute: () => handleCancel(),
      },
      {
        id: "download-txt",
        name: "Download as Text",
        category: "Export",
        icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        execute: () => {
          if (generatedContent) downloadAsText(generatedContent);
        },
      },
      {
        id: "download-md",
        name: "Download as Markdown",
        category: "Export",
        icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        execute: () => {
          if (generatedContent) downloadAsMarkdown(generatedContent);
        },
      },
      {
        id: "templates",
        name: "Open Templates",
        category: "Navigation",
        icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
        execute: () => setTemplatesOpen(true),
      },
      {
        id: "toggle-theme",
        name: darkMode ? "Switch to Light Mode" : "Switch to Dark Mode",
        category: "Settings",
        icon: darkMode
          ? "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          : "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
        execute: () => setDarkMode((prev: boolean) => !prev),
      },
      {
        id: "toggle-sidebar",
        name: "Toggle Sidebar",
        category: "Navigation",
        icon: "M4 6h16M4 12h8m-8 6h16",
        execute: () => setSidebarOpen((prev: boolean) => !prev),
      },
      {
        id: "clear-form",
        name: "Clear Form",
        category: "Settings",
        icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
        execute: () => {
          setFormData({ ...initialFormData });
          addToast("Form cleared.", "info");
        },
      },
      {
        id: "clear-history",
        name: "Clear History",
        category: "Settings",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        execute: () => {
          clearHistory();
          addToast("History cleared.", "info");
        },
      },
      {
        id: "set-linkedin",
        name: "Set Type: LinkedIn Post",
        category: "Quick Set",
        icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z",
        execute: () => handleChange("contentType", "linkedin"),
      },
      {
        id: "set-email",
        name: "Set Type: Email",
        category: "Quick Set",
        icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        execute: () => handleChange("contentType", "email"),
      },
      {
        id: "set-adcopy",
        name: "Set Type: Ad Copy",
        category: "Quick Set",
        icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
        execute: () => handleChange("contentType", "ad-copy"),
      },
    ],
    [darkMode, generatedContent, handleGenerate, handleCopy, handleCancel, handleChange, clearHistory, addToast],
  );

  const palette = useCommandPalette(commandActions);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="
        min-h-svh
        bg-gray-50 text-gray-900
        dark:bg-[#0f172a] dark:text-zinc-200
        transition-colors duration-150
      "
    >
      {/* ═══════════════════════════════════════════════════════════════════
          Header
          ═══════════════════════════════════════════════════════════════ */}
      <header
        className="
          sticky top-0 z-30
          border-b
          border-gray-200/80 bg-white/80 backdrop-blur-sm
          dark:border-zinc-800 dark:bg-[#0f172a]/80
        "
      >
        <div className="flex h-12 items-center justify-between px-4">
          {/* Left — menu + brand */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen((p: boolean) => !p)}
              className="
                lg:hidden rounded-md p-1.5
                text-gray-500 hover:text-gray-800 hover:bg-gray-100
                dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800
                transition-colors duration-150
                outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
              "
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Brand */}
            <div className="flex items-center gap-2">
              <div
                className="
                  w-6 h-6 rounded-md flex items-center justify-center
                  bg-blue-600
                "
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                  <path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                  <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
                </svg>
              </div>
              <span
                className="
                  text-sm font-semibold tracking-tight
                  text-gray-900 dark:text-zinc-100
                "
              >
                AI Content Studio
              </span>
              <span
                className="
                  hidden sm:inline-block
                  text-[10px] font-medium px-1.5 py-0.5 rounded
                  bg-gray-100 text-gray-500 border border-gray-200
                  dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700
                "
              >
                v3.0
              </span>
            </div>
          </div>

          {/* Right — search, theme, easter egg */}
          <div className="flex items-center gap-1.5">
            {/* Command palette trigger */}
            <button
              onClick={palette.open}
              className="
                hidden sm:flex items-center gap-2
                rounded-md border px-2.5 py-1.5
                text-[11px]
                border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300
                dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-600
                transition-colors duration-150
                outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
              "
              aria-label="Open command palette"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="text-gray-400 dark:text-zinc-500">Search…</span>
              <kbd
                className="
                  font-mono text-[10px] px-1 py-0.5 rounded
                  bg-gray-100 border border-gray-200 text-gray-400
                  dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500
                "
              >
                ⌘K
              </kbd>
            </button>

            {/* Mobile search — icon only */}
            <button
              onClick={palette.open}
              className="
                sm:hidden rounded-md p-1.5
                text-gray-500 hover:text-gray-800 hover:bg-gray-100
                dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800
                transition-colors duration-150
                outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
              "
              aria-label="Open command palette"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-gray-200 dark:bg-zinc-800 mx-0.5" />

            {/* Theme toggle */}
            <Tooltip label={darkMode ? "Light mode" : "Dark mode"}>
              <button
                onClick={toggleTheme}
                className="
                  rounded-md p-1.5
                  text-gray-500 hover:text-gray-800 hover:bg-gray-100
                  dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800
                  transition-colors duration-150
                  outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
                "
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
            </Tooltip>

            {/* Easter egg */}
            <Tooltip label="Play a game!">
              <button
                onClick={() => setSurfGameOpen(true)}
                className="
                  rounded-md p-1.5
                  text-gray-500 hover:text-gray-800 hover:bg-gray-100
                  dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800
                  transition-colors duration-150
                  outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
                "
                aria-label="Open easter egg game"
              >
                <span className="text-sm leading-none">🎮</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          Main Layout: Sidebar | Form | Output
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex h-[calc(100svh-3rem)] overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          history={history}
          onSelect={handleSelectHistory}
          onClear={clearHistory}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main area — Form + Output */}
        <main className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* Form panel */}
          <div
            className="
              w-full shrink-0 overflow-y-auto
              border-b md:border-b-0 md:border-r
              border-gray-200 dark:border-zinc-800
              md:w-[440px] md:min-w-[360px] md:max-w-[480px]
              bg-white dark:bg-zinc-900/30
            "
          >
            <ContentForm
              formData={formData}
              handleChange={handleChange}
              onGenerate={handleGenerate}
              onCancel={handleCancel}
              onOpenTemplates={() => setTemplatesOpen(true)}
              isLoading={isLoading}
              errors={errors}
              shakeButton={shakeButton}
              editedPrompt={editedPrompt}
              onPromptChange={setEditedPrompt}
            />
          </div>

          {/* Output panel */}
          <div
            className="
              flex-1 overflow-y-auto
              bg-white dark:bg-transparent
            "
          >
            <OutputPreview
              output={generatedContent}
              isLoading={isLoading}
              statusMessage={statusMessage}
              onCopy={handleCopy}
              onRegenerate={handleGenerate}
              generationCount={generationCount}
            />
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Modals & Overlays
          ═══════════════════════════════════════════════════════════════ */}

      {/* Templates */}
      <Suspense fallback={null}>
        <TemplatesModal
          isOpen={templatesOpen}
          onClose={() => setTemplatesOpen(false)}
          onSelect={handleSelectTemplate}
        />
      </Suspense>

      {/* Command Palette */}
      <Suspense fallback={null}>
        <CommandPalette
          isOpen={palette.isOpen}
          onClose={palette.close}
          query={palette.query}
          onQueryChange={palette.setQuery}
          filtered={palette.filtered}
          selectedIndex={palette.selectedIndex}
          onSelectedIndexChange={palette.setSelectedIndex}
          onExecute={palette.executeSelected}
        />
      </Suspense>

      {/* Surf Game */}
      <Suspense fallback={null}>
        <SurfGame
          isOpen={surfGameOpen}
          onClose={() => setSurfGameOpen(false)}
        />
      </Suspense>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
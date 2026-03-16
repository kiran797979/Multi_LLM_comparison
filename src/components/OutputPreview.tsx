import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OutputTabs from "./OutputTabs";
import ABComparison from "./ABComparison";
import { countWords, countChars, readTimeLabel } from "../utils/textAnalysis";
import { downloadAsText } from "../utils/downloadFile";

const ContentAnalysis = lazy(() => import("./ContentAnalysis"));

// ─── Props ────────────────────────────────────────────────────────────────────

interface OutputPreviewProps {
  output: string;
  isLoading?: boolean;
  statusMessage?: string;
  onCopy?: () => void;
  onRegenerate?: () => void;
  generationCount?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countStats(text: string) {
  const words = countWords(text);
  const chars = countChars(text);
  const readTime = readTimeLabel(words);
  return { words, chars, readTime };
}

const SUBSTITUTIONS: [RegExp, string][] = [
  [/\bimportant\b/gi, "essential"],
  [/\bgreat\b/gi, "outstanding"],
  [/\bgood\b/gi, "excellent"],
  [/\bhelp\b/gi, "empower"],
  [/\buse\b/gi, "leverage"],
  [/\bstart\b/gi, "begin"],
  [/\bbig\b/gi, "significant"],
  [/\bfast\b/gi, "rapid"],
  [/\bnew\b/gi, "innovative"],
  [/\bmake\b/gi, "create"],
  [/\bget\b/gi, "obtain"],
  [/\bshow\b/gi, "demonstrate"],
  [/\btry\b/gi, "attempt"],
  [/\bneed\b/gi, "require"],
  [/\bthink\b/gi, "consider"],
  [/\bwork\b/gi, "function"],
  [/\bchange\b/gi, "transform"],
  [/\bbuild\b/gi, "construct"],
  [/\bgrow\b/gi, "expand"],
  [/\bmove\b/gi, "transition"],
];

function generateVariant(text: string): string {
  let variant = text;
  for (const [pattern, replacement] of SUBSTITUTIONS) {
    variant = variant.replace(pattern, replacement);
  }
  const paragraphs = variant.split(/\n\n/);
  if (paragraphs.length > 3) {
    paragraphs.splice(Math.floor(paragraphs.length / 2), 1);
  }
  return paragraphs.join("\n\n");
}

// ─── Icon helper ──────────────────────────────────────────────────────────────

function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] tabular-nums"
      title={label}
    >
      <span className="text-gray-400 dark:text-zinc-600">{label}</span>
      <span className="text-gray-600 dark:text-zinc-400">{value}</span>
    </span>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionBtn({
  label,
  icon,
  onClick,
  active = false,
}: {
  label: string;
  icon: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "p-1.5 rounded-md transition-all duration-200 active:scale-95 hover:-translate-y-0.5",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
        active
          ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm"
          : "text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:shadow-sm dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800",
      ].join(" ")}
    >
      <Icon d={icon} />
    </button>
  );
}

// ─── SVG icon paths ───────────────────────────────────────────────────────────

const ICONS = {
  copy: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75",
  regenerate:
    "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M20.016 4.66v4.993",
  analyze:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  compare:
    "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  download:
    "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3",
} as const;

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div
      className="
        flex-1 flex flex-col rounded-lg p-6 gap-5
        border border-gray-200 bg-gray-50
        dark:border-zinc-800 dark:bg-zinc-800/30
      "
    >
      {/* Spinner + text */}
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <div className="relative w-8 h-8">
          <svg
            className="animate-spin w-8 h-8 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">
          Generating content…
        </p>
        <p className="text-[11px] text-gray-400 dark:text-zinc-600">
          This usually takes a few seconds
        </p>
      </div>

      {/* Skeleton bars */}
      <div className="space-y-2.5">
        <div
          className="h-3 rounded-full w-full animate-pulse bg-gray-200 dark:bg-zinc-800"
        />
        <div
          className="h-3 rounded-full w-5/6 animate-pulse bg-gray-200 dark:bg-zinc-800"
          style={{ animationDelay: "75ms" }}
        />
        <div
          className="h-3 rounded-full w-4/6 animate-pulse bg-gray-200 dark:bg-zinc-800"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="h-3 rounded-full w-3/4 animate-pulse bg-gray-200 dark:bg-zinc-800"
          style={{ animationDelay: "225ms" }}
        />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="
        flex-1 flex flex-col items-center justify-center
        rounded-lg border border-dashed p-8 gap-3
        border-gray-300 bg-gray-50/50
        dark:border-zinc-800 dark:bg-zinc-900/50
      "
    >
      {/* Document icon */}
      <div
        className="
          w-12 h-12 rounded-xl flex items-center justify-center
          bg-gray-100 dark:bg-zinc-800/80
        "
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-400 dark:text-zinc-600"
        >
          <path
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">
          No output yet
        </p>
        <p
          className="
            text-xs leading-relaxed max-w-[220px]
            text-gray-400 dark:text-zinc-600
          "
        >
          Fill out the form and hit{" "}
          <span className="text-blue-500 font-medium">Generate</span>{" "}
          to see your content here.
        </p>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="flex items-center gap-1 mt-1">
        <kbd
          className="
            px-1.5 py-0.5 rounded text-[10px] font-mono
            bg-gray-100 border border-gray-200 text-gray-500
            dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500
          "
        >
          ⌘
        </kbd>
        <kbd
          className="
            px-1.5 py-0.5 rounded text-[10px] font-mono
            bg-gray-100 border border-gray-200 text-gray-500
            dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500
          "
        >
          ↵
        </kbd>
        <span className="text-[10px] text-gray-400 dark:text-zinc-600 ml-1">
          to generate
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OutputPreview({
  output,
  isLoading,
  statusMessage,
  onCopy,
  onRegenerate,
  generationCount,
}: OutputPreviewProps) {
  const [abMode, setAbMode] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const hasOutput = !!output;
  const stats = useMemo(() => countStats(output), [output]);
  const variantB = useMemo(
    () => (output ? generateVariant(output) : ""),
    [output],
  );

  // ── Copy with visual feedback ───────────────────────────────────────────
  const handleCopy = useCallback(() => {
    onCopy?.();
    setJustCopied(true);
    const timer = setTimeout(() => setJustCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [onCopy]);

  // ── A/B pick ────────────────────────────────────────────────────────────
  const handlePick = useCallback(
    (version: "A" | "B") => {
      if (version === "A") {
        onCopy?.();
      } else {
        navigator.clipboard.writeText(variantB).catch(() => { });
      }
      setAbMode(false);
    },
    [onCopy, variantB],
  );

  // ── Download ────────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!output) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadAsText(output, `ai-content-${timestamp}.txt`);
  }, [output]);

  return (
    <div className="p-4 h-full flex flex-col">
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-y-2 gap-x-4">
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <h2
            className="
              text-xs font-semibold uppercase tracking-wider shrink-0
              text-gray-500 dark:text-zinc-400
            "
          >
            Output
          </h2>

          {hasOutput && (
            <div className="flex items-center gap-2.5 overflow-x-auto">
              <StatPill label="words" value={stats.words} />
              <span className="text-gray-200 dark:text-zinc-800">·</span>
              <StatPill label="chars" value={stats.chars} />
              <span className="text-gray-200 dark:text-zinc-800">·</span>
              <StatPill label="read" value={stats.readTime} />
            </div>
          )}
        </div>

        {/* Action buttons */}
        {hasOutput && (
          <div className="flex items-center gap-0.5 shrink-0">
            <ActionBtn
              label={justCopied ? "Copied!" : "Copy"}
              icon={ICONS.copy}
              onClick={handleCopy}
              active={justCopied}
            />
            <ActionBtn
              label="Regenerate"
              icon={ICONS.regenerate}
              onClick={onRegenerate}
            />
            <ActionBtn
              label="Download"
              icon={ICONS.download}
              onClick={handleDownload}
            />

            {/* Separator */}
            <div className="w-px h-4 bg-gray-200 dark:bg-zinc-800 mx-1" />

            <ActionBtn
              label="Analyze"
              icon={ICONS.analyze}
              onClick={() => setAnalyzeOpen((p) => !p)}
              active={analyzeOpen}
            />
            <ActionBtn
              label="Compare A/B"
              icon={ICONS.compare}
              onClick={() => setAbMode((p) => !p)}
              active={abMode}
            />
          </div>
        )}
      </div>

      {/* Status message */}
      {statusMessage && (
        <div
          className="
            flex items-center gap-2 mb-2 px-2 py-1.5 rounded-md
            bg-amber-50 border border-amber-200
            dark:bg-amber-500/5 dark:border-amber-500/10
          "
        >
          <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            {statusMessage}
          </p>
        </div>
      )}

      {/* ── Main content area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {hasOutput ? (
            abMode ? (
              <motion.div
                key="ab"
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              >
                <ABComparison
                  versionA={output}
                  versionB={variantB}
                  onPick={handlePick}
                />
              </motion.div>
            ) : (
              <motion.div
                key="tabs"
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              >
                <OutputTabs
                  output={output}
                  onCopy={onCopy}
                  onRegenerate={onRegenerate}
                />
              </motion.div>
            )
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <EmptyState />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Inline Content Analysis ──────────────────────────────────── */}
        <AnimatePresence>
          {analyzeOpen && hasOutput && (
            <motion.div
              key={`analysis-${generationCount ?? 0}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div
                className="
                  mt-3 rounded-lg p-4
                  border border-gray-200 bg-gray-50
                  dark:border-zinc-800 dark:bg-zinc-800/30
                "
              >
                <Suspense
                  fallback={
                    <div className="flex items-center gap-2 py-4">
                      <svg
                        className="animate-spin w-4 h-4 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                        />
                      </svg>
                      <span className="text-xs text-gray-500 dark:text-zinc-500">
                        Loading analysis…
                      </span>
                    </div>
                  }
                >
                  <ContentAnalysis text={output} />
                </Suspense>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
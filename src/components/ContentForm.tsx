import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FormData, ValidationErrors } from "../types/form";
import FormField from "../ui/FormField";
import Dropdown from "../ui/Dropdown";
import TextArea from "../ui/TextArea";
import TextInput from "../ui/TextInput";

import { contentTypeOptions, toneOptions, lengthOptions } from "../types/form";

const contentTypes = contentTypeOptions.map((o) => ({ label: o.label, value: o.value }));
const tones = toneOptions.map((o) => ({ label: o.label, value: o.value }));
const lengths = lengthOptions.map((o) => ({ label: o.label, value: o.value }));



const TOPIC_MAX = 300;

interface ContentFormProps {
  formData: FormData;
  handleChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onGenerate: () => void;
  onCancel?: () => void;
  onOpenTemplates?: () => void;
  isLoading: boolean;
  errors: ValidationErrors;
  shakeButton: boolean;
  editedPrompt: string;
  onPromptChange: (value: string) => void;
}

export default function ContentForm({
  formData,
  handleChange,
  onGenerate,
  onCancel,
  onOpenTemplates,
  isLoading,
  errors,
  shakeButton,
  editedPrompt,
  onPromptChange,
}: ContentFormProps) {
  const [promptOpen, setPromptOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onGenerate();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onGenerate]);

  const topicLen = formData.topic.length;
  const topicOverLimit = topicLen > TOPIC_MAX;

  const topicError =
    errors.topic ?? (topicOverLimit ? `Topic exceeds ${TOPIC_MAX} characters.` : undefined);

  return (
    <div className="h-full p-4 flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          New Generation
        </h2>

        {onOpenTemplates && (
          <button
            onClick={onOpenTemplates}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors duration-150 hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500/40 outline-none dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Templates
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type">
            {({ id }) => (
              <Dropdown
                id={id}
                value={formData.contentType}
                onChange={(v) => handleChange("contentType", v as FormData["contentType"])}
                options={[...contentTypes]}
              />
            )}
          </FormField>

          <FormField label="Tone">
            {({ id }) => (
              <Dropdown
                id={id}
                value={formData.tone}
                onChange={(v) => handleChange("tone", v as FormData["tone"])}
                options={[...tones]}
              />
            )}
          </FormField>
        </div>

        <FormField label="Length">
          {({ id }) => (
            <Dropdown
              id={id}
              value={formData.length}
              onChange={(v) => handleChange("length", v as FormData["length"])}
              options={[...lengths]}
            />
          )}
        </FormField>

        <div className="space-y-1">
          <FormField label="Target Audience *" error={errors.targetAudience}>
            {({ id }) => (
              <TextInput
                id={id}
                value={formData.targetAudience}
                onChange={(v) => handleChange("targetAudience", v)}
                placeholder="e.g. Marketing professionals"
                error={!!errors.targetAudience}
              />
            )}
          </FormField>
        </div>

        <div className="space-y-1">
          <FormField label="Keywords">
            {({ id }) => (
              <TextInput
                id={id}
                value={formData.keywords}
                onChange={(v) => handleChange("keywords", v)}
                placeholder="e.g. AI, productivity, SaaS"
              />
            )}
          </FormField>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-600">
            Separate with commas.
          </p>
        </div>

        <div className="space-y-1">
          <FormField label="Topic *" error={topicError}>
            {({ id }) => (
              <TextArea
                id={id}
                value={formData.topic}
                onChange={(v) => handleChange("topic", v)}
                placeholder="Describe what you want to write about…"
                rows={3}
                error={!!errors.topic || topicOverLimit}
                maxLength={TOPIC_MAX + 50}
              />
            )}
          </FormField>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-600">
              Be specific (who, what, goal, and context).
            </p>
            <p
              className={[
                "text-[11px] tabular-nums",
                topicOverLimit
                  ? "text-red-400"
                  : "text-zinc-500 dark:text-zinc-600",
              ].join(" ")}
            >
              {topicLen}/{TOPIC_MAX}
            </p>
          </div>
        </div>
      </div>

      {/* Final Dynamic Prompt */}
      <div className="mt-3 shrink-0 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <button
          onClick={() => setPromptOpen((p) => !p)}
          type="button"
          className="group flex w-full items-center gap-2 rounded py-1 text-xs text-zinc-500 transition-colors duration-150 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500/40 outline-none dark:hover:text-zinc-300"
          aria-expanded={promptOpen}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 opacity-60"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Final Dynamic Prompt</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={[
              "ml-auto shrink-0 text-zinc-400 transition-transform duration-150 dark:text-zinc-600",
              promptOpen ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          >
            <path
              d="M2 3.5L5 6.5L8 3.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <AnimatePresence>
          {promptOpen && (
            <motion.div
              key="prompt-preview"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <textarea
                value={editedPrompt}
                onChange={(e) => onPromptChange(e.target.value)}
                className="mt-2 max-h-48 min-h-[6rem] w-full resize-y overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-700 outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:focus:border-blue-500"
                spellCheck={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="mt-3 shrink-0 space-y-2.5 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <motion.button
          onClick={onGenerate}
          disabled={isLoading}
          type="button"
          aria-label="Generate content"
          className="group flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900"
          whileTap={isLoading ? {} : { scale: 0.98 }}
          animate={shakeButton ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
          transition={shakeButton ? { duration: 0.4, ease: "easeInOut" } : { duration: 0.1 }}
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
              </svg>
              <span>Generating…</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>Generate</span>
              <kbd className="ml-1 font-mono text-[10px] opacity-35 transition-opacity group-hover:opacity-55">
                Ctrl+Enter
              </kbd>
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {isLoading && onCancel && (
            <motion.button
              key="cancel"
              onClick={onCancel}
              type="button"
              aria-label="Cancel generation"
              className="w-full rounded-md py-1.5 text-xs text-zinc-500 transition-colors duration-150 hover:bg-red-500/5 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/40 outline-none dark:text-zinc-500 dark:hover:text-red-400"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              Cancel generation
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
import type { ApiRequest, ApiResponse, ApiError } from "./types";
import { env } from "../config/env";
import { generateMockContent } from "../utils/mockGenerator";

const API_BASE = env.apiBaseUrl;
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

export interface GenerateOptions {
  signal?: AbortSignal;
  onRetry?: (attempt: number, maxRetries: number) => void;
}

function buildApiError(message: string, status?: number, retryable = false): ApiError {
  return { message, status, retryable };
}

async function fetchWithTimeout(url: string, options: RequestInit, signal?: AbortSignal): Promise<Response> {
  const timeoutCtrl = new AbortController();
  const timer = setTimeout(() => timeoutCtrl.abort(), TIMEOUT_MS);

  const mergedSignal = signal
    ? AbortSignal.any([signal, timeoutCtrl.signal])
    : timeoutCtrl.signal;

  try {
    return await fetch(url, { ...options, signal: mergedSignal });
  } catch (err) {
    if (signal?.aborted) {
      throw buildApiError("Request cancelled.", undefined, false);
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw buildApiError("Request timed out. Please try again.", undefined, true);
    }
    throw buildApiError("Network error. Please check your connection.", undefined, true);
  } finally {
    clearTimeout(timer);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateContent(
  request: ApiRequest,
  options?: GenerateOptions,
): Promise<string> {
  const { signal, onRetry } = options ?? {};

  if (env.useMock) {
    return generateMockContent(request, signal);
  }

  const payload: ApiRequest = { ...request, prompt: request.prompt };

  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      throw buildApiError("Request cancelled.", undefined, false);
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, signal);

      if (res.ok) {
        const data: ApiResponse = await res.json();
        return data.content;
      }

      if (res.status === 429) {
        lastError = buildApiError("Too many requests, retrying...", 429, true);
      } else if (res.status >= 500) {
        lastError = buildApiError(`Server error (${res.status}). Retrying...`, res.status, true);
      } else {
        const body = await res.json().catch(() => null);
        const detail = body?.detail;
        const detailMessage = typeof detail === "string"
          ? detail
          : detail?.message ?? detail?.error;

        throw buildApiError(
          body?.message ?? body?.error ?? detailMessage ?? `Request failed with status ${res.status}.`,
          res.status,
          false,
        );
      }
    } catch (err) {
      if ((err as ApiError).retryable !== undefined) {
        lastError = err as ApiError;
        if (!(err as ApiError).retryable) throw err;
      } else {
        lastError = buildApiError("An unexpected error occurred.", undefined, true);
      }
    }

    if (attempt < MAX_RETRIES && lastError?.retryable) {
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 8000);
      onRetry?.(attempt, MAX_RETRIES);
      await delay(backoff);
    }
  }

  throw lastError ?? buildApiError("Failed after multiple attempts.");
}

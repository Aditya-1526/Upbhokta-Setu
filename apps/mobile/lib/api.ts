/**
 * API client for Upbhokta Setu.
 *
 * Uses the native Fetch API. On a physical device via Expo Go,
 * we resolve the LAN IP so "localhost" correctly points to the
 * development machine's FastAPI server.
 */

const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

function resolveBaseUrl(): string {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    try {
      const Constants = require("expo-constants");
      const debuggerHost =
        Constants?.expoGoConfig?.debuggerHost ??
        Constants?.debuggerHost;
      if (debuggerHost) {
        const host = debuggerHost.split(":")[0].split("?")[0];
        if (host && host !== "localhost") {
          return `http://${host}:8000`;
        }
      }
    } catch {
      // expo-constants unavailable
    }
  }
  return EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
}

export const API_BASE_URL = resolveBaseUrl();

export type CaseStatus = "draft";

export interface CaseRecord {
  id: string;
  product_name: string;
  seller_name: string;
  purchase_date: string;
  amount_inr: number;
  problem_category: string;
  description: string;
  desired_resolution: string;
  status: CaseStatus;
  created_at: string;
}

export interface CreateCasePayload {
  product_name: string;
  seller_name: string;
  purchase_date: string;
  amount_inr: number;
  problem_category: string;
  description: string;
  desired_resolution: string;
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = 30_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
      ...options,
      signal: controller.signal,
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        detail = body.detail ?? body.message ?? detail;
      } catch {
        // non-JSON error body
      }
      throw new Error(detail);
    }

    if (res.status === 204) {
      return undefined as T;
    }
    return res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. Check your connection and try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchCases(): Promise<CaseRecord[]> {
  return request<CaseRecord[]>("/api/v1/cases");
}

export async function fetchCaseById(id: string): Promise<CaseRecord> {
  return request<CaseRecord>(`/api/v1/cases/${encodeURIComponent(id)}`);
}

export async function createCase(
  payload: CreateCasePayload,
): Promise<CaseRecord> {
  return request<CaseRecord>("/api/v1/cases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface DraftRecord {
  title: string;
  body: string;
  language: string;
  is_ai_generated: boolean;
  needs_review: boolean;
  legal_references: string[];
  missing_information: string[];
  case_id: string;
}

export async function generateDraft(
  caseId: string,
  responseLanguage: string = "en",
): Promise<DraftRecord> {
  const url = new URL(`${API_BASE_URL}/api/v1/cases/${encodeURIComponent(caseId)}/draft`);
  url.searchParams.set("response_language", responseLanguage);
  const controller = new AbortController();
  const timeoutMs = 90_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        detail = body.detail ?? body.message ?? detail;
      } catch {
        // non-JSON error body
      }
      throw new Error(detail);
    }
    return res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Draft generation timed out. The server may be busy — please retry.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

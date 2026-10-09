export const API_BASE = "/api/v1";

export interface CaseRecord {
  id: string;
  product_name: string;
  seller_name: string;
  purchase_date: string;
  amount_inr: number;
  problem_category: string;
  description: string;
  desired_resolution: string;
  status: string;
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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
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

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchCases(): Promise<CaseRecord[]> {
  return request<CaseRecord[]>("/cases");
}

export async function fetchCaseById(id: string): Promise<CaseRecord> {
  return request<CaseRecord>(`/cases/${encodeURIComponent(id)}`);
}

export async function createCase(payload: CreateCasePayload): Promise<CaseRecord> {
  return request<CaseRecord>("/cases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generateDraft(
  caseId: string,
  responseLanguage = "en",
): Promise<DraftRecord> {
  const url = new URL(`${API_BASE}/cases/${encodeURIComponent(caseId)}/draft`, window.location.origin);
  url.searchParams.set("response_language", responseLanguage);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
}

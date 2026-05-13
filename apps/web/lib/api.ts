"use client";

import { createClient, hasSupabaseConfig } from "@/lib/supabase-client";
import {
  mockCandidates,
  mockDashboard,
  mockLabs,
  mockPapers,
  mockProfessors,
  mockPrograms,
  mockSources,
  mockTimeline,
  mockUniversities,
} from "@/lib/mock-data";
import type {
  DashboardSummary,
  Lab,
  Paper,
  PaperCandidate,
  Professor,
  Program,
  RadarSource,
  TimelineTask,
  University,
} from "@/types/sris";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PathMap = {
  "/dashboard": DashboardSummary;
  "/universities": University[];
  "/programs": Program[];
  "/labs": Lab[];
  "/professors": Professor[];
  "/papers": Paper[];
  "/review/papers": PaperCandidate[];
  "/timeline": TimelineTask[];
  "/radar-sources": RadarSource[];
};

const mockByPath: PathMap = {
  "/dashboard": mockDashboard,
  "/universities": mockUniversities,
  "/programs": mockPrograms,
  "/labs": mockLabs,
  "/professors": mockProfessors,
  "/papers": mockPapers,
  "/review/papers": mockCandidates,
  "/timeline": mockTimeline,
  "/radar-sources": mockSources,
};

async function getAccessToken() {
  if (!hasSupabaseConfig()) return null;
  const supabase = createClient();
  const session = await supabase?.auth.getSession();
  return session?.data.session?.access_token ?? null;
}

export async function apiGet<T>(path: keyof PathMap): Promise<T> {
  if (!API_URL) {
    return mockByPath[path] as T;
  }
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  if (!API_URL) {
    throw new Error("API is not configured in demo mode.");
  }
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiCreate<T>(path: string, body: unknown): Promise<T> {
  return apiPost<T>(path, body);
}

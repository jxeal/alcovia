import { API_URL } from "@/src/api/client";
import { Achievement, CreateSessionRequest, SessionDetail } from "@/types/api";

export async function getStudent(id: string) {
  const res = await fetch(`${API_URL}/students/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch student");
  }

  return res.json();
}

export async function getStats(id: string) {
  const res = await fetch(`${API_URL}/students/${id}/stats`);
  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }
  return res.json();
}

export async function getSessions(
  studentId: string,
  filter?: "today" | "week" | "month" | "all",
  cursor?: string
) {
  const params = new URLSearchParams();

  if (filter && filter !== "all") {
    params.append("filter", filter);
  }

  if (cursor) {
    params.append("cursor", cursor);
  }

  const res = await fetch(
    `${API_URL}/students/${studentId}/sessions?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch sessions");
  }

  return res.json();
}

export async function getAchievements(studentId: string) {
  const response = await fetch(`${API_URL}/students/${studentId}/achievements`);

  if (!response.ok) {
    throw new Error("Failed to fetch achievements");
  }

  return response.json() as Promise<Achievement[]>;
}

export async function createSession(
  studentId: string,
  body: CreateSessionRequest
): Promise<SessionDetail> {
  const response = await fetch(
    `${API_URL}/students/${studentId}/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create session");
  }

  return response.json();
}

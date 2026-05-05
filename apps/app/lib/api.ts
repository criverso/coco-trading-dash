import type { DashboardSnapshot } from "@player2/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getDemoMemberSession(): Promise<{
  token: string;
}> {
  const response = await fetch(`${API_URL}/auth/demo/member`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to load the demo member session");
  }

  return response.json();
}

export async function getDashboardSnapshot(token: string): Promise<DashboardSnapshot> {
  const response = await fetch(`${API_URL}/dashboard`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the Player 2 dashboard");
  }

  return response.json();
}

export function getApiUrl() {
  return API_URL;
}


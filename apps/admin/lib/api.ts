import type { AdminSnapshot } from "@player2/shared";

const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000";

export async function getDemoAdminSession(): Promise<{
  token: string;
}> {
  const response = await fetch(`${API_URL}/auth/demo/admin`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to load the demo admin session");
  }

  return response.json();
}

export async function getAdminSnapshot(token: string): Promise<AdminSnapshot> {
  const response = await fetch(`${API_URL}/admin/snapshot`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load the Player 2 admin snapshot");
  }

  return response.json();
}

export function getApiUrl() {
  return API_URL;
}


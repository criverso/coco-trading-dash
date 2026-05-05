import { DashboardClient } from "../components/dashboard-client";
import { getApiUrl, getDashboardSnapshot, getDemoMemberSession } from "../lib/api";

export default async function HomePage() {
  const session = await getDemoMemberSession();
  const snapshot = await getDashboardSnapshot(session.token);

  return <DashboardClient initialSnapshot={snapshot} token={session.token} apiUrl={getApiUrl()} />;
}


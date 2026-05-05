import { AdminClient } from "../components/admin-client";
import { getAdminSnapshot, getApiUrl, getDemoAdminSession } from "../lib/api";

export default async function AdminPage() {
  const session = await getDemoAdminSession();
  const snapshot = await getAdminSnapshot(session.token);

  return <AdminClient initialSnapshot={snapshot} token={session.token} apiUrl={getApiUrl()} />;
}


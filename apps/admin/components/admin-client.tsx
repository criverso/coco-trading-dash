"use client";

import type { AdminSnapshot } from "@player2/shared";
import {
  AlertTriangle,
  BellRing,
  CheckCheck,
  Clock3,
  Flag,
  Shield,
  SlidersHorizontal,
  Users
} from "lucide-react";
import { FormEvent, useMemo, useState, useTransition } from "react";

type Props = {
  initialSnapshot: AdminSnapshot;
  token: string;
  apiUrl: string;
};

const quickViews = [
  "Queue",
  "Reports",
  "Retention",
  "Audit"
] as const;

export function AdminClient({ initialSnapshot, token, apiUrl }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  const [activeView, setActiveView] = useState<(typeof quickViews)[number]>("Queue");

  const queueUrgentCount = useMemo(
    () => snapshot.reviewQueue.filter((item) => item.confidenceScore < 0.65).length,
    [snapshot.reviewQueue]
  );

  const reportUrgentCount = useMemo(
    () => snapshot.reports.filter((report) => report.status === "open").length,
    [snapshot.reports]
  );

  async function refresh() {
    const response = await fetch(`${apiUrl}/admin/snapshot`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data: AdminSnapshot = await response.json();
    setSnapshot(data);
  }

  function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      await fetch(`${apiUrl}/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentsEnabled: formData.get("paymentsEnabled") === "on",
          adsEnabled: formData.get("adsEnabled") === "on",
          phoneVerificationEnabled: formData.get("phoneVerificationEnabled") === "on",
          mediaRetentionDays: Number(formData.get("mediaRetentionDays")),
          rawIdRetentionDays: Number(formData.get("rawIdRetentionDays")),
          selfieRetentionHours: Number(formData.get("selfieRetentionHours")),
          excludedStates: String(formData.get("excludedStates"))
            .split(",")
            .map((value) => value.trim().toUpperCase())
            .filter(Boolean)
        })
      });
      setStatus("Policy settings saved.");
      await refresh();
    });
  }

  function applyDecision(reviewId: string, decision: "auto_pass" | "manual_review" | "auto_fail") {
    startTransition(async () => {
      await fetch(`${apiUrl}/admin/reviews/${reviewId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          decision,
          note:
            decision === "auto_pass"
              ? "Cleared by platform ops after review."
              : decision === "manual_review"
                ? "Held for extended review and user follow-up."
                : "Rejected due to low-confidence biometric result."
        })
      });
      setStatus(`Updated ${reviewId}.`);
      await refresh();
    });
  }

  return (
    <main className="admin-shell">
      <div className="admin-frame">
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark">P2</div>
            <div>
              <p className="eyebrow">Player 2</p>
              <h1>Trust Console</h1>
            </div>
          </div>

          <nav className="nav-stack" aria-label="Admin sections">
            {quickViews.map((view) => (
              <button
                key={view}
                className={view === activeView ? "nav-item active" : "nav-item"}
                onClick={() => setActiveView(view)}
                type="button"
              >
                <span>{view}</span>
                <strong>{getViewCount(view, snapshot)}</strong>
              </button>
            ))}
          </nav>

          <section className="sidebar-card">
            <p className="eyebrow">Shift snapshot</p>
            <div className="sidebar-stat">
              <BellRing size={16} />
              <span>{snapshot.overview.reviewBacklog} reviews waiting</span>
            </div>
            <div className="sidebar-stat">
              <AlertTriangle size={16} />
              <span>{reportUrgentCount} open reports</span>
            </div>
            <div className="sidebar-stat">
              <CheckCheck size={16} />
              <span>{snapshot.overview.activeUsers} active users</span>
            </div>
          </section>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">Platform operations</p>
              <h2>Public beta safety workspace</h2>
            </div>
            <div className="topbar-status">
              <span className="status-chip high">
                <AlertTriangle size={14} />
                {queueUrgentCount} urgent checks
              </span>
              <span className="status-chip">
                <Shield size={14} />
                Biometrics limited in {snapshot.featureFlags.excludedStates.join(", ")}
              </span>
            </div>
          </header>

          <section className="hero-strip">
            <article className="hero-panel primary">
              <div className="hero-kicker">Needs action now</div>
              <strong>{snapshot.overview.reviewBacklog} items in the review queue</strong>
              <p>
                Most of the operational risk is concentrated in verification holds and report follow-up.
              </p>
              <div className="hero-meta">
                <span>{queueUrgentCount} low-confidence verifications</span>
                <span>{reportUrgentCount} untriaged reports</span>
              </div>
            </article>

            <article className="hero-panel">
              <div className="hero-kicker">Retention policy</div>
              <strong>{snapshot.featureFlags.mediaRetentionDays} day media window</strong>
              <p>
                Raw ID artifacts expire after {snapshot.featureFlags.rawIdRetentionDays} days and meetup
                selfies after {snapshot.featureFlags.selfieRetentionHours} hours.
              </p>
            </article>
          </section>

          <section className="metric-row">
            <MetricCard
              icon={<Users size={16} />}
              label="Active users"
              value={snapshot.overview.activeUsers}
              tone="neutral"
            />
            <MetricCard
              icon={<Clock3 size={16} />}
              label="Open requests"
              value={snapshot.overview.openActivities}
              tone="neutral"
            />
            <MetricCard
              icon={<Flag size={16} />}
              label="Open reports"
              value={snapshot.overview.openReports}
              tone="warning"
            />
            <MetricCard
              icon={<Shield size={16} />}
              label="Blocked users"
              value={snapshot.overview.blockedUsers}
              tone="neutral"
            />
          </section>

          <section className="content-grid">
            <div className="panel panel-main">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Verification queue</p>
                  <h3>Work the highest-risk reviews first.</h3>
                </div>
                <span className="panel-badge">{snapshot.reviewQueue.length} pending</span>
              </div>

              <div className="table-head">
                <span>Person</span>
                <span>Type</span>
                <span>Confidence</span>
                <span>Action</span>
              </div>

              <div className="table-stack">
                {snapshot.reviewQueue.map((item) => (
                  <article key={item.id} className="queue-row">
                    <div className="queue-person">
                      <strong>{item.user.displayName}</strong>
                      <p>
                        {item.user.city}, {item.user.state} · trust {item.user.trustScore}
                      </p>
                    </div>
                    <div className="queue-type">
                      <span className="type-pill">{item.kind.replace(/_/g, " ")}</span>
                      <p>{item.reason}</p>
                    </div>
                    <div className="queue-score">
                      <strong>{Math.round(item.confidenceScore * 100)}%</strong>
                      <span className={item.confidenceScore < 0.65 ? "risk-tag hot" : "risk-tag"}>
                        {item.confidenceScore < 0.65 ? "high risk" : "review"}
                      </span>
                    </div>
                    <div className="action-group">
                      <button
                        className="action-button good"
                        onClick={() => applyDecision(item.id, "auto_pass")}
                        disabled={isPending}
                      >
                        Pass
                      </button>
                      <button
                        className="action-button"
                        onClick={() => applyDecision(item.id, "manual_review")}
                        disabled={isPending}
                      >
                        Hold
                      </button>
                      <button
                        className="action-button bad"
                        onClick={() => applyDecision(item.id, "auto_fail")}
                        disabled={isPending}
                      >
                        Fail
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel-stack">
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Reports</p>
                    <h3>Moderation triage</h3>
                  </div>
                  <TimerGlyph />
                </div>
                <div className="stack compact-stack">
                  {snapshot.reports.map((report) => (
                    <article className="report-row" key={report.id}>
                      <div className="row-top">
                        <strong>{report.subjectLabel}</strong>
                        <span className={report.status === "open" ? "state-pill hot" : "state-pill"}>
                          {report.status}
                        </span>
                      </div>
                      <p>{report.reason}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Flags</p>
                    <h3>Policy and rollout settings</h3>
                  </div>
                  <SlidersHorizontal size={18} />
                </div>

                <form className="settings-form" onSubmit={submitSettings}>
                  <label>
                    <span>Excluded states</span>
                    <input
                      defaultValue={snapshot.featureFlags.excludedStates.join(", ")}
                      name="excludedStates"
                    />
                  </label>
                  <div className="settings-grid">
                    <label>
                      <span>Media days</span>
                      <input
                        defaultValue={snapshot.featureFlags.mediaRetentionDays}
                        name="mediaRetentionDays"
                        type="number"
                      />
                    </label>
                    <label>
                      <span>ID days</span>
                      <input
                        defaultValue={snapshot.featureFlags.rawIdRetentionDays}
                        name="rawIdRetentionDays"
                        type="number"
                      />
                    </label>
                    <label>
                      <span>Selfie hours</span>
                      <input
                        defaultValue={snapshot.featureFlags.selfieRetentionHours}
                        name="selfieRetentionHours"
                        type="number"
                      />
                    </label>
                  </div>
                  <div className="toggle-stack">
                    <label className="toggle-row">
                      <input defaultChecked={snapshot.featureFlags.adsEnabled} name="adsEnabled" type="checkbox" />
                      <div>
                        <strong>Ads scaffold</strong>
                        <span>Keep monetization plumbing visible but off by default.</span>
                      </div>
                    </label>
                    <label className="toggle-row">
                      <input
                        defaultChecked={snapshot.featureFlags.paymentsEnabled}
                        name="paymentsEnabled"
                        type="checkbox"
                      />
                      <div>
                        <strong>Payments scaffold</strong>
                        <span>Prepare billing controls without exposing them to members.</span>
                      </div>
                    </label>
                    <label className="toggle-row">
                      <input
                        defaultChecked={snapshot.featureFlags.phoneVerificationEnabled}
                        name="phoneVerificationEnabled"
                        type="checkbox"
                      />
                      <div>
                        <strong>Phone verification scaffold</strong>
                        <span>Leave off until a real SMS path exists.</span>
                      </div>
                    </label>
                  </div>
                  <div className="settings-footer">
                    <button className="submit-button" disabled={isPending} type="submit">
                      Save policy
                    </button>
                    {status ? <p className="status-line">{status}</p> : null}
                  </div>
                </form>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Audit log</p>
                    <h3>Latest operator moves</h3>
                  </div>
                </div>
                <div className="stack compact-stack">
                  {snapshot.moderationLog.map((item) => (
                    <article className="log-row" key={item.id}>
                      <strong>{item.actor}</strong>
                      <p>{item.action}</p>
                      <span>{item.subject}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "neutral" | "warning";
}) {
  return (
    <article className={tone === "warning" ? "metric-card warning" : "metric-card"}>
      <div className="metric-label">
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </article>
  );
}

function getViewCount(view: (typeof quickViews)[number], snapshot: AdminSnapshot) {
  switch (view) {
    case "Queue":
      return snapshot.reviewQueue.length;
    case "Reports":
      return snapshot.reports.length;
    case "Retention":
      return snapshot.featureFlags.mediaRetentionDays;
    case "Audit":
      return snapshot.moderationLog.length;
    default:
      return 0;
  }
}

function TimerGlyph() {
  return (
    <div className="glyph-wrap">
      <Clock3 size={18} />
    </div>
  );
}

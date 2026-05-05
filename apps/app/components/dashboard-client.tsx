"use client";

import {
  ActivityRequest,
  Club,
  Conversation,
  DashboardSnapshot,
  FeedPost
} from "@player2/shared";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Clock,
  MessageCircle,
  Newspaper,
  Plus,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import { FormEvent, useDeferredValue, useMemo, useState, useTransition } from "react";

type Props = {
  initialSnapshot: DashboardSnapshot;
  token: string;
  apiUrl: string;
};

const blankOrder = {
  activity: "Cocoa",
  title: "Buy COCO May 26",
  summary: "Limit order for premium cocoa lots with exchange-style settlement notes.",
  preferredGender: "any" as "female" | "male" | "any",
  minAge: 24,
  maxAge: 38,
  skillLevel: "competitive" as "beginner" | "casual" | "competitive",
  city: "New York",
  state: "NY",
  distanceMiles: 10,
  whenLabel: "Good for day"
};

const marketRows = [
  { symbol: "COCO", name: "Cocoa Index", price: "$9,426.20", move: "+2.84%", positive: true },
  { symbol: "CCK26", name: "May Futures", price: "$9,510.00", move: "+1.12%", positive: true },
  { symbol: "SUGR", name: "Sugar Basket", price: "$22.14", move: "-0.43%", positive: false },
  { symbol: "COFF", name: "Coffee Cross", price: "$3.72", move: "+0.68%", positive: true }
];

const chartBars = [44, 58, 53, 66, 61, 73, 69, 78, 74, 82, 88, 84, 93, 91, 98, 102];

export function DashboardClient({ initialSnapshot, token, apiUrl }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [orderForm, setOrderForm] = useState({ ...blankOrder });
  const [noteForm, setNoteForm] = useState({ headline: "", body: "" });
  const [messageBody, setMessageBody] = useState("");
  const [filter, setFilter] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string>("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [isPending, startTransition] = useTransition();

  const deferredFilter = useDeferredValue(filter);
  const primaryConversation = snapshot.conversations[0];
  const currentMessages = useMemo(
    () =>
      snapshot.messages.filter((message) => message.conversationId === primaryConversation?.id),
    [snapshot.messages, primaryConversation?.id]
  );

  const filteredOrders = useMemo(() => {
    if (!deferredFilter.trim()) {
      return snapshot.activities;
    }

    return snapshot.activities.filter((activity) =>
      `${activity.activity} ${activity.title} ${activity.summary}`
        .toLowerCase()
        .includes(deferredFilter.toLowerCase())
    );
  }, [deferredFilter, snapshot.activities]);

  const unreadAlerts = snapshot.notifications.filter((item) => !item.read).length;
  const openExposure = snapshot.activities.reduce((total, item) => total + item.applicants, 0);
  const portfolioValue = 248620 + snapshot.currentUser.trustScore * 84 + openExposure * 320;

  async function refresh() {
    const response = await fetch(`${apiUrl}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data: DashboardSnapshot = await response.json();
    setSnapshot(data);
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      await fetch(`${apiUrl}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...orderForm,
          title: `${side === "buy" ? "Buy" : "Sell"} ${orderForm.title}`,
          summary: `${side.toUpperCase()} ticket: ${orderForm.summary}`
        })
      });
      setOrderForm({ ...blankOrder });
      await refresh();
    });
  }

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      await fetch(`${apiUrl}/feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(noteForm)
      });
      setNoteForm({ headline: "", body: "" });
      await refresh();
    });
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!primaryConversation) {
      return;
    }

    startTransition(async () => {
      await fetch(`${apiUrl}/conversations/${primaryConversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          body: messageBody
        })
      });
      setMessageBody("");
      await refresh();
    });
  }

  function triggerVerification(profile: "clean" | "borderline" | "flagged") {
    const presets = {
      clean: {
        kind: "monthly_id",
        barcodeConfidence: 0.94,
        ocrConfidence: 0.92,
        faceMatchConfidence: 0.91,
        livenessConfidence: 0.9,
        imageQualityConfidence: 0.89,
        reportedUser: false
      },
      borderline: {
        kind: "meetup_face",
        barcodeConfidence: 0.66,
        ocrConfidence: 0.58,
        faceMatchConfidence: 0.7,
        livenessConfidence: 0.68,
        imageQualityConfidence: 0.73,
        reportedUser: false
      },
      flagged: {
        kind: "meetup_face",
        barcodeConfidence: 0.43,
        ocrConfidence: 0.49,
        faceMatchConfidence: 0.52,
        livenessConfidence: 0.46,
        imageQualityConfidence: 0.61,
        reportedUser: true
      }
    } as const;

    startTransition(async () => {
      const response = await fetch(`${apiUrl}/verification/attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(presets[profile])
      });

      const data = await response.json();
      setVerificationStatus(`${data.decision} (${Math.round(data.score * 100)}%)`);
      await refresh();
    });
  }

  return (
    <main className="trading-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">CT</div>
          <div>
            <strong>Coco Trading Dash</strong>
            <span>Live cocoa markets</span>
          </div>
        </div>
        <label className="global-search">
          <Search size={16} />
          <input
            aria-label="Search markets"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search symbol, order, club"
          />
        </label>
        <div className="topbar-actions">
          <button className="icon-control" aria-label="Alerts">
            <Bell size={18} />
            {unreadAlerts ? <span>{unreadAlerts}</span> : null}
          </button>
          <button className="text-control" onClick={() => triggerVerification("clean")}>
            <ShieldCheck size={16} />
            Verify
          </button>
        </div>
      </header>

      <section className="summary-strip">
        <MetricCard icon={<Wallet size={18} />} label="Portfolio value" value={formatCurrency(portfolioValue)} detail="+$4,218.90 today" positive />
        <MetricCard icon={<TrendingUp size={18} />} label="Buying power" value="$74,380.00" detail="Available now" positive />
        <MetricCard icon={<Activity size={18} />} label="Open exposure" value={`${openExposure} lots`} detail={`${filteredOrders.length} active tickets`} />
        <MetricCard icon={<Clock size={18} />} label="Market status" value="Open" detail="Closes 4:00 PM CT" positive />
      </section>

      <section className="workspace-grid">
        <div className="market-panel primary-market">
          <div className="panel-heading">
            <div>
              <p>COCO</p>
              <h1>Cocoa Index</h1>
            </div>
            <div className="price-lockup">
              <strong>$9,426.20</strong>
              <span className="positive">+$260.41 (2.84%)</span>
            </div>
          </div>
          <div className="chart-toolbar">
            {["1D", "1W", "1M", "3M", "1Y"].map((range, index) => (
              <button className={index === 0 ? "range active" : "range"} key={range}>
                {range}
              </button>
            ))}
          </div>
          <div className="price-chart" aria-label="Cocoa index price chart">
            {chartBars.map((height, index) => (
              <span
                className={index > 2 && chartBars[index] >= chartBars[index - 1] ? "bar up" : "bar down"}
                key={`${height}-${index}`}
                style={{ height }}
              />
            ))}
          </div>
          <div className="chart-stats">
            <span>Open <strong>$9,168.00</strong></span>
            <span>High <strong>$9,488.10</strong></span>
            <span>Volume <strong>18.4K</strong></span>
            <span>Margin <strong>12.5%</strong></span>
          </div>
        </div>

        <aside className="market-panel watchlist-panel">
          <div className="panel-heading compact">
            <div>
              <p>Watchlist</p>
              <h2>Markets</h2>
            </div>
            <button className="icon-control" aria-label="Add symbol">
              <Plus size={17} />
            </button>
          </div>
          <div className="watchlist">
            {marketRows.map((market) => (
              <MarketRow key={market.symbol} {...market} />
            ))}
          </div>
        </aside>

        <aside className="market-panel ticket-panel">
          <div className="panel-heading compact">
            <div>
              <p>Trade</p>
              <h2>Order ticket</h2>
            </div>
          </div>
          <div className="side-toggle" role="group" aria-label="Order side">
            <button className={side === "buy" ? "active" : ""} onClick={() => setSide("buy")} type="button">
              Buy
            </button>
            <button className={side === "sell" ? "active sell" : "sell"} onClick={() => setSide("sell")} type="button">
              Sell
            </button>
          </div>
          <form className="ticket-form" onSubmit={submitOrder}>
            <label>
              Symbol
              <input
                value={orderForm.activity}
                onChange={(event) =>
                  setOrderForm((current) => ({ ...current, activity: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Contract
              <input
                value={orderForm.title}
                onChange={(event) =>
                  setOrderForm((current) => ({ ...current, title: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Notes
              <textarea
                value={orderForm.summary}
                onChange={(event) =>
                  setOrderForm((current) => ({ ...current, summary: event.target.value }))
                }
                required
              />
            </label>
            <button className={side === "buy" ? "trade-button" : "trade-button sell"} disabled={isPending}>
              {side === "buy" ? "Preview buy" : "Preview sell"}
              <ChevronRight size={17} />
            </button>
          </form>
        </aside>
      </section>

      <section className="lower-grid">
        <div className="market-panel">
          <div className="panel-heading compact">
            <div>
              <p>Orders</p>
              <h2>Active cocoa book</h2>
            </div>
          </div>
          <div className="order-list">
            {filteredOrders.map((activity) => (
              <OrderCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        <div className="market-panel">
          <div className="panel-heading compact">
            <div>
              <p>Research</p>
              <h2>Desk notes</h2>
            </div>
            <Newspaper size={18} />
          </div>
          <form className="note-form" onSubmit={submitNote}>
            <input
              value={noteForm.headline}
              onChange={(event) =>
                setNoteForm((current) => ({ ...current, headline: event.target.value }))
              }
              placeholder="Market note headline"
              required
            />
            <textarea
              value={noteForm.body}
              onChange={(event) => setNoteForm((current) => ({ ...current, body: event.target.value }))}
              placeholder="Add supply, demand, weather, or logistics color"
              required
            />
            <button className="text-control" disabled={isPending}>
              Publish
              <Send size={16} />
            </button>
          </form>
          <div className="news-stack">
            {snapshot.feed.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <div className="market-panel">
          <div className="panel-heading compact">
            <div>
              <p>Network</p>
              <h2>Counterparties</h2>
            </div>
            <Users size={18} />
          </div>
          <div className="club-stack">
            {snapshot.clubs.map((club) => (
              <ClubRow key={club.id} club={club} />
            ))}
          </div>
        </div>

        <div className="market-panel chat-panel">
          <div className="panel-heading compact">
            <div>
              <p>Messages</p>
              <h2>{primaryConversation?.title ?? "Trading desk"}</h2>
            </div>
            <MessageCircle size={18} />
          </div>
          <div className="conversation-tabs">
            {snapshot.conversations.map((conversation) => (
              <ConversationChip key={conversation.id} conversation={conversation} />
            ))}
          </div>
          <div className="thread-messages">
            {currentMessages.map((message) => (
              <article
                className={
                  message.authorId === snapshot.currentUser.id ? "message bubble own" : "message bubble"
                }
                key={message.id}
              >
                {message.body}
              </article>
            ))}
          </div>
          <form className="message-form" onSubmit={submitMessage}>
            <input
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              placeholder="Message the desk"
              required
            />
            <button className="icon-control send" disabled={isPending} aria-label="Send message">
              <Send size={17} />
            </button>
          </form>
        </div>
      </section>

      <footer className="risk-footer">
        <span>Account: {snapshot.currentUser.displayName}</span>
        <span>Trust score: {snapshot.currentUser.trustScore}</span>
        <span>ID refresh: {snapshot.currentUser.idCheckDueAt.slice(0, 10)}</span>
        {verificationStatus ? <span>Latest verification: {verificationStatus}</span> : null}
      </footer>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  positive
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={positive ? "positive" : ""}>{detail}</small>
      </div>
    </article>
  );
}

function MarketRow({
  symbol,
  name,
  price,
  move,
  positive
}: {
  symbol: string;
  name: string;
  price: string;
  move: string;
  positive: boolean;
}) {
  return (
    <article className="market-row">
      <div>
        <strong>{symbol}</strong>
        <span>{name}</span>
      </div>
      <div>
        <strong>{price}</strong>
        <span className={positive ? "positive" : "negative"}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {move}
        </span>
      </div>
    </article>
  );
}

function OrderCard({ activity }: { activity: ActivityRequest }) {
  return (
    <article className="order-card">
      <div>
        <span className="symbol-pill">{activity.activity}</span>
        <h3>{activity.title}</h3>
        <p>{activity.summary}</p>
      </div>
      <div className="order-meta">
        <span>{activity.whenLabel}</span>
        <span>{activity.skillLevel}</span>
        <strong>{activity.applicants} lots</strong>
      </div>
    </article>
  );
}

function NewsCard({ post }: { post: FeedPost }) {
  return (
    <article className="news-card">
      <div>
        <span>{post.author.displayName}</span>
        <strong>{new Date(post.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</strong>
      </div>
      <h3>{post.headline}</h3>
      <p>{post.body}</p>
    </article>
  );
}

function ClubRow({ club }: { club: Club }) {
  return (
    <article className="club-row">
      <div>
        <strong>{club.name}</strong>
        <span>
          {club.city}, {club.state}
        </span>
      </div>
      <div>
        <strong>{club.membersCount}</strong>
        <span>{club.tags.slice(0, 2).join(" / ")}</span>
      </div>
    </article>
  );
}

function ConversationChip({ conversation }: { conversation: Conversation }) {
  return (
    <article className="conversation-chip">
      <strong>{conversation.title}</strong>
      <span>{conversation.unreadCount} unread</span>
    </article>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

"use client";

import { useState } from "react";
import {
  Activity, ArrowUpRight, BarChart3, CalendarDays, CircleHelp,
  Crosshair, LayoutDashboard, RefreshCw, Search, Settings2, ShieldCheck,
  Users, Wallet,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Team", icon: Users },
  { label: "Transfer Intelligence", icon: ArrowUpRight },
  { label: "Predictions", icon: BarChart3 },
  { label: "Fixtures & Analysis", icon: CalendarDays },
];

export default function Home() {
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function connectTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{1,10}$/.test(teamId.trim())) {
      setNotice("Ange ett giltigt numeriskt FPL Team ID.");
      return;
    }
    setLoading(true);
    setNotice("Team ID sparat lokalt. Nästa steg är att ansluta FPL-data.");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("scoutiq-team-id", teamId.trim());
    }
    setLoading(false);
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div><div className="brand-name">ScoutIQ</div><div className="brand-sub">FPL Intelligence</div></div>
        </div>
        <div>
          <div className="nav-label">WORKSPACE</div>
          <nav className="nav-list">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              return <button className={`nav-item ${index === 0 ? "active" : ""}`} key={item.label}>
                <Icon size={16} strokeWidth={1.8} /> {item.label}
              </button>;
            })}
          </nav>
        </div>
        <div>
          <div className="nav-label">PREFERENCES</div>
          <nav className="nav-list">
            <button className="nav-item"><Settings2 size={16} /> Settings</button>
            <button className="nav-item"><CircleHelp size={16} /> Help & feedback</button>
          </nav>
        </div>
        <div className="sidebar-bottom">Personal FPL workspace<br />Built for better decisions.</div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div><div className="eyebrow">Overview / Gameweek</div><h1 className="page-title">Good to have you back.</h1></div>
          <div className="status-pill"><span className="status-dot" /> Waiting for FPL connection</div>
        </header>

        <section className="metric-grid">
          {[
            { label: "Overall points", value: "—", note: "Connect your FPL team", icon: Activity },
            { label: "Overall rank", value: "—", note: "Your global position", icon: Crosshair },
            { label: "Team value", value: "—", note: "Squad market value", icon: Wallet },
            { label: "Next Gameweek", value: "—", note: "Deadline and fixtures", icon: CalendarDays },
          ].map((metric) => {
            const Icon = metric.icon;
            return <div className="card" key={metric.label}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span className="metric-label">{metric.label}</span><Icon size={16} color="#98a3b2" />
              </div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-note">{metric.note}</div>
            </div>;
          })}
        </section>

        <div className="section-heading"><div><h2>Team overview</h2><p>Your FPL squad and current performance</p></div></div>
        <section className="content-grid">
          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div><h2 style={{fontSize:14,margin:0}}>My squad</h2><p className="metric-note">Your 15-player squad will appear here</p></div>
              <ShieldCheck size={18} color="#98a3b2" />
            </div>
            <div className="empty-state"><strong>No team connected yet</strong>Connect your Fantasy Premier League team to see your squad, captain and team structure.</div>
            <form className="team-form" onSubmit={connectTeam}>
              <input className="team-input" value={teamId} onChange={(e)=>setTeamId(e.target.value)} placeholder="Enter your FPL Team ID" inputMode="numeric" aria-label="FPL Team ID" />
              <button className="primary-button" type="submit" disabled={loading}>{loading ? "Connecting..." : "Connect team"}</button>
            </form>
            {notice && <p className="metric-note" role="status">{notice}</p>}
          </div>
          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div><h2 style={{fontSize:14,margin:0}}>ScoutIQ insights</h2><p className="metric-note">Your next best decisions</p></div>
              <Search size={17} color="#98a3b2" />
            </div>
            <div className="empty-state"><strong>Analysis will appear here</strong>ScoutIQ will highlight form, fixture swings, injury news and transfer opportunities once your team is connected.</div>
          </div>
        </section>

        <div className="section-heading"><div><h2>Intelligence modules</h2><p>Five connected parts of your FPL assistant</p></div></div>
        <section className="metric-grid">
          {[
            ["My Team", "Squad, budget and captaincy"],
            ["Transfers", "Five high-value transfer ideas"],
            ["Predictions", "1, 5 and 10-match outlook"],
            ["Fixtures", "Difficulty and fixture runs"],
          ].map(([title, description]) => <div className="card" key={title}>
            <div style={{fontSize:13,fontWeight:700}}>{title}</div><p className="metric-note">{description}</p>
          </div>)}
        </section>
        <p className="metric-note" style={{display:"flex",alignItems:"center",gap:6,marginTop:24}}><RefreshCw size={12}/> Data connection and automated refresh will be enabled in the next build step.</p>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Activity, ArrowUpRight, BarChart3, CalendarDays, CircleHelp,
  Crosshair, LayoutDashboard, RefreshCw, Search, Settings2,
  ShieldCheck, Users, Wallet,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Team", icon: Users },
  { label: "Transfer Intelligence", icon: ArrowUpRight },
  { label: "Predictions", icon: BarChart3 },
  { label: "Fixtures & Analysis", icon: CalendarDays },
];

type FplData = {
  updatedAt: string;
  gameweek: { id: number; name: string; deadline_time: string } | null;\n  picksEvent: { id: number; name: string } | null;
  totals: { players: number; teams: number };
  players: Array<{ id: number; name: string; team: number; position: number; price: number; points: number; form: string; status: string; selectedBy: string }>;
  clubs: Array<{ id: number; name: string; short_name: string }>;
  manager: { name?: string; player_first_name?: string; player_last_name?: string; summary_overall_points?: number; summary_overall_rank?: number; value?: number; bank?: number } | null;
  picks: { picks?: Array<{ element: number; position: number; multiplier: number; is_captain: boolean; is_vice_captain: boolean }> } | null;
  teamError: string | null;
};

export default function Home() {
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [data, setData] = useState<FplData | null>(null);

  async function connectTeam(id = teamId) {
    const cleanId = id.trim();
    if (!/^\d{1,10}$/.test(cleanId)) {
      setNotice("Ange ett giltigt numeriskt FPL Team ID.");
      return;
    }
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch(`/api/fpl?teamId=${encodeURIComponent(cleanId)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Kunde inte hämta FPL-data.");
      setData(result);
      if (result.teamError) setNotice(result.teamError);
      else if (result.manager) setNotice("Ditt FPL-lag är anslutet. Data hämtades från FPL.");
      else setNotice("FPL-data hämtad, men managerprofilen kunde inte hittas.");
      window.localStorage.setItem("scoutiq-team-id", cleanId);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Något gick fel vid anslutningen.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("scoutiq-team-id");
    if (saved) {
      setTeamId(saved);
      void connectTeam(saved);
    } else {
      fetch("/api/fpl")
        .then(async (response) => {
          if (!response.ok) throw new Error("FPL data unavailable");
          setData(await response.json());
        })
        .catch(() => setNotice("Kunde inte nå FPL just nu. Försök igen senare."));
    }
  }, []);

  const manager = data?.manager;
  const metrics = [
    { label: "Overall points", value: manager?.summary_overall_points?.toLocaleString() ?? "—", note: manager ? "FPL manager points" : "Connect your FPL team", icon: Activity },
    { label: "Overall rank", value: manager?.summary_overall_rank?.toLocaleString() ?? "—", note: "Your global position", icon: Crosshair },
    { label: "Team value", value: manager?.value ? `£${(manager.value / 10).toFixed(1)}m` : "—", note: manager ? "Current squad value" : "Squad market value", icon: Wallet },
    { label: "Gameweek", value: data?.gameweek?.id ? `GW ${data.gameweek.id}` : "—", note: data?.gameweek?.name ?? "Upcoming deadline", icon: CalendarDays },
  ];

  const clubName = (id: number) => data?.clubs.find((club) => club.id === id)?.short_name ?? "—";
  const playerById = new Map((data?.players ?? []).map((player) => [player.id, player]));

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">S</div><div><div className="brand-name">ScoutIQ</div><div className="brand-sub">FPL Intelligence</div></div></div>
        <div><div className="nav-label">WORKSPACE</div><nav className="nav-list">{navigation.map((item, index) => { const Icon = item.icon; return <button className={`nav-item ${index === 0 ? "active" : ""}`} key={item.label}><Icon size={16} strokeWidth={1.8} /> {item.label}</button>; })}</nav></div>
        <div><div className="nav-label">PREFERENCES</div><nav className="nav-list"><button className="nav-item"><Settings2 size={16} /> Settings</button><button className="nav-item"><CircleHelp size={16} /> Help & feedback</button></nav></div>
        <div className="sidebar-bottom">Personal FPL workspace<br />Built for better decisions.</div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div><div className="eyebrow">Overview / Gameweek</div><h1 className="page-title">Good to have you back{manager?.player_first_name ? `, ${manager.player_first_name}` : ""}.</h1></div>
          <div className="status-pill"><span className="status-dot" style={{ background: data ? "#16845a" : "#d59a36" }} /> {data ? "FPL data connected" : "Connecting to FPL"}</div>
        </header>

        <section className="metric-grid">{metrics.map((metric) => { const Icon = metric.icon; return <div className="card" key={metric.label}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="metric-label">{metric.label}</span><Icon size={16} color="#98a3b2" /></div><div className="metric-value">{metric.value}</div><div className="metric-note">{metric.note}</div></div>; })}</section>

        <div className="section-heading"><div><h2>My Team</h2><p>Full squad overview · starting XI and substitutes</p></div></div>
        <section className="card" style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:18}}>
            <div><h2 style={{fontSize:14,margin:0}}>{manager?.name ?? "Your FPL squad"}</h2><p className="metric-note">{manager ? `Team ID ${teamId}` : "Connect your FPL Team ID to load all 15 players"}</p></div>
            <div className="status-pill">{data?.picksEvent ? `Squad · ${data.picksEvent.name}` : "Squad not loaded"}</div>
          </div>
          {data?.picks?.picks?.length ? <>
            {(["Goalkeeper","Defenders","Midfielders","Forwards"] as const).map((group, groupIndex) => {
              const positions = [1,2,3,4];
              const players = data.picks!.picks!.filter((pick) => playerById.get(pick.element)?.position === positions[groupIndex] && pick.position <= 11);
              if (!players.length) return null;
              return <div key={group} style={{marginBottom:18}}>
                <div className="nav-label" style={{padding:0,marginBottom:8}}>{group}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(125px,1fr))",gap:9}}>
                  {players.map((pick) => {
                    const player = playerById.get(pick.element);
                    if (!player) return null;
                    return <div key={pick.element} style={{border:"1px solid #e8ebf0",borderRadius:10,padding:11,background:"#fbfcfb",textAlign:"center"}}>
                      <div style={{fontSize:12,fontWeight:700}}>{player.name}</div>
                      <div className="metric-note">{clubName(player.team)} · £{(player.price/10).toFixed(1)}m</div>
                      <div style={{display:"flex",justifyContent:"center",gap:5,flexWrap:"wrap",marginTop:8}}>
                        <span className="status-pill">{player.points} pts</span>
                        {pick.is_captain && <span className="status-pill" style={{background:"#eaf5ef",color:"#167a55"}}>C</span>}
                        {pick.is_vice_captain && <span className="status-pill">VC</span>}
                      </div>
                    </div>;
                  })}
                </div>
              </div>;
            })}
            <div style={{borderTop:"1px solid #e8ebf0",paddingTop:14}}>
              <div className="nav-label" style={{padding:0,marginBottom:8}}>Substitutes</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(125px,1fr))",gap:9}}>
                {data.picks.picks.filter((pick) => pick.position > 11).sort((a,b)=>a.position-b.position).map((pick) => {
                  const player = playerById.get(pick.element);
                  if (!player) return null;
                  return <div key={pick.element} style={{border:"1px solid #e8ebf0",borderRadius:10,padding:11,background:"#f7f8fa",textAlign:"center"}}>
                    <div className="metric-note">Bench {pick.position - 11}</div>
                    <div style={{fontSize:12,fontWeight:700}}>{player.name}</div>
                    <div className="metric-note">{clubName(player.team)} · £{(player.price/10).toFixed(1)}m · {player.points} pts</div>
                  </div>;
                })}
              </div>
            </div>
          </> : <div className="empty-state"><strong>{manager ? "Your full squad is not published yet" : "No team connected yet"}</strong>Enter your Team ID below. FPL makes the complete 15-player squad available through a Gameweek team-picks endpoint once picks are published. We also try the latest completed Gameweek.</div>}
          <form className="team-form" onSubmit={(event) => { event.preventDefault(); void connectTeam(); }}><input className="team-input" value={teamId} onChange={(event)=>setTeamId(event.target.value)} placeholder="Enter your FPL Team ID" inputMode="numeric" aria-label="FPL Team ID" /><button className="primary-button" type="submit" disabled={loading}>{loading ? "Connecting..." : "Load my team"}</button></form>
          {notice && <p className="metric-note" role="status">{notice}</p>}
        </section>
        <section className="content-grid">
          <div className="card">
            <h2 style={{fontSize:14,margin:0}}>Team summary</h2>
            <p className="metric-note">Your FPL account overview</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,marginTop:16}}>
              <div><div className="metric-note">Overall points</div><strong>{manager?.summary_overall_points?.toLocaleString() ?? "—"}</strong></div>
              <div><div className="metric-note">Overall rank</div><strong>{manager?.summary_overall_rank?.toLocaleString() ?? "—"}</strong></div>
              <div><div className="metric-note">Team value</div><strong>{manager?.value ? `£${(manager.value/10).toFixed(1)}m` : "—"}</strong></div>
              <div><div className="metric-note">In the bank</div><strong>{manager?.bank !== undefined ? `£${(manager.bank/10).toFixed(1)}m` : "—"}</strong></div>
            </div>
          </div>
          <div className="card">
            <h2 style={{fontSize:14,margin:0}}>FPL data status</h2>
            <p className="metric-note">{data ? `${data.totals.players} players · ${data.totals.teams} clubs loaded` : "Waiting for FPL data"}</p>
            <div className="empty-state" style={{marginTop:14}}><strong>{data?.gameweek?.name ?? "Gameweek information"}</strong>{data?.gameweek ? `Deadline ${new Date(data.gameweek.deadline_time).toLocaleString()}` : "Current and next Gameweek data will appear here."}</div>
            <button className="primary-button" style={{height:36,marginTop:14}} onClick={() => void connectTeam()} disabled={loading}><RefreshCw size={13} style={{verticalAlign:"middle",marginRight:7}} />Refresh team</button>
          </div>
        </section>

        <div className="section-heading"><div><h2>Top players by points</h2><p>Live player data from the FPL API</p></div></div>
        <section className="card" style={{overflowX:"auto"}}>
          {data?.players?.length ? <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,textAlign:"left"}}><thead><tr style={{color:"#778294"}}>{["Player","Club","Price","Points","Form","Selected"].map((label)=><th key={label} style={{padding:"10px 8px",fontWeight:600}}>{label}</th>)}</tr></thead><tbody>{[...data.players].sort((a,b)=>b.points-a.points).slice(0,10).map((player)=><tr key={player.id} style={{borderTop:"1px solid #eef0f3"}}><td style={{padding:"11px 8px",fontWeight:650}}>{player.name}</td><td style={{padding:"11px 8px"}}>{clubName(player.team)}</td><td style={{padding:"11px 8px"}}>£{(player.price/10).toFixed(1)}m</td><td style={{padding:"11px 8px",fontWeight:700}}>{player.points}</td><td style={{padding:"11px 8px"}}>{player.form}</td><td style={{padding:"11px 8px"}}>{player.selectedBy}%</td></tr>)}</tbody></table> : <div className="empty-state">Player statistics are loading.</div>}
        </section>
        <p className="metric-note" style={{display:"flex",alignItems:"center",gap:6,marginTop:24}}><RefreshCw size={12}/> {data?.updatedAt ? `Last synced ${new Date(data.updatedAt).toLocaleString()}. Data refreshes every five minutes.` : "Connecting to the official Fantasy Premier League data API."}</p>
      </main>
    </div>
  );
}

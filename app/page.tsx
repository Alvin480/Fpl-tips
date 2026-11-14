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
  gameweek: { id: number; name: string; deadline_time: string } | null;
  picksEvent: { id: number; name: string } | null;
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

        <div className="section-heading"><div><h2>My Team</h2><p>Your actual FPL starting XI, formation and substitutes</p></div></div>
        <section className="card" style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:16}}>
            <div>
              <h2 style={{fontSize:14,margin:0}}>{manager?.name ?? "Your FPL squad"}</h2>
              <p className="metric-note">{manager ? `Team ID ${teamId}` : "Connect your FPL Team ID to load your squad"}</p>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {data?.picksEvent && <span className="status-pill">{data.picksEvent.name}</span>}
              {data?.picks?.picks && <span className="status-pill">{data.picks.picks.filter((pick) => pick.position <= 11).length} starters · {data.picks.picks.filter((pick) => pick.position > 11).length} substitutes</span>}
            </div>
          </div>

          {data?.picks?.picks?.length ? (() => {
            const starting = data.picks.picks.filter((pick) => pick.position <= 11);
            const bench = data.picks.picks.filter((pick) => pick.position > 11).sort((a,b) => a.position-b.position);
            const formation = [2,3,4].map((position) => starting.filter((pick) => playerById.get(pick.element)?.position === position).length).join("-");
            const renderPlayer = (pick: typeof starting[number], isBench = false) => {
              const player = playerById.get(pick.element);
              if (!player) return null;
              return <div key={pick.element} style={{width:112,maxWidth:"29vw",background:"rgba(255,255,255,.97)",border:"1px solid rgba(17,58,38,.12)",borderRadius:10,padding:"9px 7px",textAlign:"center",boxShadow:"0 2px 7px rgba(0,0,0,.10)"}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"#eaf5ef",color:"#167a55",display:"grid",placeItems:"center",fontSize:10,fontWeight:800,margin:"0 auto 6px"}}>{clubName(player.team)}</div>
                <div style={{fontSize:11,fontWeight:750,color:"#18212f",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{player.name}</div>
                <div style={{fontSize:9,color:"#778294",marginTop:3}}>£{(player.price/10).toFixed(1)}m · {player.points} pts</div>
                <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:6,flexWrap:"wrap"}}>
                  {pick.is_captain && <span style={{fontSize:9,fontWeight:800,background:"#167a55",color:"white",borderRadius:99,padding:"2px 6px"}}>C</span>}
                  {pick.is_vice_captain && <span style={{fontSize:9,fontWeight:800,background:"#eaf5ef",color:"#167a55",borderRadius:99,padding:"2px 6px"}}>VC</span>}
                  {isBench && <span style={{fontSize:9,color:"#647184"}}>B{pick.position-11}</span>}
                </div>
              </div>;
            };
            return <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span className="nav-label" style={{padding:0,margin:0}}>STARTING XI</span>
                <span style={{fontSize:11,fontWeight:700,color:"#167a55"}}>Formation {formation}</span>
              </div>
              <div style={{position:"relative",overflow:"hidden",borderRadius:14,padding:"20px 8px",background:"repeating-linear-gradient(0deg,#247a4b 0px,#247a4b 62px,#2b8754 62px,#2b8754 124px)",border:"4px solid #e5eee7"}}>
                <div style={{position:"absolute",inset:"8px",border:"1px solid rgba(255,255,255,.42)",borderRadius:8,pointerEvents:"none"}} />
                <div style={{position:"absolute",left:"50%",top:"50%",width:94,height:94,border:"1px solid rgba(255,255,255,.32)",borderRadius:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}} />
                <div style={{position:"absolute",left:8,right:8,top:"50%",borderTop:"1px solid rgba(255,255,255,.32)",pointerEvents:"none"}} />
                <div style={{position:"relative",zIndex:1,display:"grid",gap:16}}>
                  {[1,2,3,4].map((position) => {
                    const rowPlayers = starting.filter((pick) => playerById.get(pick.element)?.position === position).sort((a,b) => a.position-b.position);
                    if (!rowPlayers.length) return null;
                    return <div key={position} style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      {rowPlayers.map((pick) => renderPlayer(pick))}
                    </div>;
                  })}
                </div>
              </div>
              <div style={{marginTop:18,border:"1px solid #e8ebf0",background:"#f7f8fa",borderRadius:12,padding:13}}>
                <div className="nav-label" style={{padding:0,marginBottom:10}}>SUBSTITUTES</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}}>
                  {bench.map((pick) => <div key={pick.element} style={{minWidth:0}}>{renderPlayer(pick,true)}</div>)}
                </div>
              </div>
            </>;
          })() : <div className="empty-state"><strong>{manager ? "Your team picks are not available yet" : "No team connected yet"}</strong>Connect your Team ID. FPL only publishes the full squad through a Gameweek picks endpoint; ScoutIQ also checks the latest completed Gameweek.</div>}

          <form className="team-form" onSubmit={(event) => { event.preventDefault(); void connectTeam(); }}>
            <input className="team-input" value={teamId} onChange={(event)=>setTeamId(event.target.value)} placeholder="Enter your FPL Team ID" inputMode="numeric" aria-label="FPL Team ID" />
            <button className="primary-button" type="submit" disabled={loading}>{loading ? "Connecting..." : "Load my team"}</button>
          </form>
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

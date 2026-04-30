import React, { useState, useEffect } from "react";
const L1_TEAMS = [
  { id: "psg", name: "PSG", logo: "🔵" },
  { id: "om", name: "Marseille", logo: "🩵" },
  { id: "mon", name: "Monaco", logo: "🔴" },
  { id: "lil", name: "Lille", logo: "🔴" },
  { id: "nic", name: "Nice", logo: "🔴" },
  { id: "oly", name: "Lyon", logo: "🔵" },
  { id: "ren", name: "Rennes", logo: "🔴" },
  { id: "len", name: "Lens", logo: "🟡" },
  { id: "str", name: "Strasbourg", logo: "🔵" },
  { id: "nan", name: "Nantes", logo: "🟡" },
];
const FIXTURES = [
  { home: "psg", away: "nan", day: "Sam. 15:00" },
  { home: "om", away: "ren", day: "Sam. 17:00" },
  { home: "mon", away: "lil", day: "Sam. 19:00" },
  { home: "nic", away: "str", day: "Dim. 13:00" },
  { home: "oly", away: "len", day: "Dim. 15:00" },
];
const getTeam = (id) => L1_TEAMS.find((t) => t.id === id) || { name: "?", logo: "⚽" };
const genCode = () => { const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join(""); };
const S = { get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const st = { bg: "#0D0D0D", s1: "#1A1A1A", bd: "#2E2E2E", g: "#39E979", r: "#FF4444", y: "#FFD000", txt: "#F2F2F2", mu: "#888" };
function Btn({ onClick, children, style = {}, disabled = false }) {
  return <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: "14px 20px", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, ...style }}>{children}</button>;
}
function Card({ children, style = {} }) {
  return <div style={{ background: st.s1, border: `1px solid ${st.bd}`, borderRadius: 12, overflow: "hidden", ...style }}>{children}</div>;
}
function Row({ children, style = {} }) {
  return <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${st.bd}`, gap: 10, ...style }}>{children}</div>;
}
function Avatar({ pseudo }) {
  return <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{(pseudo || "?")[0].toUpperCase()}</div>;
}
function Badge({ children, color = st.g }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 99, padding: "3px 9px", fontSize: 12, fontWeight: 700 }}>{children}</span>;
}
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: st.g, color: "#000", fontWeight: 700, padding: "10px 22px", borderRadius: 99, fontSize: 14, zIndex: 999, whiteSpace: "nowrap" }}>{msg}</div>;
}
export default function App() {
  const [user, setUser] = useState(() => S.get("srv_user"));
  const [lobby, setLobby] = useState(() => S.get("srv_lobby"));
  const [tab, setTab] = useState("accueil");
  const [toast, setToast] = useState(null);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const setU = (u) => { setUser(u); S.set("srv_user", u); };
  const setL = (l) => { setLobby(l); S.set("srv_lobby", l); };
  const updLobby = (fn) => { setLobby((prev) => { const next = fn(prev); const all = S.get("srv_lobbies", {}); if (next) all[next.code] = next; S.set("srv_lobbies", all); S.set("srv_lobby", next); return next; }); };
  const logout = () => { setU(null); setL(null); S.set("srv_user", null); S.set("srv_lobby", null); };
  const wrap = (child) => <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: st.bg, display: "flex", flexDirection: "column", fontFamily: "system-ui,sans-serif", color: st.txt }}>{child}<Toast msg={toast} /></div>;
  if (!user) return wrap(<AuthScreen onLogin={setU} showToast={showToast} />);
  if (!lobby) return wrap(<HomeScreen user={user} onJoin={setL} onLogout={logout} showToast={showToast} />);
  const me = lobby.players.find((p) => p.uid === user.uid);
  const isHost = lobby.host === user.uid;
  return wrap(<>
    {tab === "accueil" && <AccueilTab lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} showToast={showToast} onLeave={() => setL(null)} />}
    {tab === "resultats" && <ResultatsTab lobby={lobby} />}
    {tab === "classement" && <ClassementTab lobby={lobby} />}
    {tab === "profil" && <ProfilTab user={user} me={me} onLogout={logout} />}
    <nav style={{ display: "flex", background: "#111", borderTop: `1px solid ${st.bd}`, flexShrink: 0 }}>
      {[["accueil","🏠","Accueil"],["resultats","📋","Résultats"],["classement","🏆","Classement"],["profil","👤","Profil"]].map(([id,icon,label]) => (
        <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "10px 0 12px", background: "transparent", border: "none", color: tab === id ? st.g : st.mu, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>{label}
        </button>
      ))}
    </nav>
  </>);
}
function Hero() {
  return <div style={{ textAlign: "center", padding: "50px 24px 32px", background: "linear-gradient(180deg,#0a1a0a,#0D0D0D)" }}>
    <div style={{ fontSize: 64 }}>⚽</div>
    <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1 }}>SURVIVOR<br /><span style={{ color: st.g }}>LIGUE 1</span></div>
    <div style={{ fontSize: 14, color: st.mu, marginTop: 8 }}>Sois le dernier survivant !</div>
  </div>;
}
function AuthScreen({ onLogin, showToast }) {
  const [mode, setMode] = useState("login");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const inp = { background: st.s1, border: `1.5px solid ${st.bd}`, borderRadius: 12, padding: "14px 16px", color: st.txt, fontSize: 16, width: "100%", outline: "none", marginBottom: 8, boxSizing: "border-box" };
  const submit = () => {
    setErr("");
    if (!email || !pwd) return setErr("Remplis tous les champs.");
    const users = S.get("srv_users", []);
    if (mode === "signup") {
      if (!pseudo) return setErr("Choisis un pseudo.");
      if (users.find((u) => u.email === email)) return setErr("Email déjà utilisé.");
      const u = { uid: genCode(), pseudo, email, pwd, points: 0 };
      S.set("srv_users", [...users, u]); onLogin(u);
    } else {
      const found = users.find((u) => u.email === email && u.pwd === pwd);
      if (!found) return setErr("Email ou mot de passe incorrect."); onLogin(found);
    }
  };
  return <div style={{ overflowY: "auto", flex: 1 }}>
    <Hero />
    <div style={{ padding: "0 18px 40px" }}>
      <div style={{ display: "flex", marginBottom: 16, background: st.s1, borderRadius: 12, padding: 4 }}>
        {["login","signup"].map((m) => <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: 10, border: "none", borderRadius: 8, background: mode === m ? "#222" : "transparent", color: mode === m ? st.txt : st.mu, fontWeight: 700, cursor: "pointer" }}>{m === "login" ? "Connexion" : "Inscription"}</button>)}
      </div>
      {mode === "signup" && <input style={inp} type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Ton pseudo" />}
      <input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input style={{ ...inp, marginBottom: 12 }} type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Mot de passe" onKeyDown={(e) => e.key === "Enter" && submit()} />
      {err && <div style={{ background: st.r + "22", border: `1px solid ${st.r}44`, borderRadius: 10, padding: "10px 14px", color: st.r, marginBottom: 12 }}>{err}</div>}
      <Btn onClick={submit} style={{ background: st.g, color: "#000" }}>{mode === "login" ? "SE CONNECTER" : "CRÉER MON COMPTE"}</Btn>
    </div>
  </div>;
}
function HomeScreen({ user, onJoin, onLogout, showToast }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const create = () => {
    const c = genCode();
    const lobby = { code: c, name: `Ligue de ${user.pseudo}`, host: user.uid, status: "waiting", round: 12, deadline: Date.now() + 7632000, players: [{ uid: user.uid, pseudo: user.pseudo, alive: true, pick: null, result: null, usedTeams: [], points: 0 }], history: [] };
    const all = S.get("srv_lobbies", {}); all[c] = lobby; S.set("srv_lobbies", all); onJoin(lobby);
  };
  const join = () => {
    setErr(""); const c = code.trim().toUpperCase(); const all = S.get("srv_lobbies", {});
    if (!all[c]) return setErr("Code introuvable.");
    const lob = all[c];
    if (!lob.players.find((p) => p.uid === user.uid)) { lob.players.push({ uid: user.uid, pseudo: user.pseudo, alive: true, pick: null, result: null, usedTeams: [], points: 0 }); all[c] = lob; S.set("srv_lobbies", all); }
    onJoin(lob);
  };
  return <div style={{ overflowY: "auto", flex: 1 }}>
    <Hero />
    <div style={{ padding: "0 18px 24px" }}>
      <Btn onClick={create} style={{ background: st.g, color: "#000", marginBottom: 12 }}>⊕ CRÉER UNE LIGUE</Btn>
      <div style={{ textAlign: "center", fontSize: 12, color: st.mu, marginBottom: 8 }}>Entrer un code</div>
      <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="X X X X X X" maxLength={6} style={{ background: st.s1, border: `1.5px solid ${st.bd}`, borderRadius: 12, padding: "14px 16px", color: st.g, fontSize: 24, textAlign: "center", letterSpacing: 8, width: "100%", outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
      {err && <div style={{ color: st.r, fontSize: 13, marginBottom: 8 }}>{err}</div>}
      <Btn onClick={join} disabled={code.length < 5} style={{ background: code.length >= 5 ? st.g : "#222", color: code.length >= 5 ? "#000" : st.mu, marginBottom: 12 }}>REJOINDRE</Btn>
      <Btn onClick={onLogout} style={{ background: "transparent", color: st.mu, border: `1.5px solid ${st.bd}` }}>⏻ Déconnexion</Btn>
    </div>
  </div>;
function AccueilTab({ lobby, me, isHost, updLobby, showToast, onLeave }) {
  const { status } = lobby;
  if (status === "finished") return <WinnerScreen lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} onLeave={onLeave} />;
  if (status === "roundEnd") return <ResultsScreen lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} showToast={showToast} />;
  if (status === "picking" || status === "closed") return <PickingScreen lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} showToast={showToast} />;
  return <LobbyWaiting lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} showToast={showToast} onLeave={onLeave} />;
}
function LobbyWaiting({ lobby, me, isHost, updLobby, showToast, onLeave }) {
  const copy = () => { navigator.clipboard?.writeText(lobby.code).catch(() => {}); showToast("Code copié !"); };
  return <div style={{ flex: 1, overflowY: "auto" }}>
    <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${st.bd}` }}>
      <button onClick={onLeave} style={{ background: "none", border: "none", color: st.txt, fontSize: 22, cursor: "pointer", marginRight: 8 }}>←</button>
      <div style={{ flex: 1, textAlign: "center", fontWeight: 700 }}>{lobby.name}</div>
      <div style={{ width: 30 }} />
    </div>
    <div style={{ padding: 18 }}>
      <div style={{ fontSize: 11, color: st.mu, marginBottom: 6, letterSpacing: 1 }}>CODE DE LA LIGUE</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: st.s1, border: `1px solid ${st.bd}`, borderRadius: 12, padding: "14px 20px", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: 8, color: st.g }}>{lobby.code}</span>
        <button onClick={copy} style={{ background: "#222", border: `1px solid ${st.bd}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>📋</button>
      </div>
      <div style={{ fontSize: 11, color: st.mu, marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>JOUEURS ({lobby.players.length})</div>
      <Card style={{ marginBottom: 16 }}>
        {lobby.players.map((p) => <Row key={p.uid}>
          <Avatar pseudo={p.pseudo} />
          <span style={{ flex: 1, fontWeight: 600 }}>{p.pseudo} {p.uid === lobby.host && <span style={{ fontSize: 11, color: st.mu }}>Admin</span>}</span>
          <span style={{ color: st.g, fontWeight: 700 }}>{p.points} pts</span>
          <Badge>Prêt</Badge>
        </Row>)}
      </Card>
      {isHost
        ? <Btn onClick={() => updLobby((l) => ({ ...l, status: "picking", deadline: Date.now() + 7632000 }))} style={{ background: st.g, color: "#000" }}>LANCER LA PARTIE</Btn>
        : <div style={{ textAlign: "center", color: st.mu, padding: 16 }}>En attente que l'admin lance la partie...</div>
      }
    </div>
  </div>;
}
function PickingScreen({ lobby, me, isHost, updLobby, showToast }) {
  const closed = lobby.status === "closed";
  const myPick = me?.pick;
  const usedTeams = me?.usedTeams || [];
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const iv = setInterval(() => { const d = Math.max(0, (lobby.deadline || 0) - Date.now()); const h = Math.floor(d / 3600000); const m = Math.floor((d % 3600000) / 60000); const s = Math.floor((d % 60000) / 1000); setTimeLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`); }, 1000);
    return () => clearInterval(iv);
  }, [lobby.deadline]);
  const pick = (id) => { if (closed || myPick || usedTeams.includes(id) || !me?.alive) return; updLobby((l) => ({ ...l, players: l.players.map((p) => p.uid === me.uid ? { ...p, pick: id } : p) })); showToast(`${getTeam(id).name} sélectionné ✓`); };
  const resolve = () => { updLobby((l) => { const players = l.players.map((p) => { if (!p.alive) return p; if (!p.pick) return { ...p, result: "no_pick", alive: false }; const r = Math.random(); const result = r < 0.45 ? "win" : r < 0.7 ? "draw" : "loss"; const survived = result === "win"; return { ...p, result, alive: survived, usedTeams: survived ? [...(p.usedTeams || []), p.pick] : p.usedTeams }; }); const alive = players.filter((p) => p.alive); const status = alive.length <= 1 ? "finished" : "roundEnd"; if (alive.length === 1) players.forEach((p) => { if (p.alive) p.points = (p.points || 0) + 1; }); return { ...l, players, status, history: [...(l.history || []), { round: l.round, players: players.map((p) => ({ pseudo: p.pseudo, pick: p.pick, result: p.result })) }] }; }); };
  return <div style={{ flex: 1, overflowY: "auto" }}>
    <div style={{ textAlign: "center", padding: "14px 18px", borderBottom: `1px solid ${st.bd}` }}>
      <div style={{ fontWeight: 700 }}>Journée {lobby.round}</div>
      <div style={{ fontSize: 11, color: st.mu }}>Ligue 1</div>
    </div>
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      {!closed
        ? <div style={{ background: "#1a1100", border: "1.5px solid rgba(255,208,0,.35)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: st.y, letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>⏱ DEADLINE</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: st.y, letterSpacing: 2 }}>{timeLeft}</div>
            <div style={{ fontSize: 12, color: st.mu, marginTop: 4 }}>avant le premier match (15:00)</div>
          </div>
        : <div style={{ background: "#1a0808", border: "1.5px solid rgba(255,68,68,.35)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: st.r }}>SÉLECTIONS FERMÉES</div>
          </div>
      }
      {me && !me.alive && <div style={{ background: "#0d0d1a", border: "1.5px solid rgba(100,100,255,.3)", borderRadius: 12, padding: 16, textAlign: "center", color: "#8888ff", fontWeight: 700 }}>👁 MODE SPECTATEUR</div>}
      {me?.alive && myPick && <div style={{ background: "rgba(57,233,121,.08)", border: "1px solid rgba(57,233,121,.3)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>{getTeam(myPick).logo}</span>
        <div><div style={{ fontWeight: 700 }}>{getTeam(myPick).name}</div><div style={{ fontSize: 12, color: st.g }}>✓ Sélection validée</div></div>
      </div>}
      <div>
        <div style={{ fontSize: 11, color: st.mu, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>CHOISIS TON ÉQUIPE</div>
        <Card>
          {FIXTURES.map((fix) => [{ id: fix.home, time: fix.day }, { id: fix.away, time: "—" }].map(({ id, time }) => {
            const t = getTeam(id); const sel = myPick === id; const used = usedTeams.includes(id);
            return <div key={id} onClick={() => !used && !myPick && !closed && me?.alive && pick(id)} style={{ display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: `1px solid ${st.bd}`, gap: 8, background: sel ? "rgba(57,233,121,.06)" : "transparent", opacity: used ? 0.35 : 1, cursor: used || myPick || closed || !me?.alive ? "default" : "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: sel ? st.g : used ? st.r : "transparent", border: sel || used ? "none" : `2px solid ${st.bd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, color: "#000", fontWeight: 700 }}>{sel && "✓"}{used && "✗"}</div>
              <span style={{ fontSize: 18 }}>{t.logo}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{t.name}</span>
              <span style={{ fontSize: 11, color: st.mu }}>{time}</span>
            </div>;
          }))}
        </Card>
      </div>
      {usedTeams.length > 0 && <div>
        <div style={{ fontSize: 11, color: st.mu, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>ÉQUIPES DÉJÀ UTILISÉES</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{usedTeams.map((tid) => <span key={tid} style={{ background: "#222", border: `1px solid ${st.bd}`, borderRadius: 99, padding: "4px 10px", fontSize: 12, color: st.mu }}>{getTeam(tid).logo} {getTeam(tid).name}</span>)}</div>
      </div>}
      {isHost && !closed && <Btn onClick={() => updLobby((l) => ({ ...l, status: "closed" }))} style={{ background: "transparent", color: st.txt, border: `1.5px solid ${st.bd}` }}>🔒 FERMER LES SÉLECTIONS</Btn>}
      {isHost && closed && <Btn onClick={resolve} style={{ background: st.g, color: "#000" }}>🏁 OBTENIR LES RÉSULTATS</Btn>}
      {me?.alive && !myPick && !closed && <div style={{ background: "#1a1400", border: "1px solid rgba(255,208,0,.25)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#ccaa00" }}>⚠️ Les joueurs sans choix seront éliminés à la fermeture.</div>}
    </div>
  </div>;
}
function ResultsScreen({ lobby, me, isHost, updLobby, showToast }) {
  const alive = lobby.players.filter((p) => p.alive);
  const next = () => { updLobby((l) => ({ ...l, status: "picking", round: l.round + 1, deadline: Date.now() + 3600000, players: l.players.map((p) => ({ ...p, pick: null, result: null })) })); showToast("Journée suivante !"); };
  return <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Résultats — Journée {lobby.round}</div>
    <Card style={{ marginBottom: 12 }}>
      {lobby.players.map((p) => <Row key={p.uid}>
        <Avatar pseudo={p.pseudo} />
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{p.pseudo}</div><div style={{ fontSize: 12, color: st.mu }}>{p.pick ? `${getTeam(p.pick).logo} ${getTeam(p.pick).name}` : "Pas de choix"}</div></div>
        <Badge color={p.result === "win" ? st.g : st.r}>{p.result === "win" ? "✓ GAGNÉ" : "✗ ÉLIMINÉ"}</Badge>
      </Row>)}
    </Card>
    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>💪 {alive.length} joueur{alive.length > 1 ? "s" : ""} encore en lice !</div>
    {isHost ? <Btn onClick={next} style={{ background: st.g, color: "#000" }}>JOURNÉE SUIVANTE →</Btn> : <div style={{ textAlign: "center", color: st.mu }}>En attente de l'admin...</div>}
  </div>;
}
function WinnerScreen({ lobby, me, isHost, updLobby, onLeave }) {
  const winner = lobby.players.find((p) => p.alive) || lobby.players[0];
  const replay = () => updLobby((l) => ({ ...l, status: "waiting", round: 12, history: [], players: l.players.map((p) => ({ ...p, alive: true, pick: null, result: null, usedTeams: [] })) }));
  return <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", gap: 16 }}>
    <div style={{ fontSize: 80 }}>🏆</div>
    <div style={{ fontSize: 14, color: st.mu, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>SAISON TERMINÉE !</div>
    <div style={{ fontSize: 36, fontWeight: 900, color: st.g }}>🏆 {winner?.pseudo} 🏆</div>
    <div style={{ fontSize: 14, color: st.mu }}>est le dernier survivant !</div>
    <div style={{ background: "rgba(57,233,121,.08)", border: "1px solid rgba(57,233,121,.3)", borderRadius: 12, padding: 16, width: "100%" }}><div style={{ fontSize: 28, fontWeight: 900, color: st.g }}>+1 POINT</div></div>
    {isHost && <Btn onClick={replay} style={{ background: st.g, color: "#000" }}>🔁 REJOUER</Btn>}
    <Btn onClick={onLeave} style={{ background: "transparent", color: st.txt, border: `1.5px solid ${st.bd}` }}>← QUITTER</Btn>
  </div>;
}
function ResultatsTab({ lobby }) {
  const alive = lobby.players.filter((p) => p.alive);
  const elim = lobby.players.filter((p) => !p.alive);
  return <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>État de la partie</div>
    {alive.length > 0 && <><div style={{ fontSize: 11, color: st.g, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>SURVIVANTS ({alive.length})</div>
    <Card style={{ marginBottom: 16 }}>{alive.map((p) => <Row key={p.uid}><div style={{ width: 8, height: 8, borderRadius: "50%", background: st.g, boxShadow: `0 0 6px ${st.g}` }} /><Avatar pseudo={p.pseudo} /><span style={{ flex: 1, fontWeight: 600 }}>{p.pseudo}</span></Row>)}</Card></>}
    {elim.length > 0 && <><div style={{ fontSize: 11, color: st.mu, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>ÉLIMINÉS ({elim.length})</div>
    <Card>{elim.map((p) => <Row key={p.uid} style={{ opacity: 0.55 }}><Avatar pseudo={p.pseudo} /><div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{p.pseudo}</div><div style={{ fontSize: 12, color: st.mu }}>{p.pick ? `${getTeam(p.pick).logo} ${getTeam(p.pick).name}` : "Pas de choix"}</div></div><Badge color={st.r}>Éliminé</Badge></Row>)}</Card></>}
  </div>;
}
function ClassementTab({ lobby }) {
  const sorted = [...lobby.players].sort((a, b) => (b.points || 0) - (a.points || 0));
  return <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Classement général</div>
    <div style={{ fontSize: 12, color: st.mu, marginBottom: 16 }}>Toutes saisons confondues</div>
    <Card>{sorted.map((p, i) => <Row key={p.uid}>
      <span style={{ fontSize: 18, fontWeight: 900, width: 28, textAlign: "center", color: i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":st.mu }}>{i+1}</span>
      <Avatar pseudo={p.pseudo} />
      <span style={{ flex: 1, fontWeight: 600 }}>{p.pseudo}</span>
      <span style={{ color: st.g, fontWeight: 700 }}>{p.points || 0} pts</span>
      {i === 0 && <span>👑</span>}
    </Row>)}</Card>
  </div>;
}
function ProfilTab({ user, me, onLogout }) {
  return <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, margin: "0 auto 12px" }}>{user.pseudo[0].toUpperCase()}</div>
      <div style={{ fontSize: 24, fontWeight: 900 }}>{user.pseudo}</div>
      <div style={{ fontSize: 13, color: st.mu, marginTop: 4 }}>{user.email}</div>
    </div>
    <Card style={{ marginBottom: 16 }}>
      <Row><span style={{ flex: 1, fontWeight: 600 }}>Points totaux</span><span style={{ color: st.g, fontWeight: 700 }}>{me?.points || 0} pts</span></Row>
      <Row><span style={{ flex: 1, fontWeight: 600 }}>Statut</span><Badge color={me?.alive ? st.g : st.r}>{me?.alive ? "En vie" : "Éliminé"}</Badge></Row>
      <Row style={{ borderBottom: "none" }}><span style={{ flex: 1, fontWeight: 600 }}>Équipes utilisées</span><span style={{ color: st.mu }}>{me?.usedTeams?.length || 0}</span></Row>
    </Card>
    <Btn onClick={onLogout} style={{ background: "transparent", color: st.txt, border: `1.5px solid ${st.bd}` }}>⏻ SE DÉCONNECTER</Btn>
  </div>;
}

}

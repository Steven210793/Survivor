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
  { id: "tls", name: "Toulouse", logo: "🟣" },
  { id: "mtp", name: "Montpellier", logo: "🔵" },
  { id: "bst", name: "Brest", logo: "🔴" },
  { id: "hac", name: "Le Havre", logo: "🔵" },
  { id: "rcl", name: "Reims", logo: "🔴" },
];
const FIXTURES = [
  { home: "psg", away: "nan", day: "Sam. 15:00" },
  { home: "om", away: "ren", day: "Sam. 17:00" },
  { home: "mon", away: "lil", day: "Sam. 19:00" },
  { home: "nic", away: "rcl", day: "Dim. 13:00" },
  { home: "oly", away: "str", day: "Dim. 15:00" },
];
const getTeam = (id) => L1_TEAMS.find((t) => t.id === id) || { name: "?", logo: "⚽" };
const genCode = () => { const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join(""); };
const S = { get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
export default function App() {
  const [user, setUser] = useState(() => S.get("srv_user"));
  const [lobby, setLobby] = useState(() => S.get("srv_lobby"));
  const [tab, setTab] = useState("accueil");
  const [toast, setToast] = useState(null);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const setU = (u) => { setUser(u); S.set("srv_user", u); };
  const setL = (l) => { setLobby(l); S.set("srv_lobby", l); };
  const updLobby = (fn) => { setLobby((prev) => { const next = fn(prev); const all = S.get("srv_lobbies", {}); if (next) all[next.code] = next; S.set("srv_lobbies", all); S.set("srv_lobby", next); return next; }); };
  const logout = () => { setU(null); setL(null); };
  if (!user) return <AuthScreen onLogin={setU} showToast={showToast} toast={toast} />;
  if (!lobby) return <HomeScreen user={user} onJoin={setL} onLogout={logout} showToast={showToast} toast={toast} />;
  const me = lobby.players.find((p) => p.uid === user.uid);
  const isHost = lobby.host === user.uid;
  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "#0D0D0D", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", color: "#F2F2F2" }}>
      {tab === "accueil" && <AccueilTab lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} showToast={showToast} onLeave={() => setL(null)} />}
      {tab === "resultats" && <ResultatsTab lobby={lobby} />}
      {tab === "classement" && <ClassementTab lobby={lobby} />}
      {tab === "profil" && <ProfilTab user={user} me={me} onLogout={logout} />}
      <nav style={{ display: "flex", background: "#111", borderTop: "1px solid #2E2E2E", flexShrink: 0 }}>
        {[["accueil","🏠","Accueil"],["resultats","📋","Résultats"],["classement","🏆","Classement"],["profil","👤","Profil"]].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "10px 0 12px", background: "transparent", border: "none", color: tab === id ? "#39E979" : "#888", fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>{label}
          </button>
        ))}
      </nav>
      {toast && <div style={{ position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)", background: "#39E979", color: "#000", fontWeight: 700, padding: "10px 22px", borderRadius: 99, fontSize: 14, zIndex: 999 }}>{toast}</div>}
    </div>
  );
}
function AuthScreen({ onLogin, showToast, toast }) {
  const [mode, setMode] = useState("login");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
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
  const inp = { background: "#1A1A1A", border: "1.5px solid #2E2E2E", borderRadius: 12, padding: "14px 16px", color: "#F2F2F2", fontSize: 16, width: "100%", outline: "none", marginBottom: 4 };
  const btn = { width: "100%", padding: "15px 20px", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" };
  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "#0D0D0D", color: "#F2F2F2", fontFamily: "system-ui, sans-serif", overflowY: "auto" }}>
      <div style={{ textAlign: "center", padding: "50px 24px 32px", background: "linear-gradient(180deg,#0a1a0a,#0D0D0D)" }}>
        <div style={{ fontSize: 64 }}>⚽</div>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1 }}>SURVIVOR<br /><span style={{ color: "#39E979" }}>LIGUE 1</span></div>
        <div style={{ fontSize: 14, color: "#888", marginTop: 8 }}>Sois le dernier survivant !</div>
      </div>
      <div style={{ padding: "0 18px 40px" }}>
        <div style={{ display: "flex", marginBottom: 16, background: "#1A1A1A", borderRadius: 12, padding: 4 }}>
          {["login","signup"].map((m) => <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: 10, border: "none", borderRadius: 8, background: mode === m ? "#222" : "transparent", color: mode === m ? "#F2F2F2" : "#888", fontWeight: 700, cursor: "pointer" }}>{m === "login" ? "Connexion" : "Inscription"}</button>)}
        </div>
        {mode === "signup" && <input style={inp} type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Ton pseudo" />}
        <input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input style={{ ...inp, marginBottom: 12 }} type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Mot de passe" />
        {err && <div style={{ background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.3)", borderRadius: 10, padding: "10px 14px", color: "#FF4444", marginBottom: 12 }}>{err}</div>}
        <button style={{ ...btn, background: "#39E979", color: "#000" }} onClick={submit}>{mode === "login" ? "SE CONNECTER" : "CRÉER MON COMPTE"}</button>
      </div>
    </div>
  );
}
function HomeScreen({ user, onJoin, onLogout, showToast, toast }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const create = () => { const c = genCode(); const lobby = { code: c, name: `Ligue de ${user.pseudo}`, host: user.uid, status: "waiting", round: 12, deadline: Date.now() + 7632000, players: [{ uid: user.uid, pseudo: user.pseudo, alive: true, pick: null, result: null, usedTeams: [], points: 0 }], history: [] }; const all = S.get("srv_lobbies", {}); all[c] = lobby; S.set("srv_lobbies", all); onJoin(lobby); };
  const join = () => { setErr(""); const c = code.trim().toUpperCase(); const all = S.get("srv_lobbies", {}); if (!all[c]) return setErr("Code introuvable."); const lob = all[c]; if (!lob.players.find((p) => p.uid === user.uid)) { lob.players.push({ uid: user.uid, pseudo: user.pseudo, alive: true, pick: null, result: null, usedTeams: [], points: 0 }); all[c] = lob; S.set("srv_lobbies", all); } onJoin(lob); };
  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "#0D0D0D", color: "#F2F2F2", fontFamily: "system-ui, sans-serif", overflowY: "auto" }}>
      <div style={{ textAlign: "center", padding: "50px 24px 32px", background: "linear-gradient(180deg,#0a1a0a,#0D0D0D)" }}>
        <div style={{ fontSize: 64 }}>⚽</div>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1 }}>SURVIVOR<br /><span style={{ color: "#39E979" }}>LIGUE 1</span></div>
        <div style={{ fontSize: 14, color: "#888", marginTop: 8 }}>Sois le dernier survivant !</div>
      </div>
      <div style={{ padding: "0 18px 24px" }}>
        <button onClick={create} style={{ width: "100%", padding: 15, background: "#39E979", color: "#000", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>⊕ CRÉER UNE LIGUE</button>
        <div style={{ textAlign: "center", fontSize: 12, color: "#888", marginBottom: 8 }}>Entrer un code</div>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="X X X X X X" maxLength={6} style={{ background: "#1A1A1A", border: "1.5px solid #2E2E2E", borderRadius: 12, padding: "14px 16px", color: "#39E979", fontSize: 24, textAlign: "center", letterSpacing: 8, width: "100%", outline: "none", marginBottom: 8 }} />
        {err && <div style={{ color: "#FF4444", fontSize: 13, marginBottom: 8 }}>{err}</div>}
        <button onClick={join} disabled={code.length < 5} style={{ width: "100%", padding: 15, background: code.length >= 5 ? "#39E979" : "#222", color: code.length >= 5 ? "#000" : "#888", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>REJOINDRE</button>
        <button onClick={onLogout} style={{ width: "100%", padding: 12, background: "transparent", color: "#888", border: "1.5px solid #2E2E2E", borderRadius: 12, fontSize: 14, cursor: "pointer" }}>⏻ Déconnexion</button>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "#39E979", color: "#000", fontWeight: 700, padding: "10px 22px", borderRadius: 99, fontSize: 14, zIndex: 999 }}>{toast}</div>}
    </div>
  );
}
function AccueilTab({ lobby, me, isHost, updLobby, showToast, onLeave }) {
  const { status } = lobby;
  if (status === "finished") return <WinnerScreen lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} onLeave={onLeave} />;
  if (status === "roundEnd") return <ResultsScreen lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} showToast={showToast} />;
  if (status === "picking" || status === "closed") return <PickingScreen lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} showToast={showToast} />;
  return <LobbyWaiting lobby={lobby} me={me} isHost={isHost} updLobby={updLobby} showToast={showToast} onLeave={onLeave} />;
}
function LobbyWaiting({ lobby, me, isHost, updLobby, showToast, onLeave }) {
  const copy = () => { navigator.clipboard?.writeText(lobby.code).catch(() => {}); showToast("Code copié !"); };
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #2E2E2E" }}>
        <button onClick={onLeave} style={{ background: "none", border: "none", color: "#F2F2F2", fontSize: 22, cursor: "pointer", marginRight: 8 }}>←</button>
        <div style={{ flex: 1, textAlign: "center", fontWeight: 700 }}>{lobby.name}</div>
        <div style={{ width: 30 }} />
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: 1 }}>CODE DE LA LIGUE</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1A1A", border: "1px solid #2E2E2E", borderRadius: 12, padding: "14px 20px", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: 8, color: "#39E979" }}>{lobby.code}</span>
          <button onClick={copy} style={{ background: "#222", border: "1px solid #2E2E2E", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 }}>📋</button>
        </div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>JOUEURS ({lobby.players.length})</div>
        <div style={{ background: "#1A1A1A", border: "1px solid #2E2E2E", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
          {lobby.players.map((p) => (
            <div key={p.uid} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2E2E2E", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{p.pseudo[0].toUpperCase()}</div>
              <span style={{ flex: 1, fontWeight: 600 }}>{p.pseudo} {p.uid === lobby.host && <span style={{ fontSize: 11, color: "#888" }}>Admin</span>}</span>
              <span style={{ color: "#39E979", fontWeight: 700 }}>{p.points} pts</span>
              <span style={{ background: "rgba(57,233,121,.12)", color: "#39E979", border: "1px solid rgba(57,233,121,.25)", borderRadius: 99, padding: "3px 9px", fontSize: 12, fontWeight: 700 }}>Prêt</span>
            </div>
          ))}
        </div>
        {isHost
          ? <button onClick={() => updLobby((l) => ({ ...l, status: "picking", deadline: Date.now() + 7632000 }))} style={{ width: "100%", padding: 15, background: "#39E979", color: "#000", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>LANCER LA PARTIE</button>
          : <div style={{ textAlign: "center", color: "#888", padding: 16 }}>En attente que l'admin lance la partie...</div>
        }
      </div>
    </div>
  );
}
function PickingScreen({ lobby, me, isHost, updLobby, showToast }) {
  const closed = lobby.status === "closed";
  const myPick = me?.pick;
  const usedTeams = me?.usedTeams || [];
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => { const iv = setInterval(() => { const d = Math.max(0, (lobby.deadline || 0) - Date.now()); const h = Math.floor(d/3600000); const m = Math.floor((d%3600000)/60000); const s = Math.floor((d%60000)/1000); setTimeLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`); }, 1000); return () => clearInterval(iv); }, [lobby.deadline]);
  const pick = (id) => { if (closed || myPick || usedTeams.includes(id) || !me?.alive) return; updLobby((l) => ({ ...l, players: l.players.map((p) => p.uid === me.uid ? { ...p, pick: id } : p) })); showToast(`${getTeam(id).name} sélectionné ✓`); };
  const resolve = () => { updLobby((l) => { const players = l.players.map((p) => { if (!p.alive) return p; if (!p.pick) return { ...p, result: "no_pick", alive: false }; const r = Math.random(); const result = r < 0.45 ? "win" : r < 0.7 ? "draw" : "loss"; const survived = result === "win"; return { ...p, result, alive: survived, usedTeams: survived ? [...(p.usedTeams||[]), p.pick] : p.usedTeams }; }); const alive = players.filter((p) => p.alive); const status = alive.length <= 1 ? "finished" : "roundEnd"; if (alive.length === 1) players.forEach((p) => { if (p.alive) p.points = (p.points||0)+1; }); return { ...l, players, status, history: [...(l.history||[]), { round: l.round, players: players.map((p) => ({ pseudo: p.pseudo, pick: p.pick, result: p.result })) }] }; }); };
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ textAlign: "center", padding: "14px 18px", borderBottom: "1px solid #2E2E2E" }}>
        <div style={{ fontWeight: 700 }}>Journée {lobby.round}</div>
        <div style={{ fontSize: 11, color: "#888" }}>Ligue 1</div>
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        {!closed ? (
          <div style={{ background: "#1a1100", border: "1.5px solid rgba(255,208,0,.35)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#FFD000", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>⏱ DEADLINE</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#FFD000", letterSpacing: 2 }}>{timeLeft}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>avant le premier match (15:00)</div>
          </div>
        ) : (
          <div style={{ background: "#1a0808", border: "1.5px solid rgba(255,68,68,.35)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#FF4444" }}>SÉLECTIONS FERMÉES</div>
          </div>
        )}
        {me && !me.alive && <div style={{ background: "#0d0d1a", border: "1.5px solid rgba(100,100,255,.3)", borderRadius: 12, padding: 16, textAlign: "center", color: "#8888ff", fontWeight: 700 }}>👁 MODE SPECTATEUR — Tu peux suivre la partie !</div>}
        {me?.alive && myPick && <div style={{ background: "rgba(57,233,121,.08)", border: "1px solid rgba(57,233,121,.3)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 24 }}>{getTeam(myPick).logo}</span><div><div style={{ fontWeight: 700 }}>{getTeam(myPick).name}</div><div style={{ fontSize: 12, color: "#39E979" }}>✓ Sélection validée</div></div></div>}
        <div>
          <div style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>CHOISIS TON ÉQUIPE</div>
          <div style={{ background: "#1A1A1A", border: "1px solid #2E2E2E", borderRadius: 12, overflow: "hidden" }}>
            {FIXTURES.map((fix, i) => [{ id: fix.home, time: fix.day }, { id: fix.away, time: "—" }].map(({ id, time }) => {
              const t = getTeam(id); const sel = myPick === id; const used = usedTeams.includes(id);
              return <div key={id} onClick={() => !used && !myPick && !closed && me?.alive && pick(id)} style={{ display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: "1px solid #2E2E2E", gap: 8, background: sel ? "rgba(57,233,121,.06)" : "transparent", opacity: used ? 0.35 : 1, cursor: used || myPick || closed || !me?.alive ? "default" : "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: sel ? "#39E979" : used ? "#FF4444" : "transparent", border: sel || used ? "none" : "2px solid #2E2E2E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && "✓"}{used && "✗"}</div>
                <span style={{ fontSize: 18 }}>{t.logo}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{t.name}</span>
                <span style={{ fontSize: 11, color: "#888" }}>{time}</span>
              </div>;
            }))}
          </div>
        </div>
        {usedTeams.length > 0 && <div><div style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>ÉQUIPES DÉJÀ UTILISÉES</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{usedTeams.map((tid) => <span key={tid} style={{ background: "#222", border: "1px solid #2E2E2E", borderRadius: 99, padding: "4px 10px", fontSize: 12, color: "#888" }}>{getTeam(tid).logo} {getTeam(tid).name}</span>)}</div></div>}
        {isHost && !closed && <button onClick={() => updLobby((l) => ({ ...l, status: "closed" }))} style={{ width: "100%", padding: 14, background: "transparent", color: "#F2F2F2", border: "1.5px solid #2E2E2E", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🔒 FERMER LES SÉLECTIONS</button>}
        {isHost && closed && <button onClick

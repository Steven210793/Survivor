import React, { useState, useEffect } from "react";

var TEAMS = [
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

var FIXTURES = [
  { home: "psg", away: "nan", day: "Sam. 15:00" },
  { home: "om", away: "ren", day: "Sam. 17:00" },
  { home: "mon", away: "lil", day: "Sam. 19:00" },
  { home: "nic", away: "str", day: "Dim. 13:00" },
  { home: "oly", away: "len", day: "Dim. 15:00" },
];

function getTeam(id) {
  return TEAMS.find(function(t) { return t.id === id; }) || { name: "?", logo: "⚽" };
}

function genCode() {
  var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var r = "";
  for (var i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}

function sGet(k) {
  try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch(e) { return null; }
}

function sSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
}

export default function App() {
  var u = useState(function() { return sGet("u"); });
  var user = u[0]; var setUser = u[1];
  var lb = useState(function() { return sGet("lb"); });
  var lobby = lb[0]; var setLobby = lb[1];
  var tb = useState("accueil");
  var tab = tb[0]; var setTab = tb[1];
  var ts = useState(null);
  var toast = ts[0]; var setToast = ts[1];

  function showToast(m) { setToast(m); setTimeout(function() { setToast(null); }, 2500); }

  function setU(x) { setUser(x); sSet("u", x); }
  function setL(x) { setLobby(x); sSet("lb", x); }

  function updLobby(fn) {
    setLobby(function(prev) {
      var next = fn(prev);
      var all = sGet("lobbies") || {};
      if (next) all[next.code] = next;
      sSet("lobbies", all);
      sSet("lb", next);
      return next;
    });
  }

  function logout() { setU(null); setL(null); }

  var app = { maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "#0D0D0D", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", color: "#F2F2F2" };

  var toastEl = toast ? React.createElement("div", { style: { position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "#39E979", color: "#000", fontWeight: 700, padding: "10px 22px", borderRadius: 99, fontSize: 14, zIndex: 999, whiteSpace: "nowrap" } }, toast) : null;

  if (!user) return React.createElement("div", { style: app }, React.createElement(AuthScreen, { onLogin: setU }), toastEl);
  if (!lobby) return React.createElement("div", { style: app }, React.createElement(HomeScreen, { user: user, onJoin: setL, onLogout: logout, showToast: showToast }), toastEl);

  var me = lobby.players.find(function(p) { return p.uid === user.uid; });
  var isHost = lobby.host === user.uid;

  var nav = React.createElement("nav", { style: { display: "flex", background: "#111", borderTop: "1px solid #2E2E2E", flexShrink: 0 } },
    [["accueil","🏠","Accueil"],["resultats","📋","Résultats"],["classement","🏆","Classement"],["profil","👤","Profil"]].map(function(t) {
      return React.createElement("button", { key: t[0], onClick: function() { setTab(t[0]); }, style: { flex: 1, padding: "10px 0 12px", background: "transparent", border: "none", color: tab === t[0] ? "#39E979" : "#888", fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 } },
        React.createElement("span", { style: { fontSize: 20 } }, t[1]), t[2]);
    })
  );

  var content = null;
  if (tab === "accueil") content = React.createElement(AccueilTab, { lobby: lobby, me: me, isHost: isHost, updLobby: updLobby, showToast: showToast, onLeave: function() { setL(null); } });
  if (tab === "resultats") content = React.createElement(ResultatsTab, { lobby: lobby });
  if (tab === "classement") content = React.createElement(ClassementTab, { lobby: lobby });
  if (tab === "profil") content = React.createElement(ProfilTab, { user: user, me: me, onLogout: logout });

  return React.createElement("div", { style: app }, content, nav, toastEl);
}

function AuthScreen(props) {
  var ms = useState("login"); var mode = ms[0]; var setMode = ms[1];
  var ps = useState(""); var pseudo = ps[0]; var setPseudo = ps[1];
  var es = useState(""); var email = es[0]; var setEmail = es[1];
  var pws = useState(""); var pwd = pws[0]; var setPwd = pws[1];
  var ers = useState(""); var err = ers[0]; var setErr = ers[1];

  function submit() {
    setErr("");
    if (!email || !pwd) { setErr("Remplis tous les champs."); return; }
    var users = sGet("users") || [];
    if (mode === "signup") {
      if (!pseudo) { setErr("Choisis un pseudo."); return; }
      if (users.find(function(u) { return u.email === email; })) { setErr("Email déjà utilisé."); return; }
      var nu = { uid: genCode(), pseudo: pseudo, email: email, pwd: pwd, points: 0 };
      sSet("users", users.concat([nu]));
      props.onLogin(nu);
    } else {
      var found = users.find(function(u) { return u.email === email && u.pwd === pwd; });
      if (!found) { setErr("Email ou mot de passe incorrect."); return; }
      props.onLogin(found);
    }
  }

  var inp = { background: "#1A1A1A", border: "1.5px solid #2E2E2E", borderRadius: 12, padding: "14px 16px", color: "#F2F2F2", fontSize: 16, width: "100%", outline: "none", marginBottom: 8, boxSizing: "border-box" };

  return React.createElement("div", { style: { flex: 1, overflowY: "auto" } },
    React.createElement("div", { style: { textAlign: "center", padding: "50px 24px 32px", background: "linear-gradient(180deg,#0a1a0a,#0D0D0D)" } },
      React.createElement("div", { style: { fontSize: 64 } }, "⚽"),
      React.createElement("div", { style: { fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1 } }, "SURVIVOR"),
      React.createElement("div", { style: { fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1, color: "#39E979" } }, "LIGUE 1"),
      React.createElement("div", { style: { fontSize: 14, color: "#888", marginTop: 8 } }, "Sois le dernier survivant !")
    ),
    React.createElement("div", { style: { padding: "0 18px 40px" } },
      React.createElement("div", { style: { display: "flex", marginBottom: 16, background: "#1A1A1A", borderRadius: 12, padding: 4 } },
        React.createElement("button", { onClick: function() { setMode("login"); }, style: { flex: 1, padding: 10, border: "none", borderRadius: 8, background: mode === "login" ? "#222" : "transparent", color: mode === "login" ? "#F2F2F2" : "#888", fontWeight: 700, cursor: "pointer" } }, "Connexion"),
        React.createElement("button", { onClick: function() { setMode("signup"); }, style: { flex: 1, padding: 10, border: "none", borderRadius: 8, background: mode === "signup" ? "#222" : "transparent", color: mode === "signup" ? "#F2F2F2" : "#888", fontWeight: 700, cursor: "pointer" } }, "Inscription")
      ),
      mode === "signup" ? React.createElement("input", { style: inp, type: "text", value: pseudo, onChange: function(e) { setPseudo(e.target.value); }, placeholder: "Ton pseudo" }) : null,
      React.createElement("input", { style: inp, type: "email", value: email, onChange: function(e) { setEmail(e.target.value); }, placeholder: "Email" }),
      React.createElement("input", { style: Object.assign({}, inp, { marginBottom: 12 }), type: "password", value: pwd, onChange: function(e) { setPwd(e.target.value); }, placeholder: "Mot de passe" }),
      err ? React.createElement("div", { style: { background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#FF4444", marginBottom: 12 } }, err) : null,
      React.createElement("button", { onClick: submit, style: { width: "100%", padding: "14px 20px", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: "#39E979", color: "#000" } }, mode === "login" ? "SE CONNECTER" : "CRÉER MON COMPTE")
    )
  );
}

function HomeScreen(props) {
  var cs = useState(""); var code = cs[0]; var setCode = cs[1];
  var es = useState(""); var err = es[0]; var setErr = es[1];

  function create() {
    var c = genCode();
    var lobby = { code: c, name: "Ligue de " + props.user.pseudo, host: props.user.uid, status: "waiting", round: 12, deadline: Date.now() + 7632000, players: [{ uid: props.user.uid, pseudo: props.user.pseudo, alive: true, pick: null, result: null, usedTeams: [], points: 0 }], history: [] };
    var all = sGet("lobbies") || {};
    all[c] = lobby; sSet("lobbies", all); props.onJoin(lobby);
  }

  function join() {
    setErr("");
    var c = code.trim().toUpperCase();
    var all = sGet("lobbies") || {};
    if (!all[c]) { setErr("Code introuvable."); return; }
    var lob = all[c];
    if (!lob.players.find(function(p) { return p.uid === props.user.uid; })) {
      lob.players.push({ uid: props.user.uid, pseudo: props.user.pseudo, alive: true, pick: null, result: null, usedTeams: [], points: 0 });
      all[c] = lob; sSet("lobbies", all);
    }
    props.onJoin(lob);
  }

  return React.createElement("div", { style: { flex: 1, overflowY: "auto" } },
    React.createElement("div", { style: { textAlign: "center", padding: "50px 24px 32px", background: "linear-gradient(180deg,#0a1a0a,#0D0D0D)" } },
      React.createElement("div", { style: { fontSize: 64 } }, "⚽"),
      React.createElement("div", { style: { fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1 } }, "SURVIVOR"),
      React.createElement("div", { style: { fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1, color: "#39E979" } }, "LIGUE 1"),
      React.createElement("div", { style: { fontSize: 14, color: "#888", marginTop: 8 } }, "Sois le dernier survivant !")
    ),
    React.createElement("div", { style: { padding: "0 18px 24px" } },
      React.createElement("button", { onClick: create, style: { width: "100%", padding: "14px 20px", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: "#39E979", color: "#000", marginBottom: 12 } }, "⊕ CRÉER UNE LIGUE"),
      React.createElement("div", { style: { textAlign: "center", fontSize: 12, color: "#888", marginBottom: 8 } }, "Entrer un code"),
      React.createElement("input", { type: "text", value: code, onChange: function(e) { setCode(e.target.value.toUpperCase()); }, placeholder: "X X X X X X", maxLength: 6, style: { background: "#1A1A1A", border: "1.5px solid #2E2E2E", borderRadius: 12, padding: "14px 16px", color: "#39E979", fontSize: 24, textAlign: "center", letterSpacing: 8, width: "100%", outline: "none", marginBottom: 8, boxSizing: "border-box" } }),
      err ? React.createElement("div", { style: { color: "#FF4444", fontSize: 13, marginBottom: 8 } }, err) : null,
      React.createElement("button", { onClick: join, disabled: code.length < 5, style: { width: "100%", padding: "14px 20px", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: code.length >= 5 ? "pointer" : "not-allowed", background: code.length >= 5 ? "#39E979" : "#222", color: code.length >= 5 ? "#000" : "#888", marginBottom: 12 } }, "REJOINDRE"),
      React.createElement("button", { onClick: props.onLogout, style: { width: "100%", padding: "12px 20px", border: "1.5px solid #2E2E2E", borderRadius: 12, fontSize: 14, cursor: "pointer", background: "transparent", color: "#888" } }, "⏻ Déconnexion")
    )
  );
}

function AccueilTab(props) {
  var s = props.lobby.status;
  if (s === "finished") return React.createElement(WinnerScreen, props);
  if (s === "roundEnd") return React.createElement(ResultsScreen, props);
  if (s === "picking" || s === "closed") return React.createElement(PickingScreen, props);
  return React.createElement(LobbyWaiting, props);
}

function LobbyWaiting(props) {
  var lobby = props.lobby;
  function copy() { if (navigator.clipboard) navigator.clipboard.writeText(lobby.code); props.showToast("Code copié !"); }
  function start() { props.updLobby(function(l) { return Object.assign({}, l, { status: "picking", deadline: Date.now() + 7632000 }); }); }

  return React.createElement("div", { style: { flex: 1, overflowY: "auto" } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #2E2E2E" } },
      React.createElement("button", { onClick: props.onLeave, style: { background: "none", border: "none", color: "#F2F2F2", fontSize: 22, cursor: "pointer", marginRight: 8 } }, "←"),
      React.createElement("div", { style: { flex: 1, textAlign: "center", fontWeight: 700 } }, lobby.name)
    ),
    React.createElement("div", { style: { padding: 18 } },
      React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 6 } }, "CODE DE LA LIGUE"),
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1A1A", border: "1px solid #2E2E2E", borderRadius: 12, padding: "14px 20px", gap: 12, marginBottom: 16 } },
        React.createElement("span", { style: { fontSize: 32, fontWeight: 900, letterSpacing: 8, color: "#39E979" } }, lobby.code),
        React.createElement("button", { onClick: copy, style: { background: "#222", border: "1px solid #2E2E2E", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 } }, "📋")
      ),
      React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 8, fontWeight: 700 } }, "JOUEURS (" + lobby.players.length + ")"),
      React.createElement("div", { style: { background: "#1A1A1A", border: "1px solid #2E2E2E", borderRadius: 12, marginBottom: 16, overflow: "hidden" } },
        lobby.players.map(function(p) {
          return React.createElement("div", { key: p.uid, style: { display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2E2E2E", gap: 10 } },
            React.createElement("div", { style: { width: 34, height: 34, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 } }, p.pseudo[0].toUpperCase()),
            React.createElement("span", { style: { flex: 1, fontWeight: 600 } }, p.pseudo),
            React.createElement("span", { style: { color: "#39E979", fontWeight: 700 } }, p.points + " pts"),
            React.createElement("span", { style: { background: "rgba(57,233,121,0.12)", color: "#39E979", borderRadius: 99, padding: "3px 9px", fontSize: 12, fontWeight: 700 } }, "Prêt")
          );
        })
      ),
      props.isHost
        ? React.createElement("button", { onClick: start, style: { width: "100%", padding: "14px 20px", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", background: "#39E979", color: "#000" } }, "LANCER LA PARTIE")
        : React.createElement("div", { style: { textAlign: "center", color: "#888", padding: 16 } }, "En attente que l'admin lance la partie...")
    )
  );
}

function PickingScreen(props) {
  var lobby = props.lobby; var me = props.me;
  var closed = lobby.status === "closed";
  var myPick = me ? me.pick : null;
  var usedTeams = me ? (me.usedTeams || []) : [];
  var ts = useState("00:00:00"); var timeLeft = ts[0]; var setTimeLeft = ts[1];

  useEffect(function() {
    var iv = setInterval(function() {
      var d = Math.max(0, (lobby.deadline || 0) - Date.now());
      var h = Math.floor(d / 3600000);
      var m = Math.floor((d % 3600000) / 60000);
      var s = Math.floor((d % 60000) / 1000);
      setTimeLeft((h < 10 ? "0" + h : "" + h) + ":" + (m < 10 ? "0" + m : "" + m) + ":" + (s < 10 ? "0" + s : "" + s));
    }, 1000);
    return function() { clearInterval(iv); };
  }, [lobby.deadline]);

  function pick(id) {
    if (closed || myPick || usedTeams.indexOf(id) >= 0 || !me || !me.alive) return;
    props.updLobby(function(l) { return Object.assign({}, l, { players: l.players.map(function(p) { return p.uid === me.uid ? Object.assign({}, p, { pick: id }) : p; }) }); });
    props.showToast(getTeam(id).name + " sélectionné ✓");
  }

  function resolve() {
    props.updLobby(function(l) {
      var players = l.players.map(function(p) {
        if (!p.alive) return p;
        if (!p.pick) return Object.assign({}, p, { result: "no_pick", alive: false });
        var r = Math.random();
        var result = r < 0.45 ? "win" : r < 0.7 ? "draw" : "loss";
        var survived = result === "win";
        return Object.assign({}, p, { result: result, alive: survived, usedTeams: survived ? (p.usedTeams || []).concat([p.pick]) : p.usedTeams });
      });
      var alive = players.filter(function(p) { return p.alive; });
      var newStatus = alive.length <= 1 ? "finished" : "roundEnd";
      if (alive.length === 1) players = players.map(function(p) { return p.alive ? Object.assign({}, p, { points: (p.points || 0) + 1 }) : p; });
      return Object.assign({}, l, { players: players, status: newStatus, history: (l.history || []).concat([{ round: l.round }]) });
    });
  }

  return React.createElement("div", { style: { flex: 1, overflowY: "auto" } },
    React.createElement("div", { style: { textAlign: "center", padding: "14px 18px", borderBottom: "1px solid #2E2E2E" } },
      React.createElement("div", { style: { fontWeight: 700 } }, "Journée " + lobby.round),
      React.createElement("div", { style: { fontSize: 11, color: "#888" } }, "Ligue 1")
    ),
    React.createElement("div", { style: { padding: 18, display: "flex", flexDirection: "column", gap: 12 } },
      !closed
        ? React.createElement("div", { style: { background: "#1a1100", border: "1.5px solid rgba(255,208,0,0.35)", borderRadius: 12, padding: "14px 16px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: 11, color: "#FFD000", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 } }, "⏱ DEADLINE"),
            React.createElement("div", { style: { fontSize: 42, fontWeight: 900, color: "#FFD000", letterSpacing: 2 } }, timeLeft),
            React.createElement("div", { style: { fontSize: 12, color: "#888", marginTop: 4 } }, "avant le premier match (15:00)")
          )
        : React.createElement("div", { style: { background: "#1a0808", border: "1.5px solid rgba(255,68,68,0.35)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 } },
            React.createElement("span", { style: { fontSize: 22 } }, "🔒"),
            React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#FF4444" } }, "SÉLECTIONS FERMÉES")
          ),
      me && !me.alive ? React.createElement("div", { style: { background: "#0d0d1a", border: "1.5px solid rgba(100,100,255,0.3)", borderRadius: 12, padding: 16, textAlign: "center", color: "#8888ff", fontWeight: 700 } }, "👁 MODE SPECTATEUR") : null,
      me && me.alive && myPick ? React.createElement("div", { style: { background: "rgba(57,233,121,0.08)", border: "1px solid rgba(57,233,121,0.3)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 } },
        React.createElement("span", { style: { fontSize: 24 } }, getTeam(myPick).logo),
        React.createElement("div", null,
          React.createElement("div", { style: { fontWeight: 700 } }, getTeam(myPick).name),
          React.createElement("div", { style: { fontSize: 12, color: "#39E979" } }, "✓ Sélection validée")
        )
      ) : null,
      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 } }, "CHOISIS TON ÉQUIPE"),
        React.createElement("div", { style: { background: "#1A1A1A", border: "1px solid #2E2E2E", borderRadius: 12, overflow: "hidden" } },
          FIXTURES.map(function(fix) {

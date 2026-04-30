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
  var result = "";
  for (var i = 0; i < 6; i++) {
    result += c[Math.floor(Math.random() * c.length)];
  }
  return result;
}

function sGet(k) {
  try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch(e) { return null; }
}

function sSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
}

var BG = "#0D0D0D";
var S1 = "#1A1A1A";
var BD = "#2E2E2E";
var GR = "#39E979";
var RD = "#FF4444";
var YL = "#FFD000";
var TX = "#F2F2F2";
var MU = "#888888";

function GreenBtn(props) {
  return React.createElement("button", {
    onClick: props.onClick,
    disabled: props.disabled,
    style: {
      width: "100%", padding: "14px 20px", border: "none",
      borderRadius: 12, fontSize: 16, fontWeight: 700,
      cursor: props.disabled ? "not-allowed" : "pointer",
      opacity: props.disabled ? 0.4 : 1,
      background: props.outline ? "transparent" : GR,
      color: props.outline ? TX : "#000",
      borderWidth: props.outline ? 1.5 : 0,
      borderStyle: props.outline ? "solid" : "none",
      borderColor: props.outline ? BD : "none",
      marginBottom: props.mb || 0
    }
  }, props.children);
}

function Hero() {
  return React.createElement("div", {
    style: {
      textAlign: "center", padding: "50px 24px 32px",
      background: "linear-gradient(180deg,#0a1a0a,#0D0D0D)"
    }
  },
    React.createElement("div", { style: { fontSize: 64 } }, "⚽"),
    React.createElement("div", {
      style: { fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1, color: TX }
    }, "SURVIVOR"),
    React.createElement("div", {
      style: { fontSize: 48, fontWeight: 900, letterSpacing: 3, lineHeight: 1, color: GR }
    }, "LIGUE 1"),
    React.createElement("div", { style: { fontSize: 14, color: MU, marginTop: 8 } }, "Sois le dernier survivant !")
  );
}

export default function App() {
  var userState = useState(function() { return sGet("srv_user"); });
  var user = userState[0]; var setUser = userState[1];
  var lobbyState = useState(function() { return sGet("srv_lobby"); });
  var lobby = lobbyState[0]; var setLobby = lobbyState[1];
  var tabState = useState("accueil");
  var tab = tabState[0]; var setTab = tabState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];

  function showToast(m) { setToast(m); setTimeout(function() { setToast(null); }, 2500); }
  function setU(u) { setUser(u); sSet("srv_user", u); }
  function setL(l) { setLobby(l); sSet("srv_lobby", l); }
  function updLobby(fn) {
    setLobby(function(prev) {
      var next = fn(prev);
      var all = sGet("srv_lobbies") || {};
      if (next) all[next.code] = next;
      sSet("srv_lobbies", all);
      sSet("srv_lobby", next);
      return next;
    });
  }
  function logout() { setU(null); setL(null); sSet("srv_user", null); sSet("srv_lobby", null); }

  var appStyle = {
    maxWidth: 390, margin: "0 auto", minHeight: "100vh",
    background: BG, display: "flex", flexDirection: "column",
    fontFamily: "system-ui,sans-serif", color: TX
  };

  var toastEl = toast ? React.createElement("div", {
    style: {
      position: "fixed", bottom: 80, left: "50%",
      transform: "translateX(-50%)", background: GR,
      color: "#000", fontWeight: 700, padding: "10px 22px",
      borderRadius: 99, fontSize: 14, zIndex: 999
    }
  }, toast) : null;

  if (!user) {
    return React.createElement("div", { style: appStyle },
      React.createElement(AuthScreen, { onLogin: setU, showToast: showToast }),
      toastEl
    );
  }

  if (!lobby) {
    return React.createElement("div", { style: appStyle },
      React.createElement(HomeScreen, { user: user, onJoin: setL, onLogout: logout, showToast: showToast }),
      toastEl
    );
  }

  var me = lobby.players.find(function(p) { return p.uid === user.uid; });
  var isHost = lobby.host === user.uid;

  var tabs = [
    { id: "accueil", icon: "🏠", label: "Accueil" },
    { id: "resultats", icon: "📋", label: "Résultats" },
    { id: "classement", icon: "🏆", label: "Classement" },
    { id: "profil", icon: "👤", label: "Profil" },
  ];

  var navEl = React.createElement("nav", {
    style: { display: "flex", background: "#111", borderTop: "1px solid " + BD, flexShrink: 0 }
  }, tabs.map(function(t) {
    return React.createElement("button", {
      key: t.id, onClick: function() { setTab(t.id); },
      style: {
        flex: 1, padding: "10px 0 12px", background: "transparent",
        border: "none", color: tab === t.id ? GR : MU,
        fontSize: 10, fontWeight: 600, cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3
      }
    },
      React.createElement("span", { style: { fontSize: 20 } }, t.icon),
      t.label
    );
  }));

  var content = null;
  if (tab === "accueil") content = React.createElement(AccueilTab, { lobby: lobby, me: me, isHost: isHost, updLobby: updLobby, showToast: showToast, onLeave: function() { setL(null); } });
  if (tab === "resultats") content = React.createElement(ResultatsTab, { lobby: lobby });
  if (tab === "classement") content = React.createElement(ClassementTab, { lobby: lobby });
  if (tab === "profil") content = React.createElement(ProfilTab, { user: user, me: me, onLogout: logout });

  return React.createElement("div", { style: appStyle }, content, navEl, toastEl);
}

function AuthScreen(props) {
  var modeState = useState("login"); var mode = modeState[0]; var setMode = modeState[1];
  var pseudoState = useState(""); var pseudo = pseudoState[0]; var setPseudo = pseudoState[1];
  var emailState = useState(""); var email = emailState[0]; var setEmail = emailState[1];
  var pwdState = useState(""); var pwd = pwdState[0]; var setPwd = pwdState[1];
  var errState = useState(""); var err = errState[0]; var setErr = errState[1];

  var inp = {
    background: S1, border: "1.5px solid " + BD, borderRadius: 12,
    padding: "14px 16px", color: TX, fontSize: 16,
    width: "100%", outline: "none", marginBottom: 8, boxSizing: "border-box"
  };

  function submit() {
    setErr("");
    if (!email || !pwd) { setErr("Remplis tous les champs."); return; }
    var users = sGet("srv_users") || [];
    if (mode === "signup") {
      if (!pseudo) { setErr("Choisis un pseudo."); return; }
      if (users.find(function(u) { return u.email === email; })) { setErr("Email déjà utilisé."); return; }
      var u = { uid: genCode(), pseudo: pseudo, email: email, pwd: pwd, points: 0 };
      sSet("srv_users", users.concat([u]));
      props.onLogin(u);
    } else {
      var found = users.find(function(u) { return u.email === email && u.pwd === pwd; });
      if (!found) { setErr("Email ou mot de passe incorrect."); return; }
      props.onLogin(found);
    }
  }

  return React.createElement("div", { style: { overflowY: "auto", flex: 1 } },
    React.createElement(Hero, null),
    React.createElement("div", { style: { padding: "0 18px 40px" } },
      React.createElement("div", { style: { display: "flex", marginBottom: 16, background: S1, borderRadius: 12, padding: 4 } },
        React.createElement("button", { onClick: function() { setMode("login"); }, style: { flex: 1, padding: 10, border: "none", borderRadius: 8, background: mode === "login" ? "#222" : "transparent", color: mode === "login" ? TX : MU, fontWeight: 700, cursor: "pointer" } }, "Connexion"),
        React.createElement("button", { onClick: function() { setMode("signup"); }, style: { flex: 1, padding: 10, border: "none", borderRadius: 8, background: mode === "signup" ? "#222" : "transparent", color: mode === "signup" ? TX : MU, fontWeight: 700, cursor: "pointer" } }, "Inscription")
      ),
      mode === "signup" ? React.createElement("input", { style: inp, type: "text", value: pseudo, onChange: function(e) { setPseudo(e.target.value); }, placeholder: "Ton pseudo" }) : null,
      React.createElement("input", { style: inp, type: "email", value: email, onChange: function(e) { setEmail(e.target.value); }, placeholder: "Email" }),
      React.createElement("input", { style: Object.assign({}, inp, { marginBottom: 12 }), type: "password", value: pwd, onChange: function(e) { setPwd(e.target.value); }, placeholder: "Mot de passe" }),
      err ? React.createElement("div", { style: { background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: RD, marginBottom: 12 } }, err) : null,
      React.createElement(GreenBtn, { onClick: submit }, mode === "login" ? "SE CONNECTER" : "CRÉER MON COMPTE")
    )function HomeScreen(props) {
  var codeState = useState(""); var code = codeState[0]; var setCode = codeState[1];
  var errState = useState(""); var err = errState[0]; var setErr = errState[1];

  function create() {
    var c = genCode();
    var lobby = {
      code: c, name: "Ligue de " + props.user.pseudo, host: props.user.uid,
      status: "waiting", round: 12, deadline: Date.now() + 7632000,
      players: [{ uid: props.user.uid, pseudo: props.user.pseudo, alive: true, pick: null, result: null, usedTeams: [], points: 0 }],
      history: []
    };
    var all = sGet("srv_lobbies") || {};
    all[c] = lobby; sSet("srv_lobbies", all); props.onJoin(lobby);
  }

  function join() {
    setErr("");
    var c = code.trim().toUpperCase();
    var all = sGet("srv_lobbies") || {};
    if (!all[c]) { setErr("Code introuvable."); return; }
    var lob = all[c];
    if (!lob.players.find(function(p) { return p.uid === props.user.uid; })) {
      lob.players.push({ uid: props.user.uid, pseudo: props.user.pseudo, alive: true, pick: null, result: null, usedTeams: [], points: 0 });
      all[c] = lob; sSet("srv_lobbies", all);
    }
    props.onJoin(lob);
  }

  return React.createElement("div", { style: { overflowY: "auto", flex: 1 } },
    React.createElement(Hero, null),
    React.createElement("div", { style: { padding: "0 18px 24px" } },
      React.createElement(GreenBtn, { onClick: create, mb: 12 }, "⊕ CRÉER UNE LIGUE"),
      React.createElement("div", { style: { textAlign: "center", fontSize: 12, color: MU, marginBottom: 8 } }, "Entrer un code"),
      React.createElement("input", {
        type: "text", value: code,
        onChange: function(e) { setCode(e.target.value.toUpperCase()); },
        placeholder: "X X X X X X", maxLength: 6,
        style: { background: S1, border: "1.5px solid " + BD, borderRadius: 12, padding: "14px 16px", color: GR, fontSize: 24, textAlign: "center", letterSpacing: 8, width: "100%", outline: "none", marginBottom: 8, boxSizing: "border-box" }
      }),
      err ? React.createElement("div", { style: { color: RD, fontSize: 13, marginBottom: 8 } }, err) : null,
      React.createElement(GreenBtn, { onClick: join, disabled: code.length < 5, mb: 12 }, "REJOINDRE"),
      React.createElement(GreenBtn, { onClick: props.onLogout, outline: true }, "⏻ Déconnexion")
    )
  );
}

function AccueilTab(props) {
  var status = props.lobby.status;
  if (status === "finished") return React.createElement(WinnerScreen, props);
  if (status === "roundEnd") return React.createElement(ResultsScreen, props);
  if (status === "picking" || status === "closed") return React.createElement(PickingScreen, props);
  return React.createElement(LobbyWaiting, props);
}

function LobbyWaiting(props) {
  var lobby = props.lobby;

  function copy() {
    if (navigator.clipboard) navigator.clipboard.writeText(lobby.code);
    props.showToast("Code copié !");
  }

  function start() {
    props.updLobby(function(l) { return Object.assign({}, l, { status: "picking", deadline: Date.now() + 7632000 }); });
  }

  return React.createElement("div", { style: { flex: 1, overflowY: "auto" } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid " + BD } },
      React.createElement("button", { onClick: props.onLeave, style: { background: "none", border: "none", color: TX, fontSize: 22, cursor: "pointer", marginRight: 8 } }, "←"),
      React.createElement("div", { style: { flex: 1, textAlign: "center", fontWeight: 700 } }, lobby.name)
    ),
    React.createElement("div", { style: { padding: 18 } },
      React.createElement("div", { style: { fontSize: 11, color: MU, marginBottom: 6 } }, "CODE DE LA LIGUE"),
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", background: S1, border: "1px solid " + BD, borderRadius: 12, padding: "14px 20px", gap: 12, marginBottom: 16 } },
        React.createElement("span", { style: { fontSize: 32, fontWeight: 900, letterSpacing: 8, color: GR } }, lobby.code),
        React.createElement("button", { onClick: copy, style: { background: "#222", border: "1px solid " + BD, borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 16 } }, "📋")
      ),
      React.createElement("div", { style: { fontSize: 11, color: MU, marginBottom: 8, fontWeight: 700 } }, "JOUEURS (" + lobby.players.length + ")"),
      React.createElement("div", { style: { background: S1, border: "1px solid " + BD, borderRadius: 12, marginBottom: 16, overflow: "hidden" } },
        lobby.players.map(function(p) {
          return React.createElement("div", { key: p.uid, style: { display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid " + BD, gap: 10 } },
            React.createElement("div", { style: { width: 34, height: 34, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 } }, p.pseudo[0].toUpperCase()),
            React.createElement("span", { style: { flex: 1, fontWeight: 600 } }, p.pseudo),
            React.createElement("span", { style: { color: GR, fontWeight: 700 } }, p.points + " pts"),
            React.createElement("span", { style: { background: "rgba(57,233,121,0.12)", color: GR, borderRadius: 99, padding: "3px 9px", fontSize: 12, fontWeight: 700 } }, "Prêt")
          );
        })
      ),
      props.isHost
        ? React.createElement(GreenBtn, { onClick: start }, "LANCER LA PARTIE")
        : React.createElement("div", { style: { textAlign: "center", color: MU, padding: 16 } }, "En attente que l'admin lance...")
    )
  );
}

function PickingScreen(props) {
  var lobby = props.lobby; var me = props.me;
  var closed = lobby.status === "closed";
  var myPick = me ? me.pick : null;
  var usedTeams = me ? (me.usedTeams || []) : [];
  var timeState = useState("00:00:00"); var timeLeft = timeState[0]; var setTimeLeft = timeState[1];

  useEffect(function() {
    var iv = setInterval(function() {
      var d = Math.max(0, (lobby.deadline || 0) - Date.now());
      var h = Math.floor(d / 3600000);
      var m = Math.floor((d % 3600000) / 60000);
      var s = Math.floor((d % 60000) / 1000);
      setTimeLeft((h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s));
    }, 1000);
    return function() { clearInterval(iv); };
  }, [lobby.deadline]);

  function pick(id) {
    if (closed || myPick || usedTeams.indexOf(id) >= 0 || !me || !me.alive) return;
    props.updLobby(function(l) {
      return Object.assign({}, l, { players: l.players.map(function(p) { return p.uid === me.uid ? Object.assign({}, p, { pick: id }) : p; }) });
    });
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
        return Object.assign({}, p, { result: result, alive: survived, usedTeams: survived ? p.usedTeams.concat([p.pick]) : p.usedTeams });
      });
      var alive = players.filter(function(p) { return p.alive; });
      var newStatus = alive.length <= 1 ? "finished" : "roundEnd";
      if (alive.length === 1) { players = players.map(function(p) { return p.alive ? Object.assign({}, p, { points: (p.points || 0) + 1 }) : p; }); }
      return Object.assign({}, l, { players: players, status: newStatus, history: (l.history || []).concat([{ round: l.round, players: players.map(function(p) { return { pseudo: p.pseudo, pick: p.pick, result: p.result }; }) }]) });
    });
  }

  return React.createElement("div", { style: { flex: 1, overflowY: "auto" } },
    React.createElement("div", { style: { textAlign: "center", padding: "14px 18px", borderBottom: "1px solid " + BD } },
      React.createElement("div", { style: { fontWeight: 700 } }, "Journée " + lobby.round),
      React.createElement("div", { style: { fontSize: 11, color: MU } }, "Ligue 1")
    ),
    React.createElement("div", { style: { padding: 18, display: "flex", flexDirection: "column", gap: 12 } },
      !closed
        ? React.createElement("div", { style: { background: "#1a1100", border: "1.5px solid rgba(255,208,0,0.35)", borderRadius: 12, padding: "14px 16px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: 11, color: YL, letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 } }, "⏱ DEADLINE"),
            React.createElement("div", { style: { fontSize: 42, fontWeight: 900, color: YL, letterSpacing: 2 } }, timeLeft),
            React.createElement("div", { style: { fontSize: 12, color: MU, marginTop: 4 } }, "avant le premier match (15:00)")
          )
        : React.createElement("div", { style: { background: "#1a0808", border: "1.5px solid rgba(255,68,68,0.35)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 } },
            React.createElement("span", { style: { fontSize: 22 } }, "🔒"),
            React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: RD } }, "SÉLECTIONS FERMÉES")
          ),
      me && !me.alive ? React.createElement("div", { style: { background: "#0d0d1a", border: "1.5px solid rgba(100,100,255,0.3)", borderRadius: 12, padding: 16, textAlign: "center", color: "#8888ff", fontWeight: 700 } }, "👁 MODE SPECTATEUR") : null,
      me && me.alive && myPick ? React.createElement("div", { style: { background: "rgba(57,233,121,0.08)", border: "1px solid rgba(57,233,121,0.3)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 } },
        React.createElement("span", { style: { fontSize: 24 } }, getTeam(myPick).logo),
        React.createElement("div", null,
          React.createElement("div", { style: { fontWeight: 700 } }, getTeam(myPick).name),
          React.createElement("div", { style: { fontSize: 12, color: GR } }, "✓ Sélection validée")
        )
      ) : null,
      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 11, color: MU, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 } }, "CHOISIS TON ÉQUIPE"),
        React.createElement("div", { style: { background: S1, border: "1px solid " + BD, borderRadius: 12, overflow: "hidden" } },
          FIXTURES.map(function(fix) {
            return [{ id: fix.home, time: fix.day }, { id: fix.away, time: "—" }].map(function(item) {
              var t = getTeam(item.id);
              var sel = myPick === item.id;
              var used = usedTeams.indexOf(item.id) >= 0;
              var canPick = me && me.alive && !myPick && !closed && !used;
              return React.createElement("div", {
                key: item.id,
                onClick: function() { if (canPick) pick(item.id); },
                style: { display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: "1px solid " + BD, gap: 8, background: sel ? "rgba(57,233,121,0.06)" : "transparent", opacity: used ? 0.35 : 1, cursor: canPick ? "pointer" : "default" }
              },
                React.createElement("div", { style: { width: 22, height: 22, borderRadius: "50%", background: sel ? GR : used ? RD : "transparent", border: sel || used ? "none" : "2px solid " + BD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, color: "#000", fontWeight: 700 } }, sel ? "✓" : used ? "✗" : ""),
                React.createElement("span", { style: { fontSize: 18 } }, t.logo),
                React.createElement("span", { style: { flex: 1, fontWeight: 600, fontSize: 14 } }, t.name),
                React.createElement("span", { style: { fontSize: 11, color: MU } }, item.time)
              );
            });
          })
        )
      ),
      props.isHost && !closed ? React.createElement(GreenBtn, { onClick: function() { props.updLobby(function(l) { return Object.assign({}, l, { status: "closed" }); }); }, outline: true }, "🔒 FERMER LES SÉLECTIONS") : null,
      props.isHost && closed ? React.createElement(GreenBtn, { onClick: resolve }, "🏁 OBTENIR LES RÉSULTATS") : null,
      me && me.alive && !myPick && !closed ? React.createElement("div", { style: { background: "#1a1400", border: "1px solid rgba(255,208,0,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#ccaa00" } }, "⚠️ Les joueurs sans choix seront éliminés à la fermeture.") : null
    )
  );
}

function ResultsScreen(props) {
  var lobby = props.lobby;
  var alive = lobby.players.filter(function(p) { return p.alive; });
  function next() {
    props.updLobby(function(l) { return Object.assign({}, l, { status: "picking", round: l.round + 1, deadline: Date.now() + 3600000, players: l.players.map(function(p) { return Object.assign({}, p, { pick: null, result: null }); }) }); });
    props.showToast("Journée suivante !");
  }
  return React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 18 } },
    React.createElement("div", { style: { textAlign: "center", fontWeight: 700, fontSize: 20, marginBottom: 16 } }, "Résultats — Journée " + lobby.round),
    React.createElement("div", { style: { background: S1, border: "1px solid " + BD, borderRadius: 12, overflow: "hidden", marginBottom: 12 } },
      lobby.players.map(function(p) {
        return React.createElement("div", { key: p.uid, style: { display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid " + BD, gap: 10 } },
          React.createElement("div", { style: { width: 34, height: 34, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 } }, p.pseudo[0].toUpperCase()),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { fontWeight: 600 } }, p.pseudo),
            React.createElement("div", { style: { fontSize: 12, color: MU } }, p.pick ? getTeam(p.pick).logo + " " + getTeam(p.pick).name : "Pas de choix")
          ),
          React.createElement("span", { style: { background: p.result === "win" ? "rgba(57,233,121,0.12)" : "rgba(255,68,68,0.12)", color: p.result === "win" ? GR : RD, borderRadius: 99, padding: "3px 9px", fontSize: 12, fontWeight: 700 } }, p.result === "win" ? "✓ GAGNÉ" : "✗ ÉLIMINÉ")
        );
      })
    ),
    React.createElement("div", { style: { textAlign: "center", fontWeight: 700, fontSize: 18, marginBottom: 16 } }, "💪 " + alive.length + " joueur" + (alive.length > 1 ? "s" : "") + " encore en lice !"),
    props.isHost ? React.createElement(GreenBtn, { onClick: next }, "JOURNÉE SUIVANTE →") : React.createElement("div", { style: { textAlign: "center", color: MU } }, "En attente de l'admin...")
  );
}

function WinnerScreen(props) {
  var lobby = props.lobby;
  var winner = lobby.players.find(function(p) { return p.alive; }) || lobby.players[0];
  function replay() {
    props.updLobby(function(l) { return Object.assign({}, l, { status: "waiting", round: 12, history: [], players: l.players.map(function(p) { return Object.assign({}, p, { alive: true, pick: null, result: null, usedTeams: [] }); }) }); });
  }
  return React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", gap: 16 } },
    React.createElement("div", { style: { fontSize: 80 } }, "🏆"),
    React.createElement("div", { style: { fontSize: 14, color: MU, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 } }, "SAISON TERMINÉE !"),
    React.createElement("div", { style: { fontSize: 36, fontWeight: 900, color: GR } }, "🏆 " + (winner ? winner.pseudo : "?") + " 🏆"),
    React.createElement("div", { style: { fontSize: 14, color: MU } }, "est le dernier survivant !"),
    React.createElement("div", { style: { background: "rgba(57,233,121,0.08)", border: "1px solid rgba(57,233,121,0.3)", borderRadius: 12, padding: 16, width: "100%" } },
      React.createElement("div", { style: { fontSize: 28, fontWeight: 900, color: GR } }, "+1 POINT")
    ),
    props.isHost ? React.createElement(GreenBtn, { onClick: replay }, "🔁 REJOUER") : null,
    React.createElement(GreenBtn, { onClick: props.onLeave, outline: true }, "← QUITTER")
  );
}

function ResultatsTab(props) {
  var lobby = props.lobby;
  var alive = lobby.players.filter(function(p) { return p.alive; });
  var elim = lobby.players.filter(function(p) { return !p.alive; });
  return React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 18 } },
    React.createElement("div", { style: { fontWeight: 700, fontSize: 18, marginBottom: 16 } }, "État de la partie"),
    alive.length > 0 ? React.createElement("div", null,
      React.createElement("div", { style: { fontSize: 11, color: GR, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 } }, "SURVIVANTS (" + alive.length + ")"),
      React.createElement("div", { style: { background: S1, border: "1px solid " + BD, borderRadius: 12, overflow: "hidden", marginBottom: 16 } },
        alive.map(function(p) {
          return React.createElement("div", { key: p.uid, style: { display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid " + BD, gap: 10 } },
            React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: GR, boxShadow: "0 0 6px " + GR } }),
            React.createElement("div", { style: { width: 32, height: 32, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 } }, p.pseudo[0].toUpperCase()),
            React.createElement("span", { style: { flex: 1, fontWeight: 600 } }, p.pseudo)
          );
        })
      )
    ) : null,
    elim.length > 0 ? React.createElement("div", null,
      React.createElement("div", { style: { fontSize: 11, color: MU, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 } }, "ÉLIMINÉS (" + elim.length + ")"),
      React.createElement("div", { style: { background: S1, border: "1px solid " + BD, borderRadius: 12, overflow: "hidden" } },
        elim.map(function(p) {
          return React.createElement("div", { key: p.uid, style: { display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid " + BD, gap: 10, opacity: 0.55 } },
            React.createElement("div", { style: { width: 32, height: 32, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 } }, p.pseudo[0].toUpperCase()),
            React.createElement("span", { style: { flex: 1, fontWeight: 600 } }, p.pseudo),
            React.createElement("span", { style: { background: "rgba(255,68,68,0.12)", color: RD, borderRadius: 99, padding: "3px 9px", fontSize: 12, fontWeight: 700 } }, "Éliminé")
          );
        })
      )
    ) : null
  );
}

function ClassementTab(props) {
  var sorted = props.lobby.players.slice().sort(function(a, b) { return (b.points || 0) - (a.points || 0); });
  return React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 18 } },
    React.createElement("div", { style: { fontWeight: 700, fontSize: 18, marginBottom: 4 } }, "Classement général"),
    React.createElement("div", { style: { fontSize: 12, color: MU, marginBottom: 16 } }, "Toutes saisons confondues"),
    React.createElement("div", { style: { background: S1, border: "1px solid " + BD, borderRadius: 12, overflow: "hidden" } },
      sorted.map(function(p, i) {
        return React.createElement("div", { key: p.uid, style: { display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid " + BD, gap: 10 } },
          React.createElement("span", { style: { fontSize: 18, fontWeight: 900, width: 28, textAlign: "center", c
  );
}

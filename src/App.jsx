import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
  const firebaseConfig = {apiKey:"AIzaSyBdD3QEm8PnU6ojBi6XzytVY0NCbXdBx0w",authDomain:"wc2026-b3ba3.firebaseapp.com",databaseURL:"https://wc22222-5e7e0-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"wc2026-b3ba3",storageBucket:"wc2026-b3ba3.firebasestorage.app",messagingSenderId:"705848910216",appId:"1:705848910216:web:6f9e3cda107b9533f91a3d"}
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PLAYERS = ["Q", "Hung YH", "Perry", "Steven", "TLQ", "Ong"];
const ADMIN_PW = "qingqing";
const toKey = (name) => name.replace(/ /g, "_");

const R32 = [
  { id: "r32_1", a: "South Africa", b: "Canada" },
  { id: "r32_2", a: "Netherlands", b: "Morocco" },
  { id: "r32_3", a: "Germany", b: "Paraguay" },
  { id: "r32_4", a: "France", b: "Sweden" },
  { id: "r32_5", a: "Brazil", b: "Japan" },
  { id: "r32_6", a: "Ivory Coast", b: "Norway" },
  { id: "r32_7", a: "Mexico", b: "Ecuador" },
  { id: "r32_8", a: "England", b: "DR Congo" },
  { id: "r32_9", a: "USA", b: "Bosnia" },
  { id: "r32_10", a: "Belgium", b: "Senegal" },
  { id: "r32_11", a: "Spain", b: "Austria" },
  { id: "r32_12", a: "Portugal", b: "Croatia" },
  { id: "r32_13", a: "Switzerland", b: "Algeria" },
  { id: "r32_14", a: "Colombia", b: "Ghana" },
  { id: "r32_15", a: "Egypt", b: "Australia" },
  { id: "r32_16", a: "Argentina", b: "Cape Verde" },
];

const BRACKET = {
  r16: [
    { id: "r16_1", from: ["r32_1", "r32_2"] },
    { id: "r16_2", from: ["r32_3", "r32_4"] },
    { id: "r16_3", from: ["r32_5", "r32_6"] },
    { id: "r16_4", from: ["r32_7", "r32_8"] },
    { id: "r16_5", from: ["r32_9", "r32_10"] },
    { id: "r16_6", from: ["r32_11", "r32_12"] },
    { id: "r16_7", from: ["r32_13", "r32_14"] },
    { id: "r16_8", from: ["r32_15", "r32_16"] },
  ],
  qf: [
    { id: "qf_1", from: ["r16_1", "r16_2"] },
    { id: "qf_2", from: ["r16_3", "r16_4"] },
    { id: "qf_3", from: ["r16_5", "r16_6"] },
    { id: "qf_4", from: ["r16_7", "r16_8"] },
  ],
  sf: [
    { id: "sf_1", from: ["qf_1", "qf_3"] },
    { id: "sf_2", from: ["qf_2", "qf_4"] },
  ],
  final: [{ id: "final_1", from: ["sf_1", "sf_2"] }],
};

const ROUND_KEYS = ["r32", "r16", "qf", "sf", "final"];
const ROUND_LABELS = { r32: "R32", r16: "R16", qf: "QF", sf: "SF", final: "Final" };

const FLAGS = {
  "South Africa": "\u{1F1FF}\u{1F1E6}", Canada: "\u{1F1E8}\u{1F1E6}", Netherlands: "\u{1F1F3}\u{1F1F1}", Morocco: "\u{1F1F2}\u{1F1E6}",
  Germany: "\u{1F1E9}\u{1F1EA}", Paraguay: "\u{1F1F5}\u{1F1FE}", France: "\u{1F1EB}\u{1F1F7}", Sweden: "\u{1F1F8}\u{1F1EA}",
  Brazil: "\u{1F1E7}\u{1F1F7}", Japan: "\u{1F1EF}\u{1F1F5}", "Ivory Coast": "\u{1F1E8}\u{1F1EE}", Norway: "\u{1F1F3}\u{1F1F4}",
  Mexico: "\u{1F1F2}\u{1F1FD}", Ecuador: "\u{1F1EA}\u{1F1E8}", England: "\u{1F3F4}", "DR Congo": "\u{1F1E8}\u{1F1E9}",
  USA: "\u{1F1FA}\u{1F1F8}", Bosnia: "\u{1F1E7}\u{1F1E6}", Belgium: "\u{1F1E7}\u{1F1EA}", Senegal: "\u{1F1F8}\u{1F1F3}",
  Spain: "\u{1F1EA}\u{1F1F8}", Austria: "\u{1F1E6}\u{1F1F9}", Portugal: "\u{1F1F5}\u{1F1F9}", Croatia: "\u{1F1ED}\u{1F1F7}",
  Switzerland: "\u{1F1E8}\u{1F1ED}", Algeria: "\u{1F1E9}\u{1F1FF}", Colombia: "\u{1F1E8}\u{1F1F4}", Ghana: "\u{1F1EC}\u{1F1ED}",
  Egypt: "\u{1F1EA}\u{1F1EC}", Australia: "\u{1F1E6}\u{1F1FA}", Argentina: "\u{1F1E6}\u{1F1F7}", "Cape Verde": "\u{1F1E8}\u{1F1FB}",
};

function getTeamForSlot(matchId, picks) { return picks[matchId] || null; }

function getMatchTeams(match, picks) {
  if (match.id.startsWith("r32_")) {
    const m = R32.find((x) => x.id === match.id);
    return [m.a, m.b];
  }
  const [fromA, fromB] = match.from;
  return [getTeamForSlot(fromA, picks), getTeamForSlot(fromB, picks)];
}

function getDownstreamIds(matchId) {
  const ids = new Set();
  for (let i = ROUND_KEYS.indexOf(matchId.split("_")[0]) + 1; i < ROUND_KEYS.length; i++) {
    const key = ROUND_KEYS[i];
    const matches = key === "r32" ? [] : BRACKET[key];
    for (const m of matches) {
      if (m.from.some((f) => ids.has(f) || f === matchId)) ids.add(m.id);
    }
  }
  return ids;
}

function getAllMatches(round) {
  if (round === "r32") return R32.map((m) => ({ id: m.id, from: null }));
  return BRACKET[round];
}

const S = {
  page: { minHeight: "100vh", background: "#0a1628", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" },
  backBtn: { background: "none", border: "none", color: "#64748b", fontSize: 14, cursor: "pointer", padding: "4px 8px" },
};

export default function App() {
  const [screen, setScreen] = useState("login");
  const [player, setPlayer] = useState(null);
  const [tab, setTab] = useState("r32");
  const [picks, setPicks] = useState({});
  const [results, setResults] = useState({});
  const [allPicks, setAllPicks] = useState({});
  const [locked, setLocked] = useState({});
  const [saving, setSaving] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminAuth, setAdminAuth] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  useEffect(() => {
    const unsubs = [];
    unsubs.push(onValue(ref(db, "knockout/results"), (snap) => { setResults(snap.val() || {}); }));
    unsubs.push(onValue(ref(db, "knockout/locked"), (snap) => { setLocked(snap.val() || {}); }));
    for (const p of PLAYERS) {
      unsubs.push(onValue(ref(db, "knockout/picks/" + toKey(p)), (snap) => {
        setAllPicks((prev) => ({ ...prev, [p]: snap.val() || {} }));
      }));
    }
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (player && allPicks[player]) setPicks(allPicks[player]);
  }, [player]);

  const loginAs = (p) => { setPlayer(p); setPicks(allPicks[p] || {}); setScreen("picks"); };

  const pickWinner = (matchId, team) => {
    setPicks((prev) => {
      const next = { ...prev, [matchId]: team };
      const downstream = getDownstreamIds(matchId);
      for (const did of downstream) {
        const round = did.split("_")[0];
        const matches = round === "r32" ? [] : BRACKET[round];
        const match = matches.find((m) => m.id === did);
        if (match) {
          const [tA, tB] = getMatchTeams(match, next);
          if (next[did] && next[did] !== tA && next[did] !== tB) delete next[did];
        }
      }
      return next;
    });
  };

  const savePicks = async () => {
    setSaving(true);
    try { await set(ref(db, "knockout/picks/" + toKey(player)), picks); showToast("Saved!"); }
    catch (e) { showToast("Error: " + e.message); }
    setSaving(false);
  };

  const saveResult = async (matchId, team) => {
    const nr = { ...results, [matchId]: team };
    await set(ref(db, "knockout/results"), nr);
    showToast("Result saved");
  };

  const toggleLock = async (round) => {
    const nl = { ...locked, [round]: !locked[round] };
    await set(ref(db, "knockout/locked"), nl);
    showToast(nl[round] ? ROUND_LABELS[round] + " locked" : ROUND_LABELS[round] + " unlocked");
  };

  const calcScore = (pp) => {
    if (!pp) return { total: 0, byRound: {} };
    const byRound = {}; let total = 0;
    for (const rk of ROUND_KEYS) {
      let count = 0;
      for (const m of getAllMatches(rk)) { if (results[m.id] && pp[m.id] === results[m.id]) count++; }
      byRound[rk] = count; total += count;
    }
    return { total, byRound };
  };

  const countPicks = (pp) => pp ? Object.keys(pp).filter((k) => pp[k]).length : 0;
  const totalMatches = 31;

  const toastEl = toast ? (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#fff", padding: "8px 20px", borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,.3)" }}>{toast}</div>
  ) : null;

  if (screen === "login") {
    return (
      <div style={{ ...S.page, padding: "40px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚽🏆</div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>WC 2026 Knockout</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Prediction Game</p>
        </div>
        <div style={{ maxWidth: 340, margin: "0 auto" }}>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12, textAlign: "center" }}>Select your name</p>
          {PLAYERS.map((p) => {
            const n = countPicks(allPicks[p]);
            return (
              <button key={p} onClick={() => loginAs(p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", marginBottom: 8, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
                <span>{p}</span>
                <span style={{ fontSize: 12, color: n > 0 ? "#22c55e" : "#475569" }}>{n > 0 ? n + "/" + totalMatches + " picked" : "No picks yet"}</span>
              </button>
            );
          })}
          <div style={{ borderTop: "1px solid #1e293b", margin: "20px 0", paddingTop: 16 }}>
            <button onClick={() => setScreen("leaderboard")} style={{ width: "100%", padding: "14px", marginBottom: 8, background: "#f59e0b", border: "none", borderRadius: 10, color: "#000", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>🏆 Leaderboard</button>
            <button onClick={() => setScreen("admin")} style={{ width: "100%", padding: "14px", background: "#334155", border: "none", borderRadius: 10, color: "#94a3b8", fontSize: 14, cursor: "pointer" }}>Admin</button>
          </div>
        </div>
        {toastEl}
      </div>
    );
  }

  if (screen === "leaderboard") {
    const scores = PLAYERS.map((p) => ({ name: p, ...calcScore(allPicks[p]), picked: countPicks(allPicks[p]) }));
    scores.sort((a, b) => b.total - a.total);
    const resultsCount = Object.keys(results).length;
    return (
      <div style={{ ...S.page, padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setScreen("login")} style={S.backBtn}>← Back</button>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 auto", paddingRight: 40 }}>🏆 Leaderboard</h2>
        </div>
        <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", margin: "0 0 16px" }}>{resultsCount} of {totalMatches} results confirmed</p>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          {scores.map((s, i) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", padding: "12px 14px", marginBottom: 6, background: i === 0 && s.total > 0 ? "#1a2744" : "#1e293b", border: i === 0 && s.total > 0 ? "1px solid #f59e0b33" : "1px solid #334155", borderRadius: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "#475569", color: i < 3 ? "#000" : "#94a3b8", fontSize: 13, fontWeight: 700, marginRight: 12, flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>{s.name}</div>
                <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>
                  {ROUND_KEYS.map((rk) => {
                    const roundResults = getAllMatches(rk).filter((m) => results[m.id]).length;
                    if (roundResults === 0) return null;
                    return <span key={rk} style={{ marginRight: 8 }}>{ROUND_LABELS[rk]}: {s.byRound[rk]}/{roundResults}</span>;
                  }).filter(Boolean)}
                </div>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: s.total > 0 ? "#22c55e" : "#475569", minWidth: 36, textAlign: "right" }}>{s.total}</span>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 400, margin: "20px auto 0" }}>
          <p style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>Max possible per round</p>
          <div style={{ display: "flex", gap: 6 }}>
            {ROUND_KEYS.map((rk) => (
              <div key={rk} style={{ flex: 1, textAlign: "center", background: "#1e293b", borderRadius: 8, padding: "8px 4px" }}>
                <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 2 }}>{ROUND_LABELS[rk]}</div>
                <div style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>{getAllMatches(rk).length}</div>
              </div>
            ))}
          </div>
        </div>
        {toastEl}
      </div>
    );
  }

  if (screen === "admin") {
    if (!adminAuth) {
      return (
        <div style={{ ...S.page, padding: "40px 16px" }}>
          <button onClick={() => setScreen("login")} style={{ ...S.backBtn, marginBottom: 20 }}>← Back</button>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 20 }}>Admin Login</h2>
          <div style={{ maxWidth: 300, margin: "0 auto" }}>
            <input type="password" placeholder="Password" value={adminPw} onChange={(e) => setAdminPw(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 15, marginBottom: 12, boxSizing: "border-box" }} />
            <button onClick={() => { if (adminPw === ADMIN_PW) setAdminAuth(true); else showToast("Wrong password"); }} style={{ width: "100%", padding: "12px", background: "#3b82f6", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Enter</button>
          </div>
          {toastEl}
        </div>
      );
    }
    return (
      <div style={{ ...S.page, padding: "12px 16px 100px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => { setScreen("login"); setAdminAuth(false); setAdminPw(""); }} style={S.backBtn}>← Back</button>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 auto", paddingRight: 40 }}>Admin Panel</h2>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16, overflowX: "auto" }}>
          {ROUND_KEYS.map((rk) => (
            <button key={rk} onClick={() => setTab(rk)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, background: tab === rk ? "#3b82f6" : "#1e293b", color: tab === rk ? "#fff" : "#64748b", cursor: "pointer", whiteSpace: "nowrap" }}>{ROUND_LABELS[rk]}</button>
          ))}
        </div>
        <button onClick={() => toggleLock(tab)} style={{ display: "block", width: "100%", padding: "10px", marginBottom: 12, background: locked[tab] ? "#dc2626" : "#16a34a", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {locked[tab] ? "🔒 " + ROUND_LABELS[tab] + " LOCKED — tap to unlock" : "🔓 " + ROUND_LABELS[tab] + " OPEN — tap to lock"}
        </button>
        {getAllMatches(tab).map((match) => {
          let tA, tB;
          if (tab === "r32") { const m = R32.find((x) => x.id === match.id); tA = m.a; tB = m.b; }
          else { [tA, tB] = getMatchTeams(match, results); }
          const current = results[match.id];
          return (
            <div key={match.id} style={{ background: "#1e293b", borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: current ? "1px solid #22c55e33" : "1px solid #334155" }}>
              <div style={{ color: "#475569", fontSize: 10, marginBottom: 6, textTransform: "uppercase" }}>{match.id.replace("_", " ")}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[tA, tB].map((team, idx) => {
                  if (!team) return (<div key={idx} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#0f172a", textAlign: "center", color: "#475569", fontSize: 13 }}>TBD</div>);
                  const sel = current === team;
                  return (
                    <button key={team} onClick={() => saveResult(match.id, team)} style={{ flex: 1, padding: "10px 6px", borderRadius: 8, border: "none", cursor: "pointer", background: sel ? "#166534" : "#0f172a", outline: sel ? "2px solid #22c55e" : "none" }}>
                      <div style={{ fontSize: 22 }}>{FLAGS[team] || "\u{1F3F3}\u{FE0F}"}</div>
                      <div style={{ color: sel ? "#22c55e" : "#e2e8f0", fontSize: 13, fontWeight: sel ? 700 : 400, marginTop: 2 }}>{team}</div>
                      {sel && <div style={{ color: "#22c55e", fontSize: 10, marginTop: 2 }}>✓ WINNER</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {toastEl}
      </div>
    );
  }

  const isLocked = locked[tab];
  return (
    <div style={{ ...S.page, padding: "0 0 80px" }}>
      <div style={{ background: "#1e293b", padding: "12px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid #334155" }}>
        <button onClick={() => setScreen("login")} style={{ ...S.backBtn, marginRight: 12, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <span style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>{player}</span>
          <span style={{ color: "#475569", fontSize: 12, marginLeft: 8 }}>{countPicks(picks)}/{totalMatches}</span>
        </div>
        <button onClick={savePicks} disabled={saving} style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "8px 16px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>{saving ? "..." : "Save"}</button>
      </div>
      <div style={{ display: "flex", gap: 2, padding: "8px 12px", overflowX: "auto", background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
        {ROUND_KEYS.map((rk) => {
          const matches = getAllMatches(rk);
          const filled = matches.filter((m) => picks[m.id]).length;
          const roundResults = matches.filter((m) => results[m.id]).length;
          const correct = matches.filter((m) => results[m.id] && picks[m.id] === results[m.id]).length;
          return (
            <button key={rk} onClick={() => setTab(rk)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, background: tab === rk ? "#3b82f6" : "transparent", color: tab === rk ? "#fff" : "#64748b", cursor: "pointer", whiteSpace: "nowrap" }}>
              {ROUND_LABELS[rk]}
              <span style={{ display: "block", fontSize: 9, fontWeight: 400, marginTop: 1, color: roundResults > 0 ? "#22c55e" : (tab === rk ? "#93c5fd" : "#475569") }}>
                {roundResults > 0 ? correct + "/" + roundResults + " \u2713" : filled + "/" + matches.length}
              </span>
            </button>
          );
        })}
      </div>
      {isLocked && (
        <div style={{ background: "#dc262622", borderBottom: "1px solid #dc262644", padding: "8px 16px", color: "#fca5a5", fontSize: 12, textAlign: "center" }}>
          🔒 {ROUND_LABELS[tab]} picks are locked
        </div>
      )}
      <div style={{ padding: "12px 16px" }}>
        {getAllMatches(tab).map((match) => {
          let tA, tB;
          if (tab === "r32") { const m = R32.find((x) => x.id === match.id); tA = m.a; tB = m.b; }
          else { [tA, tB] = getMatchTeams(match, picks); }
          const myPick = picks[match.id];
          const actualResult = results[match.id];
          const isCorrect = actualResult && myPick === actualResult;
          const isWrong = actualResult && myPick && myPick !== actualResult;
          return (
            <div key={match.id} style={{ background: "#1e293b", borderRadius: 12, padding: "8px 10px", marginBottom: 8, border: isCorrect ? "1px solid #22c55e55" : isWrong ? "1px solid #dc262655" : "1px solid #334155" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{match.id.replace("_", " ")}</span>
                {isCorrect && <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>✓ +1 pt</span>}
                {isWrong && <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 600 }}>✗ Wrong</span>}
                {actualResult && !myPick && <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600 }}>No pick</span>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[tA, tB].map((team, idx) => {
                  if (!team) return (
                    <div key={idx} style={{ flex: 1, padding: "12px 6px", borderRadius: 8, background: "#0f172a", textAlign: "center", color: "#334155", fontSize: 13 }}>
                      <div style={{ fontSize: 24, opacity: 0.3 }}>❓</div>
                      <div style={{ marginTop: 2 }}>Pick {ROUND_LABELS[ROUND_KEYS[ROUND_KEYS.indexOf(tab) - 1]]} first</div>
                    </div>
                  );
                  const sel = myPick === team;
                  const isActualWinner = actualResult === team;
                  let bg = "#0f172a"; let outline = "none";
                  if (sel && isCorrect) { bg = "#14532d"; outline = "2px solid #22c55e"; }
                  else if (sel && isWrong) { bg = "#450a0a"; outline = "2px solid #dc2626"; }
                  else if (sel) { bg = "#172554"; outline = "2px solid #3b82f6"; }
                  if (!sel && isActualWinner) bg = "#14532d44";
                  return (
                    <button key={team} disabled={isLocked} onClick={() => pickWinner(match.id, team)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, border: "none", cursor: isLocked ? "default" : "pointer", background: bg, outline, opacity: isLocked && !sel ? 0.6 : 1 }}>
                      <div style={{ fontSize: 26 }}>{FLAGS[team] || "\u{1F3F3}\u{FE0F}"}</div>
                      <div style={{ color: sel ? (isCorrect ? "#22c55e" : isWrong ? "#fca5a5" : "#93c5fd") : "#e2e8f0", fontSize: 13, fontWeight: sel ? 700 : 400, marginTop: 2 }}>{team}</div>
                      {sel && <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>Your pick</div>}
                      {!sel && isActualWinner && <div style={{ fontSize: 9, color: "#22c55e", marginTop: 1 }}>✓ Winner</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 16px", background: "#0f172a", borderTop: "1px solid #1e293b", display: "flex", gap: 8 }}>
        <button onClick={() => setTab(ROUND_KEYS[Math.max(0, ROUND_KEYS.indexOf(tab) - 1)])} disabled={tab === "r32"} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, background: "#1e293b", color: tab === "r32" ? "#334155" : "#94a3b8", cursor: tab === "r32" ? "default" : "pointer" }}>← Prev</button>
        <button onClick={savePicks} disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, background: "#22c55e", color: "#000", cursor: "pointer" }}>{saving ? "..." : "💾 Save"}</button>
        <button onClick={() => setTab(ROUND_KEYS[Math.min(ROUND_KEYS.length - 1, ROUND_KEYS.indexOf(tab) + 1)])} disabled={tab === "final"} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, background: "#1e293b", color: tab === "final" ? "#334155" : "#94a3b8", cursor: tab === "final" ? "default" : "pointer" }}>Next →</button>
      </div>
      {toastEl}
    </div>
  );
}

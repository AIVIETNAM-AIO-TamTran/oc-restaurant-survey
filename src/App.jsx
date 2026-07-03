import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Clock,
  ChevronDown,
  Circle,
  CheckCircle2,
  XCircle,
  StickyNote,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Loader2,
} from "lucide-react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "./firebase.js";

// ---- Data -------------------------------------------------------------

const RESTAURANTS = [
  { id: 1, name: "Thuế Kitchen", area: "Bolsa core", type: "Sit-down", time: "2:00–4:00 PM weekday", note: "Afternoon lull, easier to talk to staff" },
  { id: 2, name: "Cơm Tấm Thanh", area: "Bolsa core", type: "Cơm tấm", time: "11:30 AM–1:00 PM", note: "Lunch rush is the real test of ops" },
  { id: 3, name: "Cơm Tấm Xì Gòn", area: "Bolsa core", type: "Cơm tấm", time: "11:30 AM–1:00 PM", note: "" },
  { id: 4, name: "Giò Chả Đức Hương", area: "Bolsa core", type: "Specialty / Deli", time: "9:00–11:00 AM", note: "Cheaper visit — buy something" },
  { id: 5, name: "Chiên Mì Gõ", area: "Bolsa core", type: "Noodle", time: "5:00–7:00 PM", note: "" },
  { id: 6, name: "Chiên Cơm Bụi", area: "Bolsa core", type: "Cơm bụi", time: "11:30 AM–1:00 PM", note: "Cheaper visit — buy something" },
  { id: 7, name: "Chiên Bún Bò", area: "Bolsa core", type: "Bún bò", time: "8:00–10:00 AM", note: "Bún bò is a breakfast dish here" },
  { id: 8, name: "Mai Gia Phát Mì Gà", area: "Bolsa core", type: "Noodle", time: "11:30 AM–1:00 PM", note: "" },
  { id: 9, name: "Hương Giang To Go", area: "Bolsa core", type: "To-go", time: "2:00–4:00 PM", note: "" },
  { id: 10, name: "Hương Giang Restaurant", area: "Bolsa core", type: "Sit-down", time: "2:00–4:00 PM weekday", note: "" },
  { id: 11, name: "Hương Xì Restaurant", area: "Bolsa core", type: "Sit-down", time: "2:00–4:00 PM weekday", note: "" },
  { id: 12, name: "Bánh Mì Sài Gòn", area: "Bolsa core", type: "Bánh mì", time: "8:00–10:00 AM", note: "Cheaper visit — buy something" },
  { id: 13, name: "Teo Bánh Mì Bánh Cuốn", area: "Bolsa core", type: "Bánh mì / bánh cuốn", time: "8:00–10:00 AM", note: "To-go format" },
  { id: 14, name: "Bánh Cuốn Tây Hồ", area: "Bolsa core", type: "Bánh cuốn", time: "8:00–10:00 AM", note: "" },
  { id: 15, name: "Bánh Cuốn Lúa Luyến", area: "Bolsa core", type: "Bánh cuốn", time: "8:00–10:00 AM", note: "" },
  { id: 16, name: "Bánh Cuốn Thanh Trì", area: "Bolsa core", type: "Bánh cuốn", time: "8:00–10:00 AM", note: "" },
  { id: 17, name: "Bánh Mì Chè Cali", area: "Garden Grove", type: "Bánh mì / chè", time: "3:00–5:00 PM", note: "Chè crowd shows up afternoon" },
  { id: 18, name: "Cơm Tấm Ba Ghiền", area: "Garden Grove", type: "Cơm tấm", time: "11:30 AM–1:00 PM", note: "" },
  { id: 19, name: "Bún Vịt Thanh Đa", area: "Bolsa", type: "Bún vịt", time: "11:30 AM–1:00 PM", note: "" },
  { id: 20, name: "Chiên Miến Gà", area: "Bolsa", type: "Miến gà", time: "5:00–7:00 PM", note: "" },
  { id: 21, name: "Thanh Mỹ Restaurant", area: "Bolsa Ave", type: "Sit-down", time: "2:00–4:00 PM weekday", note: "" },
  { id: 22, name: "Thanh Sơn Tofee", area: "To-go only", type: "To-go", time: "2:00–4:00 PM", note: "To-go only — quick stop" },
  { id: 23, name: "Chè Gõ Phố", area: "Bolsa", type: "Chè / dessert", time: "3:00–6:00 PM", note: "" },
  { id: 24, name: "Cà Phê Trung Nguyên", area: "Bolsa/Magnolia corner", type: "Café", time: "9:00–11:00 AM or 2:00–4:00 PM", note: "Good for a sit-down interview over coffee" },
  { id: 25, name: "Chấm Chion Restaurant", area: "Beach Blvd, Stanton CA", type: "Sit-down", time: "2:00–4:00 PM weekday", note: "" },
  { id: 26, name: "Phở Holic", area: "Bushard St", type: "Phở", time: "11:30 AM–1:00 PM", note: "" },
  { id: 27, name: "Phở Holic", area: "Chapman Ave", type: "Phở", time: "11:30 AM–1:00 PM", note: "2nd location — compare to Bushard St" },
  { id: 28, name: "Phở Good", area: "Garden Grove", type: "Phở", time: "11:30 AM–1:00 PM", note: "" },
  { id: 29, name: "Phở Flavor", area: "Santa Ana, CA 92703", type: "Phở", time: "11:30 AM–1:00 PM", note: "" },
  { id: 30, name: "Phở Tàu Bay", area: "Hazard Ave", type: "Phở", time: "7:00–9:00 AM", note: "Legacy phở house — go early like locals" },
  { id: 31, name: "Phở 79", area: "Hazard Ave", type: "Phở", time: "11:30 AM–1:00 PM", note: "9941 Hazard Ave, Garden Grove — the original, most iconic location. (2nd location: 8894 Bolsa Ave, Westminster)" },
  { id: 32, name: "Phở 54", area: "Garden Grove", type: "Phở", time: "11:30 AM–1:00 PM", note: "10240 Westminster Ave Ste 101, Garden Grove. (Also at 15420 Brookhurst St, Westminster)" },
  { id: 33, name: "Phở Lovers", area: "Bolsa Ave", type: "Phở", time: "11:30 AM–1:00 PM", note: "9325 Bolsa Ave, Westminster. (Also at 9892 Westminster Blvd, Garden Grove)" },
  { id: 34, name: "Phở Thiên", area: "Bolsa Ave", type: "Phở", time: "11:30 AM–1:00 PM", note: "" },
  { id: 35, name: "Phở Hồng Hương", area: "Garden Grove", type: "Phở", time: "11:30 AM–1:00 PM", note: "" },
  { id: 36, name: "Phở Lú", area: "Westminster Ave", type: "Phở", time: "11:30 AM–1:00 PM", note: "" },
  { id: 37, name: "Ocean Hy Restaurant", area: "Bolsa", type: "Sit-down / seafood", time: "5:00–7:00 PM", note: "" },
  { id: 38, name: "Tiệm Mì Quốn", area: "Garden Grove", type: "Noodle", time: "11:30 AM–1:00 PM", note: "" },
  { id: 39, name: "Hương Việt Restaurant", area: "Garden Grove", type: "Sit-down", time: "2:00–4:00 PM weekday", note: "10254 Westminster Ave, Garden Grove — closest name match found; confirm this is the one you meant" },
  { id: 40, name: "Miền Tây Ocean", area: "Bolsa", type: "Sit-down / seafood", time: "5:00–7:00 PM", note: "" },
];

const AREA_ORDER = [
  "Bolsa core",
  "Bolsa",
  "Bolsa Ave",
  "Bolsa/Magnolia corner",
  "Garden Grove",
  "Westminster Ave",
  "Santa Ana, CA 92703",
  "Bushard St",
  "Chapman Ave",
  "Hazard Ave",
  "Beach Blvd, Stanton CA",
  "To-go only",
];

const STATUS = {
  todo: { label: "Not visited", icon: Circle, color: "#8a7a6d" },
  visited: { label: "Visited", icon: CheckCircle2, color: "#6b7c4f" },
  skip: { label: "Skipped", icon: XCircle, color: "#b5583f" },
};

const LOCAL_KEY = "oc-survey-progress-v1";

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { statuses: {}, notes: {} };
    const parsed = JSON.parse(raw);
    return { statuses: parsed.statuses || {}, notes: parsed.notes || {} };
  } catch {
    return { statuses: {}, notes: {} };
  }
}

function saveLocal(statuses, notes) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ statuses, notes }));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — cloud sync still applies if signed in
  }
}

// ---- Component ----------------------------------------------------------

export default function SurveyChecklist() {
  const initialLocal = useMemo(loadLocal, []);
  const [statuses, setStatuses] = useState(initialLocal.statuses);
  const [notes, setNotes] = useState(initialLocal.notes);
  const [openNote, setOpenNote] = useState(null);
  const [filter, setFilter] = useState("all");
  const [collapsedAreas, setCollapsedAreas] = useState({});

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [syncState, setSyncState] = useState("idle"); // idle | syncing | synced | error
  const skipNextWrite = useRef(false);
  const writeTimer = useRef(null);

  // --- Auth wiring ---
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // --- Subscribe to cloud doc once signed in; cloud is source of truth on load ---
  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    const ref = doc(db, "surveyProgress", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          skipNextWrite.current = true;
          setStatuses(data.statuses || {});
          setNotes(data.notes || {});
        }
        setSyncState("synced");
      },
      () => setSyncState("error")
    );
    return () => unsub();
  }, [user]);

  // --- Persist on every change: always to localStorage, debounced to cloud ---
  useEffect(() => {
    saveLocal(statuses, notes);

    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    if (!isFirebaseConfigured || !user) return;

    setSyncState("syncing");
    clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      const ref = doc(db, "surveyProgress", user.uid);
      setDoc(ref, { statuses, notes, updatedAt: serverTimestamp() }, { merge: true })
        .then(() => setSyncState("synced"))
        .catch(() => setSyncState("error"));
    }, 600);

    return () => clearTimeout(writeTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statuses, notes]);

  const handleSignIn = useCallback(() => {
    if (!isFirebaseConfigured) return;
    signInWithPopup(auth, googleProvider).catch(() => setSyncState("error"));
  }, []);

  const handleSignOut = useCallback(() => {
    if (!isFirebaseConfigured) return;
    signOut(auth);
  }, []);

  const cycleStatus = (id) => {
    setStatuses((prev) => {
      const cur = prev[id] || "todo";
      const next = cur === "todo" ? "visited" : cur === "visited" ? "skip" : "todo";
      return { ...prev, [id]: next };
    });
  };

  const grouped = useMemo(() => {
    const byArea = {};
    RESTAURANTS.forEach((r) => {
      if (!byArea[r.area]) byArea[r.area] = [];
      byArea[r.area].push(r);
    });
    return AREA_ORDER.filter((a) => byArea[a]).map((a) => [a, byArea[a]]);
  }, []);

  const visibleGrouped = useMemo(() => {
    if (filter === "all") return grouped;
    return grouped
      .map(([area, list]) => [area, list.filter((r) => (statuses[r.id] || "todo") === filter)])
      .filter(([, list]) => list.length > 0);
  }, [grouped, statuses, filter]);

  const counts = useMemo(() => {
    const c = { todo: 0, visited: 0, skip: 0 };
    RESTAURANTS.forEach((r) => {
      c[statuses[r.id] || "todo"]++;
    });
    return c;
  }, [statuses]);

  const total = RESTAURANTS.length;
  const pct = Math.round((counts.visited / total) * 100);

  const toggleArea = (area) =>
    setCollapsedAreas((prev) => ({ ...prev, [area]: !prev[area] }));

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .rowbtn { transition: background 0.15s ease, transform 0.1s ease; }
        .rowbtn:active { transform: scale(0.997); }
        .stamp-enter { animation: stampIn 0.28s cubic-bezier(.2,1.4,.4,1); }
        @keyframes stampIn {
          0% { transform: scale(1.6) rotate(-8deg); opacity: 0; }
          60% { transform: scale(0.92) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: #d8cdbd; border-radius: 8px; }
        textarea:focus, button:focus-visible { outline: 2px solid #8a5a3c; outline-offset: 2px; }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.topRow}>
            <div style={styles.eyebrow}>Field survey · Little Saigon &amp; Garden Grove, CA</div>
            {isFirebaseConfigured ? (
              authReady && (
                user ? (
                  <button style={styles.authBtn} onClick={handleSignOut} title={user.email}>
                    <LogOut size={13} strokeWidth={2.3} />
                    Sign out
                  </button>
                ) : (
                  <button style={styles.authBtn} onClick={handleSignIn}>
                    <LogIn size={13} strokeWidth={2.3} />
                    Sign in to sync
                  </button>
                )
              )
            ) : (
              <span style={styles.authBtn} title="Add your Firebase config in src/firebaseConfig.js to enable cross-device sync">
                <CloudOff size={13} strokeWidth={2.3} />
                Local only
              </span>
            )}
          </div>

          <h1 style={styles.h1}>40 Quán, 40 Cuộc Trò Chuyện</h1>
          <p style={styles.sub}>
            One stamp per stop. Work the map by neighborhood — Bolsa core in the morning,
            Garden Grove and the phở corridor by afternoon — and log who you talked to as you go.
          </p>

          <div style={styles.progressWrap}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${pct}%` }} />
            </div>
            <div style={styles.progressLabel}>
              <span>{counts.visited} of {total} visited · {pct}%</span>
              <SyncIndicator state={isFirebaseConfigured ? (user ? syncState : "local") : "unconfigured"} />
            </div>
          </div>

          <div style={styles.legend}>
            {Object.entries(STATUS).map(([key, s]) => {
              const Icon = s.icon;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(filter === key ? "all" : key)}
                  style={{
                    ...styles.legendChip,
                    borderColor: filter === key ? s.color : "#e4dacb",
                    background: filter === key ? `${s.color}14` : "transparent",
                  }}
                >
                  <Icon size={14} color={s.color} strokeWidth={2.3} />
                  <span style={{ color: "#4a3f34" }}>{s.label}</span>
                  <span style={{ color: "#8a7a6d", fontVariantNumeric: "tabular-nums" }}>
                    {counts[key]}
                  </span>
                </button>
              );
            })}
            {filter !== "all" && (
              <button onClick={() => setFilter("all")} style={styles.clearFilter}>
                Show all
              </button>
            )}
          </div>
        </div>
      </header>

      {/* List */}
      <main style={styles.main}>
        {visibleGrouped.length === 0 && (
          <div style={styles.empty}>Nothing here yet — change your filter to see more stops.</div>
        )}

        {visibleGrouped.map(([area, list]) => {
          const collapsed = collapsedAreas[area];
          const areaVisited = list.filter((r) => (statuses[r.id] || "todo") === "visited").length;
          return (
            <section key={area} style={styles.areaBlock}>
              <button style={styles.areaHeader} onClick={() => toggleArea(area)}>
                <ChevronDown
                  size={16}
                  strokeWidth={2.5}
                  color="#8a5a3c"
                  style={{
                    transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                />
                <MapPin size={14} color="#8a5a3c" strokeWidth={2.3} style={{ flexShrink: 0 }} />
                <span style={styles.areaTitle}>{area}</span>
                <span style={styles.areaCount}>
                  {areaVisited}/{list.length}
                </span>
              </button>

              {!collapsed && (
                <div>
                  {list.map((r) => {
                    const status = statuses[r.id] || "todo";
                    const s = STATUS[status];
                    const Icon = s.icon;
                    const noteVal = notes[r.id] || "";
                    return (
                      <div key={r.id} style={styles.row}>
                        <button
                          className="rowbtn"
                          onClick={() => cycleStatus(r.id)}
                          style={styles.checkBtn}
                          title="Click to cycle status"
                        >
                          <span key={status} className={status === "visited" ? "stamp-enter" : ""}>
                            <Icon size={22} color={s.color} strokeWidth={2.2} />
                          </span>
                        </button>

                        <div style={styles.rowBody}>
                          <div style={styles.rowTop}>
                            <span
                              style={{
                                ...styles.rowName,
                                textDecoration: status === "skip" ? "line-through" : "none",
                                color: status === "skip" ? "#a89985" : "#2c2418",
                              }}
                            >
                              {r.name}
                            </span>
                            <span style={styles.typeTag}>{r.type}</span>
                          </div>
                          <div style={styles.rowMeta}>
                            <Clock size={12} color="#a08d6f" strokeWidth={2.2} />
                            <span>{r.time}</span>
                          </div>
                          {r.note && <div style={styles.rowNoteHint}>{r.note}</div>}

                          <button
                            style={styles.noteToggle}
                            onClick={() => setOpenNote(openNote === r.id ? null : r.id)}
                          >
                            <StickyNote size={12} strokeWidth={2.2} />
                            {noteVal ? "Edit your notes" : "Add survey notes"}
                          </button>

                          {openNote === r.id && (
                            <textarea
                              autoFocus
                              value={noteVal}
                              onChange={(e) =>
                                setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              placeholder="Who did you talk to? What did they say about ordering/wait tech, POS, would they use an AI survey tool..."
                              style={styles.textarea}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>

      <footer style={styles.footer}>
        {isFirebaseConfigured
          ? "Progress saves to this browser instantly and syncs to your Google account when signed in, so it follows you across devices."
          : "Progress saves in this browser automatically. Sign-in sync isn't configured yet — see src/firebaseConfig.js."}
      </footer>
    </div>
  );
}

function SyncIndicator({ state }) {
  const map = {
    unconfigured: { icon: CloudOff, label: "Local only", color: "#a08d6f" },
    local: { icon: CloudOff, label: "Signed out — local only", color: "#a08d6f" },
    syncing: { icon: Loader2, label: "Syncing…", color: "#8a5a3c", spin: true },
    synced: { icon: Cloud, label: "Synced", color: "#6b7c4f" },
    error: { icon: CloudOff, label: "Sync error", color: "#b5583f" },
    idle: { icon: Cloud, label: "Connected", color: "#6b7c4f" },
  };
  const cfg = map[state] || map.idle;
  const Icon = cfg.icon;
  return (
    <span style={styles.syncBadge}>
      <Icon size={12} strokeWidth={2.3} color={cfg.color} className={cfg.spin ? "spin" : ""} />
      <span style={{ color: cfg.color }}>{cfg.label}</span>
    </span>
  );
}

// ---- Styles --------------------------------------------------------------

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f0e4",
    fontFamily: "'Be Vietnam Pro', sans-serif",
    color: "#2c2418",
    paddingBottom: 48,
  },
  header: {
    background: "linear-gradient(180deg, #3f2e22 0%, #4a3626 100%)",
    color: "#f6f0e4",
    padding: "36px 20px 28px",
  },
  headerInner: { maxWidth: 640, margin: "0 auto" },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#c9a876",
    fontWeight: 600,
  },
  authBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    borderRadius: 999,
    border: "1.5px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.06)",
    color: "#e0d2ba",
    fontSize: 11.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  h1: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: "clamp(28px, 7vw, 38px)",
    lineHeight: 1.1,
    margin: "0 0 10px",
    letterSpacing: "-0.01em",
  },
  sub: {
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "#e0d2ba",
    margin: "0 0 22px",
    maxWidth: 520,
  },
  progressWrap: { marginBottom: 18 },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #c9a876, #e8c48a)",
    borderRadius: 999,
    transition: "width 0.4s ease",
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 12.5,
    color: "#c9bba3",
    fontVariantNumeric: "tabular-nums",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  syncBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11.5,
    fontWeight: 600,
  },
  legend: { display: "flex", flexWrap: "wrap", gap: 8 },
  legendChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 11px",
    borderRadius: 999,
    border: "1.5px solid",
    background: "rgba(255,255,255,0.9)",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  clearFilter: {
    padding: "6px 11px",
    borderRadius: 999,
    border: "1.5px dashed #c9bba3",
    background: "transparent",
    color: "#e0d2ba",
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  main: { maxWidth: 640, margin: "0 auto", padding: "22px 20px 0" },
  empty: {
    textAlign: "center",
    color: "#a08d6f",
    padding: "40px 0",
    fontSize: 14,
  },
  areaBlock: {
    marginBottom: 18,
    background: "#fffdf8",
    border: "1px solid #e8ddc9",
    borderRadius: 14,
    overflow: "hidden",
  },
  areaHeader: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "13px 16px",
    background: "#f0e6d2",
    border: "none",
    borderBottom: "1px solid #e8ddc9",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
  },
  areaTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#5a4530",
    letterSpacing: "0.01em",
    flex: 1,
  },
  areaCount: {
    fontSize: 12,
    color: "#8a7a6d",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  row: {
    display: "flex",
    gap: 12,
    padding: "14px 16px",
    borderBottom: "1px solid #f0e9db",
  },
  checkBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginTop: 1,
    flexShrink: 0,
    display: "flex",
    alignItems: "flex-start",
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: {
    display: "flex",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 3,
  },
  rowName: { fontSize: 15, fontWeight: 600 },
  typeTag: {
    fontSize: 10.5,
    color: "#8a5a3c",
    background: "#f3e4d0",
    borderRadius: 999,
    padding: "2px 8px",
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  rowMeta: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12.5,
    color: "#8a7a6d",
    marginBottom: 4,
  },
  rowNoteHint: {
    fontSize: 12,
    color: "#a08d6f",
    fontStyle: "italic",
    marginBottom: 6,
  },
  noteToggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "none",
    border: "none",
    color: "#8a5a3c",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "3px 0",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    minHeight: 64,
    marginTop: 6,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #e0d2ba",
    background: "#faf6ec",
    fontFamily: "inherit",
    fontSize: 13,
    color: "#3a2f22",
    resize: "vertical",
  },
  footer: {
    maxWidth: 640,
    margin: "24px auto 0",
    padding: "0 20px",
    fontSize: 11.5,
    color: "#a08d6f",
    textAlign: "center",
  },
};

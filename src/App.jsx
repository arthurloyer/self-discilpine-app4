import React, { useEffect, useState } from "react";

// --- Utils ---
const cls = (...arr) => arr.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0, 10);

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw
        ? JSON.parse(raw)
        : typeof initial === "function"
        ? initial()
        : initial;
    } catch {
      return typeof initial === "function" ? initial() : initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

// --- UI Components ---
const Card = ({ className, children }) => (
  <div className={cls("rounded-2xl shadow-md p-4 md:p-6 bg-white", className)}>
    {children}
  </div>
);

const H2 = ({ children }) => (
  <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-3">
    {children}
  </h2>
);

const Label = ({ children }) => (
  <label className="text-sm font-medium text-gray-700">{children}</label>
);

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={cls(
      "w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring",
      className
    )}
  />
);

const Button = ({ className = "", ...props }) => (
  <button
    {...props}
    className={cls(
      "px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 active:scale-[.98] transition",
      className
    )}
  />
);

// --- Tabs ---
const tabs = [
  "Dashboard",
  "Hydratation",
  "Musculation",
  "Nutrition",
  "Sommeil",
  "Lookmaxing",
  "Notes",
];

export default function App() {
  const [tab, setTab] = useLocalState("app.tab", "Dashboard");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-black text-white grid place-items-center font-bold">
              ∆
            </div>
            <div className="font-semibold">Self-Discipline</div>
          </div>
          <div className="hidden md:flex gap-2">
            {tabs.map((t) => (
              <Button
                key={t}
                onClick={() => setTab(t)}
                className={cls(
                  tab === t && "bg-black text-white border-black"
                )}
              >
                {t}
              </Button>
            ))}
          </div>
          <div className="md:hidden">
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              className="border rounded-xl px-3 py-2"
            >
              {tabs.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid gap-6">
        {tab === "Dashboard" && <Dashboard />}
        {tab === "Hydratation" && <Hydration />}
        {tab === "Musculation" && <Musculation />}
        {tab === "Nutrition" && <Nutrition />}
        {tab === "Sommeil" && <Sommeil />}
        {tab === "Lookmaxing" && <Lookmaxing />}
        {tab === "Notes" && <Notes />}
      </main>
    </div>
  );
}

// --- Hydratation ---
function Hydration() {
  const [goalMl, setGoalMl] = useLocalState("hydr.goal", 2500);
  const [logsByDay, setLogsByDay] = useLocalState("hydr.logs", {});
  const day = todayKey();
  const ml = logsByDay[day]?.ml ?? 0;
  const pct = Math.min(100, Math.round((ml / (goalMl || 1)) * 100));

  function add(amount) {
    setLogsByDay((prev) => {
      const next = { ...prev };
      const d = next[day] ?? { ml: 0 };
      d.ml = Math.max(0, d.ml + amount);
      next[day] = d;
      return next;
    });
  }

  return (
    <Card>
      <H2>Hydratation</H2>
      <p className="text-sm text-gray-600 mb-3">
        Objectif : {goalMl} mL — Aujourd’hui : {ml} mL
      </p>
      <div className="flex gap-2">
        {[250, 500, 750].map((a) => (
          <Button key={a} onClick={() => add(a)}>
            +{a} mL
          </Button>
        ))}
      </div>
      <div className="mt-3 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-black"
          style={{ width: pct + "%" }}
        />
      </div>
    </Card>
  );
}

// --- Musculation ---
function Musculation() {
  const [sessions, setSessions] = useLocalState("muscu.sessions", []);
  const [newSession, setNewSession] = useState("");
  const [rest, setRest] = useState(0);

  function addSession() {
    if (!newSession.trim()) return;
    setSessions([...sessions, { name: newSession.trim(), done: false }]);
    setNewSession("");
  }

  function toggle(i) {
    setSessions(
      sessions.map((s, idx) =>
        idx === i ? { ...s, done: !s.done } : s
      )
    );
  }

  function startRest(sec = 60) {
    setRest(sec);
    const timer = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          clearInterval(timer);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  return (
    <Card>
      <H2>Musculation</H2>
      <div className="flex gap-2 mb-3">
        <Input
          value={newSession}
          onChange={(e) => setNewSession(e.target.value)}
          placeholder="Ajouter un exercice..."
        />
        <Button onClick={addSession} className="bg-black text-white">
          +
        </Button>
      </div>
      <ul className="space-y-2">
        {sessions.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.done}
              onChange={() => toggle(i)}
            />
            <span
              className={cls(s.done && "line-through text-gray-400")}
            >
              {s.name}
            </span>
          </li>
        ))}
      </ul>
      {rest > 0 ? (
        <p className="mt-4 text-center">Repos : {rest}s</p>
      ) : (
        <div className="mt-4 flex gap-2">
          {[30, 60, 90].map((t) => (
            <Button
              key={t}
              onClick={() => startRest(t)}
              className="bg-gray-200"
            >
              {t}s
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}

// --- Nutrition ---
function Nutrition() {
  const [goal, setGoal] = useLocalState("nut.goal", {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 60,
  });
  const [log, setLog] = useLocalState("nut.log", []);
  const [food, setFood] = useState("");

  function addFood() {
    if (!food.trim()) return;
    setLog([...log, { text: food.trim() }]);
    setFood("");
  }

  return (
    <Card>
      <H2>Nutrition</H2>
      <p className="text-sm text-gray-600">
        Objectif : {goal.calories} kcal, {goal.protein}g protéines
      </p>
      <div className="flex gap-2 mt-2">
        <Input
          value={food}
          onChange={(e) => setFood(e.target.value)}
          placeholder="Ajouter un aliment..."
        />
        <Button onClick={addFood} className="bg-black text-white">
          +
        </Button>
      </div>
      <ul className="mt-3 list-disc pl-5 text-sm">
        {log.map((f, i) => (
          <li key={i}>{f.text}</li>
        ))}
      </ul>
    </Card>
  );
}

// --- Sommeil ---
function Sommeil() {
  const [hours, setHours] = useLocalState("sleep.goal", 8);
  const [sleep, setSleep] = useLocalState("sleep.log", {});

  const day = todayKey();
  const got = sleep[day]?.h ?? 0;

  function add(h) {
    setSleep({ ...sleep, [day]: { h } });
  }

  return (
    <Card>
      <H2>Sommeil</H2>
      <p className="text-sm text-gray-600 mb-2">
        Objectif : {hours}h / Nuit
      </p>
      <div className="flex gap-2">
        {[6, 7, 8, 9].map((h) => (
          <Button key={h} onClick={() => add(h)}>
            {h}h
          </Button>
        ))}
      </div>
      <p className="mt-3">
        Aujourd’hui : {got}h {got >= hours ? "✅" : "❌"}
      </p>
    </Card>
  );
}

// --- Lookmaxing ---
function Lookmaxing() {
  const [tasks, setTasks] = useLocalState("look.tasks", [
    "Chin tucks",
    "Neck curls",
    "Posture",
  ]);
  const [done, setDone] = useLocalState("look.done", {});

  const day = todayKey();
  const today = done[day] || {};

  function toggle(t) {
    const copy = { ...done };
    copy[day] = { ...today, [t]: !today[t] };
    setDone(copy);
  }

  return (
    <Card>
      <H2>Lookmaxing</H2>
      <ul className="space-y-2">
        {tasks.map((t, i) => (
          <li key={i} className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={today[t] || false}
              onChange={() => toggle(t)}
            />
            <span
              className={cls(today[t] && "line-through text-gray-400")}
            >
              {t}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// --- Notes ---
function Notes() {
  const cats = ["À faire", "À acheter", "Idées"];
  const [active, setActive] = useLocalState("notes.active", cats[0]);
  const [itemsByCat, setItemsByCat] = useLocalState("notes.items", {});
  const [newItem, setNewItem] = useState("");

  function addItem() {
    if (!newItem.trim()) return;
    setItemsByCat((prev) => {
      const next = { ...prev };
      next[active] = [
        ...(next[active] || []),
        {
          id: Math.random().toString(36).slice(2),
          text: newItem.trim(),
          done: false,
        },
      ];
      return next;
    });
    setNewItem("");
  }

  function toggle(id) {
    setItemsByCat((prev) => {
      const next = { ...prev };
      next[active] = next[active].map((it) =>
        it.id === id ? { ...it, done: !it.done } : it
      );
      return next;
    });
  }

  return (
    <Card>
      <H2>Notes</H2>
      <div className="flex gap-2 mb-3">
        {cats.map((c) => (
          <Button
            key={c}
            onClick={() => setActive(c)}
            className={cls(active === c && "bg-black text-white border-black")}
          >
            {c}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Ajouter à "${active}"...`}
        />
        <Button onClick={addItem} className="bg-black text-white">
          +
        </Button>
      </div>
      <ul className="space-y-2">
        {(itemsByCat[active] || []).map((it) => (
          <li key={it.id} className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={it.done}
              onChange={() => toggle(it.id)}
            />
            <span
              className={cls(it.done && "line-through text-gray-400")}
            >
              {it.text}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// --- Dashboard ---
function Dashboard() {
  const day = todayKey();
  const hydrLogs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const hydrGoal = JSON.parse(localStorage.getItem("hydr.goal") || "2500");
  const ml = hydrLogs[day]?.ml ?? 0;
  const hydrDone = ml >= hydrGoal;

  const notes = JSON.parse(localStorage.getItem("notes.items") || "{}");
  const notesDone = Object.values(notes).some(
    (list) => (list || []).length > 0
  );

  const look = JSON.parse(localStorage.getItem("look.done") || "{}");
  const lookToday = look[day] || {};
  const lookDone = Object.values(lookToday).some((v) => v);

  const sleep = JSON.parse(localStorage.getItem("sleep.log") || "{}");
  const goalSleep = JSON.parse(localStorage.getItem("sleep.goal") || "8");
  const sleepH = sleep[day]?.h ?? 0;
  const sleepDone = sleepH >= goalSleep;

  const score =
    (hydrDone ? 20 : 0) +
    (notesDone ? 20 : 0) +
    (lookDone ? 20 : 0) +
    (sleepDone ? 20 : 0);

  return (
    <Card>
      <H2>Dashboard</H2>
      <p className="text-lg font-semibold mb-2">
        Score du jour : {score}/100
      </p>
      <ul className="list-disc pl-5 text-sm">
        <li>Hydratation : {hydrDone ? "✅ OK" : "❌ Pas atteint"}</li>
        <li>Sommeil : {sleepDone ? "✅ OK" : "❌ Pas atteint"}</li>
        <li>Notes : {notesDone ? "✅ OK" : "❌ Vide"}</li>
        <li>Lookmaxing : {lookDone ? "✅ OK" : "❌ Pas encore"}</li>
      </ul>
    </Card>
  );
}

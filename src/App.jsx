import React, { useEffect, useState } from "react";

// petite fonction utilitaire pour fusionner les classes
const cls = (...arr) => arr.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0, 10);

// Hook custom pour stocker en localStorage
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

// composants UI de base
const Card = ({ className, children }) => (
  <div
    className={cls(
      "rounded-2xl shadow-md p-4 md:p-6 bg-white",
      className
    )}
  >
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

// ✅ composant Button corrigé
const Button = ({ className = "", ...props }) => (
  <button
    {...props}
    className={cls(
      "px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 active:scale-[.98] transition",
      className
    )}
  />
);

const tabs = ["Dashboard", "Hydratation", "Notes"];

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
        {tab === "Notes" && <Notes />}
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">
        MVP – hors ligne, données stockées localement.
      </footer>
    </div>
  );
}

/* ------------ Hydratation ------------- */
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
      <div className="flex items-end gap-4">
        <div className="grow">
          <Label>Objectif (mL)</Label>
          <Input
            type="number"
            min={500}
            step={100}
            value={goalMl}
            onChange={(e) => setGoalMl(parseInt(e.target.value || 0))}
          />
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{ml} mL</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black"
                style={{ width: pct + "%" }}
              />
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          {[250, 500, 750].map((a) => (
            <Button key={a} onClick={() => add(a)}>
              +{a} mL
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* -------------- Notes ---------------- */
function Notes() {
  const defaultCats = ["À faire", "À acheter", "Idées"];
  const [cats] = useLocalState("notes.cats", defaultCats);
  const [active, setActive] = useLocalState("notes.active", defaultCats[0]);
  const [itemsByCat, setItemsByCat] = useLocalState("notes.items", {});
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    setItemsByCat((prev) => {
      const next = { ...prev };
      defaultCats.forEach((c) => {
        if (!next[c]) next[c] = [];
      });
      return next;
    });
  }, []);

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

  function remove(id) {
    setItemsByCat((prev) => {
      const next = { ...prev };
      next[active] = (next[active] || []).filter((it) => it.id !== id);
      return next;
    });
  }

  return (
    <Card>
      <H2>Notes</H2>
      <div className="flex gap-2 overflow-x-auto">
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
      <div className="mt-4 grid gap-2">
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`Ajouter à "${active}"...`}
          />
          <Button
            onClick={addItem}
            className="bg-black text-white border-black"
          >
            Ajouter
          </Button>
        </div>
        <div className="grid gap-2 max-h-72 overflow-auto pr-2">
          {(itemsByCat[active] || []).map((it) => (
            <label
              key={it.id}
              className="flex items-center justify-between border rounded-xl px-3 py-2"
            >
              <span className="flex items-center gap-3">
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
              </span>
              <Button
                className="text-red-600 border-red-400"
                onClick={() => remove(it.id)}
              >
                Suppr
              </Button>
            </label>
          ))}
          {(itemsByCat[active] || []).length === 0 && (
            <div className="text-sm text-gray-500">Aucun élément.</div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ------------- Dashboard ------------- */
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

  const score =
    (hydrDone ? 20 : 0) +
    (notesDone ? 20 : 0) +
    (lookDone ? 20 : 0);

  return (
    <div className="grid gap-6">
      <Card>
        <H2>Dashboard</H2>
        <div className="text-3xl font-bold mb-2">
          Score quotidien : {score}/100
        </div>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            Hydratation :{" "}
            {hydrDone ? "✅ Objectif atteint" : "❌ Pas encore"}
          </li>
          <li>
            Notes : {notesDone ? "✅ Éléments notés" : "❌ Vide"}
          </li>
          <li>
            Lookmaxing :{" "}
            {lookDone ? "✅ Tâches cochées" : "❌ Rien pour l’instant"}
          </li>
        </ul>
      </Card>
    </div>
  );
}

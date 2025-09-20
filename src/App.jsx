import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------- Helpers ---------- */
const cx = (...a) => a.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0, 10);
function useLocalState(key, initial) {
  const [state, set] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (typeof initial === "function" ? initial() : initial);
    } catch { return typeof initial === "function" ? initial() : initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, set];
}
const Card   = ({className, children}) => <div className={cx("rounded-2xl shadow-sm md:shadow-md p-5 md:p-6 bg-white dark:bg-gray-800", className)}>{children}</div>;
const H2     = ({children}) => <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-3">{children}</h2>;
const Label  = ({children}) => <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{children}</label>;
const Input  = ({className="", ...p}) => <input {...p} className={cx("w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring dark:bg-gray-700 dark:border-gray-600", className)} />;
const Button = ({className="", ...p}) => <button {...p} className={cx("px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 active:scale-[.98] transition", className)} />;

/* ---------- App Shell ---------- */
const tabs = ["Dashboard","Hydratation","Musculation","Nutrition","Sommeil","Lookmaxing","Notes","Business"];

export default function App() {
  const [tab, setTab] = useLocalState("app.tab", "Dashboard");
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-black text-white grid place-items-center font-bold">∆</div>
            <div className="font-semibold">Self-Discipline</div>
          </div>
          <div className="hidden md:flex gap-2">
            {tabs.map(t => (
              <Button key={t} onClick={() => setTab(t)} className={cx("whitespace-nowrap", tab===t && "bg-black text-white border-black")}>{t}</Button>
            ))}
          </div>
          <div className="md:hidden">
            <select value={tab} onChange={e=>setTab(e.target.value)} className="border rounded-xl px-3 py-2">
              {tabs.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid gap-6">
        {tab==="Dashboard"   && <Dashboard />}
        {tab==="Hydratation" && <Hydration />}
        {tab==="Musculation" && <Musculation />}
        {tab==="Nutrition"   && <Nutrition />}
        {tab==="Sommeil"     && <Sleep />}
        {tab==="Lookmaxing"  && <Lookmaxing />}
        {tab==="Notes"       && <Notes />}
        {tab==="Business"    && <Business />}
      </main>

      <footer className="py-10 text-center text-xs text-gray-500 dark:text-gray-400">
        MVP — hors ligne, données stockées localement.
      </footer>
    </div>
  );
}

/* ======================= HYDRATATION ======================= */
function Hydration(){
  const [goalMl, setGoalMl] = useLocalState("hydr.goal", 2500);
  const [logsByDay, setLogsByDay] = useLocalState("hydr.logs", {});
  const day = todayKey();
  const ml = logsByDay[day]?.ml ?? 0;
  const pct = Math.min(100, Math.round((ml/(goalMl||1))*100));

  function add(amount){
    setLogsByDay(prev=>{
      const next = {...prev};
      const d = next[day] ?? { ml:0 };
      d.ml = Math.max(0, d.ml + amount);
      next[day] = d;
      return next;
    })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <H2>Hydratation quotidienne</H2>
        <div className="flex items-end gap-4">
          <div className="grow">
            <Label>Objectif (mL)</Label>
            <Input type="number" min={500} step={100} value={goalMl} onChange={e=>setGoalMl(parseInt(e.target.value||0))} />
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1"><span>{ml} mL</span><span>{pct}%</span></div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-black dark:bg-white" style={{width: pct+"%"}} />
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            {[250,330,500,750].map(a => <Button key={a} onClick={()=>add(a)}>{`+${a} mL`}</Button>)}
            <Button className="border-red-500 text-red-600" onClick={()=>add(-250)}>–250 mL</Button>
          </div>
        </div>
      </Card>

      <Card>
        <H2>Historique (7 jours)</H2>
        <SevenDayHydroChart goal={goalMl} logs={logsByDay} />
      </Card>
    </div>
  );
}
function SevenDayHydroChart({ goal, logs }){
  const days = [...Array(7)].map((_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    const key = d.toISOString().slice(0,10);
    return { label: d.toLocaleDateString(undefined,{ weekday:"short"}), ml: logs[key]?.ml ?? 0 };
  });
  return (
    <div className="grid grid-cols-7 gap-2 items-end h-40">
      {days.map(({label,ml},i)=>{
        const pct = Math.min(100, (ml/(goal||1))*100);
        return (
          <div key={i} className="grid gap-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-md h-28 overflow-hidden">
              <div className="bg-black dark:bg-white w-full" style={{height: pct+"%"}} />
            </div>
            <div

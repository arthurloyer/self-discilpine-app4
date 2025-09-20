import React, { useEffect, useState } from "react";

const cls = (...arr) => arr.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0, 10);

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (typeof initial === "function" ? initial() : initial);
    } catch {
      return typeof initial === "function" ? initial() : initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

const Card = ({ className, children }) => (
  <div className={cls("rounded-2xl shadow-md p-4 md:p-6 bg-white", className)}>{children}</div>
);
const H2 = ({ children }) => (
  <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-3">{children}</h2>
);
const Label = ({ children }) => (
  <label className="text-sm font-medium text-gray-700">{children}</label>
);
const Input = ({ className = "", ...props }) => (
  <input {...props} className={cls("w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring", className)} />
);
const Button = ({ className = "", ...props }) => (
  <button {...props} className={cls("px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-1

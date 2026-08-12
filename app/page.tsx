"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

function Shell({
  title,
  subtitle,
  badge = "Portfolio demo · local-only",
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{badge}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </header>
        {children}
        <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
          Honest demo: no multi-tenant backend. State (if any) stays in this browser.
        </footer>
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 " +
    className;
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      : variant === "secondary"
        ? "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-500"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);
  return [value, setValue] as const;
}

function uid() {
  return crypto.randomUUID();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}


type Item = { id: string; title: string; body: string; status: string; createdAt: number };

const SEED: Item[] = [{"title": "Discord", "body": "Daily standups", "status": "Active"}].map((x: any, i: number) => ({
  id: String(x.id ?? i + 1),
  title: x.title,
  body: x.body,
  status: x.status,
  createdAt: x.createdAt ?? Date.now() - i * 86400000,
}));

const FIELDS = [{"key": "title", "label": "Title", "type": "text"}, {"key": "body", "label": "Details", "type": "textarea"}, {"key": "status", "label": "Status", "type": "select", "options": ["Draft", "Active", "Done"]}] as { key: "title" | "body" | "status"; label: string; type: string; options?: string[] }[];

export default function Home() {
  const [items, setItems] = useLocalStorage<Item[]>("community-v1", SEED);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, f.options?.[0] ?? ""]))
  );

  const filtered = items.filter((it) =>
    (it.title + it.body + it.status).toLowerCase().includes(query.toLowerCase())
  );

  const add = () => {
    if (!String(draft.title || "").trim()) return;
    setItems((prev) => [
      {
        id: uid(),
        title: draft.title || "",
        body: draft.body || "",
        status: draft.status || "",
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setDraft(Object.fromEntries(FIELDS.map((f) => [f.key, f.options?.[0] ?? ""])));
  };

  return (
    <Shell title="Community Hub" subtitle="Channels and community resources.">
      <div className="mb-4 flex flex-wrap gap-2">
        <input className={`${inputClass} max-w-sm`} placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <span className="self-center text-sm text-zinc-500">{filtered.length} items</span>
      </div>
      <div className="mb-6 grid gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="block space-y-1">
            <span className="text-xs font-medium text-zinc-500">{f.label}</span>
            {f.type === "textarea" ? (
              <textarea
                className={`${inputClass} min-h-[72px]`}
                value={draft[f.key] || ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              />
            ) : f.type === "select" ? (
              <select
                className={inputClass}
                value={draft[f.key] || ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              >
                {(f.options || []).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                className={inputClass}
                value={draft[f.key] || ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              />
            )}
          </label>
        ))}
        <div className="md:col-span-2">
          <Button onClick={add}>Add</Button>
        </div>
      </div>
      <ul className="space-y-2">
        {filtered.map((it) => (
          <li key={it.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-medium">{it.title}</div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{it.body}</p>
                <span className="mt-2 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-900">{it.status}</span>
              </div>
              <Button variant="ghost" onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

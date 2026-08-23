"use client";

import { useEffect, useMemo, useState } from "react";
type IconName = "arrow" | "compass" | "external" | "plus" | "search" | "x";
function Icon({ name, size = 15 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string> = {
    arrow: "M5 12h13 M13 6l6 6-6 6",
    compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M15.5 8.5l-2 5-5 2 2-5 5-2Z",
    external: "M14 5h5v5 M19 5l-8 8 M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5",
    plus: "M12 5v14 M5 12h14",
    search: "m21 21-4.3-4.3 M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
    x: "M6 6l12 12 M18 6 6 18",
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

type Status = "Draft" | "Active" | "Done";
type Channel = { id: string; title: string; body: string; status: Status; createdAt: number };
const seed: Channel[] = [{ id: "channel-01", title: "Discord", body: "Daily standups", status: "Active", createdAt: 1710000000000 }];

function useChannels() {
  const [channels, setChannels] = useState<Channel[]>(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem("community-v1"); if (saved) setChannels(JSON.parse(saved) as Channel[]); } catch { /* keep seed */ } setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem("community-v1", JSON.stringify(channels)); }, [channels, ready]);
  return [channels, setChannels] as const;
}

export default function Home() {
  const [channels, setChannels] = useChannels();
  const [selectedId, setSelectedId] = useState("channel-01");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>("Draft");
  const filtered = useMemo(() => channels.filter((channel) => `${channel.title} ${channel.body} ${channel.status}`.toLowerCase().includes(query.toLowerCase())), [channels, query]);
  const selected = filtered.find((channel) => channel.id === selectedId) ?? filtered[0] ?? null;
  const addChannel = () => { if (!title.trim()) return; const channel = { id: `channel-${Date.now()}`, title: title.trim(), body: body.trim() || "No description yet.", status, createdAt: Date.now() }; setChannels((current) => [channel, ...current]); setSelectedId(channel.id); setTitle(""); setBody(""); setStatus("Draft"); setShowAdd(false); };

  return (
    <main className="community-shell">
      <header className="community-topbar"><a className="community-brand" href="/"><Icon name="compass" size={17} /><span>FIELD NOTES / COMMUNITY</span></a><span className="community-status"><i /> LOCAL DIRECTORY</span></header>
      <section className="community-hero"><div><p className="community-kicker">COMMUNITY HUB / 01</p><h1>Keep the rooms<br /><em>easy to find.</em></h1><p className="community-lede">A calm directory for the channels and resources that keep a solo practice in motion.</p></div><div className="community-hero-orbit" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-core" /></div></section>
      <section className="community-directory" aria-label="Community directory">
        <aside className="community-index"><div className="community-index-head"><span>CHANNEL INDEX</span><b>{filtered.length.toString().padStart(2, "0")}</b></div><label className="community-search"><Icon name="search" size={15} /><span className="sr-only">Search channels</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms" /></label><nav className="community-list" aria-label="Channels">{filtered.map((channel, index) => <button key={channel.id} className={selected?.id === channel.id ? "is-selected" : ""} onClick={() => setSelectedId(channel.id)} type="button"><span className="community-list-number">0{index + 1}</span><span className="community-list-copy"><strong>{channel.title}</strong><small>{channel.body}</small></span><span className={`community-dot dot-${channel.status.toLowerCase()}`} /></button>)}{filtered.length === 0 ? <p className="community-empty">No room found.</p> : null}</nav><button className="community-add-trigger" type="button" onClick={() => setShowAdd((value) => !value)}>{showAdd ? <Icon name="x" size={15} /> : <Icon name="plus" size={15} />} {showAdd ? "Close form" : "Add a room"}</button></aside>
        <div className="community-room">{selected ? <><div className="community-room-head"><span className={`community-room-status dot-${selected.status.toLowerCase()}`} /> <span>{selected.status.toUpperCase()} / LOCAL ENTRY</span><span className="community-room-id">{selected.id}</span></div><h2>{selected.title}</h2><p className="community-room-body">{selected.body}</p><div className="community-room-actions"><a href="#" onClick={(event) => event.preventDefault()}>Open channel <Icon name="arrow" size={15} /></a><button type="button" onClick={() => setChannels((current) => current.filter((channel) => channel.id !== selected.id))}>Remove entry <Icon name="x" size={15} /></button></div><div className="community-room-foot"><span>Added {new Date(selected.createdAt).toLocaleDateString("en-GB")}</span><span>Browser-local state</span></div></> : <div className="community-empty-room">Select a room from the index.</div>}</div>
        {showAdd ? <form className="community-add-form" onSubmit={(event) => { event.preventDefault(); addChannel(); }}><div className="community-form-head"><span>NEW ROOM</span><Icon name="plus" size={16} /></div><label><span>NAME</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Research circle" autoFocus /></label><label><span>WHAT HAPPENS HERE</span><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="A short description" /></label><label><span>STATE</span><select value={status} onChange={(event) => setStatus(event.target.value as Status)}><option>Draft</option><option>Active</option><option>Done</option></select></label><button type="submit">Save to directory <Icon name="external" size={14} /></button></form> : null}
      </section>
      <footer className="community-footer"><span>COMMUNITY HUB / RESOURCE DIRECTORY</span><span>NO MEMBERSHIP CLAIMS / NO SYNC</span></footer>
    </main>
  );
}

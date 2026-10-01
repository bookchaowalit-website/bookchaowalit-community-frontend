"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MAX_BODY, MAX_TITLE, SEED, STATUSES, STORAGE_KEY, createChannel, exportChannels, filterChannels, importChannels, parseStoredChannels, setStatus } from "@/lib/channels";
import type { Channel, Status } from "@/lib/channels";

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

function useChannels() {
  const [channels, setChannels] = useState<Channel[]>(SEED);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = parseStoredChannels(localStorage.getItem(STORAGE_KEY));
      // Hydrate browser-local entries after the server-rendered seed.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setChannels(saved);
    } catch { /* storage blocked: keep seed */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(channels)); } catch { /* storage full or blocked */ }
  }, [channels, ready]);
  return [channels, setChannels] as const;
}

export default function Home() {
  const [channels, setChannels] = useChannels();
  const [selectedId, setSelectedId] = useState("channel-01");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [status, setNewStatus] = useState<Status>("Draft");
  const [formError, setFormError] = useState("");
  const [backupNotice, setBackupNotice] = useState("");
  const exportJson = () => {
    const href = URL.createObjectURL(new Blob([exportChannels(channels)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "community-directory.json";
    anchor.click();
    URL.revokeObjectURL(href);
    setBackupNotice(`Exported ${channels.length} ${channels.length === 1 ? "room" : "rooms"}.`);
  };
  const importJson = async (file: File | undefined) => {
    if (!file) return;
    const result = importChannels(channels, await file.text());
    if ("error" in result) { setBackupNotice(result.error); return; }
    setChannels(result.channels);
    setBackupNotice(`Imported ${result.added} new ${result.added === 1 ? "room" : "rooms"}${result.skipped ? `, skipped ${result.skipped} (already here or invalid)` : ""}.`);
  };
  const filtered = useMemo(() => filterChannels(channels, query), [channels, query]);
  const selected = filtered.find((channel) => channel.id === selectedId) ?? filtered[0] ?? null;
  const addChannel = () => {
    const result = createChannel({ title, body, status, url }, Date.now());
    if ("error" in result) { setFormError(result.error); return; }
    setChannels((current) => [result.channel, ...current]);
    setSelectedId(result.channel.id);
    setTitle(""); setBody(""); setUrl(""); setNewStatus("Draft"); setFormError(""); setShowAdd(false);
  };

  return (
    <main className="community-shell">
      <header className="community-topbar"><Link className="community-brand" href="/"><Icon name="compass" size={17} /><span>FIELD NOTES / COMMUNITY</span></Link><span className="community-status"><i /> LOCAL DIRECTORY</span></header>
      <section className="community-hero"><div><p className="community-kicker">COMMUNITY HUB / 01</p><h1>Keep the rooms<br /><em>easy to find.</em></h1><p className="community-lede">A calm directory for the channels and resources that keep a solo practice in motion.</p></div><div className="community-hero-orbit" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-core" /></div></section>
      <section className="community-directory" aria-label="Community directory">
        <aside className="community-index"><div className="community-index-head"><span>CHANNEL INDEX</span><b>{filtered.length.toString().padStart(2, "0")}</b></div><label className="community-search"><Icon name="search" size={15} /><span className="sr-only">Search channels</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms" /></label><nav className="community-list" aria-label="Channels">{filtered.map((channel, index) => <button key={channel.id} className={selected?.id === channel.id ? "is-selected" : ""} aria-current={selected?.id === channel.id ? "true" : undefined} onClick={() => setSelectedId(channel.id)} type="button"><span className="community-list-number">0{index + 1}</span><span className="community-list-copy"><strong>{channel.title}</strong><small>{channel.body}</small></span><span className={`community-dot dot-${channel.status.toLowerCase()}`} aria-hidden="true" /><span className="sr-only">, {channel.status}</span></button>)}{filtered.length === 0 ? <p className="community-empty">No room found.</p> : null}</nav><button className="community-add-trigger" type="button" aria-expanded={showAdd} aria-controls="community-add-form" onClick={() => setShowAdd((value) => !value)}>{showAdd ? <Icon name="x" size={15} /> : <Icon name="plus" size={15} />} {showAdd ? "Close form" : "Add a room"}</button><div className="community-backup"><button type="button" onClick={exportJson}>Export JSON</button><label><span>Import JSON</span><input type="file" accept="application/json,.json" onChange={(event) => { void importJson(event.target.files?.[0]); event.target.value = ""; }} /></label><p role="status">{backupNotice}</p></div></aside>
        <div className="community-room">{selected ? <><div className="community-room-head"><span className={`community-room-status dot-${selected.status.toLowerCase()}`} aria-hidden="true" /> <span>{selected.status.toUpperCase()} / LOCAL ENTRY</span><span className="community-room-id">{selected.id}</span></div><h2>{selected.title}</h2><p className="community-room-body">{selected.body}</p><div className="community-room-actions">{selected.url ? <a href={selected.url} target="_blank" rel="noopener noreferrer">Open channel <Icon name="arrow" size={15} /><span className="sr-only"> (opens in a new tab)</span></a> : <span className="community-no-link">No link saved</span>}<label className="community-status-select"><span className="sr-only">Status for {selected.title}</span><select value={selected.status} onChange={(event) => setChannels((current) => setStatus(current, selected.id, event.target.value as Status))}>{STATUSES.map((option) => <option key={option}>{option}</option>)}</select></label><button type="button" onClick={() => setChannels((current) => current.filter((channel) => channel.id !== selected.id))}>Remove entry <Icon name="x" size={15} /></button></div><div className="community-room-foot"><span>Added {new Date(selected.createdAt).toLocaleDateString("en-GB")}</span><span>Browser-local state</span></div></> : <div className="community-empty-room">Select a room from the index.</div>}</div>
        {showAdd ? <form id="community-add-form" className="community-add-form" noValidate onSubmit={(event) => { event.preventDefault(); addChannel(); }}><div className="community-form-head"><span>NEW ROOM</span><Icon name="plus" size={16} /></div><label><span>NAME</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Research circle" maxLength={MAX_TITLE} required autoFocus /></label><label><span>WHAT HAPPENS HERE</span><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="A short description" maxLength={MAX_BODY} /></label><label><span>LINK (OPTIONAL)</span><input type="url" inputMode="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" /></label><label><span>STATE</span><select value={status} onChange={(event) => setNewStatus(event.target.value as Status)}>{STATUSES.map((option) => <option key={option}>{option}</option>)}</select></label>{formError ? <p className="community-form-error" role="alert">{formError}</p> : null}<button type="submit">Save to directory <Icon name="plus" size={14} /></button></form> : null}
      </section>
      <footer className="community-footer"><span>COMMUNITY HUB / RESOURCE DIRECTORY</span><span>NO MEMBERSHIP CLAIMS / NO SYNC</span></footer>
    </main>
  );
}

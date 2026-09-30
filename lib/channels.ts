/** Browser-local community directory model (pure, unit-tested). */

export const STATUSES = ["Draft", "Active", "Done"] as const;
export type Status = (typeof STATUSES)[number];

export interface Channel {
  id: string;
  title: string;
  body: string;
  status: Status;
  createdAt: number;
  /** Optional https/http link to the room (Discord invite, forum, ...). */
  url?: string;
}

export const STORAGE_KEY = "community-v1";
export const MAX_TITLE = 80;
export const MAX_BODY = 280;

export const SEED: Channel[] = [
  { id: "channel-01", title: "Discord", body: "Daily standups", status: "Active", createdAt: 1710000000000 },
];

/** Accept only absolute http(s) URLs; returns the normalised URL or null. */
export function sanitizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Largest timestamp a JS Date can represent (Date(1e20) is "Invalid Date"). */
const MAX_DATE_MS = 8.64e15;

/** A stored timestamp the page can render, or 0 ("unknown"). */
export function safeTimestamp(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= MAX_DATE_MS ? value : 0;
}

/** Cut to `max` UTF-16 units without leaving half of a surrogate pair (emoji) behind. */
export function clipText(value: string, max: number): string {
  if (value.length <= max) return value;
  const end = /[\uD800-\uDBFF]/.test(value[max - 1]) ? max - 1 : max;
  return value.slice(0, end);
}

/** JSON.parse that tolerates the UTF-8 BOM some editors (Windows Notepad) prepend. */
function parseJson(raw: string): unknown {
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}

function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

/** Validate saved JSON; drops malformed entries instead of crashing the page. */
export function parseStoredChannels(raw: string | null): Channel[] | null {
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = parseJson(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const channels: Channel[] = [];
  const seen = new Set<string>();
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) continue;
    const { id, title, body, status, createdAt, url } = entry as Record<string, unknown>;
    if (typeof id !== "string" || !id || seen.has(id)) continue;
    if (typeof title !== "string" || !title.trim()) continue;
    const channel: Channel = {
      id,
      title: clipText(title, MAX_TITLE),
      body: typeof body === "string" ? clipText(body, MAX_BODY) : "",
      status: isStatus(status) ? status : "Draft",
      createdAt: safeTimestamp(createdAt),
    };
    const safeUrl = typeof url === "string" ? sanitizeUrl(url) : null;
    if (safeUrl) channel.url = safeUrl;
    seen.add(id);
    channels.push(channel);
  }
  return channels;
}

export type NewChannelInput = { title: string; body: string; status: Status; url: string };

export function createChannel(input: NewChannelInput, now: number): { channel: Channel } | { error: string } {
  const title = input.title.trim();
  if (!title) return { error: "Give the room a name." };
  if (title.length > MAX_TITLE) return { error: `Keep the name under ${MAX_TITLE} characters.` };
  const body = input.body.trim();
  if (body.length > MAX_BODY) return { error: `Keep the description under ${MAX_BODY} characters.` };
  let url: string | undefined;
  if (input.url.trim()) {
    const safe = sanitizeUrl(input.url);
    if (!safe) return { error: "The link must start with https:// or http://." };
    url = safe;
  }
  const channel: Channel = {
    id: `channel-${now.toString(36)}`,
    title,
    body: body || "No description yet.",
    status: input.status,
    createdAt: now,
  };
  if (url) channel.url = url;
  return { channel };
}

export function filterChannels(channels: readonly Channel[], query: string): Channel[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...channels];
  return channels.filter((channel) =>
    `${channel.title} ${channel.body} ${channel.status} ${channel.url ?? ""}`.toLowerCase().includes(needle),
  );
}

export function setStatus(channels: readonly Channel[], id: string, status: Status): Channel[] {
  return channels.map((channel) => (channel.id === id ? { ...channel, status } : channel));
}

export const EXPORT_VERSION = 1;

/** Serialise the directory for a JSON backup file. */
export function exportChannels(channels: readonly Channel[]): string {
  return JSON.stringify({ app: "community", version: EXPORT_VERSION, channels }, null, 2) + "\n";
}

export type ImportResult = { channels: Channel[]; added: number; skipped: number } | { error: string };

/**
 * Merge a JSON backup into the current directory. Accepts the export envelope
 * or a bare array; entries are validated like stored data, and ids already in
 * the directory are kept as they are (counted as skipped).
 */
export function importChannels(current: readonly Channel[], raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = parseJson(raw);
  } catch {
    return { error: "That file is not valid JSON." };
  }
  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { channels?: unknown }).channels)
      ? (parsed as { channels: unknown[] }).channels
      : null;
  if (!list) return { error: "Expected a community export (an object with a channels list)." };
  const incoming = parseStoredChannels(JSON.stringify(list)) ?? [];
  const known = new Set(current.map((channel) => channel.id));
  const fresh = incoming.filter((channel) => !known.has(channel.id));
  return { channels: [...current, ...fresh], added: fresh.length, skipped: list.length - fresh.length };
}

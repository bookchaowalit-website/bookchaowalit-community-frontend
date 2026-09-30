import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_TITLE, createChannel, exportChannels, filterChannels, importChannels, parseStoredChannels, sanitizeUrl, setStatus } from "../lib/channels.ts";

describe("sanitizeUrl", () => {
  it("accepts http(s) and rejects script or relative links", () => {
    assert.equal(sanitizeUrl(" https://discord.gg/abc "), "https://discord.gg/abc");
    assert.equal(sanitizeUrl("javascript:alert(1)"), null);
    assert.equal(sanitizeUrl("data:text/html,hi"), null);
    assert.equal(sanitizeUrl("/relative"), null);
    assert.equal(sanitizeUrl(""), null);
  });
});

describe("parseStoredChannels", () => {
  it("returns null for missing or corrupt storage", () => {
    assert.equal(parseStoredChannels(null), null);
    assert.equal(parseStoredChannels("{oops"), null);
    assert.equal(parseStoredChannels('{"a":1}'), null);
  });

  it("keeps valid entries and repairs or drops bad ones", () => {
    const stored = JSON.stringify([
      { id: "a", title: "Forum", body: "Weekly", status: "Active", createdAt: 1, url: "https://example.com" },
      { id: "a", title: "Duplicate" },
      { id: "b", title: "Bad status", status: "Archived", url: "javascript:alert(1)" },
      { id: "c", title: "   " },
      "nope",
    ]);
    const channels = parseStoredChannels(stored);
    assert.equal(channels?.length, 2);
    assert.equal(channels?.[0].url, "https://example.com/");
    assert.equal(channels?.[1].status, "Draft");
    assert.equal(channels?.[1].url, undefined);
  });
});

describe("createChannel", () => {
  it("creates a trimmed channel with an optional safe link", () => {
    const result = createChannel({ title: "  Research circle ", body: "", status: "Active", url: "https://x.dev" }, 1000);
    assert.ok("channel" in result);
    if ("channel" in result) {
      assert.equal(result.channel.title, "Research circle");
      assert.equal(result.channel.body, "No description yet.");
      assert.equal(result.channel.url, "https://x.dev/");
    }
  });

  it("rejects empty names, long names, and unsafe links", () => {
    assert.ok("error" in createChannel({ title: " ", body: "", status: "Draft", url: "" }, 1));
    assert.ok("error" in createChannel({ title: "x".repeat(MAX_TITLE + 1), body: "", status: "Draft", url: "" }, 1));
    assert.ok("error" in createChannel({ title: "ok", body: "", status: "Draft", url: "javascript:void 0" }, 1));
  });
});

describe("filter and update", () => {
  const channels = parseStoredChannels(JSON.stringify([
    { id: "a", title: "Discord", body: "Daily standups", status: "Active", createdAt: 1 },
    { id: "b", title: "Forum", body: "Async", status: "Draft", createdAt: 2 },
  ]))!;

  it("filters by text and status", () => {
    assert.deepEqual(filterChannels(channels, "STANDUP").map((c) => c.id), ["a"]);
    assert.deepEqual(filterChannels(channels, "draft").map((c) => c.id), ["b"]);
    assert.equal(filterChannels(channels, "").length, 2);
  });

  it("updates a single channel's status immutably", () => {
    const next = setStatus(channels, "b", "Done");
    assert.equal(next[1].status, "Done");
    assert.equal(channels[1].status, "Draft");
  });
});

describe("export / import", () => {
  const base = [{ id: "a", title: "Discord", body: "", status: "Active" as const, createdAt: 1 }];

  it("round-trips an export without duplicating existing rooms", () => {
    const result = importChannels(base, exportChannels(base));
    assert.ok(!("error" in result));
    assert.deepEqual(result.channels, base);
    assert.equal(result.added, 0);
    assert.equal(result.skipped, 1);
  });

  it("adds new valid rooms, drops unsafe links and malformed entries", () => {
    const raw = JSON.stringify([
      { id: "b", title: "Forum", body: "Q&A", status: "Done", createdAt: 2, url: "javascript:alert(1)" },
      { id: "c", title: "" },
      "junk",
    ]);
    const result = importChannels(base, raw);
    assert.ok(!("error" in result));
    assert.equal(result.added, 1);
    assert.equal(result.skipped, 2);
    const forum = result.channels.find((channel) => channel.id === "b");
    assert.equal(forum?.url, undefined);
    assert.equal(forum?.status, "Done");
  });

  it("explains invalid files", () => {
    assert.deepEqual(importChannels(base, "{nope"), { error: "That file is not valid JSON." });
    assert.ok("error" in importChannels(base, JSON.stringify({ works: [] })));
  });
});

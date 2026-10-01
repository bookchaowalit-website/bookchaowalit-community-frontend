import { MAX_BODY, MAX_TITLE, SEED, STATUSES, createChannel } from "@/lib/channels";
import { optionalString, requireString, respondToMcpRequest } from "@/lib/mcp";
import type { McpTool } from "@/lib/mcp";

const SERVER = { name: "bookchaowalit-community", version: "0.2.0" };

// Directory entries live in each visitor's browser (localStorage), so the
// server can only describe the format and validate a proposed entry.
const TOOLS: McpTool[] = [
  {
    name: "describe_directory",
    description: "Explain where community directory entries are stored and return the built-in seed rooms.",
    inputSchema: { type: "object", properties: {} },
    handler: () => ({
      storage: "browser localStorage (key community-v1); nothing is synced to a server",
      statuses: STATUSES,
      limits: { title: MAX_TITLE, body: MAX_BODY, url: "http(s) only" },
      seed: SEED,
    }),
  },
  {
    name: "validate_room",
    description: "Validate a proposed room (title, optional body, status, url) with the same rules as the add form.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        status: { type: "string", enum: [...STATUSES] },
        url: { type: "string" },
      },
      required: ["title"],
    },
    handler: (args) => {
      const status = optionalString(args, "status") ?? "Draft";
      if (!(STATUSES as readonly string[]).includes(status)) return { valid: false, error: `Unknown status "${status}".` };
      const result = createChannel(
        {
          title: requireString(args, "title"),
          body: optionalString(args, "body") ?? "",
          status: status as (typeof STATUSES)[number],
          url: optionalString(args, "url") ?? "",
        },
        Date.now(),
      );
      return "error" in result ? { valid: false, error: result.error } : { valid: true, room: result.channel };
    },
  },
];

export async function POST(request: Request) {
  return respondToMcpRequest(request, SERVER, TOOLS);
}

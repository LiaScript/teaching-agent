// The one time source for the chat rules (`data/chat-wording.md` → Times): prints UTC, the
// local time of this computer (the one that runs the preview) with its offset and time zone, and – with a
// timestamp, e.g. of the last read_chat entry – the time since it, for the "about an hour" greeting rule.
// Event and read_chat timestamps are UTC; never state a clock time from them, use the local line.
// Run from the course project root: node specs/dashboard/now.mjs [<timestamp>]
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const usage = `Usage: node specs/dashboard/now.mjs [<timestamp>]
  timestamp  optional, ISO 8601 (2026-10-23T09:40:00Z) or milliseconds since 1970, e.g. the time of
             the last read_chat entry: prints the time since it.
Prints UTC, the local time of this computer with its offset, and the time since the timestamp.`;

// A timestamp as Date: ISO 8601 (without a zone it is UTC, as in events and read_chat) or epoch ms/s.
export function parseTimestamp(text) {
  const value = String(text ?? "").trim();
  let date;
  if (/^\d{9,13}$/.test(value)) date = new Date(value.length <= 10 ? Number(value) * 1000 : Number(value));
  else if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/i.test(value)) {
    const zoned = /(Z|[+-]\d{2}:?\d{2})$/i.test(value) || !/[T ]/.test(value) ? value : `${value}Z`;
    date = new Date(zoned.replace(" ", "T"));
  }
  if (!date || Number.isNaN(date.getTime())) throw new Error(`invalid timestamp "${value}" – write ISO 8601 (2026-10-23T09:40:00Z) or milliseconds since 1970`);
  return date;
}

// Local date and time of `date` in `timeZone`, and the offset to UTC in minutes.
export function localTime(date, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
    .formatToParts(date).map(part => [part.type, part.value]));
  const asUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
  const offset = Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
  return { text: `${parts.weekday} ${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`, offset, timeZone };
}

export const formatOffset = minutes => `UTC${minutes < 0 ? "-" : "+"}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, "0")}:${String(Math.abs(minutes) % 60).padStart(2, "0")}`;

// A duration as "45 s", "12 min", "1 h 05 min" or "2 d 3 h".
export function formatDuration(ms) {
  const seconds = Math.floor(Math.abs(ms) / 1000);
  const minutes = Math.floor(seconds / 60);
  if (seconds < 60) return `${seconds} s`;
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`;
  return `${Math.floor(minutes / 1440)} d ${Math.floor((minutes % 1440) / 60)} h`;
}

// The printed lines for `now` (Date), an optional `since` (Date) and a time zone.
export function describeNow(now, since, timeZone) {
  const local = localTime(now, timeZone);
  const lines = [`UTC: ${now.toISOString().replace(/\.\d{3}Z$/, "Z")}`, `Local (this computer): ${local.text} (${formatOffset(local.offset)}, ${local.timeZone})`];
  if (since) {
    const ms = now.getTime() - since.getTime();
    lines.push(ms < 0
      ? `Since ${since.toISOString().replace(/\.\d{3}Z$/, "Z")}: ${formatDuration(ms)} in the future – check the timestamp`
      : `Since ${since.toISOString().replace(/\.\d{3}Z$/, "Z")}: ${formatDuration(ms)} (older than about an hour: ${ms > 60 * 60 * 1000 ? "yes" : "no"})`);
  }
  return lines;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] === "--help" || args[0] === "-h") { console.log(usage); process.exit(0); }
  try {
    if (args.length > 1 || args.some(arg => arg.startsWith("-") && !/^-?\d/.test(arg))) throw new Error(`one optional timestamp only, not ${args.join(" ")}`);
    const lines = describeNow(new Date(), args[0] ? parseTimestamp(args[0]) : null);
    lines.forEach(line => console.log(line));
    console.log("Exit code: 0");
  } catch (error) {
    console.error(`now: ${error.message}\n${usage}`);
    console.log("Exit code: 2");
    process.exit(2);
  }
}

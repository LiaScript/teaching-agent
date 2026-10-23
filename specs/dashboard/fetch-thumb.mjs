// Fetches a thumbnail (at most 500 px wide) of a Wikimedia Commons file into .cache/thumbs/ and
// prints its licence data from the Commons API, so that an agent can look at the photo with its
// file-reading tool and copy author and licence word for word. Downloads only from
// commons.wikimedia.org and upload.wikimedia.org, and writes only inside the current folder.
// Run from the course project root:
//   node specs/dashboard/fetch-thumb.mjs <file page URL | File:Name.jpg | Name.jpg> [--width 330]
// Exit code 0: thumbnail saved · 2: invalid call, file not found, network or download error.
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { resolve, relative, isAbsolute, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const usage = `Usage: node specs/dashboard/fetch-thumb.mjs <file page URL | File:Name.jpg | Name.jpg> [--width n]
  Saves a thumbnail of a Wikimedia Commons file (default 500 px wide; --width 120, 250, 330 or 500) into
  .cache/thumbs/ and prints: thumbnail path, file URL (Special:FilePath, percent-encoded – append
  ?width=330 or ?width=500), original file, author, licence, licence URL and file page.
Exit code 0: thumbnail saved · 2: invalid call, file not found, network or download error.`;

const API = "https://commons.wikimedia.org/w/api.php";
const HOSTS = new Set(["commons.wikimedia.org", "upload.wikimedia.org"]);
const AGENT = "TeachingAgent-fetch-thumb/1.0 (LiaScript course tooling; https://liascript.github.io)";
const TIMEOUT = 20000;
const MAX_BYTES = 5 * 1024 * 1024;

// "(" ")" and spaces percent-encoded: LiaScript ends a link or image target at the first "(".
export const encodeUrl = url => url.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/ /g, "%20");

// The file name with underscores, percent-encoded as a URL path segment (also "(" and ")").
export const encodeName = name => encodeURIComponent(name.replace(/ /g, "_"))
  .replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/'/g, "%27").replace(/!/g, "%21").replace(/\*/g, "%2A");

// The Special:FilePath URL of a file; ?width=330 or ?width=500 may be appended.
export const filePathUrl = title => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeName(title.replace(/^File:/, ""))}`;

// Reads the argument as a Commons file title "File:Name.jpg". Accepts a file page URL
// (…/wiki/File:Name.jpg, also Datei:, Special:FilePath/…, index.php?title=…), an upload.wikimedia.org
// URL (original or thumbnail), "File:Name.jpg" or "Name.jpg". Other hosts are refused.
export function parseTitle(input) {
  let text = String(input ?? "").trim();
  if (!text) throw new Error("no file given");
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) {
    let url;
    try { url = new URL(text); } catch { throw new Error(`not a valid URL: ${text}`); }
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error(`only http(s) URLs are supported: ${text}`);
    if (!HOSTS.has(url.hostname)) throw new Error(`only commons.wikimedia.org and upload.wikimedia.org are allowed, not ${url.hostname}`);
    const parts = url.pathname.split("/").filter(Boolean).map(part => { try { return decodeURIComponent(part); } catch { return part; } });
    if (url.hostname === "upload.wikimedia.org") {
      // /wikipedia/commons/a/ab/Name.jpg or /wikipedia/commons/thumb/a/ab/Name.jpg/500px-Name.jpg
      const start = parts.indexOf("commons");
      const rest = start >= 0 ? parts.slice(start + 1) : [];
      const offset = rest[0] === "thumb" ? 1 : 0;
      text = rest[offset + 2];
      if (!text || !/^[0-9a-f]$/.test(rest[offset] ?? "")) throw new Error(`not a Commons file URL: ${input}`);
    } else if (url.searchParams.get("title")) {
      text = url.searchParams.get("title");
    } else if (parts[0] === "wiki" && parts.length >= 2) {
      text = parts.slice(1).join("/").replace(/^Special:FilePath\//i, "");
    } else {
      throw new Error(`not a Commons file page: ${input}`);
    }
  } else {
    try { text = decodeURIComponent(text); } catch { /* a literal "%" stays */ }
  }
  const name = text.replace(/^(?:File|Datei|Image|Bild):/i, "").replace(/_/g, " ").trim();
  if (!name || /[#<>[\]{}|]/.test(name) || name.includes("/")) throw new Error(`not a valid file name: ${input}`);
  if (!/\.[a-z0-9]{2,5}$/i.test(name)) throw new Error(`a file name ends with its type, e.g. Name.jpg: ${input}`);
  return `File:${name}`;
}

const entities = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " " };
// Text of an HTML snippet from the API (Artist, Credit): tags removed, entities decoded, one line.
export function stripHtml(html) {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:#(\d+)|#x([0-9a-f]+)|(\w+));/gi, (all, dec, hex, name) =>
      dec ? String.fromCodePoint(Number(dec)) : hex ? String.fromCodePoint(parseInt(hex, 16)) : entities[name.toLowerCase()] ?? all)
    .replace(/\s+/g, " ")
    .trim();
}

// A file name for the cache: letters, digits, ".", "_" and "-" only, without the file type.
export function safeName(title) {
  return title.replace(/^File:/, "").replace(/\.[a-z0-9]{2,5}$/i, "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^[._]+|[._]+$/g, "")
    .slice(0, 120) || "file";
}

// The API may name thumb.wikimedia.org with tracking parameters; the same path is served by
// upload.wikimedia.org, so the download stays on the two allowed hosts.
// Commons serves thumbnails in standard widths; other widths are rounded up to a large file or rejected.
export const STANDARD_WIDTHS = [120, 250, 330, 500];
export function checkWidth(width) {
  if (!STANDARD_WIDTHS.includes(width)) throw new Error(`--width takes a standard width of Commons: ${STANDARD_WIDTHS.join(", ")}`);
  return width;
}
// The preview to download: the thumbnail, or the original only when it is not larger than the preview.
export function previewUrl(info, width) {
  if (info.thumburl) return info.thumburl;
  if (info.url && Number(info.width) <= width) return info.url;
  throw new Error(`no preview of ${width} px from Commons – the original (${info.width ?? "?"} px) is not downloaded`);
}

export function uploadUrl(url) {
  const parsed = new URL(url);
  if (parsed.hostname === "thumb.wikimedia.org") parsed.hostname = "upload.wikimedia.org";
  if (parsed.hostname === "upload.wikimedia.org") parsed.search = "";
  return parsed.href;
}

function allowed(url) {
  try { const { protocol, hostname } = new URL(url); return protocol === "https:" && HOSTS.has(hostname); } catch { return false; }
}

// GET with User-Agent and timeout; redirects are followed only to allowed hosts.
async function get(url) {
  for (let hop = 0; hop < 4; hop++) {
    if (!allowed(url)) throw new Error(`refused to load from ${url} – only commons.wikimedia.org and upload.wikimedia.org`);
    const response = await fetch(url, { headers: { "User-Agent": AGENT }, redirect: "manual", signal: AbortSignal.timeout(TIMEOUT) });
    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      url = new URL(response.headers.get("location"), url).href;
      continue;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
    return response;
  }
  throw new Error(`too many redirects for ${url}`);
}

function inside(root, path) {
  const rel = relative(root, path);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--help" || args[0] === "-h") { console.log(usage); return 0; }
  let width = 500;
  const at = args.indexOf("--width");
  if (at >= 0) {
    width = checkWidth(Number(args[at + 1]));
    args.splice(at, 2);
  }
  const unknown = args.find(arg => arg.startsWith("--"));
  if (unknown) throw new Error(`unknown option ${unknown}`);
  if (args.length !== 1) { console.error(usage); console.log("Exit code: 2"); return 2; }
  const title = parseTitle(args[0]);

  const query = new URLSearchParams({ action: "query", prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: String(width),
    titles: title, redirects: "1", format: "json", formatversion: "2" });
  let data;
  try { data = await (await get(`${API}?${query}`)).json(); } catch (error) { throw new Error(`Commons API: ${error.name === "TimeoutError" ? `no answer within ${TIMEOUT / 1000} s` : error.message}`); }
  const page = data?.query?.pages?.[0];
  if (!page || page.missing || page.invalid || !page.imageinfo?.[0]) throw new Error(`not found on Wikimedia Commons: ${title}`);
  const info = page.imageinfo[0];
  const meta = info.extmetadata ?? {};
  const thumbUrl = uploadUrl(previewUrl(info, width));
  if (!allowed(thumbUrl)) throw new Error(`unexpected thumbnail host: ${thumbUrl}`);

  let bytes;
  try {
    const response = await get(thumbUrl);
    if (!/^image\//.test(response.headers.get("content-type") ?? "")) throw new Error(`not an image (${response.headers.get("content-type") ?? "no type"})`);
    if (Number(response.headers.get("content-length") ?? 0) > MAX_BYTES) throw new Error("larger than 5 MB");
    bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > MAX_BYTES) throw new Error("larger than 5 MB");
  } catch (error) {
    throw new Error(`thumbnail download: ${error.name === "TimeoutError" ? `no answer within ${TIMEOUT / 1000} s` : error.message}`);
  }
  const type = (thumbUrl.match(/\.(jpe?g|png|gif|webp)$/i)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");

  // Only inside the current folder, also if .cache is a link to somewhere else.
  const root = realpathSync(process.cwd());
  const folder = resolve(root, ".cache", "thumbs");
  mkdirSync(folder, { recursive: true });
  if (!inside(root, realpathSync(folder))) throw new Error(".cache/thumbs points outside the current folder");
  const file = join(folder, `${safeName(page.title)}.${type}`);
  writeFileSync(file, bytes);

  const value = key => stripHtml(meta[key]?.value) || "–";
  const name = page.title;
  console.log(`Thumbnail: ${relative(root, file).split(sep).join("/")} (${info.thumbwidth ?? info.width} × ${info.thumbheight ?? info.height} px, ${Math.round(bytes.length / 1024)} KB; original ${info.width} × ${info.height} px)`);
  console.log(`File URL: ${filePathUrl(name)}  (append ?width=330 for answer options, ?width=500 for page photos)`);
  console.log(`Original file (upload.wikimedia.org): ${encodeUrl(uploadUrl(info.url))}`);
  console.log(`Author: ${value("Artist")}`);
  if (meta.Credit) console.log(`Credit: ${value("Credit")}`);
  console.log(`License: ${value("LicenseShortName")}`);
  console.log(`License URL: ${value("LicenseUrl")}`);
  console.log(`Page: ${encodeUrl(info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeName(name)}`)}`);
  console.log("Exit code: 0");
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main().catch(error => {
    console.error(`fetch-thumb: ${String(error.message).split("\n")[0]}`);
    console.log("Exit code: 2");
    return 2;
  });
}

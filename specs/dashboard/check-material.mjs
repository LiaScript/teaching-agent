// Renders a course material in the LiaScript DevServer and reports what learners see:
// slides, quizzes, read-aloud buttons, missing and broken images, oversized images, real errors and,
// per quiz and window size, whether the question and all its options fit on one screen – counted from the
// top of an image directly above the question, which the question refers to.
// The source is read first (image placeholders, quizzes whose options cannot be told apart,
// link and image targets with unencoded "(" ")" or spaces, image options without a size limit,
// hints that are not read aloud, page photos wider than 500 px, answer options that give the answer away by their
// surface – length, build, position, articles and capitals on gap cards, a gap sentence that stands twice); that part
// needs no browser and is exported as analyseMaterial() for check.mjs, as is the fit arithmetic (fitOnScreen, describeFit).
// Run from the course project root: node <path>/dashboard/check-material.mjs [README.md] [--viewport WxH …]
// Exit code 0: no errors · 1: errors in the material (also: LiaScript cannot read it) · 2: invalid call or the rendered check was not possible.
// Stopped from outside: 130 (SIGINT), 143 (SIGTERM), 129 (SIGHUP) – the DevServer of the run is stopped too.
import { spawn } from "node:child_process";
import { readdir, access } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, join, delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createServer } from "node:net";

const usage = `Usage: node <path>/dashboard/check-material.mjs [file] [--viewport WxH …]
  file        the material document, relative to the course project root
              (default README.md; in a multi-file course materials/<number>-<slug>/README.md)
  --viewport  a window size for the fit measurement, e.g. --viewport 810x1080; repeat it for
              several sizes (the target device from the Course Context). Without it:
              1024x768, 810x1080 and 1080x810.
Reads the source (image placeholders, quizzes with identical options, URLs with unencoded
"(" ")" or spaces, image options without a size limit, hints not read aloud while narrator: is
set, page photos wider than 500 px, answer patterns: the correct option clearly the longest or built
differently, the same position several times in a row, gap cards with an article or a capital that tells
their gap, a gap sentence that also stands as its own line), then renders every slide in the LiaScript DevServer (liadev) with a headless Chrome/Chromium:
CHROMIUM_PATH if set, else Playwright's own browser, else a system Chrome/Chromium (images that do
not load, images over 200 KB, and per quiz and window whether the question line and all options fit
the visible area – from the top of an image directly above the question, measured at slide open and
with the question or that image at the top). Page photos wider than 500 px (?width=…) are warned
about from the source, whatever their file size.
The windows are desktop browser windows of that size, not devices (no touch, no browser bars).
Exit code 0: no errors · 1: errors in the material (also: LiaScript cannot read it and shows its
error course) · 2: invalid call or rendered check not possible (no browser, the DevServer did not
load the file). Stopped from outside: 130 (SIGINT), 143 (SIGTERM), 129 (SIGHUP); its DevServer stops too.`;

// ---------------------------------------------------------------------------
// Source analysis (no browser)

// A visible image placeholder starts with a picture symbol (🖼️ 📷 📸) and is emphasized:
// `> 🖼️ _Image follows: alt text_` (tasks/create-image.md) or `*📷 Photo follows*`.
// The words are in the course language, so only the symbol and the emphasis are matched.
const picture = "(?:\\u{1F5BC}\\uFE0F?|\\u{1F4F7}|\\u{1F4F8})";
// A placeholder inside a quiz option may end with a neutral distinguishing word and number ("picture 2").
const markerLine = new RegExp(`^(?:([*_]{1,2})\\s*${picture}.*\\1|${picture}\\s*([*_]{1,2})\\S.*\\2)(?:\\s+\\p{L}+\\s*\\d+)?$`, "u");
const optionLine = /^\s*[-*+]\s+\[(\(\s*[Xx]?\s*\)|\[\s*[Xx]?\s*\])\]\s?(.*)$/;
const hintLine = /^\s*[-*+]\s+\[\[\?\]\]/;

// The text a learner sees on a line: without quote and list markers, quiz brackets
// and the inline read-aloud wrapper {|>}{…}.
function plain(line) {
  return line
    .replace(/^\s*(?:>\s*)*/, "")
    .replace(/^(?:[-*+]|\d+\.)\s+(?=\S)/, "")
    .replace(/^\[(?:\(\s*[Xx]?\s*\)|\[\s*[Xx]?\s*\])\]\s*/, "")
    .replace(/\{\|>[^{}]*\}\{([^{}]*)\}/g, "$1")
    .trim();
}
const shown = text => plain(text).replace(/[*_]/g, "").replace(/\s+/g, " ").trim();
const short = (text, length = 50) => text.length > length ? `${text.slice(0, length - 1)}…` : text;

export function isImageMarker(line) {
  const text = plain(line);
  return !text.includes("![") && markerLine.test(text);
}

// LiaScript ends a link or image target at the first "(" (CommonMark would allow balanced ones),
// and a space ends it as well: "(" ")" and spaces in a URL must be written as %28 %29 %20.
export const encodeTarget = url => url.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/ /g, "%20");

// Markdown links and images on one line: { image, start, end, target } with the target read as
// CommonMark does (balanced parentheses, optional "title" removed); end is the index after ")".
export function markdownLinks(line) {
  const links = [];
  let from = 0;
  for (let start = line.indexOf("](", from); start >= 0; start = line.indexOf("](", from)) {
    let depth = 1;
    let index = start + 2;
    for (; index < line.length && depth; index++) {
      if (line[index] === "(") depth++;
      else if (line[index] === ")") depth--;
    }
    let open = start - 1;
    for (let level = 0; open >= 0; open--) {
      if (line[open] === "]") level++;
      else if (line[open] === "[" && level-- === 0) break;
    }
    const target = line.slice(start + 2, depth ? line.length : index - 1).trim()
      .replace(/\s+("[^"]*"|'[^']*')$/, "").replace(/^<(.*)>$/, "$1");
    links.push({ image: open > 0 && line[open - 1] === "!", start: Math.max(open, 0), end: index, target });
    from = index;
  }
  return links;
}

// Link targets and bare URLs that LiaScript cuts: text is the visible source (comments and code
// blocks blanked, line numbers kept). Returns { line (1-based), kind, url, encoded }.
export function unencodedUrls(text) {
  const found = [];
  text.split("\n").forEach((raw, index) => {
    let line = raw.replace(/`[^`\n]*`/g, code => " ".repeat(code.length));
    for (const link of markdownLinks(line)) {
      if (/[()\s]/.test(link.target)) found.push({ line: index + 1, kind: link.image ? "image target" : "link target", url: link.target, encoded: encodeTarget(link.target) });
      line = line.slice(0, link.start) + " ".repeat(link.end - link.start) + line.slice(link.end);
    }
    // A bare URL ends at the first "(" (its visible text stays complete); in an HTML attribute it is not cut.
    for (const bare of line.matchAll(/(?<!=["'])\b(?:https?|ftp):\/\/[^\s<>"'`\]]+/g)) {
      if (bare[0].includes("(")) found.push({ line: index + 1, kind: "bare URL", url: bare[0], encoded: `[…](${encodeTarget(bare[0])})` });
    }
  });
  return found;
}

// One finding of unencodedUrls() as text: what is wrong and what to write instead.
export const describeUrl = item => `${item.kind} ${item.url} contains unencoded ${[...new Set(item.url.match(/[()\s]/g).map(char => /\s/.test(char) ? "spaces" : `"${char}"`))].join(", ")} – LiaScript cuts it; write ${item.encoded}`;

// A size limit right after an image: <!-- style="max-height: 30vh" --> (also width, max-width, height).
const sizeLimit = /^<!--[^>]*?(?:style\s*=\s*["'][^"']*\b(?:max-)?(?:width|height)\s*:|\b(?:width|height)\s*=)/i;

// Reads a LiaScript material and returns what can be checked without rendering it.
// problems: errors (exit code 1) · warnings: likely problems that do not change the exit code.
export function analyseMaterial(source) {
  const blank = text => text.replace(/[^\n]/g, " ");
  // Code blocks and comments are not visible; blanking keeps the line numbers.
  const masked = source
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .split("\n");
  const raw = source.split("\n");
  const slideOf = [];
  const slides = [];
  masked.forEach((line, index) => {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (heading) slides.push(heading[1]);
    slideOf[index] = slides.at(-1) ?? "";
  });
  const markerAt = new Set(masked.map((line, index) => isImageMarker(line) ? index : -1).filter(index => index >= 0));
  // The authoring note `<!--- image: {slug} --->` stands above a placeholder, whatever it says.
  for (const note of source.matchAll(/<!--+\s*image:[\s\S]*?-->/g)) {
    let index = source.slice(0, note.index + note[0].length).split("\n").length;
    while (index < masked.length && !masked[index].trim()) index++;
    if (index < masked.length && !masked[index].includes("![") && !/^#{1,6}\s/.test(masked[index])) markerAt.add(index);
  }
  const markers = [...markerAt].sort((a, b) => a - b).map(index => ({ slide: slideOf[index], text: shown(raw[index]) }));

  const quizzes = [];
  let quiz = null;
  masked.forEach((line, index) => {
    const option = line.match(optionLine);
    if (option) {
      if (!quiz) quizzes.push(quiz = { start: index, slide: slideOf[index], options: [] });
      // The raw line keeps the comment after an image, which the masked line has blanked.
      const images = markdownLinks(raw[index]).filter(link => link.image);
      quiz.options.push({ text: shown(option[2]), marker: markerAt.has(index), images: images.length,
        correct: /[Xx]/.test(option[1]), single: option[1].startsWith("("),
        unlimited: images.filter(link => !sizeLimit.test(raw[index].slice(link.end))).length });
    } else if (!(quiz && hintLine.test(line))) quiz = null;
  });
  const problems = [];
  const warnings = [];
  quizzes.forEach((item, number) => {
    // The question is the nearest visible line above the options; a heading means there is none.
    let above = item.start - 1;
    while (above >= 0 && !masked[above].trim()) above--;
    const question = above >= 0 && !/^#{1,6}\s/.test(masked[above]) ? shown(masked[above]) : "";
    const where = `quiz on slide "${item.slide}"${question ? ` ("${short(question)}")` : ""}`;
    const counts = new Map();
    item.options.forEach(option => counts.set(option.text.toLowerCase(), [...(counts.get(option.text.toLowerCase()) ?? []), option.text]));
    const same = [...counts.values()].filter(group => group.length > 1);
    if (same.length) problems.push(`${where}: options not distinguishable – ${same.map(group => `${group.length} × "${short(group[0], 40)}"`).join(", ")}; learners cannot solve it`);
    // A placeholder in the options, or between the previous quiz (or the slide start) and the options.
    const previous = quizzes[number - 1];
    const from = previous && previous.slide === item.slide ? previous.start + previous.options.length : masked.findLastIndex((line, index) => index < item.start && /^#{1,6}\s/.test(line));
    const inOptions = item.options.filter(option => option.marker).length;
    const aboveIt = [...markerAt].some(index => index > from && index < item.start);
    if (inOptions) warnings.push(`${where}: ${inOptions} option${inOptions === 1 ? " is an image placeholder" : "s are image placeholders"} – the quiz depends on missing images`);
    else if (aboveIt) warnings.push(`${where}: follows an image placeholder – the question depends on a missing image`);
    // Images in quiz options are shown at their natural width: without a limit they fill the screen.
    const unlimited = item.options.reduce((sum, option) => sum + option.unlimited, 0);
    if (unlimited) warnings.push(`${where}: ${unlimited} image option${unlimited === 1 ? "" : "s"} without a size limit – put <!-- style="max-height: 30vh" --> directly after each image, so the question and all options fit one screen`);
  });
  // Unencoded "(" ")" or spaces break the image or link: an error with its line.
  for (const item of unencodedUrls(masked.join("\n"))) {
    problems.push(`slide "${slideOf[item.line - 1] || "(before the first heading)"}", line ${item.line}: ${describeUrl(item)}`);
  }
  // Page photos (images outside quiz options) are loaded at most 500 px wide (Wikimedia standard width).
  masked.forEach((line, index) => {
    if (optionLine.test(line)) return;
    for (const link of markdownLinks(line).filter(item => item.image)) {
      const width = Number(link.target.match(/[?&]width=(\d+)/)?.[1] ?? link.target.match(/\/(\d+)px-[^/]*$/)?.[1] ?? 0);
      if (width > 500) warnings.push(`slide "${slideOf[index] || "(before the first heading)"}": page photo wider than 500 px (${short(link.target.split("/").at(-1), 60)}) – load it at 500 px (?width=500), answer options at 330 px`);
    }
  });
  const text = masked.join("\n");
  const hintLines = masked.map((line, index) => ({ line, index })).filter(item => hintLine.test(item.line));
  // Hints are rendered only once the learner opens them (light bulb): their read-aloud texts are counted
  // apart (inHints), so that the rendered count is compared with the texts outside hints only.
  const readAloud = {
    blocks: (text.match(/\{\{[^{}\n]*\|>[^{}\n]*\}\}/g) ?? []).length,
    inline: (text.match(/\{\|>[^{}\n]*\}\{/g) ?? []).length,
    inHints: hintLines.reduce((sum, item) => sum + (item.line.match(/\{\|>[^{}\n]*\}\{/g) ?? []).length, 0)
  };
  // With a narrator, hints are read aloud like questions and options: - [[?]] {|>}{hint text}.
  const header = source.match(/^\s*<!--([\s\S]*?)-->/)?.[1] ?? "";
  const silent = hintLines.filter(item => !/\{\|>[^{}]*\}\{/.test(item.line));
  const hints = { total: hintLines.length, silent: silent.length };
  if (/^\s*narrator\s*:\s*\S/m.test(header) && silent.length) {
    const on = [...new Set(silent.map(item => slideOf[item.index]))];
    warnings.push(`narrator is set, but ${silent.length} of ${hintLines.length} quiz hint${hintLines.length === 1 ? "" : "s"} ([[?]]) ${silent.length === 1 ? "is" : "are"} not read aloud (slide${on.length === 1 ? "" : "s"}: ${on.slice(0, 4).join(" · ")}${on.length > 4 ? " …" : ""}) – write - [[?]] {|>}{hint text}`);
  }
  const patterns = answerPatterns({ masked, raw, slideOf, quizzes, language: header.match(/^\s*language\s*:\s*([A-Za-z]{2})/m)?.[1].toLowerCase() });
  warnings.push(...patterns.warnings);
  delete patterns.warnings;
  return { slides, quizzes: quizzes.length, markers, readAloud, hints, patterns, problems, warnings };
}

// ---------------------------------------------------------------------------
// Answer patterns: surface cues that give the answer away without understanding (R10-D1).
// Everything is read from the source; no language understanding, only these language lists for articles
// on gap cards (by the header's language:; other languages skip the article check).
export const articles = Object.freeze({
  de: ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "eines"],
  en: ["the", "a", "an"],
  fr: ["le", "la", "les", "l'", "un", "une", "des", "du", "au", "aux"],
  es: ["el", "la", "los", "las", "un", "una", "unos", "unas"],
  it: ["il", "lo", "la", "i", "gli", "le", "l'", "un", "uno", "una"],
  nl: ["de", "het", "een"]
});
// A gap: [[(right)|wrong]] (select) or [->[(right)|wrong]] (drag); the correct card stands in parentheses.
const gapPattern = /\[(?:->)?\[([^[\]\n]*\|[^[\]\n]*)\]\]/g;
const hasGap = text => /\[(?:->)?\[[^[\]\n]*\|[^[\]\n]*\]\]/.test(text);
const words = text => text.toLowerCase().replace(/[^\p{L}\p{N}'\s-]/gu, " ").split(/\s+/).filter(Boolean);
const startsUpper = text => /^\p{Lu}/u.test(text);

export function answerPatterns({ masked, raw, slideOf, quizzes, language }) {
  const warnings = [];
  // A unit is a chapter (heading level 1 or 2); the patterns are counted per chapter.
  const chapterOf = [];
  let chapter = "";
  masked.forEach((line, index) => {
    const heading = line.match(/^#{1,2}\s+(.+?)\s*#*\s*$/);
    if (heading) chapter = heading[1];
    chapterOf[index] = chapter;
  });
  const questionOf = quiz => {
    let above = quiz.start - 1;
    while (above >= 0 && !masked[above].trim()) above--;
    return above >= 0 && !/^#{1,6}\s/.test(masked[above]) ? shown(masked[above]) : "";
  };
  const where = quiz => `slide "${quiz.slide}"${questionOf(quiz) ? ` ("${short(questionOf(quiz), 40)}")` : ""}`;
  const single = quizzes.filter(quiz => quiz.options.length >= 2 && quiz.options.every(option => option.single) && quiz.options.filter(option => option.correct).length === 1);
  const textOnly = single.filter(quiz => quiz.options.every(option => !option.images && !option.marker && option.text));
  const byChapter = new Map();
  for (const quiz of single) byChapter.set(chapterOf[quiz.start], [...(byChapter.get(chapterOf[quiz.start]) ?? []), quiz]);
  const result = { single: textOnly.length, longest: 0, built: 0, position: 0, cards: 0, repeated: 0, warnings };
  for (const [name, list] of byChapter) {
    const unit = name ? ` in "${name}"` : "";
    const texts = list.filter(quiz => textOnly.includes(quiz));
    // (a) The correct option is the only longest and at least 20 % longer than every other (sentence options).
    const longest = texts.filter(quiz => {
      const right = quiz.options.find(option => option.correct).text;
      const others = quiz.options.filter(option => !option.correct).map(option => option.text.length);
      return words(right).length >= 3 && right.length >= 1.2 * Math.max(...others);
    });
    // (b) All wrong options start with the same word, the correct one with another.
    const built = texts.filter(quiz => {
      const firsts = quiz.options.map(option => ({ correct: option.correct, word: words(option.text)[0] ?? "", many: words(option.text).length >= 2 }));
      const wrong = firsts.filter(item => !item.correct);
      const right = firsts.find(item => item.correct);
      return wrong.length >= 2 && firsts.every(item => item.many) && new Set(wrong.map(item => item.word)).size === 1 && right.word !== wrong[0].word;
    });
    result.longest += longest.length;
    result.built += built.length;
    const list4 = items => `${items.slice(0, 4).map(where).join(" · ")}${items.length > 4 ? " …" : ""}`;
    if (longest.length) warnings.push(`answer pattern${unit}: the correct option is clearly the longest (at least 20 % longer than every other) in ${longest.length} of ${texts.length} single-choice question${texts.length === 1 ? "" : "s"} – ${list4(longest)}; make the options about equally long`);
    if (built.length) warnings.push(`answer pattern${unit}: the correct option is built differently in ${built.length} of ${texts.length} single-choice question${texts.length === 1 ? "" : "s"} (all others start with the same word) – ${list4(built)}; build every option the same way`);
    // (c) The correct option at the same place in 3 or more questions in a row (not with data-randomize).
    const fixed = list.filter(quiz => !/data-randomize/.test(raw.slice(Math.max(0, quiz.start - 3), quiz.start).join(" ")));
    let run = [];
    const flush = () => {
      if (run.length >= 3) {
        result.position += 1;
        warnings.push(`answer pattern${unit}: the correct option is option ${run[0].options.findIndex(option => option.correct) + 1} in ${run.length} single-choice questions in a row (from ${where(run[0])}) – vary its position`);
      }
    };
    for (const quiz of fixed) {
      const at = quiz.options.findIndex(option => option.correct);
      if (run.length && run[0].options.findIndex(option => option.correct) !== at) { flush(); run = []; }
      run.push(quiz);
    }
    flush();
  }
  // (d) Gap cards: an article, or a capital letter only on the correct card, tells which gap a card fits.
  const list = articles[language] ?? [];
  masked.forEach((line, index) => {
    const gaps = [...line.matchAll(gapPattern)].map(match => match[1].split("|").map(card => card.trim()).filter(Boolean)
      .map(card => ({ correct: /^\(.*\)$/.test(card), text: shown(card.replace(/^\((.*)\)$/, "$1")) })));
    if (!gaps.length) return;
    const withArticle = gaps.flat().filter(card => words(card.text).length >= 2 && list.includes(words(card.text)[0]));
    if (withArticle.length) {
      result.cards += withArticle.length;
      warnings.push(`slide "${slideOf[index]}": gap card${withArticle.length === 1 ? "" : "s"} ${withArticle.slice(0, 3).map(card => `"${short(card.text, 30)}"`).join(", ")} start${withArticle.length === 1 ? "s" : ""} with an article – its form tells which gap a card fits; put the article into the sentence`);
    }
    for (const cards of gaps.filter(gap => gap.length >= 2 && gap.some(card => card.correct))) {
      const right = cards.find(card => card.correct);
      const wrong = cards.filter(card => !card.correct);
      if (wrong.every(card => startsUpper(card.text) !== startsUpper(right.text))) {
        result.cards += 1;
        warnings.push(`slide "${slideOf[index]}": in a gap only the correct card "${short(right.text, 30)}" starts with ${startsUpper(right.text) ? "a capital" : "a small"} letter – the letter tells the answer; write all cards of a gap the same way`);
      }
    }
    // (e) The sentence with the gaps also stands as its own line on the same slide (read twice, or the answer shown).
    const fragments = line.split(gapPattern).filter((part, number) => number % 2 === 0).map(part => words(shown(part)).join(" ")).filter(part => part.length >= 3);
    if (fragments.join(" ").split(" ").length < 4) return;
    // Fragments in order; a line hidden for reading aloud only (text-indent, display: none) does not count.
    const contains = other => {
      const plainOther = words(shown(other)).join(" ");
      let from = 0;
      return fragments.every(part => (from = plainOther.indexOf(part, from)) >= 0 && (from += part.length));
    };
    const twin = masked.findIndex((other, at) => at !== index && slideOf[at] === slideOf[index] && !hasGap(other)
      && !/text-indent|display\s*:\s*none/.test(raw.slice(Math.max(0, at - 2), at + 1).join(" ")) && contains(other));
    if (twin >= 0) {
      result.repeated += 1;
      warnings.push(`slide "${slideOf[index]}": the gap sentence "${short(shown(line.replace(gapPattern, "…")), 50)}" also stands as its own line on the slide – learners read it twice (or the answer); keep it once`);
    }
  });
  return result;
}

// One line for the report: how many questions show which pattern.
export const describePatterns = patterns => `correct option clearly longest in ${patterns.longest} of ${patterns.single} single-choice question${patterns.single === 1 ? "" : "s"} · built differently in ${patterns.built} · same position 3+ times in a row: ${patterns.position} · gap cards with a cue: ${patterns.cards} · repeated gap sentences: ${patterns.repeated}`;

// ---------------------------------------------------------------------------
// Fit on one screen (pure arithmetic, measured values come from the rendered page)

// Windows for the fit measurement: a laptop window and a 10.2" tablet in both orientations. They are
// desktop browser windows of that size, not devices: no touch, no browser bars.
export const defaultViewports = Object.freeze([{ width: 1024, height: 768 }, { width: 810, height: 1080 }, { width: 1080, height: 810 }]);

export function parseViewport(text) {
  const match = String(text ?? "").trim().match(/^(\d{3,4})\s*[x×]\s*(\d{3,4})$/i);
  const size = match && { width: Number(match[1]), height: Number(match[2]) };
  if (!size || Math.min(size.width, size.height) < 320 || Math.max(size.width, size.height) > 3840) throw new Error(`invalid viewport "${text}" – write WIDTHxHEIGHT between 320 and 3840, e.g. 810x1080`);
  return size;
}

export const viewportName = size => `${size.width}×${size.height}${size.width === size.height ? "" : size.height > size.width ? " portrait" : " landscape"}`;

// geometry: px in slide-open coordinates (scroll position 0) of one quiz in one window:
//   view {top, bottom}: the visible area of the slide (below the header, above the footer),
//   maxScroll: how far the slide scrolls (the question cannot move higher than that),
//   question: top of the question line (the quiz itself when there is none),
//   options [{top, bottom, images: [height, …]}]: one entry per answer option, top to bottom,
//   stimulus {top, height} (optional): an image directly above the question that the question refers to;
//     then the measurement starts at its top and its height counts as an image that may shrink.
// Returns the options visible at slide open (null when the question is below the visible area: the
// learner scrolls there anyway) and with the question scrolled to the top, the height needed and
// available, and the largest image height at which the options would fit (options stacked).
export function fitOnScreen({ view, maxScroll = Infinity, question: line, options, stimulus = null }) {
  const total = options.length;
  const question = stimulus ? Math.min(stimulus.top, line) : line;
  const lastBottom = Math.max(question, ...options.map(option => option.bottom));
  // Measured from the image top, the image is visible whenever the options below it are.
  const visibleAt = shift => options.filter(option => option.top - shift >= view.top - 1 && option.bottom - shift <= view.bottom + 1).length;
  const height = Math.round(lastBottom - question);
  const available = Math.round(view.bottom - view.top);
  const images = [...(stimulus ? [stimulus.height] : []), ...options.flatMap(option => option.images ?? [])];
  const fixed = height - images.reduce((sum, value) => sum + value, 0);
  const largest = room => images.length ? Math.max(0, Math.floor((room - fixed) / images.length)) : null;
  const atTop = visibleAt(Math.min(Math.max(question - view.top, 0), Math.max(maxScroll, 0)));
  const open = question < view.bottom ? { visible: visibleAt(0), fits: visibleAt(0) === total } : null;
  return {
    total, height, available, open, stimulus: Boolean(stimulus),
    top: { visible: atTop, fits: atTop === total },
    images: images.length ? Math.max(...images) : 0,
    imageMax: {
      open: open && !open.fits ? largest(view.bottom - Math.max(question, view.top)) : null,
      top: atTop === total ? null : largest(available)
    }
  };
}

// One window of one quiz as text: "fits", "fits once scrolled …" or "does not fit …", with the image
// height that would make it fit.
// With an image above the question (fit.stimulus) the words say "image and question" and "image at the top".
export function describeFit(fit, size) {
  const name = viewportName(size);
  const top = fit.stimulus ? "image at the top" : "question at the top";
  const [fits, scrolled, notFit] = fit.stimulus ? ["image and question fit", "image and question fit only once scrolled", "image and question do not fit"] : ["fits", "fits only once scrolled", "does not fit"];
  const openPart = fit.open && !fit.open.fits ? `at open ${fit.open.visible} of ${fit.total} options visible` : "";
  if (fit.top.fits && !openPart) return `${name}: ${fits}`;
  // Below about 60 px no image size helps: the question starts too far down, or the text alone is too tall.
  const helps = value => value != null && value >= minImage;
  const room = [helps(fit.imageMax.open) && `${fit.imageMax.open} px to fit at open`, helps(fit.imageMax.top) && `${fit.imageMax.top} px with the ${top}`].filter(Boolean);
  const lowOpen = fit.imageMax.open != null && !helps(fit.imageMax.open);
  const lowTop = fit.imageMax.top != null && !helps(fit.imageMax.top);
  const hopeless = lowTop ? ` – even without images the text needs nearly the whole screen: no image size helps; split the slide`
    : lowOpen ? ` – at open the question starts too far down: no image size helps there; split the slide or accept scrolling` : "";
  const images = (room.length && fit.images ? ` – images at most ${room.join(", ")} (now up to ${fit.images} px)` : "") + hopeless;
  if (fit.top.fits) return `${name}: ${scrolled} (${openPart}; ${top}: fits)${images}`;
  return `${name}: ${notFit} (${openPart ? `${openPart}; ` : ""}${top}: ${fit.top.visible} of ${fit.total} options visible, needs ${fit.height} px, has ${fit.available} px)${images}`;
}
// The smallest image height that still shows something; below it the advice is to split the slide.
export const minImage = 60;
const fitsText = /: (fits|image and question fit)$/;
const notFitText = /: (does not fit|image and question do not fit)/;

// ---------------------------------------------------------------------------
// Rendered check

const require = createRequire(import.meta.url);

// The DevServer serves the project root (`--input .`): `--input <file>` would serve only the file's own folder,
// so a material in materials/{n}-{slug}/ would not load and its relative imports (../../lia-templates/{id}/README.md)
// would be out of reach.
export function devServer(file, port) {
  const origin = `http://127.0.0.1:${port}`;
  const path = file.split(/[\\/]/).filter(part => part && part !== ".").map(encodeURIComponent).join("/");
  const material = `${origin}/${path}`;
  return { args: ["--input", ".", "--hostname", "127.0.0.1", "--port", String(port)], origin, material, url: `${origin}/liascript/index.html?${material}` };
}

// A port no other program listens on: a fixed port may still be held by a DevServer that a stopped run left
// behind, serving another project – the check would then render that project's file instead.
export function freePort() {
  return new Promise((done, fail) => {
    const probe = createServer();
    probe.once("error", fail);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => done(port));
    });
  });
}

// When the material does not load or cannot be read, LiaScript shows its own error course: first slide
// "🙈 Ups, something went wrong", then its help slides ("What is LiaScript?"). Only that course counts – a
// slide of the material may use the same words. Returns null when the material rendered, else
// { kind, text }: "not-loaded" (no rendered check, exit 2) or "unreadable" (served, but LiaScript cannot
// read it – an error in the material, exit 1).
export function loadFailure({ status, titles }, file) {
  const errorCourse = /^(🙈\s*)?Ups, something went wrong$/i.test(titles[0] ?? "") && titles.some(title => /^What is LiaScript\?$/i.test(title));
  const ok = status >= 200 && status < 400;
  const notLoaded = reason => ({ kind: "not-loaded", text: `the LiaScript DevServer did not load ${file} (${reason})` });
  if (ok && errorCourse) return { kind: "unreadable", text: `LiaScript could not read ${file}: it shows its own error course instead of the material` };
  if (ok && !titles.length) return { kind: "not-loaded", text: `the LiaScript DevServer loaded ${file}, but no slide rendered` };
  if (ok || (status === undefined && titles.length && !errorCourse)) return null;
  return notLoaded(status ? `HTTP ${status}` : errorCourse ? "LiaScript shows its error page" : "no answer");
}

// The install hint belongs only to the two reasons that the install offer answers
// (data/chat-checks.md → Offering the Rendered Check).
const playwrightMissing = /^(no installed Playwright found|Playwright has no browser of its own)/;
export function notPossible(reason) {
  const text = String(reason).split("\n")[0];
  return `Rendered check not possible: ${text}.${playwrightMissing.test(text) ? ' Install a browser with "npx playwright install chromium" or set CHROMIUM_PATH to Chrome/Chromium.' : ""}`;
}

// A failure of the rendered part: a plain reason or a loadFailure() result → its exit code.
export function reportFailure(reason) {
  const failure = reason && typeof reason === "object" ? reason : { kind: "not-possible", text: String(reason) };
  return { ...failure, exit: failure.kind === "unreadable" ? 1 : 2 };
}

async function playwright(root) {
  if (process.env.PLAYWRIGHT_MODULE_PATH) {
    try { return require(process.env.PLAYWRIGHT_MODULE_PATH); } catch {
      throw new Error(`no installed Playwright found (PLAYWRIGHT_MODULE_PATH ${process.env.PLAYWRIGHT_MODULE_PATH} does not load)`);
    }
  }
  try { return createRequire(join(root, "package.json"))("playwright"); } catch {}
  const cache = resolve(homedir(), ".npm/_npx");
  for (const folder of existsSync(cache) ? await readdir(cache) : []) {
    const module = resolve(cache, folder, "node_modules/playwright");
    try { await access(resolve(module, "package.json")); return require(module); } catch {}
  }
  throw new Error("no installed Playwright found (npx playwright … installs one; PLAYWRIGHT_MODULE_PATH selects one)");
}

// System browsers: the usual program names in PATH and in the usual folders, then the macOS
// and Windows install locations.
function systemBrowsers() {
  const names = ["google-chrome-stable", "google-chrome", "chromium", "chromium-browser", "chrome"]
    .flatMap(name => process.platform === "win32" ? [`${name}.exe`] : [name]);
  const folders = [...(process.env.PATH ?? "").split(delimiter), "/usr/bin", "/usr/local/bin", "/snap/bin", "/opt/google/chrome"].filter(Boolean);
  const paths = folders.flatMap(folder => names.map(name => join(folder, name)));
  paths.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium");
  for (const base of [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean)) {
    paths.push(join(base, "Google", "Chrome", "Application", "chrome.exe"));
  }
  return [...new Set(paths)].filter(path => existsSync(path));
}

// CHROMIUM_PATH first; else Playwright's own browser; else the first system browser that starts.
async function launch(chromium) {
  const options = { headless: true };
  if (process.env.CHROMIUM_PATH) {
    if (!existsSync(process.env.CHROMIUM_PATH)) throw new Error(`CHROMIUM_PATH ${process.env.CHROMIUM_PATH} does not exist`);
    return chromium.launch({ ...options, executablePath: process.env.CHROMIUM_PATH });
  }
  try { return await chromium.launch(options); } catch {}
  for (const executablePath of systemBrowsers()) {
    try { return await chromium.launch({ ...options, executablePath }); } catch {}
  }
  throw new Error("Playwright has no browser of its own and no system Chrome/Chromium was found");
}

// The fit block: every quiz that does not fit in a window with its windows, then the rest in one line.
function reportFit(fit, sizes) {
  console.log(`Fit on screen (question line – or the top of an image directly above it – to last option, visible area between header and footer; windows ${sizes.map(viewportName).join(", ")} – browser windows, not devices):`);
  const misfits = fit.filter(quiz => quiz.windows.some(item => !fitsText.test(item)));
  misfits.forEach(quiz => console.log(`- slide "${quiz.slide}"${quiz.question ? ` ("${short(quiz.question)}")` : ""}: ${quiz.windows.join(" · ")}`));
  const rest = fit.length - misfits.length;
  if (!fit.length) console.log("- no quizzes");
  else if (rest) console.log(`- ${misfits.length ? `the other ${rest}` : `all ${rest}`} quiz${rest === 1 ? "" : "zes"} fit${rest === 1 ? "s" : ""} in every window`);
  return misfits;
}

function report(file, analysis, rendered, reason) {
  const { readAloud, markers, problems, warnings } = analysis;
  const failure = rendered ? null : reportFailure(reason);
  console.log(`Material: ${file}`);
  if (rendered) {
    const { titles, counts, missing } = rendered;
    console.log(`Slides: ${titles.length} (${titles.slice(0, 12).join(" · ")}${titles.length > 12 ? " …" : ""})`);
    console.log(`Quizzes: ${counts.quizzes} · Read-aloud buttons: ${counts.blocks} blocks, ${counts.inline} inline${readAloud.inHints ? ` (plus ${readAloud.inHints} in hints, marked in the source – shown only once a hint is opened, not counted here)` : ""}`);
    // Hints are rendered only when opened: compare without their read-aloud texts.
    if (counts.blocks + counts.inline < readAloud.blocks + readAloud.inline - readAloud.inHints) warnings.push(`outside the hints the source marks ${readAloud.blocks} blocks and ${readAloud.inline - readAloud.inHints} inline texts for reading aloud, the rendered page shows fewer buttons (${counts.blocks} blocks, ${counts.inline} inline) – check the narrator: line and the markup`);
    // A quiz that fits once scrolled is information; one that does not fit at all is a warning.
    for (const quiz of reportFit(rendered.fit, rendered.sizes)) {
      const windows = quiz.windows.filter(item => notFitText.test(item)).map(item => item.split(":")[0]);
      const what = quiz.windows.some(item => /image and question/.test(item)) ? "the image above the question, the question and its options" : "question and options";
      const split = quiz.windows.filter(item => notFitText.test(item)).every(item => /no image size helps/.test(item));
      if (windows.length) warnings.push(`slide "${quiz.slide}"${quiz.question ? ` ("${short(quiz.question)}")` : ""}: ${what} do not fit one screen at ${windows.join(", ")} – see "Fit on screen"; ${split ? "no image size helps there – split the slide" : "limit the images to the height named there"}`);
    }
  } else {
    console.log(`Slides: ${analysis.slides.length} (from the headings)`);
    console.log(`Quizzes with options: ${analysis.quizzes} · Read-aloud in the source: ${readAloud.blocks} blocks, ${readAloud.inline} inline`);
    console.log("Fit on screen: not measured (needs the rendered check)");
  }
  console.log(`Answer patterns: ${describePatterns(analysis.patterns)}`);
  const files = rendered ? [...rendered.missing] : [];
  const slides = [...new Set(markers.map(marker => marker.slide))];
  const parts = [`${markers.length} placeholder${markers.length === 1 ? "" : "s"}${markers.length ? ` on: ${slides.slice(0, 6).join(" · ")}${slides.length > 6 ? " …" : ""}` : ""}`];
  parts.push(rendered ? `${files.length} file${files.length === 1 ? "" : "s"} not found${files.length ? `: ${files.slice(0, 6).join(", ")}${files.length > 6 ? " …" : ""}` : ""}` : "files not checked");
  // Images that the browser could not show (also external ones): broken URL, missing file or no network.
  const broken = rendered ? [...rendered.broken] : [];
  if (rendered) parts.push(`${broken.length} not loaded${broken.length ? `: ${broken.slice(0, 4).map(([src, slide]) => `${short(src, 90)} (slide "${slide}")`).join(", ")}${broken.length > 4 ? " …" : ""}` : ""}`);
  console.log(`Missing images: ${markers.length + files.length + broken.length} (${parts.join("; ")})`);
  if (rendered) warnings.push(...rendered.warnings);
  const errors = [...problems, ...(rendered ? [...new Set(rendered.errors)] : []), ...(failure?.kind === "unreadable" ? [failure.text] : [])];
  console.log(`Errors (without missing images and the known interpreter error fetchError): ${errors.length}`);
  errors.slice(0, 8).forEach(error => console.log(`- ${error}`));
  if (errors.length > 8) console.log(`- … ${errors.length - 8} more`);
  if (warnings.length) {
    console.log("Warnings:");
    warnings.forEach(warning => console.log(`- ${warning}`));
  }
  if (failure?.kind === "unreadable") {
    console.log("Exit code: 1 (the source was checked; LiaScript could not show the material)");
    return 1;
  }
  if (failure) {
    console.log(notPossible(failure.text));
    console.log("Exit code: 2 (the source was checked; slides, buttons and image files were not)");
    return 2;
  }
  console.log(`Exit code: ${errors.length ? 1 : 0}`);
  return errors.length ? 1 : 0;
}

// Arguments: one file and any number of --viewport WxH (also --viewport=WxH); throws on anything else.
export function parseArguments(args) {
  const files = [];
  const sizes = [];
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--viewport" || argument.startsWith("--viewport=")) {
      const value = argument.includes("=") ? argument.split("=")[1] : args[++index];
      if (value == null) throw new Error("--viewport needs a size, e.g. --viewport 810x1080");
      sizes.push(parseViewport(value));
    } else if (argument.startsWith("-")) throw new Error(`Unknown option ${argument}`);
    else files.push(argument);
  }
  if (files.length > 1) throw new Error(`one file only, not ${files.join(", ")}`);
  return { file: files[0], sizes: sizes.length ? sizes : [...defaultViewports] };
}

async function main() {
  const root = process.cwd(); // run from the course project root
  let call;
  try { call = parseArguments(process.argv.slice(2)); } catch (error) { console.error(`${error.message}\n${usage}`); console.log("Exit code: 2"); return 2; }
  if (call.help) { console.log(usage); return 0; }
  const { sizes } = call;
  const file = call.file ?? (existsSync("materials") ? null : "README.md");
  if (!file) {
    // multi-file course: the root README.md is not a unit's material
    console.error("Usage: node <path>/dashboard/check-material.mjs materials/<number>-<slug>/README.md");
    console.log("Exit code: 2");
    return 2;
  }
  if (!existsSync(resolve(root, file))) { console.error(`Not found: ${file}`); console.log("Exit code: 2"); return 2; }
  const analysis = analyseMaterial(readFileSync(resolve(root, file), "utf8"));

  let chromium;
  try { ({ chromium } = await playwright(root)); } catch (error) { return report(file, analysis, null, error.message); }
  const target = devServer(file, await freePort());
  const { origin } = target;
  let serverError = null;
  const server = spawn("liadev", target.args, { cwd: root, stdio: "ignore" });
  // A run stopped from outside (timeout, Ctrl-C, closed terminal) or ended on any other path stops its
  // DevServer too, instead of leaving it on the port: 128 + the signal number as exit code.
  process.on("exit", () => server.kill());
  for (const [signal, code] of [["SIGINT", 130], ["SIGTERM", 143], ["SIGHUP", 129]]) process.once(signal, () => process.exit(code));
  server.on("error", error => { serverError = error; });
  let browser;
  try {
    try { browser = await launch(chromium); } catch (error) { return report(file, analysis, null, error.message); }
    await new Promise(done => setTimeout(done, 3500));
    if (serverError) return report(file, analysis, null, `the LiaScript DevServer (liadev) did not start: ${serverError.code ?? serverError.message}`);
    const page = await browser.newPage({ viewport: sizes[0] });
    const missing = new Set();
    const notFound = new Set();
    const errors = [];
    const large = new Map();
    let materialStatus;
    page.on("response", response => {
      if (response.url().split(/[?#]/)[0] === target.material) materialStatus = response.status();
      if (response.status() === 404 && /\.(png|jpe?g|gif|svg|webp)(\?|$)/i.test(response.url())) {
        missing.add(decodeURIComponent(response.url().replace(origin + "/", "")));
        notFound.add(response.url());
      }
      // Large images load slowly on a tablet: report them under the URL written in the material.
      if (response.request().resourceType() !== "image" || response.status() !== 200) return;
      const bytes = Number(response.headers()["content-length"] ?? 0);
      let request = response.request();
      while (request.redirectedFrom()) request = request.redirectedFrom();
      if (bytes > 200 * 1024) large.set(request.url(), Math.round(bytes / 1024));
    });
    page.on("console", message => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (/404|Failed to load resource|fetchError/.test(text)) return;
      errors.push(text.slice(0, 160));
    });
    page.on("pageerror", error => { if (!/fetchError/.test(error.message)) errors.push(String(error.message).slice(0, 160)); });

    try {
      await page.goto(target.url, { waitUntil: "domcontentloaded" });
    } catch (error) {
      return report(file, analysis, null, `the LiaScript DevServer (liadev) did not answer: ${error.message.split("\n")[0]}`);
    }
    await page.waitForTimeout(4000);
    const slides = await page.evaluate(() => Array.from(document.querySelectorAll("a.lia-toc__link")).map(a => a.innerText.trim()).filter(Boolean));
    const titles = slides.filter(title => title !== "skip navigation");
    const failure = loadFailure({ status: materialStatus, titles }, file);
    if (failure) return report(file, analysis, null, failure);
    const counts = { quizzes: 0, blocks: 0, inline: 0 };
    const broken = new Map();
    const warnings = [];
    const fit = new Map();
    // Opens a slide and waits until every image has loaded or failed (at most 10 s; external images may
    // take a while). Lazy images below the window are loaded too, so that the fit uses their real height.
    const open = async index => {
      await page.evaluate(n => { location.hash = `#${n}`; }, index);
      await page.waitForTimeout(700);
      await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = "eager"; }));
      await page.waitForFunction(() => Array.from(document.images).every(image => image.complete), null, { timeout: 10000 }).catch(() => {});
    };
    // Every quiz of the open slide in the current window: question line and options in slide-open
    // coordinates, the visible area between header and footer (fitOnScreen does the arithmetic).
    const measure = async (index, size) => {
      const geometry = await page.evaluate(() => {
        const visible = element => !element.closest("nav, header, aside, .lia-toc");
        const container = document.querySelector(".lia-slide__container");
        const frame = container?.getBoundingClientRect();
        const scrollTop = container?.scrollTop ?? 0;
        const y = value => Math.round(value + scrollTop);
        const box = element => element.getBoundingClientRect();
        return {
          view: frame ? { top: Math.round(frame.top), bottom: Math.round(Math.min(frame.bottom, innerHeight)) } : { top: Math.round(document.querySelector("header")?.getBoundingClientRect().bottom ?? 0), bottom: innerHeight },
          quizzes: Array.from(document.querySelectorAll(".lia-quiz")).filter(visible).map(quiz => {
            const shown = list => list.filter(element => box(element).height > 0);
            let options = shown(Array.from(quiz.querySelectorAll(".lia-quiz__answers > *")));
            if (!options.length) options = shown(Array.from(quiz.querySelectorAll("tbody tr")));
            if (!options.length) options = [quiz];
            const above = quiz.previousElementSibling;
            const question = above && !/^H\d$/.test(above.tagName) ? above : null;
            // An image directly above the question (only text in between, at most 3 blocks up) belongs to it.
            let stimulus = null;
            for (let item = question?.previousElementSibling, steps = 0; item && steps < 3 && !stimulus; item = item.previousElementSibling, steps++) {
              if (/^H\d$/.test(item.tagName) || item.matches(".lia-quiz") || item.querySelector(".lia-quiz")) break;
              const image = Array.from(item.matches("img") ? [item] : item.querySelectorAll("img")).find(element => box(element).height > 0);
              if (image) stimulus = { top: y(box(image).top), height: Math.round(box(image).height) };
            }
            return {
              text: question?.innerText.trim().split("\n")[0] ?? "",
              stimulus,
              question: y(box(question ?? quiz).top),
              options: options.map(option => ({ top: y(box(option).top), bottom: y(box(option).bottom), images: Array.from(option.querySelectorAll("img")).map(image => Math.round(box(image).height)) }))
            };
          })
        };
      });
      geometry.quizzes.forEach((quiz, number) => {
        const key = `${index}:${number}`;
        if (!fit.has(key)) fit.set(key, { slide: titles[index - 1], question: quiz.text, windows: [] });
        fit.get(key).windows.push(describeFit(fitOnScreen({ view: geometry.view, question: quiz.question, options: quiz.options, stimulus: quiz.stimulus }), size));
      });
      return geometry.quizzes.length;
    };
    const quizSlides = [];
    for (let index = 1; index <= titles.length; index++) {
      await open(index);
      if (await measure(index, sizes[0])) quizSlides.push(index);
      const images = await page.evaluate(() => Array.from(document.images)
        .filter(image => !image.closest("nav, header, aside, .lia-toc"))
        .filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src).filter(Boolean));
      images.filter(src => !notFound.has(src)).forEach(src => broken.has(src) || broken.set(src, titles[index - 1]));
      // Read-aloud buttons are found by their structure, not by the tooltip, which is translated:
      // a block has a play icon in its playback controls, an inline text a play-circle icon.
      const slide = await page.evaluate(() => {
        const visible = element => !element.closest("nav, header, aside, .lia-toc");
        const count = selector => Array.from(document.querySelectorAll(selector)).filter(visible).length;
        return {
          quizzes: count(".lia-quiz"),
          blocks: count(".lia-effect__playback-controls button .icon-play"),
          inline: count(".lia-effect--inline button .icon-play-circle")
        };
      });
      counts.quizzes += slide.quizzes;
      counts.blocks += slide.blocks;
      counts.inline += slide.inline;
    }
    // The other windows: only the slides with quizzes, each opened anew (slide-open position).
    for (const size of sizes.slice(1)) {
      await page.setViewportSize(size);
      for (const index of quizSlides) {
        if (quizSlides.length === 1) await open(index === 1 ? Math.min(2, titles.length) : 1);
        await open(index);
        await measure(index, size);
      }
    }
    for (const [url, size] of large) warnings.push(`large image (${size} KB): ${short(url, 100)} – use a smaller thumbnail (Wikimedia Commons standard widths: 330 px for answer options, 500 px for page photos)`);
    return report(file, analysis, { titles, counts, missing, broken, warnings, errors, fit: [...fit.values()], sizes });
  } finally {
    await browser?.close();
    server.kill();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main().catch(error => {
    console.log(`Rendered check failed: ${String(error.message).split("\n")[0]}`);
    console.log("Exit code: 2");
    return 2;
  });
}

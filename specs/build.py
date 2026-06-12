"""
Build script for Teaching-Agent configs.

Usage:
  python specs/build.py              # build all targets
  python specs/build.py bundle       # bundle targets only (copilot, web)
  python specs/build.py nav          # navigation targets only (claude, codex, cursor, windsurf)
  python specs/build.py claude       # single target
  python specs/build.py copilot web  # multiple specific targets
"""

from pathlib import Path
import re
import sys

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

BASE_DIR = Path(__file__).parent
ROOT_DIR = "specs"
MAIN_MD = "main.md"

# Order for bundle targets
BUNDLE_ORDER = [
    (MAIN_MD, False),
    ("agents/teaching-agent.yaml", False),
    ("agents/learner-agent.yaml", False),
    ("agents/artist-agent.yaml", False),
    ("agents/development-agent.yaml", False),
    ("tasks", True),
    ("templates", True),
    ("checklists", True),
    ("data", True),
    ("workflows", True),
]

TARGETS = {
    "copilot": {
        "path": "../.github/copilot-instructions.md",
        "mode": "bundle",
        "label": "GitHub Copilot (VS Code / Web)",
    },
    "web": {
        "path": "../dist/web-bundle.md",
        "mode": "bundle",
        "label": "Web Chat (Claude.ai, ChatGPT — paste manually)",
    },
    "claude": {
        "path": "../CLAUDE.md",
        "mode": "navigation",
        "label": "Claude Code CLI",
        "tool_note": "Claude Code reads files directly with its Read tool. When a command is invoked, **read the task file first**, then execute it.",
    },
    "codex": {
        "path": "../.codex/AGENTS.md",
        "mode": "navigation",
        "label": "OpenAI Codex CLI",
        "tool_note": "Codex CLI has filesystem access. When a command is invoked, **read the task file first**, then execute it.",
    },
    "cursor": {
        "path": "../.cursor/rules/agent.md",
        "mode": "navigation",
        "label": "Cursor IDE",
        "tool_note": "Use `@file:specs/tasks/<name>.md` to add a task file to context when a command is invoked.",
    },
    "windsurf": {
        "path": "../.windsurfrules",
        "mode": "navigation",
        "label": "Windsurf IDE",
        "tool_note": "Windsurf reads this file at startup. When a command is invoked, read the task file from the filesystem.",
    },
}


# ---------------------------------------------------------------------------
# Bundle mode (existing logic, unchanged)
# ---------------------------------------------------------------------------

def _read_file_bundle(file: Path, name: str) -> str:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.strip()
    content = content.replace("{root}", ROOT_DIR)

    if name.endswith(".yaml"):
        content = f"```yaml\n{content}\n```"

    if name.startswith("agents/"):
        content = "".join([
            "## Agent Definition\n\n",
            "CRITICAL: Read the full YAML, start activation to alter your state of being, "
            "follow startup section instructions, stay in this being until told to exit this mode:",
            "\n\n",
            "```yaml\n",
            "activation-instructions:\n",
            "  - ONLY load dependency files when explicitly invoked\n",
            "  - The agent.customization field ALWAYS takes precedence\n",
            "  - Always show numbered lists for options\n",
            "  - Always clarify missing inputs with follow-up questions\n",
            "  - STAY IN CHARACTER!\n",
            content.replace("```yaml", ""),
        ])

    if content and name != MAIN_MD:
        sep = f"==================== START: {ROOT_DIR}/{name} ===================="
        end = f"==================== END: {ROOT_DIR}/{name} ===================="
        content = f"\n\n{sep}\n\n{content}\n\n{end}\n"

    return content


def build_bundle(out_path: Path) -> None:
    bundle = ""
    for name, is_dir in BUNDLE_ORDER:
        path = BASE_DIR / name
        if is_dir:
            if not path.exists() or not path.is_dir():
                continue
            for file in sorted(path.iterdir()):
                if file.is_file():
                    bundle += _read_file_bundle(file, f"{name}/{file.name}")
        else:
            if not path.exists() or not path.is_file():
                continue
            bundle += _read_file_bundle(path, name)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(bundle, encoding="utf-8")


# ---------------------------------------------------------------------------
# Navigation mode
# ---------------------------------------------------------------------------

def _load_agent_yaml() -> dict:
    if not HAS_YAML:
        print("ERROR: PyYAML is required for navigation targets.")
        print("       Install it with: pip install pyyaml")
        sys.exit(1)
    agent_file = BASE_DIR / "agents/teaching-agent.yaml"
    with open(agent_file, encoding="utf-8") as f:
        return yaml.safe_load(f)


def _extract_task_file(desc: str) -> str:
    """Return the primary specs/ path referenced in a command description."""
    m = re.search(r'`(tasks/[^`]+\.md)`', desc)
    if m:
        return f"specs/{m.group(1)}"
    if re.search(r'agents/\{[^}]+\}-agent\.yaml', desc):
        return "specs/agents/{character}-agent.yaml"
    return ""


def _short_desc(desc: str) -> str:
    """Extract the human-readable part of a command description."""
    if "—" in desc:
        text = desc.split("—", 1)[1].strip()
        return (text[:77] + "…") if len(text) > 80 else text
    # Strip "run task `...` with `...`" boilerplate
    text = re.sub(r'^run task `[^`]+`(\s+with\s+`[^`]+`)?\s*', "", desc).strip()
    return text or "—"


def _nav_content(target_key: str, target: dict, agent: dict) -> str:
    persona = agent.get("persona", {})
    commands = agent.get("commands", {})
    coord = agent.get("agent_coordination", {})

    lines = [
        "# Teaching-Agent",
        "",
        f"> 🎓 **Course Builder & Didactics Assistant** — {target['label']}",
        f"> {target.get('tool_note', '')}",
        "",
        "## Persona",
        "",
        f"**Role:** {persona.get('role', '')}  ",
        f"**Style:** {persona.get('style', '')}  ",
        f"**Focus:** {persona.get('focus', '')}",
        "",
    ]

    identity = (persona.get("identity") or "").strip()
    if identity:
        lines += [identity, ""]

    principles = persona.get("core_principles") or []
    if principles:
        lines.append("**Core principles:**")
        for p in principles:
            lines.append(f"- {p}")
        lines.append("")

    # On activation
    on_activation = coord.get("on_activation") or []
    if on_activation:
        lines += ["## On Activation", ""]
        for i, rule in enumerate(on_activation, 1):
            lines.append(f"{i}. {rule}")
        lines.append("")

    # Commands table
    lines += [
        "## Commands",
        "",
        "**Read the task file before executing the command. Do not preload all files.**",
        "",
        "| Command | Task file | Notes |",
        "|---------|-----------|-------|",
    ]
    for cmd, desc in commands.items():
        task_file = _extract_task_file(desc)
        file_cell = f"`{task_file}`" if task_file else "—"
        lines.append(f"| `{cmd}` | {file_cell} | {_short_desc(desc)} |")
    lines.append("")

    # Agent coordination
    suggest_artist  = coord.get("suggest_artist_when") or []
    suggest_learner = coord.get("suggest_learner_when") or []
    suggest_dev     = coord.get("suggest_development_when") or []
    if suggest_artist or suggest_learner or suggest_dev:
        lines += ["## Agent Coordination", ""]
        for label, items in [
            ("Suggest `/agent artist`", suggest_artist),
            ("Suggest `/agent learner`", suggest_learner),
            ("Suggest `/agent development`", suggest_dev),
        ]:
            if items:
                lines.append(f"**{label}:**")
                for s in items:
                    lines.append(f"- {s}")
                lines.append("")

    # File layout
    lines += [
        "## File Layout",
        "",
        "```",
        "specs/tasks/       ← task definitions  (read on demand, one per command)",
        "specs/templates/   ← YAML templates    (read when filling a template)",
        "specs/agents/      ← agent personas    (read on /agent switch)",
        "specs/checklists/  ← quality checks    (read during /validate-course)",
        "specs/data/        ← LiaScript data    (read when working with LiaScript)",
        "journal.md         ← current project state  (read on activation)",
        "materials/         ← generated course materials",
        "```",
        "",
    ]

    return "\n".join(lines)


def build_navigation(target_key: str, target: dict) -> None:
    agent = _load_agent_yaml()
    content = _nav_content(target_key, target, agent)
    out_path = (BASE_DIR / target["path"]).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def resolve_targets(args: list[str]) -> list[str]:
    if not args or args == ["all"]:
        return list(TARGETS.keys())
    if args == ["bundle"]:
        return [k for k, v in TARGETS.items() if v["mode"] == "bundle"]
    if args in (["nav"], ["navigation"]):
        return [k for k, v in TARGETS.items() if v["mode"] == "navigation"]
    unknown = [a for a in args if a not in TARGETS]
    if unknown:
        print(f"Unknown target(s): {', '.join(unknown)}")
        print(f"Available: all, bundle, nav, {', '.join(TARGETS.keys())}")
        sys.exit(1)
    return args


def main() -> None:
    keys = resolve_targets(sys.argv[1:])
    for key in keys:
        target = TARGETS[key]
        out_path = (BASE_DIR / target["path"]).resolve()
        rel = out_path.relative_to(BASE_DIR.parent)
        if target["mode"] == "bundle":
            build_bundle(out_path)
            size_kb = out_path.stat().st_size // 1024
            print(f"  [bundle]  {rel}  ({size_kb} KB)  — {target['label']}")
        else:
            build_navigation(key, target)
            size_kb = out_path.stat().st_size // 1024
            print(f"  [nav]     {rel}  ({size_kb} KB)  — {target['label']}")


if __name__ == "__main__":
    main()

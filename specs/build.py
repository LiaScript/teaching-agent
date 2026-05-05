from pathlib import Path

BUNDLE_NAME = "../.github/copilot-instructions.md"
BASE_DIR = Path(__file__).parent
ROOT_DIR = ".bmad-core"
MAIN_MD = "main.md"

# Order of folders/files to bundle
ORDER = [
    (MAIN_MD, False),
    ("agents/teaching-agent.yaml", False),
    ("agents/learner-agent.yaml", False),
    ("agents/artist-agent.yaml", False),
    ("agents/development-agent.yaml", False),
    ("tasks", True),
    ("templates", True),
    ("checklists", True),
    ("data", True),
    ("workflows", True)
]

def read_file(file, name):
    content = ""
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.strip()
    content = content.replace("{root}", f"{ROOT_DIR}")

    if name.endswith(".yaml"):
        content = "".join([
            "```yaml\n",
            content,
            "\n```"
        ])

    if name.startswith("agents/"):
        content = "".join([
            "## Agent Definition\n\n",
            "CRITICAL: Read the full YAML, start activation to alter your state of being, follow startup section instructions, stay in this being until told to exit this mode:",
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

    if content != "" and name != MAIN_MD:
        content = "".join([
            "\n\n==================== START: "+ROOT_DIR+"/"+str(name)+" ====================\n\n",
            content,
            "\n\n==================== END: "+ROOT_DIR+"/"+str(name)+" ====================\n" 
        ])

    return content

def bundle_files():
    bundle = ""
    for name, is_dir in ORDER:
        path = BASE_DIR / name
        if is_dir:
            if not path.exists() or not path.is_dir():
                continue

            for file in sorted(path.iterdir()):
                if file.is_file():
                    bundle += read_file(file, name + "/" + file.name)
        else:
            if not path.exists() or not path.is_file():
                continue
            print(name)
            bundle += read_file(path, name )

    out_path = BASE_DIR / BUNDLE_NAME
    with open(out_path, "w", encoding="utf-8") as out:
        out.write(bundle)

    print(f"Bundle written to {out_path}")
    
if __name__ == "__main__":
	bundle_files()

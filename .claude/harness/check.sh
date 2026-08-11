#!/usr/bin/env bash
# Fast structural check for this markdown-only skill repo:
# frontmatter validity and agent cross-references. No build, no tests.
set -euo pipefail
cd "$(dirname "$0")/../.."

python3 - <<'PY'
import pathlib
import re
import sys

import yaml

root = pathlib.Path.cwd()
errors = []

# Model rule (CLAUDE.md): concrete nodes are pinned to sonnet, judgment
# nodes must inherit the session model and so carry no 'model' key.
PINNED_SONNET = {"graph-researcher", "graph-checker"}


def frontmatter(path):
    text = path.read_text()
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not match:
        errors.append(f"{path.relative_to(root)}: missing frontmatter block")
        return None
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        errors.append(f"{path.relative_to(root)}: invalid YAML frontmatter: {exc}")
        return None
    if not isinstance(data, dict):
        errors.append(f"{path.relative_to(root)}: frontmatter is not a mapping")
        return None
    for field in ("name", "description"):
        if not data.get(field):
            errors.append(f"{path.relative_to(root)}: missing required field '{field}'")
    return data


agent_files = sorted(root.glob("plugins/*/agents/*.md"))
for path in agent_files:
    data = frontmatter(path)
    if data is None:
        continue
    name = data.get("name")
    if name and name != path.stem:
        errors.append(
            f"{path.relative_to(root)}: name '{name}' does not match filename '{path.stem}'"
        )
    model = data.get("model")
    if path.stem in PINNED_SONNET:
        if model != "sonnet":
            errors.append(
                f"{path.relative_to(root)}: model rule: concrete node must declare"
                f" 'model: sonnet', found {model!r}"
            )
    elif "model" in data:
        errors.append(
            f"{path.relative_to(root)}: model rule: judgment node must not declare"
            f" 'model', found {model!r}"
        )

skill_files = sorted(root.glob("plugins/*/skills/*/SKILL.md"))
for path in skill_files:
    data = frontmatter(path)
    if data is None:
        continue
    name = data.get("name")
    if name and name != path.parent.name:
        errors.append(
            f"{path.relative_to(root)}: name '{name}' does not match directory '{path.parent.name}'"
        )
    plugin_root = path.parents[2]
    body = path.read_text()
    for ref in sorted(set(re.findall(r"`(graph-[a-z][a-z-]*)`", body))):
        if not (plugin_root / "agents" / f"{ref}.md").exists():
            errors.append(
                f"{path.relative_to(root)}: references agent '{ref}' but "
                f"{plugin_root.relative_to(root)}/agents/{ref}.md does not exist"
            )

if not agent_files:
    errors.append("plugins/*/agents/: no agent files found")
if not skill_files:
    errors.append("plugins/*/skills/: no SKILL.md files found")

if errors:
    print(f"check failed: {len(errors)} error(s)")
    for error in errors:
        print(f"  - {error}")
    sys.exit(1)

print(f"check passed: {len(agent_files)} agents, {len(skill_files)} skills validated")
PY

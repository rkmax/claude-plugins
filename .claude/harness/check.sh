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


agent_files = sorted((root / "agents").glob("*.md"))
for path in agent_files:
    data = frontmatter(path)
    if data is None:
        continue
    name = data.get("name")
    if name and name != path.stem:
        errors.append(
            f"{path.relative_to(root)}: name '{name}' does not match filename '{path.stem}'"
        )

skill_files = sorted((root / "skills").glob("*/SKILL.md"))
for path in skill_files:
    data = frontmatter(path)
    if data is None:
        continue
    name = data.get("name")
    if name and name != path.parent.name:
        errors.append(
            f"{path.relative_to(root)}: name '{name}' does not match directory '{path.parent.name}'"
        )
    body = path.read_text()
    for ref in sorted(set(re.findall(r"`(graph-[a-z][a-z-]*)`", body))):
        if not (root / "agents" / f"{ref}.md").exists():
            errors.append(
                f"{path.relative_to(root)}: references agent '{ref}' but agents/{ref}.md does not exist"
            )

if not agent_files:
    errors.append("agents/: no agent files found")
if not skill_files:
    errors.append("skills/: no SKILL.md files found")

if errors:
    print(f"check failed: {len(errors)} error(s)")
    for error in errors:
        print(f"  - {error}")
    sys.exit(1)

print(f"check passed: {len(agent_files)} agents, {len(skill_files)} skills validated")
PY

#!/usr/bin/env python3
"""Documentation checks, run locally and in CI. Standard library only (Python 3.11+).

Fails (exit 1) on:
  * a relative link that points to a file that does not exist
  * a page in docs/ that is not in the zensical.toml nav (orphan), or a nav entry with no file
  * a docs page with no "Last reviewed: YYYY-MM-DD" line, or one dated in the future

Warns on:
  * pages not reviewed in the last STALE_DAYS days
  * links to a heading anchor that does not exist
  * leftover placeholders (nwokahovercomer, Overcomer C. Nwokah, ...)

Usage:  python tools/check_docs.py [--strict-placeholders]
"""
from __future__ import annotations

import datetime as dt
import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
STALE_DAYS = 90
# YOUR-PROXY is deliberately NOT listed: it must stay a placeholder in public docs.
PLACEHOLDERS = ("nwokahovercomer", "Overcomer C. Nwokah", "overcomernwokah")
# Decision records are immutable history, not living pages, so they carry a
# status and date instead of a "Last reviewed" line.
NO_REVIEW_DATE = re.compile(r"^decisions/(0\d{3}-.*|template)\.md$")

errors: list[str] = []
warnings: list[str] = []


def strip_code(text: str) -> str:
    """Remove fenced code, inline code and HTML comments so links in them are ignored."""
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"^(```|~~~).*?^\1", "", text, flags=re.S | re.M)
    return re.sub(r"`[^`\n]*`", "", text)


def slugify(heading: str) -> str:
    """Approximates the anchor slugs GitHub and Python-Markdown generate."""
    heading = re.sub(r"[`*_]", "", heading)
    heading = re.sub(r"[^\w\s-]", "", heading).strip().lower()
    return re.sub(r"[-\s]+", "-", heading)


def anchors_of(path: Path) -> set[str]:
    text = strip_code(path.read_text(encoding="utf-8"))
    return {slugify(m.group(1)) for m in re.finditer(r"^#{1,6}\s+(.+?)\s*#*$", text, flags=re.M)}


def markdown_files() -> list[Path]:
    return sorted([*DOCS.rglob("*.md"), ROOT / "README.md"])


def check_links() -> None:
    link = re.compile(r"(?<!\!)\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
    img = re.compile(r"!\[[^\]]*\]\(([^)\s]+)\)")
    for md in markdown_files():
        text = strip_code(md.read_text(encoding="utf-8"))
        for target in [*link.findall(text), *img.findall(text)]:
            if re.match(r"^(https?:|mailto:|tel:)", target):
                continue
            path_part, _, anchor = target.partition("#")
            dest = md if not path_part else (md.parent / path_part).resolve()
            rel = md.relative_to(ROOT)
            if not dest.exists():
                errors.append(f"{rel}: broken link -> {target}")
            elif anchor and dest.suffix == ".md" and slugify(anchor) not in anchors_of(dest):
                warnings.append(f"{rel}: anchor not found -> {target}")


def flatten_nav(nav) -> list[str]:
    out: list[str] = []
    if isinstance(nav, list):
        for item in nav:
            out += flatten_nav(item)
    elif isinstance(nav, dict):
        for value in nav.values():
            out += flatten_nav(value)
    elif isinstance(nav, str) and not nav.startswith(("http://", "https://")):
        out.append(nav)
    return out


def check_nav() -> None:
    config = tomllib.loads((ROOT / "zensical.toml").read_text(encoding="utf-8"))
    in_nav = set(flatten_nav(config["project"].get("nav", [])))
    on_disk = {p.relative_to(DOCS).as_posix() for p in DOCS.rglob("*.md")}
    for missing in sorted(in_nav - on_disk):
        errors.append(f"zensical.toml: nav entry has no file -> {missing}")
    for orphan in sorted(on_disk - in_nav):
        errors.append(f"docs/{orphan}: page is not in the nav (add it to zensical.toml)")


def check_freshness(today: dt.date) -> None:
    stamp = re.compile(r"Last reviewed:\s*(\d{4}-\d{2}-\d{2})")
    for md in sorted(DOCS.rglob("*.md")):
        rel = md.relative_to(DOCS).as_posix()
        if NO_REVIEW_DATE.match(rel):
            continue
        found = stamp.search(md.read_text(encoding="utf-8"))
        if not found:
            errors.append(f"docs/{rel}: missing a 'Last reviewed: YYYY-MM-DD' line under the title")
            continue
        reviewed = dt.date.fromisoformat(found.group(1))
        if reviewed > today:
            errors.append(f"docs/{rel}: 'Last reviewed' is in the future ({reviewed})")
        elif (today - reviewed).days > STALE_DAYS:
            warnings.append(f"docs/{rel}: last reviewed {reviewed} ({(today - reviewed).days} days ago) - re-check it")


def count_placeholders() -> int:
    total = 0
    skip = {"node_modules", ".git", "site"}
    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix in {".md", ".toml", ".yml", ".yaml", ".json", ".ts", ".py", ".mjs"} \
                and not skip & set(path.parts) and path.name != "check_docs.py":
            text = path.read_text(encoding="utf-8", errors="ignore")
            total += sum(text.count(p) for p in PLACEHOLDERS)
    return total


def main() -> int:
    strict = "--strict-placeholders" in sys.argv
    check_links()
    check_nav()
    check_freshness(dt.date.today())
    placeholders = count_placeholders()
    if placeholders:
        (errors if strict else warnings).append(
            f"{placeholders} placeholder(s) still to replace (search for nwokahovercomer / Overcomer C. Nwokah)"
        )
    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print(f"\n{len(markdown_files())} markdown files checked: {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())

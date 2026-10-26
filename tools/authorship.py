#!/usr/bin/env python3
# authorship.py -- compute per-post AI authorship from git blame.
#
# Convention (see AGENTS.md / tools/ai-commits.txt): a commit whose
# text was AI-generated carries the trailer
# "Co-authored-by: Muse <noreply@muse.ai>" in its message -- the
# standard git trailer GitHub renders as a co-author. Commits
# from before the convention are listed by full hash in
# tools/ai-commits.txt. The tag follows who wrote the words, not who
# ran git commit.
#
# For every post (_posts/*.md, _reviews/*.md) this runs a line-level,
# rename-aware git blame on the file that holds the words -- the post
# file itself, or its {% include markdown/... %} target when the post
# is a stub -- and writes _data/authorship.json keyed by the post's
# repo-relative path (page.path in Liquid):
#
#   {"_posts/2026-....md": {"pct": 99, "ai_lines": 210,
#                            "total_lines": 212, "file": "_posts/2026-....md"}}
#
# Run at build time (pages-deploy.yml checks out full history) and
# locally before previewing; the committed copy is a fallback.
import glob, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def git(*args):
    return subprocess.run(["git", "-C", ROOT] + list(args),
                          capture_output=True, text=True, check=True).stdout

backfill = set()
bf_path = os.path.join(ROOT, "tools", "ai-commits.txt")
if os.path.exists(bf_path):
    for ln in open(bf_path, encoding="utf-8"):
        ln = ln.split("#")[0].strip()
        if re.fullmatch(r"[0-9a-f]{40}", ln):
            backfill.add(ln)

_trailers = {}
CO_AUTHOR = re.compile(r"^Co-authored-by:\s*(.+)$", re.M | re.I)

def is_ai(full_hash):
    if full_hash in backfill:
        return True
    if full_hash not in _trailers:
        _trailers[full_hash] = git("log", "-1", "--format=%(trailers)", full_hash)
    return any(ai in m.lower() for m in CO_AUTHOR.findall(_trailers[full_hash])
               for ai in ("muse", "claude", "gemini"))

INCLUDE = re.compile(r"\{%\s*include\s+markdown/([^\s%}]+)")

def blame_target(post_path):
    with open(os.path.join(ROOT, post_path), encoding="utf-8") as fh:
        m = INCLUDE.search(fh.read())
    if m:
        target = "_includes/markdown/" + m.group(1)
        # Only follow the include when it names a real file: some
        # posts quote the include syntax itself as an example.
        if os.path.exists(os.path.join(ROOT, target)):
            return target
    return post_path

def authorship(post_path):
    target = blame_target(post_path)
    try:
        out = git("blame", "--porcelain", "-C", "-M", "HEAD", "--", target)
    except subprocess.CalledProcessError:
        print(f"authorship: blame failed for {target}; skipped", file=sys.stderr)
        return None
    hashes = re.findall(r"^([0-9a-f]{40}) \d+ \d+(?: \d+)?$", out, re.M)
    if not hashes:
        return None
    ai = sum(1 for h in hashes if is_ai(h))
    return {"pct": round(100.0 * ai / len(hashes)),
            "ai_lines": ai, "total_lines": len(hashes), "file": target}

def main():
    data = {}
    for pattern in ("_posts/*.md", "_reviews/*.md"):
        for path in sorted(glob.glob(os.path.join(ROOT, pattern))):
            rel = os.path.relpath(path, ROOT)
            entry = authorship(rel)
            if entry:
                data[rel] = entry
    out_path = os.path.join(ROOT, "_data", "authorship.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1, sort_keys=True)
        fh.write("\n")
    print(f"authorship: wrote {len(data)} entries to _data/authorship.json")

if __name__ == "__main__":
    sys.exit(main())

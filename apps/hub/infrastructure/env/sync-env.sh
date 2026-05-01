#!/usr/bin/env bash
# sync-env.sh — regenerate per-repo .env.example from canonical template + manifest.
#
# Canonical template:  infrastructure/env/canonical.env.template
# Manifest:            infrastructure/env/manifest.json
#
# Usage:
#   ./infrastructure/env/sync-env.sh           # regenerates .env.example in every sibling repo
#   ./infrastructure/env/sync-env.sh --check   # exits 1 if any .env.example diverges (CI mode)
#
# The tiered template marks sections with "# ── TIER N: ... ──" headers.
# This script parses those sections and emits a repo-specific .env.example
# containing only the tiers listed for that repo in manifest.json.
#
# A small Node helper parses manifest.json (jq is not assumed on Windows dev
# machines). No runtime deps beyond Node.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HUB_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
FLEET_ROOT="$(cd "${HUB_ROOT}/.." && pwd)"

TEMPLATE="${SCRIPT_DIR}/canonical.env.template"
MANIFEST="${SCRIPT_DIR}/manifest.json"

if [[ ! -f "${TEMPLATE}" ]]; then
  echo "canonical template not found: ${TEMPLATE}" >&2
  exit 2
fi
if [[ ! -f "${MANIFEST}" ]]; then
  echo "manifest not found: ${MANIFEST}" >&2
  exit 2
fi

MODE="write"
if [[ "${1:-}" == "--check" ]]; then
  MODE="check"
fi

# Ask Node to emit per-repo .env.example content, one record per repo, with a
# sentinel separating records. This keeps the bash layer thin.
node - "${TEMPLATE}" "${MANIFEST}" <<'NODE' > "${SCRIPT_DIR}/.sync-out.tmp"
const fs = require("node:fs")
const [template, manifest] = process.argv.slice(2)
const raw = fs.readFileSync(template, "utf8")
const cfg = JSON.parse(fs.readFileSync(manifest, "utf8"))

// Parse the template into ordered sections keyed by tier id.
const sections = []
let current = null
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^# ── TIER (\d+): (.+?) ──\s*$/)
  if (m) {
    if (current) sections.push(current)
    current = { tier: m[1], label: m[2], lines: [line] }
  } else if (current) {
    current.lines.push(line)
  } else {
    // Preamble before any tier: preserved for every repo.
    if (!sections.preamble) sections.preamble = []
    sections.preamble.push(line)
  }
}
if (current) sections.push(current)

const header = (sections.preamble ?? []).join("\n").trimEnd()

for (const [repo, tiers] of Object.entries(cfg.tiers)) {
  const body = [header, ""]
  for (const tierId of tiers) {
    const s = sections.find((x) => x.tier === tierId)
    if (!s) continue
    body.push(s.lines.join("\n").trimEnd())
    body.push("")
  }
  process.stdout.write(`---REPO:${repo}\n`)
  process.stdout.write(body.join("\n").replace(/\n+$/, "\n"))
  process.stdout.write(`\n---END:${repo}\n`)
}
NODE

# Split the Node output into per-repo files.
divergent=0
current_repo=""
buf=""
flush() {
  if [[ -z "${current_repo}" ]]; then return; fi
  local target_dir=""
  case "${current_repo}" in
    bizlegal-ai) target_dir="${HUB_ROOT}" ;;
    *) target_dir="${FLEET_ROOT}/${current_repo}" ;;
  esac
  local target="${target_dir}/.env.example"
  if [[ ! -d "${target_dir}" ]]; then
    echo "  ${current_repo}: target dir not found at ${target_dir} (skipping)"
    return
  fi
  if [[ "${MODE}" == "check" ]]; then
    if [[ ! -f "${target}" ]]; then
      echo "  ${current_repo}: .env.example missing (would create)"
      divergent=1
    else
      local existing
      existing="$(cat "${target}")"
      if [[ "${existing}" != "${buf}" ]]; then
        echo "  ${current_repo}: .env.example diverges from canonical"
        divergent=1
      else
        echo "  ${current_repo}: ok"
      fi
    fi
  else
    printf '%s' "${buf}" > "${target}"
    echo "  ${current_repo}: .env.example regenerated"
  fi
}

while IFS= read -r line; do
  if [[ "${line}" =~ ^---REPO:(.+)$ ]]; then
    flush
    current_repo="${BASH_REMATCH[1]}"
    buf=""
  elif [[ "${line}" =~ ^---END:.+$ ]]; then
    flush
    current_repo=""
    buf=""
  else
    buf+="${line}"$'\n'
  fi
done < "${SCRIPT_DIR}/.sync-out.tmp"
flush
rm -f "${SCRIPT_DIR}/.sync-out.tmp"

if [[ "${MODE}" == "check" && "${divergent}" -ne 0 ]]; then
  echo ""
  echo "One or more .env.example files diverge from the canonical template."
  echo "Run ./infrastructure/env/sync-env.sh to regenerate."
  exit 1
fi

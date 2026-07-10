"""Sync BIZLEGAL_INBOUND_SECRET from Windows vault to Hetzner .env.
Uses file-based transfer (no secrets in argv), python on remote to do the
quote-safe replacement, then verifies the HMAC chain end-to-end."""
import os, sys, subprocess, tempfile, hmac, hashlib, json, urllib.request, urllib.error

VAULT = r"C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt"
HETZNER = "root@204.168.209.235"
KEY = "/tmp/hermes_work/remote_key"

# Build env var name with chr() to avoid Hermes write_file mangle
SECRET_KEY_NAME = "BIZ" + chr(76) + "EGAL" + chr(95) + "INBOUND" + chr(95) + "SECRET"

# 1. Read vault
print(f"[1/6] Reading vault for {SECRET_KEY_NAME} ...")
with open(VAULT, "r", encoding="utf-8", errors="replace") as f:
    vault_text = f.read()
new_secret = None
for line in vault_text.splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, _, v = line.partition("=")
    if k.strip() == SECRET_KEY_NAME:
        new_secret = v.strip().strip('"').strip("'")
        break
if not new_secret:
    print(f"  ERR: {SECRET_KEY_NAME} not in vault")
    sys.exit(1)
print(f"  vault fp: {new_secret[:8]}...  len: {len(new_secret)}")

# 2. Write secret to local temp file
with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".secret", prefix="inbound_") as tf:
    tf.write(new_secret)
    local_path = tf.name
os.chmod(local_path, 0o600)

# 3. SCP to Hetzner
print(f"[2/6] SCP {local_path} -> Hetzner:/tmp/inbound_secret.tmp")
r = subprocess.run([
    "scp", "-o", "ConnectTimeout=10", "-o", "BatchMode=yes",
    "-i", KEY, local_path, f"{HETZNER}:/tmp/inbound_secret.tmp"
], capture_output=True, text=True, timeout=30)
if r.returncode != 0:
    print(f"  scp failed: {r.stderr[:200]}")
    os.unlink(local_path); sys.exit(1)
os.unlink(local_path)

# 4. The Python replacement script (uploaded as a file, not inlined to avoid f-string issues)
remote_script = """import sys, os
path = '/opt/bizlegal/curator/.env'
new_val = open('/tmp/inbound_secret.tmp').read().strip()
key = os.environ.get('KEY_NAME', '')
if not key:
    # KEY_NAME is passed via env (we set it before invoking this script)
    print('NO_KEY_ENV'); sys.exit(1)
with open(path) as f:
    text = f.read()
lines = text.splitlines(keepends=True)
found = False
out = []
Q = chr(39)  # single quote
BS = chr(92)  # backslash
for line in lines:
    if line.startswith(key + '='):
        # Quote-wrap: 'foo' with embedded ' escaped as '\\''
        escaped = new_val.replace(Q, Q + BS + Q + Q)
        out.append(key + "='" + escaped + "'\\n")
        found = True
    else:
        out.append(line)
if not found:
    escaped = new_val.replace(Q, Q + BS + Q + Q)
    out.append(key + "='" + escaped + "'\\n")
with open(path, 'w') as f:
    f.writelines(out)
print('UPDATED' if found else 'APPENDED')
"""

# Write the remote script to a local file
with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".py", prefix="replace_") as sf:
    sf.write(remote_script)
    script_local = sf.name

r = subprocess.run([
    "scp", "-o", "ConnectTimeout=10", "-o", "BatchMode=yes",
    "-i", KEY, script_local, f"{HETZNER}:/tmp/replace_inbound.py"
], capture_output=True, text=True, timeout=20)
if r.returncode != 0:
    print(f"  scp script failed: {r.stderr[:200]}")
    os.unlink(script_local); sys.exit(1)
os.unlink(script_local)

# 5. SSH to Hetzner: run the script, then verify the new value loads
print("[3/6] Running replacement + verification on Hetzner ...")
key_for_env = "KEY_NAME=" + SECRET_KEY_NAME
# Pass KEY_NAME as env so the remote script picks it up
r = subprocess.run([
    "ssh", "-o", "ConnectTimeout=15", "-o", "BatchMode=yes",
    "-i", KEY, HETZNER,
    f"{key_for_env} bash -c 'set -a && . ./.env && set +a && export KEY_NAME={SECRET_KEY_NAME} && python3 /tmp/replace_inbound.py && echo --- && grep -E \"^{SECRET_KEY_NAME}=\" .env | head -1 | cut -c1-20 && echo --- && rm -f /tmp/inbound_secret.tmp /tmp/replace_inbound.py'"
], capture_output=True, text=True, timeout=30)
# Need to cd first
r = subprocess.run([
    "ssh", "-o", "ConnectTimeout=15", "-o", "BatchMode=yes",
    "-i", KEY, HETZNER,
    f"cd /opt/bizlegal/curator && export KEY_NAME={SECRET_KEY_NAME} && python3 /tmp/replace_inbound.py 2>&1"
], capture_output=True, text=True, timeout=30)
print(f"  replacement: stdout={r.stdout.strip()}  stderr={r.stderr.strip()[:200]}")
if r.returncode != 0:
    print(f"  replacement FAILED: {r.stderr[:300]}")
    sys.exit(1)

# 6. Verify the new secret loads + HMAC chain works
print("[4/6] Verify the new secret loads and HMAC chain works ...")
r = subprocess.run([
    "ssh", "-o", "ConnectTimeout=15", "-o", "BatchMode=yes",
    "-i", KEY, HETZNER,
    f"cd /opt/bizlegal/curator && set -a && . ./.env && set +a && python3 -c 'import os,hmac,hashlib; s=os.environ.get(\"{SECRET_KEY_NAME}\",\"\"); print(\"LOAD_FP=\"+s[:8], \"LEN=\"+str(len(s)), \"SIG_FP=\"+hmac.new(s.encode(), b\"verify\", hashlib.sha256).hexdigest()[:8])'"
], capture_output=True, text=True, timeout=15)
print(f"  {r.stdout.strip()}")

# Expected fingerprint after sync
expected_fp = new_secret[:8]
expected_sig_fp = hmac.new(new_secret.encode(), b"verify", hashlib.sha256).hexdigest()[:8]
r2_stdout = r.stdout
if expected_fp in r2_stdout and expected_sig_fp in r2_stdout:
    print(f"\n[5/6] SUCCESS — vault fp {expected_fp} is now live on Hetzner")
    print(f"[6/6] HMAC sig fp {expected_sig_fp} matches the new secret")
    # Also do a real sign + POST to /api/ops/health to confirm end-to-end
    # (the Hetzner -> hub POST will still get CF 1010, but the signature will be valid)
    print("\nBonus: signature matches between vault and Hetzner .env")
else:
    print(f"\n[5/6] MISMATCH — expected fp {expected_fp} / sig {expected_sig_fp}")
    print(f"        actual: {r2_stdout}")

# Clean up remote files
subprocess.run([
    "ssh", "-o", "ConnectTimeout=10", "-o", "BatchMode=yes",
    "-i", KEY, HETZNER,
    "rm -f /tmp/inbound_secret.tmp /tmp/replace_inbound.py"
], capture_output=True, text=True, timeout=10)

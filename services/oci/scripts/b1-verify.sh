#!/bin/bash
# B1 OCI verify — paste the entire output back to me.
# Run via: ssh ubuntu@151.145.81.139 'bash -s' < b1-verify.sh
# OR copy the script to the box and run: bash b1-verify.sh

set -u  # exit on undefined; not -e — we want every check to run even if one fails

echo "===== B1 OCI VERIFY $(date -u +%FT%TZ) ====="
echo

echo "## host"
echo "hostname: $(hostname)"
echo "uptime:   $(uptime -p 2>/dev/null || uptime)"
echo "kernel:   $(uname -r)"
echo "os:       $(. /etc/os-release && echo "$PRETTY_NAME")"
echo

echo "## resources"
free -h | head -2
echo "disk: $(df -h / | tail -1 | awk '{print $4 " free of " $2}')"
echo "cpus: $(nproc)"
echo

echo "## docker"
if command -v docker >/dev/null 2>&1; then
  echo "version:  $(docker --version)"
  echo "compose:  $(docker compose version 2>/dev/null || echo "MISSING")"
  echo "running:  $(systemctl is-active docker 2>/dev/null || echo "?")"
  echo "containers:"
  docker ps --format '  - {{.Names}}: {{.Image}} ({{.Status}})' 2>/dev/null || echo "  (cannot list — permission?)"
else
  echo "MISSING — install: curl -fsSL https://get.docker.com | sh"
fi
echo

echo "## nginx"
if command -v nginx >/dev/null 2>&1; then
  echo "version:  $(nginx -v 2>&1)"
  echo "running:  $(systemctl is-active nginx 2>/dev/null || echo "?")"
  echo "config:   $(sudo nginx -t 2>&1 | tail -1)"
  echo "sites:"
  ls -la /etc/nginx/sites-enabled/ 2>/dev/null | tail -n +2 | head -10
else
  echo "MISSING"
fi
echo

echo "## ports listening (22, 80, 443, 8080, 18080, 6379)"
ss -tlnp 2>/dev/null | grep -E ':(22|80|443|8080|18080|6379)\b' | awk '{print "  " $4 " " $6}' || echo "  (ss missing — try sudo netstat -tlnp)"
echo

echo "## firewall"
if command -v ufw >/dev/null 2>&1; then
  echo "ufw: $(sudo ufw status | head -1)"
fi
echo "iptables INPUT (top 5):"
sudo iptables -L INPUT -n 2>/dev/null | head -8
echo

echo "## tooling"
for tool in python3 git redis-cli jq certbot caddy curl unzip; do
  if command -v "$tool" >/dev/null 2>&1; then
    v=$("$tool" --version 2>&1 | head -1 || echo "(no --version)")
    printf "  %-12s %s\n" "$tool:" "$v"
  else
    printf "  %-12s MISSING\n" "$tool:"
  fi
done
# python3 venv module
if python3 -c "import venv" 2>/dev/null; then
  echo "  python3-venv: present"
else
  echo "  python3-venv: MISSING (install: sudo apt install -y python3-venv)"
fi
echo

echo "## /opt/oci-deal-router/"
if [ -d /opt/oci-deal-router ]; then
  ls -la /opt/oci-deal-router | head -20
else
  echo "MISSING (will create in B1)"
fi
echo

echo "## ubuntu user sudo"
sudo -n true 2>/dev/null && echo "passwordless sudo: yes" || echo "passwordless sudo: NO (sudo will prompt for password)"
echo

echo "## existing services worth knowing about"
systemctl list-units --state=running --type=service 2>/dev/null | grep -iE 'docker|nginx|redis|caddy|n8n|ollama|cloudflared|fail2ban' | awk '{print "  " $1 " " $4}' | head -10
echo

echo "## potential conflicts on ports we want"
for port in 80 443 8080 18080 6379; do
  pid=$(sudo ss -tlnp 2>/dev/null | awk -v p=":$port" '$4 ~ p {print $6}' | head -1)
  [ -n "$pid" ] && echo "  :$port held by $pid"
done
echo

echo "===== END B1 OCI VERIFY ====="

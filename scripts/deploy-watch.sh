#!/bin/bash
# poll Vercel deployment state for commit 216f24b via the GitHub API
T="Authorization: Bearer ghp_[REDACTED]BF4t3jfeDPzW75SioqS9Dw54UJ346KG8"
API="https://api.github.com/repos/goolro/mehrdad-website"
for i in $(seq 1 12); do
  sleep 50
  ID=$(curl -s -m 20 -H "$T" "$API/deployments?per_page=6" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const d=JSON.parse(s);const m=(d||[]).find(x=>x.sha&&x.sha.startsWith('216f24b'));console.log(m?m.id:'')})")
  if [ -z "$ID" ]; then echo "[$i] no deployment yet"; continue; fi
  ST=$(curl -s -m 20 -H "$T" "$API/deployments/$ID/statuses" | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const d=JSON.parse(s);console.log(d[0]?d[0].state:'pending')})")
  echo "[$i] deployment $ID: $ST"
  if [ "$ST" = "success" ] || [ "$ST" = "failure" ]; then exit 0; fi
done
exit 0

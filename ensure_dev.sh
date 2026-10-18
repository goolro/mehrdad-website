#!/bin/bash
# idempotent dev-server starter for the sandbox shell
if curl -s -o /dev/null --max-time 3 http://localhost:3000/; then
  echo "dev server already up"
  exit 0
fi
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 1
cd /home/z/my-project
setsid bash -c 'exec bun run dev > dev.log 2>&1' < /dev/null &
for i in $(seq 1 30); do
  sleep 2
  if curl -s -o /dev/null --max-time 3 http://localhost:3000/; then
    echo "dev server started (${i}x2s)"
    exit 0
  fi
done
echo "dev server FAILED to start"
tail -5 dev.log
exit 1

#!/bin/bash
# Supervisor for the alt-text VLM pipeline (sandbox can reap orphan processes).
# The pipeline itself is resume-safe (cache persisted after EVERY success),
# so supervisor cycles are idempotent. Done-flag stops the supervisor.
cd /home/z/my-project || exit 1
LOG=analysis/alt_run.log
for i in $(seq 1 60); do
  if [ -f analysis/alt_done.flag ]; then
    echo "=== supervisor: done-flag present, stopping ===" >> "$LOG"
    break
  fi
  echo "=== supervisor cycle $i $(date -Iseconds) ===" >> "$LOG"
  bun analysis/fix_alts.ts >> "$LOG" 2>&1
  echo "=== cycle $i exit=$? ===" >> "$LOG"
  if [ -f analysis/alt_done.flag ]; then
    echo "=== supervisor: pipeline complete $(date -Iseconds) ===" >> "$LOG"
    break
  fi
  sleep 15
done

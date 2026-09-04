#!/usr/bin/env python3
"""
cPanel one-shot deploy over SSH (no cPanel-side SSH knowledge needed).

Uploads the production artifact (scripts/build-production.sh output) to a
cPanel host over SFTP, extracts it into the app root and seeds the SQLite
production DB *only if it does not exist yet* (a deploy must never overwrite
production data).

What it deliberately does NOT do (owner, via cPanel UI):
  - create/modify the Node.js Application (Node version, startup file, env vars)
  - restart Passenger (use the UI Restart button, or `touch ~/APP/tmp/restart.txt`)

Usage:
  python3 scripts/cpanel-deploy.py --host HOST --user CPANELUSER \
      [--port 22] [--app-root mehrdad-app] \
      [--artifact dist/mehrdad-deploy-<stamp>.tar.gz] [--db db/custom.db] \
      [--key ~/.ssh/mehrdad_cpanel_deploy] [--skip-upload]

Requires: paramiko (pip3 install paramiko). The private key never leaves the
machine running this script — only the matching public key is authorized in
cPanel (SSH Access → Import Key → Manage Authorization → Authorize).
"""
import argparse
import os
import posixpath
import sys
import time

import paramiko

APP_ROOT_DEFAULT = "mehrdad-app"


def run(ssh: paramiko.SSHClient, cmd: str, quiet: bool = False) -> str:
    _, out, err = ssh.exec_command(cmd, timeout=120)
    o, e = out.read().decode().strip(), err.read().decode().strip()
    code = out.channel.recv_exit_status()
    if not quiet:
        print(f"  $ {cmd}\n    -> exit {code}" + (f"\n    {o}" if o else "") + (f"\n    [stderr] {e}" if e and code else ""))
    if code != 0:
        raise RuntimeError(f"command failed ({code}): {cmd}\n{e or o}")
    return o


def sftp_upload(sftp: paramiko.SFTPClient, local: str, remote: str, label: str) -> None:
    size = os.path.getsize(local)
    t0 = time.time()
    print(f"  uploading {label}: {local} ({size/1e6:.1f} MB) -> {remote}")
    sftp.put(local, remote)
    dt = time.time() - t0
    print(f"    done in {dt:.0f}s ({size/1e6/max(dt,0.1):.1f} MB/s)")


def main() -> None:
    p = argparse.ArgumentParser(description="Upload + extract + seed on cPanel over SSH")
    p.add_argument("--host", required=True)
    p.add_argument("--port", type=int, default=22)
    p.add_argument("--user", required=True)
    p.add_argument("--key", default=os.path.expanduser("~/.ssh/mehrdad_cpanel_deploy"))
    p.add_argument("--app-root", default=APP_ROOT_DEFAULT)
    p.add_argument("--artifact", default=None, help="default: newest dist/mehrdad-deploy-*.tar.gz")
    p.add_argument("--db", default="db/custom.db", help="seed source (only used if production DB absent)")
    p.add_argument("--skip-upload", action="store_true", help="re-extract from the already-uploaded artifact")
    args = p.parse_args()

    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    artifact = args.artifact
    if not artifact:
        dist = os.path.join(repo, "dist")
        cands = sorted(f for f in os.listdir(dist) if f.startswith("mehrdad-deploy-") and f.endswith(".tar.gz"))
        if not cands:
            sys.exit("FATAL: no dist/mehrdad-deploy-*.tar.gz — run scripts/build-production.sh first")
        artifact = os.path.join(dist, cands[-1])
    artifact = os.path.abspath(artifact)
    db = os.path.abspath(args.db) if os.path.isabs(args.db) else os.path.join(repo, args.db)
    for f in (artifact, args.key):
        if not os.path.exists(f):
            sys.exit(f"FATAL: missing file: {f}")

    home = f"/home/{args.user}"
    app = posixpath.join(home, args.app_root)
    art_remote = posixpath.join(home, os.path.basename(artifact))
    db_remote = posixpath.join(home, os.path.basename(db))
    prod_db = posixpath.join(app, "data", "production.db")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"==> connect {args.user}@{args.host}:{args.port}")
    ssh.connect(args.host, port=args.port, username=args.user,
                key_filename=args.key, look_for_keys=False, allow_agent=False, timeout=30)
    try:
        print("==> server recon")
        run(ssh, "uname -sr && node --version 2>/dev/null || echo 'node: not on PATH (fine — Passenger provides it)'")
        run(ssh, f"df -h {home} | tail -1")

        if not args.skip_upload:
            print("==> upload")
            sftp_upload(ssh.open_sftp(), artifact, art_remote, "artifact")
            if os.path.exists(db):
                sftp_upload(ssh.open_sftp(), db, db_remote, "db seed source")

        print(f"==> extract into {app}")
        run(ssh, f"mkdir -p {app} && tar -xzf {art_remote} -C {app}")
        run(ssh, f"test -f {app}/server.js && echo 'server.js OK'")
        run(ssh, f"ls {app}/node_modules/.prisma/client/libquery_engine-*.so.node >/dev/null && echo 'Prisma engine OK'")

        print("==> production DB (create-once policy)")
        exists = run(ssh, f"test -f {prod_db} && echo YES || echo NO", quiet=True)
        if exists == "YES":
            size = run(ssh, f"du -h {prod_db} | cut -f1", quiet=True)
            print(f"  data/production.db already exists ({size}) — LEFT UNTOUCHED ✓")
        else:
            run(ssh, f"mkdir -p {app}/data && cp {db_remote} {prod_db} && du -h {prod_db}")
            print("  seeded first-copy data/production.db ✓")

        run(ssh, f"mkdir -p {app}/tmp && touch {app}/tmp/restart.txt")
        print("\n==> SSH part complete. Remaining steps are cPanel UI only:")
        print(f"    1. Setup Node.js App → Application root: {args.app_root}, startup file: server.js,")
        print("       Node 20.20.2+, mode Production, Application URL mapped as you decided")
        print("    2. Env vars: DATABASE_URL=file:" + prod_db)
        print("       ADMIN_PASSWORD=<secret>, NODE_ENV=production, HOSTNAME=0.0.0.0")
        print("    3. Restart → then verify HTTP (see docs/CPANEL_DEPLOYMENT.md §5)")
    finally:
        ssh.close()


if __name__ == "__main__":
    main()

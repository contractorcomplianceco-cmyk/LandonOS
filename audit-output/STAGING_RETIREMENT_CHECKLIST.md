# Landon Staging EC2 Retirement Checklist

**Do not stop or terminate until every gate below is checked and Rose + Carmen approve.**

| Role | Host | Public IP | Private hostname |
|------|------|-----------|------------------|
| **Command Center (target)** | `i-02bba85de3f0a433f` | `3.129.68.79` | `ip-172-31-19-214` (us-east-2b) |
| **Landon staging (retire)** | *(look up in EC2 by IP)* | `3.138.233.148` | `ip-172-31-33-189` |

**Domain:** `landon.cagteam.net`  
**Agreed verification window:** Minimum **7 calendar days** after DNS cutover with no Sev-1/Sev-2 LandonOS incidents (adjust if Rose/Carmen set a different window).

---

## Pre-flight status (as of 2026-06-29 UTC)

| # | Gate | Status | Notes |
|---|------|--------|-------|
| 1 | DNS → Command Center | **NOT MET** | `landon.cagteam.net` still resolves to `3.138.233.148` (staging) |
| 2 | CC health + workflow | **PARTIAL** | `/api/healthz` OK on CC; full Rose walkthrough pending post-DNS |
| 3 | CC DB backup | **MET** | Native Postgres 16; fresh dump verified; see §3 |
| 4 | Staging dump preserved | **MET** | See §4 |
| 5 | Rollback documented | **MET** | See §5 |
| 6 | Remove temp SSH SG rule | **PENDING** | After retirement approval only |
| 7 | Remove migration pubkey | **PENDING** | After last SSH need |
| 8 | Final AMI/snapshot | **OPTIONAL** | Recommended before stop |
| 9 | Stop (not terminate) | **NOT STARTED** | |
| 10 | Terminate | **BLOCKED** | Requires Rose + Carmen written approval |

---

## 1. Confirm DNS has pointed to Command Center for the verification window

**Target A record:** `landon.cagteam.net` → `3.129.68.79`

**Check (run daily during window):**

```bash
dig +short landon.cagteam.net A
dig +short landon.cagteam.net A @8.8.8.8
curl -sI --max-time 10 http://landon.cagteam.net/api/healthz
# Expect: HTTP 200 and traffic served from Command Center (not Jun 27 staging Last-Modified)
```

**Pass criteria:**

- [ ] Both resolvers return **only** `3.129.68.79` for the full agreed window
- [ ] No accidental CNAME/secondary records still pointing at `3.138.233.148`
- [ ] TLS cert on Command Center valid for `landon.cagteam.net` (after certbot post-cutover)
- [ ] External spot-check from off-VPS network confirms same IP

**Do not proceed to stop/terminate while DNS still points at staging.**

---

## 2. Confirm LandonOS on Command Center passes health and workflow tests

**Command Center paths:**

| Item | Path / command |
|------|----------------|
| App source | `/home/ubuntu/projects/landonos` |
| SPA | `/var/www/landonos` |
| API (PM2) | `landonos-api` on port **8084** |
| nginx vhost | `/etc/nginx/sites-available/landon.cagteam.net` |
| Postgres DB | `landonos` (role `landonos`) |

**Automated smoke (on Command Center):**

```bash
curl -sS -H "Host: landon.cagteam.net" http://127.0.0.1/api/healthz
# Expect: {"status":"ok","database":"connected"}

for p in / /welcome /guided-research-builder /source-vault /company-brain /settings; do
  curl -sS -H "Host: landon.cagteam.net" "http://127.0.0.1$p" -o /dev/null -w "$p: %{http_code}\n"
done
# Expect: all 200

pm2 status landonos-api
# Expect: online
```

**Manual workflow checklist (Rose / Landon):**

- [ ] Rose Review banner visible; no login wall during review window
- [ ] Sync chip shows **Live ·** workspace (not stuck on Local only)
- [ ] Create research request → persists after browser refresh
- [ ] Source Garage CRUD persists
- [ ] Company Brain suggestion saves (labeled suggestions-only)
- [ ] Command Center registry opens `https://landon.cagteam.net` correctly
- [ ] No blocking console errors on dashboard + Research Engine + RoseOS Co-Driver

---

## 3. Confirm database backup exists on Command Center

**Current production DB (Command Center):**

```bash
# Fresh backup before stop/terminate approval
BACKUP_DIR=/home/ubuntu/backups/landonos
mkdir -p "$BACKUP_DIR"
sudo -u postgres pg_dump -Fc landonos > "$BACKUP_DIR/landonos-$(date +%Y%m%d-%H%M%S).dump"
ls -lh "$BACKUP_DIR"/landonos-*.dump | tail -3
```

**Pass criteria:**

- [ ] At least one dump **after** final migration sync, stored under `/home/ubuntu/backups/landonos/`
- [ ] Dump restores cleanly on a test schema or clone (optional but recommended)
- [ ] Row counts match expectations (users/workspaces/sessions migrated from staging)

**Reference counts at migration (staging export 2026-06-28):** 3 users, 5 workspaces, 27 sessions.

---

## 4. Confirm staging DB dump is preserved

**Migration bundle (Command Center):**

```
/home/ubuntu/backups/landonos-migration-20260628/
├── INVENTORY.md
├── landonos-20260628.dump          # staging Postgres export
├── pm2-landonos-api.env            # redacted runtime env snapshot
├── git-commit.txt                  # 6dcf1d8 @ contractorcomplianceco-cmyk/LandonOS
├── nginx/                          # staging vhost + htpasswd
├── config/ecosystem.landonos.config.cjs
└── www/                            # staging SPA snapshot (Jun 27 build)
```

**Original export on staging (if still reachable before stop):**

```
/home/ubuntu/migration-export-20260628/
```

**Pass criteria:**

- [ ] `landonos-20260628.dump` present and non-zero on Command Center
- [ ] Copy stored off-instance (S3, backup vault, or Carmen’s backup path) — **not only on the same EBS volume**
- [ ] `pm2-landonos-api.env` and nginx configs retained for forensic rollback

---

## 5. Confirm rollback plan is documented

**Fast rollback (DNS only — use if Command Center cutover fails):**

1. Set `landon.cagteam.net` A record back to **`3.138.233.148`**
2. Wait for TTL propagation (re-check with `dig @8.8.8.8`)
3. Staging serves last known good stack until CC issue is fixed

**Command Center registry note (internal):**

- `internal-app-registry.json` → `landon-os` `releaseNotes` / `riskNote`: revert DNS to `3.138.233.148` if cutover fails

**Rollback invalid after:**

- Staging instance **terminated**, or
- Staging EBS volume deleted without snapshot, or
- Staging Postgres volume wiped

**Pass criteria:**

- [ ] Rose/Carmen acknowledge rollback = DNS revert **only while staging instance is still stopped (not terminated) with EBS intact**
- [ ] If staging is stopped, rollback requires **start** instance + DNS revert (add ~2–5 min)

---

## 6. Remove temporary SSH rule from staging security group

Added during migration: **TCP 22 from `3.129.68.79/32`** (Command Center only).

**AWS Console:**

1. EC2 → Instances → select staging (`3.138.233.148`)
2. Security → security group → **Edit inbound rules**
3. Delete rule: SSH / 22 / `3.129.68.79/32` / description *Temporary LandonOS migration from Command Center*
4. Save

**AWS CLI (run from machine with credentials):**

```bash
# Replace SG_ID and verify rule exists before revoking
aws ec2 describe-instances --filters "Name=ip-address,Values=3.138.233.148" \
  --query 'Reservations[0].Instances[0].SecurityGroups[*].GroupId' --output text

aws ec2 revoke-security-group-ingress \
  --group-id SG_ID \
  --protocol tcp --port 22 --cidr 3.129.68.79/32
```

**Pass criteria:**

- [ ] Rule removed **after** final migration verification
- [ ] Confirm port 22 from Command Center times out: `nc -zv -w 5 3.138.233.148 22`

---

## 7. Remove migration public key from staging `authorized_keys`

**Key (Command Center):** `/home/ubuntu/.ssh/id_landon_migration`  
**Comment:** `command-center-landon-migration`

**On staging (last SSH session before stop):**

```bash
ssh -i ~/.ssh/id_landon_migration ubuntu@3.138.233.148
grep -n 'command-center-landon-migration' ~/.ssh/authorized_keys
# Edit and remove that line:
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Pass criteria:**

- [ ] Migration pubkey line removed from `ubuntu` user
- [ ] Normal admin SSH keys (if any) unchanged
- [ ] Optional: remove `landonos-staging` block from Command Center `~/.ssh/config`

---

## 8. Create final AMI/snapshot (optional but recommended)

**Before stop**, capture rollback media:

```bash
# AWS Console: EC2 → Instances → staging → Actions → Image and templates → Create image
# Name: landonos-staging-final-YYYYMMDD
# No reboot: optional (reboot for clean filesystem)

# Or EBS snapshot only:
# Volumes → select root (+ data vol if separate) → Create snapshot
# Tag: Name=landonos-staging-retire-YYYYMMDD
```

**Pass criteria:**

- [ ] AMI or root volume snapshot **Available**
- [ ] Snapshot ID recorded in this doc or Carmen’s runbook
- [ ] Retention policy set (e.g. 90 days) unless immediate terminate planned

---

## 9. Stop instance first — do not terminate immediately

** Preconditions:** Gates 1–8 complete (or 8 waived with written note), Rose review window ended, no open Sev-1/Sev-2.

**Exact stop procedure (AWS Console):**

1. EC2 → Instances → select Landon staging (`3.138.233.148`)
2. **Instance state → Stop instance**
3. Confirm **Stop** (not Terminate)
4. Wait until state = **`stopped`**
5. Record stop timestamp: _______________

**AWS CLI:**

```bash
# Resolve instance ID first
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=ip-address,Values=3.138.233.148" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)
echo "Staging instance: $INSTANCE_ID"

# STOP — safe, reversible
aws ec2 stop-instances --instance-ids "$INSTANCE_ID"
aws ec2 wait instance-stopped --instance-ids "$INSTANCE_ID"
aws ec2 describe-instances --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].State.Name' --output text
# Expect: stopped
```

**After stop:**

- [ ] EBS volumes remain attached (default)
- [ ] Elastic IP (if any) — decide keep/release (document choice)
- [ ] Update Command Center registry `riskNote` to “Staging stopped YYYY-MM-DD; rollback requires start + DNS revert”
- [ ] **Cool-down:** keep stopped **≥ 14 days** (or agreed period) before terminate

**Cost note:** Stopped instance still bills for EBS storage; terminating removes compute + default volume unless snapshot retained.

---

## 10. Terminate only after Rose + Carmen approve

**Required approvals (written: Slack/email/ticket):**

- [ ] **Rose** — LandonOS stable on Command Center; no rollback needed
- [ ] **Carmen** — backups/snapshots verified; DNS stable; SSH cleanup done

**Exact terminate procedure (AWS Console):**

1. EC2 → Instances → select **stopped** staging instance
2. **Instance state → Terminate instance**
3. Type confirmation if prompted
4. Record terminate timestamp: _______________

**AWS CLI:**

```bash
# ONLY after explicit Rose + Carmen approval — irreversible
aws ec2 terminate-instances --instance-ids "$INSTANCE_ID"
aws ec2 wait instance-terminated --instance-ids "$INSTANCE_ID"
```

**Post-terminate cleanup:**

- [ ] Release Elastic IP if dedicated to staging (if not reused)
- [ ] Delete orphaned security group rules referencing staging-only peers
- [ ] Remove staging references from internal docs after 30 days
- [ ] Keep `/home/ubuntu/backups/landonos-migration-20260628/` on Command Center indefinitely (or until off-site copy confirmed)

---

## Execution timeline (recommended)

| Phase | Action | Owner | When |
|-------|--------|-------|------|
| A | DNS cutover → `3.129.68.79` + certbot TLS | Carmen | Before window starts |
| B | 7-day verification window | Rose / Landon | After A |
| C | Final CC pg_dump + workflow sign-off | Carmen / Rose | End of window |
| D | Remove SSH SG rule + migration pubkey | Carmen | After C |
| E | Optional AMI/EBS snapshot | Carmen | Before stop |
| F | **Stop** instance | Carmen | After D + E |
| G | 14-day stopped cool-down | — | After F |
| H | **Terminate** (with approval) | Carmen | After G + Rose/Carmen sign-off |

---

## What was NOT done in this document

- No instance stop, terminate, or DNS change was executed.
- Staging EC2 at `3.138.233.148` remains **running** (assumed) until gates pass.

**Document owner:** Carmen (systems)  
**Reviewers:** Rose (review), Landon (user acceptance)  
**Last updated:** 2026-06-29 UTC

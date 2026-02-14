---
name: bf-credential-vault
description: >
  Secure credential store for Blue Frontier deployed systems. Contains Teltonika remote access URLs,
  Distech ECY-600 controller credentials, BACnet configurations, and connection procedures for each
  deployed unit. Use this skill whenever BLUE needs to connect to a controller, access a remote 
  dashboard, or provide connection instructions to a field technician. This skill enforces access 
  control rules and audit logging requirements.
---

# BLUE Credential Vault v1.0

## Purpose

Provide BLUE with structured, secure access to connection credentials for all deployed Blue Frontier
systems. This vault separates sensitive access data from the fleet registry to maintain proper 
security boundaries.

---

## ⚠️ SECURITY RULES — MANDATORY

### Rule 1: Never Display Raw Credentials in Chat
- BLUE must NEVER output full credentials (passwords, API keys, tokens) directly in chat responses
- Instead, provide connection INSTRUCTIONS that reference credential tiers
- Example: "Connect using the **Tier 1 standard credentials** for this unit"

### Rule 2: Credential Tiers
- **Tier 1 (Standard):** Default Distech controller login — used for routine monitoring and diagnostics
- **Tier 2 (Admin):** Full administrative access — used for configuration changes, firmware updates
- **Tier 3 (Engineering):** Root/engineering access — reserved for Blue Frontier engineering team only

### Rule 3: Access Logging
- Every credential access request should be logged to ClickUp via the blue-question-logging skill
- Log format: [TIMESTAMP] | [REQUESTER] | [UNIT_ID] | [TIER] | [PURPOSE]

### Rule 4: Credential Rotation Policy
- All Tier 1 credentials should rotate every 90 days
- All Tier 2 credentials should rotate every 60 days
- Tier 3 credentials are managed exclusively by engineering

### Rule 5: Teltonika URL Handling
- Teltonika proxy URLs may be shared in chat (they require separate RMS authentication)
- These URLs are NOT direct controller access — they tunnel through Teltonika RMS

---

## Connection Architecture

```
Technician → Teltonika RMS Portal → Teltonika Router (on-site) → Distech ECY-600 Controller
                  ↓                         ↓                            ↓
           RMS Authentication        VPN/Proxy Tunnel           Controller Web UI
           (Teltonika account)       (encrypted)                (Tier 1/2/3 login)
```

### Connection Methods (Per Distech Documentation)
1. **Wi-Fi IP Address** — Direct connection when on-site (controller broadcasts its own AP)
2. **Hostname** — Via local network DNS resolution
3. **Teltonika Remote** — Via RMS proxy URL (remote access from anywhere)

Reference: Distech Eclypse controller connection documentation [[4](https://docs.distech-controls.com/bundle/ECLYPSE-BI-UG/page/en-US/786457995.html)]

---

## Standard Credential Sets

### Tier 1 — Monitoring & Diagnostics
```
Purpose: Read-only dashboard access, point monitoring, alarm review
Access Level: View all points, view trends, view alarms, view schedules
Restrictions: Cannot write to points, cannot override, cannot change configuration
Username: bf_monitor
Password: [STORED — Reference as "Tier 1 Standard"]
Default Port: 443 (HTTPS)
Protocol: REST API / Web UI
```

### Tier 2 — Administrative
```
Purpose: Full controller management, point overrides, setpoint changes
Access Level: All Tier 1 + write to points, override, schedule management
Restrictions: Cannot modify firmware, cannot change network settings
Username: admin
Password: [STORED — Reference as "Tier 2 Admin"]  
Default Port: 443 (HTTPS)
Protocol: REST API / Web UI
```

### Tier 3 — Engineering
```
Purpose: Firmware updates, network configuration, factory reset
Access Level: Unrestricted
Restrictions: Blue Frontier engineering team ONLY
Username: [ENGINEERING ONLY]
Password: [ENGINEERING ONLY]
Contact: scott.hicks@bluefrontierac.com
```

---

## Unit Connection Registry

### DOAS-001 — Waffle House, Macon GA
- **Teltonika URL:** `https://afaf8046558dd3c6cb6b75b12b32cfa6.proxy1-connect.rms.teltonika-networks.com`
- **Controller IP (Local):** TBD — needs on-site verification
- **BACnet Device Instance:** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **Firmware:** BF_DOAS_v2.2.1
- **Connection Notes:** Unit is online. Active ALM_STORAGE_HIGH alarm.
- **Last Credential Rotation:** TBD

### DOAS-002 — Westover AFRB, Chicopee MA
- **Teltonika URL:** `https://c3a08c47faae289ddd5adbafa8d70dfc.proxy1-connect.rms.teltonika-networks.com`
- **Controller IP (Local):** TBD
- **BACnet Device Instance:** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **Firmware:** BF_DOAS_v2.4.15
- **Connection Notes:** DIU site — may have additional network security restrictions.
- **Last Credential Rotation:** TBD

### DOAS-003 — Boca HQ (Blue Frontier)
- **Teltonika URL:** `https://f358def303d7a31bb1c7573eec9fc71b.proxy1-connect.rms.teltonika-networks.com`
- **Controller IP (Local):** TBD
- **BACnet Device Instance:** TBD
- **Credential Tier Available:** Tier 1, Tier 2, Tier 3 (internal unit)
- **Firmware:** TBD
- **Connection Notes:** Internal BF unit. Teltonika remote access confirmed via separate configuration. This is the primary test/dev unit. Active ALRT_REGEN_START_INHIB alarm.
- **Site-Specific Credentials:** admin / BFadmin2024 ← ⚠️ ROTATE IMMEDIATELY (exposed in fleet registry)
- **Last Credential Rotation:** NEVER — needs immediate rotation

### DOAS-004 — Barry University, Miami FL
- **Teltonika URL:** Not configured / TBD
- **Controller IP (Local):** TBD
- **BACnet Device Instance:** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **Connection Notes:** Active ALRT_LD_LOSS alarm. Remote access may not be configured.
- **Last Credential Rotation:** TBD

### DOAS-005 — Von's/Albertsons, Gardena CA
- **Teltonika URL:** Not configured / TBD
- **Controller IP (Local):** TBD
- **BACnet Device Instance:** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **Connection Notes:** Normal operation. Remote access may not be configured.
- **Last Credential Rotation:** TBD

### DOAS-008 — Valencia, FL
- **Teltonika URL:** Not configured / TBD
- **Controller IP (Local):** TBD
- **Connection Notes:** Offline — no remote access currently available.

### DOAS-009 — BofA Collins, FL
- **Teltonika URL:** Not configured / TBD
- **Controller IP (Local):** TBD
- **Connection Notes:** Online but no Teltonika configured.

### DOAS-010 — BofA Collins, FL ⚡ 208V
- **Teltonika URL:** Not configured / TBD
- **Controller IP (Local):** TBD
- **Connection Notes:** Online. 208V unit — verify electrical configuration before any hardware work.

### DOAS-011 — Indian Rocks School, Largo FL ⚡ 208V
- **Teltonika URL:** `https://93d0c88c7f06ca1665f0bb859876431d.proxy1-connect.rms.teltonika-networks.com`
- **Controller IP (Local):** TBD
- **BACnet Device Instance:** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **Firmware:** 3.0.20_600 | Hardware Rev: 10
- **Connection Notes:** 208V unit. Crystallization risk noted. Remote access confirmed.
- **Last Credential Rotation:** TBD

### DOAS-012 — Museum of Discovery Science, Fort Lauderdale FL
- **Teltonika URL:** Not configured / TBD
- **Controller IP (Local):** TBD
- **Connection Notes:** Active ALRT_LD_LOSS alarm. No remote access configured.

### DOAS-016 — BofA Collins II, Newark DE
- **Teltonika URL:** `https://0b2d0c2eacc238960f60e924535928f2.proxy1-connect.rms.teltonika-networks.com`
- **Controller IP (Local):** TBD
- **BACnet Device Instance:** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **PLC Info:** ECY-600 (40016C000582042B) | Firmware: 2.8.4+25205.1 | HW Rev: 1.0A
- **Connection Notes:** Delaware location. DOAS model/serial TBD — status page only shows PLC info.
- **Last Credential Rotation:** TBD

### RSU-001 — FPL Riviera Beach, FL
- **Teltonika URL:** `https://59754eb7095f7ededaf2d64b4c65a62f.proxy1-connect.rms.teltonika-networks.com`
- **Controller IP (Local):** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **Firmware:** BF_RSU_v2.0.6
- **Connection Notes:** Legacy RSU unit. Normal operation.
- **Last Credential Rotation:** TBD

### RTU-007 — FPL Riviera Beach, FL
- **Teltonika URL:** `https://35505b4c98c5f0a8829cfae72f524e57.proxy1-connect.rms.teltonika-networks.com`
- **Controller IP (Local):** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **Firmware:** RTU R01_20250127 | HW Rev: 7.01
- **Connection Notes:** Active ALM_T1_LOW alarm. Oldest unit in fleet (Serial: 2350, commissioned Jan 2024).
- **Last Credential Rotation:** TBD

### RTU-008 — Fort Moore, GA
- **Teltonika URL:** `https://f2de20ade6e94fafb70d7a7d689a2711.proxy1-connect.rms.teltonika-networks.com`
- **Controller IP (Local):** TBD
- **Credential Tier Available:** Tier 1, Tier 2
- **Firmware:** RTU R01_20250127 | HW Rev: 8.01
- **Connection Notes:** DIU site. Normal operation.
- **Last Credential Rotation:** TBD

---

## Teltonika RMS Access

### RMS Portal
- **URL:** https://rms.teltonika-networks.com
- **Purpose:** Manage all Teltonika routers deployed at Blue Frontier sites
- **Account Type:** Blue Frontier organizational account
- **Access:** Contact Blue Frontier IT for RMS portal credentials
- **Note:** RMS credentials are SEPARATE from Distech controller credentials

### Proxy URL Format
All Teltonika remote access URLs follow this pattern:
```
https://[32-char-hex-hash].proxy1-connect.rms.teltonika-networks.com
```
These URLs tunnel through Teltonika's cloud to the on-site router, which then forwards to the Distech controller's web interface.

---

## Connection Procedures

### Procedure A: Remote Access via Teltonika
1. Ensure you have Teltonika RMS portal access (contact BF IT if needed)
2. Navigate to the unit's Teltonika URL from this vault
3. Authenticate with RMS portal credentials (if not already logged in)
4. The Distech ECY-600 web UI should load through the proxy
5. Log in with the appropriate credential tier for your task
6. **Tier 1** for monitoring/diagnostics, **Tier 2** for overrides/changes

### Procedure B: On-Site Direct Connection
1. Connect to the Distech controller's Wi-Fi access point (if enabled)
2. Default AP name: `ECLYPSE-[serial]`
3. Navigate to the controller's IP address (typically `192.168.1.1` on AP network)
4. Log in with appropriate credential tier
5. Reference: [[4](https://docs.distech-controls.com/bundle/ECLYPSE-BI-UG/page/en-US/786457995.html)]

### Procedure C: On-Site via Building Network
1. Verify the controller's IP address from the BAS/BMS integrator
2. Ensure your laptop is on the same VLAN/subnet as the controller
3. Navigate to `https://[controller-IP]`
4. Log in with appropriate credential tier

---

## Distech REST API Access

### API Endpoint
```
https://[controller-IP-or-Teltonika-URL]/api/rest/v2/
```

### Authentication
- **Method:** HTTP Basic Authentication
- **Header:** `Authorization: Basic [base64(username:password)]`
- **Use Tier 1 credentials** for read-only API calls
- **Use Tier 2 credentials** for write operations

### Common API Endpoints
```
GET  /api/rest/v2/protocols/bacnet/local/objects/device  → Device info
GET  /api/rest/v2/protocols/bacnet/local/objects/analog-value  → All AVs
GET  /api/rest/v2/protocols/bacnet/local/objects/binary-value  → All BVs
GET  /api/rest/v2/protocols/bacnet/local/objects/analog-value/[instance]  → Specific AV
PUT  /api/rest/v2/protocols/bacnet/local/objects/binary-value/79  → BMS Start (Tier 2)
```

### Python Example (Using distech-utils)
```python
from distech_utils import DistechController

# Connect via Teltonika proxy
ctrl = DistechController(
    host="[teltonika-proxy-url]",
    username="[tier-1-username]",
    password="[tier-1-password]"
)

# Read supply air temperature
sa_temp = ctrl.read_av(133)  # C_TRH4.T
print(f"Supply Air Temp: {sa_temp}°C")

# Read conditioner status
cond_run = ctrl.read_bv(72)  # ConditionerRun
print(f"Conditioner: {'Running' if cond_run else 'Off'}")
```

---

## Action Items — Credential Vault Gaps

### 🔴 CRITICAL
1. **DOAS-003 credentials exposed** — `admin / BFadmin2024` is in the fleet registry. Rotate IMMEDIATELY.
2. **No credential rotation schedule** — Establish rotation dates for all units.

### 🟡 HIGH PRIORITY
3. **Missing Teltonika URLs** — DOAS-004, -005, -008, -009, -010, -012 have no remote access configured.
4. **Missing local controller IPs** — No unit has a documented local IP address.
5. **Missing BACnet device instances** — Needed for proper BAS integration.

### 🟢 RECOMMENDED
6. **Establish Tier 1 monitoring accounts** on all controllers (separate from admin accounts).
7. **Document BACnet device instance IDs** during next site visits.
8. **Configure Teltonika remote access** on all units without it (6 units currently without).
9. **Implement automated credential rotation** via the Distech REST API.

---

## Vault Update Log

| Date | Action | By |
|------|--------|-----|
| 2026-02-14 | Vault v1.0 created — 8 Teltonika URLs, 1 site-specific credential set | BLUE |
| 2026-02-14 | Security rules established — 3-tier credential system | BLUE |
| 2026-02-14 | DOAS-003 credential exposure flagged for immediate rotation | BLUE |

---

*Skill Version: 1.0 | Created: February 14, 2026 | Last Updated: February 14, 2026*
*Security Classification: CONFIDENTIAL — Blue Frontier Internal Use Only*
*Maintained by: BLUE — Blue Frontier AI Platform*

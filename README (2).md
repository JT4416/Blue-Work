# bf-credential-vault

Secure credential store for Blue Frontier deployed systems.

## What This Skill Contains
- Teltonika remote access URLs for all units with remote connectivity
- Distech ECY-600 controller credential tiers (Monitoring, Admin, Engineering)
- Connection procedures (Remote, On-Site Wi-Fi, Building Network)
- REST API access documentation and authentication methods
- Security rules and credential rotation policies
- Action items for credential vault gaps

## Security Classification
**CONFIDENTIAL — Blue Frontier Internal Use Only**

## Usage
BLUE references this skill when:
- A technician needs to connect to a controller remotely
- A technician needs connection instructions for on-site work
- An API integration requires authentication details
- Credential rotation status is being audited

## Important Security Notes
1. Raw passwords are NEVER displayed in chat responses
2. Credentials are referenced by tier (Tier 1/2/3), not by actual values
3. All credential access requests are logged
4. DOAS-003 credentials need immediate rotation (exposed in fleet registry)

## Version
v1.0 — February 14, 2026

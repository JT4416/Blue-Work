# DOAS-3 Controller Connection Skill

## Purpose
Enables Blue to connect directly to the DOAS-3 controller for remote diagnostics, validation, and testing.

## Controller Information

### DOAS-3 Credentials
**URL:** [PENDING - Please provide]  
**Username:** [PENDING - Please provide]  
**Password:** [PENDING - Please provide]  
**Location:** [PENDING - Installation site]  
**Installation Date:** [PENDING]  

## Usage by Blue

### Automatic Connection
When Blue needs to interact with DOAS-3, it will automatically use these credentials:

```python
from distech_utils import DistechClient

# Blue automatically loads credentials from this skill
client = DistechClient(
    base_url="[DOAS-3_URL]",
    username="[DOAS-3_USERNAME]",
    password="[DOAS-3_PASSWORD]"
)
```

### Available Commands

#### Validate Controller Configuration
```bash
distech-validate [DOAS-3_URL] -u [USERNAME] -p [PASSWORD] --fix
```

#### Test Regenerator Airflow
```bash
distech-test airflow regenerator [DOAS-3_URL] -u [USERNAME] -p [PASSWORD]
```

#### Test All Conditioner Blowers
```bash
distech-test airflow conditioner_blower1,conditioner_blower2,conditioner_blower3 \\
  [DOAS-3_URL] -u [USERNAME] -p [PASSWORD] --combined
```

#### Test Pumps
```bash
# Regenerator pump
distech-test pump regen [DOAS-3_URL] -u [USERNAME] -p [PASSWORD]

# Conditioner pump
distech-test pump conditioner [DOAS-3_URL] -u [USERNAME] -p [PASSWORD]
```

## Autonomous Monitoring Schedule

Blue will automatically perform the following on DOAS-3:

### Daily Tasks (Every 24 hours)
- ✅ Validate controller configuration
- ✅ Check IoT Hub connectivity
- ✅ Verify scheduled tasks are enabled
- ✅ Monitor alarm states

### Weekly Tasks (Every Monday 3:00 AM)
- ✅ Full regenerator airflow test
- ✅ Full conditioner blower tests
- ✅ Pump flow rate tests
- ✅ Generate performance report

### Real-Time Monitoring
- ✅ Monitor Grafana dashboard for anomalies
- ✅ Alert on critical alarms
- ✅ Track energy consumption trends
- ✅ Log any configuration drift

## Integration with Status Page

When status.bluefrontierac.com data is available, Blue will:
1. Auto-discover DOAS-3 location in fleet
2. Cross-reference with Grafana dashboard
3. Correlate performance data across multiple sources
4. Generate comprehensive diagnostics

## Security Notes

⚠️ **IMPORTANT:**
- Credentials stored in secure skill (not in code)
- Never log passwords in plain text
- Use HTTPS for all connections
- Rotate passwords quarterly
- Audit access logs monthly

## Troubleshooting

### Connection Issues
If Blue cannot connect to DOAS-3:
1. Verify URL is correct (https://...)
2. Check network connectivity
3. Confirm credentials haven't changed
4. Ensure controller is powered on
5. Check firewall rules

### Authentication Failures
If authentication fails:
1. Verify username/password with customer
2. Check if controller was recently reconfigured
3. Try logging in manually via browser
4. Contact customer to verify access

## Status

**Connection Status:** ⏳ PENDING CREDENTIALS  
**Last Successful Connection:** N/A  
**Last Validation:** N/A  
**Last Test:** N/A  

---

**To activate this skill, please provide:**
1. DOAS-3 controller URL
2. Username for controller access
3. Password for controller access
4. (Optional) Grafana dashboard URL for DOAS-3

**Once provided, Blue will immediately begin autonomous monitoring.**

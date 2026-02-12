# STANDARD OPERATING PROCEDURE
## Installation of BLUE Package on Technician Laptops

**Document ID:** BF-SOP-001  
**Version:** 1.0  
**Date:** February 12, 2026  
**Department:** Field Service Operations  
**Prepared By:** Blue Frontier AI Systems  

---

## 1. PURPOSE

This SOP provides step-by-step instructions for installing the BLUE (Blue Frontier Unified Environment) package on field technician laptops. The BLUE package contains all tools necessary for DOAS validation, testing, and diagnostics.

## 2. SCOPE

This procedure applies to all Blue Frontier field service technicians who require remote DOAS diagnostic capabilities.

## 3. REQUIRED MATERIALS

### 3.1 Software Components
- ✅ BLUE Package installer (`blue_package_installer.exe`)
- ✅ Dashboard installer (`install_dashboard.bat`)
- ✅ Python 3.11 or higher (included in package)

### 3.2 Hardware Requirements
- Windows 10/11 laptop or tablet
- Minimum 8GB RAM
- 5GB free disk space
- Internet connection (for initial setup)

### 3.3 Credentials Required
- Technician user account credentials
- Blue Frontier service portal login

## 4. SAFETY & SECURITY CONSIDERATIONS

⚠️ **CRITICAL:**
- Do NOT install on personal devices
- Do NOT share controller credentials
- Ensure laptop firewall is enabled
- Report any installation errors immediately

## 5. INSTALLATION PROCEDURE

### 5.1 PRE-INSTALLATION CHECKS

**STEP 1:** Verify laptop meets minimum requirements
- Check Windows version: `Win + R`, type `winver`, press Enter
- Check RAM: Task Manager → Performance → Memory
- Check free space: This PC → C: drive properties

**STEP 2:** Close all running applications
- Save any open work
- Exit all browsers, Office apps, etc.
- Disable antivirus temporarily (if prompted during install)

**STEP 3:** Ensure internet connectivity
- Test: Open browser, navigate to bluefrontier.com
- Connect to reliable network (avoid public WiFi)

### 5.2 CORE INSTALLATION

**STEP 4:** Run BLUE Package Installer

```
1. Locate file: blue_package_installer.exe
2. Right-click → "Run as Administrator"
3. Click "Yes" on User Account Control prompt
4. Installation wizard opens
```

**STEP 5:** Follow Installation Wizard

```
Screen 1: Welcome
→ Click "Next"

Screen 2: License Agreement
→ Read terms
→ Check "I accept the agreement"
→ Click "Next"

Screen 3: Installation Location
→ Default: C:\Program Files\BlueFrontier
→ Click "Next" (or "Browse" to change)

Screen 4: Select Components
→ Ensure ALL boxes are checked:
   ☑ distech-utils (Core Tools)
   ☑ Python Runtime
   ☑ Dashboard Application
   ☑ Documentation
→ Click "Next"

Screen 5: Start Menu Folder
→ Default: "Blue Frontier Tools"
→ Click "Next"

Screen 6: Additional Tasks
→ Check "Create desktop icon"
→ Check "Add to PATH"
→ Click "Next"

Screen 7: Ready to Install
→ Review settings
→ Click "Install"
```

**STEP 6:** Wait for Installation
- Progress bar shows installation status
- Typical time: 2-5 minutes
- Do NOT close window or interrupt

**STEP 7:** Complete Installation
```
→ "Setup has finished installing BLUE Package"
→ Check "Launch Blue Frontier Dashboard"
→ Click "Finish"
```

### 5.3 DASHBOARD INSTALLATION

**STEP 8:** Install Technician Dashboard

```
1. Navigate to: C:\Program Files\BlueFrontier\dashboard
2. Double-click: install_dashboard.bat
3. Press any key when prompted
4. Desktop shortcut created automatically
```

### 5.4 POST-INSTALLATION VERIFICATION

**STEP 9:** Verify Command-Line Tools

```
1. Open Command Prompt (Win + R, type "cmd", Enter)
2. Test validation tool:
   > distech-validate --help
   
   Expected output:
   "Validate Distech controller configuration"
   
3. Test testing tool:
   > distech-test --help
   
   Expected output:
   "Unified test runner for DOAS flow tests"
```

**STEP 10:** Verify Dashboard

```
1. Locate desktop shortcut: "Blue Frontier Dashboard"
2. Double-click to open
3. Dashboard should load in default browser
4. Verify:
   ✓ Blue Frontier branding visible
   ✓ "SYSTEM READY" status shows green
   ✓ All tool statuses show "READY"
```

**STEP 11:** Test Sample Connection (Optional)

```
ONLY if test controller credentials available:

1. Open Command Prompt
2. Run validation test:
   > distech-validate https://test-controller.bf.local -u testuser -p testpass
   
3. Expected output:
   "✅ Connectivity check passed"
   "✅ IoT Hub configuration validated"
   [... additional validation results ...]
```

## 6. TROUBLESHOOTING

### Issue: "Python not recognized"
**Solution:**
1. Close and reopen Command Prompt
2. If persists, restart computer
3. If still fails, reinstall with "Add to PATH" checked

### Issue: Antivirus blocks installation
**Solution:**
1. Temporarily disable antivirus
2. Complete installation
3. Re-enable antivirus
4. Add C:\Program Files\BlueFrontier to exclusions

### Issue: Dashboard shortcut doesn't work
**Solution:**
1. Navigate to: C:\Users\[YourName]\BlueFrontier
2. Double-click dashboard.html directly
3. Bookmark page in browser

### Issue: "Access Denied" during installation
**Solution:**
1. Right-click installer
2. Select "Run as Administrator"
3. Provide admin credentials if prompted

## 7. POST-INSTALLATION TASKS

### 7.1 Technician Checklist
- [ ] Installation completed successfully
- [ ] Command-line tools verified
- [ ] Dashboard accessible
- [ ] Desktop shortcuts created
- [ ] Bookmark dashboard in browser
- [ ] Review quick reference guide
- [ ] Complete training module (if assigned)

### 7.2 Reporting
**Immediately report to Service Ops if:**
- Installation fails after 2 attempts
- Any tool shows "NOT READY" status
- Command-line tools produce errors
- Cannot connect to test controller

**Report via:**
- Email: fieldops@bluefrontier.com
- Phone: 1-800-BF-FIELD
- Ticket: service.bluefrontier.com

## 8. MAINTENANCE & UPDATES

### 8.1 Checking for Updates
```
1. Open Command Prompt
2. Run: blue-update check
3. If updates available: blue-update install
```

### 8.2 Update Schedule
- Critical updates: Install immediately when notified
- Regular updates: Monthly (first Monday)
- Major versions: Quarterly with training

## 9. UNINSTALLATION (IF REQUIRED)

```
1. Win + R → "appwiz.cpl" → Enter
2. Find "Blue Frontier BLUE Package"
3. Right-click → Uninstall
4. Follow prompts
5. Delete C:\Users\[YourName]\BlueFrontier manually if needed
```

## 10. REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-12 | Blue AI | Initial release |

## 11. APPROVAL

**Prepared By:** Blue (AI Assistant)  
**Reviewed By:** ____________________  
**Approved By:** ____________________  
**Date:** ____________________  

---

**END OF DOCUMENT**

*For questions or clarifications, contact Blue Frontier Field Operations*

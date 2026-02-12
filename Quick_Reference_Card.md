# BLUE PACKAGE - TECHNICIAN QUICK REFERENCE CARD

## 🚀 QUICK START

### Open Dashboard
**Desktop:** Double-click "Blue Frontier Dashboard" icon  
**Manual:** C:\Users\[You]\BlueFrontier\dashboard.html

### Open Command Prompt
**Keyboard:** Win + R, type "cmd", press Enter  
**Menu:** Start → Command Prompt

---

## ⚡ COMMON COMMANDS

### Validate Controller Configuration
```
distech-validate [URL] -u [username] -p [password]
```
**Example:**
```
distech-validate https://192.168.1.100 -u admin -p MyPass123
```

### Auto-Fix Configuration Issues
```
distech-validate [URL] -u [username] -p [password] --fix
```

### Test Regenerator Airflow
```
distech-test airflow regenerator [URL] -u [username] -p [password]
```

### Test All Conditioner Blowers (Fast)
```
distech-test airflow conditioner_blower1,conditioner_blower2,conditioner_blower3 [URL] -u [username] -p [password] --combined
```

### Test Regenerator Pump
```
distech-test pump regen [URL] -u [username] -p [password]
```

### Get JSON Output (For Reports)
```
distech-test airflow regenerator [URL] -u [username] -p [password] --json
```

---

## 🎯 TYPICAL WORKFLOWS

### New Installation Commissioning
```
1. Validate configuration:
   distech-validate [URL] -u [user] -p [pass] --fix

2. Test regenerator:
   distech-test airflow regenerator [URL] -u [user] -p [pass]

3. Test all conditioner blowers:
   distech-test airflow conditioner_blower1,conditioner_blower2,conditioner_blower3 [URL] -u [user] -p [pass] --combined

4. Test pumps:
   distech-test pump regen [URL] -u [user] -p [pass]
   distech-test pump conditioner [URL] -u [user] -p [pass]
```

### Service Call Diagnostics
```
1. Quick validation:
   distech-validate [URL] -u [user] -p [pass]

2. Test specific component (based on complaint):
   distech-test airflow regenerator [URL] -u [user] -p [pass]
```

### Remote Troubleshooting
```
1. Validate remotely:
   distech-validate https://site-controller.com -u [user] -p [pass]

2. If issues found, apply fixes:
   distech-validate https://site-controller.com -u [user] -p [pass] --fix
```

---

## 🔧 TROUBLESHOOTING

### Can't Connect to Controller
- Verify URL (should start with https://)
- Check network connection
- Ping controller: `ping 192.168.1.100`
- Verify credentials with customer

### Validation Fails
- Run with --fix flag to auto-correct
- If still fails, check controller IoT Hub config
- Verify YAML config file is correct

### Test Hangs/Freezes
- Use --no-cleanup flag to debug
- Check if DOAS is actually disabled
- Verify sensor readings are changing

### Command Not Recognized
- Close and reopen Command Prompt
- Restart computer
- Verify installation: `where distech-validate`

---

## 📞 SUPPORT CONTACTS

**Support:** support@bluefrontierac.com  
**Technical Lead:** scott.hicks@bluefrontierac.com  
**Emergency:** 1-833-700-BLUE  
**Ticket System:** service.bluefrontier.com

---

## 🎓 PRO TIPS

✅ Always validate BEFORE testing  
✅ Use --combined for faster multi-tests  
✅ Use --json to generate reports  
✅ Bookmark common controller URLs  
✅ Keep command history in notepad  

---

**Version 1.0 | Feb 2026 | Blue Frontier**

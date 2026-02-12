# Blue Frontier LD-DOAS Tools & Utilities

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

**Professional-grade tools for Blue Frontier Liquid Desiccant Dedicated Outdoor Air System (LD-DOAS) validation, testing, and diagnostics.**

---

## 📦 Repository Contents

```
blue_frontier_repository/
│
├── distech_utils/              # Core Python package
│   ├── config/                 # Test configurations & YAML standards
│   ├── schemas/                # Data models & validation schemas
│   ├── tests/framework/        # Test execution framework
│   ├── client.py               # Distech API client
│   ├── validator.py            # Configuration validator
│   ├── test_runner.py          # Test runner
│   └── validate.py             # CLI validation tool
│
├── docs/                       # Documentation
│   └── sops/                   # Standard Operating Procedures
│       ├── BF-SOP-001_Installation.md
│       ├── Quick_Reference_Card.md
│       ├── Troubleshooting_Guide.md
│       └── Training_Checklist.md
│
├── tools/                      # Support tools
│   └── dashboard/              # Field technician dashboard
│       ├── blue_tech_dashboard.html
│       ├── install_dashboard.bat
│       └── README.md
│
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Installation

```bash
# Install from source
pip install -e .

# Or install directly from GitHub
pip install git+https://github.com/bluefrontierac/distech-utils.git
```

### Basic Usage

**Validate controller configuration:**
```bash
distech-validate https://controller-url -u username -p password --fix
```

**Test DOAS performance:**
```bash
# Test regenerator airflow
distech-test airflow regenerator https://controller-url -u username -p password

# Test all conditioner blowers (fast combined mode)
distech-test airflow conditioner_blower1,conditioner_blower2,conditioner_blower3 \
  https://controller-url -u username -p password --combined
```

---

## 🎯 Key Features

### ✅ Controller Validation
- 8-step validation pipeline
- Automatic configuration fixes
- IoT Hub connectivity checks
- Scheduled task verification
- YAML-based standards enforcement

### ✅ Performance Testing
- Regenerator airflow testing
- Conditioner blower testing (all 3 blowers)
- Pump flow rate testing
- Combined test mode (faster)
- JSON output for automation

### ✅ Safety Features
- Automatic DOAS subsystem disable during testing
- System state management
- Automatic cleanup and restoration
- Built-in wait times for stabilization

### ✅ Field Tools
- Branded technician dashboard
- One-click Windows installation
- Quick reference cards
- Comprehensive SOPs
- Training materials

---

## 📚 Documentation

### For Technicians
- **[Installation SOP](docs/sops/BF-SOP-001_Installation.md)** - Complete installation guide
- **[Quick Reference](docs/sops/Quick_Reference_Card.md)** - Common commands at-a-glance
- **[Troubleshooting Guide](docs/sops/Troubleshooting_Guide.md)** - Solve common issues
- **[Training Checklist](docs/sops/Training_Checklist.md)** - Certification requirements

### For Developers
- **[Package README](distech_utils/README.md)** - Technical documentation
- **[API Reference](docs/api/)** - Full API documentation (if available)
- **[Configuration Guide](docs/configuration.md)** - Adding new tests (if available)

---

## 🛠️ Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/bluefrontierac/distech-utils.git
cd distech-utils

# Install in development mode
pip install -e .

# Verify installation
distech-validate --help
distech-test --help
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=distech_utils
```

---

## 🏢 Support

**Technical Support:**
- Email: support@bluefrontierac.com
- Technical Lead: scott.hicks@bluefrontierac.com
- Phone: 1-833-700-BLUE

**For Emergencies:**
- Call: 1-833-700-BLUE
- Ticket System: service.bluefrontier.com

---

## 📋 System Requirements

- **Python:** 3.8 or higher
- **Operating System:** Windows 10/11, Linux, macOS
- **Network:** HTTPS connectivity to controllers
- **Disk Space:** 5GB recommended

---

## 🔒 Security & Compliance

- All controller communication over HTTPS
- Basic Auth with secure credential handling
- No credential storage in logs
- Complies with Blue Frontier security policies

---

## 📄 License

Proprietary software. © 2026 Blue Frontier.  
All rights reserved. Unauthorized use, reproduction, or distribution prohibited.

---

## 🙏 Acknowledgments

**Developed by:** Blue Frontier Engineering Team  
**AI Assistant:** Blue (Claude by Anthropic)  
**Contributors:** Field Service Operations Team

---

## 📈 Version History

**v1.0.0** (February 2026)
- Initial release
- Complete validation system
- Airflow and pump testing
- Field technician tools
- Comprehensive documentation

---

**For internal Blue Frontier use only.**  
**Questions? Contact support@bluefrontierac.com**

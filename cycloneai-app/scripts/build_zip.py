#!/usr/bin/env python3
import os, zipfile, tarfile, time

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public_dir = os.path.join(root_dir, "public")
os.makedirs(public_dir, exist_ok=True)

out_zip = os.path.join(public_dir, "cycloneai-complete-project.zip")
out_tar = os.path.join(public_dir, "cycloneai-complete-project.tar.gz")

ignore_dirs = {"node_modules", "dist", ".git", ".next", "__pycache__"}
ignore_files = {"cycloneai-complete-project.zip", "cycloneai-complete-project.tar.gz"}

now_time = time.localtime(time.time())[:6]

bat_content = """@echo off
title CycloneAI Disaster Management Platform
echo ========================================================
echo   Starting CycloneAI Disaster Management Platform
echo ========================================================
echo.
echo Checking Node.js environment on your laptop...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js from https://nodejs.org/ (v18 or higher LTS).
    echo After installing Node.js, run this file again.
    echo.
    pause
    exit /b 1
)

echo Node.js detected! Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install encountered an error.
    pause
    exit /b 1
)

echo Starting local development server on http://localhost:3000 ...
call npm run dev
pause
"""

sh_content = """#!/usr/bin/env bash
echo "========================================================"
echo "  Starting CycloneAI Disaster Management Platform"
echo "========================================================"
if ! command -v node &> /dev/null; then
    echo ""
    echo "[ERROR] Node.js is not installed on this machine!"
    echo "Please download and install Node.js from https://nodejs.org/ (v18 or higher LTS)."
    echo ""
    exit 1
fi

echo "Installing project dependencies..."
npm install

echo "Starting server on http://localhost:3000 ..."
npm run dev
"""

readme_content = """========================================================================
   CYCLONE-AI DISASTER GIS & EMERGENCY MANAGEMENT PLATFORM
   Smart India Hackathon 2026 Breakthrough Project
========================================================================

HOW TO OPEN & RUN ON YOUR LAPTOP:

PREREQUISITE:
- Install Node.js (version 18 or newer) from: https://nodejs.org/

METHOD 1: AUTOMATIC LAUNCH (RECOMMENDED)
----------------------------------------
On Windows Laptop:
  Double-click "START_WINDOWS.bat"

On Mac / Linux Laptop:
  Double-click or run "./START_MAC_LINUX.sh" in terminal.

METHOD 2: MANUAL TERMINAL LAUNCH
---------------------------------
1. Open Command Prompt (Windows) or Terminal (Mac/Linux).
2. Navigate to this extracted folder:
   cd cycloneai-app
3. Install dependencies:
   npm install
4. Run the development server:
   npm run dev
5. Open your web browser and visit:
   http://localhost:3000

KEY RESILIENT CAPABILITIES INCLUDED:
- Real-time Cyclone Tracking & IMD Dvorak Intensity Prediction
- Offline Zero-Net Shelter Check-In & Manifest Headcount Sync
- Emergency Officer Dispatch Call Simulator (works on laptops without cell modem)
- Multilingual Voice Broadcast Alerts (Odia, Bengali, Hindi, Telugu, Tamil, English)
- Acoustic CAP Level 4 Sirens
- Explainable AI (Grad-CAM++ & SHAP) Audits
- Integrated Firebase Cloud Sync with Offline Fallback
========================================================================
"""

with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    # Add helper files first with DOS attributes
    for filename, content in [
        ("cycloneai-app/START_WINDOWS.bat", bat_content),
        ("cycloneai-app/START_MAC_LINUX.sh", sh_content),
        ("cycloneai-app/HOW_TO_RUN_ON_LAPTOP.txt", readme_content)
    ]:
        finfo = zipfile.ZipInfo(filename, now_time)
        finfo.create_system = 0  # Windows FAT
        finfo.external_attr = 0x20  # Archive file
        zf.writestr(finfo, content.encode('utf-8'))

    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs and not d.startswith(".git") and d != "public"]
        rel_dir = os.path.relpath(dirpath, root_dir)
        target_dir = "cycloneai-app" if rel_dir == "." else os.path.join("cycloneai-app", rel_dir)

        if rel_dir != ".":
            dinfo = zipfile.ZipInfo(target_dir.replace("\\", "/") + "/", now_time)
            dinfo.create_system = 0  # Windows FAT
            dinfo.external_attr = 0x10  # Directory attribute
            zf.writestr(dinfo, "")

        for filename in filenames:
            if filename in ignore_files or filename.endswith(".zip") or filename.endswith(".tar.gz") or filename.endswith(".pyc"):
                continue
            src_path = os.path.join(dirpath, filename)
            arc_name = os.path.join(target_dir, filename).replace("\\", "/")
            
            finfo = zipfile.ZipInfo(arc_name, now_time)
            finfo.create_system = 0  # Windows FAT
            finfo.external_attr = 0x20  # Archive file attribute in DOS/Windows
            with open(src_path, "rb") as f:
                zf.writestr(finfo, f.read())

print("Built 100% Windows FAT zip:", out_zip)

# Also create clean tar.gz
with tarfile.open(out_tar, "w:gz") as tar:
    tar.add(out_zip, arcname="cycloneai-app.zip")

print("Built TAR package:", out_tar)

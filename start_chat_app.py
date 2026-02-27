#!/usr/bin/env python3
"""
=============================================
 Local Chat App Automated Startup Script
=============================================
Cross-platform Python script that checks every prerequisite,
offers to install missing ones, and launches the app.
"""

import json
import os
import platform
import shutil
import socket
import subprocess
import sys
import time
import webbrowser

# ── Configuration ───────────────────────────────────────────
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
BACKEND_PORT = 3000
FRONTEND_PORT = 5173

# Minimum Node.js version required (major)
MIN_NODE_MAJOR = 16

# ── Helpers ─────────────────────────────────────────────────
IS_WINDOWS = platform.system() == "Windows"
IS_MAC = platform.system() == "Darwin"

GREEN = "" if IS_WINDOWS else "\033[0;32m"
RED = "" if IS_WINDOWS else "\033[0;31m"
YELLOW = "" if IS_WINDOWS else "\033[1;33m"
CYAN = "" if IS_WINDOWS else "\033[0;36m"
RESET = "" if IS_WINDOWS else "\033[0m"

if IS_WINDOWS:
    os.system("color 0A")


def step(number, total, message):
    print(f"\n[{number}/{total}] {message}")


def success(msg):
    print(f"  {GREEN}✔ {msg}{RESET}")


def warn(msg):
    print(f"  {YELLOW}⚠ {msg}{RESET}")


def info(msg):
    print(f"  {CYAN}ℹ {msg}{RESET}")


def error_exit(msg):
    print(f"  {RED}✖ ERROR: {msg}{RESET}")
    input("\nPress Enter to exit...")
    sys.exit(1)


def ask_yes_no(prompt, default_yes=True):
    """Prompt the user with a yes/no question."""
    hint = "[Y/n]" if default_yes else "[y/N]"
    try:
        answer = input(f"  {prompt} {hint}: ").strip().lower()
    except (EOFError, KeyboardInterrupt):
        print()
        return default_yes
    if answer == "":
        return default_yes
    return answer in ("y", "yes")


def run_silent(cmd, **kwargs):
    """Run a command and return (returncode, stdout)."""
    result = subprocess.run(
        cmd, capture_output=True, text=True, shell=True, **kwargs
    )
    return result.returncode, result.stdout.strip()


def run_visible(cmd, cwd=None):
    """Run a command with output visible to the user. Returns exit code."""
    return subprocess.call(cmd, shell=True, cwd=cwd)


def port_in_use(port):
    """Check whether a TCP port is already bound on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        return s.connect_ex(("127.0.0.1", port)) == 0


def get_lan_ip():
    """Return the best-guess LAN IPv4 address."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(2)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and not ip.startswith("169.") and ip != "127.0.0.1":
            return ip
    except Exception:
        pass
    return "localhost"


def parse_version(version_str):
    """Parse 'vX.Y.Z' or 'X.Y.Z' into a tuple of ints."""
    version_str = version_str.lstrip("v")
    parts = []
    for p in version_str.split("."):
        try:
            parts.append(int(p))
        except ValueError:
            parts.append(0)
    return tuple(parts)


def spawn_server(title, directory, command):
    """Launch a server process in a new terminal window / background."""
    if IS_WINDOWS:
        subprocess.Popen(
            f'start "{title}" cmd /k "cd /d {directory} && {command}"',
            shell=True,
        )
    elif IS_MAC:
        apple_script = (
            f'tell application "Terminal" to do script '
            f'"cd \'{directory}\' && {command}"'
        )
        subprocess.Popen(["osascript", "-e", apple_script])
    else:
        for attempt in [
            ["gnome-terminal", "--tab", f"--title={title}", "--", "bash", "-c",
             f"cd '{directory}' && {command}; exec bash"],
            ["xterm", "-T", title, "-e",
             f"cd '{directory}' && {command}; bash"],
        ]:
            if shutil.which(attempt[0]):
                subprocess.Popen(attempt)
                return
        subprocess.Popen(
            command, shell=True, cwd=directory,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )


def check_package_integrity(project_dir):
    """
    Return True if node_modules exists AND every dependency listed in
    package.json is present inside node_modules.
    """
    nm = os.path.join(project_dir, "node_modules")
    pkg = os.path.join(project_dir, "package.json")
    if not os.path.isdir(nm) or not os.path.isfile(pkg):
        return False
    try:
        with open(pkg, "r", encoding="utf-8") as f:
            data = json.load(f)
        deps = list(data.get("dependencies", {}).keys())
        deps += list(data.get("devDependencies", {}).keys())
        for dep in deps:
            # Handle scoped packages like @vitejs/plugin-react
            if not os.path.isdir(os.path.join(nm, dep)):
                return False
    except Exception:
        return False
    return True


def install_node_prompt():
    """Guide the user to install Node.js (platform-aware)."""
    print()
    print(f"  {RED}Node.js is required but was not found.{RESET}")
    print()
    if IS_WINDOWS:
        print("  Options to install Node.js:")
        print("    1) Download installer: https://nodejs.org/")
        print("    2) Via winget:  winget install OpenJS.NodeJS.LTS")
        print("    3) Via choco:   choco install nodejs-lts")
        print()
        if shutil.which("winget"):
            if ask_yes_no("Install Node.js now via winget?"):
                rc = run_visible("winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements")
                if rc == 0:
                    success("Node.js installed. Please RESTART this script so the PATH updates take effect.")
                    input("Press Enter to exit...")
                    sys.exit(0)
                else:
                    error_exit("winget installation failed. Install manually from https://nodejs.org/")
        elif shutil.which("choco"):
            if ask_yes_no("Install Node.js now via Chocolatey?"):
                rc = run_visible("choco install nodejs-lts -y")
                if rc == 0:
                    success("Node.js installed. Please RESTART this script so the PATH updates take effect.")
                    input("Press Enter to exit...")
                    sys.exit(0)
                else:
                    error_exit("Chocolatey installation failed. Install manually from https://nodejs.org/")
    elif IS_MAC:
        print("  Options to install Node.js:")
        print("    1) Download installer: https://nodejs.org/")
        print("    2) Via Homebrew:  brew install node")
        print()
        if shutil.which("brew"):
            if ask_yes_no("Install Node.js now via Homebrew?"):
                rc = run_visible("brew install node")
                if rc == 0:
                    success("Node.js installed successfully.")
                    # Homebrew updates PATH in the current shell
                    return True  # signal to re-check
                else:
                    error_exit("Homebrew installation failed. Install manually from https://nodejs.org/")
    else:
        print("  Options to install Node.js:")
        print("    1) Download: https://nodejs.org/")
        print("    2) Via nvm:  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash")
        print("    3) Via apt:  sudo apt install nodejs npm")
        print()
        if shutil.which("apt"):
            if ask_yes_no("Install Node.js now via apt?"):
                rc = run_visible("sudo apt update && sudo apt install -y nodejs npm")
                if rc == 0:
                    success("Node.js installed successfully.")
                    return True
                else:
                    error_exit("apt installation failed. Install manually from https://nodejs.org/")

    error_exit("Node.js is required. Install it and re-run this script.")


# ── Main ────────────────────────────────────────────────────
def main():
    total = 9

    print("=" * 50)
    print("  Local Chat App Auto Starter")
    print("=" * 50)

    # ── 1) Project structure ────────────────────────────────
    step(1, total, "Verifying project structure...")
    missing = []
    for d in [BACKEND_DIR, FRONTEND_DIR]:
        if not os.path.isdir(d):
            missing.append(d)
    for f in [
        os.path.join(BACKEND_DIR, "package.json"),
        os.path.join(BACKEND_DIR, "server.js"),
        os.path.join(FRONTEND_DIR, "package.json"),
        os.path.join(FRONTEND_DIR, "index.html"),
        os.path.join(FRONTEND_DIR, "vite.config.js"),
    ]:
        if not os.path.isfile(f):
            missing.append(f)
    if missing:
        for m in missing:
            print(f"  {RED}Missing: {m}{RESET}")
        error_exit("Project files are incomplete. Re-clone the repository.")
    success("All required project files present.")

    # ── 2) Node.js ──────────────────────────────────────────
    step(2, total, "Checking Node.js installation...")
    if not shutil.which("node"):
        install_node_prompt()
        # Re-check after attempted install
        if not shutil.which("node"):
            error_exit("Node.js still not found after installation attempt.")

    rc, node_version = run_silent("node -v")
    node_ver_tuple = parse_version(node_version)
    if node_ver_tuple[0] < MIN_NODE_MAJOR:
        warn(f"Node.js {node_version} detected — version {MIN_NODE_MAJOR}+ recommended.")
        if not ask_yes_no("Continue anyway?", default_yes=False):
            error_exit(f"Please upgrade Node.js to v{MIN_NODE_MAJOR}+.")
    success(f"Node.js {node_version}")

    # ── 3) npm ──────────────────────────────────────────────
    step(3, total, "Checking npm installation...")
    if not shutil.which("npm"):
        warn("npm not found. Attempting to install via Node.js corepack...")
        rc = run_visible("corepack enable")
        if not shutil.which("npm"):
            error_exit(
                "npm is required but not found. It usually ships with Node.js — "
                "try reinstalling Node.js from https://nodejs.org/"
            )
    rc, npm_version = run_silent("npm -v")
    success(f"npm {npm_version}")

    # ── 4) Port availability ────────────────────────────────
    step(4, total, "Checking port availability...")
    ports_ok = True
    if port_in_use(BACKEND_PORT):
        warn(f"Port {BACKEND_PORT} (backend) is already in use!")
        ports_ok = False
    else:
        success(f"Port {BACKEND_PORT} (backend) is free.")

    if port_in_use(FRONTEND_PORT):
        warn(f"Port {FRONTEND_PORT} (frontend) is already in use!")
        ports_ok = False
    else:
        success(f"Port {FRONTEND_PORT} (frontend) is free.")

    if not ports_ok:
        if not ask_yes_no("Ports may conflict. Continue anyway?", default_yes=False):
            error_exit("Free the ports and try again.")

    # ── 5) Backend dependencies ─────────────────────────────
    step(5, total, "Checking backend dependencies...")
    if not check_package_integrity(BACKEND_DIR):
        if os.path.isdir(os.path.join(BACKEND_DIR, "node_modules")):
            warn("Some backend packages are missing or corrupted.")
        else:
            info("Backend node_modules not found.")

        if ask_yes_no("Install/reinstall backend dependencies?"):
            print("  Installing backend dependencies...")
            rc = run_visible("npm install", cwd=BACKEND_DIR)
            if rc != 0:
                error_exit("Backend dependency installation failed.")
            success("Backend dependencies installed.")
        else:
            error_exit("Backend dependencies are required to run the app.")
    else:
        success("Backend dependencies are up to date.")

    # ── 6) Frontend dependencies ────────────────────────────
    step(6, total, "Checking frontend dependencies...")
    if not check_package_integrity(FRONTEND_DIR):
        if os.path.isdir(os.path.join(FRONTEND_DIR, "node_modules")):
            warn("Some frontend packages are missing or corrupted.")
        else:
            info("Frontend node_modules not found.")

        if ask_yes_no("Install/reinstall frontend dependencies?"):
            print("  Installing frontend dependencies...")
            rc = run_visible("npm install", cwd=FRONTEND_DIR)
            if rc != 0:
                error_exit("Frontend dependency installation failed.")
            success("Frontend dependencies installed.")
        else:
            error_exit("Frontend dependencies are required to run the app.")
    else:
        success("Frontend dependencies are up to date.")

    # ── 7) Verify critical CLI tools from node_modules ──────
    step(7, total, "Verifying critical packages (nodemon, vite)...")
    issues = []

    nodemon_bin = os.path.join(
        BACKEND_DIR, "node_modules", ".bin",
        "nodemon.cmd" if IS_WINDOWS else "nodemon",
    )
    if not os.path.isfile(nodemon_bin):
        issues.append(("nodemon", BACKEND_DIR))

    vite_bin = os.path.join(
        FRONTEND_DIR, "node_modules", ".bin",
        "vite.cmd" if IS_WINDOWS else "vite",
    )
    if not os.path.isfile(vite_bin):
        issues.append(("vite", FRONTEND_DIR))

    if issues:
        for pkg, d in issues:
            warn(f"'{pkg}' binary not found in {os.path.basename(d)}/node_modules/.bin")
        info("Attempting to fix with a fresh npm install...")
        for pkg, d in issues:
            run_visible("npm install", cwd=d)
        # Re-check
        still_missing = []
        if not os.path.isfile(nodemon_bin):
            still_missing.append("nodemon")
        if not os.path.isfile(vite_bin):
            still_missing.append("vite")
        if still_missing:
            error_exit(
                f"Required tool(s) still missing: {', '.join(still_missing)}. "
                "Try deleting node_modules and running this script again."
            )
    success("nodemon and vite are available.")

    # ── 8) Start servers ────────────────────────────────────
    step(8, total, "Starting servers...")

    print("  Launching backend (nodemon on port 3000)...")
    spawn_server("chat-backend", BACKEND_DIR, "npm run dev")
    time.sleep(3)

    print("  Launching frontend (Vite on port 5173)...")
    spawn_server("chat-frontend", FRONTEND_DIR, "npm run dev")
    print("  Waiting for frontend to start...")
    time.sleep(5)

    # ── 9) Open browsers ───────────────────────────────────
    step(9, total, "Determining LAN IP & opening browser...")
    lan_ip = get_lan_ip()

    local_url = f"http://localhost:{FRONTEND_PORT}"
    lan_url = f"http://{lan_ip}:{FRONTEND_PORT}"

    print(f"    Local: {local_url}")
    print(f"    LAN:   {lan_url}")

    webbrowser.open(local_url)
    webbrowser.open(lan_url)

    print()
    print("=" * 50)
    print(f"  {GREEN}Startup complete!{RESET}")
    print("  Close the spawned terminal windows to stop servers.")
    print("=" * 50)

    input("\nPress Enter to exit...")


if __name__ == "__main__":
    main()

"""
Deep SSL diagnostic - writes results to a file for clean reading.
"""

import ssl
import socket
import certifi
import sys
from dotenv import load_dotenv
import os

load_dotenv()
uri = os.getenv("MONGODB_URL")

# Extract the first host from the URI
import re

hosts = re.findall(r"(ac-pzspd9o-shard-\d+-\d+\.6lzhtrl\.mongodb\.net)", uri)
host = hosts[0] if hosts else None
port = 27017

results = []


def log(msg=""):
    results.append(msg)
    print(msg)


log(f"Python: {sys.version}")
log(f"OpenSSL: {ssl.OPENSSL_VERSION}")
log(f"Target: {host}:{port}")
log(f"certifi: {certifi.where()}")
log()

# Test 1: Raw TCP
log("=" * 60)
log("[Test 1] Raw TCP socket connection")
try:
    sock = socket.create_connection((host, port), timeout=10)
    log(f"  RESULT: TCP OK")
    sock.close()
except Exception as e:
    log(f"  RESULT: TCP FAILED - {e}")

# Test 2: Default TLS context
log()
log("=" * 60)
log("[Test 2] TLS handshake - default context + certifi")
try:
    ctx = ssl.create_default_context(cafile=certifi.where())
    sock = socket.create_connection((host, port), timeout=10)
    tls_sock = ctx.wrap_socket(sock, server_hostname=host)
    log(f"  RESULT: OK - {tls_sock.version()} / {tls_sock.cipher()[0]}")
    tls_sock.close()
except Exception as e:
    log(f"  RESULT: FAILED - {type(e).__name__}: {e}")

# Test 3: No verification
log()
log("=" * 60)
log("[Test 3] TLS handshake - CERT_NONE (no verification)")
try:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    sock = socket.create_connection((host, port), timeout=10)
    tls_sock = ctx.wrap_socket(sock, server_hostname=host)
    log(f"  RESULT: OK - {tls_sock.version()} / {tls_sock.cipher()[0]}")
    tls_sock.close()
except Exception as e:
    log(f"  RESULT: FAILED - {type(e).__name__}: {e}")

# Test 4: Force TLS 1.2
log()
log("=" * 60)
log("[Test 4] TLS handshake - force TLS 1.2")
try:
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    ctx.maximum_version = ssl.TLSVersion.TLSv1_2
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    sock = socket.create_connection((host, port), timeout=10)
    tls_sock = ctx.wrap_socket(sock, server_hostname=host)
    log(f"  RESULT: OK - {tls_sock.version()} / {tls_sock.cipher()[0]}")
    tls_sock.close()
except Exception as e:
    log(f"  RESULT: FAILED - {type(e).__name__}: {e}")

# Test 5: Public IP check
log()
log("=" * 60)
log("[Test 5] Public IP (must be whitelisted in Atlas)")
try:
    import urllib.request

    ip = urllib.request.urlopen("https://api.ipify.org", timeout=5).read().decode()
    log(f"  Your IP: {ip}")
except Exception as e:
    log(f"  Could not determine IP: {e}")

log()
log("DONE")

# Write to file
with open("scripts/ssl_results.txt", "w") as f:
    f.write("\n".join(results))

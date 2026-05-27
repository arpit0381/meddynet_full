"""
Focused MongoDB Atlas SSL diagnostic for Windows.
Tests multiple connection strategies to find one that works.
"""
import sys
import certifi
import ssl
print(f"Python: {sys.version}")
print(f"certifi CA bundle: {certifi.where()}")
print(f"OpenSSL version: {ssl.OPENSSL_VERSION}")
print()

# --- Read the URI from .env ---
from dotenv import load_dotenv
import os
load_dotenv()
uri = os.getenv("MONGODB_URL")
print(f"URI prefix: {uri[:30]}...")
print()

# =============================================
# Strategy 1: pymongo sync with tlsCAFile only
# =============================================
print("=" * 60)
print("[Strategy 1] Sync pymongo + tlsCAFile=certifi")
print("=" * 60)
try:
    from pymongo import MongoClient
    client = MongoClient(
        uri,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=10000,
    )
    client.admin.command('ping')
    print("✅ SUCCESS\n")
    client.close()
except Exception as e:
    print(f"❌ FAILED: {e}\n")

# =============================================
# Strategy 2: pymongo sync with tlsAllowInvalidCertificates
# =============================================
print("=" * 60)
print("[Strategy 2] Sync pymongo + tlsAllowInvalidCertificates")
print("=" * 60)
try:
    from pymongo import MongoClient
    client = MongoClient(
        uri,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=10000,
    )
    client.admin.command('ping')
    print("✅ SUCCESS\n")
    client.close()
except Exception as e:
    print(f"❌ FAILED: {e}\n")

# =============================================
# Strategy 3: pymongo sync with both
# =============================================
print("=" * 60)
print("[Strategy 3] Sync pymongo + tlsCAFile + tlsAllowInvalidCerts")
print("=" * 60)
try:
    from pymongo import MongoClient
    client = MongoClient(
        uri,
        tls=True,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=10000,
    )
    client.admin.command('ping')
    print("✅ SUCCESS\n")
    client.close()
except Exception as e:
    print(f"❌ FAILED: {e}\n")

# =============================================
# Strategy 4: mongodb+srv:// format (if dns resolves)
# =============================================
print("=" * 60)
print("[Strategy 4] SRV URI + tlsCAFile")
print("=" * 60)
try:
    from pymongo import MongoClient
    # Derive SRV URI from the standard URI
    # Original nodes: ac-pzspd9o-shard-00-XX.6lzhtrl.mongodb.net
    # SRV format typically uses the cluster name
    srv_uri = uri.replace("mongodb://", "mongodb+srv://")
    # Remove port numbers and shard node list, keep only the base host
    # SRV URI should be: mongodb+srv://user:pass@<cluster>.6lzhtrl.mongodb.net/db?options
    # Extract user:pass@
    import re
    match = re.match(r'mongodb\+srv://([^@]+)@.*?\.6lzhtrl\.mongodb\.net.*?/(.*)', srv_uri)
    if match:
        creds = match.group(1)
        rest = match.group(2)
        # For Atlas, try the common pattern
        srv_test = f"mongodb+srv://{creds}@cluster0.6lzhtrl.mongodb.net/{rest}"
        print(f"  Trying: {srv_test[:50]}...")
        client = MongoClient(
            srv_test,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000,
        )
        client.admin.command('ping')
        print("✅ SUCCESS\n")
        client.close()
    else:
        print("⚠️ Could not derive SRV URI\n")
except Exception as e:
    print(f"❌ FAILED: {e}\n")

# =============================================
# Strategy 5: URI with tls params appended
# =============================================
print("=" * 60)
print("[Strategy 5] Original URI + tlsInsecure=true in query string")
print("=" * 60)
try:
    from pymongo import MongoClient
    test_uri = uri + "&tlsInsecure=true" if "?" in uri else uri + "?tlsInsecure=true"
    client = MongoClient(
        test_uri,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=10000,
    )
    client.admin.command('ping')
    print("✅ SUCCESS\n")
    client.close()
except Exception as e:
    print(f"❌ FAILED: {e}\n")

print("=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)

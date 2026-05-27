import pymongo
import certifi
import ssl
from pymongo.mongo_client import MongoClient

def test_sync_mongo():
    uri = "mongodb://meddynetlabs_db_user:Mz4v4uyaAaRiP0Ig@ac-pzspd9o-shard-00-00.6lzhtrl.mongodb.net:27017,ac-pzspd9o-shard-00-01.6lzhtrl.mongodb.net:27017,ac-pzspd9o-shard-00-02.6lzhtrl.mongodb.net:27017/meddynet_analytics?ssl=true&replicaSet=atlas-pzspd9o-shard-0&authSource=admin&retryWrites=true&w=majority"
    
    print(f"\n[SYNC TEST] Testing MongoDB Atlas via Sync MongoClient")
    print("--------------------------------------------------")
    
    try:
        # Step 1: Create client with absolute basic SSL bypass
        client = MongoClient(
            uri,
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000
        )
        
        # Step 2: Ping
        client.admin.command('ping')
        print("✅ SYNC MONGODB: Healthy")
        
        # Step 3: Count
        db = client['meddynet_analytics']
        count = db.logs.count_documents({})
        print(f"✅ SYNC MONGODB: Data Access OK (Log Count: {count})")
        
    except Exception as e:
        print(f"❌ SYNC MONGODB: Failed! {e}")

if __name__ == "__main__":
    test_sync_mongo()

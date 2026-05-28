import asyncio
import httpx
import json


async def verify_diagnostics():
    url = "http://localhost:8000/v1/diagnostics/"
    print(f"\n[DIAGNOSTICS] Pinging Healthy API: {url}")
    print("--------------------------------------------------")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                print(f"OVERALL STATUS: {data['overall_status'].upper()}")
                print("--------------------------------------------------")

                for service, info in data["services"].items():
                    status_marker = "✅" if info["status"] == "healthy" else "❌"
                    latency = info.get("latency_ms", "N/A")
                    print(f"{status_marker} {service.upper()}: {info['status']} ({latency}ms)")
                    if info["status"] != "healthy":
                        print(f"   Error: {info['error']}")
            else:
                print(f"❌ API Error: Status {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"❌ Connection Failed: Is the server running? {e}")


if __name__ == "__main__":
    asyncio.run(verify_diagnostics())

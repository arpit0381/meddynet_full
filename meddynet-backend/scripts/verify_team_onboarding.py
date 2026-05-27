import asyncio
import uuid
from app.database import async_session
from app.routers.lab_portal import onboard_technician, TechCreate
from app.models.lab import Lab
from sqlalchemy import select

async def verify_tech_onboarding():
    print("\n[TEST] Verifying Team Onboarding Logic (Lab Admin View)...")
    
    async with async_session() as db:
        # 1. Create a dummy lab first to host the tech
        lab_id = uuid.uuid4()
        lab = Lab(id=lab_id, name="Team Test Lab", slug=f"team-lab-{uuid.uuid4().hex[:6]}", 
                  phone="+910000000002", city="Pune", address="Lab HQ", lat=0, lng=0)
        db.add(lab)
        await db.commit()
        print(f"  [OK] Host Lab created: {lab_id}")

        # 2. Simulate Lab Admin adding a tech
        tech_data = TechCreate(
            name="John Doe Phlebo",
            phone=f"+917{uuid.uuid4().hex[:9]}",
            email="john.phlebo@example.com",
            vehicle="Bike-ABC-123",
            shift="morning"
        )
        
        print(f"  [+] Adding Technician: {tech_data.name}")
        try:
            # We bypass the Depends middleware and call the function directly
            response = await onboard_technician(tech_data, str(lab_id), db)
            print(f"  [OK] Response: {response}")
            
            # 3. Verify cross-linkage
            from app.models.user import User
            from app.models.technician import Technician
            
            res_user = await db.execute(select(User).filter(User.phone == tech_data.phone))
            user = res_user.scalar_one()
            print(f"  [VERIFY] User Role: {user.role} (Expected: technician)")
            print(f"  [VERIFY] User Lab ID: {user.lab_id} (Expected: {lab_id})")
            
            res_tech = await db.execute(select(Technician).filter(Technician.user_id == user.id))
            tech = res_tech.scalar_one()
            print(f"  [VERIFY] Tech Record Created. Status: {tech.status}")
            
        except Exception as e:
            print(f"  [FAIL] Onboarding Logic Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    import os
    os.environ["PYTHONPATH"] = "."
    asyncio.run(verify_tech_onboarding())

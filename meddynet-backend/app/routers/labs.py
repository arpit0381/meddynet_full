import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.schemas.lab import LabResponse, LabCreate
from app.models.lab import Lab
from app.middleware.rbac import require_role

router = APIRouter(prefix="/labs", tags=["labs"])
logger = logging.getLogger(__name__)

@router.get("", response_model=List[LabResponse])
async def list_labs(
    city: str = Query(None),
    lat: float = Query(None),
    lng: float = Query(None),
    is_nabl: bool = Query(None),
    home_collection: bool = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Lab).filter(Lab.is_active == True)
    if city:
        query = query.filter(Lab.city.ilike(f"%{city}%"))
    if is_nabl is not None:
        query = query.filter(Lab.is_nabl == is_nabl)
    if home_collection is not None:
        query = query.filter(Lab.home_collection == home_collection)
        
    query = query.options(selectinload(Lab.tests))
    result = await db.execute(query)
    labs = result.scalars().all()

    # Calculate distance if user location is provided
    if lat is not None and lng is not None:
        import math
        def get_distance(l1, ln1, l2, ln2):
            # Haversine formula
            R = 6371.0 # Radius of earth in km
            dlat = math.radians(l2 - l1)
            dlng = math.radians(ln2 - ln1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(l1)) * math.cos(math.radians(l2)) * math.sin(dlng / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        for lab in labs:
            lab.distance = round(get_distance(lat, lng, lab.lat, lab.lng), 2)
        
        # Optionally sort by distance
        labs = sorted(labs, key=lambda x: x.distance)

    # Dynamic Ratings from Reviews
    from app.models.review import Review
    from sqlalchemy import func
    lab_ids = [lab.id for lab in labs]
    if lab_ids:
        rev_res = await db.execute(
            select(Review.lab_id, func.avg(Review.rating).label('avg_r'), func.count(Review.id).label('c'))
            .filter(Review.lab_id.in_(lab_ids))
            .group_by(Review.lab_id)
        )
        rev_stats = {r.lab_id: {"avg": round(r.avg_r, 1), "c": r.c} for r in rev_res.all()}
        for lab in labs:
            stats = rev_stats.get(lab.id, {"avg": 4.5, "c": 0})
            setattr(lab, "avg_rating", stats["avg"])
            setattr(lab, "review_count", stats["c"])

    return labs

@router.get("/{lab_id}", response_model=LabResponse)
async def get_lab(lab_id: str, db: AsyncSession = Depends(get_db)):
    # Guard: /labs/me is handled exclusively by lab_portal router
    if lab_id == "me":
        raise HTTPException(status_code=404, detail="Use /labs/me with auth token")
    result = await db.execute(select(Lab).options(selectinload(Lab.tests)).filter(Lab.id == lab_id))
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    from app.models.review import Review
    from sqlalchemy import func
    rev_res = await db.execute(
        select(func.avg(Review.rating).label('avg_r'), func.count(Review.id).label('c'))
        .filter(Review.lab_id == lab.id)
    )
    stat = rev_res.first()
    setattr(lab, "avg_rating", round(stat.avg_r, 1) if stat and stat.avg_r else 4.5)
    setattr(lab, "review_count", stat.c if stat and stat.c else 0)

    return lab

@router.get("/search", response_model=List[LabResponse])
async def search_labs(
    q: str = Query(None),
    city: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Search labs by test name or category.
    """
    from app.models.lab import LabTest
    
    query = select(Lab).filter(Lab.is_active == True)
    
    if city:
        query = query.filter(Lab.city.ilike(f"%{city}%"))
        
    if q:
        # Join with tests to find matches
        query = (
            query.join(Lab.tests)
            .filter(
                (Lab.name.ilike(f"%{q}%")) |
                (LabTest.name.ilike(f"%{q}%")) |
                (LabTest.category.ilike(f"%{q}%"))
            )
            .distinct()
        )
    
    query = query.options(selectinload(Lab.tests))
    result = await db.execute(query)
    labs = result.scalars().all()
    
    # Dynamic Ratings
    from app.models.review import Review
    from sqlalchemy import func
    lab_ids = [lab.id for lab in labs]
    if lab_ids:
        rev_res = await db.execute(
            select(Review.lab_id, func.avg(Review.rating).label('avg_r'), func.count(Review.id).label('c'))
            .filter(Review.lab_id.in_(lab_ids))
            .group_by(Review.lab_id)
        )
        rev_stats = {r.lab_id: {"avg": round(r.avg_r, 1), "c": r.c} for r in rev_res.all()}
        for lab in labs:
            stats = rev_stats.get(lab.id, {"avg": 4.5, "c": 0})
            setattr(lab, "avg_rating", stats["avg"])
            setattr(lab, "review_count", stats["c"])

    return labs

#!/usr/bin/env python3
import json
import asyncio
import os
import sys

# Get project paths dynamically
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(script_dir)
backend_dir = os.path.join(root_dir, 'backend')
data_dir = os.path.join(backend_dir, 'data')

# Insert backend directory to python path
sys.path.insert(0, backend_dir)

from database import init_db, async_session
from models.knowledge_area import KnowledgeArea
from models.formula import Formula


async def seed():
    await init_db()
    async with async_session() as db:
        areas_path = os.path.join(data_dir, 'pmbok_areas.json')
        with open(areas_path) as f:
            areas = json.load(f)
        for area in areas:
            existing = await db.execute(
                select(KnowledgeArea).where(KnowledgeArea.name == area['name'])
            )
            if not existing.scalar_one_or_none():
                ka = KnowledgeArea(**area)
                db.add(ka)

        formulas_path = os.path.join(data_dir, 'pmbok_formulas.json')
        with open(formulas_path) as f:
            formulas = json.load(f)
        for formula in formulas:
            existing = await db.execute(
                select(Formula).where(Formula.name == formula['name'])
            )
            if not existing.scalar_one_or_none():
                f = Formula(**formula)
                db.add(f)

        await db.commit()
        print("Seeded PMBOK data successfully!")


if __name__ == "__main__":
    from sqlalchemy import select
    asyncio.run(seed())

#!/usr/bin/env python3
import json
import asyncio
import sys
sys.path.insert(0, '.')

from database import init_db, async_session
from models.knowledge_area import KnowledgeArea
from models.formula import Formula


async def seed():
    await init_db()
    async with db := async_session():
        with open('data/pmbok_areas.json') as f:
            areas = json.load(f)
        for area in areas:
            existing = await db.execute(
                select(KnowledgeArea).where(KnowledgeArea.name == area['name'])
            )
            if not existing.scalar_one_or_none():
                ka = KnowledgeArea(**area)
                db.add(ka)

        with open('data/pmbok_formulas.json') as f:
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

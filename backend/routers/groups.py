from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import random
import string
from database import get_db
from models.user import User
from models.group import StudyGroup, GroupMember, SharedDeck
from routers.auth import get_current_user

router = APIRouter(prefix="/api/groups", tags=["groups"])


def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


@router.post("/create")
async def create_group(
    name: str,
    description: str = "",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    group = StudyGroup(
        name=name,
        description=description,
        created_by=user.id,
        invite_code=generate_invite_code(),
    )
    db.add(group)
    await db.flush()
    member = GroupMember(group_id=group.id, user_id=user.id, role="admin")
    db.add(member)
    await db.commit()
    return {"id": group.id, "name": group.name, "invite_code": group.invite_code}


@router.post("/join")
async def join_group(
    invite_code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(StudyGroup).where(StudyGroup.invite_code == invite_code))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    existing = await db.execute(
        select(GroupMember).where(GroupMember.group_id == group.id, GroupMember.user_id == user.id)
    )
    if existing.scalar_one_or_none():
        return {"message": "Already a member", "group_id": group.id}
    member = GroupMember(group_id=group.id, user_id=user.id)
    db.add(member)
    await db.commit()
    return {"message": "Joined group", "group_id": group.id, "group_name": group.name}


@router.get("/my")
async def my_groups(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudyGroup)
        .join(GroupMember)
        .where(GroupMember.user_id == user.id)
    )
    groups = result.scalars().all()
    return [{"id": g.id, "name": g.name, "invite_code": g.invite_code} for g in groups]


@router.get("/{group_id}/members")
async def get_members(
    group_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GroupMember, User)
        .join(User, GroupMember.user_id == User.id)
        .where(GroupMember.group_id == group_id)
    )
    rows = result.fetchall()
    return [{"user_id": m[1].id, "username": m[1].username, "role": m[0].role} for m in rows]

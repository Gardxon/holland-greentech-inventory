from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Branch
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import base64

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    pin: str

class UserResponse(BaseModel):
    id: int
    username: str
    branch_id: int | None
    branch_name: str | None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MemberCreate(BaseModel):
    username: str
    pin: str
    branch_id: int
    is_admin: bool = False

@router.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with username and PIN"""
    user = db.query(User).filter(User.username == request.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Simple PIN check (in production, use proper password hashing)
    if user.hashed_password != request.pin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled")

    branch_name = None
    if user.branch_id:
        branch = db.query(Branch).filter(Branch.id == user.branch_id).first()
        branch_name = branch.name if branch else None

    return UserResponse(
        id=user.id,
        username=user.username,
        branch_id=user.branch_id,
        branch_name=branch_name,
        is_admin=user.is_admin,
        created_at=user.created_at
    )

@router.post("/members", response_model=UserResponse)
def create_member(member: MemberCreate, db: Session = Depends(get_db)):
    """Create a new branch member (Admin only)"""
    # Check if username already exists
    existing = db.query(User).filter(User.username == member.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Verify branch exists
    branch = db.query(Branch).filter(Branch.id == member.branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    db_user = User(
        username=member.username,
        email=f"{member.username}@hgt.local",
        hashed_password=member.pin,  # Store PIN directly for now
        branch_id=member.branch_id,
        is_admin=member.is_admin,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        branch_id=db_user.branch_id,
        branch_name=branch.name,
        is_admin=db_user.is_admin,
        created_at=db_user.created_at
    )

@router.get("/members", response_model=list[UserResponse])
def get_members(db: Session = Depends(get_db)):
    """Get all members"""
    users = db.query(User).filter(User.is_active == True).all()
    return [
        UserResponse(
            id=u.id,
            username=u.username,
            branch_id=u.branch_id,
            branch_name=u.branch.name if u.branch else None,
            is_admin=u.is_admin,
            created_at=u.created_at
        )
        for u in users
    ]

@router.get("/members/{user_id}", response_model=UserResponse)
def get_member(user_id: int, db: Session = Depends(get_db)):
    """Get a specific member"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    branch_name = None
    if user.branch_id:
        branch = db.query(Branch).filter(Branch.id == user.branch_id).first()
        branch_name = branch.name if branch else None

    return UserResponse(
        id=user.id,
        username=user.username,
        branch_id=user.branch_id,
        branch_name=branch_name,
        is_admin=user.is_admin,
        created_at=user.created_at
    )

@router.put("/members/{user_id}", response_model=UserResponse)
def update_member(user_id: int, member: MemberCreate, db: Session = Depends(get_db)):
    """Update member details"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.username = member.username
    user.hashed_password = member.pin
    user.branch_id = member.branch_id
    user.is_admin = member.is_admin

    db.commit()
    db.refresh(user)

    branch_name = None
    if user.branch_id:
        branch = db.query(Branch).filter(Branch.id == user.branch_id).first()
        branch_name = branch.name if branch else None

    return UserResponse(
        id=user.id,
        username=user.username,
        branch_id=user.branch_id,
        branch_name=branch_name,
        is_admin=user.is_admin,
        created_at=user.created_at
    )

@router.delete("/members/{user_id}")
def deactivate_member(user_id: int, db: Session = Depends(get_db)):
    """Deactivate a member"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()

    return {"message": "Member deactivated"}

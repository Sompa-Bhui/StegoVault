from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..models import models, database
from ..schemas import schemas
from .auth import get_current_user

router = APIRouter()

@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    total_encoded = db.query(models.EncodedImage).filter(models.EncodedImage.owner_id == current_user.id).count()
    total_decoded = db.query(models.ActivityLog).filter(
        models.ActivityLog.user_id == current_user.id,
        models.ActivityLog.action == "decode"
    ).count()
    
    last_activity = db.query(models.ActivityLog).filter(
        models.ActivityLog.user_id == current_user.id
    ).order_by(models.ActivityLog.timestamp.desc()).first()
    
    recent_images = db.query(models.EncodedImage).filter(
        models.EncodedImage.owner_id == current_user.id
    ).order_by(models.EncodedImage.created_at.desc()).limit(5).all()
    
    return {
        "total_encoded": total_encoded,
        "total_decoded": total_decoded,
        "last_activity": last_activity.timestamp if last_activity else None,
        "recent_images": recent_images
    }

@router.get("/history", response_model=List[schemas.ActivityResponse])
def get_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.ActivityLog).filter(
        models.ActivityLog.user_id == current_user.id
    ).order_by(models.ActivityLog.timestamp.desc()).limit(20).all()

@router.get("/images", response_model=List[schemas.EncodedImageResponse])
def get_user_images(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.EncodedImage).filter(
        models.EncodedImage.owner_id == current_user.id
    ).order_by(models.EncodedImage.created_at.desc()).all()

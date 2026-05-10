from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class EncodedImageResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    payload_type: str
    algorithm: str
    psnr: Optional[float]
    ssim: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityResponse(BaseModel):
    id: int
    action: str
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_encoded: int
    total_decoded: int
    last_activity: Optional[datetime]
    recent_images: List[EncodedImageResponse]

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    encoded_images = relationship("EncodedImage", back_populates="owner")
    activities = relationship("ActivityLog", back_populates="user")

class EncodedImage(Base):
    __tablename__ = "encoded_images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    original_name = Column(String)
    file_path = Column(String)
    payload_type = Column(String)  # 'text' or 'file'
    algorithm = Column(String)     # 'lsb', 'random_lsb', 'adaptive'
    is_encrypted = Column(Boolean, default=True)
    psnr = Column(Float, nullable=True)
    ssim = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="encoded_images")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)  # 'encode', 'decode', 'analyze', 'login'
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="activities")

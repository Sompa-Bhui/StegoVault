from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from typing import Optional
from PIL import Image, UnidentifiedImageError

from ..models import models, database
from ..schemas import schemas
from ..stego.engine import StegoEngine
from ..security.encryption import encrypt_data, decrypt_data
from .auth import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads"
ENCODED_DIR = "encoded_images"
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}


def validate_and_store_upload(image: UploadFile, destination_path: str) -> str:
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    file_ext = os.path.splitext(image.filename)[1].lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid image format. Use PNG, JPG, or JPEG.")

    try:
        image.file.seek(0, os.SEEK_END)
        file_size = image.file.tell()
        image.file.seek(0)
    except (AttributeError, OSError):
        file_size = None

    if file_size is not None and file_size > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    try:
        image.file.seek(0)
        with Image.open(image.file) as img:
            img.verify()

        image.file.seek(0)
        with Image.open(image.file) as img:
            img.load()
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.")

    with open(destination_path, "wb") as buffer:
        image.file.seek(0)
        shutil.copyfileobj(image.file, buffer)

    return file_ext

@router.post("/encode")
async def encode_image(
    image: UploadFile = File(...),
    secret_text: str = Form(...),
    password: str = Form(...),
    algorithm: str = Form("lsb"),
    encrypt: bool = Form(True),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    unique_id = str(uuid.uuid4())
    file_ext = validate_and_store_upload(image, os.path.join(UPLOAD_DIR, f"{unique_id}_orig.jpg"))
    original_path = os.path.join(UPLOAD_DIR, f"{unique_id}_orig{file_ext}")
    encoded_filename = f"{unique_id}_encoded.png"  # PNG is better for stego to avoid compression loss
    encoded_path = os.path.join(ENCODED_DIR, encoded_filename)

    if os.path.exists(original_path):
        os.remove(original_path)

    validate_and_store_upload(image, original_path)

    # Process secret data
    payload = secret_text
    if encrypt:
        payload = encrypt_data(secret_text.encode(), password)

    try:
        if algorithm == "lsb":
            StegoEngine.encode_lsb(original_path, payload, encoded_path)
        elif algorithm == "random_lsb":
            StegoEngine.encode_random_lsb(original_path, payload, encoded_path, password)
        elif algorithm == "adaptive":
            StegoEngine.encode_adaptive(original_path, payload, encoded_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported algorithm")

        # Calculate metrics
        metrics = StegoEngine.calculate_metrics(original_path, encoded_path)

        # Save to DB
        db_image = models.EncodedImage(
            filename=encoded_filename,
            original_name=image.filename,
            file_path=encoded_path,
            payload_type="text",
            algorithm=algorithm,
            is_encrypted=encrypt,
            psnr=metrics.get("psnr"),
            ssim=metrics.get("ssim"),
            owner_id=current_user.id
        )
        db.add(db_image)
        
        # Log activity
        log = models.ActivityLog(
            action="encode", 
            details=f"Encoded {image.filename} using {algorithm}", 
            user_id=current_user.id
        )
        db.add(log)
        db.commit()
        db.refresh(db_image)

        return {
            "id": db_image.id,
            "filename": encoded_filename,
            "url": f"/encoded_images/{encoded_filename}",
            "metrics": metrics
        }
    except Exception as e:
        if os.path.exists(encoded_path):
            os.remove(encoded_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/decode")
async def decode_image(
    image: UploadFile = File(...),
    password: str = Form(...),
    algorithm: str = Form("lsb"),
    is_encrypted: bool = Form(True),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    temp_path = os.path.join(UPLOAD_DIR, f"temp_decode_{uuid.uuid4()}.png")
    validate_and_store_upload(image, temp_path)

    try:
        if algorithm == "lsb":
            extracted = StegoEngine.decode_lsb(temp_path)
        elif algorithm == "random_lsb":
            extracted = StegoEngine.decode_random_lsb(temp_path, password)
        elif algorithm == "adaptive":
            extracted = StegoEngine.decode_adaptive(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported algorithm")

        if not extracted:
            raise HTTPException(status_code=400, detail="No hidden data found or incorrect algorithm")

        result = extracted
        if is_encrypted:
            try:
                result = decrypt_data(extracted, password).decode()
            except Exception:
                raise HTTPException(status_code=400, detail="Decryption failed. Incorrect password.")

        # Log activity
        log = models.ActivityLog(
            action="decode", 
            details=f"Decoded image {image.filename}", 
            user_id=current_user.id
        )
        db.add(log)
        db.commit()

        return {"secret": result}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    temp_path = os.path.join(UPLOAD_DIR, f"temp_analyze_{uuid.uuid4()}.png")
    validate_and_store_upload(image, temp_path)

    try:
        histogram = StegoEngine.get_histogram(temp_path)
        
        # Simple entropy-based steganalysis placeholder
        # In a real app, this would be a trained model or more complex statistical check
        import numpy as np
        img = cv2.imread(temp_path, cv2.IMREAD_GRAYSCALE)
        marg = np.histogramdd(img.ravel(), bins = 256)[0] / img.size
        marg = marg[marg > 0]
        entropy = -np.sum(marg * np.log2(marg))
        
        # Log activity
        log = models.ActivityLog(
            action="analyze", 
            details=f"Analyzed image {image.filename}", 
            user_id=current_user.id
        )
        db.add(log)
        db.commit()

        return {
            "entropy": round(float(entropy), 4),
            "histogram": histogram,
            "suspicious": entropy > 7.5 # Very simple heuristic
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

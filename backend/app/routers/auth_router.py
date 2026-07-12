# app/routers/auth_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database.database import get_db
from app.models.user_model import User
from app.models.otp_model import OTP
from app.schemas.auth_schema import (
    SignupRequest, SignupResponse,
    VerifyOTPRequest, VerifyOTPResponse,
    ResendOTPRequest,
    LoginRequest, LoginResponse,
)
from app.utils.password_utils import hash_password, verify_password
from app.utils.otp_utils import generate_otp_code, get_otp_expiry
from app.utils.jwt_utils import create_access_token
from app.utils.email_utils import send_otp_email

import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):

    logger.info(f"Signup request received for email: {payload.email}")
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    logger.info(f"Creating new user for email: {payload.email}")
    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_verified=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"New user created: {new_user.email}")

    otp_code = generate_otp_code()
    new_otp = OTP(
        user_id=new_user.id,
        code=otp_code,
        purpose="signup",
        expires_at=get_otp_expiry(),
    )
    db.add(new_otp)
    db.commit()

    send_otp_email(new_user.email, otp_code)

    logger.info(f"OTP sent to email: {new_user.email}")
    return SignupResponse(message="OTP sent to email", email=new_user.email)


@router.post("/verify-otp", response_model=VerifyOTPResponse)
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    logger.info(f"Verifying OTP for email: {payload.email}")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_entry = (
        db.query(OTP)
        .filter(OTP.user_id == user.id, OTP.purpose == "signup", OTP.is_used == False)
        .order_by(OTP.created_at.desc())
        .first()
    )

    if not otp_entry:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request a new one.")

    if otp_entry.code != payload.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_entry.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP has expired")

    otp_entry.is_used = True
    user.is_verified = True
    db.commit()

    logger.info(f"OTP verified for user: {user.email}")
    token = create_access_token(user.id)
    return VerifyOTPResponse(access_token=token)


@router.post("/resend-otp", response_model=SignupResponse)
def resend_otp(payload: ResendOTPRequest, db: Session = Depends(get_db)):
    logger.info(f"Resending OTP for email: {payload.email}")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")

    otp_code = generate_otp_code()
    new_otp = OTP(
        user_id=user.id,
        code=otp_code,
        purpose="signup",
        expires_at=get_otp_expiry(),
    )
    db.add(new_otp)
    db.commit()

    send_otp_email(user.email, otp_code)

    logger.info(f"OTP resent to email: {user.email}")
    return SignupResponse(message="OTP resent to email", email=user.email)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for email: {payload.email}")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    token = create_access_token(user.id)
    logger.info(f"Login successful for email: {payload.email}")
    return LoginResponse(access_token=token)
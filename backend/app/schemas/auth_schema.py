# app/schemas/auth_schema.py

from pydantic import BaseModel, EmailStr, Field

# ---- Signup ----
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class SignupResponse(BaseModel):
    message: str
    email: EmailStr


# ---- Verify OTP (completes signup) ----
class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)


class VerifyOTPResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---- Resend OTP ----
class ResendOTPRequest(BaseModel):
    email: EmailStr


# ---- Login ----
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# app/schemas/auth_schema.py

class VerifyOTPResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
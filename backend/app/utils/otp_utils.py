
# app/utils/otp_utils.py

import random
from datetime import datetime, timedelta, timezone

def generate_otp_code() -> str:
    return str(random.randint(100000, 999999))

def get_otp_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=5)
# app/utils/email_utils.py

import resend
import os
import logging

resend.api_key = os.getenv("RESEND_API_KEY")
logger = logging.getLogger(__name__)

def send_otp_email(email: str, otp_code: str):
    try:
        resend.Emails.send({
            "from": "TransitOps <onboarding@resend.dev>",  # replace with your verified domain
            "to": [email],
            "subject": "Your TransitOps verification code",
            "html": f"<p>Your OTP code is <strong>{otp_code}</strong>. It expires in 5 minutes.</p>",
        })
        logger.info(f"OTP email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {e}")
        raise
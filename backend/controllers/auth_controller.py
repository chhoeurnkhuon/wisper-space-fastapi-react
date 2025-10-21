from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.user import User
from schemas.user import UserCreate
from core.security import get_password_hash, verify_password, create_access_token, create_verify_token
from core.config import settings
import smtplib
from email.mime.text import MIMEText

def send_verification_email(email: str, token: str):
    verify_url = f"{settings.frontend_url}/verify?token={token}"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; padding: 20px 0; }}
            .header h1 {{ color: #1F2937; }}
            .button {{ display: inline-block; padding: 10px 20px; background-color: #1F2937; color: white; text-decoration: none; border-radius: 5px; }}
            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Whisper Space</h1>
            </div>
            <p>Thank you for registering! Please verify your email address to activate your account.</p>
            <p style="text-align: center;">
                <a href="{verify_url}" class="button">Verify Email</a>
            </p>
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p><a href="{verify_url}">{verify_url}</a></p>
            <div class="footer">
                <p>&copy; 2025 Whisper Space. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    msg = MIMEText(html_content, 'html')
    msg['Subject'] = 'Verify Your Whisper Space Account'
    msg['From'] = settings.smtp_user
    msg['To'] = email
    try:
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(status_code=500, detail="Failed to send verification email: Invalid SMTP credentials")
    except smtplib.SMTPException:
        raise HTTPException(status_code=500, detail="Failed to send verification email")
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send verification email")

def register_user(user_data: UserCreate, db: Session):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise ValueError("Email already registered")
    hashed_password = get_password_hash(user_data.password)
    verify_token = create_verify_token({"sub": user_data.email})
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        role=user_data.role,
        password_hash=hashed_password,
        verification_token=verify_token
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    try:
        send_verification_email(user_data.email, verify_token)
    except HTTPException as e:
        db.delete(new_user)
        db.commit()
        raise e
    return {"message": "Verification email sent", "user_id": new_user.id}

def login_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash) or not user.is_verified:
        raise ValueError("Incorrect email/password or email not verified")
    return create_access_token(data={"sub": user.email, "id": user.id, "role": user.role})

def resend_verification_email(email: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ValueError("User not found")
    if user.is_verified:
        raise ValueError("Email already verified", )
    verify_token = create_verify_token({"sub": user.email})
    user.verification_token = verify_token
    db.commit()
    send_verification_email(user.email, verify_token)
    return {"message": "Verification email resent"}
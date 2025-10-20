from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.user import User
from schemas.user import UserCreate
from core.security import get_password_hash, verify_password, create_access_token, create_verify_token
from core.config import settings
import smtplib
from email.mime.text import MIMEText

# def send_verification_email(email: str, token: str):
#     verify_url = f"http://localhost:3000/verify?token={token}"
#     msg = MIMEText(f"Verify your email: {verify_url}")
#     msg['Subject'] = 'Verify Your Whisper Space Account'
#     msg['From'] = settings.smtp_user
#     msg['To'] = email
#     with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
#         server.starttls()
#         server.login(settings.smtp_user, settings.smtp_password)
#         server.send_message(msg)

# def register_user(user_data: UserCreate, db: Session):
#     existing_user = db.query(User).filter(User.email == user_data.email).first()
#     if existing_user:
#         raise ValueError("Email already registered")
#     hashed_password = get_password_hash(user_data.password)
#     verify_token = create_verify_token({"sub": user_data.email})
#     new_user = User(email=user_data.email, username=user_data.username, role=user_data.role, password_hash=hashed_password, verification_token=verify_token)
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     # send_verification_email(user_data.email, verify_token)
#     return {"message": "Verification email sent", "user_id": new_user.id}

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

    return {"message": "User registered successfully", "user_id": new_user.id}


# def login_user(email: str, password: str, db: Session):
#     user = db.query(User).filter(User.email == email).first()
#     if not user or not verify_password(password, user.password_hash) or not user.is_verified:
#         raise ValueError("Incorrect email/password or email not verified")
#     return create_access_token(data={"sub": user.email, "id": user.id, "role": user.role})

def login_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Incorrect email or password")
    return create_access_token(data={"sub": user.email, "id": user.id, "role": user.role})



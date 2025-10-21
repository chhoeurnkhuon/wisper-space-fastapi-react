# main.py (partial)
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, get_db
from api import auth, chats
from models.user import User
from models.chat import Chat, ChatMember
from models.message import Message, ReadReceipt
from models.channel import Channel, ChannelSubscriber
from dependencies import get_current_user, get_current_admin
from api.ws import router as ws_router
from middleware.auth_middleware import verify_token
from sqlalchemy.orm import Session
from schemas.user import VerifyToken
from core.security import verify_email_token

app = FastAPI()
Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(verify_token)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chats.router, prefix="/chats", tags=["chats"])
app.include_router(ws_router, prefix="/ws", tags=["websocket"])

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/admin/users", dependencies=[Depends(get_current_admin)])
async def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.post("/verify")
async def verify_email(verify_data: VerifyToken, db: Session = Depends(get_db)):
    try:
        email = verify_email_token(verify_data.token)
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.is_verified:
            raise HTTPException(status_code=400, detail="Email already verified")
        user.is_verified = True
        user.verification_token = None
        db.commit()
        return {"message": "Email verified successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
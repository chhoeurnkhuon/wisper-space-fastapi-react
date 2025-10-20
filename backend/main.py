from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, get_db
from api import auth, chats, user
from models.user import User
from models.chat import Chat, ChatMember  # Import these
from models.message import Message, ReadReceipt  # Import these
from models.channel import Channel, ChannelSubscriber

from dependencies import get_current_user, get_current_admin
from api.ws import router as ws_router
from middleware.auth_middleware import verify_token
from sqlalchemy.orm import Session
from schemas.user import VerifyToken
from core.security import verify_email_token
from fastapi import HTTPException
from fastapi.openapi.utils import get_openapi
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("*")(verify_token)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/users", tags=["users"])
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
    email = verify_email_token(verify_data.token)
    user = db.query(User).filter(User.email == email).first()
    if user and not user.is_verified:
        user.is_verified = True
        user.verification_token = None
        db.commit()
        return {"message": "Email verified successfully"}
    raise HTTPException(status_code=400, detail="Invalid token or already verified")

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Whisper Space API",
        version="1.0.0",
        description="Backend for Whisper Space",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.chat import ChatCreate, Chat
from schemas.message import Message
from dependencies import get_db, get_current_user
from models.user import User
from controllers.chat_controller import create_chat, get_user_chats, get_chat_messages

router = APIRouter()

@router.post("/", response_model=Chat)
def create_chat_endpoint(chat: ChatCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return create_chat(chat, current_user, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[Chat])
def get_chats_endpoint(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chats = get_user_chats(current_user, db)
    return chats

@router.get("/{chat_id}/messages", response_model=List[Message])
def get_messages_endpoint(chat_id: int, limit: int = 50, offset: int = 0, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        messages = get_chat_messages(chat_id, limit, offset, current_user, db)
        for msg in messages:
            msg.self_destruct_timer = msg.self_destruct_timer
        return messages
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
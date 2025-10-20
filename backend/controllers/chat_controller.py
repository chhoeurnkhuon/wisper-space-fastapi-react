from sqlalchemy.orm import Session
from models.chat import Chat as ChatModel, ChatMember as ChatMemberModel
from models.message import Message
from models.user import User
from schemas.chat import ChatCreate
from datetime import datetime

def create_chat(chat_data: ChatCreate, current_user: User, db: Session):
    if chat_data.type == 'group' and current_user.role != 'admin':
        raise ValueError("Only admins can create group chats")
    if chat_data.type == 'secret':
        chat_data.is_whisper_space = True
    new_chat = ChatModel(name=chat_data.name, type=chat_data.type, is_whisper_space=chat_data.is_whisper_space, created_by=current_user.id)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    new_chat.updated_at = datetime.utcnow()
    member = ChatMemberModel(chat_id=new_chat.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    return new_chat

def get_user_chats(current_user: User, db: Session):
    chats = db.query(ChatModel).join(ChatMemberModel).filter(ChatMemberModel.user_id == current_user.id).order_by(ChatModel.updated_at.desc()).all()
    for chat in chats:
        chat.updated_at = chat.updated_at
    return chats

def get_chat_messages(chat_id: int, limit: int, offset: int, current_user: User, db: Session):
    member = db.query(ChatMemberModel).filter(ChatMemberModel.chat_id == chat_id, ChatMemberModel.user_id == current_user.id).first()
    if not member:
        raise ValueError("Not a member of this chat")
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp.desc()).limit(limit).offset(offset).all()
    from models.message import ReadReceipt
    for msg in messages:
        msg.read = db.query(ReadReceipt).filter_by(message_id=msg.id, user_id=current_user.id).first() is not None
        if msg.self_destruct_timer > 0 and (datetime.utcnow() - msg.timestamp).total_seconds() > msg.self_destruct_timer:
            db.delete(msg)
    db.commit()
    return messages[::-1]
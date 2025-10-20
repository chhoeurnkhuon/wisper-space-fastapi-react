from sqlalchemy.orm import Session
from models.message import Message, ReadReceipt
from models.user import User
from datetime import datetime

def create_message(message_data: dict, chat_id: int, current_user: User, db: Session):
    new_message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=message_data["content"],
        attachments=message_data.get("attachments"),
        is_whisper=message_data.get("is_whisper", False),
        self_destruct_timer=message_data.get("self_destruct_timer", 0),
        reply_to_id=message_data.get("reply_to_id")
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    new_message.updated_at = datetime.utcnow()
    db.commit()
    if new_message.content.startswith('/'):
        bot_msg = Message(chat_id=chat_id, sender_id=current_user.id, content=f"Bot: Echo {new_message.content}")
        db.add(bot_msg)
        db.commit()
    return new_message

def mark_message_read(message_id: int, user_id: int, db: Session):
    receipt = db.query(ReadReceipt).filter_by(message_id=message_id, user_id=user_id).first()
    if not receipt:
        receipt = ReadReceipt(message_id=message_id, user_id=user_id)
        db.add(receipt)
        db.commit()
    return receipt
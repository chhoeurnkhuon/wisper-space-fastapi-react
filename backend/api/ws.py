from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from dependencies import get_db
from models.chat import ChatMember
from models.user import User
from core.security import get_current_user_from_token
from controllers.message_controller import create_message
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, chat_id: int):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: int):
        self.active_connections[chat_id].remove(websocket)

    async def broadcast(self, message: dict, chat_id: int):
        for connection in self.active_connections.get(chat_id, []):
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@router.websocket("/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    current_user_data = get_current_user_from_token(token)
    if not current_user_data:
        await websocket.close(code=1008)
        return
    current_user = db.query(User).filter(User.id == current_user_data["id"]).first()
    if not current_user:
        await websocket.close(code=1008)
        return
    member = db.query(ChatMember).filter(ChatMember.chat_id == chat_id, ChatMember.user_id == current_user.id).first()
    if not member:
        await websocket.close(code=1008)
        return
    await manager.connect(websocket, chat_id)
    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)
            new_msg = create_message(msg_data, chat_id, current_user, db)
            broadcast_msg = {
                "id": new_msg.id,
                "content": new_msg.content,
                "sender": current_user.username or current_user.email,
                "timestamp": new_msg.timestamp.isoformat(),
                "is_whisper": new_msg.is_whisper,
                "self_destruct_timer": new_msg.self_destruct_timer,
                "attachments": new_msg.attachments or []
            }
            await manager.broadcast(broadcast_msg, chat_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, chat_id)
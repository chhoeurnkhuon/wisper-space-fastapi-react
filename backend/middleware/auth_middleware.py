from fastapi import Request, HTTPException
from core.security import get_current_user_from_token 

async def verify_token(request: Request, call_next):
    public_paths = [
        '/auth/',     
        '/verify',   
        '/docs',     
        '/openapi.json'
    ]
    if any(request.url.path.startswith(path) for path in public_paths):
        response = await call_next(request)
        return response

    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    print("joy knea", token)
    current_user = get_current_user_from_token(token.replace("Bearer ", ""))
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid token")
    if request.url.path.startswith('/chats') and not current_user.get('verified', True):
        raise HTTPException(status_code=403, detail="Email not verified")
    if request.url.path.startswith('/admin') and current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin role required")
    request.state.current_user = current_user
    response = await call_next(request)
    return response
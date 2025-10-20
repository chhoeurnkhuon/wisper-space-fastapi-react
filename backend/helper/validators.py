from pydantic import validator
from typing import Any

def validate_username(cls, v: Any) -> str:
    if v and len(v) < 3:
        raise ValueError("Username must be at least 3 characters")
    return v

def validate_role(cls, v: Any) -> str:
    if v not in ['user', 'admin']:
        raise ValueError("Role must be 'user' or 'admin'")
    return v
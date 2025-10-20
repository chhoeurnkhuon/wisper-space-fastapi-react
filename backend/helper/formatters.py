from datetime import datetime

def format_timestamp(ts: datetime) -> str:
    return ts.isoformat()

def format_attachments(attachments: list) -> str:
    if not attachments:
        return ""
    return ", ".join([att.get('type', 'file') for att in attachments])
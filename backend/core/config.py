
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str  # Required now
    secret_key: str = "hJBvYLjPG5UrGi74MVjJ4KmHzZWPShgmJnv6ocwUaBY"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "neangpov66666@gmail.com"
    smtp_password: str = "nvok cgjt jbkp zcyl"
    verify_token_expire_minutes: int = 5

    class Config:
        env_file = ".env"

settings = Settings()


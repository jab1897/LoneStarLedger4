from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    cors_origins: str = Field("*", alias="CORS_ORIGINS")
    data_dir: str = Field("data/raw", alias="DATA_DIR")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
